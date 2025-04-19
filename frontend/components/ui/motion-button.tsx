"use client"

import { motion } from "framer-motion"
import { Button, type ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

export interface MotionButtonProps extends ButtonProps {
  hoverScale?: number
}

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className, hoverScale = 1.05, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: hoverScale }} whileTap={{ scale: 0.95 }}>
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    )
  },
)
MotionButton.displayName = "MotionButton"

export { MotionButton }
