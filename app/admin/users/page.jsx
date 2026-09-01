"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Clock, Search, Eye, Users, Building2 } from "lucide-react"

const KYC_STYLES = {
  VERIFIED: "bg-emerald-500/10 text-emerald-600",
  PENDING:  "bg-amber-500/10 text-amber-600",
  REJECTED: "bg-red-500/10 text-red-600",
}
const KYC_ICONS = { VERIFIED: CheckCircle2, PENDING: Clock, REJECTED: XCircle }

function ScoreBar({ score }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8 }} />
      </div>
      <span className="text-xs font-medium w-6 text-right">{score}</span>
    </div>
  )
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [kycFilter, setKycFilter] = useState("all")
  const [updating, setUpdating] = useState(null)

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleKyc = async (userId, kycStatus) => {
    setUpdating(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, kycStatus })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: data.data.kycStatus } : u))
        toast({ title: `KYC ${kycStatus === "VERIFIED" ? "Approved" : "Rejected"}`, description: "Status saved to database." })
      }
    } catch {}
    setUpdating(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    const matchKyc = kycFilter === "all" || u.kycStatus === kycFilter
    return matchSearch && matchRole && matchKyc
  })

  const stats = {
    total: users.length,
    verified: users.filter(u => u.kycStatus === "VERIFIED").length,
    pending: users.filter(u => u.kycStatus === "PENDING").length,
    rejected: users.filter(u => u.kycStatus === "REJECTED").length,
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">User Management & KYC</h1>
            <p className="text-muted-foreground mt-1">Verify identities, manage KYC, and profile scoring</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: "Total Users", value: stats.total, Icon: Users, color: "text-primary", bg: "bg-primary/10" },
                { label: "KYC Verified", value: stats.verified, Icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Pending Review", value: stats.pending, Icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Rejected", value: stats.rejected, Icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
              ].map(({ label, value, Icon, color, bg }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                      <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="INVESTOR">Investor</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="KYC Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filtered.length})</CardTitle>
                <CardDescription>Live from PostgreSQL — KYC approvals persist to database</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/30">
                        <tr>
                          {["User", "Role", "KYC Status", "Credit Score", "Joined", "Actions"].map(h => (
                            <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((user, i) => {
                          const KycIcon = KYC_ICONS[user.kycStatus] || Clock
                          const isUpdating = updating === user.id
                          return (
                            <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                              className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                      {user.email.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className={user.role === "INVESTOR" ? "bg-violet-500/10 text-violet-600" : "bg-blue-500/10 text-blue-600"}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={KYC_STYLES[user.kycStatus] || KYC_STYLES.PENDING}>
                                  <KycIcon className="h-3 w-3 mr-1" /> {user.kycStatus}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 w-32">
                                <ScoreBar score={user.creditScore || 50} />
                              </td>
                              <td className="py-3 px-4 text-xs text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString("en-IN")}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  {user.kycStatus === "PENDING" && (
                                    <>
                                      <Button size="sm" variant="outline" disabled={isUpdating}
                                        className="h-7 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                                        onClick={() => handleKyc(user.id, "VERIFIED")}>
                                        {isUpdating ? "..." : "Approve"}
                                      </Button>
                                      <Button size="sm" variant="outline" disabled={isUpdating}
                                        className="h-7 text-xs bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                                        onClick={() => handleKyc(user.id, "REJECTED")}>
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {user.kycStatus === "VERIFIED" && (
                                    <Button size="sm" variant="outline" disabled={isUpdating}
                                      className="h-7 text-xs bg-red-500/10 text-red-600 border-red-500/30"
                                      onClick={() => handleKyc(user.id, "REJECTED")}>
                                      Revoke
                                    </Button>
                                  )}
                                  {user.kycStatus === "REJECTED" && (
                                    <Button size="sm" variant="outline" disabled={isUpdating}
                                      className="h-7 text-xs bg-amber-500/10 text-amber-600 border-amber-500/30"
                                      onClick={() => handleKyc(user.id, "PENDING")}>
                                      Re-review
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                        {filtered.length === 0 && (
                          <tr><td colSpan={6} className="text-center p-8 text-xs text-muted-foreground">No users found</td></tr>
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
    </div>
  )
}
