<template>
  <section class="py-16">
    <v-container style="max-width: 1200px">
      <h2 class="text-display section-heading mb-2">CATEGORÍAS HTTP</h2>
      <p class="section-sub mb-10">Cinco grupos. Cinco niveles de la realidad.</p>

      <v-row>
        <v-col
          v-for="cat in categoriesWithCount"
          :key="cat.id"
          cols="12"
          sm="6"
          md="4"
          lg
        >
          <NuxtLink :to="`/codigos?categoria=${cat.id}`" class="text-decoration-none">
            <v-card color="surface-container" flat class="category-card pa-5">
              <div
                class="category-indicator"
                :style="{ backgroundColor: cat.color }"
              />
              <span
                class="text-display category-range"
                :style="{ color: cat.color }"
              >
                {{ cat.range }}
              </span>
              <h3 class="category-label mt-2">{{ cat.label }}</h3>
              <p class="category-desc mt-2">{{ cat.description }}</p>
              <span class="category-count mt-3">
                {{ cat.count }} código{{ cat.count !== 1 ? 's' : '' }}
              </span>
            </v-card>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const { categories } = useCategories()
const { getCodesByCategory } = useCodes()

const categoriesWithCount = computed(() => {
  return categories.map(cat => ({
    ...cat,
    count: getCodesByCategory(cat.id).length,
  }))
})
</script>

<style scoped lang="scss">
.section-heading {
  font-size: 1.5rem;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: 0.1em;
}

.section-sub {
  color: var(--co60-text-muted);
  font-size: 0.9rem;
}

.category-card {
  border: 1px solid var(--co60-border) !important;
  transition: border-color 0.3s ease, transform 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;

  &:hover {
    border-color: var(--co60-card-hover-border) !important;
    transform: translateY(-2px);
  }
}

.category-indicator {
  height: 3px;
  width: 40px;
  border-radius: 2px;
  margin-bottom: 0.75rem;
}

.category-range {
  font-size: 1.8rem;
  line-height: 1;
}

.category-label {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9rem;
  font-weight: 500;
}

.category-desc {
  color: rgb(var(--v-theme-secondary));
  font-size: 0.8rem;
  line-height: 1.5;
}

.category-count {
  display: block;
  color: var(--co60-text-muted);
  font-size: 0.75rem;
}
</style>
