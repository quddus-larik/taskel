import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/status`,
          {
            method: "GET",
            credentials: "include", 
          }
        );

        const data: { authenticated: boolean; user: User | null } =
          await res.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("error by hook:", err.message);
        } else {
          console.error("unknown error by hook:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthStatus();
  }, []);

  return { user, loading };
}
