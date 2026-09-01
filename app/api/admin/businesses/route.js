import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: List all business profiles for admin review
export async function GET(req) {
  try {
    const businesses = await prisma.businessProfile.findMany({
      include: {
        user: true,
        campaigns: { select: { id: true, status: true, raised: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const formatted = businesses.map(b => ({
      id: b.id,
      userId: b.userId,
      name: b.name,
      sector: b.sector,
      location: b.location,
      udyamId: b.udyamId,
      employees: b.employees,
      creditScore: b.creditScore,
      kycStatus: b.user.kycStatus,
      email: b.user.email,
      campaignCount: b.campaigns.length,
      totalRaised: b.campaigns.reduce((s, c) => s + c.raised, 0),
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Admin approves or rejects KYC for a business (by userId)
export async function PATCH(req) {
  try {
    const { userId, kycStatus } = await req.json()

    if (!userId || !kycStatus) {
      return NextResponse.json({ error: "userId and kycStatus required" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: kycStatus.toUpperCase() }
    })

    return NextResponse.json({ success: true, data: { kycStatus: updated.kycStatus } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
