<script setup lang="ts">
import WorkbenchScreen from './WorkbenchScreen.vue';
import AccountSettings from './AccountSettings.vue';
</script>

<template>
<section id="account-view" class="account-shell" hidden>
      <div id="account-notice" class="notice" role="status" hidden></div>
      <WorkbenchScreen />
      <AccountSettings />
    </section>
</template>
