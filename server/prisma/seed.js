import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const prisma = new PrismaClient()

function subDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function atTime(date, hours, minutes = 0) {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

async function main() {
  await prisma.lead.deleteMany()

  const now = new Date()

  const sarahFollowUp = atTime(now, 14, 0)
  const hankFollowUp = atTime(addDays(now, 1), 10, 0)
  const billFollowUp = atTime(subDays(now, 3), 9, 0)

  const sarah = await prisma.lead.create({
    data: {
      name: 'Sarah Connor',
      company: 'Acme Corp',
      phone: '555-0199',
      status: 'ProposalSent',
      followUpAt: sarahFollowUp,
      discussions: {
        create: [
          {
            note: 'Sent pricing tier PDF. Said she would review with her boss.',
            followUpAt: sarahFollowUp,
            createdAt: subDays(now, 2),
          },
          {
            note: 'Initial discovery call. They need a CRM for 50 reps.',
            createdAt: subDays(now, 5),
          },
          {
            note: 'Lead created via web form.',
            createdAt: subDays(now, 6),
          },
        ],
      },
    },
  })
  console.log(sarah.name)

  const hank = await prisma.lead.create({
    data: {
      name: 'Hank Scorpio',
      company: 'Globex Inc',
      phone: '555-0234',
      status: 'Qualified',
      followUpAt: hankFollowUp,
      discussions: {
        create: [
          {
            note: 'Budget approved internally. Waiting on legal to review MSA.',
            createdAt: subDays(now, 1),
          },
          {
            note: 'Demo went extremely well. They loved the pipeline view.',
            createdAt: subDays(now, 4),
          },
        ],
      },
    },
  })
  console.log(hank.name)

  const bill = await prisma.lead.create({
    data: {
      name: 'Bill Lumbergh',
      company: 'Initech',
      phone: '555-0087',
      status: 'Contacted',
      followUpAt: billFollowUp,
      discussions: {
        create: [
          {
            note: 'Left voicemail. No response yet. Will try email next.',
            createdAt: subDays(now, 3),
          },
          {
            note: 'Cold call — reached gatekeeper. Asked to call back.',
            createdAt: subDays(now, 5),
          },
        ],
      },
    },
  })
  console.log(bill.name)

  const bruce = await prisma.lead.create({
    data: {
      name: 'Bruce Wayne',
      company: 'Wayne Enterprises',
      phone: null,
      status: 'Won',
      followUpAt: null,
      discussions: {
        create: [
          {
            note: 'Contract signed! Onboarding scheduled for next week.',
            createdAt: subDays(now, 1),
          },
          {
            note: 'Final negotiation call. Agreed on annual pricing.',
            createdAt: subDays(now, 3),
          },
        ],
      },
    },
  })
  console.log(bruce.name)

  const dwight = await prisma.lead.create({
    data: {
      name: 'Dwight Schrute',
      company: 'Dunder Mifflin',
      phone: '555-0356',
      status: 'New',
      followUpAt: null,
      discussions: {
        create: [
          {
            note: 'Inbound lead via website contact form. Assigned to me.',
            createdAt: new Date(now),
          },
        ],
      },
    },
  })
  console.log(dwight.name)

  const regina = await prisma.lead.create({
    data: {
      name: 'Regina George',
      company: 'Plastics Inc',
      phone: '555-0412',
      status: 'Lost',
      followUpAt: null,
      discussions: {
        create: [
          {
            note: 'Lost to competitor. Price was the deciding factor.',
            createdAt: subDays(now, 2),
          },
          {
            note: "Follow-up call — she's reconsidering but not ready yet.",
            createdAt: subDays(now, 6),
          },
        ],
      },
    },
  })
  console.log(regina.name)

  console.log('✅ Seed complete')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
