import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: List all users with their KYC status
export async function GET(req) {
  try {
    const users = await prisma.user.findMany({
      include: { businessProfile: true },
      orderBy: { createdAt: "desc" }
    })

    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      kycStatus: u.kycStatus,
      createdAt: u.createdAt,
      name: u.businessProfile?.name || u.email.split("@")[0],
      business: u.businessProfile?.name || "—",
      sector: u.businessProfile?.sector || "—",
      creditScore: u.businessProfile?.creditScore || 0,
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Update a user's KYC status
export async function PATCH(req) {
  try {
    const { userId, kycStatus } = await req.json()

    if (!userId || !kycStatus) {
      return NextResponse.json({ error: "userId and kycStatus are required" }, { status: 400 })
    }

    const validStatuses = ["PENDING", "VERIFIED", "REJECTED"]
    if (!validStatuses.includes(kycStatus.toUpperCase())) {
      return NextResponse.json({ error: "Invalid kycStatus value" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: kycStatus.toUpperCase() }
    })

    return NextResponse.json({ success: true, data: { id: updated.id, kycStatus: updated.kycStatus } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
