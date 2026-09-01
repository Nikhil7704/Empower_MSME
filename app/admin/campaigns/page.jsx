"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, Search, Filter, ShieldAlert, Award, FileText, CheckCircle2, AlertTriangle, Play, Pause, Clock } from "lucide-react"

const initialCampaigns = [
  { id: "c1", title: "Organic Spice Processing Expansion", businessName: "GreenLeaf Organics", sector: "Agriculture", goal: 2500000, risk: "Low", roi: 14.5, model: "Revenue-Share (8%)", status: "active", submittedDate: "July 01, 2026" },
  { id: "c2", title: "SaaS Platform for Retail Inventory", businessName: "TechWeave Solutions", sector: "Technology", goal: 5000000, risk: "Medium", roi: 18.0, model: "Fixed EMI (24mo)", status: "active", submittedDate: "July 03, 2026" },
  { id: "c3", title: "Rooftop Solar Installation for SMEs", businessName: "Solar Ease Energy", sector: "Energy", goal: 3000000, risk: "Low", roi: 12.0, model: "Revenue-Share (5%)", status: "pending", submittedDate: "July 12, 2026" },
  { id: "c4", title: "Machinery Modernization", businessName: "Artisan Textiles Co.", sector: "Manufacturing", goal: 1500000, risk: "Low", roi: 12.0, model: "Revenue-Share (6%)", status: "funded", submittedDate: "June 20, 2026" },
  { id: "c5", title: "Automated Bakery Ovens Procurement", businessName: "Sunrise Bakers", sector: "Food & Beverage", goal: 800000, risk: "High", roi: 19.5, model: "Fixed EMI (12mo)", status: "pending", submittedDate: "July 15, 2026" },
]

export default function AdminCampaignsPage() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [selected, setSelected] = useState(initialCampaigns[2]) // Default to Solar Ease
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleStatusChange = (id, newStatus) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    )
    if (selected?.id === id) {
      setSelected(prev => ({ ...prev, status: newStatus }))
    }

    toast({
      title: `Campaign ${newStatus === "active" ? "Published" : "Flagged"}`,
      description: `${campaigns.find(c => c.id === id).title} is now ${newStatus}.`,
      variant: newStatus === "active" ? "default" : "destructive",
    })
  }

  const filtered = campaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.businessName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusColors = {
    active: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    pending: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    funded: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    flagged: "bg-red-500/10 text-red-600 border border-red-500/20",
  }

  const riskColors = {
    Low: "bg-emerald-500/10 text-emerald-600",
    Medium: "bg-amber-500/10 text-amber-600",
    High: "bg-red-500/10 text-red-600",
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Campaign Moderation</h1>
            <p className="text-muted-foreground mt-1">Review active, pending, and flagged fundraising campaigns for retail safety</p>
          </div>

          <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Summary cards */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: "Total Campaigns", value: campaigns.length, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                { label: "Pending Vetting", value: campaigns.filter(c => c.status === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Active Listings", value: campaigns.filter(c => c.status === "active").length, icon: Play, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Flagged / Paused", value: campaigns.filter(c => c.status === "flagged").length, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
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
              {/* Campaigns list */}
              <div className="space-y-4 lg:col-span-1">
                <div className="flex gap-2 flex-col">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search campaigns..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {["all", "pending", "active", "funded", "flagged"].map(st => (
                      <Button
                        key={st}
                        variant={filterStatus === st ? "default" : "outline"}
                        className="text-[10px] px-2.5 h-6 capitalize"
                        onClick={() => setFilterStatus(st)}
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filtered.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                        selected?.id === c.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-xs text-foreground truncate max-w-40">{c.title}</h3>
                        <Badge className={`text-[9px] ${statusColors[c.status]}`}>{c.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="font-bold text-primary">₹{(c.goal / 100000).toFixed(1)}L</span>
                        <span className="text-[10px] text-muted-foreground">{c.submittedDate}</span>
                      </div>
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground p-6">
                      No matching campaigns
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed View */}
              <div className="lg:col-span-2">
                {selected ? (
                  <Card className="border-primary/20 bg-card">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg leading-snug">{selected.title}</CardTitle>
                          <CardDescription>Submitted by: {selected.businessName} • Sector: {selected.sector}</CardDescription>
                        </div>
                        <Badge className={`text-xs px-2.5 py-1 ${statusColors[selected.status]}`}>
                          {selected.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Financials details */}
                      <div className="grid gap-4 grid-cols-4 bg-muted/20 border border-border p-3.5 rounded-xl text-xs">
                        <div>
                          <p className="text-muted-foreground">Funding Target</p>
                          <p className="font-bold text-foreground mt-0.5">₹{selected.goal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Rating</p>
                          <Badge variant="secondary" className={`font-semibold mt-0.5 ${riskColors[selected.risk]}`}>{selected.risk}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Repayment Model</p>
                          <p className="font-bold text-foreground mt-0.5 truncate">{selected.model}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected Yield</p>
                          <p className="font-bold text-emerald-500 mt-0.5">{selected.roi}% p.a.</p>
                        </div>
                      </div>

                      {/* Vetting Checklist */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Compliance Checklist</h3>
                        <div className="space-y-2">
                          {[
                            { label: "Business Owner Identity (KYC Verified)", checked: true },
                            { label: "Udyam Registry Verification", checked: true },
                            { label: "GST filing compliance score check", checked: true },
                            { label: "Audited Financial balance sheet check", checked: selected.id !== "c5" }, // Sunrise Bakers is high risk with audits pending
                          ].map((check, i) => (
                            <div key={i} className="flex gap-2.5 items-start p-2.5 border border-border rounded-lg text-xs bg-card">
                              {check.checked ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={check.checked ? "text-muted-foreground" : "text-foreground font-medium"}>
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 border-t border-border pt-4">
                        {selected.status === "pending" && (
                          <>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(selected.id, "active")}>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Publish
                            </Button>
                            <Button variant="outline" className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10" onClick={() => handleStatusChange(selected.id, "flagged")}>
                              <ShieldAlert className="h-4 w-4 mr-1.5" /> Flag Campaign
                            </Button>
                          </>
                        )}

                        {selected.status === "active" && (
                          <Button variant="outline" className="flex-1 text-amber-500 border-amber-500/20" onClick={() => handleStatusChange(selected.id, "flagged")}>
                            <Pause className="h-4 w-4 mr-1.5" /> Pause Campaign
                          </Button>
                        )}

                        {selected.status === "flagged" && (
                          <Button className="flex-1" onClick={() => handleStatusChange(selected.id, "active")}>
                            Re-Approve Campaign
                          </Button>
                        )}

                        {selected.status === "funded" && (
                          <div className="p-3 text-center w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 text-xs font-semibold">
                            ✓ This campaign has reached its funding goal.escrow disbursements can be audited in the Loans tab.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                    Select a campaign listing from the left to moderate
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
