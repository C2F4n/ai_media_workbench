import { createApp, h, reactive, shallowReactive } from 'vue';
import JoinRanges from '../components/JoinRanges.vue';
import WorkflowSteps from '../components/WorkflowSteps.vue';
import type { JoinRow } from '../components/JoinRanges.vue';
import type { EditStep } from '../components/WorkflowSteps.vue';

export function mountSequenceEditors(services: { joinChanged(): void; previewJoin(index: number): void; workflowChanged(): void; defaultStep(operation: string): EditStep }) {
  const state = shallowReactive({ rows: [] as JoinRow[], steps: [] as EditStep[], joinDisabled: false, workflowDisabled: false, preview: false, duration: 0, revision: 0 });
  const join = createApp({ render: () => h(JoinRanges, { rows: state.rows, disabled: state.joinDisabled, preview: state.preview, revision: state.revision, onChange: services.joinChanged, onPreview: services.previewJoin }) });
  const workflow = createApp({ render: () => h(WorkflowSteps, { steps: state.steps, disabled: state.workflowDisabled, duration: state.duration, revision: state.revision, defaultStep: services.defaultStep, onChange: services.workflowChanged }) });
  join.mount(document.getElementById('join-clips')!); workflow.mount(document.getElementById('workflow-steps')!);
  return { update(value: Partial<typeof state>) { if (value.rows) value.rows = reactive(value.rows); if (value.steps) value.steps = reactive(value.steps); Object.assign(state, value); state.revision++; }, dispose() { join.unmount(); workflow.unmount(); } };
}
