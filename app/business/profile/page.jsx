"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BusinessSidebar from "@/components/business-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Building2, Upload, CheckCircle2, AlertCircle, FileText, Globe, Phone, MapPin, Sparkles, Check } from "lucide-react"

export default function BusinessProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [uploadingName, setUploadingName] = useState("")

  const setVal = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/business/profile?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProfile(data.data)
          } else {
            // Fallback empty form state for new users
            setProfile({ name: "", sector: "", location: "", description: "", employees: "", fundingGoal: "", website: "" })
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  const handleSave = async () => {
    if (!profile || !user?.id) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/business/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...profile })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Profile Updated", description: "Your business profile has been saved to the database." })
      } else {
        toast({ title: "Save Failed", description: data.error || "Something went wrong.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network Error", description: "Could not reach the server.", variant: "destructive" })
    }
    setIsSaving(false)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingName(file.name)
    setTimeout(() => {
      setUploadedDocs(docs => [...docs, {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: "pending",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      }])
      setUploadingName("")
      toast({ title: "File Uploaded", description: `${file.name} is submitted for admin review.` })
    }, 1500)
  }

  const kycChecks = [
    { label: "Basic Details", done: !!(profile?.name && profile?.sector) },
    { label: "Location Info", done: !!profile?.location },
    { label: "Business Description", done: !!(profile?.description && profile?.description.length > 20) },
    { label: "Funding Goal Set", done: !!(profile?.fundingGoal) },
    { label: "Document Upload", done: uploadedDocs.length > 0 },
    { label: "Audited Financial Statements", done: false },
  ]
  const kycPct = Math.round((kycChecks.filter(c => c.done).length / kycChecks.length) * 100)

  if (loading) return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading profile...</div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Business Profile</h1>
                  <p className="text-muted-foreground mt-0.5">Manage your identity, metrics, and documents</p>
                </div>
              </div>
              <Badge className={`px-3 py-1 text-sm font-semibold flex gap-1 items-center ${
                profile?.user?.kycStatus === "VERIFIED" 
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}>
                <CheckCircle2 className="h-4 w-4" />
                KYC {profile?.user?.kycStatus || "PENDING"}
              </Badge>
            </div>
          </div>

          <div className="p-8 max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">KYC Status</CardTitle>
                  <CardDescription>Profile completion overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span>KYC Completion</span><span>{kycPct}%</span>
                    </div>
                    <Progress value={kycPct} className="h-2" />
                  </div>
                  <div className="space-y-3 pt-2">
                    {kycChecks.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground flex gap-1.5 items-center">
                          {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                          {step.label}
                        </span>
                        <Badge variant="secondary" className={step.done ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {step.done ? "Done" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documents & Verification</CardTitle>
                  <CardDescription>Upload compliance documents (PDF, JPG, PNG)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} disabled={!!uploadingName} />
                    <label htmlFor="doc-upload"
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        uploadingName ? "border-muted bg-muted/20" : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-semibold text-foreground">{uploadingName ? "Uploading file..." : "Choose document"}</p>
                      <p className="text-xs text-muted-foreground mt-1">Aadhaar, PAN, Udyam Certificate, GST Returns</p>
                    </label>
                  </div>
                  <div className="space-y-3 pt-2">
                    <AnimatePresence>
                      {uploadingName && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2.5 p-3 border border-dashed border-primary rounded-xl bg-primary/5">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full flex-shrink-0" />
                          <span className="text-xs font-medium truncate flex-1">{uploadingName}</span>
                          <span className="text-xs text-muted-foreground">Uploading...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {uploadedDocs.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.size} • {doc.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={doc.status === "verified" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Profile Details</CardTitle>
                  <CardDescription>This information will be displayed on the marketplace for investors. Changes are saved to the database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="biz-name">Business Name</Label>
                      <Input id="biz-name" value={profile?.name || ""} onChange={e => setVal("name", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="udyam-id">Udyam Registration Number</Label>
                      <Input id="udyam-id" value={profile?.udyamId || ""} disabled className="bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sector">Sector</Label>
                      <Input id="sector" value={profile?.sector || ""} onChange={e => setVal("sector", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="employees">Employee Count</Label>
                      <Input id="employees" type="number" value={profile?.employees || ""} onChange={e => setVal("employees", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="desc">Business Description</Label>
                    <Textarea id="desc" value={profile?.description || ""} onChange={e => setVal("description", e.target.value)} rows={4} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5 sm:col-span-1">
                      <Label htmlFor="funding">Funding Required (₹)</Label>
                      <Input id="funding" type="number" value={profile?.fundingGoal || ""} onChange={e => setVal("fundingGoal", e.target.value)} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="location">Address / Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="location" className="pl-9" value={profile?.location || ""} onChange={e => setVal("location", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <Label htmlFor="web">Website URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="web" className="pl-9" value={profile?.website || ""} onChange={e => setVal("website", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto ml-auto flex gap-2">
                    {isSaving ? "Saving..." : <><Check className="h-4 w-4" /> Save Profile Details</>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
