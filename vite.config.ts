import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import nodeAdapter from '@hono/vite-dev-server/node'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    build(),
    devServer({
      adapter: nodeAdapter,
      entry: 'src/index.tsx'
    })
  ]
})
