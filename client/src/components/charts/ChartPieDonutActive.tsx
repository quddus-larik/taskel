"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface StatItem {
  title: string
  value: number
  icon: React.ReactNode
}

interface ChartPieDonutActiveProps {
  title: string
  description: string
  data: { browser: string; visitors: number; fill: string }[]
  config: ChartConfig
  activeIndex?: number
  stats: StatItem[]
}

export function ChartPieDonutActive({
  title,
  description,
  data,
  config,
  activeIndex = 0,
}: ChartPieDonutActiveProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-4 sm:flex-row sm:justify-between sm:items-center pt-4 border-t mt-4">
        Template based Chart Components
      </CardFooter>
    </Card>
  )
}