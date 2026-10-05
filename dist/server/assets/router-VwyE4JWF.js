import { jsxs, jsx } from "react/jsx-runtime";
import { createRootRoute, HeadContent, Link, Scripts, createFileRoute, lazyRouteComponent, useRouter, ErrorComponent, createRouter } from "@tanstack/react-router";
import { r as recentMonths, m as monthDays } from "./timesheet-CfPCugbW.js";
import { z } from "zod";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
const appCss = "/assets/app-DsjgSpcJ.css";
const Route$2 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Timesheet MSI" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
      },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  shellComponent: RootDocument
});
const navLink = "px-3 py-1.5 rounded-md text-sm text-muted hover:text-ink";
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "id", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx("header", { className: "border-b bg-surface", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-semibold", children: [
          "Timesheet MSI",
          /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm font-normal text-muted", children: "IT Service & Maintenance, IHC" })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(Link, { to: "/", className: navLink, activeProps: { className: "bg-accent-soft !text-accent font-medium" }, children: "Susun timesheet" }),
          /* @__PURE__ */ jsx(Link, { to: "/riwayat", className: navLink, activeProps: { className: "bg-accent-soft !text-accent font-medium" }, children: "Riwayat" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-7xl px-4 py-6", children }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const MONTHS = recentMonths(/* @__PURE__ */ new Date(), 6);
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getAvailableRepos = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7a292620280c2cdd3cf4e1acc1038febb79fc510c4e3bd1d5d13adf6e9dd8ef8"));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const fetchCommits = createServerFn({
  method: "POST"
}).validator(z.object({
  repos: z.array(z.string()),
  author: z.string(),
  since: date,
  until: date
})).handler(createSsrRpc("6f5c5eeebd5a205d9c0e92a4c4cbf3a059714596557ef31d74dcbed104bc0f40"));
const fetchReportedHistory = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7ecddef10021a9cf3b2688dc335207149e53204db6ff8baf38829a36c1a1c3b5"));
const unlockCommit = createServerFn({
  method: "POST"
}).validator(z.object({
  hash: z.string()
})).handler(createSsrRpc("9d96d2f9e2e201cd0a6bd903db169c4477b36301abdcc1459e1e99de1c0db8ba"));
const $$splitComponentImporter$1 = () => import("./index-Df84vvms.js");
const IHC_REPOS = ["super-app-fe", "super-app-be", "ihc-office-fe", "ihc-office-be", "ihc-portal-fe", "ihc-portal-be"];
const lastDay = (ym) => monthDays(ym).at(-1);
const searchSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).catch(MONTHS[1]),
  since: z.string().catch(`${MONTHS.at(-1)}-01`),
  until: z.string().optional(),
  author: z.string().catch("kristian"),
  repos: z.array(z.string()).optional()
});
const Route$1 = createFileRoute("/")({
  validateSearch: searchSchema,
  loaderDeps: ({
    search
  }) => search,
  loader: async ({
    deps
  }) => {
    const allRepos = await getAvailableRepos();
    const defaultRepos = allRepos.filter((r) => IHC_REPOS.includes(r));
    const source = {
      repos: deps.repos ?? defaultRepos,
      author: deps.author,
      since: deps.since,
      until: deps.until ?? lastDay(deps.month)
    };
    const commits = await fetchCommits({
      data: source
    });
    return {
      allRepos,
      defaultRepos,
      source,
      commits
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./riwayat-BvL0xiUu.js");
const Route = createFileRoute("/riwayat")({
  loader: () => fetchReportedHistory(),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$2
});
const RiwayatRoute = Route.update({
  id: "/riwayat",
  path: "/riwayat",
  getParentRoute: () => Route$2
});
const rootRouteChildren = {
  IndexRoute,
  RiwayatRoute
};
const routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultCatchBoundary({ error }) {
  const router2 = useRouter();
  console.error(error);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(ErrorComponent, { error }),
    /* @__PURE__ */ jsx("button", { onClick: () => router2.invalidate(), className: "rounded-md border bg-surface px-3 py-1.5 text-sm hover:bg-paper", children: "Coba lagi" })
  ] });
}
function NotFound() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("p", { children: "Halaman ini tidak ada." }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "text-accent hover:underline", children: "Kembali ke Susun timesheet" })
  ] });
}
function getRouter() {
  const router2 = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
    scrollRestoration: true
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  MONTHS as M,
  Route$1 as R,
  Route as a,
  createSsrRpc as c,
  router as r,
  unlockCommit as u
};
