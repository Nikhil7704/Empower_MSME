"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import UserSidebar from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Settings, Lock, Bell, Sparkles, Shield, Check } from "lucide-react"

export default function InvestorSettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Passwords
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })

  // Auto-invest configurations
  const [autoInvest, setAutoInvest] = useState({
    enabled: false,
    maxPerCampaign: 25000,
    riskAppetite: 1, // 0: Conservative, 1: Balanced, 2: Aggressive
  })

  // Notifications
  const [notifs, setNotifs] = useState({
    newCampaigns: true,
    roiCredits: true,
    escrow: true,
    security: true,
  })

  const handleSavePreferences = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings Saved",
        description: "Your notification and portfolio preferences have been updated.",
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

  const riskLabels = ["Conservative (Low Risk)", "Balanced (Low/Med Risk)", "Aggressive (Any Risk)"]

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-primary">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-0.5">Configure your investment parameters, risk profiles, and notifications</p>
              </div>
            </div>
          </div>

          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Auto Invest parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4.5 w-4.5 text-primary" /> Auto-Invest Parameters
                  </CardTitle>
                  <CardDescription>Automatically deploy capital into matching campaigns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card">
                    <div>
                      <Label htmlFor="auto-toggle" className="font-semibold text-sm cursor-pointer">Enable Auto-Invest</Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Vests capital automatically on campaign launches</p>
                    </div>
                    <Switch
                      id="auto-toggle"
                      checked={autoInvest.enabled}
                      onCheckedChange={checked => setAutoInvest(a => ({ ...a, enabled: checked }))}
                    />
                  </div>

                  {autoInvest.enabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-cap">Max Allocation per Campaign (₹)</Label>
                        <Input
                          id="max-cap"
                          type="number"
                          value={autoInvest.maxPerCampaign}
                          onChange={e => setAutoInvest(a => ({ ...a, maxPerCampaign: Number(e.target.value) }))}
                        />
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Risk Profile Limit</span>
                          <span className="text-primary">{riskLabels[autoInvest.riskAppetite]}</span>
                        </div>
                        <Slider
                          min={0}
                          max={2}
                          step={1}
                          value={[autoInvest.riskAppetite]}
                          onValueChange={([v]) => setAutoInvest(a => ({ ...a, riskAppetite: v }))}
                          className="py-2"
                        />
                      </div>
                    </motion.div>
                  )}

                  <Button onClick={handleSavePreferences} className="w-full mt-2" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Auto-Invest Settings"}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification switches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4.5 w-4.5 text-primary" /> Notification Triggers
                  </CardTitle>
                  <CardDescription>Stay updated on yields and listings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "newCampaigns", title: "New Campaign Matches", desc: "Notify when a business matches your filter criteria", val: notifs.newCampaigns },
                    { id: "roiCredits", title: "Monthly Yield Distributions", desc: "Receive reports when returns are credited to your account", val: notifs.roiCredits },
                    { id: "escrow", title: "Escrow Release Milestone", desc: "Status alerts when funding escrow releases to active businesses", val: notifs.escrow },
                    { id: "security", title: "MFA Sign-in Logins", desc: "Alerts when signing in from unrecognized locations", val: notifs.security },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card">
                      <div className="max-w-[80%]">
                        <Label htmlFor={`notif-${item.id}`} className="font-semibold text-sm cursor-pointer">{item.title}</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Switch
                        id={`notif-${item.id}`}
                        checked={item.val}
                        onCheckedChange={checked => setNotifs(n => ({ ...n, [item.id]: checked }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Password edit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4.5 w-4.5 text-primary" /> Credentials Security
                </CardTitle>
                <CardDescription>Rotate account credentials</CardDescription>
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
                  <Button type="submit" className="w-full sm:w-auto flex gap-1.5">
                    <Check className="h-4 w-4" /> Change Credentials
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
