import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    const data = await prisma.lendingCircle.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Map database records to match the format expected by the frontend page
    const mapped = data.map(c => {
      const membersList = c.members.map(m => ({
        name: m.user.email.split("@")[0],
        trustScore: m.trustScore,
        contributed: m.contributionStatus === "paid",
        turn: 1, // Simulated turns
        initials: m.user.email.substring(0, 2).toUpperCase()
      }))

      return {
        id: c.id,
        name: c.name,
        members: c.members.length,
        maxMembers: c.maxMembers,
        contribution: c.contributionAmount,
        totalPool: c.contributionAmount * c.members.length,
        currentRound: c.currentRound,
        totalRounds: c.maxMembers,
        myTurn: 5, // Mock turn
        status: c.status,
        category: "Mixed",
        members_list: membersList
      }
    })

    return NextResponse.json({ success: true, data: mapped })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, maxMembers, contribution, category } = body

    if (!name || !maxMembers || !contribution) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Load first user as creator
    let user = await prisma.user.findFirst({ where: { role: "BUSINESS" } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "mock-business@empowermsme.com",
          passwordHash: "bcrypt-hash-12345",
          role: "BUSINESS",
          kycStatus: "VERIFIED"
        }
      })
    }

    // Create the circle and automatically add the creator as the first member
    const circle = await prisma.lendingCircle.create({
      data: {
        name,
        maxMembers: Number(maxMembers),
        contributionAmount: Number(contribution),
        status: "active",
        members: {
          create: {
            userId: user.id,
            trustScore: 90,
            contributionStatus: "pending"
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    })

    const responseFormat = {
      id: circle.id,
      name: circle.name,
      members: 1,
      maxMembers: circle.maxMembers,
      contribution: circle.contributionAmount,
      totalPool: circle.contributionAmount,
      currentRound: circle.currentRound,
      totalRounds: circle.maxMembers,
      myTurn: 1,
      status: circle.status,
      category: category || "Mixed",
      members_list: [{ name: "You", trustScore: 90, contributed: false, turn: 1, initials: "ME" }]
    }

    return NextResponse.json({ success: true, data: responseFormat })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
