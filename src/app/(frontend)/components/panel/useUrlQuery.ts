'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Reads and writes the query string without a Next.js navigation.
 * Next.js integrates window.history.pushState/replaceState with useSearchParams,
 * so the URL, the back button and the UI stay in sync while the page component
 * (and the workspace's local state) is not remounted.
 * Components using this hook must render inside <Suspense> to keep the route static.
 */
export function useUrlQuery() {
  const searchParams = useSearchParams()

  const get = useCallback((key: string) => searchParams.get(key), [searchParams])

  const set = useCallback(
    (updates: Record<string, string | null | undefined>, options: { replace?: boolean } = {}) => {
      const params = new URLSearchParams(window.location.search)
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const search = params.toString()
      const url = `${window.location.pathname}${search ? `?${search}` : ''}`
      if (url === `${window.location.pathname}${window.location.search}`) return
      if (options.replace) window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
    },
    [],
  )

  return { get, set }
}
