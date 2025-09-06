import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', showText = true, className = '', variant = 'light' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  const isDark = variant === 'dark'
  const iconBg = isDark ? 'bg-white' : 'bg-gray-900'
  const iconColor = isDark ? 'text-gray-900' : 'text-white'
  const textColor = isDark ? 'text-white' : 'text-gray-900'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center flex-shrink-0`}>
        <Image
          src="/logo.png"
          alt="CrackSense Logo"
          width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`font-bold ${textColor} ${textSizes[size]}`}>
          CrackSense
        </span>
      )}
    </div>
  )
}
