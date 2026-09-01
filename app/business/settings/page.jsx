"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import BusinessSidebar from "@/components/business-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Settings, Lock, Bell, Link2, ShieldAlert, Check } from "lucide-react"

export default function BusinessSettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  
  // Notification states
  const [notifs, setNotifs] = useState({
    proposals: true,
    repayments: true,
    academy: false,
    security: true,
  })

  // Integrations states
  const [integrations, setIntegrations] = useState({
    gst: true,
    udyam: true,
    bank: true,
  })

  const handleSaveSecurity = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings Saved",
        description: "Your notification and account preferences have been updated.",
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
      title: "Password Updated",
      description: "Your login credentials have been changed successfully.",
    })
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-0.5">Configure your business credentials, notifications, and compliance syncs</p>
              </div>
            </div>
          </div>

          <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Grid Layout */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4.5 w-4.5 text-primary" /> Notifications
                  </CardTitle>
                  <CardDescription>Control how and when you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "proposals", title: "New Funding Proposals", desc: "Get alerted when an investor submits a term sheet", val: notifs.proposals },
                    { id: "repayments", title: "Repayment Alerts", desc: "Receive reminders 3 days before an EMI or RBF payment is due", val: notifs.repayments },
                    { id: "academy", title: "Learning Academy Progress", desc: "Updates on newly added courses and guides", val: notifs.academy },
                    { id: "security", title: "Security Logins", desc: "Notify me of sign-ins from new devices or locations", val: notifs.security },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card">
                      <div className="max-w-[80%]">
                        <Label htmlFor={`notif-${item.id}`} className="font-semibold text-sm cursor-pointer">{item.title}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Switch
                        id={`notif-${item.id}`}
                        checked={item.val}
                        onCheckedChange={checked => setNotifs(n => ({ ...n, [item.id]: checked }))}
                      />
                    </div>
                  ))}
                  <Button onClick={handleSaveSecurity} className="w-full mt-2" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>

              {/* Integrations & Compliance Sync */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Link2 className="h-4.5 w-4.5 text-primary" /> Connected Integrations
                  </CardTitle>
                  <CardDescription>Manage automated links with government nodes and banking APIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "gst", title: "GST Portal Sync", desc: "Auto-fetches sales invoices to update cashflow scores", linked: integrations.gst },
                    { id: "udyam", title: "Udyam Register API", desc: "Synchronizes verified MSME size ratings and benefits", linked: integrations.udyam },
                    { id: "bank", title: "Primary Bank Feed", desc: "Links bank transaction ledgers for fast RBF reconciliation", linked: integrations.bank },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card">
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        <div className="flex gap-2 mt-1.5">
                          <Badge variant="secondary" className={item.linked ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground"}>
                            {item.linked ? "Linked" : "Disconnected"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={item.linked ? "outline" : "default"}
                        size="sm"
                        className="bg-transparent text-xs"
                        onClick={() => setIntegrations(i => ({ ...i, [item.id]: !item.linked }))}
                      >
                        {item.linked ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Password Change form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4.5 w-4.5 text-primary" /> Change Password
                </CardTitle>
                <CardDescription>Keep your account secure by rotating your login password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
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
                      <Label htmlFor="conf-pass">Confirm New Password</Label>
                      <Input
                        id="conf-pass"
                        type="password"
                        value={passwords.confirm}
                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto flex gap-2">
                    <Check className="h-4 w-4" /> Change Credentials
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500" /> Danger Zone
                </CardTitle>
                <CardDescription>Irreversible and sensitive business configurations</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-semibold text-sm text-foreground">Suspend Fundraising Campaigns</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Temporarily hide all active campaigns from the browse database.</p>
                </div>
                <Button variant="outline" className="text-xs border-red-500/30 text-red-600 hover:bg-red-500/10">
                  Suspend Campaigns
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
