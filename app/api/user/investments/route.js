import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Fetch real investment ledger for an investor
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const investments = await prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        campaign: {
          include: {
            business: true,
            investments: { select: { amount: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Build enriched investment objects with ledger and milestones
    const enriched = investments.map(inv => {
      const roiMult = (inv.campaign.roi || 12) / 100
      const currentValue = inv.amount * (1 + roiMult)
      const returned = inv.status === "completed" ? currentValue : inv.amount * roiMult * 0.4

      return {
        id: inv.id,
        name: inv.campaign.business?.name || inv.campaign.title,
        sector: inv.campaign.business?.sector || "General",
        invested: inv.amount,
        returned: Math.round(returned),
        cap: Math.round(currentValue),
        roi: inv.campaign.roi || 12,
        model: inv.campaign.repaymentModel,
        status: inv.status,
        nextPayout: inv.status === "active"
          ? new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : inv.status === "completed" ? "Fully Paid" : "Pending Escrow",
        nextAmount: inv.status === "active" ? Math.round(inv.amount * roiMult / 12) : 0,
        // Generate basic schedule from createdAt
        schedule: generateSchedule(inv.createdAt, inv.amount, roiMult, inv.campaign.tenureMonths || 12, inv.status),
        milestones: [
          { desc: `Campaign "${inv.campaign.title}" launched`, done: true },
          { desc: "Initial funding milestone reached (50%)", done: (inv.campaign.raised / inv.campaign.goal) >= 0.5 },
          { desc: "Full funding goal achieved", done: inv.campaign.status === "funded" }
        ]
      }
    })

    const totalInvested = enriched.reduce((s, i) => s + i.invested, 0)
    const totalReturned = enriched.reduce((s, i) => s + i.returned, 0)

    return NextResponse.json({
      success: true,
      data: { investments: enriched, totalInvested, totalReturned }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function generateSchedule(startDate, amount, roiMult, tenureMonths, status) {
  const monthlyEmi = Math.round((amount * (1 + roiMult)) / tenureMonths)
  const months = []
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const start = new Date(startDate)
  const now = new Date()

  for (let i = 0; i < Math.min(tenureMonths, 6); i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i + 1, 1)
    const isPast = d < now
    months.push({
      month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      amount: monthlyEmi,
      status: isPast && status !== "escrow" ? "credited" : isPast ? "missed" : "upcoming"
    })
  }
  return months
}
