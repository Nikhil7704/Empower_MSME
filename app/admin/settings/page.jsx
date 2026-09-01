"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Settings, Landmark, ShieldCheck, Lock, ShieldAlert, Check } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Passwords
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })

  // Financial Parameters
  const [financials, setFinancials] = useState({
    feePct: "2.0",
    maxEscrowDays: "14",
    maxInterestCeiling: "24",
    maxFundingLimit: "10000000",
  })

  // Global triggers
  const [triggers, setTriggers] = useState({
    maintenanceMode: false,
    mfaRequired: true,
    ipBanEnabled: true,
  })

  const setVal = (k, v) => setFinancials(prev => ({ ...prev, [k]: v }))

  const handleSaveConfigs = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Global Configuration Saved",
        description: "All interest thresholds, fee parameters, and security triggers updated successfully.",
      })
    }, 800)
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Admin Credentials Updated",
      description: "Admin portal password changed successfully.",
    })
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Global Settings</h1>
                <p className="text-muted-foreground mt-0.5">Manage platform margins, escrow limits, risk levels, and credentials</p>
              </div>
            </div>
          </div>

          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Financial Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Landmark className="h-4.5 w-4.5 text-primary" /> Financial Controls
                  </CardTitle>
                  <CardDescription>Escrow parameters and platform cuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fee-pct">Platform Fee (%)</Label>
                      <Input id="fee-pct" value={financials.feePct} onChange={e => setVal("feePct", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="interest-ceiling">Max Yield Ceiling (%)</Label>
                      <Input id="interest-ceiling" value={financials.maxInterestCeiling} onChange={e => setVal("maxInterestCeiling", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="escrow-days">Max Escrow Period (Days)</Label>
                      <Input id="escrow-days" value={financials.maxEscrowDays} onChange={e => setVal("maxEscrowDays", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="funding-lim">Max Campaign Goal (₹)</Label>
                      <Input id="funding-lim" type="number" value={financials.maxFundingLimit} onChange={e => setVal("maxFundingLimit", e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full mt-2" onClick={handleSaveConfigs} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Financial Rules"}
                  </Button>
                </CardContent>
              </Card>

              {/* Security & Locks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Global Security Switches
                  </CardTitle>
                  <CardDescription>System locks and firewall configurations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "mfaRequired", title: "Mandatory Admin MFA", desc: "Require authenticator codes for admin roles", val: triggers.mfaRequired },
                    { id: "ipBanEnabled", title: "IP Rate Limit Autoban", desc: "Instantly block IPs breaching DDoS thresholds", val: triggers.ipBanEnabled },
                  ].map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card text-xs">
                      <div className="max-w-[80%]">
                        <Label htmlFor={`rule-${rule.id}`} className="font-semibold text-xs cursor-pointer">{rule.title}</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{rule.desc}</p>
                      </div>
                      <Switch
                        id={`rule-${rule.id}`}
                        checked={rule.val}
                        onCheckedChange={checked => setTriggers(t => ({ ...t, [rule.id]: checked }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Admin Password Reset */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4.5 w-4.5 text-primary" /> Reset Admin Credentials
                </CardTitle>
                <CardDescription>Update main admin sign-in passwords</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3 text-xs">
                    <div className="space-y-1.5">
                      <Label htmlFor="curr-pass">Current Password</Label>
                      <Input
                        id="curr-pass"
                        type="password"
                        value={passwords.current}
                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new-pass">New Password</Label>
                      <Input
                        id="new-pass"
                        type="password"
                        value={passwords.new}
                        onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="conf-pass">Confirm Password</Label>
                      <Input
                        id="conf-pass"
                        type="password"
                        value={passwords.confirm}
                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto flex gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5" /> Save Credentials
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Platform Lock Danger Zone */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500" /> Platform Maintenance Lock
                </CardTitle>
                <CardDescription>Lock client operations and route directories during system updates</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="max-w-[70%]">
                  <p className="font-semibold text-foreground">Global Maintenance Mode</p>
                  <p className="text-muted-foreground mt-0.5">Redirects all non-admin users to a maintenance landing screen. Active investments and cron settlements will remain running.</p>
                </div>
                <Switch
                  checked={triggers.maintenanceMode}
                  onCheckedChange={checked => {
                    setTriggers(t => ({ ...t, maintenanceMode: checked }))
                    toast({
                      title: checked ? "Maintenance Enabled" : "Maintenance Disabled",
                      description: checked ? "Platform is locked. Non-admin routes are offline." : "Platform is live.",
                      variant: checked ? "destructive" : "default",
                    })
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
