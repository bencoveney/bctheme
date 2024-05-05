import { references } from "./reference-colors.js";
import { roundTo } from "./math-functions.js";
import { culori, setTextClass } from "./external.js";

window.addEventListener("load", () => {
  initReferenceTable();
});

function initReferenceTable() {
  references.map(stampReferenceTableRow);
  stampFilterButton("all");
  stampFilterButton("100");
  stampFilterButton("500");
  stampFilterButton("900");
}

const okhslConverter = culori.converter("okhsl");
const okhsvConverter = culori.converter("okhsv");
const oklchConverter = culori.converter("oklch");

const referenceTableRows = document.querySelector(".reference-table-rows");
function stampReferenceTableCell(row, style, content) {
  const cell = document.createElement("td");
  Object.entries(style).forEach(([key, value]) => {
    cell.style[key] = value;
  });
  if (typeof content === "string") {
    cell.innerText = content;
  } else if (typeof content === "number") {
    cell.innerText = roundTo(content, 2);
  } else if (typeof content === "undefined") {
    cell.innerText = "-";
  }
  row.appendChild(cell);
  return cell;
}

function stampReferenceTableRow(color) {
  const { set, name, tint, hex, parsed } = color;

  const row = document.createElement("tr");
  if (tint) {
    row.classList.add(`reference-tint-${tint}`);
  }
  referenceTableRows.appendChild(row);

  const preview = stampReferenceTableCell(
    row,
    { backgroundColor: hex, fontFamily: "monospace" },
    hex
  );
  setTextClass(preview, parsed);

  stampReferenceTableCell(row, {}, set);
  stampReferenceTableCell(row, {}, name);
  stampReferenceTableCell(row, { textAlign: "right" }, tint);

  const okhsl = okhslConverter(parsed);

  stampReferenceTableCell(row, {}, okhsl.h);
  stampReferenceTableCell(row, {}, okhsl.s);
  stampReferenceTableCell(row, {}, okhsl.l);

  const okhsv = okhsvConverter(parsed);

  stampReferenceTableCell(row, {}, okhsv.s);
  stampReferenceTableCell(row, {}, okhsv.v);

  const oklch = oklchConverter(parsed);

  stampReferenceTableCell(row, {}, oklch.l);
  stampReferenceTableCell(row, {}, oklch.c);
}

const referenceFilters = document.querySelector(".reference-filters");
function stampFilterButton(filter) {
  const button = document.createElement("button");
  button.innerText = `Filter to ${filter}`;
  referenceFilters.appendChild(button);

  button.addEventListener("click", () => {
    Array.from(referenceTableRows.classList.values())
      .filter((className) => className.startsWith("filter"))
      .forEach((className) => referenceTableRows.classList.remove(className));
    referenceTableRows.classList.add(`filter-${filter}`);
  });
}
