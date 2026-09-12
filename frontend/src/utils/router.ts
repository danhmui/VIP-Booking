import { routeByPath, routePaths } from '../data/routes'
import type { NavigateOptions, RouteKey } from '../types'

function normalizePath(path: string) {
  return path.replace(/^\/+/, '').replace(/\/$/, '') || routePaths.home
}

export function readRoute(): RouteKey {
  const path = normalizePath(window.location.pathname)

  if (/^rooms\/[^/]+$/.test(path)) {
    return 'roomDetail'
  }

  return routeByPath[path] ?? 'notFound'
}

export function getCurrentRoomSlug() {
  const path = normalizePath(window.location.pathname)
  const match = path.match(/^rooms\/([^/]+)$/)
  return match?.[1]
}

export function getRouteHref(route: RouteKey, options?: NavigateOptions) {
  return `/${options?.path ?? routePaths[route]}`
}

export function setAppRoute(route: RouteKey, options?: NavigateOptions) {
  const nextPath = getRouteHref(route, options)

  if (window.location.pathname === nextPath) {
    window.dispatchEvent(new PopStateEvent('popstate'))
    return
  }

  window.history.pushState(null, '', nextPath)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
