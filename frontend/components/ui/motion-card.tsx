"use client"

import { motion } from "framer-motion"
import { Card, type CardProps } from "@/components/ui/card"
import { forwardRef } from "react"

export interface MotionCardProps extends CardProps {
  hoverEffect?: boolean
}

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, hoverEffect = true, ...props }, ref) => {
    return (
      <motion.div
        whileHover={
          hoverEffect
            ? {
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(126, 34, 206, 0.5)",
                borderColor: "#9333ea",
              }
            : undefined
        }
      >
        <Card ref={ref} className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  },
)
MotionCard.displayName = "MotionCard"

export { MotionCard }
