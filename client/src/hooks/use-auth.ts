import { useEffect, useState } from "react"
import axios from "axios"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/auth/status", { withCredentials: true })
      .then(res => {
        if (res.data.authenticated) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      })
      .catch(() => {
        setUser(null);
        console.error("error by hook:", user)
      })
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
