// EmpowerMSME — Repayments Database Services
import prisma from "@/lib/prisma"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("businessId")
  const type = searchParams.get("type") // "emi" | "rbf"

  try {
    // Check or create mock business profile for sandbox backwards-compatibility
    let business = null
    if (businessId) {
      business = await prisma.businessProfile.findUnique({
        where: { id: businessId }
      })
    }

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
            location: "Pune, MH",
            udyamId: "UDYAM-MH-12-0048392",
            employees: 15,
            businessAge: 3,
            description: "Organic spices packaging and exports",
            fundingGoal: 2500000,
            creditScore: 742,
          }
        })
      }
    }

    // Find any active loans for this business
    let loans = await prisma.loan.findMany({
      where: { businessId: business.id },
      include: { repayments: true }
    })

    if (loans.length === 0) {
      // Create seed loan
      const baseLoan = await prisma.loan.create({
        data: {
          businessId: business.id,
          amount: 1500000,
          platformFee: 30000,
          interestRate: 10.5,
          tenureMonths: 24,
          status: "disbursed",
          bankName: "HDFC Bank",
          accountNum: "******92842",
          ifsc: "HDFC0001202",
        }
      })

      // Generate 12 repayments (10 paid, 2 upcoming)
      const repaymentData = []
      for (let i = 0; i < 12; i++) {
        const isPaid = i < 10
        const date = new Date(2025, 5 + i, 25)
        repaymentData.push({
          loanId: baseLoan.id,
          dueDate: date,
          amountDue: 69200,
          amountPaid: isPaid ? 69200 : 0,
          status: isPaid ? "paid" : "pending",
          paidDate: isPaid ? date : null,
        })
      }

      await prisma.repaymentLedger.createMany({
        data: repaymentData
      })

      // Reload
      loans = await prisma.loan.findMany({
        where: { businessId: business.id },
        include: { repayments: true }
      })
    }

    // Backwards-compatible formatting
    if (type === "rbf") {
      const rbfFormat = loans.map(l => {
        const amountPaid = l.repayments.reduce((s, r) => s + r.amountPaid, 0)
        const totalRepayable = l.amount * 1.3
        
        return {
          id: `rbf-${l.id}`,
          businessId: l.businessId,
          totalFunding: l.amount,
          capRate: 1.3,
          totalRepayable,
          revenueSharePct: 8,
          amountPaid,
          remaining: totalRepayable - amountPaid,
          monthlyData: [
            { month: "Jan 2026", revenue: 850000, payment: 68000, status: "paid" },
            { month: "Feb 2026", revenue: 920000, payment: 73600, status: "paid" },
            { month: "Mar 2026", revenue: 1100000, payment: 88000, status: "paid" },
            { month: "Apr 2026", revenue: null, payment: null, status: "upcoming" },
          ]
        }
      })
      return Response.json({ success: true, data: rbfFormat })
    }

    const emiFormat = loans.map(l => {
      const amountPaid = l.repayments.reduce((s, r) => s + r.amountPaid, 0)
      const nextDue = l.repayments.find(r => r.status === "pending")
      const paidMonths = l.repayments.filter(r => r.status === "paid").length
      
      const payments = l.repayments.map((r) => {
        const dateStr = r.dueDate.toISOString().split("T")[0]
        const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthLabel = `${monthsNames[r.dueDate.getMonth()]} ${r.dueDate.getFullYear()}`
        
        return {
          month: monthLabel,
          amount: r.amountDue,
          status: r.status === "paid" ? "paid" : "upcoming",
          date: dateStr,
          principal: Math.round(r.amountDue * 0.8),
          interest: Math.round(r.amountDue * 0.2),
        }
      })

      return {
        id: `r-${l.id}`,
        loanId: l.id,
        businessId: l.businessId,
        totalAmount: l.amount,
        totalRepayable: l.amount * 1.1,
        amountPaid,
        remainingBalance: (l.amount * 1.1) - amountPaid,
        nextDueDate: nextDue ? nextDue.dueDate.toISOString().split("T")[0] : "Paid Off",
        nextEmiAmount: nextDue ? nextDue.amountDue : 0,
        isOverdue: false,
        overdueAmount: 0,
        tenure: l.tenureMonths,
        paidMonths,
        payments,
      }
    })

    return Response.json({ success: true, data: emiFormat })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
