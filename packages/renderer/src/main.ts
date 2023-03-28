import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import '@unocss/reset/tailwind.css';
import './assets/main.scss';
// eslint-disable-next-line import/no-unresolved
import 'uno.css';
import 'virtual:unocss-devtools';
import type { langs, MessageSchema } from './typings/vue-i18n';

registerSW({
  onOfflineReady() {
    console?.info('ready for offline usage');
  }
});

console.info(
  `%c ${import.meta.env.VITE_TITLE} %c v${import.meta.env.VITE_VERSION} %c`,
  'background:#FF6464;padding:1px;border-radius:3px 0 0 3px;color:#fff',
  'background:#2D3746;padding:1px;border-radius: 0 3px 3px 0;color:#fff',
  'background:transparent'
);

// transform hash path to history
router.beforeEach((to, _from, next) =>
  to.hash.startsWith('#/')
    ? next(`${to.hash.slice(2)}${location.search}`)
    : next()
);

const app = createApp(App)
  .use(createI18n<MessageSchema, langs, false>({
    legacy: false,
    locale: 'en', // but no messages loaded, yet. Really to be defined in App.vue
    fallbackLocale: 'en',
    globalInjection: true,
    missing: import.meta.env.PROD
      ? (locale, key, instance, values) =>
          console.warn(`missing '${locale}' translation for '${key}'`, instance, values)
      : undefined
  }))
  .use(createPinia())
  .use(router);

app.config.errorHandler = (error) => {
  console.error(error);
};
app.config.warnHandler = (warn) => {
  console.warn(warn);
};

app.mount('#app');
