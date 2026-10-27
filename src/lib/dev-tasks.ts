/**
 * Dev backlog. Shape mirrors the future `dev_tasks` database table:
 * id uuid pk, title text, description text, area text, priority text (P0-P3),
 * status text, impact int (1-5), effort int (1-5), rank int, created_at date.
 */
export type TaskPriority = "P0" | "P1" | "P2" | "P3";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskArea =
  | "Backend"
  | "Auth"
  | "Privacy"
  | "Media"
  | "UX"
  | "SEO"
  | "Admin"
  | "Billing"
  | "Quality";

export interface DevTask {
  id: string;
  title: string;
  description: string;
  area: TaskArea;
  priority: TaskPriority;
  status: TaskStatus;
  impact: number;
  effort: number;
  rank: number;
  createdAt: string;
}

export const PRIORITIES: { key: TaskPriority; label: string; hint: string }[] = [
  { key: "P0", label: "P0 · Critical", hint: "Blocks launch" },
  { key: "P1", label: "P1 · High", hint: "Needed for v1" },
  { key: "P2", label: "P2 · Medium", hint: "Soon after launch" },
  { key: "P3", label: "P3 · Low", hint: "Nice to have" },
];
export const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];
export const AREAS: TaskArea[] = [
  "Backend", "Auth", "Privacy", "Media", "UX", "SEO", "Admin", "Billing", "Quality",
];

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { P0: 40, P1: 30, P2: 20, P3: 10 };

/** Score = priority weight + impact×4 − effort×2. Higher = do first. */
export const taskScore = (t: Pick<DevTask, "priority" | "impact" | "effort">) =>
  PRIORITY_WEIGHT[t.priority] + t.impact * 4 - t.effort * 2;

type Seed = [string, string, TaskArea, TaskPriority, number, number, TaskStatus?];
const seed: Seed[] = [
  ["Enable real backend database", "Move museums, objects, users and settings from browser storage to Lovable Cloud tables with access rules.", "Backend", "P0", 5, 4],
  ["Real authentication", "Replace demo sign-in with email/password and Google sign-in, password reset and sessions.", "Auth", "P0", 5, 3],
  ["Enforce visibility on public museum page", "Hidden objects and disabled features (price, docs, 3D, links) must not appear on /m/:slug.", "Privacy", "P0", 5, 2],
  ["Enforce visibility on object page", "Direct links to hidden objects or private museums return not found; respect per-object hidden features.", "Privacy", "P0", 5, 2],
  ["Image uploads", "Upload object and cover photos to file storage instead of pasting URLs; resize and compress.", "Media", "P0", 5, 3],
  ["Admin roles", "Separate roles table (admin/user); protect /admin so only admins can enter.", "Admin", "P0", 4, 2],
  ["Move dev backlog to a database table", "Persist these tasks in a dev_tasks table editable only by admins.", "Admin", "P1", 3, 1],
  ["Document uploads (PDF, manuals)", "Store documentation files and allow internal vs public visibility.", "Media", "P1", 4, 3],
  ["3D model viewer", "Accept .glb/.gltf uploads and render an interactive viewer instead of the placeholder.", "Media", "P1", 4, 4],
  ["Unique museum slugs & usernames", "Validate uniqueness and allow editing slugs without breaking links.", "Backend", "P1", 3, 2],
  ["Form validation", "Validate all forms (lengths, URLs, years, prices) with clear error messages.", "Quality", "P1", 3, 2],
  ["Per-page SEO and share images", "Dynamic titles, descriptions and share images for museums, objects and profiles.", "SEO", "P1", 4, 2],
  ["Reorder objects in a museum", "Drag and drop ordering and featured object selection.", "UX", "P2", 3, 2],
  ["Bulk edit objects", "Select multiple objects to hide/show, move or delete.", "UX", "P2", 3, 3],
  ["Explore: filters & pagination", "Filter by category, condition, era; paginate results from the database.", "UX", "P2", 3, 3],
  ["Follow collectors & likes", "Follow curators, like objects, show counts on profiles.", "UX", "P2", 3, 3],
  ["Plans and payments", "Free vs Pro plan (limits on museums/objects/storage) with subscription checkout.", "Billing", "P2", 4, 4],
  ["Admin moderation", "Admin can list users and museums, unpublish content and handle reports.", "Admin", "P2", 3, 3],
  ["Report content", "Visitors can report inappropriate museums or objects.", "Privacy", "P2", 2, 2],
  ["Mobile polish", "Review every page on phones: dashboard tables, dialogs, gallery.", "UX", "P2", 3, 2],
  ["Account deletion & data export", "Let users export their collection and delete their account.", "Privacy", "P2", 3, 2],
  ["Automated tests", "Tests for visibility rules, permissions and scoring.", "Quality", "P2", 3, 3],
  ["Error and empty states", "Friendly messages for empty museums, failed uploads and offline.", "UX", "P3", 2, 1],
  ["Analytics for curators", "Views per museum and object in the dashboard.", "UX", "P3", 3, 3],
  ["Multi-language (ES/EN)", "Translate the interface and let curators choose language.", "UX", "P3", 3, 3],
  ["Custom museum themes", "Accent colors and layout options per museum.", "UX", "P3", 2, 3],
  ["Sitemap & robots", "Generate sitemap with public museums and objects.", "SEO", "P3", 2, 1],
  ["Museum setup page & visibility toggles", "Preview, object visibility and feature switches per museum.", "UX", "P1", 4, 3, "done"],
];

export const SEED_TASKS: DevTask[] = seed.map(([title, description, area, priority, impact, effort, status], i) => ({
  id: `t${i + 1}`,
  title,
  description,
  area,
  priority,
  status: status ?? "todo",
  impact,
  effort,
  rank: i,
  createdAt: "2026-10-27",
}));
