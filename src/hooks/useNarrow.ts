import { useEffect, useState } from 'react'

export function useNarrow(breakpoint = 860): boolean {
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth <= breakpoint)

  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth <= breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])

  return isNarrow
}
