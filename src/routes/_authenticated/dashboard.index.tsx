import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Landmark, Boxes, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/_authenticated/dashboard/")({
    head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Your collection overview — MyOwnMuseum" }, { name: "description", content: "Your collection overview." }, { property: "og:title", content: "Your collection overview — MyOwnMuseum" }, { property: "og:description", content: "Your collection overview." }, { name: "robots", content: "noindex" }] }),
    component: DashboardOverview,
});
function DashboardOverview() {
    const { t } = useI18n();
    const { currentUser, museumsOf, objectsOf } = useStore();
    if (!currentUser)
        return null;
    const myMuseums = museumsOf(currentUser.id);
    const myObjects = myMuseums.flatMap((m) => objectsOf(m.id));
    const publicCount = myMuseums.filter((m) => m.isPublic).length;
    const featured = myObjects.filter((o) => o.featured).length;
    const stats = [
        { label: "Museums", value: myMuseums.length, icon: Landmark },
        { label: "Objects catalogued", value: myObjects.length, icon: Boxes },
        { label: "Public museums", value: publicCount, icon: Eye },
        { label: "Featured pieces", value: featured, icon: Sparkles },
    ];
    return (<div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-display text-2xl">{t("Your museums")}</CardTitle>
          <Button asChild size="sm">
            <Link to="/dashboard/museums">{t("Manage")}</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          
        </CardContent>
      </Card>
    </div>);
}
