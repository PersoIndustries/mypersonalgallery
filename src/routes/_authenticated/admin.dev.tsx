import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { getAdminTasks, saveAdminTasks } from '@/lib/catalog.functions';
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AREAS,
  PRIORITIES,
  SEED_TASKS,
  STATUSES,
  taskScore,
  type DevTask,
  type TaskArea,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/dev-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/dev")({
  head: () => ({
    meta: [
      {property:"og:type",content:"website"},
      {name:"twitter:card",content:"summary_large_image"},
      { title: "Dev backlog — MyOwnMuseum Admin" },
      { name: "description", content: "Prioritized product backlog to finish MyOwnMuseum." },
      { property: "og:title", content: "Dev backlog — MyOwnMuseum Admin" },
      { property: "og:description", content: "Prioritized product backlog to finish MyOwnMuseum." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DevPage,
});

const KEY = "myownmuseum.devtasks.v1";
type SortMode = "manual" | "score";

const priorityTone: Record<TaskPriority, string> = {
  P0: "bg-destructive/15 text-destructive border-destructive/30",
  P1: "bg-primary/15 text-primary border-primary/30",
  P2: "bg-secondary text-secondary-foreground border-border",
  P3: "bg-muted text-muted-foreground border-border",
};

function DevPage() {
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const fetchTasks=useServerFn(getAdminTasks);
  const persistTasks=useServerFn(saveAdminTasks);
  const [loaded, setLoaded] = useState(false);
  const [sort, setSort] = useState<SortMode>("score");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [newTitle, setNewTitle] = useState("");const [saveState,setSaveState]=useState('');const [dirty,setDirty]=useState(false);

  useEffect(() => { void fetchTasks().then(rows=>{setTasks(rows);setLoaded(true);}).catch(e=>toast.error(e.message)); }, [fetchTasks]);
  useEffect(() => { if(!loaded||!dirty)return;setSaveState('Unsaved changes');const timer=setTimeout(()=>{setSaveState('Saving…');void persistTasks({data:tasks}).then(()=>setSaveState('Saved')).catch(e=>{setSaveState('Save failed');toast.error(e.message);});},1000);return ()=>clearTimeout(timer); }, [tasks,loaded,dirty,persistTasks]);

  const update = (id: string, patch: Partial<DevTask>) => {setDirty(true);setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));};

  const visible = useMemo(() => {
    const list = tasks.filter((t) => statusFilter === "all" || t.status === statusFilter);
    return [...list].sort((a, b) =>
      sort === "score" ? taskScore(b) - taskScore(a) || a.rank - b.rank : a.rank - b.rank,
    );
  }, [tasks, sort, statusFilter]);

  const move = (id: string, dir: -1 | 1) => {
    setDirty(true);
    const ordered = [...tasks].sort((a, b) => a.rank - b.rank);
    const i = ordered.findIndex((t) => t.id === id);
    const j = i + dir;
    if (j < 0 || j >= ordered.length) return;
    const a=ordered[i], b=ordered[j];
    if(!a || !b)return;
    ordered[i] = b;
    ordered[j] = a;
    setTasks(ordered.map((t, idx) => ({ ...t, rank: idx })));
  };

  const add = () => {
    setDirty(true);
    if (!newTitle.trim()) return;
    const maxRank = Math.max(-1, ...tasks.map((t) => t.rank));
    setTasks((ts) => [
      ...ts,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        description: "",
        area: "UX",
        priority: "P2",
        status: "todo",
        impact: 3,
        effort: 3,
        rank: maxRank + 1,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setNewTitle("");
  };

  const done = tasks.filter((t) => t.status === "done").length;
  const counts = PRIORITIES.map((p) => ({
    ...p,
    open: tasks.filter((t) => t.priority === p.key && t.status !== "done").length,
  }));

  return (
    <div className="space-y-6">
      <p role="status" className="text-sm text-muted-foreground">{saveState}</p>
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Progress</p>
          <p className="mt-1 font-display text-3xl">
            {done}/{tasks.length}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        {counts.map((c) => (
          <div key={c.key} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl">{c.open}</p>
            <p className="text-xs text-muted-foreground">{c.hint} · open</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Sort: priority score</SelectItem>
            <SelectItem value="manual">Sort: manual order</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | TaskStatus)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <form
          className="flex w-full gap-2 sm:ml-auto sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New task…" className="min-w-0 flex-1 sm:w-64" />
          <Button type="submit" size="sm"><Plus className="size-4" /> Add</Button>
        </form>
      </div>
      <p className="text-xs text-muted-foreground">
        Score = priority (P0 40 · P1 30 · P2 20 · P3 10) + impact × 4 − effort × 2. Switch to manual order to arrange with the arrows.
      </p>

      <div className="space-y-2">
        {visible.map((t) => (
          <div
            key={t.id}
            className={`grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[auto_1fr_auto] ${t.status === "done" ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-1 lg:flex-col">
              <Button size="icon" variant="ghost" className="size-7" disabled={sort !== "manual"} onClick={() => move(t.id, -1)} aria-label="Move up">
                <ArrowUp className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7" disabled={sort !== "manual"} onClick={() => move(t.id, 1)} aria-label="Move down">
                <ArrowDown className="size-4" />
              </Button>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={priorityTone[t.priority]}>{t.priority}</Badge>
                <Badge variant="outline">{t.area}</Badge>
                <span className="font-mono text-xs text-muted-foreground">score {taskScore(t)}</span>
              </div>
              <input
                value={t.title}
                onChange={(e) => update(t.id, { title: e.target.value })}
                className="mt-2 w-full bg-transparent font-medium outline-none"
              />
              <textarea
                value={t.description}
                onChange={(e) => update(t.id, { description: e.target.value })}
                placeholder="Description"
                rows={1}
                className="mt-1 w-full resize-none bg-transparent text-sm text-muted-foreground outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={t.priority} onValueChange={(v) => update(t.id, { priority: v as TaskPriority })}>
                <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={t.status} onValueChange={(v) => update(t.id, { status: v as TaskStatus })}>
                <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={t.area} onValueChange={(v) => update(t.id, { area: v as TaskArea })}>
                <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Scale label="Impact" value={t.impact} onChange={(impact) => update(t.id, { impact })} />
              <Scale label="Effort" value={t.effort} onChange={(effort) => update(t.id, { effort })} />
              <Button size="icon" variant="ghost" className="size-8 text-muted-foreground" aria-label="Delete" onClick={() => {setDirty(true);setTasks((ts) => ts.filter((x) => x.id !== t.id));}}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="h-8 w-28"><SelectValue>{label} {value}</SelectValue></SelectTrigger>
      <SelectContent>
        {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{label} {n}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
