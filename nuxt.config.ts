// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
    head: {
      title: "HTTP Cobalto 60 — Códigos HTTP desde la realidad de México",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Guía técnica de códigos HTTP con contexto real mexicano. Ejemplos en JavaScript, Python, Laravel, Rust y C++. Buenas prácticas y filosofía de respuestas HTTP.",
        },
        { name: "theme-color", content: "#0C0C0C" },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },

  css: ["~/assets/css/main.scss"],

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins!.push(vuetify({ autoImport: true }));
      });
    },
    "@vite-pwa/nuxt",
    "@nuxtjs/seo",
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  site: {
    url: "https://httpcobalto60.dev",
    name: "HTTP Cobalto 60",
    description:
      "Guía técnica de códigos HTTP con contexto real mexicano. Ejemplos en JavaScript, Python, Laravel, Rust y C++.",
    defaultLocale: "es-MX",
  },

  ogImage: { enabled: false },
  schemaOrg: { enabled: false },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "HTTP Cobalto 60",
      short_name: "Cobalto60",
      description: "Códigos HTTP desde la realidad de México",
      theme_color: "#0C0C0C",
      background_color: "#0C0C0C",
      display: "standalone",
      lang: "es-MX",
      icons: [
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,webp}"],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
  },
});
