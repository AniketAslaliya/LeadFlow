import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { prisma } from '../lib/prisma.js'
import { handleValidationErrors } from '../middleware/errorHandler.js'

const router = Router()

const LEAD_STATUS_VALUES = [
  'New',
  'Contacted',
  'Qualified',
  'ProposalSent',
  'Won',
  'Lost',
]

function mapLeadWithLastDiscussion(lead) {
  const { discussions, ...rest } = lead
  const last =
    discussions && discussions.length > 0
      ? { note: discussions[0].note, createdAt: discussions[0].createdAt }
      : null
  return { ...rest, lastDiscussion: last }
}

router.get(
  '/',
  [
    query('take').optional().isInt({ min: 1, max: 500 }),
    query('skip').optional().isInt({ min: 0, max: 100_000 }),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const take = req.query.take !== undefined ? parseInt(String(req.query.take), 10) : undefined
      const skip = req.query.skip !== undefined ? parseInt(String(req.query.skip), 10) : undefined
      const leads = await prisma.lead.findMany({
        ...(take != null ? { take } : {}),
        ...(skip != null ? { skip } : {}),
        orderBy: [
          { followUpAt: { sort: 'asc', nulls: 'last' } },
          { updatedAt: 'desc' },
        ],
        include: {
          discussions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { note: true, createdAt: true },
          },
        },
      })
      res.json({ data: leads.map(mapLeadWithLastDiscussion) })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('company').optional().isString(),
    body('phone').optional().isString(),
    body('status').optional().isIn(LEAD_STATUS_VALUES),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, company, phone, status } = req.body
      const lead = await prisma.lead.create({
        data: {
          name,
          company: company ?? null,
          phone: phone ?? null,
          status: status ?? 'New',
        },
      })
      res.status(201).json({ data: lead })
    } catch (err) {
      next(err)
    }
  },
)

router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid lead id'),
    body('status').optional().isIn(LEAD_STATUS_VALUES),
    body('followUpAt').optional({ nullable: true }),
    body('name').optional().trim().notEmpty(),
    body('company').optional({ nullable: true }).isString(),
    body('phone').optional({ nullable: true }).isString(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params
      const existing = await prisma.lead.findUnique({ where: { id } })
      if (!existing) {
        const err = new Error('Lead not found')
        err.status = 404
        return next(err)
      }

      const patch = {}
      if (req.body.status !== undefined) patch.status = req.body.status
      if (req.body.name !== undefined) patch.name = req.body.name
      if (req.body.company !== undefined) patch.company = req.body.company
      if (req.body.phone !== undefined) patch.phone = req.body.phone
      if (req.body.followUpAt !== undefined) {
        if (req.body.followUpAt === null) {
          patch.followUpAt = null
        } else {
          const d = new Date(req.body.followUpAt)
          if (Number.isNaN(d.getTime())) {
            const err = new Error('Invalid followUpAt')
            err.status = 400
            return next(err)
          }
          patch.followUpAt = d
        }
      }

      if (Object.keys(patch).length === 0) {
        return res.json({ data: existing })
      }

      const lead = await prisma.lead.update({ where: { id }, data: patch })
      res.json({ data: lead })
    } catch (err) {
      next(err)
    }
  },
)

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid lead id')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params
      const existing = await prisma.lead.findUnique({ where: { id } })
      if (!existing) {
        const err = new Error('Lead not found')
        err.status = 404
        return next(err)
      }
      await prisma.lead.delete({ where: { id } })
      res.json({ data: { deleted: true } })
    } catch (err) {
      next(err)
    }
  },
)

export default router
