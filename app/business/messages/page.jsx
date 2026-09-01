"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BusinessSidebar from "@/components/business-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Send, CheckCircle2, Shield, MoreVertical, Search, Bot } from "lucide-react"

const initialChats = [
  {
    id: "c1",
    name: "Sunrise Capital (Rohan V.)",
    initials: "SC",
    role: "Institutional Investor",
    verified: true,
    lastMsg: "Hi Priya, we reviewed your credit score. Can we discuss your RBF cap share?",
    time: "2h ago",
    unread: true,
    history: [
      { sender: "investor", text: "Hello! We saw your campaign for the Spice Processing expansion. The numbers look strong.", time: "10:30 AM" },
      { sender: "me", text: "Hi Rohan, thanks for reaching out. Yes, we are seeing significant growth in our export pipeline and need to scale processing capacity.", time: "10:45 AM" },
      { sender: "investor", text: "Great. We've submitted a proposal of ₹10L. Can we discuss lowering the revenue cap from 1.3x to 1.25x if we close by this week?", time: "11:15 AM" },
    ],
    autoreplies: [
      "Thanks for the offer, Rohan. 1.25x is reasonable if we can accelerate disbursement. Let's schedule a call.",
      "We'd love to chat. Are you free tomorrow at 3 PM IST?",
    ]
  },
  {
    id: "c2",
    name: "Growth Fund India (Mehta S.)",
    initials: "GF",
    role: "Venture Lender",
    verified: true,
    lastMsg: "Please upload your Q1 audited financial statements.",
    time: "1d ago",
    unread: false,
    history: [
      { sender: "investor", text: "Hello GreenLeaf Team, to finalize the fixed EMI loan offer, we require your audited financials.", time: "Yesterday" },
      { sender: "me", text: "Sure, I have uploaded our GST returns and Aadhaar in the profile tab. I will upload the audited profit & loss sheet by tomorrow.", time: "Yesterday" },
      { sender: "investor", text: "Perfect. Once uploaded, we can disburse within 48 hours.", time: "Yesterday" },
    ],
    autoreplies: [
      "I have just uploaded the audited P&L sheet to our business profile. Please take a look.",
      "Thank you, we'll keep you posted.",
    ]
  },
  {
    id: "c3",
    name: "Ankit Joshi",
    initials: "AJ",
    role: "Angel Investor",
    verified: false,
    lastMsg: "Excited about the Organic Spice expansion. Let's schedule a brief call.",
    time: "3d ago",
    unread: false,
    history: [
      { sender: "investor", text: "Hello Priya, I love the story behind GreenLeaf. Sourcing directly from farmers is the right way.", time: "3 days ago" },
      { sender: "me", text: "Thank you, Ankit. It helps us secure high quality organic spices while supporting rural communities.", time: "3 days ago" },
      { sender: "investor", text: "Exactly. I'm looking to invest ₹5L. Let's connect on a brief video call to discuss term alignment.", time: "3 days ago" },
    ],
    autoreplies: [
      "Hi Ankit, sounds good. Let's set up a call. Let me know what times work for you.",
      "Looking forward to talking!",
    ]
  },
]

export default function BusinessMessagesPage() {
  const { toast } = useToast()
  const [chats, setChats] = useState(initialChats)
  const [activeChat, setActiveChat] = useState(initialChats[0])
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const bottomRef = useRef(null)

  // Scroll to bottom of chat feed when active chat or history changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat.history])

  const handleSendMessage = () => {
    if (!input.trim()) return

    const newMsg = {
      sender: "me",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedHistory = [...activeChat.history, newMsg]
    const updatedChat = { ...activeChat, history: updatedHistory, lastMsg: input, time: "Just now", unread: false }

    setActiveChat(updatedChat)
    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c))
    setInput("")

    // Simulated Auto-Reply logic
    const replies = activeChat.autoreplies || []
    if (replies.length > 0) {
      setTimeout(() => {
        const replyText = replies[Math.floor(Math.random() * replies.length)]
        const autoMsg = {
          sender: "investor",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        const finalHistory = [...updatedHistory, autoMsg]
        const finalChat = { ...updatedChat, history: finalHistory, lastMsg: replyText, time: "Just now" }
        
        setActiveChat(finalChat)
        setChats(prev => prev.map(c => c.id === activeChat.id ? finalChat : c))

        toast({
          title: "New Message",
          description: `Message received from ${activeChat.name}`,
        })
      }, 2000)
    }
  }

  // Filter conversations based on search query
  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card px-8 py-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Investor Messages</h1>
              <p className="text-muted-foreground mt-0.5">Direct chat channels with verified investors and credit managers</p>
            </div>
          </div>
        </div>

        {/* Main Workspaces Split layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel: chats list */}
          <div className="w-80 border-r border-border bg-card/40 flex flex-col flex-shrink-0">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background/50"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat)
                    // Mark as read in lists
                    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c))
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    activeChat.id === chat.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm bg-primary/20 text-primary font-bold">
                      {chat.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-xs font-bold text-foreground truncate">{chat.name}</p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{chat.lastMsg}</p>
                  </div>
                  {chat.unread && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              ))}

              {filteredChats.length === 0 && (
                <div className="text-center text-xs text-muted-foreground p-6">
                  No active conversations found
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Chat Thread */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Header info */}
            <div className="p-4 border-b border-border bg-card flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-sm bg-primary/20 text-primary font-bold">
                    {activeChat.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">{activeChat.name}</h3>
                    {activeChat.verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{activeChat.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeChat.history.map((msg, index) => {
                const isMe = msg.sender === "me"
                return (
                  <div key={index} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {activeChat.initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[70%] space-y-1">
                      <div className={`p-3 rounded-2xl text-sm ${
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-card border border-border rounded-tl-sm"
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground ${isMe ? "text-right" : "text-left"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border bg-card flex-shrink-0">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <Input
                  className="flex-1"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="max-w-4xl mx-auto mt-2 flex gap-1.5 items-center text-[10px] text-muted-foreground">
                <Bot className="h-3 w-3 text-primary animate-pulse" /> 
                <span>Simulated Chat Sandbox: Replying to messages will trigger investor responses automatically.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

