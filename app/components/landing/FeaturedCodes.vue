<template>
  <section class="py-16">
    <v-container style="max-width: 1200px">
      <h2 class="text-display section-heading mb-2">CÓDIGOS DESTACADOS</h2>
      <p class="section-sub mb-10">Los que todo desarrollador debe conocer a fondo.</p>

      <v-row>
        <v-col
          v-for="code in featured"
          :key="code.code"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <CodeCard :code="code" />
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const { getFeaturedCodes } = useCodes()
const featured = getFeaturedCodes()
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
</style>
