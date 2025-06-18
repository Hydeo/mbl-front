// plugins/vue-masonry.client.ts
import Masonry from 'vue-masonry-css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('masonry', Masonry);
});
