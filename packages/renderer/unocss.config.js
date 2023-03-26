import { presetAttributify, presetTypography, presetWind, transformerDirectives, transformerVariantGroup } from 'unocss';
import { defineConfig } from 'unocss/vite';

export default defineConfig({
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [presetAttributify(), presetTypography(), presetWind()],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: 'hsl(var(--p))',
      primaryFocus: 'hsl(var(--pf, var(--p)))',
      primaryContent: 'hsl(var(--pc))',
      secondary: 'hsl(var(--s))',
      secondaryFocus: 'hsl(var(--sf, var(--s)))',
      secondaryContent: 'hsl(var(--sc))',
      accent: 'hsl(var(--a))',
      accentFocus: 'hsl(var(--af, var(--a)))',
      accentContent: 'hsl(var(--ac))',
      neutral: 'hsl(var(--n))',
      neutralFocus: 'hsl(var(--nf, var(--n)))',
      neutralContent: 'hsl(var(--nc))',
      base: {
        100: 'hsl(var(--b1))',
        200: 'hsl(var(--b2, var(--b1)))',
        300: 'hsl(var(--b3, var(--b2)))',
        content: 'hsl(var(--bc))'
      },
      info: 'hsl(var(--in))',
      infoContent: 'hsl(var(--inc, var(--nc)))',
      success: 'hsl(var(--su))',
      successContent: 'hsl(var(--suc, var(--nc)))',
      warning: 'hsl(var(--wa))',
      warningContent: 'hsl(var(--wac, var(--nc)))',
      error: 'hsl(var(--er))',
      errorContent: 'hsl(var(--erc, var(--nc)))'
    }
  },
  rules: [
    [
      /^rounded-(?:box|btn|badge)$/,
      ([name]) => ({ 'border-radius': `var(--${name})` })
    ]
  ]
});
