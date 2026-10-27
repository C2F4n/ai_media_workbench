import type { MediaParameters, WorkflowStep } from './types';

export function sizeText(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
const rangeText = (start: number, end: number) => `${(start / 1000).toFixed(3)} 至 ${(end / 1000).toFixed(3)} 秒`;

function stepText(step: WorkflowStep): string {
  switch (step.operation) {
    case 'trim': return '保留 ' + rangeText(step.startMs, step.endMs);
    case 'join_clips': return '选段拼接：' + step.clips.map(clip => rangeText(clip.startMs, clip.endMs)).join(' → ');
    case 'resize': return '缩放 ' + (step.resolutionPreset === 'custom' ? `${step.width} x ${step.height} 最大边界` : step.resolutionPreset);
    case 'mute': return '静音';
    case 'export': return `导出 ${step.outputFormat.toUpperCase()}${step.videoCodec ? ' / ' + step.videoCodec : ''}${step.targetSizeBytes ? ' / 最多 ' + sizeText(step.targetSizeBytes) : ''}${step.extractAudio ? ' / 另存完整原始音轨 MP3' : ''}`;
  }
}

export function planRows(p: MediaParameters | null): [string, string][] {
  if (!p) return [];
  const names = { workflow: '顺序处理', export: '组合导出', join_clips: '拼接', transcode: '转换', compress: '压缩', trim: '裁切', mute: '静音', extract_audio: '提取', burn_subtitles: '字幕烧录' };
  const rows: [string, string][] = [['操作', names[p.operation]], ['格式', p.outputFormat.toUpperCase()]];
  if (p.operation === 'join_clips' && p.clips) {
    p.clips.forEach((clip, index) => rows.push([`第 ${index + 1} 段`, rangeText(clip.startMs, clip.endMs)]));
    rows.push(['拼接总时长', (p.clips.reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0) / 1000).toFixed(3) + ' 秒'], ['分辨率', '原分辨率']);
  }
  if (p.operation === 'workflow') p.steps?.forEach((step, index) => rows.push([`步骤 ${index + 1}`, stepText(step)]));
  if (p.resolutionPreset) rows.push(['分辨率', p.resolutionPreset === 'source' ? '原分辨率' : p.resolutionPreset === 'custom' ? `${p.width} x ${p.height} 最大边界` : p.resolutionPreset]);
  if (p.videoCodec) rows.push(['视频编码', ({ h264: 'H.264', hevc: 'H.265 / HEVC', vp9: 'VP9', av1: 'AV1' } as Record<string, string>)[p.videoCodec] || p.videoCodec]);
  if (p.targetSizeBytes != null) rows.push(['目标体积', sizeText(p.targetSizeBytes)]);
  if (p.startMs != null && p.endMs != null) rows.push(['保留区间', rangeText(p.startMs, p.endMs)]);
  rows.push(['音轨', p.operation === 'mute' || p.audioMode === 'mute' || p.steps?.some(step => step.operation === 'mute') ? '全部移除' : p.operation === 'extract_audio' || ['mp3', 'm4a', 'wav', 'flac'].includes(p.outputFormat) ? '提取第一条音轨' : '保留']);
  if (p.extractAudio) rows.push(['附加文件', '完整原始音轨 MP3（不受裁切影响）']);
  return rows;
}
