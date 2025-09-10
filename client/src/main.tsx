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
// @ts-ignore
import TeamPage from "@/pages/teams.jsx";
// @ts-ignore
import ExploreTeamPage from "@/pages/explore-team.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
   
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
    path: "/teams/explore-team",
    element: <ProtectedRoute><DashboardProvider><ExploreTeamPage /></DashboardProvider></ProtectedRoute>
  },
  {
    path: "/profile",
    element: <>Hello</>
  }

]);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);
