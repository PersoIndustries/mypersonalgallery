import { useI18n } from '@/lib/i18n';
import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps, } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getPublicCatalog } from "@/lib/catalog.functions";
import { StoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
function NotFoundComponent() {
    const { t } = useI18n();
    return (<div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">{t("Gallery closed")}</p>
        <h1 className="mt-3 font-display text-6xl">{t("404")}</h1>
        <h2 className="mt-3 text-xl">{t("This exhibit doesn't exist")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("The page you're looking for has been moved or was never on display.")}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">{t("Go home")}</Link>
          <Link to="/explore" className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">{t("Explore museums")}</Link>
        </div>
      </div>
    </div>);
}
function ErrorComponent({ error, reset }: ErrorComponentProps) {
    const { t } = useI18n();
    console.error(error);
    const router = useRouter();
    useEffect(() => {
        reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }, [error]);
    return (<div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">{t("This page didn't load")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("Something went wrong on our end. You can try refreshing or head back home.")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick= className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">{t("Try again")}</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">{t("Go home")}</a>
        </div>
      </div>
    </div>);
}
export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    loader: ({ context }) => context.queryClient.ensureQueryData({ queryKey: ["public-catalog"], queryFn: () => getPublicCatalog(), staleTime: 120000, gcTime: 600000 }),
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "MyOwnMuseum — Digital museums for collectors" },
            {
                name: "description",
                content: "Create beautiful digital museums for your collection: vintage radios, watches, cameras and more.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
            },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});
function RootShell({ children }: {
    children: ReactNode;
}) {
    const { t } = useI18n();
    return (<html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        
        <Scripts />
      </body>
    </html>);
}
function RootComponent() {
    const { t } = useI18n();
    const { queryClient } = Route.useRouteContext();
    const { data: catalog } = useSuspenseQuery({ queryKey: ["public-catalog"], queryFn: () => getPublicCatalog(), staleTime: 120000, gcTime: 600000 }, queryClient);
    return (<QueryClientProvider client=>
      <StoreProvider initialCatalog=>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            {/* Required: nested routes render here. */}
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster position="bottom-right"/>
      </StoreProvider>
    </QueryClientProvider>);
}
