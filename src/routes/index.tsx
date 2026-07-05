import { createFileRoute } from '@tanstack/react-router'

const DashboardPage = () => {
  return <h1>Dashboard</h1>
}

export const Route = createFileRoute('/')({
  component: DashboardPage,
})
