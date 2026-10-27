export interface TranscriptEvidence { segmentId: string; startMs: number; endMs: number; text: string }
export interface RetrievalInfo { method: 'BM25' | 'BM25_COVERAGE'; totalSegments: number; indexedChunks: number; retrievedSegments: number; contextBytes: number }
export interface ClipResult { startMs: number; endMs: number; evidence: TranscriptEvidence[]; score?: number; title?: string; reason?: string }
export interface FindResult { mediaId: string; transcriptId: string; transcriptVersion: number; matches?: ClipResult[]; clips?: ClipResult[]; message?: string | null; retrieval?: RetrievalInfo | null }
export interface FindState { result: FindResult | null; recommend: boolean; busy: boolean; previewAvailable: boolean; canTrim: boolean; canJoin: boolean }
export type ClipAction = 'preview' | 'trim' | 'join';
export interface ClipRange { startMs: number; endMs: number }
export type WorkflowStep =
  | { operation: 'trim'; startMs: number; endMs: number }
  | { operation: 'join_clips'; clips: ClipRange[] }
  | { operation: 'resize'; resolutionPreset: string; width?: number | null; height?: number | null }
  | { operation: 'mute' }
  | { operation: 'export'; outputFormat: string; videoCodec?: string | null; targetSizeBytes?: number | null; extractAudio?: boolean };
export interface MediaParameters {
  operation: 'workflow' | 'export' | 'join_clips' | 'transcode' | 'compress' | 'trim' | 'mute' | 'extract_audio' | 'burn_subtitles';
  outputFormat: string;
  steps?: WorkflowStep[];
  clips?: ClipRange[];
  resolutionPreset?: string | null;
  width?: number | null;
  height?: number | null;
  videoCodec?: string | null;
  audioMode?: 'keep' | 'mute';
  targetSizeBytes?: number | null;
  startMs?: number | null;
  endMs?: number | null;
  extractAudio?: boolean;
}
export interface PlanDetails { parameters: MediaParameters | null; questions: { code: string; message: string }[] }
