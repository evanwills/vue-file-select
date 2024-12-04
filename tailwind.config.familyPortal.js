import coreConfig from './tailwind.config';

const coreContent = (Array.isArray(coreConfig.content))
  ? coreConfig.content
  : [];

/** @type {import('tailwindcss').Config} */
export default {
  ...coreConfig,
  content: [
    ...coreContent,
    './src/assets/tailwind/tailwind.scss',
    './public/offers.html',
    './public/offer-details.html',
    './public/*.html',
    './src/components/*.vue',
    './src/components/tmp-tailwind-components/*.vue',
    './src/components/offers/*.vue',

    // './src/components/tailwind-components/.vue',
  ],
  theme: {
    ...coreConfig.theme,
    extend: {
      ...coreConfig.theme.extend,
      colors: {
        ...coreConfig.theme.extend.colors,
        primary: coreConfig.theme.extend.colors.blue,
        secondary: coreConfig.theme.extend.colors.sky,
      },
    },
  },
};
