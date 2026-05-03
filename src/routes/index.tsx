import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAllLessons } from "@/features/lessons/api";
import { HomePage } from "@/features/home";
import { buildSeo } from "@/shared/seo/meta";

const fetchAllLessons = createServerFn().handler(() => {
  return getAllLessons();
});

export const Route = createFileRoute("/")({
  loader: () => fetchAllLessons(),
  head: () => buildSeo({ title: "./learn", path: "/" }),
  component: Home,
});

function Home() {
  const lessons = Route.useLoaderData();
  return <HomePage lessons={lessons} />;
}
