"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Cpu, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ScanningPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          setScanComplete(true)
          setTimeout(() => {
            setShowSuccessDialog(true)
          }, 500)
          return 100
        }
        return prevProgress + 5
      })
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleContinue = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">GPULend</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative w-48 h-48 mx-auto mb-8">
              <motion.div className="absolute inset-0 rounded-full border-4 border-zinc-800" initial={{ opacity: 1 }} />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500"
                initial={{ opacity: 1 }}
                style={{
                  clipPath: `polygon(0% 0%, ${progress}% 0%, ${progress}% 100%, 0% 100%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {scanComplete ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <CheckCircle className="h-20 w-20 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Shield className="h-20 w-20 text-purple-500" />
                  </motion.div>
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{scanComplete ? "Scan Complete" : "Scanning Your Model"}</h1>
            <p className="text-zinc-400 mb-4">
              {scanComplete
                ? "Your model has been verified and is ready to run"
                : "We're checking your model for security and compatibility"}
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
              <motion.div
                className="bg-purple-500 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-sm text-zinc-500">{progress}% complete</p>
          </motion.div>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Success!</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your model has been verified and your balance has been deducted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mb-4"
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">Payment Successful</h3>
              <p className="text-zinc-400 mb-4">Your model is now running on the selected GPU</p>
              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">Amount Deducted</span>
                  <span className="font-medium">$25.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">New Balance</span>
                  <span className="font-medium">$175.00</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleContinue} className="w-full bg-purple-600 hover:bg-purple-700">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
