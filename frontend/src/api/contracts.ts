// Generated from docs/api/openapi.json; do not edit response DTOs independently.
export type TextAiStatus = {
  "source": "SERVER" | "PERSONAL" | "OFF";
  "provider": "local" | "deepseek" | "openai" | "bailian" | "doubao";
  "model": (string) | null;
  "available": boolean;
  "unavailableReason": (string) | null;
};

export type CloudCredential = {
  "provider": "tencent" | "aliyun" | "deepseek";
  "mode": "SERVER" | "PERSONAL" | "OFF";
  "version": number;
  "configured": boolean;
  "personalStored": boolean;
  "appId"?: (string) | null;
  "workspaceId"?: (string) | null;
  "model"?: (string) | null;
  "textProvider"?: ("deepseek" | "openai" | "bailian" | "doubao") | null;
  "updatedAt"?: (string) | null;
  "available": boolean;
  "unavailableReason": (string) | null;
};

export type SaveCloudCredentialRequest = {
  "expectedVersion": number;
  "mode": "SERVER" | "PERSONAL" | "OFF";
  "appId"?: (string) | null;
  "secretId"?: (string) | null;
  "secretKey"?: (string) | null;
  "apiKey"?: (string) | null;
  "workspaceId"?: (string) | null;
  "model"?: (string) | null;
  "textProvider"?: ("deepseek" | "openai" | "bailian" | "doubao") | null;
};

export type DeleteCloudCredentialRequest = {
  "expectedVersion": number;
};

export type MediaMetadata = {
  "container": string;
  "durationMs": number;
  "width": (number) | null;
  "height": (number) | null;
  "videoCodec": (string) | null;
  "hasAudio": boolean;
  "audioCodec": (string) | null;
};

export type ResourceError = {
  "code": string;
  "message": string;
};

export type Notice = {
  "code": string;
  "message": string;
};

export type ErrorDetail = {
  "field": string;
  "message": string;
};

export type Media = {
  "id": string;
  "originalFilename": string;
  "sizeBytes": number;
  "status": "PROBING" | "READY" | "FAILED";
  "metadata": (MediaMetadata) | ((null) | null);
  "previewUrl": (string) | null;
  "error": (ResourceError) | ((null) | null);
  "createdAt": string;
  "updatedAt": string;
  "kind": ("VIDEO" | "AUDIO" | null) | null;
};

