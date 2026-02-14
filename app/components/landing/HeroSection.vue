<template>
  <section class="hero-section">
    <div class="hero-overlay" />
    <v-container class="hero-content" style="max-width: 1200px">
      <div class="hero-inner">
        <p class="hero-pre-title">☢️</p>
        <h1 class="text-display hero-title">HTTP COBALTO 60</h1>
        <p class="hero-subtitle">
          Los códigos HTTP explicados desde la realidad de México
        </p>
        <p class="hero-description">
          Una guía técnica seria envuelta en lo más oscuro, crudo y real de este país.
          Ejemplos funcionales en 5 lenguajes. Sin filtros. Sin envolturas innecesarias.
        </p>
        <NuxtLink to="/codigos">
          <v-btn
            variant="outlined"
            size="large"
            class="hero-cta mt-6"
            color="primary"
          >
            Explorar códigos
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </NuxtLink>
      </div>
    </v-container>
  </section>
</template>

<style scoped lang="scss">
.hero-section {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  background-color: rgb(var(--v-theme-background));
  background-image:
    radial-gradient(ellipse at 20% 80%, rgba(107, 42, 42, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(92, 99, 120, 0.06) 0%, transparent 60%);
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(var(--v-theme-background), 0.4) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-inner {
  max-width: 700px;
}

.hero-pre-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 6rem);
  color: rgb(var(--v-theme-on-surface));
  line-height: 0.95;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 300;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 0.95rem;
  color: rgb(var(--v-theme-secondary));
  line-height: 1.7;
  max-width: 560px;
}

.hero-cta {
  text-transform: none !important;
  letter-spacing: 0.02em;
  font-size: 0.9rem !important;
}
</style>
