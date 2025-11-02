
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
  { month: "July", desktop: 200 },
  { month: "Aug", desktop: 100 },
  { month: "Sep", desktop: 300 },
  { month: "Oct", desktop: 214 },
  { month: "Nov", desktop: 309 },
  { month: "Dec", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#253483",
  }
} satisfies ChartConfig

export function DashboardBarChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full ">
      <BarChart accessibilityLayer data={chartData} barCategoryGap={10}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)"
        radius={[3, 3, 0, 0]} 
        barSize={20}  />
      </BarChart>
    </ChartContainer>
  )
}
