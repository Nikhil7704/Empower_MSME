"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BusinessSidebar from "@/components/business-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, FileText, CheckCircle2, XCircle, ArrowUpRight, TrendingUp, Calendar, AlertCircle } from "lucide-react"

const initialProposals = [
  {
    id: "p1",
    investor: "Sunrise Capital",
    type: "Revenue-Based",
    amount: 1000000,
    rate: "8.0% revenue share",
    cap: "1.30x (₹13L cap)",
    status: "new",
    date: "July 15, 2026",
    notes: "Requires monthly revenue reports. No collateral needed. Subject to standard KYC confirmation.",
  },
  {
    id: "p2",
    investor: "Growth Fund India",
    type: "Fixed EMI",
    amount: 1500000,
    rate: "12.0% p.a.",
    cap: "24 months tenure",
    status: "new",
    date: "July 14, 2026",
    notes: "Requires corporate guarantee. EMI = ₹69,200/month. Standard bank charges apply.",
  },
  {
    id: "p3",
    investor: "Angel Syndicate (Ankit Joshi)",
    type: "Revenue-Based",
    amount: 500000,
    rate: "6.0% revenue share",
    cap: "1.25x (₹6.25L cap)",
    status: "new",
    date: "July 12, 2026",
    notes: "Flexible repayment terms. Prefers mentoring relationship. No early repayment penalty.",
  },
]

export default function BusinessFundingPage() {
  const { toast } = useToast()
  const [proposals, setProposals] = useState(initialProposals)
  const [selected, setSelected] = useState(initialProposals[0])

  const handleAction = (id, newStatus) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, status: newStatus }
          if (selected?.id === id) {
            setSelected(updated)
          }
          return updated
        }
        return p
      })
    )

    toast({
      title: newStatus === "accepted" ? "Proposal Accepted" : "Proposal Declined",
      description: `You have successfully ${newStatus} the offer from ${
        proposals.find(p => p.id === id).investor
      }.`,
      variant: newStatus === "accepted" ? "default" : "destructive",
    })
  }

  const badgeColors = {
    new: "bg-blue-500/10 text-blue-600",
    accepted: "bg-emerald-500/10 text-emerald-600",
    declined: "bg-red-500/10 text-red-600",
  }

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Funding & Proposals</h1>
            <p className="text-muted-foreground mt-1">Review and manage terms sheets submitted by investors and lenders</p>
          </div>

          <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Summary Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: "Total Proposals", value: proposals.length, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                { label: "New Offers", value: proposals.filter(p => p.status === "new").length, icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Accepted", value: proposals.filter(p => p.status === "accepted").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Declined", value: proposals.filter(p => p.status === "declined").length, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
              ].map(({ label, value, icon: Icon, color, bg }, idx) => (
                <Card key={idx}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                    <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Proposals List */}
              <div className="space-y-4 lg:col-span-1">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Offers Received</h2>
                <div className="space-y-3">
                  {proposals.map((proposal, idx) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelected(proposal)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selected?.id === proposal.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/40 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-foreground truncate">{proposal.investor}</p>
                        <Badge variant="secondary" className={badgeColors[proposal.status]}>
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-primary">₹{(proposal.amount / 100000).toFixed(1)}L</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>{proposal.type}</span>
                        <span>{proposal.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Proposal Detail View */}
              <div className="lg:col-span-2 space-y-6">
                {selected ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <Card className="border-primary/20">
                        <CardHeader>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <CardTitle>{selected.investor}</CardTitle>
                              <CardDescription>Submitted on {selected.date}</CardDescription>
                            </div>
                            <Badge className={`text-sm px-3 py-1 ${badgeColors[selected.status]}`}>
                              {selected.status.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Financials Box */}
                          <div className="grid gap-4 sm:grid-cols-3 bg-muted/20 rounded-xl p-4 border border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Offered Funding</p>
                              <p className="text-2xl font-extrabold text-foreground mt-0.5">₹{(selected.amount / 100000).toFixed(1)} Lakh</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Rate / Pricing</p>
                              <p className="text-lg font-bold text-primary mt-1">{selected.rate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Repayment Cap / Tenure</p>
                              <p className="text-lg font-bold text-primary mt-1">{selected.cap}</p>
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm">Offer Details & Covenants</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selected.notes}</p>
                          </div>

                          {/* Key benefits highlight */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Collateral-Free</p>
                                <p className="text-[10px] text-muted-foreground">No assets or properties required to back this funding.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-500/10 bg-blue-500/5">
                              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Flexible Repayments</p>
                                <p className="text-[10px] text-muted-foreground">Repayment index matches seasonal cashflow volatility.</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {selected.status === "new" && (
                            <div className="flex gap-4 pt-4 border-t border-border">
                              <Button
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white"
                                onClick={() => handleAction(selected.id, "accepted")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Proposal
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => handleAction(selected.id, "declined")}
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Decline Proposal
                              </Button>
                            </div>
                          )}

                          {selected.status === "accepted" && (
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-5 w-5" /> Terms accepted! Preparing legal contract and escrow accounts.
                            </div>
                          )}

                          {selected.status === "declined" && (
                            <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
                              <XCircle className="h-5 w-5" /> You declined this proposal. You can still accept other offers.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <Card className="h-full flex items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                    Select a proposal from the left list to view terms and take action
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

