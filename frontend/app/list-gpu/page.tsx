"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Cpu, ArrowLeft, HardDrive, CheckCircle } from "lucide-react"
import { WalletConnect } from "@/components/wallet/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MotionCard = motion.create(Card)

export default function ListGpuPage() {
  const router = useRouter()
  const [gpuType, setGpuType] = useState("")
  const [vramAmount, setVramAmount] = useState("")
  const [hourlyRate, setHourlyRate] = useState(5)
  const [availabilityHours, setAvailabilityHours] = useState([8, 20])
  const [isAutoAccept, setIsAutoAccept] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      // router.push("/")
    }, 3000)
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
          
          {/* Wallet Connect Component */}
          <WalletConnect />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="flex items-center text-purple-400 hover:text-purple-300 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">List Your GPU</h1>
          <p className="text-zinc-400 mb-8">Monetize your idle GPU by renting it out to AI developers</p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mb-4 inline-block"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">GPU Listed Successfully!</h2>
              <p className="text-zinc-400 mb-6">
                Your GPU has been added to our marketplace. You'll start earning as soon as someone rents it.
              </p>
              <div className="bg-zinc-800 rounded-lg p-4 max-w-md mx-auto mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">GPU Type</span>
                  <span className="font-medium">{gpuType}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">VRAM</span>
                  <span className="font-medium">{vramAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Hourly Rate</span>
                  <span className="font-medium">${hourlyRate.toFixed(2)}/hr</span>
                </div>
              </div>
              {/* <p className="text-sm text-zinc-500 mb-6">Redirecting to homepage...</p> */}
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <motion.div
                  className="bg-purple-500 h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                />
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="hardware" className="mb-8">
                <TabsList className="bg-zinc-900 border-zinc-800">
                  <TabsTrigger value="hardware" className="data-[state=active]:bg-purple-600">
                    Hardware Details
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="data-[state=active]:bg-purple-600">
                    Pricing & Availability
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hardware" className="mt-6">
                  <MotionCard
                    className="bg-zinc-900 border-zinc-800"
                    whileHover={{ boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.2)" }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="gpu-type" className="text-lg font-medium mb-3 block">
                            GPU Type
                          </Label>
                          <RadioGroup
                            value={gpuType}
                            onValueChange={setGpuType}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {[
                              { id: "nvidia-rtx4090", name: "NVIDIA RTX 4090", icon: <HardDrive /> },
                              { id: "nvidia-rtx4050", name: "NVIDIA RTX 4050", icon: <HardDrive /> },
                              { id: "nvidia-rtx3080", name: "NVIDIA RTX 3080", icon: <HardDrive /> },
                              { id: "amd-rx7900xtx", name: "AMD RX 7900 XTX", icon: <HardDrive /> },
                              { id: "nvidia-gtx1660", name: "NVIDIA GTX 1660", icon: <HardDrive /> },
                            ].map((gpu) => (
                              <motion.div key={gpu.id} whileHover={{ y: -2 }}>
                                <Label htmlFor={gpu.id} className="cursor-pointer block">
                                  <MotionCard
                                    className={`bg-zinc-800 border ${
                                      gpuType === gpu.id ? "border-purple-500" : "border-zinc-700"
                                    }`}
                                    whileHover={{
                                      boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                                      borderColor: "#9333ea",
                                    }}
                                  >
                                    <CardContent className="p-4 flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className="mr-3 text-purple-500">{gpu.icon}</div>
                                        <div>{gpu.name}</div>
                                      </div>
                                      <RadioGroupItem value={gpu.id} id={gpu.id} />
                                    </CardContent>
                                  </MotionCard>
                                </Label>
                              </motion.div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div>
                          <Label htmlFor="vram" className="text-lg font-medium mb-3 block">
                            VRAM Amount
                          </Label>
                          <Select value={vramAmount} onValueChange={setVramAmount}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700">
                              <SelectValue placeholder="Select VRAM amount" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="8GB">8GB</SelectItem>
                              <SelectItem value="12GB">12GB</SelectItem>
                              <SelectItem value="16GB">16GB</SelectItem>
                              <SelectItem value="24GB">24GB</SelectItem>
                              <SelectItem value="32GB">32GB</SelectItem>
                              <SelectItem value="48GB">48GB</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </MotionCard>
                </TabsContent>

                <TabsContent value="pricing" className="mt-6">
                  <MotionCard
                    className="bg-zinc-900 border-zinc-800"
                    whileHover={{ boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.2)" }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Label htmlFor="hourly-rate" className="text-lg font-medium">
                              Hourly Rate (USD)
                            </Label>
                            <div className="font-medium text-purple-400">${hourlyRate.toFixed(2)}/hr</div>
                          </div>
                          <Slider
                            id="hourly-rate"
                            value={[hourlyRate]}
                            min={1}
                            max={50}
                            step={0.5}
                            onValueChange={(value) => setHourlyRate(value[0])}
                            className="py-4"
                          />
                          <div className="flex justify-between text-sm text-zinc-500">
                            <span>$1.00</span>
                            <span>$25.00</span>
                            <span>$50.00</span>
                          </div>
                        </div>

                        <Separator className="bg-zinc-800" />

                        <div>
                          <Label className="text-lg font-medium mb-3 block">Availability Hours</Label>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-zinc-400">Available from</span>
                              <span className="font-medium">
                                {availabilityHours[0]}:00 - {availabilityHours[1]}:00
                              </span>
                            </div>
                            <Slider
                              value={availabilityHours}
                              min={0}
                              max={24}
                              step={1}
                              onValueChange={setAvailabilityHours}
                              className="py-4"
                            />
                            <div className="flex justify-between text-sm text-zinc-500">
                              <span>12 AM</span>
                              <span>12 PM</span>
                              <span>12 AM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </MotionCard>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <MotionCard
                    className="bg-zinc-900 border-zinc-800"
                    whileHover={{ boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.2)" }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="auto-accept" className="text-lg font-medium">
                              Auto-accept Requests
                            </Label>
                            <p className="text-zinc-400 text-sm mt-1">
                              Automatically accept rental requests that match your criteria
                            </p>
                          </div>
                          <Switch
                            id="auto-accept"
                            checked={isAutoAccept}
                            onCheckedChange={setIsAutoAccept}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>

                        <Separator className="bg-zinc-800" />

                        <div>
                          <Label htmlFor="payout-address" className="text-lg font-medium mb-3 block">
                            Payout Wallet Address
                          </Label>
                          <Input
                            id="payout-address"
                            placeholder="Enter your ICP wallet address"
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </MotionCard>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    className="w-full h-11 px-8 text-base"
                    disabled={isSubmitting}
                  >
                    List Your GPU
                  </Button>
                </motion.div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
