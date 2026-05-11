import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import discussionsRouter from './routes/discussions.js'
import leadsRouter from './routes/leads.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const PORT = process.env.PORT || 3001

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)
app.use(express.json())

// Register specific paths before generic `/:id` routes on the leads router
app.use('/api/leads', discussionsRouter)
app.use('/api/leads', leadsRouter)

app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`LeadFlow API running on port ${PORT}`)
})

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
