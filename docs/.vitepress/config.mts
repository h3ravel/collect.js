import { readdirSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Collect.js',
  description: 'Convenient and dependency free wrapper for working with arrays and objects',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        href: 'https://raw.githubusercontent.com/h3ravel/collect.js/main/banner.jpg',
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://collect.js.toneflix.net' }],
    ['meta', { property: 'og:title', content: 'Collect.js' }],
    ['meta', { property: 'og:image', content: 'https://raw.githubusercontent.com/h3ravel/collect.js/main/banner.jpg' }],
    ['meta', { property: 'og:description', content: 'Convenient and dependency free wrapper for working with arrays and objects' }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:url', content: 'https://collect.js.toneflix.net' }],
    ['meta', { property: 'twitter:title', content: 'Collect.js' }],
    ['meta', { property: 'twitter:image', content: 'https://raw.githubusercontent.com/h3ravel/collect.js/main/banner.jpg' }],
    ['meta', { property: 'twitter:description', content: 'Convenient and dependency free wrapper for working with arrays and objects' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/installation' },
      { text: 'Usage', link: '/usage' },
      { text: 'API', link: '/api' },
    ],

    sidebar: [
      {
        text: 'Get started',
        // collapsed: false,
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Usage', link: '/usage' }
        ]
      },
      {
        text: 'API',
        // collapsed: false,
        items: readdirSync(path.join(process.cwd(), './docs/api'), 'utf-8').map(file => ({
          text: file.replace('.md', '()'),
          link: `/api/${file}`,
        }))
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/h3ravel/collect.js' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Toneflix Technologies Limited'
    }
  }
})
