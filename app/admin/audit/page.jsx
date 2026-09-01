"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Activity, Search, Download, Clock, User, ShieldAlert, CheckCircle2, AlertTriangle, Shield, Eye } from "lucide-react"

const initialLogs = [
  { id: "a1", action: "KYC Document Approved", user: "admin@empowermsme.com", ip: "103.21.244.18", timestamp: "2026-07-17 19:40:12", category: "KYC", status: "success", meta: { business: "GreenLeaf Organics", approvedDocs: ["Udyam_Certificate.pdf"], auditor: "Admin #1" } },
  { id: "a2", action: "Escrow Release Triggered", user: "admin@empowermsme.com", ip: "103.21.244.18", timestamp: "2026-07-17 18:22:45", category: "Financial", status: "success", meta: { recipient: "Artisan Textiles Co.", amount: 1500000, platformFee: 30000, bankRef: "FT9483011A" } },
  { id: "a3", action: "Failed Login Attempt", user: "unknown@attacker.ru", ip: "185.220.101.44", timestamp: "2026-07-17 17:58:11", category: "Security", status: "warning", meta: { attemptedUsername: "administrator", reason: "Invalid credential signature", origin: "Moscow, RU" } },
  { id: "a4", action: "Campaign Created", user: "priya@greenleaf.com", ip: "49.43.22.89", timestamp: "2026-07-17 14:32:05", category: "Financial", status: "info", meta: { title: "Spice Processing Expansion", goal: 2500000, model: "RBF" } },
  { id: "a5", action: "User Account Suspended", user: "admin@empowermsme.com", ip: "103.21.244.18", timestamp: "2026-07-17 11:15:08", category: "Security", status: "danger", meta: { suspendedUser: "spam_user@fake.com", reason: "Multiple flagged campaign reports" } },
  { id: "a6", action: "MFA Authentication Successful", user: "ankit.investor@gmail.com", ip: "106.76.33.102", timestamp: "2026-07-17 09:22:10", category: "Auth", status: "success", meta: { method: "TOTP OTP Code", device: "Safari / iPhone 15" } },
  { id: "a7", action: "IP Address Auto-Blocked", user: "System Guard", ip: "185.220.101.44", timestamp: "2026-07-17 08:00:00", category: "Security", status: "danger", meta: { blockDuration: "24 Hours", reason: "Rate limit threshold breached (10+ failures)" } },
]

export default function AdminAuditPage() {
  const { toast } = useToast()
  const [logs] = useState(initialLogs)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("all")

  const handleExport = () => {
    toast({
      title: "Logs Exported",
      description: "CSV dump of system audit indices compiled successfully.",
    })
  }

  const filtered = logs.filter(l => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.ip.includes(search)
    const matchCat = filterCat === "all" || l.category === filterCat
    return matchSearch && matchCat
  })

  const statusBadges = {
    success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-600 border border-red-500/20",
    info: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Immutable Audit Logs</h1>
                  <p className="text-muted-foreground mt-0.5">Chronological system ledger tracking platform access and operational compliance events</p>
                </div>
              </div>
              <Button variant="outline" className="bg-transparent gap-1.5" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export Logs
              </Button>
            </div>
          </div>

          <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by action, user, or IP address..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {["all", "Auth", "KYC", "Financial", "Security"].map(cat => (
                  <Button
                    key={cat}
                    variant={filterCat === cat ? "default" : "outline"}
                    className="text-xs bg-transparent capitalize h-9 px-3"
                    onClick={() => setFilterCat(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        {["Timestamp", "Category", "Event / Action", "Triggered By", "IP Address", "Severity", "Audit"].map(h => (
                          <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(log => (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors text-xs">
                          <td className="py-3 px-4 text-muted-foreground font-mono">
                            {log.timestamp}
                          </td>
                          <td className="py-3 px-4 font-semibold text-primary">
                            {log.category}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground truncate max-w-36">
                            {log.user}
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground">
                            {log.ip}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`text-[10px] uppercase font-bold ${statusBadges[log.status]}`}>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelected(log)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-xs text-muted-foreground">
                            No compliance records matched
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Badge variant="secondary" className="text-xs">{selected.category}</Badge>
                  <DialogTitle className="text-lg font-bold mt-2">{selected.action}</DialogTitle>
                </div>
                <Badge className={`text-xs uppercase font-bold ${statusBadges[selected.status]}`}>
                  {selected.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="space-y-2 border border-border bg-muted/20 p-3.5 rounded-xl text-xs">
                <div className="flex justify-between"><span>Record Time</span><span className="font-mono text-foreground font-semibold">{selected.timestamp}</span></div>
                <div className="flex justify-between"><span>Issuer User</span><span className="text-foreground font-semibold">{selected.user}</span></div>
                <div className="flex justify-between"><span>Routing IP</span><span className="font-mono text-foreground font-semibold">{selected.ip}</span></div>
                <div className="flex justify-between"><span>Audit Index</span><span className="font-mono text-primary font-semibold">AUD-{selected.id.toUpperCase()}</span></div>
              </div>

              {/* Metadata JSON display */}
              <div>
                <p className="font-bold text-muted-foreground uppercase tracking-wider mb-2">Event Metadata Context</p>
                <div className="p-3 bg-muted border border-border rounded-xl font-mono text-[10px] leading-relaxed whitespace-pre bg-card">
                  {JSON.stringify(selected.meta, null, 2)}
                </div>
              </div>

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 rounded-lg flex gap-2 items-center">
                <ShieldCheck className="h-4.5 w-4.5" /> Log sealed securely under tamper-proof system audit indexes.
              </div>

              <Button className="w-full bg-transparent border border-border" variant="outline" onClick={() => setSelected(null)}>Close Audit File</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
