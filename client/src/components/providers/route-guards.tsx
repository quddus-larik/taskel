import { Navigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import type { JSX } from "react"

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return children
}

export function GuestRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (user) return <Navigate to="/dashboard" replace />

  return children
}
