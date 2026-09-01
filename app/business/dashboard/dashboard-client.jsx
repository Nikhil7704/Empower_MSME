"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BusinessSidebar from "@/components/business-sidebar"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Eye, Heart, TrendingUp, DollarSign, Users, ArrowUpRight, FileText, Repeat2, Wand2, BookOpen, CreditCard } from "lucide-react"

// Hardcoded mock data removed

// Quick actions retained
const quickActions = [
  { label: "Apply for Loan", href: "/business/loans", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "View Repayments", href: "/business/repayments", icon: Repeat2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Credit Score", href: "/business/credit-score", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Story Builder", href: "/business/story-builder", icon: Wand2, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "AI Academy", href: "/business/ai-academy", icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { label: "RBF Calculator", href: "/business/rbf", icon: CreditCard, color: "text-pink-500", bg: "bg-pink-500/10" },
]

export default function DashboardClient() {
  const { user } = useAuth()
  const [data, setData] = useState({
    totalRaised: 0,
    campaignsCount: 0,
    profileViews: 1234,
    creditScore: 742,
    revenueData: [],
    proposals: []
  })

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/analytics/business?userId=${user.id}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) setData(res.data)
        })
    }
  }, [user])

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Business Overview</h1>
                <p className="text-muted-foreground mt-1">Track your business performance and funding</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5">✓ KYC Verified</Badge>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Profile Views" value={data.profileViews} change={12} description="Unique visitor views" icon={Eye} iconColor="text-primary" iconBg="bg-primary/10" delay={0} />
              <MetricCard title="Campaigns" value={data.campaignsCount} description="Active & funded" icon={Heart} iconColor="text-red-500" iconBg="bg-red-500/10" delay={0.08} />
              <MetricCard title="Credit Score" value={data.creditScore} change={8} description="Good standing" icon={TrendingUp} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" delay={0.16} />
              <MetricCard title="Funding Raised" value={data.totalRaised} prefix="₹" description="Total secured" icon={DollarSign} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={0.24} />
            </div>

            {/* Revenue Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>Revenue trend (₹ in thousands)</CardDescription>
                  </div>
                  <Link href="/business/analytics">
                    <Button variant="outline" size="sm" className="bg-transparent gap-1 text-xs"><ArrowUpRight className="h-3.5 w-3.5" /> Full Analytics</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={data.revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="businessRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => [`₹${v}K`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#businessRevGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, i) => (
                  <motion.div key={action.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }} whileHover={{ y: -3 }}>
                    <Link href={action.href}>
                      <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-card hover:border-primary/40 hover:bg-muted/20 transition-all cursor-pointer">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg}`}>
                          <action.icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Investor Proposals */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Investor Proposals</CardTitle>
                    <CardDescription>Proposals awaiting your review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.proposals.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No proposals yet</p>
                      ) : data.proposals.map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + i * 0.07 }}
                          className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
                            <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.amount} • {p.type}</p></div>
                          </div>
                          <Badge variant="secondary" className={p.badge === "New" ? "bg-emerald-500/10 text-emerald-600" : ""}>{p.badge}</Badge>
                        </motion.div>
                      ))}
                      <Link href="/business/funding"><Button variant="outline" className="w-full bg-transparent">View All Proposals</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Completion */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Completion</CardTitle>
                    <CardDescription>Complete your profile to attract more investors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-bold text-foreground">75%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                            initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ duration: 1.2, ease: "easeOut" }} />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { label: "Basic Information", done: true },
                          { label: "Business Details", done: true },
                          { label: "Financial Information", done: true },
                          { label: "Document Upload", done: false },
                        ].map(({ label, done }) => (
                          <div key={label} className="flex items-center justify-between text-sm">
                            <span>{done ? "✓" : "•"} {label}</span>
                            <Badge variant="secondary" className={done ? "bg-emerald-500/10 text-emerald-600" : ""}>{done ? "Complete" : "Pending"}</Badge>
                          </div>
                        ))}
                      </div>
                      <Link href="/business/profile"><Button className="w-full">Complete Profile</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
