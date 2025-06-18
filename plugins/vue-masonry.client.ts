// plugins/vue-masonry.client.ts
import MasonryWall from '@yeger/vue-masonry-wall'; // Corrected import path

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('MasonryWall', MasonryWall); // Register with its new name
});
