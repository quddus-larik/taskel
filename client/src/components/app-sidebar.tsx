import * as React from "react"
import { SquareTerminal } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Fallbacks to prevent TS errors when user is null/undefined
  const data = {
    user: {
      name: user?.name ?? "Guest",
      email: user?.email ?? "guest@example.com",
      avatar: `https://avatar.iran.liara.run/username?username=${user?.name ?? "guest"}`,
    },
    navMain: [
      {
        title: "Taskel",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Teams",
            url: "/teams",
          },
          {
            title: "Dashboard",
            url: "/dashboard",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4">
        <p>Taskel</p>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
