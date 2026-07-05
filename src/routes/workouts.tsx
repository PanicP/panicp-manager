import { createFileRoute } from '@tanstack/react-router'

const WorkoutsPage = () => {
  return <h1>Workouts</h1>
}

export const Route = createFileRoute('/workouts')({
  component: WorkoutsPage,
})
