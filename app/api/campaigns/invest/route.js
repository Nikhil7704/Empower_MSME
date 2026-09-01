import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { campaignId, amount, userId } = body

    if (!campaignId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 })
    }

    // Use provided userId, or fall back to first INVESTOR (sandbox mode)
    let investorId = userId
    if (!investorId) {
      let user = await prisma.user.findFirst({ where: { role: "INVESTOR" } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "mock-investor@empowermsme.com",
            passwordHash: "bcrypt-hash-12345",
            role: "INVESTOR",
            kycStatus: "VERIFIED"
          }
        })
      }
      investorId = user.id
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 })
    }

    // Execute Prisma Transaction to create investment and update campaign pool
    const [investment, updatedCampaign] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          campaignId: campaign.id,
          investorId: investorId,
          amount: Number(amount),
          status: "active"
        }
      }),
      prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          raised: {
            increment: Number(amount)
          }
        }
      })
    ])

    return NextResponse.json({ success: true, data: { ...investment, updatedRaised: updatedCampaign.raised } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
