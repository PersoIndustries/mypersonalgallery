import { useI18n } from '@/lib/i18n';
import { Link } from "@tanstack/react-router";
export function SiteFooter() {
    const { t } = useI18n();
    return (<footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="size-8 rounded-md ring-1 ring-primary/25"/>
            <span className="font-display text-lg">Moon <span className="text-primary">Collector</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("A home for private collections. Catalogue your objects with care and share them with the world.")}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="eyebrow">{t("Discover")}</p>
            <Link to="/explore" className="block text-muted-foreground hover:text-foreground">{t("Museums")}</Link>
            <Link to="/explore" search={{ tab: "collectors" }} className="block text-muted-foreground hover:text-foreground">{t("Collectors")}</Link>
            <Link to="/explore" search={{ tab: "objects" }} className="block text-muted-foreground hover:text-foreground">{t("Objects")}</Link>
          </div>
          <div className="space-y-3">
            <p className="eyebrow">{t("Curate")}</p>
            <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground">{t("Dashboard")}</Link>
            <Link to="/dashboard/museums" className="block text-muted-foreground hover:text-foreground">{t("My museums")}</Link>
            <Link to="/dashboard/settings" className="block text-muted-foreground hover:text-foreground">{t("Settings")}</Link>
            <Link to="/dashboard/plans" className="block text-muted-foreground hover:text-foreground">{t("Museum plans")}</Link>
          </div>
          <div className="space-y-3">
            <p className="eyebrow">{t("Legal")}</p>
            <Link to="/privacy" className="block text-muted-foreground hover:text-foreground">{t("Privacy policy")}</Link>
            <Link to="/terms" className="block text-muted-foreground hover:text-foreground">{t("Terms of use")}</Link>
            <Link to="/help" className="block text-muted-foreground hover:text-foreground">{t("Help")}</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">{t("\u00A9 ")}{new Date().getFullYear()}{t(" Moon Collector \u2014 built for collectors.")}</div>
    </footer>);
}
