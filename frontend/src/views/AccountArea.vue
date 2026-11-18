<script setup lang="ts">
import WorkbenchScreen from './WorkbenchScreen.vue';
import AccountSettings from './AccountSettings.vue';
import WorkbenchHomeScreen from './WorkbenchHomeScreen.vue';
import type { WorkbenchHome } from '../types';

defineProps<{ home: WorkbenchHome | null }>();
</script>

<template>
  <section id="account-view" class="account-shell" :class="{ 'workspace-home-account': home }" hidden>
    <WorkbenchHomeScreen v-if="home" :home="home">
      <AccountSettings />
    </WorkbenchHomeScreen>
    <AccountSettings v-else />
    <WorkbenchScreen :home="home" />
  </section>
</template>
