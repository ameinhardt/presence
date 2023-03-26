import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import RegularLayout from './layouts/Regular.vue';
import type { Composer } from './typings/vue-i18n';
import HomeView from  './views/Home.vue';
import NotFound from './views/NotFound.vue';

const layouts = {
    default: RegularLayout
  },
  routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [{
        path: 'settings',
        component: HomeView
      }]
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: (_, { t }) => t('pages.about.title')
      },
      component: () => import('./views/About.vue')
    },
    ...(import.meta.env.DEV
      ? [{
          path: '/debug',
          name: 'debug',
          meta: {
            title: () => 'Debug'
          },
          component: () => import('./views/Debug.vue')
        }]
      : []),
    {
      path: '/404',
      component: NotFound
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ],
  router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes.map((route) => {
      return {
        path: route.path,
        component: layouts[route.meta?.layout ?? 'default'] ?? layouts.default,
        children: [{ ...route, path: '' }]
      };
    })
  });

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | ((route: RouteLocationNormalizedLoaded, i18n: Composer) => string);
    requiresLogin?: boolean;
    layout?: keyof typeof layouts
  }
}

export default router;
