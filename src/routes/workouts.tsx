import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workouts")({
	component: WorkoutsPage,
});

function WorkoutsPage() {
	return <h1>Workouts</h1>;
}
