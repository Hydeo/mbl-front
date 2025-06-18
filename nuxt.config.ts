// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  // Set srcDir to 'src' to consolidate all application code under this directory
  srcDir: 'src/',
  // Update global CSS path to reflect the new src/assets location
  css: ['~/assets/main.css'],
  // For future proxy:
  // If you were to use a server/api route as a proxy,
  // you might configure runtimeConfig here for API keys or base URLs.
  // runtimeConfig: {
  //   public: {
  //     bggApiBaseUrl: process.env.BGG_API_BASE_URL || 'https://boardgamegeek.com/xmlapi2/',
  //   }
  // }
});
