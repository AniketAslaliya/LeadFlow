import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createApp } from './app.js'
import { prisma } from './lib/prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const PORT = process.env.PORT || 3001

const app = createApp()

const server = app.listen(PORT, () => {
  console.log(`LeadFlow API running on port ${PORT}`)
})

function shutdown(signal) {
  console.log(`\n[LeadFlow] ${signal} received, shutting down…`)
  server.close(async () => {
    try {
      await prisma.$disconnect()
      console.log('[LeadFlow] Prisma disconnected')
    } catch (e) {
      console.error('[LeadFlow] Prisma disconnect error', e)
    }
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[LeadFlow] Port ${PORT} is already in use.\n` +
        `Stop the other process (e.g. old node server or Docker Compose server) or set PORT to another value in .env.\n` +
        `PowerShell: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess\n`,
    )
  } else {
    console.error(err)
  }
  process.exit(1)
})
