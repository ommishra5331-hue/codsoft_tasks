const $ = id => document.getElementById(id);
const CATS = {
  expense: ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"],
  income: ["Salary", "Pocket Money", "Freelance", "Gift", "Other"]
};
const money = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

let items = [];
let editingId = null;
try { items = JSON.parse(localStorage.getItem("et_items") || "[]"); } catch (e) { items = []; }
const store = () => { try { localStorage.setItem("et_items", JSON.stringify(items)); } catch (e) {} };

/* Theme */
function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
function paintTheme() { $("theme").textContent = isDark() ? "☀ Light" : "🌙 Dark"; }
try { const t = localStorage.getItem("et_theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
$("theme").onclick = () => {
  const next = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("et_theme", next); } catch (e) {}
  paintTheme();
};
paintTheme();

/* Helpers */
function todayStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function fillCats(select, list, keepAll) {
  select.innerHTML = "";
  if (keepAll) select.add(new Option("All categories", "all"));
  list.forEach(c => select.add(new Option(c, c)));
}
function setFormCats() { fillCats($("fCat"), CATS[$("fType").value]); }

/* Form */
function resetForm() {
  editingId = null;
  $("fType").value = "expense"; setFormCats();
  $("fAmount").value = ""; $("fDesc").value = ""; $("fDate").value = todayStr();
  $("save").textContent = "Add transaction"; $("formTitle").textContent = "Add transaction";
  $("cancel").hidden = true; $("err").textContent = "";
}
function validate(amount, desc, date) {
  if (!amount || isNaN(amount)) return "Enter an amount.";
  if (amount <= 0) return "Amount must be greater than 0.";
  if (amount > 1e9) return "Amount is too large.";
  if (desc.length < 2) return "Add a short description (at least 2 characters).";
  if (!date) return "Choose a date.";
  if (date > todayStr()) return "Date can't be in the future.";
  return "";
}
$("fType").onchange = setFormCats;
$("save").onclick = () => {
  const amount = parseFloat($("fAmount").value);
  const desc = $("fDesc").value.trim();
  const date = $("fDate").value;
  const msg = validate(amount, desc, date);
  $("err").textContent = msg;
  if (msg) return;
  const data = { type: $("fType").value, amount: Math.round(amount * 100) / 100, category: $("fCat").value, date, desc };
  if (editingId) Object.assign(items.find(t => t.id === editingId), data);
  else items.push({ id: Date.now(), ...data });
  store(); resetForm(); render();
};
$("cancel").onclick = resetForm;
document.querySelectorAll(".form input").forEach(el =>
  el.addEventListener("keydown", e => { if (e.key === "Enter") $("save").click(); }));

function startEdit(t) {
  editingId = t.id;
  $("fType").value = t.type; setFormCats();
  $("fCat").value = t.category; $("fAmount").value = t.amount; $("fDate").value = t.date; $("fDesc").value = t.desc;
  $("save").textContent = "Save changes"; $("formTitle").textContent = "Edit transaction";
  $("cancel").hidden = false; $("err").textContent = "";
  $("fAmount").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Render */
function render() {
  const income = items.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = items.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  $("cIncome").textContent = money(income);
  $("cExpense").textContent = money(expense);
  $("cBalance").textContent = money(income - expense);
  renderInsights(income, expense);

  const ft = $("fTypeFilter").value, fc = $("fCatFilter").value, fm = $("fMonth").value;
  const shown = items
    .filter(t => (ft === "all" || t.type === ft) && (fc === "all" || t.category === fc) && (!fm || t.date.startsWith(fm)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  const list = $("list");
  list.innerHTML = "";
  if (!shown.length) {
    const e = document.createElement("li");
    e.className = "empty";
    e.textContent = items.length ? "No transactions match these filters." : "No transactions yet. Add your first one.";
    list.appendChild(e);
  }
  shown.forEach(t => {
    const li = document.createElement("li");
    const dot = document.createElement("div");
    dot.className = "dot " + t.type; dot.textContent = t.type === "income" ? "+" : "−";
    const info = document.createElement("div"); info.className = "info";
    const d = document.createElement("div"); d.className = "desc"; d.textContent = t.desc;
    const m = document.createElement("div"); m.className = "meta";
    m.textContent = t.category + " • " + new Date(t.date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    info.append(d, m);
    const amt = document.createElement("div");
    amt.className = "amt " + t.type; amt.textContent = (t.type === "income" ? "+" : "−") + money(t.amount);
    const acts = document.createElement("div"); acts.className = "acts";
    const ed = document.createElement("button"); ed.textContent = "Edit"; ed.onclick = () => startEdit(t);
    const del = document.createElement("button"); del.className = "del"; del.textContent = "Delete";
    del.onclick = () => {
      if (!confirm("Delete this transaction?")) return;
      items = items.filter(x => x.id !== t.id);
      if (editingId === t.id) resetForm();
      store(); render();
    };
    acts.append(ed, del);
    li.append(dot, info, amt, acts);
    list.appendChild(li);
  });
  $("foot").textContent = "Showing " + shown.length + " of " + items.length + " transactions";
}

function renderInsights(income, expense) {
  const bars = $("bars"); bars.innerHTML = "";
  const byCat = {};
  items.filter(t => t.type === "expense").forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const rows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  if (!rows.length) { $("insight").textContent = "Add some expenses to see insights."; return; }
  const rate = income > 0 ? Math.round(((income - expense) / income) * 100) : null;
  $("insight").textContent = "Top spending: " + rows[0][0] + " (" + money(rows[0][1]) + ")." +
    (rate !== null ? " Savings rate: " + rate + "%." : "");
  rows.forEach(([c, v]) => {
    const wrap = document.createElement("div"); wrap.className = "bar";
    const row = document.createElement("div"); row.className = "row";
    const a = document.createElement("span"); a.textContent = c;
    const b = document.createElement("span"); b.textContent = money(v);
    row.append(a, b);
    const track = document.createElement("div"); track.className = "track";
    const fill = document.createElement("div"); fill.className = "fill"; fill.style.width = (v / expense * 100) + "%";
    track.appendChild(fill); wrap.append(row, track); bars.appendChild(wrap);
  });
}

/* Init */
fillCats($("fCatFilter"), Array.from(new Set([...CATS.expense, ...CATS.income])), true);
["fTypeFilter", "fCatFilter", "fMonth"].forEach(id => $(id).addEventListener("input", render));
resetForm();
render();
