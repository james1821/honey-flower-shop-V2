<template>
  <div class="toast-wrap">
    <div
      v-for="t in toasts" :key="t.id"
      class="toast" :class="`toast-${t.type}`"
      @click="remove(t.id)"
    >
      <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ' }}</span>
      {{ t.message }}
    </div>
  </div>
</template>
<script setup lang="ts">
const { toasts, remove } = useToast()
</script>
