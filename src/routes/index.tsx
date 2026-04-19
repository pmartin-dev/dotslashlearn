import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAllLessons } from "@/features/lessons/api";
import { HomePage } from "@/features/home";

const fetchAllLessons = createServerFn().handler(() => {
  return getAllLessons();
});

export const Route = createFileRoute("/")({
  loader: () => fetchAllLessons(),
  component: Home,
});

function Home() {
  const lessons = Route.useLoaderData();
  return <HomePage lessons={lessons} />;
}
