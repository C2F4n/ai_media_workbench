<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { Save, Trash2 } from '@lucide/vue';
import { credentialRules, customModelPattern, textVendors } from '../cloud/catalog';
import type { CloudServices, Provider, TextVendor } from '../cloud/catalog';
import type { CloudCredential } from '../api/contracts';
const props = defineProps<{ provider: Provider; saved: CloudCredential; disabled: boolean; resetKey: number; services: CloudServices }>();
const article = ref<HTMLElement>(), form = ref<HTMLFormElement>();
const mode = ref(props.saved.mode), vendor = ref<TextVendor>(props.saved.textProvider || 'deepseek'), dirty = ref(false);
const draft = reactive<Record<string, string>>({ appId: props.saved.appId || '', workspaceId: props.saved.workspaceId || '', apiKey: '', secretId: '', secretKey: '', model: props.saved.mode === 'PERSONAL' ? props.saved.model || '' : textVendors[vendor.value].model, customModel: '' });
const text = props.provider.id === 'deepseek';
const selection = computed(() => textVendors[vendor.value]);
const keepKey = computed(() => props.saved.personalStored && props.saved.mode === 'PERSONAL' && (!text || vendor.value === (props.saved.textProvider || 'deepseek')));
const models = computed(() => {
  const result = [...selection.value.models];
  if (props.saved.mode === 'PERSONAL' && vendor.value === (props.saved.textProvider || 'deepseek') && props.saved.model && !result.some(([id]) => id === props.saved.model)) result.push([props.saved.model, '已保存：' + props.saved.model]);
  return result;
});
if (props.saved.mode === 'PERSONAL' && !selection.value.models.some(([id]) => id === props.saved.model)) draft.customModel = props.saved.model || '';
const custom = computed(() => text && draft.model === '__custom__');
const available = computed(() => props.saved.available ?? props.saved.configured);
const status = computed(() => dirty.value ? '未保存' : props.saved.mode === 'OFF' ? '已停用' : props.saved.mode === 'SERVER'
  ? available.value ? '服务端模型已就绪' : text ? '服务端模型暂不可用，请检查模型服务是否已启动。' : '服务端模型不支持语音识别，请配置我的凭据'
  : available.value ? '个人凭据已配置' : props.saved.unavailableReason || (props.saved.personalStored ? '个人凭据不可读取' : '个人凭据尚未配置'));
const endpoint = computed(() => vendor.value === 'bailian' && /^[A-Za-z0-9][A-Za-z0-9-]{0,79}$/.test(draft.workspaceId)
  ? `https://${draft.workspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions` : selection.value.endpoint);
