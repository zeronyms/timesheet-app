/// <reference types="vite/client" />
import {
    HeadContent,
    Link,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "Timesheet MSI" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
            },
            { rel: "icon", href: "/favicon.ico" },
        ],
    }),
    shellComponent: RootDocument,
});

const navLink = "px-3 py-1.5 rounded-md text-sm text-muted hover:text-ink";

function RootDocument({ children }: { children: ReactNode }) {
    return (
        <html lang="id">
            <head>
                <HeadContent />
            </head>
            <body>
                <header className="border-b bg-surface">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                        <p className="font-semibold">
                            Timesheet MSI
                            <span className="ml-2 text-sm font-normal text-muted">
                                IT Service & Maintenance, IHC
                            </span>
                        </p>
                        <nav className="flex gap-1">
                            <Link
                                to="/"
                                className={navLink}
                                activeProps={{
                                    className:
                                        "bg-accent-soft !text-accent font-medium",
                                }}
                            >
                                Susun timesheet
                            </Link>
                            <Link
                                to="/riwayat"
                                className={navLink}
                                activeProps={{
                                    className:
                                        "bg-accent-soft !text-accent font-medium",
                                }}
                            >
                                Riwayat
                            </Link>
                            <Link
                                to="/tentang"
                                className={navLink}
                                activeProps={{
                                    className:
                                        "bg-accent-soft !text-accent font-medium",
                                }}
                            >
                                Tentang
                            </Link>
                        </nav>
                    </div>
                </header>
                <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
                <Scripts />
            </body>
        </html>
    );
}
