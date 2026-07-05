import { createFileRoute } from '@tanstack/react-router'

const CookbookPage = () => {
  return <h1>Cookbook</h1>
}

export const Route = createFileRoute('/cookbook')({
  component: CookbookPage,
})
