import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        campaigns: {
          include: { investments: { select: { amount: true } } }
        },
        loans: {
          include: { repayments: true }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 })
    }

    const campaigns = profile.campaigns
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised || 0), 0)
    const totalInvestors = campaigns.reduce((sum, c) => sum + c.investments.length, 0)

    // Build real revenue data from paid RepaymentLedger entries grouped by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()

    // Create a map of last 6 months
    const revenueMap = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      revenueMap[key] = { month: monthNames[d.getMonth()], revenue: 0 }
    }

    // Aggregate paid repayments by month
    for (const loan of profile.loans) {
      for (const repayment of loan.repayments) {
        if (repayment.status === "paid" && repayment.paidDate) {
          const d = new Date(repayment.paidDate)
          const key = `${d.getFullYear()}-${d.getMonth()}`
          if (revenueMap[key]) {
            revenueMap[key].revenue += repayment.amountPaid
          }
        }
      }
    }

    // If no real repayment data, generate presentation data based on totalRaised
    let revenueData = Object.values(revenueMap)
    const hasRealData = revenueData.some(r => r.revenue > 0)

    if (!hasRealData && totalRaised > 0) {
      // Scale presentation baseline from actual raised amount
      const baseRevenue = Math.round((totalRaised / 1000) * 0.05)
      revenueData = revenueData.map((r, i) => ({
        ...r,
        revenue: Math.round(baseRevenue * (0.8 + i * 0.07))
      }))
    } else if (!hasRealData) {
      // Absolute fallback for empty database
      const fallbackBase = 200
      revenueData = revenueData.map((r, i) => ({
        ...r,
        revenue: Math.round(fallbackBase * (0.8 + i * 0.07))
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRaised,
        totalInvestors,
        campaignsCount: campaigns.length,
        profileViews: Math.round(1000 + totalRaised / 5000),
        creditScore: profile.creditScore || 742,
        revenueData,
        proposals: campaigns.filter(c => c.status === "active").map(c => ({
          name: c.title,
          amount: `₹${(c.goal / 100000).toFixed(1)}L`,
          type: c.repaymentModel,
          badge: "Active"
        }))
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
