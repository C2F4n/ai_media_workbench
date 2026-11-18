<script setup lang="ts">
import type { WorkbenchHome } from '../types';
import AccountSettings from './AccountSettings.vue';
import WorkbenchContent from './WorkbenchContent.vue';
import WorkbenchHomeScreen from './WorkbenchHomeScreen.vue';

defineProps<{ home: WorkbenchHome }>();
</script>

<template>
  <section id="account-view" class="account-shell workspace-home-account" hidden>
    <WorkbenchHomeScreen :home="home">
      <AccountSettings />
    </WorkbenchHomeScreen>
    <WorkbenchContent :home="home" />
  </section>
</template>
