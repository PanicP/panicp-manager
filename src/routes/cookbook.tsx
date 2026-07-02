import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookbook")({
	component: CookbookPage,
});

function CookbookPage() {
	return <h1>Cookbook</h1>;
}
