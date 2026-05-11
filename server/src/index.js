import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
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

app.use('/api/leads', leadsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`LeadFlow API running on port ${PORT}`)
})
