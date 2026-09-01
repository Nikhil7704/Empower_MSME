"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserSidebar from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GraduationCap, BookOpen, Trophy, Award, ArrowRight, CheckCircle, RefreshCw, AlertCircle } from "lucide-react"

const coursesList = [
  {
    id: "c1",
    title: "Understanding Revenue-Based Financing",
    category: "Alternative Investing",
    duration: "10 mins",
    difficulty: "Beginner",
    summary: "Learn how RBF aligns investor payouts with monthly business revenue cycles without traditional collateral.",
    lessons: [
      "Traditional EMI loans press MSMEs during low-revenue seasons.",
      "RBF indexes repayments as a flat percentage of gross monthly sales (e.g., 8%).",
      "Total repayment is bound by a fixed multiplier, known as the Cap Rate (e.g., 1.3x).",
    ],
    quiz: {
      question: "In an RBF model, if a business experiences a 50% drop in revenue for a month, what happens to the investor payment?",
      options: [
        "It stays exactly the same.",
        "It drops proportionally by 50%.",
        "The business defaults and pays a penalty.",
      ],
      answer: 1, // index 1
      explanation: "RBF payments are a fixed percentage of gross sales, meaning payments drop proportionally when sales drop, protecting MSME cashflow.",
    },
    completed: true,
  },
  {
    id: "c2",
    title: "Due Diligence: Vetting MSME Risk Profiles",
    category: "Risk Vetting",
    duration: "15 mins",
    difficulty: "Intermediate",
    summary: "Vetting business creditworthiness using tax filing reports, bank statements, and Udyam certification data.",
    lessons: [
      "Evaluate gross profit margins relative to industry standards (aim for >15%).",
      "Verify filing history consistency on the GST portal (ensure no recent default skips).",
      "Validate operational viability and physical assets through Udyam certificates.",
    ],
    quiz: {
      question: "Which of the following is the strongest indicator of a stable MSME cashflow?",
      options: [
        "A large single-invoice payment twice a year.",
        "Low monthly revenue variance (stable recurring receipts).",
        "High total debt-to-income ratio.",
      ],
      answer: 1,
      explanation: "Low monthly revenue variance implies reliable, predictable cashflow, reducing repayment default risks.",
    },
    completed: false,
  },
  {
    id: "c3",
    title: "Cooperative Lending Circles & P2P Trust",
    category: "Community Finance",
    duration: "8 mins",
    difficulty: "Beginner",
    summary: "How digitized Rotating Savings and Credit Associations (ROSCAs) mitigate credit default risk through group trust.",
    lessons: [
      "Lending circles leverage community relationships to secure collateral-free liquidity.",
      "Digitized trust scores rank participants based on on-time monthly pool contributions.",
      "A participant's platform rating declines permanently if they skip a rotation.",
    ],
    quiz: {
      question: "How do lending circles secure capital without physical collateral?",
      options: [
        "Through social collateral and group trust scores.",
        "Through government-insured cash guarantees.",
        "By issuing stock shares to members.",
      ],
      answer: 0,
      explanation: "Lending circles rely on peer accountability and public trust scores (social collateral) to enforce repayment rules.",
    },
    completed: false,
  },
]

