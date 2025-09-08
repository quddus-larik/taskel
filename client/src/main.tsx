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
import DashboardProvider from "@/components/providers/dashboard-provider.tsx";

import { ProtectedRoute, GuestRoute } from "@/components/providers/route-guards.tsx";
import TeamPage from "./pages/teams.tsx";
import ExploreTeamPage from "./pages/explore-team.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // Optional: if you have no loader, just omit it.
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><DashboardProvider><Dashboard /></DashboardProvider></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: "/signup",
    element: <GuestRoute><SignUpPage /></GuestRoute>,
  },
  {
    path: "/teams",
    element: <ProtectedRoute><DashboardProvider><TeamPage /></DashboardProvider></ProtectedRoute>,
  },
  {
    path: "/explore-team",
    element: <ProtectedRoute><DashboardProvider><ExploreTeamPage /></DashboardProvider></ProtectedRoute>
  }

]);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);
