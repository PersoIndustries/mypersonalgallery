import { useI18n } from '@/lib/i18n';
import { Link } from "@tanstack/react-router";
import { Boxes, MapPin } from "lucide-react";
import type { CollectionObject, Museum, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
export function MuseumCard({ museum, owner, count, }: {
    museum: Museum;
    owner?: User | undefined;
    count: number;
}) {
    const { t } = useI18n();
    return (<Link to="/m/$slug" params= className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 plinth">
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <img src= alt= loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"/>
        <Badge variant="secondary" className="absolute left-3 top-3 backdrop-blur">
          
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight transition-colors group-hover:text-primary">
          
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
          
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Boxes className="size-3.5"/> {t(" objects")}</span>
        </div>
      </div>
    </Link>);
}
export function ObjectCard({ object }: {
    object: CollectionObject;
}) {
    const { t } = useI18n();
    return (<Link to="/o/$objectId" params= className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 plinth">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img src= alt= loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"/>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent"/>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">
          {t(" \u00B7 ")}
        </p>
        <h3 className="mt-1.5 font-display text-lg leading-snug transition-colors group-hover:text-primary">
          
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
          
        </div>
      </div>
    </Link>);
}
export function CollectorCard({ user, museums }: {
    user: User;
    museums: number;
}) {
    const { t } = useI18n();
    return (<Link to="/u/$username" params= className="group flex gap-4 rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 plinth">
      <Avatar className="size-14 ring-1 ring-border">
        <AvatarImage src= alt=/>
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg leading-tight transition-colors group-hover:text-primary">
          
        </h3>
        <p className="text-xs text-primary/80">{t("@")}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          
        </p>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          
          <span>{t(" museums")}</span>
        </div>
      </div>
    </Link>);
}
export function CardSkeletonGrid({ count = 6 }: {
    count?: number;
}) {
    const { t } = useI18n();
    return (<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      
    </div>);
}
export function EmptyState({ icon: Icon, title, description, action, }: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    title: string;
    description: string;
    action?: React.ReactNode | undefined;
}) {
    const { t } = useI18n();
    return (<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="size-6"/>
      </span>
      <h3 className="mt-5 font-display text-xl"></h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        
      </p>
      
    </div>);
}
