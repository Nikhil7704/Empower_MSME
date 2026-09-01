"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Building2, Search, Eye, CheckCircle2, XCircle, Clock, FileText } from "lucide-react"

const KYC_BADGE = {
  VERIFIED: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  PENDING:  "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border border-red-500/20",
}

export default function AdminBusinessesPage() {
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [filterKyc, setFilterKyc] = useState("all")
  const [updating, setUpdating] = useState(null)

  const loadBusinesses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/businesses")
      const data = await res.json()
      if (data.success) setBusinesses(data.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadBusinesses() }, [loadBusinesses])

  const handleKyc = async (userId, kycStatus) => {
    setUpdating(userId)
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, kycStatus })
      })
      const data = await res.json()
      if (data.success) {
        setBusinesses(prev => prev.map(b => b.userId === userId ? { ...b, kycStatus: data.data.kycStatus } : b))
        if (selected?.userId === userId) setSelected(s => ({ ...s, kycStatus: data.data.kycStatus }))
        toast({
          title: `KYC ${kycStatus === "VERIFIED" ? "Approved" : "Rejected"}`,
          description: "Status persisted to database successfully.",
          variant: kycStatus === "VERIFIED" ? "default" : "destructive"
        })
      }
    } catch {}
    setUpdating(null)
  }

  const filtered = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase())
    const matchKyc = filterKyc === "all" || b.kycStatus === filterKyc
    return matchSearch && matchKyc
  })

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Business Verification</h1>
            <p className="text-muted-foreground mt-1">Review MSME registrations and manage KYC — all actions persist to database</p>
          </div>

          <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by company or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {["all", "PENDING", "VERIFIED", "REJECTED"].map(status => (
                  <Button key={status} variant={filterKyc === status ? "default" : "outline"}
                    className="text-xs bg-transparent capitalize" onClick={() => setFilterKyc(status)}>
                    {status === "all" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">Loading businesses...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/30">
                        <tr>
                          {["Business", "Sector / Location", "Udyam ID", "Credit Score", "KYC Status", "Actions"].map(h => (
                            <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(biz => (
                          <tr key={biz.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-4 font-semibold text-foreground">
                              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> {biz.name}</div>
                              <p className="text-xs text-muted-foreground font-normal">{biz.email}</p>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">{biz.sector} • {biz.location}</td>
                            <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{biz.udyamId}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary" className="font-semibold">{biz.creditScore}/1000</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary" className={`text-xs ${KYC_BADGE[biz.kycStatus] || KYC_BADGE.PENDING}`}>{biz.kycStatus}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent gap-1"
                                onClick={() => setSelected(biz)}>
                                <Eye className="h-3.5 w-3.5" /> Audit
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr><td colSpan={6} className="text-center p-8 text-xs text-muted-foreground">No matching businesses found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Audit Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>{selected.name}</DialogTitle>
                  <DialogDescription className="text-xs">{selected.udyamId} • {selected.sector}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-xl border border-border text-xs">
                <div><p className="text-muted-foreground">Location</p><p className="font-semibold">{selected.location}</p></div>
                <div><p className="text-muted-foreground">Employees</p><p className="font-semibold">{selected.employees}</p></div>
                <div><p className="text-muted-foreground">Campaigns</p><p className="font-semibold">{selected.campaignCount}</p></div>
                <div><p className="text-muted-foreground">Total Raised</p><p className="font-semibold text-emerald-500">₹{(selected.totalRaised/100000).toFixed(1)}L</p></div>
                <div><p className="text-muted-foreground">Credit Score</p><p className="font-semibold text-primary">{selected.creditScore}/1000</p></div>
                <div><p className="text-muted-foreground">Current KYC</p>
                  <Badge variant="secondary" className={`text-xs ${KYC_BADGE[selected.kycStatus] || KYC_BADGE.PENDING}`}>{selected.kycStatus}</Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelected(null)}>Close</Button>
                {selected.kycStatus === "PENDING" && (
                  <>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating === selected.userId}
                      onClick={() => handleKyc(selected.userId, "VERIFIED")}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> {updating === selected.userId ? "Saving..." : "Approve KYC"}
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10" disabled={updating === selected.userId}
                      onClick={() => handleKyc(selected.userId, "REJECTED")}>
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                  </>
                )}
                {selected.kycStatus === "VERIFIED" && (
                  <Button variant="outline" className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10" disabled={updating === selected.userId}
                    onClick={() => handleKyc(selected.userId, "REJECTED")}>
                    Revoke Verification
                  </Button>
                )}
                {selected.kycStatus === "REJECTED" && (
                  <Button className="flex-1" disabled={updating === selected.userId}
                    onClick={() => handleKyc(selected.userId, "PENDING")}>
                    Re-submit for Review
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
