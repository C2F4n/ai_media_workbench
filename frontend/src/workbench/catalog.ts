export const tools = [
  { id: 'detect', label: '视频检测', group: 'regular', icon: 'ScanLine', kind: 'local' },
  { id: 'convert', label: '视频转换', group: 'regular', icon: 'FileVideo', kind: 'local' },
  { id: 'compress', label: '视频压缩', group: 'regular', icon: 'Minimize2', kind: 'local' },
  { id: 'audio', label: '提取音频', group: 'regular', icon: 'AudioLines', kind: 'local' },
  { id: 'trim', label: '视频裁切', group: 'regular', icon: 'Scissors', kind: 'local' },
  { id: 'join', label: '片段拼接', group: 'regular', icon: 'ListVideo', kind: 'local' },
  { id: 'mute', label: '视频静音', group: 'regular', icon: 'VolumeX', kind: 'local' },
  { id: 'subtitle', label: '字幕处理', group: 'ai', icon: 'Captions', kind: 'mixed' },
  { id: 'ai', label: 'AI 处理', group: 'ai', icon: 'Sparkles', kind: 'mixed' },
  { id: 'find', label: '找片段', group: 'ai', icon: 'Search', kind: 'cloud' },
  { id: 'history', label: '处理记录', group: 'history', icon: 'History', kind: 'local' }
] as const;
export type ToolId = typeof tools[number]['id'];
export type ToolGroup = typeof tools[number]['group'];
export const groups: readonly { id: ToolGroup; label: string }[] = [
  { id: 'regular', label: '常规处理' }, { id: 'ai', label: 'AI协作处理' }, { id: 'history', label: '历史记录' }
];
export const phases = ['import', 'edit', 'export'] as const;
export type PhaseId = typeof phases[number];
export const toolNames = Object.fromEntries(tools.map(tool => [tool.id, tool.label])) as Record<ToolId, string>;
export function isTool(value: string): value is ToolId { return tools.some(tool => tool.id === value); }
export function isPhase(value: string): value is PhaseId { return phases.some(phase => phase === value); }

export interface NavigationState {
  tool: ToolId; phase: PhaseId; open: boolean; pinned: boolean; narrow: boolean; visible: boolean; busy: boolean;
  groups: Record<ToolGroup, boolean>;
  localTextAI: boolean; textService: string | null;
  indicator: { visible: boolean; top: number; height: number };
}
export interface NavigationServices { selectTool(tool: ToolId): void; selectPhase(phase: PhaseId): void }
