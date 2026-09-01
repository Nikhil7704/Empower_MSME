"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserSidebar from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Building2, MapPin, ShieldCheck, Globe, Users, Calendar, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"

const initialBusinesses = [
  {
    id: "b1",
    name: "GreenLeaf Organics",
    sector: "Agriculture",
    location: "Pune, Maharashtra",
    udyamId: "UDYAM-MH-12-0048392",
    employees: 45,
    age: 3,
    website: "https://greenleaforganics.in",
    description: "Processing, packaging, and exporting certified organic spices and condiments sourced directly from rural smallholder cooperatives.",
    status: "verified",
    fundingGoal: 2500000,
  },
  {
    id: "b2",
    name: "TechWeave Solutions",
    sector: "Technology",
    location: "Bangalore, Karnataka",
    udyamId: "UDYAM-KA-03-0112984",
    employees: 28,
    age: 2,
    website: "https://techweave.io",
    description: "AI-powered SaaS tool providing real-time stock allocation and inventory forecasting optimized for retail brick-and-mortar MSMEs.",
    status: "verified",
    fundingGoal: 5000000,
  },
  {
    id: "b3",
    name: "CoolChain Logistics",
    sector: "Logistics",
    location: "Delhi NCR",
    udyamId: "UDYAM-DL-02-0059381",
    employees: 60,
    age: 5,
    website: "https://coolchain.net",
    description: "Multi-city cold-chain distribution network supporting temperature-controlled transport for fresh dairy and pharma producers.",
    status: "verified",
    fundingGoal: 8000000,
  },
  {
    id: "b4",
    name: "Solar Ease Energy",
    sector: "Energy",
    location: "Jaipur, Rajasthan",
    udyamId: "UDYAM-RJ-14-0029384",
    employees: 18,
    age: 1.5,
    website: "https://solarease.co.in",
    description: "Affordable micro-grid solar panel installations and contract-based maintenance for local manufacturing units.",
    status: "verified",
    fundingGoal: 3000000,
  },
  {
    id: "b5",
    name: "Artisan Textiles Co.",
    sector: "Manufacturing",
    location: "Jaipur, Rajasthan",
    udyamId: "UDYAM-RJ-14-0094832",
    employees: 80,
    age: 7,
    website: "https://artisantextiles.com",
    description: "Modernizing handlooms and introducing organic yarn dyes. Running a D2C store showcasing handwoven fabrics.",
    status: "verified",
    fundingGoal: 1500000,
  },
]

export default function ExploreBusinessesPage() {
  const [businesses] = useState(initialBusinesses)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("all")

  // Filter logic
  const filtered = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase())
    const matchSector = sector === "all" || b.sector === sector
    return matchSearch && matchSector
  })

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Explore Verified Businesses</h1>
            <p className="text-muted-foreground mt-1">Discover, audit, and vet small-to-medium businesses registered on the platform</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Filter bar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, tags, description..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">{filtered.length} verified companies found</p>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((biz, idx) => (
                <motion.div
                  key={biz.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="hover:shadow-lg transition-all h-full flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex gap-0.5 items-center">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-3">{biz.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {biz.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3 text-xs text-muted-foreground leading-relaxed">
                        {biz.description}
                      </CardContent>
                    </div>

                    <CardContent className="pt-0 flex gap-2">
                      <Button variant="outline" className="flex-1 text-xs bg-transparent gap-1" onClick={() => setSelected(biz)}>
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                      <Link href="/user/campaigns" className="flex-1">
                        <Button className="w-full text-xs gap-1">
                          Invest <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{selected.name}</DialogTitle>
                  <DialogDescription className="text-xs flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selected.location}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-sm">
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">About the Business</p>
                <p className="mt-1 text-muted-foreground leading-relaxed">{selected.description}</p>
              </div>

              {/* Grid metrics */}
              <div className="grid grid-cols-2 gap-3 bg-muted/20 border border-border p-3.5 rounded-xl text-xs">
                <div>
                  <p className="text-muted-foreground">Udyam Registration</p>
                  <p className="font-semibold mt-0.5 truncate">{selected.udyamId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Business Sector</p>
                  <p className="font-semibold mt-0.5">{selected.sector}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Employees</p>
                    <p className="font-semibold">{selected.employees} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Business Age</p>
                    <p className="font-semibold">{selected.age} Years</p>
                  </div>
                </div>
              </div>

              {/* Link */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Website:</span>
                <a href={selected.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{selected.website}</a>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelected(null)}>Close</Button>
                <Link href="/user/campaigns" className="flex-1">
                  <Button className="w-full gap-1.5">
                    View Campaign <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
