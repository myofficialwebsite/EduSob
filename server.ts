import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './src/index'

// Serve static assets from public/
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/samples/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))

const port = Number(process.env.PORT) || 3000
const hostname = '0.0.0.0'

console.log(`EduSob server starting on http://${hostname}:${port}...`)

serve({
  fetch: app.fetch,
  port,
  hostname
}, (info) => {
  console.log(`EduSob server running at http://${info.address}:${info.port}`)
})
