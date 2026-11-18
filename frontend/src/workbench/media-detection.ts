import { shallowReactive } from 'vue';

import type { RequestOptions } from '../api/client';
import type { Capabilities, Media } from '../api/contracts';
import { sizeText } from '../plan-format';
import { errorInfo } from '../runtime/types';

type Limits = Pick<Capabilities, 'mediaTool' | 'maxUploadBytes'>;
type PendingAction = 'upload' | 'retry' | 'refresh';
type Request = <T>(path: string, options?: RequestOptions) => Promise<T>;

export function createMediaDetection(request: Request, services: {
  beforeUpload: () => Promise<boolean>;
  showMedia: (item: Media) => void;
  sessionExpired: () => void;
}) {
  const state = shallowReactive({
    limits: null as Limits | null,
    file: null as File | null,
    item: null as Media | null,
    pending: null as PendingAction | null,
    uploadError: '',
    detectionError: ''
  });
  let revision = 0;

  function setLimits(capabilities: Limits | null) {
    state.limits = capabilities;
  }

  function fileIssue(file: File) {
    if (!file.size) return '请选择非空的视频文件。';
    if (state.limits?.maxUploadBytes && file.size > state.limits.maxUploadBytes) {
      return `单个文件不能超过 ${sizeText(state.limits.maxUploadBytes)}。`;
    }
    return '';
  }

  function stageFile(file: File) {
    if (state.pending === 'upload') return;
    state.uploadError = fileIssue(file);
    state.file = state.uploadError ? null : file;
  }

  function reset() {
    revision++;
    Object.assign(state, { limits: null, item: null, file: null, pending: null, uploadError: '', detectionError: '' });
  }

  function setItem(item: Media | null) {
    state.item = item;
    state.detectionError = '';
  }

  function reportError(message: string) {
    state.detectionError = message;
  }

  async function run(action: PendingAction, load: () => Promise<Media | null>) {
    if (state.pending) return;
    const started = revision;
    state.pending = action;
    if (action === 'upload') state.uploadError = '';
    else state.detectionError = '';
    try {
      const item = await load();
      if (revision !== started || !item) return;
      if (action === 'upload') state.file = null;
      services.showMedia(item);
    } catch (caught) {
      if (revision !== started) return;
      const error = errorInfo(caught);
      if (error.status === 401) {
        services.sessionExpired();
      } else if (action === 'upload') {
        state.uploadError = error.message;
      } else {
        state.detectionError = error.message;
      }
    } finally {
      if (revision === started) state.pending = null;
    }
  }

  function upload() {
    const file = state.file;
    if (!file || !state.limits?.mediaTool) return;
    state.uploadError = fileIssue(file);
    if (state.uploadError) return;
    const body = new FormData();
    body.append('file', file);
    const started = revision;
    return run('upload', async () => {
      if (!await services.beforeUpload() || started !== revision) return null;
      return request('/api/media', { method: 'POST', body });
    });
  }

  function refresh() {
    const item = state.item;
    if (!item || item.status !== 'PROBING') return;
    return run('refresh', () => request(`/api/media/${encodeURIComponent(item.id)}`));
  }

  function retry() {
    const item = state.item;
    if (!item || item.status !== 'FAILED' || !state.limits?.mediaTool) return;
    return run('retry', () => request(`/api/media/${encodeURIComponent(item.id)}/probe`, { method: 'POST' }));
  }

  return { state, setLimits, setItem, reportError, stageFile, upload, refresh, retry, reset };
}

export type MediaDetection = ReturnType<typeof createMediaDetection>;
