import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  // Create a demo investor
  const investorEmail = 'investor_demo@example.com'
  let investor = await prisma.user.findUnique({ where: { email: investorEmail } })
  if (!investor) {
    investor = await prisma.user.create({
      data: {
        email: investorEmail,
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'INVESTOR',
        kycStatus: 'VERIFIED'
      }
    })
    console.log("Created demo investor: ", investorEmail)
  }

  // Create a demo business
  const businessEmail = 'business_demo@example.com'
  let businessUser = await prisma.user.findUnique({ where: { email: businessEmail } })
  let businessProfile = null

  if (!businessUser) {
    businessUser = await prisma.user.create({
      data: {
        email: businessEmail,
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'BUSINESS',
        kycStatus: 'VERIFIED',
        businessProfile: {
          create: {
            name: 'EcoCraft India',
            sector: 'Manufacturing',
            location: 'Bangalore, KA',
            udyamId: 'UDYAM-KA-00-1234567',
            employees: 15,
            businessAge: 3.5,
            description: 'Sustainable packaging manufacturer for FMCG brands.',
            fundingGoal: 2000000,
            creditScore: 780
          }
        }
      },
      include: { businessProfile: true }
    })
    businessProfile = businessUser.businessProfile
    console.log("Created demo business: EcoCraft India")
  } else {
    businessProfile = await prisma.businessProfile.findUnique({ where: { userId: businessUser.id } })
  }

  // Create some campaigns for the business
  const existingCampaigns = await prisma.campaign.findMany({ where: { businessId: businessProfile.id } })
  let campaign1, campaign2

  if (existingCampaigns.length === 0) {
    campaign1 = await prisma.campaign.create({
      data: {
        businessId: businessProfile.id,
        title: 'New Eco-Friendly Production Line',
        description: 'Expanding our capacity by 300% to meet rising demand for sustainable packaging.',
        goal: 2000000,
        raised: 1200000,
        riskRating: 'Medium',
        roi: 14.5,
        repaymentModel: 'Revenue-Based (8%)',
        status: 'active'
      }
    })

    campaign2 = await prisma.campaign.create({
      data: {
        businessId: businessProfile.id,
        title: 'Working Capital for Export Order',
        description: 'Fulfilling a major export order to Europe. Need short term financing.',
        goal: 500000,
        raised: 500000,
        riskRating: 'Low',
        roi: 11.0,
        repaymentModel: 'Fixed EMI (12 months)',
        status: 'funded'
      }
    })
    console.log("Created demo campaigns")
  } else {
    campaign1 = existingCampaigns[0]
    campaign2 = existingCampaigns[1] || existingCampaigns[0]
  }

  // Create some investments for the investor (to generate portfolio history)
  const existingInvestments = await prisma.investment.findMany({ where: { investorId: investor.id } })
  if (existingInvestments.length === 0) {
    // Generate some history spread across months
    const now = new Date()
    
    // 3 months ago
    const d1 = new Date()
    d1.setMonth(now.getMonth() - 3)
    await prisma.investment.create({
      data: {
        campaignId: campaign1.id,
        investorId: investor.id,
        amount: 50000,
        status: 'active',
        createdAt: d1
      }
    })

    // 1 month ago
    const d2 = new Date()
    d2.setMonth(now.getMonth() - 1)
    await prisma.investment.create({
      data: {
        campaignId: campaign2.id,
        investorId: investor.id,
        amount: 25000,
        status: 'completed',
        createdAt: d2
      }
    })

    // Add some investments for other random campaigns so charts look full
    // For this, create a dummy campaign
    const dummyCamp = await prisma.campaign.create({
      data: {
        businessId: businessProfile.id,
        title: 'Past Completed Campaign',
        description: 'A completed successfully funded campaign.',
        goal: 100000,
        raised: 100000,
        roi: 16.0,
        repaymentModel: 'Fixed EMI',
        status: 'expired'
      }
    })

    // 5 months ago
    const d3 = new Date()
    d3.setMonth(now.getMonth() - 5)
    await prisma.investment.create({
      data: {
        campaignId: dummyCamp.id,
        investorId: investor.id,
        amount: 75000,
        status: 'completed',
        createdAt: d3
      }
    })

    console.log("Created demo investments for portfolio generation")
  }

  // Create some repayments to simulate revenue
  const existingLoans = await prisma.loan.findMany({ where: { businessId: businessProfile.id } })
  if (existingLoans.length === 0) {
    const loan = await prisma.loan.create({
      data: {
        businessId: businessProfile.id,
        amount: 500000,
        platformFee: 10000,
        interestRate: 12,
        tenureMonths: 12,
        status: 'approved',
        bankName: 'HDFC',
        accountNum: '1234567890',
        ifsc: 'HDFC0001234'
      }
    })

    // Create a series of repayments (which we can use for "Revenue" or "Repayments" charts)
    for (let i = 1; i <= 6; i++) {
      const rd = new Date()
      rd.setMonth(new Date().getMonth() - (6 - i))
      await prisma.repaymentLedger.create({
        data: {
          loanId: loan.id,
          dueDate: rd,
          amountDue: 45000,
          amountPaid: i < 5 ? 45000 : 0,
          status: i < 5 ? 'paid' : 'pending',
          paidDate: i < 5 ? rd : null,
          createdAt: rd
        }
      })
    }
    console.log("Created demo loans and repayments")
  }

  console.log("Database seeding completed successfully.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
