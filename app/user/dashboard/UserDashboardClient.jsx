"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import UserSidebar from "@/components/user-sidebar"
import GlobalFooter from "@/components/global-footer"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Building2, TrendingUp, DollarSign, BarChart3, ArrowRight, Bell, Star } from "lucide-react"

export default function UserDashboardClient() {
  const { user } = useAuth()
  const [data, setData] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    activeCount: 0,
    portfolioData: [],
    investments: [],
    notifications: []
  })

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/analytics/user?userId=${user.id}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) setData(res.data)
        })
    }
  }, [user])

  const totalROI = data.totalInvested > 0 
    ? ((data.totalCurrentValue - data.totalInvested) / data.totalInvested * 100).toFixed(1)
    : "0.0"

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Investor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your portfolio performance and investment opportunities</p>
          </div>

          <div className="p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Total Invested" value={data.totalInvested} prefix="₹" description={`Across ${data.investments.length} campaigns`} icon={DollarSign} iconColor="text-primary" iconBg="bg-primary/10" delay={0} />
              <MetricCard title="Portfolio Value" value={data.totalCurrentValue} prefix="₹" change={Number(totalROI)} description="Current market value" icon={TrendingUp} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" delay={0.08} />
              <MetricCard title="Avg ROI" value={Number(totalROI)} suffix="%" description="Across all investments" icon={BarChart3} iconColor="text-violet-500" iconBg="bg-violet-500/10" delay={0.16} decimals={1} />
              <MetricCard title="Active Investments" value={data.activeCount} description="Currently active" icon={Building2} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={0.24} />
            </div>

            {/* Portfolio Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Portfolio Value Growth</CardTitle>
                    <CardDescription>Cumulative investment value over time (₹)</CardDescription>
                  </div>
                  <Link href="/user/analytics">
                    <Button variant="outline" size="sm" className="bg-transparent gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Full Analytics</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.portfolioData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={v => [`₹${v.toLocaleString()}`, "Portfolio Value"]} />
                      <Area type="monotone" dataKey="value" name="Value" stroke="#8b5cf6" fill="url(#portfolioGrad)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Investment Portfolio */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Portfolio</CardTitle>
                      <CardDescription>Active and completed investments</CardDescription>
                    </div>
                    <Link href="/user/campaigns">
                      <Button size="sm" className="text-xs gap-1"><Star className="h-3 w-3" /> Invest More</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.investments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No investments yet</p>
                      ) : data.investments.map((inv, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.07 }}
                          className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-4 w-4 text-primary" /></div>
                            <div>
                              <p className="font-medium text-sm">{inv.name}</p>
                              <p className="text-xs text-muted-foreground">{inv.sector}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-500">+{inv.roi}% ROI</p>
                            <Badge variant="secondary" className={`text-xs ${inv.status === "completed" ? "bg-gray-500/10 text-gray-600" : "bg-emerald-500/10 text-emerald-600"}`}>{inv.status}</Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notifications */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div><CardTitle>Notifications</CardTitle><CardDescription>Recent updates and alerts</CardDescription></div>
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No new notifications</p>
                      ) : data.notifications.map((n, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                          className="flex items-start gap-3 p-3 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                          <Badge variant="secondary" className={`text-xs flex-shrink-0 ${n.color}`}>{n.badge}</Badge>
                          <div>
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
        <GlobalFooter />
      </div>
    </div>
  )
}
