import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Find investor's investments by their userId
    let investments = await prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        campaign: {
          include: { business: true }
        }
      }
    })

    // Sandbox fallback: if no investments found for this userId,
    // fetch ALL investments (for demo/sandbox users stored in localStorage)
    if (investments.length === 0) {
      investments = await prisma.investment.findMany({
        include: {
          campaign: {
            include: { business: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    }

    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0)
    
    // Calculate a mock ROI based on campaign's expected ROI for real-time aggregation feel
    const enrichedInvestments = investments.map(inv => {
      const roiMult = 1 + ((inv.campaign.roi || 12) / 100)
      return {
        name: inv.campaign.business?.name || inv.campaign.title,
        sector: inv.campaign.business?.sector || "General",
        invested: inv.amount,
        currentValue: inv.amount * roiMult,
        roi: inv.campaign.roi || 12,
        status: inv.status
      }
    })

    const totalCurrentValue = enrichedInvestments.reduce((sum, i) => sum + i.currentValue, 0)
    
    // Generate Portfolio Data Chart (Past 6 months based on actual totalInvested)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const portfolioData = []
    
    let baseValue = totalInvested > 0 ? totalInvested : 0
    
    const d = new Date()
    for (let i = 5; i >= 0; i--) {
      const pastDate = new Date(d.getFullYear(), d.getMonth() - i, 1)
      const growthCurve = totalInvested > 0 ? 1 - (i * 0.05) : 0
      portfolioData.push({
        month: monthNames[pastDate.getMonth()],
        value: Math.round(baseValue * growthCurve)
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalInvested,
        totalCurrentValue,
        activeCount: enrichedInvestments.filter(i => i.status === 'active').length,
        portfolioData,
        investments: enrichedInvestments,
        notifications: totalInvested > 0 ? [
          { title: "Portfolio Updated", desc: `Total value is now ₹${(totalCurrentValue/1000).toFixed(1)}K`, badge: "Update", color: "bg-blue-500/10 text-blue-600" }
        ] : []
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
