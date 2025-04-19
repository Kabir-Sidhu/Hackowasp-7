"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Cpu, Upload, ArrowLeft, Check } from "lucide-react"
import { WalletConnect } from "@/components/wallet/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"

const MotionCard = motion.create(Card)

const gpuOptions = [
  {
    id: "nvidia-a100",
    name: "NVIDIA A100",
    specs: "80GB VRAM, 312 TFLOPS",
    price: 12.5,
    availability: "High",
  },
  {
    id: "nvidia-h100",
    name: "NVIDIA H100",
    specs: "80GB VRAM, 989 TFLOPS",
    price: 25.0,
    availability: "Medium",
  },
  {
    id: "amd-mi250",
    name: "AMD Instinct MI250",
    specs: "128GB VRAM, 383 TFLOPS",
    price: 15.0,
    availability: "Low",
  },
  {
    id: "nvidia-rtx4090",
    name: "NVIDIA RTX 4090",
    specs: "24GB VRAM, 82.6 TFLOPS",
    price: 8.0,
    availability: "Very High",
  },
  {
    id: "nvidia-rtx3090",
    name: "NVIDIA RTX 3090",
    specs: "24GB VRAM, 35.6 TFLOPS",
    price: 5.0,
    availability: "Very High",
  },
  {
    id: "amd-rx7900xtx",
    name: "AMD RX 7900 XTX",
    specs: "24GB VRAM, 61.4 TFLOPS",
    price: 6.5,
    availability: "High",
  },
]

export default function UploadModelPage() {
  const router = useRouter()
  const [selectedGpu, setSelectedGpu] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [computeTime, setComputeTime] = useState(1) // hours
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file && selectedGpu) {
      router.push("/scanning")
    }
  }

  const selectedGpuDetails = gpuOptions.find((gpu) => gpu.id === selectedGpu)
  const totalCost = selectedGpuDetails ? selectedGpuDetails.price * computeTime : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">GPULend</span>
          </Link>
          
          {/* Wallet Connect Component */}
          <WalletConnect />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="flex items-center text-purple-400 hover:text-purple-300 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload Your AI Model</h1>
          <p className="text-zinc-400 mb-8">Select a GPU and upload your model to start processing</p>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Upload Your Model</h2>
                <motion.div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    isDragging ? "border-purple-500 bg-purple-500/10" : "border-zinc-700"
                  } ${file ? "bg-zinc-900/50" : ""}`}
                  whileHover={{ borderColor: "#9333ea", backgroundColor: "rgba(147, 51, 234, 0.05)" }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center">
                      <Check className="h-12 w-12 text-green-500 mb-2" />
                      <p className="text-lg font-medium mb-1">{file.name}</p>
                      <p className="text-zinc-500 text-sm mb-4">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <Button
                        type="button"
                        className="flex items-center gap-1 border border-zinc-700 bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-sm"
                        onClick={() => setFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-zinc-500 mb-4" />
                      <p className="text-lg font-medium mb-2">Drag and drop your model file</p>
                      <p className="text-zinc-500 mb-4">or click to browse files</p>
                      <input
                        type="file"
                        id="model-file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".py"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById("model-file")?.click()}
                        className="border border-purple-500 bg-transparent text-purple-500 hover:bg-purple-950"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                </motion.div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Compute Time</h3>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-400">Duration</span>
                      <span className="font-medium">
                        {computeTime} {computeTime === 1 ? "hour" : "hours"}
                      </span>
                    </div>
                    <Slider
                      value={[computeTime]}
                      min={1}
                      max={24}
                      step={1}
                      onValueChange={(value) => setComputeTime(value[0])}
                      className="py-4"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">2. Select a GPU</h2>
                <RadioGroup value={selectedGpu} onValueChange={setSelectedGpu} className="space-y-4">
                  {gpuOptions.map((gpu) => (
                    <motion.div key={gpu.id} whileHover={{ y: -2 }}>
                      <Label htmlFor={gpu.id} className="cursor-pointer block">
                        <MotionCard
                          className={`bg-zinc-900 border ${
                            selectedGpu === gpu.id ? "border-purple-500" : "border-zinc-800"
                          }`}
                          whileHover={{
                            boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                            borderColor: "#9333ea",
                          }}
                        >
                          <CardHeader className="py-4 px-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{gpu.name}</CardTitle>
                                <CardDescription className="text-zinc-500">{gpu.specs}</CardDescription>
                              </div>
                              <RadioGroupItem value={gpu.id} id={gpu.id} className="mt-1" />
                            </div>
                          </CardHeader>
                          <Separator className="bg-zinc-800" />
                          <CardContent className="py-3 px-5 flex justify-between items-center">
                            <div className="flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  gpu.availability === "Very High"
                                    ? "bg-green-500"
                                    : gpu.availability === "High"
                                      ? "bg-green-400"
                                      : gpu.availability === "Medium"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                }`}
                              />
                              <span className="text-sm text-zinc-400">{gpu.availability} Availability</span>
                            </div>
                            <div className="font-medium">${gpu.price.toFixed(2)}/hr</div>
                          </CardContent>
                        </MotionCard>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {selectedGpu && (
              <motion.div
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Selected GPU</span>
                    <span>{selectedGpuDetails?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Compute Time</span>
                    <span>
                      {computeTime} {computeTime === 1 ? "hour" : "hours"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Rate</span>
                    <span>${selectedGpuDetails?.price.toFixed(2)}/hour</span>
                  </div>
                  <Separator className="bg-zinc-800 my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost</span>
                    <span className="text-purple-400">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 h-11 px-8 text-base"
                  disabled={!file || !selectedGpu}
                >
                  Proceed to Payment
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
