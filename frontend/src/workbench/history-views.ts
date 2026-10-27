import { createApp, h, reactive, shallowReactive } from 'vue';
import MediaLibrary from '../components/MediaLibrary.vue';
import PlanHistory from '../components/PlanHistory.vue';
import TaskHistory from '../components/TaskHistory.vue';
import type { Media } from '../api/contracts';
import type { Plan as OperationPlan, Task } from '../runtime/types';

export interface HistoryServices {
  openMedia(item: Media): void; removeMedia(item: Media): void;
  openTask(item: Task): void; removeTask(item: Task): void; inspectTask(item: Task): void;
  restorePlan(item: OperationPlan): void; removePlan(item: OperationPlan): void;
  size(bytes: number): string; mediaStatus(status: string): string; operation(operation: string): string;
  taskStatus(status: string, operation?: string): string; format(parameters: Task['parameters']): string;
}
export function createRecordState() { return { expanded: reactive(new Set<string>()), instructions: reactive(new Map<string, string>()) }; }
export function mountHistory(services: HistoryServices, expanded: Set<string>, instructions: Map<string, string>) {
  const state = shallowReactive({ busy: false, media: [] as Media[], plans: [] as OperationPlan[], tasks: [] as Task[] });
  const mounts = [
    ['media-list', () => h(MediaLibrary, { items: state.media, busy: state.busy, size: services.size, status: services.mediaStatus, onOpen: services.openMedia, onRemove: services.removeMedia })],
    ['plan-list', () => h(PlanHistory, { items: state.plans, busy: state.busy, expanded, operation: services.operation, onRestore: services.restorePlan, onRemove: services.removePlan })],
    ['task-list', () => h(TaskHistory, { items: state.tasks, busy: state.busy, expanded, instructions, size: services.size, operation: services.operation, status: services.taskStatus, format: services.format, onOpen: services.openTask, onRemove: services.removeTask, onInspect: services.inspectTask })]
  ] as const;
  const apps = mounts.map(([id, render]) => { const app = createApp({ render }); app.mount(document.getElementById(id)!); return app; });
  return { update(value: Partial<typeof state>) { Object.assign(state, value); }, clear() { state.media = []; state.tasks = []; state.plans = []; }, dispose() { apps.forEach(app => app.unmount()); } };
}
