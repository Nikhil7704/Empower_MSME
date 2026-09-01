import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, businessName, ownerName, email, password, role } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 })
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Start a transaction or create user and profile depending on role
    if (role === "BUSINESS") {
      // Create user and business profile in one transaction
      const bName = businessName || ownerName || "My Business"
      
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "BUSINESS",
          businessProfile: {
            create: {
              name: bName,
              sector: "General", // Placeholder
              location: "India", // Placeholder
              udyamId: `UDYAM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Placeholder unique ID
              employees: 1, // Placeholder
              businessAge: 1, // Placeholder
              description: "Newly registered business account.", // Placeholder
              fundingGoal: 100000, // Placeholder
            }
          }
        },
        include: {
          businessProfile: true
        }
      })
      
      return NextResponse.json({ 
        message: "Business account created successfully", 
        user: { id: user.id, email: user.email, role: user.role }
      }, { status: 201 })
      
    } else if (role === "USER" || role === "INVESTOR") {
      // Investor / general user creation
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "INVESTOR", // Use INVESTOR as per schema
        }
      })
      
      return NextResponse.json({ 
        message: "User account created successfully", 
        user: { id: user.id, email: user.email, role: user.role } 
      }, { status: 201 })
      
    } else {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 })
    }
    
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
