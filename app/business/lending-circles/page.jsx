"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import BusinessSidebar from "@/components/business-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Shield, Star, CheckCircle2, Clock, Plus, Trophy, ArrowRight } from "lucide-react"

const defaultCircles = [
  {
    id: "lc1", name: "TechHub Founders Circle", members: 8, maxMembers: 10,
    contribution: 10000, totalPool: 80000, currentRound: 5, totalRounds: 10,
    myTurn: 9, status: "active", category: "Technology",
    members_list: [
      { name: "Priya M.", trustScore: 92, contributed: true, turn: 1, initials: "PM" },
      { name: "Rahul S.", trustScore: 88, contributed: true, turn: 2, initials: "RS" },
      { name: "Anita K.", trustScore: 95, contributed: true, turn: 3, initials: "AK" },
      { name: "Vikram J.", trustScore: 78, contributed: true, turn: 4, initials: "VJ" },
      { name: "Sneha T.", trustScore: 91, contributed: false, turn: 5, initials: "ST" },
      { name: "Dev P.", trustScore: 85, contributed: false, turn: 6, initials: "DP" },
      { name: "Meena R.", trustScore: 89, contributed: false, turn: 7, initials: "MR" },
      { name: "You", trustScore: 87, contributed: false, turn: 9, initials: "ME" },
    ],
  },
  {
    id: "lc2", name: "Women Entrepreneurs Sahayak", members: 12, maxMembers: 12,
    contribution: 5000, totalPool: 60000, currentRound: 8, totalRounds: 12,
    myTurn: 11, status: "active", category: "Mixed",
    members_list: [],
  },
]

const rotationHistory = [
  { round: 1, recipient: "Priya M.", amount: 80000, date: "Oct 2025", status: "completed" },
  { round: 2, recipient: "Rahul S.", amount: 80000, date: "Nov 2025", status: "completed" },
  { round: 3, recipient: "Anita K.", amount: 80000, date: "Dec 2025", status: "completed" },
  { round: 4, recipient: "Vikram J.", amount: 80000, date: "Jan 2026", status: "completed" },
  { round: 5, recipient: "Sneha T.", amount: 80000, date: "Feb 2026", status: "current" },
  { round: 6, recipient: "Dev P.", amount: 80000, date: "Mar 2026", status: "upcoming" },
]

function TrustScoreBadge({ score }) {
  const color = score >= 90 ? "text-emerald-500" : score >= 80 ? "text-blue-500" : score >= 70 ? "text-amber-500" : "text-red-500"
  const bg = score >= 90 ? "bg-emerald-500/10" : score >= 80 ? "bg-blue-500/10" : score >= 70 ? "bg-amber-500/10" : "bg-red-500/10"
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${color}`}>
      <Shield className="h-3 w-3" /> {score}
    </div>
  )
}

export default function LendingCirclesPage() {
  const [circles, setCircles] = useState([])
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [form, setForm] = useState({ name: "", maxMembers: "10", contribution: "10000", category: "Mixed" })

  const loadCircles = async () => {
    try {
      const res = await fetch("/api/lending-circles")
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setCircles(data.data)
        setSelectedCircle(data.data[0])
      } else {
        // Fallback
        setCircles(defaultCircles)
        setSelectedCircle(defaultCircles[0])
      }
    } catch {
      setCircles(defaultCircles)
      setSelectedCircle(defaultCircles[0])
    }
  }

  useEffect(() => {
    loadCircles()
  }, [])

  const handleCreate = async () => {
    if (!form.name || !form.maxMembers || !form.contribution) return
    setLoading(true)
    try {
      const res = await fetch("/api/lending-circles", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          maxMembers: Number(form.maxMembers),
          contribution: Number(form.contribution),
          category: form.category,
        }),
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()
      if (data.success) {
        setCircles(prev => [data.data, ...prev])
        setSelectedCircle(data.data)
        setShowCreate(false)
        setForm({ name: "", maxMembers: "10", contribution: "10000", category: "Mixed" })
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">P2P Lending Circles</h1>
                <p className="text-muted-foreground mt-1">Community-based rotating savings and credit groups</p>
              </div>
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Create Circle</Button></DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Create New Lending Circle</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2"><Label>Circle Name</Label><Input placeholder="e.g., Delhi Retailers Sahayak" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Max Members</Label><Input type="number" placeholder="10" value={form.maxMembers} onChange={e => setForm(f => ({ ...f, maxMembers: e.target.value }))} /></div>
                      <div className="space-y-2"><Label>Monthly Contribution</Label><Input type="number" placeholder="10000" value={form.contribution} onChange={e => setForm(f => ({ ...f, contribution: e.target.value }))} /></div>
                    </div>
                    <div className="space-y-2"><Label>Category</Label><Input placeholder="Technology, Agriculture..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
                    <Button className="w-full" onClick={handleCreate} disabled={loading}>{loading ? "Creating Circle..." : "Create Circle"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* My Circles */}
            <div className="grid gap-4 md:grid-cols-2">
              {circles.map((circle, i) => (
                <motion.div key={circle.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedCircle(circle)} whileHover={{ y: -4 }}
                  className={`p-5 border rounded-xl cursor-pointer transition-all ${selectedCircle?.id === circle.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{circle.name}</h3>
                      <p className="text-sm text-muted-foreground">{circle.category} • {circle.members}/{circle.maxMembers} members</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "My Contribution", value: `₹${(circle.contribution / 1000).toFixed(0)}K/mo` },
                      { label: "Pool Size", value: `₹${(circle.totalPool / 1000).toFixed(0)}K` },
                      { label: "My Turn", value: `Round ${circle.myTurn}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-2 bg-muted/30 rounded-lg">
                        <p className="text-sm font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Round {circle.currentRound} of {circle.totalRounds}</span>
                      <span>{Math.round(circle.currentRound / circle.totalRounds * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${(circle.currentRound / circle.totalRounds) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedCircle && selectedCircle.members_list && selectedCircle.members_list.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Member Trust Scores */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Member Trust Scores</CardTitle>
                      <CardDescription>Contribution reliability and community standing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCircle.members_list.map((member, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{member.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{member.name}</span>
                                {member.name === "You" && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">You</Badge>}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>Turn #{member.turn}</span>
                                {member.contributed && <><span>•</span><CheckCircle2 className="h-3 w-3 text-emerald-500" /><span className="text-emerald-600">Contributed</span></>}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <TrustScoreBadge score={member.trustScore} />
                              <div className="w-20">
                                <Progress value={member.trustScore} className="h-1.5" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Rotation History */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Fund Rotation History</CardTitle>
                      <CardDescription>Who received the pool each month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rotationHistory.map((r, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              r.status === "current" ? "border-primary bg-primary/5" :
                              r.status === "completed" ? "border-border bg-card" : "border-dashed border-border bg-muted/20"
                            }`}>
                            <div className="flex items-center gap-3">
                              {r.status === "completed" ? <Trophy className="h-5 w-5 text-amber-500" /> :
                               r.status === "current" ? <Star className="h-5 w-5 text-primary" /> :
                               <Clock className="h-5 w-5 text-muted-foreground" />}
                              <div>
                                <p className="text-sm font-medium">{r.recipient}</p>
                                <p className="text-xs text-muted-foreground">Round {r.round} • {r.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">₹{(r.amount / 1000).toFixed(0)}K</span>
                              <Badge variant="secondary" className={
                                r.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                                r.status === "current" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              }>{r.status === "completed" ? "Done" : r.status === "current" ? "Now" : "Upcoming"}</Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

