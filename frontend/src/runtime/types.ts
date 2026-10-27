import type { MediaParameters, WorkflowStep } from '../types';
import type * as API from '../api/contracts';

export type Parameters = MediaParameters & { transcriptId?: string; transcriptVersion?: number; useOriginal?: boolean };
export type EditStep = Exclude<WorkflowStep, { operation: 'export' }>;
export type Plan = Omit<API.OperationPlan, 'parameters'> & { parameters: Parameters | null };
export type Task = Omit<API.Task, 'parameters'> & { parameters: Parameters | null };
export type Page<T> = { items: T[]; page: number; pageSize: number; total: number };
export type PlanView = Pick<Plan, 'id' | 'mediaId' | 'version' | 'status' | 'parameters' | 'summary' | 'questions' | 'warnings' | 'taskId'> & Partial<Pick<Plan, 'instruction' | 'createdAt' | 'updatedAt'>>;
export interface TranslationDraft { item: API.Transcript; source: API.TranscriptSegment[]; segments: API.TranscriptSegment[]; language: string; useOriginal: boolean }
export interface TranslationRun { cancelled: boolean; complete?: boolean }
export interface ErrorInfo { message: string; code?: string; status?: number; retryAfter?: number; details?: API.ErrorDetail[] }
export function errorInfo(value: unknown): ErrorInfo {
  if (value instanceof Error) return value;
  return { message: '请求失败，请稍后重试。' };
}
export interface Confirmation { resolve(value: boolean): void; context: string }
export interface CloudConfirmation extends Confirmation { paid: boolean }
export interface DeletingResource { id: string; owner: string; revision?: number }
