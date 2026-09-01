"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BusinessSidebar from "@/components/business-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, Eye, Users, TrendingUp, Target, Edit, Trash2, ImageIcon } from "lucide-react"

const RISK_COLORS = { Low: "bg-emerald-500/10 text-emerald-600", Medium: "bg-amber-500/10 text-amber-600", High: "bg-red-500/10 text-red-600" }
const STATUS_COLORS = { active: "bg-blue-500/10 text-blue-600", funded: "bg-emerald-500/10 text-emerald-600", expired: "bg-gray-500/10 text-gray-600" }

function CampaignCard({ campaign, onEdit, onDelete }) {
  const pct = Math.min((campaign.raised / campaign.goal) * 100, 100)
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className="border border-border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Color banner */}
      <div className={`h-2 w-full ${campaign.status === "funded" ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-primary to-violet-500"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={STATUS_COLORS[campaign.status]}>{campaign.status === "funded" ? "✓ Funded" : "Active"}</Badge>
              <Badge variant="secondary" className={RISK_COLORS[campaign.riskLevel] || RISK_COLORS.Medium}>{campaign.riskLevel || "Medium"} Risk</Badge>
            </div>
            <h3 className="font-semibold text-foreground text-sm leading-snug">{campaign.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{campaign.sector}</p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(campaign)}><Edit className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(campaign.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-semibold">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div className={`h-full rounded-full ${campaign.status === "funded" ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-violet-500"}`}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>₹{(campaign.raised / 100000).toFixed(1)}L raised</span>
              <span>₹{(campaign.goal / 100000).toFixed(1)}L goal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
            {[
              { Icon: Users, label: "Investors", val: campaign.investors || 0 },
              { Icon: Eye, label: "Views", val: campaign.views || 0 },
              { Icon: TrendingUp, label: "ROI", val: `${campaign.expectedROI || 12}%` },
            ].map(({ Icon, label, val }) => (
              <div key={label} className="text-center">
                <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
                <p className="text-sm font-semibold">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {campaign.daysLeft > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-500/5 rounded-lg px-3 py-2">
              <Target className="h-3.5 w-3.5" /> {campaign.daysLeft} days remaining
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CreateCampaignForm({ onClose, onLaunch }) {
  const [form, setForm] = useState({ title: "", sector: "", goal: "", description: "", repayment: "" })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const imageInputRef = useRef(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLaunch = async () => {
    if (!form.title || !form.goal || !form.description) return
    setLoading(true)
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          sector: form.sector || "Agriculture",
          goal: form.goal,
          description: form.description,
          repaymentModel: form.repayment || "Fixed EMI",
        }),
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()
      if (data.success) {
        onLaunch(data.data)
        onClose()
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Campaign Title</Label><Input placeholder="e.g., Expand production capacity for..." value={form.title} onChange={e => set("title", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Sector</Label><Input placeholder="Technology, Agriculture..." value={form.sector} onChange={e => set("sector", e.target.value)} /></div>
        <div className="space-y-2"><Label>Funding Goal (₹)</Label><Input type="number" placeholder="1000000" value={form.goal} onChange={e => set("goal", e.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Tell investors about your business and how the funds will be used..." value={form.description} onChange={e => set("description", e.target.value)} rows={3} /></div>
      <div className="space-y-2"><Label>Repayment Model</Label><Input placeholder="Revenue-Based (8%) or Fixed EMI (24 months)" value={form.repayment} onChange={e => set("repayment", e.target.value)} /></div>
      <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
      <div
        onClick={() => imageInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 cursor-pointer transition-colors"
      >
        <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
        {imageFile ? (
          <p className="text-sm text-primary font-medium">{imageFile.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Upload campaign image or video</p>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={handleLaunch} disabled={loading}>{loading ? "Launching..." : "Launch Campaign"}</Button>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [showCreate, setShowCreate] = useState(false)

  const loadCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns")
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.data)
      }
    } catch {}
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const totals = {
    raised: campaigns.reduce((s, c) => s + c.raised, 0),
    investors: campaigns.reduce((s, c) => s + (c.investors || 0), 0),
    views: campaigns.reduce((s, c) => s + (c.views || 0), 0),
  }

  const engagementData = campaigns.map(c => ({
    campaign: c.title.substring(0, 12) + "...",
    views: c.views || 50,
    inquiries: Math.round((c.views || 50) * 0.1),
    invested: c.investors || 0,
  }))

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
                <p className="text-muted-foreground mt-1">Create and manage your fundraising campaigns</p>
              </div>
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> New Campaign</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>Launch a fundraising campaign to attract investors</DialogDescription>
                  </DialogHeader>
                  <CreateCampaignForm onClose={() => setShowCreate(false)} onLaunch={newCamp => setCampaigns(prev => [newCamp, ...prev])} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Total Raised", value: `₹${(totals.raised / 100000).toFixed(1)}L`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Total Investors", value: totals.investors, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Total Views", value: `${(totals.views / 1000).toFixed(1)}K`, icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
              ].map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${m.bg}`}><m.icon className={`h-6 w-6 ${m.color}`} /></div>
                      <div><p className="text-2xl font-bold">{m.value}</p><p className="text-sm text-muted-foreground">{m.label}</p></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Campaigns Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Campaigns</h2>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((c, i) => (
                  <CampaignCard key={c.id} campaign={c} onEdit={() => {}} onDelete={(id) => setCampaigns(cs => cs.filter(x => x.id !== id))} />
                ))}
              </div>
            </div>

            {/* Engagement Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Investor Engagement Metrics</CardTitle>
                  <CardDescription>Views, inquiries, and investments per campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={engagementData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="campaign" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inquiries" name="Inquiries" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="invested" name="Invested" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
