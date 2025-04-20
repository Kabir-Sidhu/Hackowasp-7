"use client"

import Link from "next/link"
import { ArrowRight, Cpu, Zap, Shield, DollarSign, BarChart } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnect } from "@/components/wallet/wallet-connect"

const MotionCard = motion.create(Card)
const MotionButton = motion.create(Button)

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">GPULend</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-zinc-400 hover:text-white transition">
              How It Works
            </Link>
            <Link href="#features" className="text-zinc-400 hover:text-white transition">
              Features
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {/* Wallet Connect Component */}
            {/* <WalletConnect /> */}
            
            <MotionButton
              className="bg-purple-600 hover:bg-purple-700 ml-2"
              whileHover={{ scale: 1.05, backgroundColor: "#7e22ce" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/payment-example">Connect Wallet</Link>
            </MotionButton>

            <MotionButton
              className="bg-purple-600 hover:bg-purple-700 ml-2"
              whileHover={{ scale: 1.05, backgroundColor: "#7e22ce" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/upload-model">Get Started</Link>
            </MotionButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-900/50 text-purple-300 text-sm font-medium mb-6">
              Powered by Internet Computer Protocol
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Lend Your GPU Power. Fuel AI Innovation.
            </h1>
            <p className="text-xl text-zinc-400 mb-8">
              The first decentralized marketplace connecting GPU owners with AI developers. Monetize your idle computing
              power or access the resources you need for your next breakthrough.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MotionButton
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
                whileHover={{ scale: 1.05, backgroundColor: "#7e22ce" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/list-gpu">Lend Your GPU</Link> <ArrowRight className="ml-2 h-4 w-4" />
              </MotionButton>
              <MotionButton
                size="lg"
                variant="outline"
                className="border-purple-500 text-purple-500 hover:bg-purple-950"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(126, 34, 206, 0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/upload-model">Rent Computing Power</Link>
              </MotionButton>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-purple-400">10,000+</p>
                <p className="text-zinc-500">GPUs Available</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">5,000+</p>
                <p className="text-zinc-500">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">99.9%</p>
                <p className="text-zinc-500">Uptime</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">70%</p>
                <p className="text-zinc-500">Cost Savings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Our decentralized platform makes it simple to share or access GPU resources through secure Web3
              technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 relative"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Connect Your Hardware</h3>
              <p className="text-zinc-400 mb-4">
                Install our secure client and connect your GPU. Our system automatically benchmarks your hardware and
                sets competitive rates.
              </p>
              <div className="h-40 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Cpu className="h-16 w-16 text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 relative"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Contract Matching</h3>
              <p className="text-zinc-400 mb-4">
                Our ICP-powered smart contracts automatically match GPU providers with users who need computing power.
              </p>
              <div className="h-40 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Zap className="h-16 w-16 text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 relative"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Earn or Compute</h3>
              <p className="text-zinc-400 mb-4">
                Lenders earn cryptocurrency while their hardware is in use. Renters get instant access to powerful
                computing resources.
              </p>
              <div className="h-40 bg-zinc-800 rounded-lg flex items-center justify-center">
                <DollarSign className="h-16 w-16 text-purple-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Built on the Internet Computer Protocol for maximum security, transparency, and efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <MotionCard
              className="bg-zinc-900 border-zinc-800"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Secure Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  All transactions are secured by ICP blockchain technology, ensuring fair payment for GPU providers and
                  reliable service for users.
                </CardDescription>
              </CardContent>
            </MotionCard>

            <MotionCard
              className="bg-zinc-900 border-zinc-800"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-500" />
                  Real-time Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Monitor GPU usage, earnings, and performance in real-time through our intuitive dashboard.
                </CardDescription>
              </CardContent>
            </MotionCard>

            <MotionCard
              className="bg-zinc-900 border-zinc-800"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Low Latency Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Our network optimizes connections between providers and users to minimize latency for AI model
                  training and inference.
                </CardDescription>
              </CardContent>
            </MotionCard>

            <MotionCard
              className="bg-zinc-900 border-zinc-800"
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                  Flexible Pricing Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Choose between pay-as-you-go, reserved capacity, or auction-based pricing to suit your needs.
                </CardDescription>
              </CardContent>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Decentralized Computing Revolution?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you want to monetize your idle GPU or need computing power for your AI projects, GPULend makes it
            simple and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MotionButton
              size="lg"
              className="bg-white text-purple-900 hover:bg-zinc-200"
              whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/login">Create Account</Link>
            </MotionButton>
            <MotionButton
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="#how-it-works">Learn More</Link>
            </MotionButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#how-it-works" className="text-zinc-400 hover:text-white">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-zinc-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Cpu className="h-6 w-6 text-purple-500" />
              <span className="font-bold">GPULend</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} GPULend. Powered by Internet Computer Protocol. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
