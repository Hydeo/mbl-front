// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  // You can add global CSS here if needed
  css: ['~/assets/main.css'], // Example for global styles
  // For future proxy:
  // If you were to use a server/api route as a proxy,
  // you might configure runtimeConfig here for API keys or base URLs.
  // runtimeConfig: {
  //   public: {
  //     bggApiBaseUrl: process.env.BGG_API_BASE_URL || 'https://boardgamegeek.com/xmlapi2/',
  //   }
  // }
});
