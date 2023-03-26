import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import Virtual from '@rollup/plugin-virtual';
import Vue from '@vitejs/plugin-vue';
import LicensePlugin from 'rollup-plugin-oss';
import Unocss from 'unocss/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { VueUseComponentsResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv, type ConfigEnv, type IndexHtmlTransformResult, type Plugin, type PluginOption, type UserConfig } from 'vite';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';
import packageJson from './package.json' assert { type: 'json '};

const cwd = path.dirname(fileURLToPath(import.meta.url)),
  langs = fs
    .readdirSync(path.resolve(cwd, './src/locales'))
    .filter((f) => f.endsWith('.json'))
    .map((file) => file.replace(/.json$/, '')),

  TransformHtmlPlugin = (isProduction: boolean): Plugin => {
    // const localesPath = normalizePath(path.resolve('src/locales/'));
    return {
      name: 'html-plugin',
      transformIndexHtml(/* html, _ctx */) {
        const tags: IndexHtmlTransformResult = [
          // add package.json title
          {
            tag: 'title',
            injectTo: 'head',
            children: packageJson.title
          },
          {
            tag: 'meta',
            injectTo: 'head',
            attrs: {
              name: 'application-name',
              content: packageJson.title
            }
          },
          {
            tag: 'meta',
            injectTo: 'head',
            attrs: {
              name: 'theme-color',
              content: 'white' // #111827
            }
          }
        ];
        if (isProduction) {
          tags.push({ // add CSP header
            tag: 'meta',
            injectTo: 'head-prepend',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: [
                "default-src 'self'",
                "base-uri 'self'",
                "connect-src 'self'",
                "form-action 'self'",
                "font-src 'self' data:",
                "frame-src 'none'",
                "img-src 'self' data:",
                'script-src \'self\' \'sha256-WqjfwHIDnCtY5qx/f9cy6zvBzTdnSFjUGksN7W1OYhE=\'',
                "script-src-attr 'none'",
                'style-src \'self\' \'sha256-QdW0Dgs8JJzzLde7S+TTJz94ftFWNWFdmVlNUU4qZYY=\'',
                "object-src 'none';upgrade-insecure-requests"
              ].join(';')
            }
          });
        }
        return tags;
      }
    };
  };

for (const key of ['title', 'name', 'author', 'description', 'version'] as Array<keyof typeof packageJson>) {
  process.env[`VITE_${key.toUpperCase()}`] = packageJson[key]?.toString();
}

// https://vitejs.dev/config/
export default defineConfig((config: ConfigEnv): UserConfig => {
  const environment = loadEnv(config.mode, cwd, ''),
    BASE_URL = environment.BASE_URL ?? '/',
    pwaOptions: Partial<VitePWAOptions> = {
      base: BASE_URL,
      includeAssets: ['icons/logo.svg', 'icons/favicons/favicon.ico'], /* fonts */
      srcDir: 'sw',
      filename: 'sw.ts',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      /* registerType: 'autoUpdate', // to not use prompt
      // then use in sw.js instead:
      self.skipWaiting()
      clientsClaim()
      */
      strategies: 'injectManifest',
      injectManifest: {
        globPatterns: ['**/*.{png,js,css,html,svg}']
      },
      manifest: {
        /* eslint-disable camelcase */
        name: packageJson.title,
        short_name: packageJson.name,
        description: packageJson.description,
        dir: 'ltr',
        orientation: 'any',
        display: 'fullscreen',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [36, 48, 72, 96, 144, 192, 256, 384, 512]
          .map((size) => ({
            src: `/icons/favicons/android-chrome-${size}x${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: 'any maskable'
          }))
        /* eslint-enable camelcase */
      }
    };
  return {
    base: BASE_URL,
    plugins: [
      TransformHtmlPlugin(environment.NODE_ENV !== 'development'),
      Virtual({
        'virtual:locales': `export default {${langs
          .map(
            (lang) => `async ${lang}() {
        const { default: messages } = await import('./src/locales/${lang}.json');
        return messages;
      }`
          )
          .join(',')}};`
      }) as unknown as PluginOption,
      Components({
        resolvers: [VueUseComponentsResolver(), IconsResolver({
          prefix: 'icon'
        })]
      }),
      Icons(),
      Unocss(),
      LicensePlugin({ // inspiration for the light/dark toggle effect
        extra: [{
          name: 'vuetify',
          version: '3.1.7',
          author: 'John Jeremy Leider',
          license: 'MIT',
          repository: 'https://github.com/vuetifyjs',
          description: 'Vue Material Component Framework'
        }]
      }) as unknown as PluginOption,
      Vue(),
      VitePWA(pwaOptions),
      VueI18n({
        include: path.resolve(cwd, './src/locales/*.json')
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          secure: false,
          ws: true
        }
      }
    }
  };
});
