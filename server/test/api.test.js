import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const app = createApp()

describe('LeadFlow API', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.lead.deleteMany()
  })

  it('GET /api/leads returns data array', async () => {
    const res = await request(app).get('/api/leads').expect(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('POST /api/leads rejects empty name', async () => {
    const res = await request(app).post('/api/leads').send({ name: '   ' }).expect(400)
    expect(res.body).toHaveProperty('error')
  })

  it('POST /api/leads creates lead', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({ name: 'Test Lead', company: 'Co', phone: '+15550001', status: 'New' })
      .expect(201)
    expect(res.body.data.name).toBe('Test Lead')
    expect(res.body.data.status).toBe('New')
  })

  it('GET /api/leads respects take query', async () => {
    await prisma.lead.createMany({
      data: [
        { name: 'A', status: 'New' },
        { name: 'B', status: 'New' },
      ],
    })
    const res = await request(app).get('/api/leads').query({ take: 1 }).expect(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('GET discussions returns 400 for invalid uuid', async () => {
    await request(app).get('/api/leads/not-a-uuid/discussions').expect(400)
  })

  it('PATCH lead returns 404 when missing', async () => {
    await request(app)
      .patch('/api/leads/00000000-0000-4000-8000-000000000001')
      .send({ status: 'Won' })
      .expect(404)
  })

  it('discussion with followUpAt updates lead in transaction', async () => {
    const created = await prisma.lead.create({
      data: { name: 'Tx Lead', status: 'New' },
    })
    const followUpAt = new Date(Date.now() + 86_400_000).toISOString()

    const res = await request(app)
      .post(`/api/leads/${created.id}/discussions`)
      .send({ note: 'Call back tomorrow', followUpAt })
      .expect(201)

    expect(res.body.data.note).toBe('Call back tomorrow')

    const updatedLead = await prisma.lead.findUnique({ where: { id: created.id } })
    expect(updatedLead?.followUpAt).not.toBeNull()
    expect(
      Math.abs(new Date(updatedLead.followUpAt).getTime() - new Date(followUpAt).getTime()),
    ).toBeLessThan(2000)
  })
})
