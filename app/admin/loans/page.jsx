"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, FileText, CheckCircle2, ShieldCheck, HelpCircle, Eye, ArrowRight, Loader2, Landmark } from "lucide-react"

const initialEscrows = [
  { id: "e1", businessName: "Artisan Textiles Co.", campaignTitle: "Handloom Modernization", amount: 1500000, fee: 30000, bankName: "State Bank of India", accountNum: "******48392", ifsc: "SBIN0004930", status: "pending", date: "July 12, 2026" },
  { id: "e2", businessName: "GreenLeaf Organics", campaignTitle: "Organic Spice PROCESSING Unit", amount: 2500000, fee: 50000, bankName: "HDFC Bank", accountNum: "******92842", ifsc: "HDFC0001202", status: "disbursed", date: "June 25, 2026" },
  { id: "e3", businessName: "TechWeave Solutions", campaignTitle: "SME Retail SaaS App", amount: 5000000, fee: 100000, bankName: "ICICI Bank", accountNum: "******19284", ifsc: "ICIC0000392", status: "pending", date: "July 15, 2026" },
]

export default function AdminLoansPage() {
  const { toast } = useToast()
  const [escrows, setEscrows] = useState(initialEscrows)
  const [selected, setSelected] = useState(initialEscrows[0])
  const [loadingId, setLoadingId] = useState(null)

  const handleDisbursement = (id) => {
    setLoadingId(id)
    
    // Simulate API/Payment Gateway latency
    setTimeout(() => {
      setEscrows(prev =>
        prev.map(e => (e.id === id ? { ...e, status: "disbursed" } : e))
      )
      if (selected?.id === id) {
        setSelected(prev => ({ ...prev, status: "disbursed" }))
      }
      setLoadingId(null)
      toast({
        title: "Disbursement Complete",
        description: `Funds successfully transferred to ${escrows.find(e => e.id === id).businessName}'s bank account.`,
      })
    }, 2000)
  }

  const badgeStyles = {
    pending: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    disbursed: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Loan Disbursements & Escrow</h1>
            <p className="text-muted-foreground mt-1">Audit escrow accounts and execute capital disbursements for successfully funded campaigns</p>
          </div>

          <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: "Total Platform Disbursements", value: "₹65,000,000", icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Escrow Held (Awaiting Release)", value: "₹6,500,000", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Platform Fees Collected (2%)", value: "₹1,300,000", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
              ].map(({ label, value, icon: Icon, color, bg }, idx) => (
                <Card key={idx}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}><Icon className={`h-6 w-6 ${color}`} /></div>
                    <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Escrows list */}
              <div className="space-y-4 lg:col-span-1">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Escrow Ledger</h2>
                <div className="space-y-3">
                  {escrows.map((escrow, idx) => (
                    <motion.div
                      key={escrow.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelected(escrow)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selected?.id === escrow.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/40 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-xs text-foreground truncate max-w-40">{escrow.businessName}</p>
                        <Badge className={`text-[9px] ${badgeStyles[escrow.status]}`}>{escrow.status}</Badge>
                      </div>
                      <p className="text-lg font-bold text-foreground">₹{(escrow.amount / 100000).toFixed(1)}L</p>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
                        <span>Fee: ₹{escrow.fee.toLocaleString()}</span>
                        <span>{escrow.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Detail audit */}
              <div className="lg:col-span-2">
                {selected ? (
                  <Card className="border-primary/20 bg-card">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle>Disbursement Audit</CardTitle>
                          <CardDescription>Escrow ID: ESC-{selected.id.toUpperCase()}</CardDescription>
                        </div>
                        <Badge className={`text-xs px-2.5 py-1 ${badgeStyles[selected.status]}`}>
                          {selected.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Breakdown list */}
                      <div className="border border-border rounded-xl p-4 space-y-2.5 text-xs bg-muted/20">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MSME Recipient</span>
                          <span className="font-semibold text-foreground">{selected.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fundraising Campaign</span>
                          <span className="font-semibold text-foreground">{selected.campaignTitle}</span>
                        </div>
                        <div className="flex justify-between border-t border-border/50 pt-2">
                          <span className="text-muted-foreground">Gross Capital Raised</span>
                          <span className="font-bold text-foreground">₹{selected.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>Platform Service Fee (2%)</span>
                          <span className="font-bold">-₹{selected.fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-sm">
                          <span className="font-bold text-foreground">Net Payout Amount</span>
                          <span className="font-extrabold text-primary">₹{(selected.amount - selected.fee).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Bank routing */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Bank Routing Details</h3>
                        <div className="p-4 border border-border bg-card rounded-xl text-xs space-y-2">
                          <div className="flex justify-between"><span>Bank Name</span><span className="font-semibold text-foreground">{selected.bankName}</span></div>
                          <div className="flex justify-between"><span>Account Number</span><span className="font-mono font-semibold text-foreground">{selected.accountNum}</span></div>
                          <div className="flex justify-between"><span>IFSC Code</span><span className="font-mono font-semibold text-foreground">{selected.ifsc}</span></div>
                          <div className="p-2 border border-emerald-500/10 bg-emerald-500/5 rounded-lg flex items-center gap-2 text-emerald-700 mt-1">
                            <ShieldCheck className="h-4 w-4" /> Account verification check passed. Penny-drop audit matching owner name.
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-border pt-4">
                        {selected.status === "pending" ? (
                          <Button
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white"
                            onClick={() => handleDisbursement(selected.id)}
                            disabled={loadingId !== null}
                          >
                            {loadingId === selected.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Transferring via Escrow Gateways...
                              </>
                            ) : (
                              <>
                                <Landmark className="h-4 w-4 mr-2" /> Execute Escrow Disbursement
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="p-3 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> Funds successfully disbursed. Ledger settlement transaction logged under escrow network indices.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                    Select a disbursement audit ticket from the left list to review bank credentials
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