export type ExportParameters = {
  "operation": "export";
  "outputFormat": "mp4" | "mkv" | "mov" | "webm" | "mp3" | "m4a" | "wav" | "flac";
  "videoCodec"?: ("h264" | "hevc" | "vp9" | "av1") | null;
  "resolutionPreset"?: ("source" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p" | "custom") | null;
  "width"?: (number) | null;
  "height"?: (number) | null;
  "audioMode"?: "keep" | "mute";
  "startMs"?: (number) | null;
  "endMs"?: (number) | null;
  "targetSizeBytes"?: (number) | null;
  "extractAudio"?: boolean;
};

export type WorkflowParameters = {
  "operation": "workflow";
  "outputFormat": "mp4" | "mov" | "mkv" | "webm" | "mp3" | "m4a" | "wav" | "flac";
  "steps": (WorkflowStep)[];
};

export type WorkflowStep = (WorkflowTrim) | (WorkflowResize) | (WorkflowJoin) | (WorkflowMute) | (WorkflowExport);

export type WorkflowTrim = {
  "operation": "trim";
  "startMs": number;
  "endMs": number;
};

export type WorkflowResize = {
  "operation": "resize";
  "resolutionPreset": "source" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p" | "custom";
  "width"?: (number) | null;
  "height"?: (number) | null;
};

export type WorkflowJoin = {
  "operation": "join_clips";
  "clips": (JoinClipRange)[];
};

export type WorkflowMute = {
  "operation": "mute";
};

export type WorkflowExport = {
  "operation": "export";
  "outputFormat": "mp4" | "mov" | "mkv" | "webm" | "mp3" | "m4a" | "wav" | "flac";
  "videoCodec"?: ("h264" | "hevc" | "vp9" | "av1") | null;
  "targetSizeBytes"?: (number) | null;
  "extractAudio"?: boolean;
};

export type OperationParameters = (TranscodeParameters) | (CompressionParameters) | (ExtractAudioParameters) | (TrimParameters) | (MuteParameters) | (BurnSubtitleParameters) | (JoinClipsParameters) | (ExportParameters) | (WorkflowParameters);

export type CreatePlanWithParameters = {
  "mediaId": string;
  "parameters": OperationParameters;
};

export type CreatePlanWithInstruction = {
  "mediaId": string;
  "instruction": string;
};

export type CreatePlanRequest = (CreatePlanWithParameters) | (CreatePlanWithInstruction);

export type UpdatePlanWithParameters = {
  "expectedVersion": number;
  "parameters": OperationParameters;
};

export type UpdatePlanWithInstruction = {
  "expectedVersion": number;
  "instruction": string;
};

export type UpdatePlanRequest = (UpdatePlanWithParameters) | (UpdatePlanWithInstruction);

export type ExecutePlanRequest = {
  "expectedVersion": number;
};

export type OperationPlan = {
  "id": string;
  "mediaId": string;
  "version": number;
  "status": "NEEDS_INPUT" | "READY" | "EXECUTED";
  "instruction": (string) | null;
  "parameters": (TranscodeParameters) | (CompressionParameters) | (ExtractAudioParameters) | (TrimParameters) | (MuteParameters) | (BurnSubtitleParameters) | (JoinClipsParameters) | ((null) | null) | (ExportParameters) | (WorkflowParameters);
  "summary": string;
  "questions": (Notice)[];
  "warnings": (Notice)[];
  "taskId": (string) | null;
  "createdAt": string;
  "updatedAt": string;
};

export type Output = {
  "id": string;
  "taskId": string;
  "filename": string;
  "contentType": "video/mp4" | "audio/mpeg" | "application/x-subrip" | "video/quicktime" | "video/webm" | "video/x-matroska" | "audio/mp4" | "audio/wav" | "audio/flac";
  "sizeBytes": number;
  "metadata": (MediaMetadata) | ((null) | null);
  "previewUrl": (string) | null;
  "downloadUrl": string;
  "createdAt": string;
};

export type Task = {
  "id": string;
  "planId": (string) | null;
  "planVersion": (number) | null;
  "mediaId": string;
  "parameters": (TranscodeParameters) | (CompressionParameters) | (ExtractAudioParameters) | (TrimParameters) | (MuteParameters) | (BurnSubtitleParameters) | (JoinClipsParameters) | ((null) | null) | (ExportParameters) | (WorkflowParameters);
  "status": "QUEUED" | "RUNNING" | "CANCELLING" | "CANCELLED" | "SUCCEEDED" | "FAILED";
  "stage": "WAITING" | "TRANSCODING" | "TRANSCRIBING" | "EXPORTING" | "VERIFYING" | "DONE" | "FAILED" | "CANCELLED";
  "progressPercent": (number) | null;
  "outputs": (Output)[];
  "error": (ResourceError) | ((null) | null);
  "createdAt": string;
  "startedAt": (string) | null;
  "finishedAt": (string) | null;
  "kind": "MEDIA_PROCESSING" | "TRANSCRIPTION" | "CLIP_EXPORT";
  "sourceId": string;
  "sourceVersion": (number) | null;
  "transcript": (TranscriptReference) | ((null) | null);
};

export type User = {
  "id": string;
  "username": string;
  "displayName": string;
  "email": string;
  "emailVerified": boolean;
  "createdAt": string;
  "updatedAt": string;
};

export type RegisterRequest = {
  "username": string;
  "email": string;
  "password": string;
  "displayName"?: string;
  "emailChallengeId": string;
  "emailCode": string;
};

export type LoginRequest = {
  "username": string;
  "password": string;
  "rememberMe"?: boolean;
};

export type SessionResponse = {
  "user": User;
  "expiresAt": string;
  "csrfToken": string;
};

export type CsrfResponse = {
  "token": string;
  "headerName": "X-CSRF-Token";
};

export type MessageResponse = {
  "message": string;
};

export type ForgotPasswordRequest = {
  "email": string;
};

export type ResetPasswordRequest = {
  "token": string;
  "newPassword": string;
};

export type VerifyEmailRequest = {
  "token": string;
};

export type ChangePasswordRequest = {
  "currentPassword": string;
  "newPassword": string;
};

export type UpdateUserRequest = {
  "displayName": string;
};

export type DeleteUserRequest = {
  "currentPassword": string;
  "confirmUsername": string;
};

export type Session = {
  "id": string;
  "current": boolean;
  "createdAt": string;
  "lastSeenAt": string;
  "expiresAt": string;
  "deviceLabel": string;
};

export type SessionList = {
  "items": (Session)[];
};

export type AsrModel = {
  "provider": "tencent" | "aliyun";
  "id": string;
  "name": string;
  "recommended": boolean;
};

export type Capabilities = {
  "registration": boolean;
  "emailVerification": boolean;
  "passwordRecovery": boolean;
  "aiPlans": boolean;
  "asr": boolean;
  "semanticSearch": boolean;
  "clipRecommendations": boolean;
  "mediaTool": boolean;
  "maxUploadBytes": number;
  "maxDurationMs": number;
  "supportedOperations": (string)[];
  "asrProviders": ("tencent" | "aliyun")[];
  "asrModels": (AsrModel)[];
  "subtitleCorrection": boolean;
  "subtitleTranslation": boolean;
  "exportFormats": ("mp4" | "mkv" | "mov" | "webm" | "mp3" | "m4a" | "wav" | "flac")[];
  "exportVideoCodecs": ("h264" | "hevc" | "vp9" | "av1")[];
  "textAi": TextAiStatus;
};

export type TranscriptionRequest = {
  "language": "zh-CN";
  "force"?: boolean;
  "provider"?: "tencent" | "aliyun";
  "model"?: "16k_zh" | "qwen-audio-3.1-asr-flash-streaming" | "fun-asr-realtime" | "paraformer-realtime-v2";
};

export type TranscriptSegment = {
  "id": string;
  "startMs": number;
  "endMs": number;
  "text": string;
};

export type Transcript = {
  "id": string;
  "mediaId": string;
  "version": number;
  "language": "zh-CN";
  "segments": (TranscriptSegment)[];
  "originalSegments": (TranscriptSegment)[];
  "createdAt": string;
  "updatedAt": string;
};

export type TranscriptReference = {
  "transcriptId": string;
  "version": number;
};

export type UpdateTranscriptRequest = {
  "expectedVersion": number;
  "segments": (TranscriptSegment)[];
};

export type TranslateTranscriptRequest = {
  "expectedVersion": number;
  "targetLanguage": "zh-CN" | "zh-TW" | "en" | "ja" | "ko" | "fr" | "de" | "es" | "ru" | "pt";
  "segmentIds": (string)[];
  "useOriginal"?: boolean;
};

export type TranscriptTranslation = {
  "transcriptId": string;
  "transcriptVersion": number;
  "targetLanguage": "zh-CN" | "zh-TW" | "en" | "ja" | "ko" | "fr" | "de" | "es" | "ru" | "pt";
  "segments": (TranscriptSegment)[];
};

export type CorrectTranscriptRequest = {
  "expectedVersion": number;
  "segmentId": string;
};

export type TranscriptCorrection = {
  "transcriptId": string;
  "version": number;
  "segmentId": string;
  "originalText": string;
  "correctedText": string;
};

export type CorrectionRequest = {
  "expectedVersion": number;
  "instruction"?: string;
};

export type CorrectionItem = {
  "segmentId": string;
  "originalText": string;
  "suggestedText": string;
  "reason": string;
};

export type Correction = {
  "id": string;
  "transcriptId": string;
  "baseVersion": number;
  "suggestions": (CorrectionItem)[];
  "createdAt": string;
};

export type ApplyCorrectionRequest = {
  "expectedVersion": number;
  "segmentIds": (string)[];
};

export type SearchRequest = {
  "query": string;
  "transcriptVersion": number;
  "limit"?: number;
  "transcriptId": string;
};

export type Evidence = {
  "segmentId": string;
  "startMs": number;
  "endMs": number;
  "text": string;
};

export type SearchMatch = {
  "startMs": number;
  "endMs": number;
  "score": number;
  "evidence": (Evidence)[];
};

export type SearchResponse = {
  "mediaId": string;
  "transcriptId": string;
  "transcriptVersion": number;
  "retrieval"?: Retrieval;
  "matches": (SearchMatch)[];
  "message": (string) | null;
};

export type RecommendationRequest = {
  "query": string;
  "transcriptVersion": number;
  "maxTotalDurationMs": number;
  "limit"?: number;
  "transcriptId": string;
};

export type RecommendedClip = {
  "title": string;
  "reason": string;
  "startMs": number;
  "endMs": number;
  "evidence": (Evidence)[];
};

export type RecommendationResponse = {
  "mediaId": string;
  "transcriptId": string;
  "transcriptVersion": number;
  "retrieval"?: Retrieval;
  "clips": (RecommendedClip)[];
  "message": (string) | null;
};

export type Retrieval = {
  "method": "BM25" | "BM25_COVERAGE";
  "totalSegments": number;
  "indexedChunks": number;
  "retrievedSegments": number;
  "contextBytes": number;
};

export type ClipItem = {
  "id": string;
  "title": string;
  "startMs": number;
  "endMs": number;
};

export type CreateClipDraftRequest = {
  "mediaId": string;
  "name": string;
  "transcriptVersion": (number) | null;
  "clips": (ClipItem)[];
};

export type ClipDraft = {
  "id": string;
  "mediaId": string;
  "name": string;
  "version": number;
  "transcriptVersion": (number) | null;
  "clips": (ClipItem)[];
  "totalDurationMs": number;
  "createdAt": string;
  "updatedAt": string;
};

export type UpdateClipDraftRequest = {
  "expectedVersion": number;
  "name": string;
  "transcriptVersion": (number) | null;
  "clips": (ClipItem)[];
};

export type ExportRequest = {
  "expectedVersion": number;
  "format": "mp4" | "mp3" | "srt";
  "burnSubtitles": boolean;
  "transcriptVersion": (number) | null;
  "idempotencyKey": string;
};

export type CompressionParameters = {
  "operation": "compress";
  "outputFormat": "mp4";
  "targetSizeBytes": number;
  "resolutionPreset": "source" | "720p";
  "audioMode": "keep";
};

export type ExtractAudioParameters = {
  "operation": "extract_audio";
  "outputFormat": "mp3";
};

export type TrimParameters = {
  "operation": "trim";
  "outputFormat": "mp4";
  "startMs": number;
  "endMs": number;
  "audioMode": "keep";
};

export type MuteParameters = {
  "operation": "mute";
  "outputFormat": "mp4";
  "resolutionPreset": "source" | "720p";
};

export type JoinClipRange = {
  "startMs": number;
  "endMs": number;
};

export type JoinClipsParameters = {
  "operation": "join_clips";
  "outputFormat": "mp4";
  "clips": (JoinClipRange)[];
  "audioMode": "keep";
};

export type BurnSubtitleParameters = {
  "operation": "burn_subtitles";
  "outputFormat": "mp4";
  "transcriptId": string;
  "transcriptVersion": number;
  "resolutionPreset": "source" | "720p";
  "audioMode": "keep";
};

export type TranscodeParameters = {
  "operation": "transcode";
  "outputFormat": "mp4";
  "resolutionPreset": "source" | "720p";
  "audioMode": "keep";
};

export type MediaPage = {
  "items": (Media)[];
  "page": number;
  "pageSize": number;
  "total": number;
};

export type PlanPage = {
  "items": (OperationPlan)[];
  "page": number;
  "pageSize": number;
  "total": number;
};

export type TaskPage = {
  "items": (Task)[];
  "page": number;
  "pageSize": number;
  "total": number;
};

export type OutputPage = {
  "items": (Output)[];
  "page": number;
  "pageSize": number;
  "total": number;
};

export type ClipDraftPage = {
  "items": (ClipDraft)[];
  "page": number;
  "pageSize": number;
  "total": number;
};

export type Result = {
  "code": string;
  "message": string;
  "data": unknown;
  "requestId": string;
  "details": (ErrorDetail)[];
};

export type ResultVoid = (Result) & ({
  "code"?: "SUCCESS";
  "data"?: (null) | null;
});

export type ResultError = (Result) & ({
  "code"?: string;
  "data"?: (null) | null;
});

export type RegistrationEmailRequest = {
  "email": string;
};

export type RegistrationEmailChallenge = {
  "challengeId": string;
  "expiresAt": string;
};
