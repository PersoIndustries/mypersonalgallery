import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchX, Search } from "lucide-react";
import { useState } from "react";
import {
  CardSkeletonGrid,
  CollectorCard,
  EmptyState,
  MuseumCard,
  ObjectCard,
} from "@/components/cards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";

type Tab = "museums" | "objects" | "collectors";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined; tab?: Tab | undefined } => ({
    q: typeof search["q"] === "string" && search["q"] ? (search["q"] as string) : undefined,
    tab: (["museums", "objects", "collectors"] as const).includes(search["tab"] as Tab)
      ? (search["tab"] as Tab)
      : undefined,
  }),
  head: () => ({
    meta: [
      {property:"og:type",content:"website"},
      {name:"twitter:card",content:"summary_large_image"},
      { title: "Explore museums and collectors — MyOwnMuseum" },
      {
        name: "description",
        content:
          "Browse public museums of vintage radios, avionics, watches and cameras, and discover the collectors behind them.",
      },
      { property: "og:title", content: "Explore collections on MyOwnMuseum" },
      {
        property: "og:description",
        content: "Search museums, objects and collectors across the platform.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { q, tab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { publicMuseums: museums, publicObjects: objects, users, ready } = useStore();
  const [query, setQuery] = useState(q ?? "");
  const [category, setCategory] = useState<string>("All");

  const term = (q ?? "").toLowerCase();
  const matchCat = (c: string) => category === "All" || c === category;

  const filteredMuseums = museums.filter(
    (m) =>
      matchCat(m.category) &&
      (!term ||
        [m.title, m.description, m.category].join(" ").toLowerCase().includes(term)),
  );
  const filteredObjects = objects.filter(
    (o) =>
      matchCat(o.category) &&
      (!term ||
        [o.title, o.description, o.manufacturer, o.model, o.year, ...o.tags]
          .join(" ")
          .toLowerCase()
          .includes(term)),
  );
  const filteredUsers = users.filter(
    (u) => !term || [u.name, u.username, u.bio, u.location].join(" ").toLowerCase().includes(term),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: query || undefined }) });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="fade-up">
        <p className="eyebrow">Directory</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Explore the collections</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {museums.length} museums, {objects.length} catalogued objects and{" "}
          {users.length} collectors — search by name, manufacturer, year or tag.
        </p>
      </div>

      <form onSubmit={submit} className="relative mt-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “Collins”, “WWII”, “aircraft”, “diver”…"
            className="h-12 pl-10"
          />
        </div>
        <Button type="submit" size="lg">
          Search
        </Button>
      </form>

      <div className="scrollbar-thin mt-5 flex gap-2 overflow-x-auto pb-2">
        {["All", ...CATEGORIES].map((c) => (
          <Button
            key={c}
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => setCategory(c)}
            className="shrink-0"
          >
            {c}
          </Button>
        ))}
      </div>

      <Tabs
        value={tab ?? "museums"}
        onValueChange={(v) => navigate({ search: (prev) => ({ ...prev, tab: v as Tab }) })}
        className="mt-10"
      >
        <TabsList>
          <TabsTrigger value="museums">Museums ({filteredMuseums.length})</TabsTrigger>
          <TabsTrigger value="objects">Objects ({filteredObjects.length})</TabsTrigger>
          <TabsTrigger value="collectors">Collectors ({filteredUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="museums" className="mt-8">
          {!ready ? (
            <CardSkeletonGrid />
          ) : filteredMuseums.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No museums match that search"
              description="Try a broader term or clear the category filter."
              action={
                <Button variant="outline" onClick={() => setCategory("All")}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMuseums.map((m) => (
                <MuseumCard
                  key={m.id}
                  museum={m}
                  owner={users.find((u) => u.id === m.ownerId)}
                  count={objects.filter((o) => o.museumId === m.id).length}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="objects" className="mt-8">
          {!ready ? (
            <CardSkeletonGrid />
          ) : filteredObjects.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No objects found"
              description="Nothing in the catalogue matches that description yet."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredObjects.map((o) => (
                <ObjectCard key={o.id} object={o} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collectors" className="mt-8">
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No collectors found"
              description="Try searching by name, callsign or city."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((u) => (
                <CollectorCard
                  key={u.id}
                  user={u}
                  museums={museums.filter((m) => m.ownerId === u.id).length}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