function changed() { dirty.value = true; }
function clearSecrets() { draft.apiKey = ''; draft.secretId = ''; draft.secretKey = ''; }
watch(() => props.resetKey, clearSecrets);
function switchVendor() { clearSecrets(); draft.customModel = ''; draft.workspaceId = ''; draft.model = selection.value.model; changed(); }
function label(name: string, fallback: string) { return text && name === 'apiKey' ? selection.value.name + ' API Key' : text && name === 'model' ? selection.value.name + ' 模型' : fallback; }
function current(context: string) { return !props.disabled && article.value?.isConnected && props.services.context() === context; }
async function save() {
  if (props.disabled) return;
  draft.customModel = draft.customModel.trim();
  if (mode.value === 'PERSONAL') for (const [name, fallback] of props.provider.fields) {
    const rule = credentialRules[name]; if (!rule) continue;
    draft[name] = draft[name].trim();
    if (draft[name] ? !rule[0].test(draft[name]) : !keepKey.value) {
      props.services.error(draft[name] ? rule[1] : '请填写' + props.provider.name + ' ' + label(name, fallback) + '。');
      form.value?.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.focus(); return;
    }
  }
  await nextTick();
  if (!form.value?.reportValidity()) return;
  const context = props.services.context(), body: Record<string, unknown> = { expectedVersion: props.saved.version, mode: mode.value };
  if (mode.value === 'PERSONAL') {
    if (text) body.textProvider = vendor.value;
    for (const [name, , secret] of props.provider.fields) if (!(text && name === 'workspaceId' && vendor.value !== 'bailian') && (!secret || draft[name])) body[name] = draft[name];
    if (custom.value) body.model = draft.customModel;
    if (!await props.services.confirm({ title: '保存个人凭据', message: `将${props.provider.name}的个人凭据加密保存在此服务器。后续调用使用你在对应服务商的额度，保存本身不会发起付费调用。`, confirmLabel: '保存凭据', kind: 'info', icon: 'key-round' })) return;
  } else if (props.saved.personalStored && !await props.services.confirm({ title: '切换服务来源', message: '这会删除此供应商已保存的个人凭据，并切换到所选服务来源。恢复个人服务时需要重新填写凭据。', confirmLabel: '删除并切换', kind: 'danger', icon: 'key-round' })) return;
  if (current(context)) await props.services.write(props.provider.id, 'PUT', body);
}
async function remove() {
  if (props.disabled) return;
  const context = props.services.context();
  if (!await props.services.confirm({ title: '删除个人凭据', message: `删除${props.provider.name}的个人凭据并停用此服务。不会自动切换到服务端模型或其他供应商；重新启用时需再次配置。`, confirmLabel: '删除并停用', kind: 'danger', icon: 'trash-2' })) return;
  if (current(context)) await props.services.write(props.provider.id, 'DELETE', { expectedVersion: props.saved.version });
}
</script>
<template>
  <article :id="`cloud-${provider.id}`" ref="article" class="cloud-provider" :data-dirty="dirty ? 'true' : undefined">
    <div class="section-heading"><h3>{{ provider.name }}</h3><span class="cloud-provider-status muted" :class="{ error: !dirty && saved.mode !== 'OFF' && !available }" role="status">{{ status }}</span></div>
    <form ref="form" autocomplete="off" @submit.prevent>
      <label class="field">服务来源<select v-model="mode" name="mode" :aria-label="`${provider.name}凭据来源`" :disabled="disabled" @change="clearSecrets(); changed()"><option value="PERSONAL">我的凭据</option><option value="SERVER">{{ text ? '服务端部署 · 千问' : '服务端模型（不支持语音识别）' }}</option><option value="OFF">停用</option></select></label>
      <p class="model-warning" :hidden="!text || mode !== 'SERVER'">服务端使用轻量模型，理解能力有限，复杂要求可能解析不准确。</p>
      <div class="cloud-fields" :hidden="mode !== 'PERSONAL'">
        <label v-if="text" class="field">模型供应商<select v-model="vendor" name="textProvider" aria-label="文字 AI模型供应商" :disabled="disabled || mode !== 'PERSONAL'" @change="switchVendor"><option v-for="(setting, id) in textVendors" :key="id" :value="id">{{ setting.name }}</option></select></label>
        <label v-for="[name, fallback, secret, max] in provider.fields" :key="name" class="field" :hidden="text && name === 'workspaceId' && vendor !== 'bailian'">{{ label(name, fallback) }}
          <select v-if="text && name === 'model'" v-model="draft.model" name="model" :aria-label="`${provider.name} ${label(name, fallback)}`" :required="mode === 'PERSONAL'" :disabled="disabled || mode !== 'PERSONAL'" @change="changed"><option value="" disabled>请选择模型</option><option v-for="[id, title] in models" :key="id" :value="id" :title="id">{{ title }}</option><option value="__custom__">自定义模型</option></select>
          <input v-else v-model="draft[name]" :name="name" :type="secret ? 'password' : 'text'" :maxlength="max" :autocomplete="secret ? 'new-password' : 'off'" :spellcheck="false" :aria-label="`${provider.name} ${label(name, fallback)}`" :data-secret="secret ? 'true' : undefined" :placeholder="secret ? keepKey ? '已保存，留空保留' : text ? '填写此供应商的 API Key' : fallback : undefined" :required="text && name === 'apiKey' && mode === 'PERSONAL' && !keepKey" :pattern="text && name === 'workspaceId' ? '[A-Za-z0-9][A-Za-z0-9-]{0,79}' : undefined" :disabled="disabled || mode !== 'PERSONAL' || text && name === 'workspaceId' && vendor !== 'bailian'" @input="changed">
        </label>
        <label v-if="text" class="field" :hidden="!custom">自定义模型 ID<input v-model="draft.customModel" name="customModel" type="text" maxlength="80" autocomplete="off" :spellcheck="false" aria-label="自定义模型 ID" :required="custom && mode === 'PERSONAL'" :pattern="custom && mode === 'PERSONAL' ? customModelPattern : undefined" :placeholder="vendor === 'doubao' ? 'Model ID 或 Endpoint ID（ep-...）' : '填写供应商提供的模型 ID'" :disabled="disabled || mode !== 'PERSONAL'" @input="changed"></label>
        <div v-if="text" class="cloud-endpoint"><output aria-label="官方接口地址">{{ endpoint }}</output></div>
        <p class="cloud-endpoint muted">保存仅检查格式，不验证密钥、权限或余额；请使用所选供应商的密钥。真实调用失败时会显示具体原因。</p>
      </div>
      <div class="cloud-provider-actions"><button class="button primary" type="button" title="保存配置" :aria-label="`保存${provider.name}配置`" :disabled="disabled" @click="save"><Save aria-hidden="true" /><span>保存</span></button><button class="icon-button danger-outline" type="button" title="删除个人凭据并停用" :aria-label="`删除${provider.name}个人凭据`" :hidden="!saved.personalStored" :disabled="disabled" @click="remove"><Trash2 aria-hidden="true" /></button></div>
    </form>
  </article>
</template>
