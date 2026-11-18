// Writes the grids as SVG + transparent PNG (for Google Slides, which doesn't import SVG).
// Usage: pnpm export [tenths=7] [hundredths=5]
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  baseGrid,
  hundredthsGrid,
  tenthsGrid,
  unitGrid,
} from "../src/activities/fractions/grids.ts";

const tenths = Number(process.argv[2] ?? 7);
const hundredths = Number(process.argv[3] ?? 5);
const out = resolve(import.meta.dirname, "../exports");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PX = 1000;

mkdirSync(out, { recursive: true });
const files = {
  "grille-100-centiemes": baseGrid(),
  "grille-1-unite": unitGrid(),
  [`grille-${tenths}-dixiemes`]: tenthsGrid(tenths),
  [`grille-${hundredths}-centiemes`]: hundredthsGrid(hundredths, tenths),
};

for (const [name, svg] of Object.entries(files)) {
  const sized = svg.replace('width="100%" height="100%"', `width="${PX}" height="${PX}"`);
  writeFileSync(`${out}/${name}.svg`, sized);
  const html = `${out}/.${name}.html`;
  writeFileSync(html, `<html><body style="margin:0;background:transparent">${sized}</body></html>`);
  execFileSync(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--default-background-color=00000000",
      `--window-size=${PX},${PX}`,
      `--screenshot=${out}/${name}.png`,
      `file://${html}`,
    ],
    { stdio: "ignore" },
  );
  rmSync(html);
  console.log(`exports/${name}.png`);
}
