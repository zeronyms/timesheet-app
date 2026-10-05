import { jsx, jsxs } from "react/jsx-runtime";
import { useRouter } from "@tanstack/react-router";
import { a as Route, u as unlockCommit } from "./router-VwyE4JWF.js";
import "./timesheet-CfPCugbW.js";
import "zod";
import "../server.js";
import "node:async_hooks";
import "node:stream";
import "react";
import "@tanstack/react-router/ssr/server";
function HistoryPage() {
  const records = Route.useLoaderData();
  const router = useRouter();
  const groups = Map.groupBy(records, (r) => r.timesheetFile);
  const files = [...groups.keys()].sort((a, b) => groups.get(b)[0].reportedAt.localeCompare(groups.get(a)[0].reportedAt));
  const unlock = async (r) => {
    if (!confirm(`Kembalikan commit ini ke daftar yang bisa dilaporkan?

${r.message}`)) return;
    await unlockCommit({
      data: {
        hash: r.hash
      }
    });
    router.invalidate();
  };
  if (records.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Belum ada commit yang dilaporkan. Buat timesheet pertama di halaman Susun timesheet." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Riwayat laporan" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-prose text-sm text-muted", children: "Commit di sini tidak muncul lagi saat menyusun timesheet. Kembalikan commit jika ingin melaporkannya ulang." })
    ] }),
    files.map((file) => /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "mb-2 text-sm font-medium", children: [
        file,
        " ",
        /* @__PURE__ */ jsxs("span", { className: "font-normal text-muted", children: [
          "(",
          groups.get(file).length,
          " tiket)"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border bg-surface", children: /* @__PURE__ */ jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { className: "divide-y", children: groups.get(file).map((r) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-3 py-2 text-muted", children: r.ticketNo }),
        /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-3 py-2", children: r.date }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
          r.message,
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted", children: [
            r.repo,
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: r.hash })
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsx("button", { onClick: () => unlock(r), className: "text-sm text-muted hover:text-danger hover:underline", children: "Kembalikan" }) })
      ] }, r.hash)) }) }) })
    ] }, file))
  ] });
}
export {
  HistoryPage as component
};
