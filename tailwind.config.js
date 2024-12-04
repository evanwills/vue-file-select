/** @type {import('tailwindcss').Config} */

// https://github.com/tailwindlabs/tailwindcss-typography
import typeography from '@tailwindcss/typography';

// https://github.com/tailwindlabs/tailwindcss-forms
// import forms from '@tailwindcss/forms';

// https://github.com/tailwindlabs/tailwindcss-container-queries
// import containerQueries from '@tailwindcss/container-queries';

// https://github.com/tailwindlabs/tailwindcss-aspect-ratio
// import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  content: [],
  theme: {
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
      symbol: ['Material Symbols Rounded'],
      icon: ['Material Icons', 'Material Symbols Rounded'],
    },
    fontSize: {
      'heading-xl-desktop': ['2rem', {
        lineHeight: '2.5rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
      'heading-xl-mobile': ['1.75rem', {
        lineHeight: '2.25rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
      'heading-lg': ['1.5rem', {
        lineHeight: '2rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
      'heading-md': ['1.125rem', {
        lineHeight: '1.5rem',
        letterSpacing: '-0.02em',
        fontWeight: '600',
      }],
      'heading-sm': ['1rem', {
        lineHeight: '1.25rem',
        fontWeight: '600',
      }],
      'heading-xs': ['0.875rem', {
        lineHeight: '1rem',
        fontWeight: '600',
      }],
      'body-xl': ['1.125rem', {
        lineHeight: '1.75rem',
        fontWeight: '400',
      }],
      'bold-xl': ['1.125rem', {
        lineHeight: '1.75rem',
        fontWeight: '600',
      }],
      'body-lg': ['1rem', {
        lineHeight: '1.5rem',
        fontWeight: '400',
      }],
      'bold-lg': ['1rem', {
        lineHeight: '1.5rem',
        fontWeight: '600',
      }],
      'body-md': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '400',
      }],
      'bold-md': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '600',
      }],
      'body-sm': ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '400',
      }],
      'bold-sm': ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '600',
      }],
      'link-xl': ['1.125rem', {
        lineHeight: '1.75rem',
        fontWeight: '400',
      }],
      'link-lg': ['1rem', {
        lineHeight: '1.5rem',
        fontWeight: '400',
      }],
      'link-md': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '400',
      }],
      'link-sm': ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '400',
      }],
      caption: ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '400',
      }],
      'label-lg': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '400',
      }],
      'label-sm': ['0.75rem', {
        lineHeight: '0.75rem',
        fontWeight: '400',
      }],
    },
    extend: {
      colors: {
        blue: {
          200: '#0059ff',
          300: '#004ddb',
          400: '#043ea9',
          500: '#042d7b',
          700: '#0a2c6b',
          900: '#0A214D',
        },
        violet: {
          200: '#9a66db',
          300: '#854acf',
          400: '#743db8',
          500: '#613993',
          700: '#583880',
          900: '#4D336E',
        },
        sky: {
          50: '#E8F8FE',
          100: '#D9F5FF',
          500: '#B2E9FC',
          700: '#047DA5',
          900: '#00506B',
        },
        teal: {
          50: '#E6F0F2',
          100: '#cde7ea',
          500: '#007a87',
          700: '#004D55',
          900: '#002D32',
        },
        green: {
          50: '#ebf6f4',
          100: '#c0e2de',
          500: '#33a394',
          700: '#085c52',
          900: '#043d36',
        },
        purple: {
          50: '#f2f0ff',
          100: '#ddd9f4',
          500: '#9284dc',
          700: '#51439c',
          900: '#3d375c',
        },
        red: {
          50: '#f6ebeb',
          100: '#f4b7b5',
          500: '#da1710',
          700: '#9B100B',
          800: '#780D09',
          900: '#6b0c09',
        },
        sand: {
          50: '#fbf2e8',
          100: '#f4d7b8',
          500: '#da7e1b',
          700: '#6b3c09',
          900: '#3d2104',
        },
        grey: {
          50: '#fafafa',
          100: '#f0f0f0',
          200: '#e2dfe5',
          300: '#c4bfc6',
          400: '#a29da5',
          500: '#89848b',
          600: '#6c676f',
          700: '#313131',
          800: '#29262b',
          900: '#1b181e',
          950: '#0d0b0f',
        },
      },
      typeography: ({ theme }) => ({
        css: {
          '--tw-prose-body': theme('colors.grey[900]'),
          '--tw-prose-headings': theme('colors.grey[900]'),
          '--tw-prose-lead': theme('colors.grey[900]'),
          '--tw-prose-links': theme('colors.blue[300]'),
          '--tw-prose-bold': theme('colors.grey[900]'),
          '--tw-prose-counters': theme('colors.grey[600]'),
          '--tw-prose-bullets': theme('colors.grey[900]'),
          '--tw-prose-hr': theme('colors.grey[900]'),
          '--tw-prose-quotes': theme('colors.grey[900]'),
          '--tw-prose-quote-borders': theme('colors.grey[300]'),
          '--tw-prose-captions': theme('colors.grey[600]'),
          '--tw-prose-code': theme('colors.grey[900]'),
          '--tw-prose-pre-code': theme('colors.grey[900]'),
          '--tw-prose-pre-bg': theme('colors.grey[900]'),
          '--tw-prose-th-borders': theme('colors.grey[300]'),
          '--tw-prose-td-borders': theme('colors.grey[300]'),
          '--tw-prose-invert-body': theme('colors.grey[200]'),
          '--tw-prose-invert-headings': theme('colors.white'),
          '--tw-prose-invert-lead': theme('colors.grey[300]'),
          '--tw-prose-invert-links': theme('colors.white'),
          '--tw-prose-invert-bold': theme('colors.white'),
          '--tw-prose-invert-counters': theme('colors.grey[400]'),
          '--tw-prose-invert-bullets': theme('colors.grey[600]'),
          '--tw-prose-invert-hr': theme('colors.grey[700]'),
          '--tw-prose-invert-quotes': theme('colors.grey[100]'),
          '--tw-prose-invert-quote-borders': theme('colors.grey[700]'),
          '--tw-prose-invert-captions': theme('colors.grey[400]'),
          '--tw-prose-invert-code': theme('colors.white'),
          '--tw-prose-invert-pre-code': theme('colors.grey[300]'),
          '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
          '--tw-prose-invert-th-borders': theme('colors.grey[600]'),
          '--tw-prose-invert-td-borders': theme('colors.grey[700]'),
        },
      }),
    },
  },
  plugins: [
    typeography,
    // forms,
    // containerQueries,
    // aspectRatio,
  ],
};
