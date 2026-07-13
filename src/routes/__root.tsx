import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/cookbook', label: 'Cookbook' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/groceries', label: 'Groceries' },
] as const

const RootLayout = () => {
  return (
    <>
      <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 [@media(display-mode:standalone)]:fixed [@media(display-mode:standalone)]:inset-x-0 [@media(display-mode:standalone)]:bottom-0 [@media(display-mode:standalone)]:border-t [@media(display-mode:standalone)]:border-b-0 [@media(display-mode:standalone)]:bg-background">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' }}
            activeOptions={{ exact: link.to === '/' }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="[@media(display-mode:standalone)]:pb-14">
        <Outlet />
      </div>
    </>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
