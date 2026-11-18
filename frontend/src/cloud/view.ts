import { createApp, h, shallowReactive } from 'vue';

import type { CloudCredential } from '../api/contracts';
import CloudProvider from '../components/CloudProvider.vue';
import type { CloudServices } from './catalog';
import { providers } from './catalog';
export function mountCloudSettings(services: CloudServices) {
  const state = shallowReactive({ entries: [] as CloudCredential[], disabled: true, resetKey: 0 });
  const apps = ['text', 'speech'].map(category => {
    const app = createApp({ render: () => state.entries.filter(entry => (entry.provider === 'deepseek') === (category === 'text')).map(saved => h(CloudProvider, { key: `${saved.provider}:${saved.version}`, provider: providers.find(provider => provider.id === saved.provider)!, saved, disabled: state.disabled, resetKey: state.resetKey, services })) });
    app.mount(document.getElementById(`cloud-${category}-providers`)!); return app;
  });
  return { update(value: Partial<typeof state>) { Object.assign(state, value); }, clearSecrets() { state.resetKey++; }, dispose() { apps.forEach(app => app.unmount()); } };
}
