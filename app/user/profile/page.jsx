"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserSidebar from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { User, Upload, CheckCircle2, ShieldCheck, FileText, Check, AlertCircle, Info } from "lucide-react"

export default function InvestorProfilePage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Profile data
  const [profile, setProfile] = useState({
    name: "Ankit Joshi",
    email: "ankit.investor@gmail.com",
    phone: "+91 99887 76655",
    location: "Mumbai, Maharashtra",
    netWorthCert: false, // If they uploaded CA cert
  })

  const [accreditation, setAccreditation] = useState({
    highIncome: true,
    assetsCheck: false,
    professionalLender: false,
  })

  // Mock uploads list
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: "PAN_Card_Ankit.pdf", size: "900 KB", status: "verified", date: "Dec 05, 2025" },
    { name: "Aadhaar_Ankit.pdf", size: "1.1 MB", status: "verified", date: "Dec 05, 2025" },
  ])
  const [uploadingName, setUploadingName] = useState("")

  const setVal = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Profile Saved",
        description: "Your investor details have been updated successfully.",
      })
    }, 1000)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingName(file.name)
    setTimeout(() => {
      setUploadedDocs(docs => [
        ...docs,
        {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          status: "pending",
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        }
      ])
      setUploadingName("")
      toast({
        title: "Document Submitted",
        description: `${file.name} is now uploaded for verification.`,
      })
    }, 1500)
  }

  const kycPct = uploadedDocs.length >= 3 ? 100 : 75 // Mock completion

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-primary">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                  <p className="text-muted-foreground mt-0.5">Manage your investor credentials, KYC verifications, and compliance filings</p>
                </div>
              </div>
              <div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 text-sm font-semibold flex gap-1 items-center">
                  <ShieldCheck className="h-4 w-4" /> KYC Verified
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-8 max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
            {/* Left side: KYC & Doc Uploads */}
            <div className="lg:col-span-1 space-y-6">
              {/* KYC status progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">KYC Verification</CardTitle>
                  <CardDescription>Regulatory checks status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>KYC Verification Progress</span>
                      <span>{kycPct}%</span>
                    </div>
                    <Progress value={kycPct} className="h-2" />
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { label: "Personal Details Verification", done: true },
                      { label: "PAN & Aadhaar Match", done: true },
                      { label: "Bank Account Penny-Drop Test", done: true },
                      { label: "Accreditation Certificate", done: uploadedDocs.length >= 3 },
                    ].map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground flex gap-1.5 items-center">
                          {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                          {step.label}
                        </span>
                        <Badge variant="secondary" className={step.done ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {step.done ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upload zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">KYC Documents</CardTitle>
                  <CardDescription>Upload files for accreditation overrides</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <input type="file" id="investor-doc" className="hidden" onChange={handleFileUpload} disabled={!!uploadingName} />
                    <label htmlFor="investor-doc" className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                      uploadingName ? "border-muted bg-muted/20" : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs font-bold text-foreground">{uploadingName ? "Processing upload..." : "Choose File"}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Net Worth audits or bank logs (PDF/JPG)</p>
                    </label>
                  </div>

                  {/* Documents list */}
                  <div className="space-y-2.5">
                    <AnimatePresence>
                      {uploadingName && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 p-2.5 border border-dashed border-primary rounded-lg bg-primary/5 text-xs">
                          <div className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full flex-shrink-0" />
                          <span className="truncate flex-1 font-medium">{uploadingName}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 border border-border rounded-xl bg-card text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold truncate">{doc.name}</p>
                            <p className="text-[9px] text-muted-foreground">{doc.size} • {doc.date}</p>
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

            {/* Right side: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investor Details</CardTitle>
                  <CardDescription>Personal registration info</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="i-name">Full Name</Label>
                      <Input id="i-name" value={profile.name} onChange={e => setVal("name", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="i-email">Email Address</Label>
                      <Input id="i-email" value={profile.email} onChange={e => setVal("email", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="i-phone">Phone Number</Label>
                      <Input id="i-phone" value={profile.phone} onChange={e => setVal("phone", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="i-loc">Location</Label>
                      <Input id="i-loc" value={profile.location} onChange={e => setVal("location", e.target.value)} />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto ml-auto flex gap-1.5">
                    {isSaving ? "Saving..." : <><Check className="h-4 w-4" /> Save Profile</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Accreditation self check */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Accreditation Checker
                  </CardTitle>
                  <CardDescription>Accredited status allows peer investment thresholds exceeding ₹10 Lakhs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    <Info className="h-4.5 w-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p>In accordance with RBI guidelines, retail peer-to-peer lenders have a net cap of ₹10L across all platforms unless they submit a Chartered Accountant certified Net Worth certificate demonstrating net assets &gt; ₹2 Crore.</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {[
                      { id: "highIncome", label: "Gross annual income exceeds ₹25 Lakhs", checked: accreditation.highIncome },
                      { id: "assetsCheck", label: "Personal net worth exceeds ₹2 Crores (excluding residence)", checked: accreditation.assetsCheck },
                      { id: "professionalLender", label: "Registered corporate/institutional credit entity", checked: accreditation.professionalLender },
                    ].map(rule => (
                      <div key={rule.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={rule.id}
                          checked={rule.checked}
                          onChange={e => setAccreditation(a => ({ ...a, [rule.id]: e.target.checked }))}
                          className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                        />
                        <Label htmlFor={rule.id} className="text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                          {rule.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {accreditation.assetsCheck ? (
                    <div className="p-3 border border-amber-500/20 bg-amber-500/5 text-xs text-amber-700 dark:text-amber-300 rounded-xl leading-relaxed">
                      ⚠️ You self-reported assets exceeding ₹2 Crores. Please upload your Certified Chartered Accountant (CA) Net Worth statement in the document upload zone to approve accreditation overrides.
                    </div>
                  ) : (
                    <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-300 rounded-xl">
                      ✓ Standard retail investor account active. Investment limits capped at ₹10 Lakhs.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
