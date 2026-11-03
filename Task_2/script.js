const $ = id => document.getElementById(id);
let tasks = [], editingId = null;
try { tasks = JSON.parse(localStorage.getItem("tm_tasks") || "[]"); } catch (e) { tasks = []; }
const save = () => { try { localStorage.setItem("tm_tasks", JSON.stringify(tasks)); } catch (e) {} };
const rank = { high: 0, medium: 1, low: 2 };

/* Theme */
function isDark(){
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
function paintTheme(){ $("theme").textContent = isDark() ? "☀ Light" : "🌙 Dark"; }
try { const t = localStorage.getItem("tm_theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
$("theme").onclick = () => {
  const next = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("tm_theme", next); } catch (e) {}
  paintTheme();
};
paintTheme();
$("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

/* Add / edit with validation */
function todayStr(){ const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
function validate(title, due){
  if (!title) return "Task title can't be empty.";
  if (title.length < 3) return "Task title needs at least 3 characters.";
  const dup = tasks.some(t => t.id !== editingId && t.title.toLowerCase() === title.toLowerCase() && !t.done);
  if (dup) return "A pending task with this title already exists.";
  if (due && due < todayStr() && !editingId) return "Due date can't be in the past.";
  return "";
}
function resetForm(){
  editingId = null;
  $("fTitle").value = ""; $("fDue").value = ""; $("fCat").value = "Personal"; $("fPri").value = "medium";
  $("save").textContent = "Add task"; $("cancel").hidden = true; $("err").textContent = "";
}
$("save").onclick = () => {
  const title = $("fTitle").value.trim(), due = $("fDue").value;
  const msg = validate(title, due);
  $("err").textContent = msg;
  if (msg) { $("fTitle").focus(); return; }
  const data = { title, due, category: $("fCat").value, priority: $("fPri").value };
  if (editingId) Object.assign(tasks.find(t => t.id === editingId), data);
  else tasks.push({ id: Date.now(), done: false, created: Date.now(), ...data });
  save(); resetForm(); render();
};
$("fTitle").addEventListener("keydown", e => { if (e.key === "Enter") $("save").click(); });
$("cancel").onclick = resetForm;

function startEdit(t){
  editingId = t.id;
  $("fTitle").value = t.title; $("fDue").value = t.due || ""; $("fCat").value = t.category; $("fPri").value = t.priority;
  $("save").textContent = "Save changes"; $("cancel").hidden = false; $("err").textContent = "";
  $("fTitle").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Render */
function render(){
  const q = $("q").value.trim().toLowerCase(), st = $("fStatus").value, cat = $("fCategory").value, pr = $("fPriority").value;
  let shown = tasks.filter(t =>
    (!q || t.title.toLowerCase().includes(q)) &&
    (st === "all" || (st === "done" ? t.done : !t.done)) &&
    (cat === "all" || t.category === cat) &&
    (pr === "all" || t.priority === pr));
  const s = $("sort").value;
  shown.sort((a, b) =>
    s === "due" ? (a.due || "9999").localeCompare(b.due || "9999") :
    s === "pri" ? rank[a.priority] - rank[b.priority] : b.created - a.created);

  const list = $("list"); list.innerHTML = "";
  if (!shown.length){
    const e = document.createElement("div"); e.className = "empty";
    e.textContent = tasks.length ? "No tasks match your search or filters." : "No tasks yet. Add your first task above.";
    list.appendChild(e);
  }
  shown.forEach(t => {
    const li = document.createElement("li");
    li.className = "p-" + t.priority + (t.done ? " done" : "");
    const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = t.done;
    cb.setAttribute("aria-label", "Mark complete");
    cb.onchange = () => { t.done = cb.checked; save(); render(); };
    const body = document.createElement("div"); body.className = "body";
    const name = document.createElement("div"); name.className = "name"; name.textContent = t.title;
    const meta = document.createElement("div"); meta.className = "meta";
    const chip = (txt, cls) => { const c = document.createElement("span"); c.className = "chip " + (cls || ""); c.textContent = txt; meta.appendChild(c); };
    chip(t.category); chip(t.priority[0].toUpperCase() + t.priority.slice(1) + " priority");
    if (t.due){
      const over = !t.done && t.due < todayStr();
      chip((over ? "Overdue: " : "Due ") + new Date(t.due + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" }), over ? "over" : "");
    }
    body.append(name, meta);
    const acts = document.createElement("div"); acts.className = "acts";
    const ed = document.createElement("button"); ed.textContent = "Edit"; ed.onclick = () => startEdit(t);
    const del = document.createElement("button"); del.className = "del"; del.textContent = "Delete";
    del.onclick = () => { if (confirm("Delete this task?")){ tasks = tasks.filter(x => x.id !== t.id); if (editingId === t.id) resetForm(); save(); render(); } };
    acts.append(ed, del);
    li.append(cb, body, acts); list.appendChild(li);
  });

  const done = tasks.filter(t => t.done).length;
  $("sTotal").textContent = tasks.length; $("sDone").textContent = done; $("sPending").textContent = tasks.length - done;
}
["q", "fStatus", "fCategory", "fPriority", "sort"].forEach(id => $(id).addEventListener("input", render));
$("clear").onclick = () => { if (tasks.some(t => t.done) && confirm("Remove all completed tasks?")){ tasks = tasks.filter(t => !t.done); save(); render(); } };
render();
