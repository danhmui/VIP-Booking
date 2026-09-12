import type { FormEvent } from 'react'
import type { Navigate, RouteKey } from '../types'

export function handleRouteSubmit(
  event: FormEvent<HTMLFormElement>,
  route: RouteKey,
  navigate: Navigate,
) {
  event.preventDefault()
  navigate(route)
}
