import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    exports: true,
    outExtensions: (e) => {
      return ({
        js: e.format === 'es' ? '.js' : '.cjs',
        dts: '.d.ts'
      })
    },
    treeshake: true,
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    clean: true,
    minify: true,
    outputOptions: {
      keepNames: true
    },
    external: [
      'fs',
      'os',
      'tsx',
      'path',
      'tsdown',
      'dotenv',
      'crypto',
      'rollup',
      'esbuild',
      'edge.js',
      'nodemailer',
      'typescript',
      'chalk',
      'commander',
      /^@h3ravel\/.*/gi,
      /^node:.*/gi,
      /.*\/promises$/gi,
      'fs-readdir-recursive',
    ],
  },
  {
    treeshake: true,
    entry: ['src/index.ts'],
    format: ['iife'],
    outDir: 'build',
    outputOptions: {
      keepNames: true,
      name: 'collection',
      file: 'build/collect.min.js',
      globals: {
        'node:util': 'window',
      }
    },
    footer: 'var Collection=collection.Collection;var collect=collection.collect',
    dts: false,
    clean: true,
    minify: true,
    platform: 'browser',
    unbundle: false,
    external: [
      /^node:.*/gi,
      'node:util',
      'util',
    ],
  },

])
