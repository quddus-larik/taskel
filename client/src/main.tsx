import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import "./index.css";
import App from "./App.tsx";
import Dashboard from "./pages/dashboard.tsx";
import LoginPage from "./pages/login.tsx";
import SignUpPage from "./pages/signup.tsx";

import { ProtectedRoute, GuestRoute } from "@/components/providers/route-guards.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // Optional: if you have no loader, just omit it.
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: "/signup",
    element: <GuestRoute><SignUpPage /></GuestRoute>,
  },
]);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);
