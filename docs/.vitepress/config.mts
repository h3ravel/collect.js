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
        href: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/298/gem-stone_1f48e.png',
      }
    ],
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
