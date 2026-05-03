import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const SITE_URL = process.env.VITE_SITE_URL ?? "https://dotslashlearn.com";

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      const val = rest.join(":").trim().replace(/^["']|["']$/g, "");
      result[key.trim()] = val;
    }
  }
  return result;
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const lessonsDir = path.join(root, "content/lessons");
const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".mdx"));

const lessons = files
  .map((f) => {
    const slug = f.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(lessonsDir, f), "utf-8");
    const fm = parseFrontmatter(raw);
    return { slug, ...fm };
  })
  .filter((l) => l.draft !== "true");

const categories = [...new Set(lessons.map((l) => l.category).filter(Boolean))];

const now = new Date().toISOString().split("T")[0];

const urls = [
  `  <url><loc>${SITE_URL}/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  `  <url><loc>${SITE_URL}/learn</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  ...categories.map(
    (cat) =>
      `  <url><loc>${SITE_URL}/categories/${toSlug(cat)}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  ),
  ...lessons.map(
    (l) =>
      `  <url><loc>${SITE_URL}/lessons/${l.slug}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const outPath = path.join(root, "public/sitemap.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`Sitemap written to ${outPath} (${urls.length} URLs)`);
