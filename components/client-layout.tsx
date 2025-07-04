'use client'

import { useState, useEffect } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)
  
  useEffect(() => {
    setHasMounted(true)
  }, [])
  
  // Instead of returning null, render children but with a loading state if needed
  return (
    <div className={hasMounted ? 'opacity-100' : 'opacity-0'}>
      {children}
    </div>
  )
} 