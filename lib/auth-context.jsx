"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
      return
    }

    if (session?.user) {
      // Map NextAuth session user
      setUser({
        id: session.user.id,
        email: session.user.email,
        role: session.user.role?.toLowerCase(), // "business" | "user" | "admin"
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        kycStatus: session.user.kycStatus || "PENDING",
        isNextAuth: true,
      })
    } else {
      // Fallback to localStorage sandbox user for out-of-box compatibility
      try {
        const stored = localStorage.getItem("empowermsme_user")
        if (stored) {
          setUser(JSON.parse(stored))
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [session, status])

  const login = async (role, name, email, password) => {
    if (password) {
      setLoading(true)
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      setLoading(false)
      if (res?.error) {
        throw new Error(res.error)
      }
      return
    }

    // Instant Sandbox login fallback
    const u = { role: role?.toLowerCase(), name, email, kycStatus: "VERIFIED" }
    localStorage.setItem("empowermsme_user", JSON.stringify(u))
    setUser(u)
  }

  const logout = async () => {
    if (user?.isNextAuth) {
      await signOut({ callbackUrl: "/auth/select" })
    } else {
      localStorage.removeItem("empowermsme_user")
      setUser(null)
      router.push("/auth/select")
    }
  }

  const dashboardPath = {
    business: "/business/dashboard",
    user: "/user/dashboard",
    admin: "/admin/dashboard",
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, dashboardPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

