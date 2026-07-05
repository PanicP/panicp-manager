import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

const RootLayout = () => {
  return (
    <>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/cookbook">Cookbook</Link>
        <Link to="/workouts">Workouts</Link>
        <Link to="/examples">Examples</Link>
      </nav>
      <Outlet />
    </>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
