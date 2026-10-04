'use client'

import { useEffect, useState } from 'react'

// A phone = a narrow screen with a touch pointer. Tablets and small laptop windows
// count as "not a phone", so they get the full course.
export function useIsPhone(): boolean {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px) and (pointer: coarse)')
    const update = () => setPhone(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return phone
}
