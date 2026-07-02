import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: RootLayout,
});

function RootLayout() {
	return (
		<>
			<nav>
				<Link to="/">Dashboard</Link>
				<Link to="/cookbook">Cookbook</Link>
				<Link to="/workouts">Workouts</Link>
			</nav>
			<Outlet />
		</>
	);
}
