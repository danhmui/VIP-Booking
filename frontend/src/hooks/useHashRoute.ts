import { useCallback, useEffect, useState } from 'react'
import { readRoute, setAppRoute } from '../utils/router'
import type { Navigate, RouteKey } from '../types'

export function useAppRoute(): { currentRoute: RouteKey; navigate: Navigate } {
  const [currentRoute, setCurrentRoute] = useState<RouteKey>(() => readRoute())

  const navigate = useCallback<Navigate>((route, options) => {
    setAppRoute(route, options)
    setCurrentRoute(readRoute())
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return { currentRoute, navigate }
}
