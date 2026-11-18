export const COLORS = {
  unit: "#2fa36b",
  tenths: "#2f6fdf",
  hundredths: "#f0821e",
  total: "#7b3fc4",
  line: "#2b2b2b",
};

const N = 10;
const CELL = 10;
const SIZE = N * CELL;

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${SIZE + 2} ${SIZE + 2}" width="100%" height="100%">${content}</svg>`;
}

function lines({ vertical = true, horizontal = true } = {}) {
  let out = "";
  for (let i = 1; i < N; i++) {
    const p = i * CELL;
    if (vertical) out += `<line x1="${p}" y1="0" x2="${p}" y2="${SIZE}"/>`;
    if (horizontal) out += `<line x1="0" y1="${p}" x2="${SIZE}" y2="${p}"/>`;
  }
  return `<g stroke="${COLORS.line}" stroke-width="0.35">${out}</g>`
    + `<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="none" stroke="${COLORS.line}" stroke-width="1"/>`;
}

export function baseGrid() {
  return svg(`<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="#fff"/>${lines()}`);
}

export function tenthsGrid(count) {
  const fill = `<rect x="0" y="0" width="${count * CELL}" height="${SIZE}" fill="${COLORS.tenths}" fill-opacity="0.55"/>`;
  return svg(fill + lines({ horizontal: false }));
}

// Cells go in the column right after the tenths so the superposed total reads as one block.
export function hundredthsGrid(count, column) {
  let cells = "";
  for (let r = 0; r < count; r++) {
    cells += `<rect x="${column * CELL}" y="${r * CELL}" width="${CELL}" height="${CELL}"/>`;
  }
  return svg(`<g fill="${COLORS.hundredths}" fill-opacity="0.75">${cells}</g>${lines()}`);
}

export function unitGrid() {
  const fill = `<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${COLORS.unit}" fill-opacity="0.55"/>`;
  return svg(fill + lines());
}

export const PALETTE = ["#2f6fdf", "#f0821e", "#2fa36b", "#d6457a", "#1aa3b8"];

// Any cols × rows grid inside the same square; data-cell lets the page hit-test clicks.
export function customGrid({ cols, rows, filled = [], color, background = "none", fillOpacity = 0.6 }) {
  const cw = SIZE / cols;
  const ch = SIZE / rows;
  const on = new Set(filled);
  let cells = "";
  for (let i = 0; i < cols * rows; i++) {
    const x = (i % cols) * cw;
    const y = Math.floor(i / cols) * ch;
    const fill = on.has(i) ? `fill="${color}" fill-opacity="${fillOpacity}"` : `fill="#000" fill-opacity="0"`;
    cells += `<rect data-cell="${i}" x="${x}" y="${y}" width="${cw}" height="${ch}" ${fill}/>`;
  }
  let grid = "";
  for (let c = 1; c < cols; c++) grid += `<line x1="${c * cw}" y1="0" x2="${c * cw}" y2="${SIZE}"/>`;
  for (let r = 1; r < rows; r++) grid += `<line x1="0" y1="${r * ch}" x2="${SIZE}" y2="${r * ch}"/>`;
  return svg(
    `<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${background}"/>${cells}`
    + `<g stroke="${COLORS.line}" stroke-width="0.35" pointer-events="none">${grid}</g>`
    + `<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="none" stroke="${COLORS.line}" stroke-width="1" pointer-events="none"/>`,
  );
}
