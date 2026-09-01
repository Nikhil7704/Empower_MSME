"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Shield, AlertCircle, ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("admin@empowermsme.com")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login("admin", "Platform Admin", email, password)
      router.push("/admin/dashboard")
    } catch (err) {
      // Fallback: sandbox login without password check
      try {
        await login("admin", "Platform Admin", email)
        router.push("/admin/dashboard")
      } catch {
        setError("Login failed. Please try again.")
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-500/5 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-2">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Secure access for platform administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-red-500/20 bg-red-500/5">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-sm">This is a restricted area. Unauthorized access is prohibited.</AlertDescription>
            </Alert>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input id="email" type="email" placeholder="admin@empowermsme.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "Authenticating..." : "Secure Login"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">Demo: any email / any password</p>
            <div className="mt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
