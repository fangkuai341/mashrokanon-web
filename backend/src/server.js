import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

async function main() {
  try {
    await app.listen({ host: env.HOST, port: 8080 })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

main()
