// EmpowerMSME — Campaign Management Database Services
import prisma from "@/lib/prisma"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sector = searchParams.get("sector")
  const region = searchParams.get("region")
  const status = searchParams.get("status")
  const businessId = searchParams.get("businessId")

  try {
    const where = {}
    if (status) {
      where.status = status
    }
    if (businessId) {
      where.businessId = businessId
    }

    // Filter via business relation sector or location
    const businessWhere = {}
    if (sector && sector !== "all") {
      businessWhere.sector = sector
    }
    if (region && region !== "all") {
      businessWhere.location = { contains: region, mode: "insensitive" }
    }

    if (Object.keys(businessWhere).length > 0) {
      where.business = businessWhere
    }

    const data = await prisma.campaign.findMany({
      where,
      include: {
        business: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const mapped = data.map(c => ({
      id: c.id,
      businessId: c.businessId,
      businessName: c.business.name,
      sector: c.business.sector,
      region: c.business.location,
      title: c.title,
      description: c.description,
      goal: c.goal,
      raised: c.raised,
      investors: 0,
      daysLeft: 30,
      riskLevel: c.riskRating,
      expectedROI: c.roi,
      repaymentModel: c.repaymentModel,
      status: c.status,
      createdAt: c.createdAt.toISOString().split("T")[0],
    }))

    return Response.json({ success: true, data: mapped, total: mapped.length })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Check or create mock business profile for sandbox backwards-compatibility
    let business = await prisma.businessProfile.findFirst({
      where: { name: body.businessName || "GreenLeaf Organics" }
    })

    if (!business) {
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
      
      business = await prisma.businessProfile.create({
        data: {
          userId: user.id,
          name: body.businessName || "GreenLeaf Organics",
          sector: body.sector || "Agriculture",
          location: body.region || "Maharashtra",
          udyamId: body.udyamId || `UDYAM-MH-${Math.floor(Math.random() * 10000000)}`,
          employees: 15,
          businessAge: 3,
          description: body.description || "Mocked business description",
          fundingGoal: Number(body.goal || 1000000),
          creditScore: 700,
        }
      })
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        businessId: business.id,
        title: body.title,
        description: body.description,
        goal: Number(body.goal),
        roi: Number(body.expectedROI || body.roi || 12.5),
        repaymentModel: body.repaymentModel || "Fixed EMI",
        status: "active",
        riskRating: body.riskLevel || "Medium",
      },
      include: {
        business: true
      }
    })

    const responseFormat = {
      id: newCampaign.id,
      businessId: newCampaign.businessId,
      businessName: newCampaign.business.name,
      sector: newCampaign.business.sector,
      region: newCampaign.business.location,
      title: newCampaign.title,
      description: newCampaign.description,
      goal: newCampaign.goal,
      raised: newCampaign.raised,
      investors: 0,
      daysLeft: 30,
      riskLevel: newCampaign.riskRating,
      expectedROI: newCampaign.roi,
      repaymentModel: newCampaign.repaymentModel,
      status: newCampaign.status,
      createdAt: newCampaign.createdAt.toISOString().split("T")[0],
    }

    return Response.json({ success: true, data: responseFormat }, { status: 201 })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 400 })
  }
}
