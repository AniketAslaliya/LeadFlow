import { Router } from 'express'
import { body, param } from 'express-validator'
import { prisma } from '../lib/prisma.js'
import { handleValidationErrors } from '../middleware/errorHandler.js'

const router = Router()

router.get(
  '/:id/discussions',
  [param('id').isUUID().withMessage('Invalid lead id')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id: leadId } = req.params
      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (!lead) {
        const err = new Error('Lead not found')
        err.status = 404
        return next(err)
      }

      const discussions = await prisma.discussion.findMany({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
      })
      res.json({ data: discussions })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/:id/discussions',
  [
    param('id').isUUID().withMessage('Invalid lead id'),
    body('note').trim().notEmpty().withMessage('Note is required'),
    body('followUpAt').optional({ nullable: true }),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id: leadId } = req.params
      const { note } = req.body

      let followUpAt = null
      if (req.body.followUpAt !== undefined && req.body.followUpAt !== null) {
        const d = new Date(req.body.followUpAt)
        if (Number.isNaN(d.getTime())) {
          const err = new Error('Invalid followUpAt')
          err.status = 400
          return next(err)
        }
        followUpAt = d
      }

      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (!lead) {
        const err = new Error('Lead not found')
        err.status = 404
        return next(err)
      }

      const discussion = await prisma.$transaction(async (tx) => {
        const created = await tx.discussion.create({
          data: {
            leadId,
            note,
            followUpAt,
          },
        })
        if (followUpAt) {
          await tx.lead.update({
            where: { id: leadId },
            data: { followUpAt },
          })
        }
        return created
      })

      res.status(201).json({ data: discussion })
    } catch (err) {
      next(err)
    }
  },
)

export default router
