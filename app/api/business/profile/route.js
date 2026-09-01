import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Fetch business profile for the logged-in user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true, kycStatus: true } } }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Update business profile details
export async function PATCH(req) {
  try {
    const body = await req.json()
    const { userId, name, sector, location, description, employees, fundingGoal, website } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const updated = await prisma.businessProfile.update({
      where: { userId },
      data: {
        ...(name && { name }),
        ...(sector && { sector }),
        ...(location && { location }),
        ...(description && { description }),
        ...(employees && { employees: parseInt(employees) }),
        ...(fundingGoal && { fundingGoal: parseFloat(fundingGoal) }),
        ...(website !== undefined && { website }),
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
