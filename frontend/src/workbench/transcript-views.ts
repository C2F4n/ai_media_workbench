import { createApp, h, reactive, shallowReactive } from 'vue';
import SubtitleSegments from '../components/SubtitleSegments.vue';
import TranslationSegments from '../components/TranslationSegments.vue';
import type { TranscriptSegment } from '../api/contracts';

export function mountTranscriptEditors(services: { changed(): void; correct(segmentId: string): Promise<string | null> }) {
  const state = shallowReactive({ segments: [] as TranscriptSegment[], source: [] as TranscriptSegment[], translated: [] as TranscriptSegment[], revision: 0, disabled: true, canCorrect: false, correctionTitle: '', duration: 0, translationDisabled: false, bilingual: false });
  const subtitle = createApp({ render: () => h(SubtitleSegments, { segments: state.segments, revision: state.revision, disabled: state.disabled, canCorrect: state.canCorrect, correctionTitle: state.correctionTitle, duration: state.duration, correct: services.correct, onChange: services.changed }) });
  const translation = createApp({ render: () => h(TranslationSegments, { source: state.source, segments: state.translated, disabled: state.translationDisabled, bilingual: state.bilingual }) });
  subtitle.mount(document.getElementById('subtitle-segments')!); translation.mount(document.getElementById('translation-segments')!);
  return {
    update(value: Partial<typeof state>) { Object.assign(state, value); },
    setSegments(segments: TranscriptSegment[]) { state.segments = reactive(structuredClone(segments)); state.revision++; },
    setTranslation(source: TranscriptSegment[], translated: TranscriptSegment[]) { state.source = source; state.translated = reactive(translated); },
    clearTranslation() { state.source = []; state.translated = []; },
    dispose() { subtitle.unmount(); translation.unmount(); }
  };
}
