// plugins/vue-masonry.client.ts
import { VueMasonryPlugin } from 'vue-masonry-css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueMasonryPlugin);
});
