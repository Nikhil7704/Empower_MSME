// EmpowerMSME — Loans Database Services
import prisma from "@/lib/prisma"

const timeline = {
  "submitted": { label: "Submitted", description: "Application received by the system", icon: "upload" },
  "under_review": { label: "Under Review", description: "Documents being verified by lender", icon: "search" },
  "approved": { label: "Approved", description: "Loan sanctioned, awaiting disbursement", icon: "check" },
  "disbursed": { label: "Disbursed", description: "Funds transferred to your account", icon: "bank" },
  "rejected": { label: "Rejected", description: "Application not approved", icon: "x" },
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("businessId")
  const id = searchParams.get("id")

  try {
    if (id) {
      const loan = await prisma.loan.findUnique({
        where: { id },
        include: { business: true }
      })
      if (!loan) {
        return Response.json({ success: false, error: "Loan not found" }, { status: 404 })
      }
      
      const statusMap = {
        pending: "submitted",
        approved: "approved",
        disbursed: "disbursed",
        repaid: "disbursed"
      }

      const mapped = {
        id: loan.id,
        businessId: loan.businessId,
        amount: loan.amount,
        purpose: "Working Capital",
        status: statusMap[loan.status] || "submitted",
        stage: loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
        submittedAt: loan.createdAt.toISOString().split("T")[0],
        creditScore: loan.business.creditScore,
        riskLevel: "Low",
        interestRate: loan.interestRate,
        tenure: loan.tenureMonths,
        emi: Math.round(loan.amount / loan.tenureMonths * 1.05),
        documents: loan.business.kycDocs,
      }

      return Response.json({ success: true, data: { ...mapped, timeline } })
    }

    const where = {}
    if (businessId) {
      where.businessId = businessId
    }

    const data = await prisma.loan.findMany({
      where,
      include: { business: true },
      orderBy: { createdAt: "desc" }
    })

    const statusMap = {
      pending: "submitted",
      approved: "approved",
      disbursed: "disbursed",
      repaid: "disbursed"
    }

    const mappedList = data.map(l => ({
      id: l.id,
      businessId: l.businessId,
      amount: l.amount,
      purpose: "Working Capital",
      status: statusMap[l.status] || "submitted",
      stage: l.status.charAt(0).toUpperCase() + l.status.slice(1),
      submittedAt: l.createdAt.toISOString().split("T")[0],
      creditScore: l.business.creditScore,
      riskLevel: "Low",
      interestRate: l.interestRate,
      tenure: l.tenureMonths,
      emi: Math.round(l.amount / l.tenureMonths * 1.05),
      documents: l.business.kycDocs,
    }))

    return Response.json({ success: true, data: mappedList, timeline })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Check or create mock business profile for sandbox backwards-compatibility
    let business = await prisma.businessProfile.findFirst({
      where: { id: body.businessId }
    })

    if (!business) {
      business = await prisma.businessProfile.findFirst()
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
            name: "GreenLeaf Organics",
            sector: "Agriculture",
            location: "Maharashtra",
            udyamId: `UDYAM-MH-${Math.floor(Math.random() * 10000000)}`,
            employees: 15,
            businessAge: 3,
            description: "Mocked business description",
            fundingGoal: 1000000,
            creditScore: 700,
          }
        })
      }
    }

    const newLoan = await prisma.loan.create({
      data: {
        businessId: business.id,
        amount: Number(body.amount),
        platformFee: Number(body.amount) * 0.02,
        interestRate: Number(body.interestRate || 10.5),
        tenureMonths: Number(body.tenure || 12),
        status: "pending",
        bankName: body.bankName || "SBI",
        accountNum: body.accountNum || "1234567890",
        ifsc: body.ifsc || "SBIN0000001",
      },
      include: {
        business: true
      }
    })

    const responseFormat = {
      id: newLoan.id,
      businessId: newLoan.businessId,
      amount: newLoan.amount,
      purpose: "Working Capital",
      status: "submitted",
      stage: "Submitted",
      submittedAt: newLoan.createdAt.toISOString().split("T")[0],
      creditScore: newLoan.business.creditScore,
      riskLevel: "Low",
      interestRate: newLoan.interestRate,
      tenure: newLoan.tenureMonths,
      emi: Math.round(newLoan.amount / newLoan.tenureMonths * 1.05),
      documents: newLoan.business.kycDocs || [],
    }

    return Response.json({ success: true, data: responseFormat }, { status: 201 })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 400 })
  }
}