export default function AcademyPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState(coursesList)
  const [activeCourse, setActiveCourse] = useState(null)
  
  // Quiz states
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleStartQuiz = (course) => {
    setActiveCourse(course)
    setSelectedOpt(null)
    setQuizSubmitted(false)
    setIsCorrect(false)
  }

  const handleSubmitQuiz = () => {
    if (selectedOpt === null) return
    
    setQuizSubmitted(true)
    const correct = selectedOpt === activeCourse.quiz.answer
    setIsCorrect(correct)

    if (correct) {
      setCourses(prev =>
        prev.map(c => (c.id === activeCourse.id ? { ...c, completed: true } : c))
      )
      toast({
        title: "Quiz Completed! +10 Points",
        description: "Excellent answer. You have successfully finished this track.",
      })
    } else {
      toast({
        title: "Incorrect Answer",
        description: "Review the lessons and try again.",
        variant: "destructive",
      })
    }
  }

  const completedCount = courses.filter(c => c.completed).length
  const progressPct = Math.round((completedCount / courses.length) * 100)

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border bg-card px-8 py-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Learning Academy</h1>
                  <p className="text-muted-foreground mt-0.5">Empower yourself with resources on alternative finance and due diligence</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-bold">{completedCount * 100} Academy XP</span>
              </div>
            </div>
          </div>

          <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Award className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base text-foreground">Overall Course Progression</h3>
                    <span className="text-sm text-muted-foreground font-bold">{completedCount} of {courses.length} courses completed</span>
                  </div>
                  <Progress value={progressPct} className="h-2.5" />
                  <p className="text-xs text-muted-foreground">Complete quizzes at the end of each module to unlock certifications and platform badges.</p>
                </div>
              </CardContent>
            </Card>

            {/* Courses grid */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Available Syllabus</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                            {course.completed && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">✓ Done</Badge>
                            )}
                          </div>
                          <CardTitle className="text-base leading-snug">{course.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">{course.duration} • {course.difficulty}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                          {course.summary}
                        </CardContent>
                      </div>

                      <CardContent className="pt-0">
                        <Button 
                          variant={course.completed ? "outline" : "default"} 
                          className="w-full text-xs gap-1.5 bg-transparent"
                          onClick={() => handleStartQuiz(course)}
                        >
                          <BookOpen className="h-3.5 w-3.5" /> {course.completed ? "Review Module" : "Start Module"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Course Reader & Quiz Dialog */}
      <Dialog open={!!activeCourse} onOpenChange={() => setActiveCourse(null)}>
        {activeCourse && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="secondary" className="text-xs">{activeCourse.category}</Badge>
                  <DialogTitle className="text-lg font-bold mt-2">{activeCourse.title}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 pt-2 text-sm max-h-[70vh] overflow-y-auto pr-1">
              {/* Syllabus details */}
              <div className="space-y-3">
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex gap-1 items-center">
                  <BookOpen className="h-3.5 w-3.5" /> Core Syllabus Lessons
                </p>
                <div className="space-y-2">
                  {activeCourse.lessons.map((lesson, idx) => (
                    <div key={idx} className="flex gap-2.5 p-3 rounded-lg border border-border bg-muted/20 leading-relaxed text-xs">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                      <p className="text-muted-foreground">{lesson}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Segment */}
              <div className="space-y-3 pt-3 border-t border-border">
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Concept Check Quiz</p>
                <Card className="bg-card">
                  <CardContent className="p-4 space-y-4">
                    <p className="text-xs font-semibold leading-relaxed text-foreground">{activeCourse.quiz.question}</p>
                    <div className="space-y-2">
                      {activeCourse.quiz.options.map((opt, oIdx) => {
                        const isSelected = selectedOpt === oIdx
                        let style = "border-border hover:bg-muted/40"
                        if (isSelected) style = "border-primary bg-primary/5"
                        if (quizSubmitted) {
                          if (oIdx === activeCourse.quiz.answer) style = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                          else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                        }
                        
                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedOpt(oIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center ${style}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && oIdx === activeCourse.quiz.answer && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanations if submitted */}
                    {quizSubmitted && (
                      <div className={`p-3 rounded-lg border text-xs flex gap-2.5 ${
                        isCorrect ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300" : "border-red-500/20 bg-red-500/5 text-red-800 dark:text-red-300"
                      }`}>
                        {isCorrect ? <CheckCircle className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />}
                        <div>
                          <p className="font-bold">{isCorrect ? "Correct!" : "Try Again"}</p>
                          <p className="text-muted-foreground mt-0.5">{activeCourse.quiz.explanation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setActiveCourse(null)}>Close</Button>
                {!quizSubmitted ? (
                  <Button className="flex-1" onClick={handleSubmitQuiz} disabled={selectedOpt === null}>
                    Submit Answer <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button 
                    className="flex-1" 
                    variant={isCorrect ? "outline" : "default"}
                    onClick={() => {
                      if (isCorrect) setActiveCourse(null)
                      else {
                        setQuizSubmitted(false)
                        setSelectedOpt(null)
                      }
                    }}
                  >
                    {isCorrect ? "Finish" : <><RefreshCw className="h-4 w-4 mr-1.5" /> Retry Quiz</>}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
