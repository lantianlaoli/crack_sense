'use client'

import { useState, useEffect } from 'react'

interface CountingNumberProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}

export default function CountingNumber({ 
  end, 
  duration = 800, 
  prefix = '', 
  suffix = '', 
  className = '',
  decimals = 0
}: CountingNumberProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const startValue = 0

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = easeOutQuart * (end - startValue) + startValue

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end) // Ensure we end exactly at the target
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals)
    }
    return Math.floor(num).toLocaleString()
  }

  return (
    <span className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}