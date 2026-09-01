"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserSidebar from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { DollarSign, Building2, Calendar, FileText, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react"

const STATUS_BADGES = {
  active:    "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  completed: "bg-gray-500/10 text-gray-600 border border-gray-500/20",
  escrow:    "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  defaulted: "bg-red-500/10 text-red-600 border border-red-500/20",
}

export default function InvestmentsPage() {
  const { user } = useAuth()
  const [investments, setInvestments] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/investments?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.investments.length > 0) {
            setInvestments(data.data.investments)
            setSelected(data.data.investments[0])
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  const totalInvested = investments.reduce((s, i) => s + i.invested, 0)
  const totalReturned = investments.reduce((s, i) => s + i.returned, 0)
  const avgYield = investments.length > 0
    ? (investments.reduce((s, i) => s + i.roi, 0) / investments.length).toFixed(1)
    : "0.0"

  if (loading) return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading your portfolio...</div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">My Investments</h1>
            <p className="text-muted-foreground mt-1">Track payouts, returns, and milestone vettings — live from database</p>
          </div>

          <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: "Active Portfolio", value: `₹${(totalInvested / 100000).toFixed(2)}L`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
                { label: "Capital Returned", value: `₹${(totalReturned / 100000).toFixed(2)}L`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Investments Made", value: investments.length, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Average Yield", value: `${avgYield}%`, icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
              ].map(({ label, value, icon: Icon, color, bg }, idx) => (
                <Card key={idx}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                    <div><p className="text-xl font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {investments.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground font-medium">No investments yet</p>
                <p className="text-xs text-muted-foreground mt-1">Browse campaigns and invest to see your portfolio here.</p>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: list */}
                <div className="space-y-4 lg:col-span-1">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Asset Allocation</h2>
                  <div className="space-y-3">
                    {investments.map((inv, idx) => {
                      const pct = Math.min((inv.returned / Math.max(inv.cap, 1)) * 100, 100)
                      return (
                        <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelected(inv)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selected?.id === inv.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/20"
                          }`}>
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-sm truncate">{inv.name}</p>
                            <Badge variant="secondary" className={`text-[10px] ${STATUS_BADGES[inv.status] || STATUS_BADGES.active}`}>{inv.status}</Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>₹{(inv.invested / 1000).toFixed(0)}K invested</span>
                            <span>{pct.toFixed(0)}% paid</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Right: detail */}
                <div className="lg:col-span-2 space-y-6">
                  <AnimatePresence mode="wait">
                    {selected && (
                      <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <Card className="border-primary/20">
                          <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <CardTitle>{selected.name}</CardTitle>
                                <CardDescription>{selected.sector} • {selected.model}</CardDescription>
                              </div>
                              <Badge className={`text-xs px-2.5 py-1 ${STATUS_BADGES[selected.status] || STATUS_BADGES.active}`}>
                                {selected.status?.toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid gap-4 grid-cols-3 bg-muted/20 rounded-xl p-4 border border-border text-xs">
                              <div><p className="text-muted-foreground">Invested</p><p className="text-base font-bold mt-0.5">₹{selected.invested.toLocaleString()}</p></div>
                              <div><p className="text-muted-foreground">Repaid</p><p className="text-base font-bold text-emerald-500 mt-0.5">₹{selected.returned.toLocaleString()}</p></div>
                              <div><p className="text-muted-foreground">Cap</p><p className="text-base font-bold text-primary mt-0.5">₹{selected.cap.toLocaleString()}</p></div>
                            </div>

                            {selected.status === "active" && selected.nextAmount > 0 && (
                              <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-700 dark:text-blue-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span>Next expected return on <strong>{selected.nextPayout}</strong></span>
                                </div>
                                <span className="font-bold text-sm text-foreground">₹{selected.nextAmount.toLocaleString()}</span>
                              </div>
                            )}

                            <div className="grid gap-6 md:grid-cols-2">
                              {/* Ledger */}
                              <div className="space-y-2">
                                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Payment Ledger</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {selected.schedule.length === 0 ? (
                                    <div className="text-center text-xs text-muted-foreground p-6 border border-dashed border-border rounded-lg">
                                      Escrow active. Ledger begins upon full campaign funding.
                                    </div>
                                  ) : selected.schedule.map((pmt, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2.5 border border-border rounded-lg text-xs bg-card">
                                      <span className="text-muted-foreground font-medium">{pmt.month}</span>
                                      <div className="flex gap-2 items-center">
                                        {pmt.status === "credited" ? (
                                          <><span className="font-bold">₹{pmt.amount.toLocaleString()}</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px]">credited</Badge></>
                                        ) : pmt.status === "upcoming" ? (
                                          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px]">upcoming</Badge>
                                        ) : (
                                          <><span className="text-red-500 font-bold">—</span>
                                            <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] flex gap-0.5 items-center">
                                              <AlertTriangle className="h-2.5 w-2.5" /> missed
                                            </Badge></>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Milestones */}
                              <div className="space-y-2">
                                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Campaign Milestones</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {selected.milestones.map((m, idx) => (
                                    <div key={idx} className="flex gap-2 p-2.5 border border-border rounded-lg text-xs bg-card">
                                      {m.done
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        : <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                                      <span className={m.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}>{m.desc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
