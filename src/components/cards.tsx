import { Link } from "@tanstack/react-router";
import { Boxes, MapPin } from "lucide-react";
import type { CollectionObject, Museum, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function MuseumCard({
  museum,
  owner,
  count,
}: {
  museum: Museum;
  owner?: User | undefined;
  count: number;
}) {
  return (
    <Link
      to="/m/$slug"
      params={{ slug: museum.slug }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 plinth"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <img
          src={museum.cover}
          alt={museum.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <Badge variant="secondary" className="absolute left-3 top-3 backdrop-blur">
          {museum.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight transition-colors group-hover:text-primary">
          {museum.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {museum.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
          {owner ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="size-6">
                <AvatarImage src={owner.avatar} alt={owner.name} />
                <AvatarFallback>{owner.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {owner.name}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Boxes className="size-3.5" /> {count} objects
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ObjectCard({ object }: { object: CollectionObject }) {
  return (
    <Link
      to="/o/$objectId"
      params={{ objectId: object.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 plinth"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={object.images[0]}
          alt={object.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">
          {object.year} · {object.manufacturer.split(" ")[0]}
        </p>
        <h3 className="mt-1.5 font-display text-lg leading-snug transition-colors group-hover:text-primary">
          {object.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {object.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
          {object.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] font-medium">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function CollectorCard({ user, museums }: { user: User; museums: number }) {
  return (
    <Link
      to="/u/$username"
      params={{ username: user.username }}
      className="group flex gap-4 rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 plinth"
    >
      <Avatar className="size-14 ring-1 ring-border">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg leading-tight transition-colors group-hover:text-primary">
          {user.name}
        </h3>
        <p className="text-xs text-primary/80">@{user.username}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {user.bio || "No bio yet."}
        </p>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {user.location}
            </span>
          )}
          <span>{museums} museums</span>
        </div>
      </div>
    </Link>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border/80 bg-card">
          <Skeleton className="aspect-16/10 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 font-display text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
