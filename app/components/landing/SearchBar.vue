<template>
  <section class="py-8">
    <v-container style="max-width: 600px">
      <v-text-field
        readonly
        placeholder="Buscar código HTTP... (Ctrl+K)"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        bg-color="surface-container"
        hide-details
        class="search-trigger"
        @click="$emit('openSearch')"
      >
        <template #append-inner>
          <kbd class="shortcut-key">⌘K</kbd>
        </template>
      </v-text-field>
    </v-container>
  </section>
</template>

<script setup lang="ts">
defineEmits(['openSearch'])
</script>

<style scoped lang="scss">
.search-trigger {
  cursor: pointer;

  :deep(.v-field) {
    border-color: var(--co60-border) !important;

    &:hover {
      border-color: var(--co60-card-hover-border) !important;
    }
  }

  :deep(input) {
    cursor: pointer;
  }
}

.shortcut-key {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid var(--co60-border);
  border-radius: 4px;
  color: var(--co60-text-muted);
}
</style>
