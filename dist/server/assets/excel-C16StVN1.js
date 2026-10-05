import { c as createServerRpc, s as saveReportedCommits } from "./storage-DebVIUSn.js";
import { c as createServerFn } from "../server.js";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { z } from "zod";
import { M as MAX_TICKETS, a as monthLabel, t as ticketNo } from "./timesheet-CfPCugbW.js";
import "node:async_hooks";
import "node:stream";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const OUTPUT_DIR = "/mnt/c/Users/suriyadharma/Documents/Timesheet MSI";
const TEMPLATE_PATH = path.resolve(process.cwd(), "src/assets/template.xlsx");
const SST_TICKET = 15;
const SST_MONTH = 40;
const SST_TASK = 41;
const FIRST_ROW = 11;
const input = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  ticketPrefix: z.string().trim().min(1),
  commits: z.array(z.object({
    hash: z.string(),
    repo: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    message: z.string()
  })).min(1, "Pilih minimal 1 commit.").max(MAX_TICKETS, `Maksimal ${MAX_TICKETS} tiket.`)
});
const generateTimesheet_createServerFn_handler = createServerRpc({
  id: "6a1e0d4c1c7e33d07a0b713c92fa008c4e68ed47537f2224306009f22d650a77",
  name: "generateTimesheet",
  filename: "src/server/excel.ts"
}, (opts) => generateTimesheet.__executeServer(opts));
const generateTimesheet = createServerFn({
  method: "POST"
}).validator(input).handler(generateTimesheet_createServerFn_handler, ({
  data
}) => buildTimesheet(data));
const escapeXml = (s) => s.replace(/[&<>"']/g, (c) => `&${{
  "&": "amp",
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos"
}[c]};`);
const toExcelSerial = (date) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 864e5);
const setCellValue = (xml, cell, value) => xml.replace(new RegExp(`(<c r="${cell}"[^>]*>(?:<f>[^<]*</f>)?<v>).*?(</v></c>)`), `$1${value}$2`);
async function buildTimesheet({
  month,
  ticketPrefix,
  commits
}) {
  var _a;
  const label = monthLabel(month);
  const fileName = `Kristian Suriyadharma - Timesheet ${label} - IT Service & Maintenance.xlsx`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  const zip = await JSZip.loadAsync(await fs.readFile(TEMPLATE_PATH));
  const sstFile = zip.file("xl/sharedStrings.xml");
  const sheetFile = zip.file("xl/worksheets/sheet1.xml");
  if (!sstFile || !sheetFile) throw new Error("Template rusak: sharedStrings.xml atau sheet1.xml tidak ada.");
  const sstXml = await sstFile.async("string");
  let sheetXml = await sheetFile.async("string");
  const strings = sstXml.match(/<si>[\s\S]*?<\/si>/g) ?? [];
  if (strings.length < SST_TASK + MAX_TICKETS) throw new Error("Template tidak sesuai: jumlah sharedStrings kurang.");
  const si = (text) => `<si><t>${escapeXml(text)}</t></si>`;
  strings[SST_MONTH] = si(label.split(" ")[0]);
  for (let i = 0; i < MAX_TICKETS; i++) {
    strings[SST_TICKET + i] = si(ticketNo(ticketPrefix, i));
    strings[SST_TASK + i] = si(((_a = commits[i]) == null ? void 0 : _a.message) ?? "");
    if (commits[i]) sheetXml = setCellValue(sheetXml, `B${FIRST_ROW + i}`, toExcelSerial(commits[i].date));
  }
  const workdays = new Set(commits.map((c) => c.date)).size;
  sheetXml = setCellValue(sheetXml, "A1", escapeXml(`Timesheet Bulan ${label}`));
  sheetXml = setCellValue(sheetXml, "C38", workdays);
  sheetXml = setCellValue(sheetXml, "C39", commits.length);
  zip.file("xl/sharedStrings.xml", sstXml.slice(0, sstXml.indexOf("<si>")) + strings.join("") + "</sst>");
  zip.file("xl/worksheets/sheet1.xml", sheetXml);
  await fs.mkdir(OUTPUT_DIR, {
    recursive: true
  });
  await fs.writeFile(outputPath, await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6
    }
  }));
  const reportedAt = (/* @__PURE__ */ new Date()).toISOString();
  await saveReportedCommits(commits.map((c, i) => ({
    ...c,
    ticketNo: ticketNo(ticketPrefix, i),
    timesheetFile: fileName,
    reportedAt
  })));
  return {
    filePath: outputPath,
    tickets: commits.length,
    workdays
  };
}
export {
  generateTimesheet_createServerFn_handler
};
