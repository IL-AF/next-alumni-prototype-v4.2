// Prototype v4 core: state, helpers, shell, router, sign-in and rules.
// Pages live in pages-*.js and register themselves in PAGES.
const D = window.DATA;
const S = {
  signedIn: false,
  agreed: false,
  me: "maya-okonkwo",
  view: "member", // "member" or "admin"
  theme: "system",
  votes: {}, // post/comment id -> true
  introsLeft: 3,
  rsvp: { e2: true, e8: true },
  saved: {},
  readNotifs: false,
  sideOpen: false,
  clicks: { jobs: 0, perks: 0 },
};
const PAGES = {};
const A = {}; // actions called from inline handlers

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const person = (id) => D.people.find((p) => p.id === id);
const company = (id) => D.companies.find((c) => c.id === id);
const me = () => person(S.me);
const isAdmin = () => S.view === "admin";
const initials = (name) => name.replace(/[^A-Za-zÀ-ÿ' ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const hue = (s) => { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) % 360; return x; };
const avColor = (s) => `hsl(${hue(s)} 38% 38%)`;
// Neutral illustrated portrait placeholders (real build uses profile photos).
const AV_BG = ["#DCDCDF", "#D6D3CE", "#CFD4D6", "#D9D4D8", "#D2D6CF"];
const AV_FG = ["#8A8A90", "#8C857C", "#7F888C", "#8B8189", "#828A7C"];
const HAIR = [
  "", // none
  '<path d="M12.5 15.5c0-5 3.4-8.2 7.5-8.2s7.5 3.2 7.5 8.2c-1.6-2.3-4.3-3.3-7.5-3.3s-5.9 1-7.5 3.3z"/>', // short
  '<path d="M11.8 17c0-6.2 3.6-9.9 8.2-9.9s8.2 3.7 8.2 9.9v8.5c-1.1-.6-1.9-1.4-2.4-2.4V15.6c-1.8-1.8-3.6-2.6-5.8-2.6s-4 .8-5.8 2.6v7.5c-.5 1-1.3 1.8-2.4 2.4z"/>', // long
  '<circle cx="20" cy="6.6" r="3.4"/><path d="M12.8 15c0-4.6 3.3-7.5 7.2-7.5s7.2 2.9 7.2 7.5c-1.8-2-4.3-2.7-7.2-2.7s-5.4.7-7.2 2.7z"/>', // bun
  '<path d="M12.3 16.5c-.4-5.6 3-9.4 7.7-9.4 3.6 0 6.3 2 7.3 5.3-2.4-.6-5.7-2.6-7.7-4.2-1.2 2.6-4.1 5.2-7.3 8.3z"/>', // swept
];
function portrait(seed) {
  const k = hue(seed); const bg = AV_BG[k % 5], fg = AV_FG[(k >> 2) % 5]; const hair = HAIR[(k >> 3) % HAIR.length];
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/><g fill="${fg}"><circle cx="20" cy="16.5" r="7"/><path d="M6 40c.8-8.6 6.4-13.6 14-13.6S33.2 31.4 34 40z"/></g><g fill="${fg}" style="filter:brightness(.72)">${hair}</g></svg>`;
}
function av(id, size = "") { const p = person(id); if (!p) return ""; return `<span class="av ${size}" title="${h(p.name)}">${portrait(p.name)}</span>`; }
function logo(c, size = "") { return `<span class="logo ${size}" style="background:${`hsl(${hue(c.name)} 30% 30%)`}" aria-hidden="true">${h(c.name[0])}</span>`; }
const plink = (id) => { const p = person(id); return p ? `<a class="who" href="#/people/${p.id}">${h(p.name)}</a>` : ""; };
function ago(hours) {
  if (hours < 1) return Math.max(1, Math.round(hours * 60)) + "m ago";
  if (hours < 24) return Math.round(hours) + "h ago";
  const d = Math.round(hours / 24); if (d < 30) return d + "d ago";
  return Math.round(d / 30) + "mo ago";
}
const BADGE_CLASS = { "Founder": "founder", "Alumni": "alumni", "Current participant": "current", "NEXT Staff": "staff", "Board": "board" };
const PROG_SHORT = { "NEXT 36": "N36", "NEXT Founders": "NF", "NEXT AI": "NAI" };
const cohortShort = (x) => `${PROG_SHORT[x.name] || x.name} '${String(x.year).slice(2)}`;
// One plain line instead of badge pills: "Founder, NF '21" / "NEXT staff" / "Board, Founder, N36 '15"
function affilText(p) {
  const words = [];
  if (p.badges.includes("NEXT Staff")) words.push("NEXT staff");
  if (p.badges.includes("Board")) words.push("Board");
  if (p.badges.includes("Founder")) words.push("Founder");
  const latest = p.programs.slice().sort((a, b) => b.year - a.year)[0];
  if (latest) words.push(cohortShort(latest) + (p.badges.includes("Current participant") ? ", current" : ""));
  return words.slice(0, 3).join(", ");
}
const badges = (p) => `<span class="affil ${p.badges.includes("NEXT Staff") ? "staff" : ""}">${h(affilText(p))}</span>`;
function openToText(p) {
  const words = { "Coffee chats": "coffee chats", "Intro requests": "intros", "Mentoring": "mentoring" };
  const l = p.openTo.map((o) => words[o]); if (!l.length) return "Not taking requests right now";
  return "Open to " + (l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " and " + l[l.length - 1]);
}
const badgesFull = (p) => p.badges.map(h).join(", ");
const programLine = (p) => p.programs.map((x) => `${x.name} ${x.year}`).join(", ");
const fmt = (n) => n.toLocaleString("en-CA");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const time12 = (t) => { const [hh, mm] = t.split(":").map(Number); const ap = hh >= 12 ? "pm" : "am"; return `${((hh + 11) % 12) + 1}${mm ? ":" + String(mm).padStart(2, "0") : ""}${ap}`; };
function linkify(text) {
  let s = h(text);
  D.people.forEach((p) => { s = s.split("@" + h(p.name)).join(`<a class="mention" href="#/people/${p.id}">@${h(p.name)}</a>`); });
  return s;
}

// ---------- icons (stroke icons, 24px grid) ----------
const ICONS = {
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
  board: '<path d="M4 5h16v10H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
  events: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  msg: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/>',
  people: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5"/><circle cx="17" cy="9.5" r="2.6"/><path d="M17 14.5c2.4 0 4 1.4 4.5 4"/>',
  company: '<rect x="4" y="3.5" width="11" height="17" rx="1.5"/><path d="M15 9h4a1 1 0 0 1 1 1v10.5H15M7.5 7.5h4M7.5 11h4M7.5 14.5h4M8.5 20.5v-3h2v3"/>',
  investor: '<path d="M3.5 19.5h17M5.5 16.5v-5M10 16.5v-8M14.5 16.5v-6M19 16.5V5"/>',
  intro: '<path d="M8 12.5l2.5 2.5a1.8 1.8 0 0 0 2.5 0l4.5-4.5"/><path d="M3 9.5 7.5 5l3 1.5L14 5l7 6.5-7.5 7.5L3 9.5z"/>',
  jobs: '<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
  perks: '<rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M12 9v11M3.5 13h17M12 9c-1.5-3.5-6-4-6-1.5S10 9 12 9zm0 0c1.5-3.5 6-4 6-1.5S14 9 12 9z"/>',
  resources: '<path d="M4 20V6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/><path d="M9 8.5h7"/>',
  flag: '<path d="M5 21V4.5M5 4.5h11l-2 4 2 4H5"/>',
  chart: '<path d="M4 4v16h16"/><path d="m7.5 14 3.5-4 3 2.5L19 7"/>',
  members: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5"/><path d="M19.5 4.5v4M17.5 6.5h4"/>',
  rules: '<path d="M7 3.5h8.5L19 7v13.5H7z"/><path d="M10 10.5h6M10 14h6M10 17.5h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  up: '<path d="M12 19V6M6.5 11.5 12 6l5.5 5.5"/>',
  comment: '<path d="M4.5 5.5h15v10h-9l-4.5 4v-4h-1.5z"/>',
  pin: '<path d="M9 4.5h6l-1 5 3 3v1.5H7V12.5l3-3z"/><path d="M12 14v6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  back: '<path d="M19 12H5.5M11 6l-6 6 6 6"/>',
  ext: '<path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  map: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.6c1.9.6 3.1 2.2 3.5 4.9"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
  send: '<path d="M4 12 20 4.5 13.5 20l-2.5-6.5z"/><path d="m11 13.5 9-9"/>',
  edit: '<path d="M4.5 19.5h4l10-10a2.8 2.8 0 0 0-4-4l-10 10z"/><path d="m13.5 6.5 4 4"/>',
  shield: '<path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6z"/><path d="m9 12 2 2 4-4"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  door: '<path d="M5 20.5h14M7 20.5V4.5h10v16"/><circle cx="14" cy="12.5" r=".9"/>',
  linkedin: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 10.5v5.5M8.5 7.8v.2M12 16v-5.5M12 13c0-1.7 1-2.6 2.3-2.6 1.4 0 2.2.9 2.2 2.6v3"/>',
  download: '<path d="M12 4.5v11M7 11l5 5 5-5M5 19.5h14"/>',
  upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 19.5h14"/>',
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

// ---------- toast / modal / tooltip ----------
let toastTimer;
function announce(msg) { const l = $("#live"); if (l) { l.textContent = ""; setTimeout(() => (l.textContent = msg), 30); } }
function toast(msg) {
  let el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("aria-hidden", "true"); document.body.appendChild(el); }
  announce(msg);
  el.textContent = msg; el.hidden = false; el.style.animation = "none"; el.offsetHeight; el.style.animation = "";
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 3000);
}
let modalReturn = null;
function modal(html, cls = "") {
  const opener = document.activeElement;
  closeModal(true);
  modalReturn = opener;
  const scrim = document.createElement("div"); scrim.className = "scrim"; scrim.id = "scrim";
  scrim.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${html}</div>`;
  scrim.addEventListener("mousedown", (e) => { if (e.target === scrim) closeModal(); });
  // Keep Tab inside the dialog
  scrim.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = $$('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', scrim);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.body.appendChild(scrim);
  $("#app").setAttribute("aria-hidden", "true");
  const f = scrim.querySelector("textarea, input, select, button.pri"); if (f) f.focus();
}
function closeModal(keepReturn) {
  const s = $("#scrim"); if (!s) return; s.remove(); $("#app").removeAttribute("aria-hidden");
  if (!keepReturn && modalReturn && document.body.contains(modalReturn)) modalReturn.focus();
  if (!keepReturn) modalReturn = null;
}
A.closeModal = closeModal;
const modalHead = (title, sub = "") => `<header><div class="stack" style="gap:4px"><h2 id="modal-title">${title}</h2>${sub ? `<p class="muted small">${sub}</p>` : ""}</div><button class="iconbtn" onclick="A.closeModal()" aria-label="Close">${icon("x")}</button></header>`;

// ---------- theme ----------
function applyTheme() {
  const root = document.documentElement;
  if (S.theme === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", S.theme);
  try { localStorage.setItem("next-v4-theme", S.theme); } catch (e) {}
}
const isDark = () => S.theme === "dark" || (S.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
A.toggleTheme = () => { S.theme = isDark() ? "light" : "dark"; applyTheme(); render(); };
A.setTheme = (t) => { S.theme = t; applyTheme(); render(); };
try { S.theme = localStorage.getItem("next-v4-theme") || "system"; } catch (e) {}
applyTheme();

// ---------- navigation ----------
const NAV = [
  { group: "", items: [["home", "Home", "home"]] },
  { group: "Community", items: [["board", "Board", "board"], ["events", "Events", "events"], ["messages", "Messages", "msg"]] },
  { group: "Network", items: [["people", "People", "people"], ["companies", "Companies", "company"], ["investors", "Investors", "investor"], ["intros", "Intros", "intro"]] },
  { group: "Opportunities", items: [["jobs", "Jobs", "jobs"], ["perks", "Perks", "perks"], ["resources", "Resources", "resources"]] },
];
const ADMIN_NAV = { group: "Admin", items: [["admin/reports", "Reports", "flag"], ["admin/metrics", "Engagement", "chart"], ["admin/members", "Members", "members"]] };
const unreadMsgs = () => D.conversations.filter((c) => c.members.includes(S.me) || c.kind === "cohort" && c.members.includes(S.me)).reduce((n, c) => n + c.unread, 0);
const pendingIntros = () => D.intros.filter((i) => i.to === S.me && i.status === "pending").length;
const openReports = () => D.reports.filter((r) => r.status === "open").length;
function navCount(key) {
  if (key === "messages") return unreadMsgs();
  if (key === "intros") return pendingIntros();
  if (key === "admin/reports") return openReports();
  return 0;
}
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
A.go = go;

function sidebar(section) {
  const groups = isAdmin() ? NAV.concat([ADMIN_NAV]) : NAV;
  return `<nav class="side ${S.sideOpen ? "open" : ""}" id="side" aria-label="Main">
    ${groups.map((g) => `<div class="navgroup">${g.group ? `<h4>${g.group}</h4>` : ""}${g.items.map(([k, label, ic]) => {
      const n = navCount(k);
      return `<a class="navlink ${section === k ? "on" : ""}" href="#/${k}" ${section === k ? 'aria-current="page"' : ""}>${icon(ic)}${label}${n ? `<span class="count">${n}<span class="sr"> new</span></span>` : ""}</a>`;
    }).join("")}</div>`).join("")}
    <div class="sidefoot">
      <a class="navlink ${section === "settings" ? "on" : ""}" href="#/settings">${icon("gear")}Settings</a>
      <a class="navlink ${section === "rules" ? "on" : ""}" href="#/rules-view">${icon("rules")}Community rules</a>
      <div class="proto">
        <span>Prototype v4.2 with fictional data. Switch who you're viewing as:</span>
        <div class="seg" role="group" aria-label="View as">
          <button class="${!isAdmin() ? "on" : ""}" onclick="A.viewAs('member')">Member</button>
          <button class="${isAdmin() ? "on" : ""}" onclick="A.viewAs('admin')">Admin</button>
        </div>
      </div>
    </div>
  </nav>`;
}
A.viewAs = (v) => {
  S.view = v; S.me = v === "admin" ? "nadia-morin" : "maya-okonkwo";
  toast(v === "admin" ? "Viewing as Nadia Morin (NEXT Staff, Admin)" : "Viewing as Maya Okonkwo (member)");
  go(v === "admin" ? "#/admin/reports" : "#/home");
};

function notifications() {
  return [
    { icon: "intro", text: `<b>Zoe Campbell</b> sent you an intro request`, href: "#/intros", h: 5 },
    { icon: "comment", text: `<b>Priya Shah</b> mentioned you in “Who has raised from US funds…”`, href: "#/board/p2", h: 3 },
    { icon: "msg", text: `<b>Priya Shah</b>: “Tuesday or Wednesday afternoon works for me.”`, href: "#/messages/dm-priya", h: 1.9 },
    { icon: "events", text: `Reminder: <b>Fundraising AMA with Sam Whitehorse</b> is coming up`, href: "#/events/e2", h: 20 },
    { icon: "jobs", text: `Your job <b>First account executive</b> got 12 clicks this week`, href: "#/jobs/j1", h: 30 },
  ];
}
function topbar() {
  const p = me();
  return `<header class="topbar">
    <button class="iconbtn burger" onclick="A.toggleSide()" aria-label="Menu">${icon("menu")}</button>
    <a class="wordmark" href="#/home" aria-label="NEXT Alumni home"><b>NEXT</b><i></i><span>Alumni</span></a>
    <div class="gsearch">
      ${icon("search")}
      <input type="search" id="gsearch" placeholder="Search people, companies, jobs, posts" autocomplete="off" oninput="A.gsearch(this.value)" onkeydown="A.gsearchKey(event)" onfocus="A.gsearch(this.value)" aria-label="Search">
      <div id="gresults"></div>
    </div>
    <div class="spacer"></div>
    <div style="position:relative">
      <button class="btn pri" onclick="A.menu('newmenu', event)" aria-expanded="false" aria-label="Create new">${icon("plus", "sm")}<span class="newlabel">New</span></button>
      <div class="menu" id="newmenu" hidden>
        <a href="#/board/new">New post</a>
        <a href="#/events/new">New event</a>
        <a href="#/jobs/new">Post a job</a>
        <a href="#/messages/new" onclick="event.preventDefault(); A.newGroup()">New group chat</a>
      </div>
    </div>
    <div style="position:relative">
      <button class="iconbtn" onclick="A.menu('notifmenu', event); S.readNotifs = true; $('#ndot') && $('#ndot').remove()" aria-label="Notifications${S.readNotifs ? "" : ", 3 unread"}" aria-expanded="false">${icon("bell")}${S.readNotifs ? "" : '<span class="dot" id="ndot"></span>'}</button>
      <div class="menu" id="notifmenu" hidden style="width:360px; max-width: calc(100vw - 24px)">
        <div class="mhead spread"><h3>Notifications</h3><span class="xs muted">Email alerts come later</span></div>
        ${notifications().map((n, i) => `<a class="notif ${i < 3 && !S.readNotifs ? "unread" : ""}" href="${n.href}"><span class="muted">${icon(n.icon)}</span><span class="grow">${n.text}<br><span class="xs muted">${ago(n.h)}</span></span></a>`).join("")}
      </div>
    </div>
    <button class="iconbtn" onclick="A.toggleTheme()" aria-label="Switch to ${isDark() ? "light" : "dark"} mode" title="Switch to ${isDark() ? "light" : "dark"} mode">${icon(isDark() ? "sun" : "moon")}</button>
    <div style="position:relative">
      <button class="iconbtn" onclick="A.menu('avmenu', event)" aria-label="Account menu" aria-expanded="false" style="width:auto;padding:0 4px">${av(p.id, "sm")}</button>
      <div class="menu" id="avmenu" hidden>
        <div class="mhead"><div class="strong">${h(p.name)}</div><div class="row" style="margin-top:4px">${badges(p)}${isAdmin() ? '<span class="badge board">Admin</span>' : ""}</div></div>
        <hr>
        <a href="#/people/${p.id}">My profile</a>
        <a href="#/profile/edit">Edit profile</a>
        <a href="#/settings">Settings and notifications</a>
        <a href="#/resources/bookings">My bookings</a>
        <hr>
        <div class="mhead"><div class="label" style="margin-bottom:6px">Appearance</div>
          <div class="seg">${["system", "light", "dark"].map((t) => `<button class="${S.theme === t ? "on" : ""}" onclick="A.setTheme('${t}')">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div></div>
        <hr>
        <button class="mi" onclick="A.signOut(false)">Sign out</button>
        <button class="mi" onclick="A.signOut(true)">Restart as a first-time member</button>
      </div>
    </div>
  </header>`;
}
function tabbar(section) {
  const items = [["home", "Home", "home"], ["board", "Board", "board"], ["people", "People", "people"], ["messages", "Messages", "msg"]];
  return `<nav class="tabbar" aria-label="Quick">${items.map(([k, l, ic]) => `<a href="#/${k}" class="${section === k ? "on" : ""}">${icon(ic)}${l}</a>`).join("")}<a href="#" onclick="event.preventDefault(); A.toggleSide()">${icon("menu")}More</a></nav>`;
}
A.toggleSide = () => { S.sideOpen = !S.sideOpen; $("#side")?.classList.toggle("open", S.sideOpen); };
A.menu = (id, ev) => {
  ev.stopPropagation();
  const el = document.getElementById(id); const wasHidden = el.hidden;
  $$(".menu, .pop").forEach((m) => (m.hidden = true));
  $$("[aria-expanded]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  el.hidden = !wasHidden;
  if (ev.currentTarget && ev.currentTarget.setAttribute) ev.currentTarget.setAttribute("aria-expanded", String(wasHidden));
};
document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu, .pop")) $$(".menu, .pop").forEach((m) => (m.hidden = true));
  if (!e.target.closest(".gsearch")) { const r = $("#gresults"); if (r) r.innerHTML = ""; }
  if (S.sideOpen && !e.target.closest("#side, .burger, .tabbar")) { S.sideOpen = false; $("#side")?.classList.remove("open"); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); $$(".menu, .pop").forEach((m) => (m.hidden = true)); } });

// ---------- global search ----------
A.gsearch = (q) => {
  const box = $("#gresults"); q = q.trim().toLowerCase();
  if (!q) { box.innerHTML = ""; return; }
  const ppl = D.people.filter((p) => (p.name + " " + p.headline + " " + p.city).toLowerCase().includes(q)).slice(0, 4);
  const cos = D.companies.filter((c) => (c.name + " " + c.oneLiner).toLowerCase().includes(q)).slice(0, 3);
  const jobs = D.jobs.filter((j) => (j.title + " " + company(j.company).name).toLowerCase().includes(q)).slice(0, 3);
  const posts = D.posts.filter((p) => (p.title + " " + p.body).toLowerCase().includes(q)).slice(0, 3);
  const sec = (title, items) => items.length ? `<div class="label" style="padding:8px 10px 2px">${title}</div>${items.join("")}` : "";
  const html = sec("People", ppl.map((p) => `<a href="#/people/${p.id}">${av(p.id, "xs")}<span class="grow">${h(p.name)}<br><span class="xs muted clamp2">${h(p.headline)}</span></span></a>`))
    + sec("Companies", cos.map((c) => `<a href="#/companies/${c.id}">${logo(c, "sm")}<span class="grow">${h(c.name)}<br><span class="xs muted">${h(c.oneLiner)}</span></span></a>`))
    + sec("Jobs", jobs.map((j) => `<a href="#/jobs/${j.id}"><span class="grow">${h(j.title)}<br><span class="xs muted">${h(company(j.company).name)}</span></span></a>`))
    + sec("Board posts", posts.map((p) => `<a href="#/board/${p.id}"><span class="grow">${h(p.title)}</span></a>`));
  box.innerHTML = `<div class="menu" style="left:0; right:auto; width:100%; max-height:70vh; overflow:auto">${html || `<div class="mhead muted small">Nothing matches “${h(q)}”. Try a name, company or city.</div>`}<hr><a href="#/people?q=${encodeURIComponent(q)}">Search the people directory for “${h(q)}”</a></div>`;
};
A.gsearchKey = (e) => { if (e.key === "Enter") { const q = e.target.value.trim(); $("#gresults").innerHTML = ""; e.target.blur(); go("#/people?q=" + encodeURIComponent(q)); } };

// ---------- mention textarea ----------
function mentionArea(id, placeholder, rows = 3) {
  return `<div class="mentionbox"><textarea id="${id}" rows="${rows}" aria-label="${placeholder}" placeholder="${placeholder}" oninput="A.mentionInput(this)" onkeydown="A.mentionKey(event, this)"></textarea><div class="mentionlist" id="${id}-ml" hidden></div></div>`;
}
A.mentionInput = (ta) => {
  const list = document.getElementById(ta.id + "-ml");
  const before = ta.value.slice(0, ta.selectionStart); const m = before.match(/@([A-Za-zÀ-ÿ']*)$/);
  if (!m) { list.hidden = true; return; }
  const q = m[1].toLowerCase();
  const found = D.people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  if (!found.length) { list.hidden = true; return; }
  list.innerHTML = found.map((p, i) => `<button type="button" class="${i === 0 ? "on" : ""}" onmousedown="event.preventDefault(); A.pickMention('${ta.id}','${p.id}')">${av(p.id, "xs")}${h(p.name)}<span class="xs muted">${h(p.city)}</span></button>`).join("");
  list.hidden = false; list.dataset.first = found[0].id;
};
A.mentionKey = (e, ta) => { const list = document.getElementById(ta.id + "-ml"); if (!list.hidden && (e.key === "Enter" || e.key === "Tab")) { e.preventDefault(); A.pickMention(ta.id, list.dataset.first); } };
A.pickMention = (taId, pid) => {
  const ta = document.getElementById(taId); const p = person(pid);
  const pos = ta.selectionStart; const before = ta.value.slice(0, pos).replace(/@([A-Za-zÀ-ÿ']*)$/, "@" + p.name + " ");
  ta.value = before + ta.value.slice(pos); ta.focus(); ta.selectionStart = ta.selectionEnd = before.length;
  document.getElementById(taId + "-ml").hidden = true;
};

// ---------- filter chip popovers (shared by directories) ----------
// state: object of { key: Set }, options: [{key, label, values:[[value, count]]}]
function filterChips(scope, defs, state) {
  return `<div class="filters">${defs.map((f) => {
    const sel = state[f.key] || new Set();
    return `<div class="fchip"><button class="chip ${sel.size ? "on" : ""}" onclick="A.menu('pop-${scope}-${f.key}', event)">${f.label}${sel.size ? ` (${sel.size})` : ""}<svg class="icon sm" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg></button>
      <div class="pop ${f.values.length > 8 ? "scroll" : ""}" id="pop-${scope}-${f.key}" hidden>
        ${f.values.map(([v, n]) => `<label class="opt"><input type="checkbox" ${sel.has(v) ? "checked" : ""} onchange="A.toggleFilter('${scope}','${f.key}', this.value, this.checked)" value="${h(v)}">${h(v)}<span class="n">${n}</span></label>`).join("")}
        <div class="popfoot"><button class="btn link" onclick="A.clearFilter('${scope}','${f.key}')">Clear</button><button class="btn sm dark" onclick="$$('.pop').forEach(p=>p.hidden=true)">Done</button></div>
      </div></div>`;
  }).join("")}</div>
  ${Object.values(state).some((s) => s.size) ? `<div class="row" style="margin-bottom:6px">${Object.entries(state).flatMap(([k, set]) => [...set].map((v) => `<button class="chip" onclick="A.toggleFilter('${scope}','${k}', '${h(v).replace(/'/g, "\\'")}', false)">${h(v)} <span class="x">${icon("x", "sm")}</span></button>`)).join("")}<button class="btn link" onclick="A.clearAll('${scope}')">Clear all</button></div>` : ""}`;
}
const FILTERS = {}; // scope -> state
const filterState = (scope, keys) => { if (!FILTERS[scope]) { FILTERS[scope] = {}; keys.forEach((k) => (FILTERS[scope][k] = new Set())); } return FILTERS[scope]; };
A.toggleFilter = (scope, key, v, on) => { const s = FILTERS[scope][key]; on ? s.add(v) : s.delete(v); const openPop = on !== undefined && document.getElementById(`pop-${scope}-${key}`); const keep = openPop && !openPop.hidden; render(); if (keep) document.getElementById(`pop-${scope}-${key}`).hidden = false; };
A.clearFilter = (scope, key) => { FILTERS[scope][key].clear(); render(); };
A.clearAll = (scope) => { Object.values(FILTERS[scope]).forEach((s) => s.clear()); render(); };
const counted = (items, fn) => { const m = new Map(); items.forEach((it) => [].concat(fn(it)).filter(Boolean).forEach((v) => m.set(v, (m.get(v) || 0) + 1))); return [...m.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))); };
const passes = (state, item, getters) => Object.entries(state).every(([k, set]) => !set.size || [].concat(getters[k](item)).some((v) => set.has(v)));

// ---------- sign in ----------
function signInPage() {
  return `<div class="auth">
    <section class="auth-art">
      <canvas id="halftone" aria-hidden="true"></canvas>
      <a class="wordmark" href="#/sign-in"><b>NEXT</b><i></i><span>Alumni</span></a>
      <div>
        <p class="tagline">The network behind Canada's next founders</p>
        <p class="sub">Find alumni, ask the network, and keep up with what NEXT and the community are running.</p>
      </div>
    </section>
    <main class="auth-panel" id="main">
      <div class="stack" style="gap:6px"><h1 style="font-size:24px; text-transform:none">Sign in</h1><p class="muted">For NEXT participants, alumni, staff and board members.</p></div>
      <div class="stack">
        <button class="gbtn" onclick="A.signIn()"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
        <div class="or">or</div>
        <form class="stack" onsubmit="event.preventDefault(); A.emailLink()">
          <label class="field"><span>Email</span><input type="email" id="signin-email" placeholder="you@company.com" required></label>
          <button class="btn lg block">Email me a sign-in link</button>
        </form>
        <div id="linksent" hidden class="note">Check your inbox. We sent a sign-in link to <b id="linksent-to"></b>. It works for 15 minutes. <button class="btn link" onclick="A.signIn()">Open the link (prototype)</button></div>
      </div>
      <p class="small muted">Not on the list? Contact NEXT and we'll check your program records.</p>
      <div class="demo">
        <span class="xs muted">Prototype shortcuts</span>
        <div class="row">
          <button class="btn sm" onclick="A.signIn(true)">Returning member</button>
          <button class="btn sm" onclick="A.viewAsAdminSignIn()">Sign in as admin</button>
        </div>
      </div>
    </main>
  </div>`;
}
A.emailLink = () => { const v = $("#signin-email").value; $("#linksent-to").textContent = v; $("#linksent").hidden = false; };
A.signIn = (returning) => { S.signedIn = true; if (returning) S.agreed = true; go(S.agreed ? "#/home" : "#/rules"); };
A.viewAsAdminSignIn = () => { S.signedIn = true; S.agreed = true; S.view = "admin"; S.me = "nadia-morin"; go("#/admin/reports"); };
A.signOut = (fresh) => { S.signedIn = false; if (fresh) { S.agreed = false; S.view = "member"; S.me = "maya-okonkwo"; } go("#/sign-in"); };

// Halftone canvas: a large "N" sampled into dots, red diagonal stroke.
// The N is sized to fit the space above the tagline, and no dot is drawn behind any text.
function drawHalftone() {
  const c = $("#halftone"); if (!c) return;
  const r = c.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
  const W = Math.floor(r.width), H = Math.floor(r.height);
  c.width = W * dpr; c.height = H * dpr;
  const ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
  // Text areas to keep clear (relative to the canvas), padded
  const pad = 18;
  const clear = [".auth-art .wordmark", ".auth-art .tagline", ".auth-art .sub"].map((sel) => $(sel)).filter(Boolean).map((el) => {
    const b = el.getBoundingClientRect(); return { x0: b.left - r.left - pad, y0: b.top - r.top - pad, x1: b.right - r.left + pad, y1: b.bottom - r.top + pad };
  });
  const textTop = Math.min(...clear.filter((_, i) => i > 0).map((q) => q.y0), H);
  const narrow = W < 700;
  // Fit the glyph: as tall as the room above the tagline (desktop) and no wider than ~60% of the panel
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const o = off.getContext("2d");
  o.font = "900 100px Montserrat, Arial, sans-serif";
  const m100 = o.measureText("N"); const asc100 = m100.actualBoundingBoxAscent; const w100 = m100.actualBoundingBoxLeft + m100.actualBoundingBoxRight;
  const topY = narrow ? (clear[0] ? clear[0].y1 + 4 : 60) : 40;
  const roomH = Math.max(90, textTop - topY - (narrow ? 8 : 24));
  const size = Math.min((roomH / asc100) * 100, ((narrow ? W * 0.9 : W * 0.6) / w100) * 100);
  o.fillStyle = "#000"; o.fillRect(0, 0, W, H);
  o.fillStyle = "#fff"; o.font = `900 ${size}px Montserrat, Arial, sans-serif`; o.textBaseline = "alphabetic"; o.textAlign = "right";
  const m = o.measureText("N"); const right = W - 28 + m.actualBoundingBoxRight * 0; const base = topY + m.actualBoundingBoxAscent;
  o.fillText("N", right, base);
  const img = o.getImageData(0, 0, W, H).data;
  // Find the stems from real pixels: near the bottom the left stem stands alone; near the top the right stem does.
  const runs = (y) => { const out = []; let st = -1; for (let x = 0; x < W; x++) { const on = img[(Math.floor(y) * W + x) * 4] > 127; if (on && st < 0) st = x; if (!on && st >= 0) { out.push([st, x]); st = -1; } } if (st >= 0) out.push([st, W]); return out; };
  const gTop = base - m.actualBoundingBoxAscent; const gH = m.actualBoundingBoxAscent;
  const low = runs(gTop + gH * 0.9), high = runs(gTop + gH * 0.1);
  const leftEdge = low.length ? low[0][1] : 0; const rightEdge = high.length ? high[high.length - 1][0] : W;
  const step = W > 1100 ? 12 : 11; const dots = [];
  const blocked = (x, y) => clear.some((q) => x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1);
  for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
    if (blocked(x, y)) continue;
    const v = img[(Math.floor(y) * W + Math.floor(x)) * 4] / 255;
    const fade = Math.max(0.35, Math.min(1, 0.45 + (x / W) * 0.45 + (1 - y / H) * 0.3));
    if (v > 0.5) dots.push({ x, y, rad: step * 0.44 * fade, red: x > leftEdge + 2 && x < rightEdge - 2 });
    else if ((x + y) % 3 < 1 && x > W * 0.15) dots.push({ x, y, rad: 0.9, dim: true });
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now(); const dur = reduce ? 0 : 1200;
  function frame(t) {
    const k = dur ? Math.min(1, (t - start) / dur) : 1;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    for (const d of dots) {
      const delay = (1 - d.y / H) * 0.15 + (d.x / W) * 0.4; const p = Math.max(0, Math.min(1, (k - delay) / 0.45)); const e = 1 - Math.pow(1 - p, 3);
      if (e <= 0) continue;
      ctx.fillStyle = d.dim ? "rgba(255,255,255,0.14)" : d.red ? "#D7292F" : "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(d.x, d.y, d.rad * e, 0, 6.283); ctx.fill();
    }
    if (k < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---------- rules ----------
function rulesBody() {
  const sec = (title, lines) => `<div class="stack" style="gap:8px"><h2 class="h3">${title}</h2>${lines.map((w) => `<div class="skel" style="width:${w}%"></div>`).join("")}</div>`;
  return `<div class="rulebox" tabindex="0" aria-label="Community rules text">
    <p class="muted small">NEXT's community rules go here. Placeholder until NEXT sends the final text.</p>
    ${sec("1. Who this space is for", [92, 84, 60])}
    ${sec("2. Be generous and respectful", [96, 88, 74, 40])}
    ${sec("3. Keep what's shared here private", [90, 66])}
    ${sec("4. No selling or spam", [94, 82, 52])}
    ${sec("5. Intros and messages", [88, 70])}
    ${sec("6. How moderation works", [92, 86, 48])}
  </div>`;
}
function rulesPage() {
  return `<div class="rules-page">
    <div class="rules-top"><span class="wordmark"><b>NEXT</b><i></i><span>Alumni</span></span></div>
    <main class="rules-card stack-lg" id="main">
      <div class="steps"><b>Step 1 of 1</b><span>Before you start</span></div>
      <div class="stack" style="gap:6px"><h1>Community rules</h1><p class="muted">Read and agree to these once. If NEXT changes them, we'll ask you again.</p></div>
      <div class="card stack">
        <div class="spread"><span class="small muted">Version 1.1, updated Oct 1, 2026</span></div>
        ${rulesBody()}
        <label class="check"><input type="checkbox" id="agree" onchange="$('#agreebtn').disabled = !this.checked"><span>I've read the community rules and agree to follow them.</span></label>
        <div class="spread"><button class="btn link" onclick="A.signOut(false)">Sign out</button><button class="btn pri lg" id="agreebtn" disabled onclick="A.agree()">Agree and continue</button></div>
      </div>
    </main>
  </div>`;
}
A.agree = () => { S.agreed = true; go("#/home"); setTimeout(() => toast("Welcome, " + me().name.split(" ")[0] + ". You're in."), 50); };
PAGES["rules-view"] = () => ({ section: "rules", html: `<div class="wrap read stack-lg"><div class="pagehead"><div><h1>Community rules</h1><p class="fact">Version 1.1, updated Oct 1, 2026</p></div>${isAdmin() ? `<button class="btn" onclick="toast('Rules editor comes with the admin build. Members re-accept when the version changes.')">Edit rules</button>` : ""}</div><div class="card">${rulesBody()}</div></div>` });

// ---------- router ----------
function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "") || "home";
  const [path, qs] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs || ""));
  return { parts, query, path };
}
let lastPath = "";
function render() {
  const { parts, query, path } = parseRoute();
  const app = $("#app");
  if (!S.signedIn || parts[0] === "sign-in") { if (S.signedIn && parts[0] === "sign-in") S.signedIn = false; app.innerHTML = signInPage(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(drawHalftone)); document.title = "Sign in · NEXT Alumni"; return; }
  if (!S.agreed) { app.innerHTML = rulesPage(); document.title = "Community rules · NEXT Alumni"; return; }
  // Resolve page: try "a/b" then "a"
  let page = PAGES[parts.slice(0, 2).join("/")] && parts[0] === "admin" ? PAGES[parts.slice(0, 2).join("/")] : PAGES[parts[0]];
  if (parts[0] === "admin" && !isAdmin()) page = () => ({ section: "", html: `<div class="wrap"><div class="empty"><h3>Admins only</h3><p>Switch to the Admin view in the sidebar to see admin screens.</p></div></div>` });
  if (!page) page = () => ({ section: "", html: `<div class="wrap"><div class="empty"><h3>Page not found</h3><p>That link doesn't go anywhere in this prototype.</p><a class="btn" href="#/home">Go home</a></div></div>` });
  const out = page(parts, query);
  const sameScreen = path === lastPath;
  const keepY = sameScreen ? window.scrollY : 0;
  const focusId = document.activeElement && document.activeElement.id;
  app.innerHTML = `<a class="skip" href="#main" onclick="event.preventDefault(); $('#main').focus()">Skip to content</a>` + topbar() + `<div class="layout">${sidebar(out.section)}<main class="main" id="main" tabindex="-1">${out.html}</main></div>` + tabbar(out.section);
  document.title = (out.title ? out.title + " · " : "") + "NEXT Alumni";
  window.scrollTo(0, keepY);
  if (sameScreen && focusId && document.getElementById(focusId) && /INPUT|TEXTAREA/.test(document.getElementById(focusId).tagName)) {
    const el = document.getElementById(focusId); el.focus(); const v = el.value; if (el.setSelectionRange && el.type !== "email") el.setSelectionRange(v.length, v.length);
  }
  if (lastPath && !sameScreen && focusId !== "gsearch") $("#main").focus({ preventScroll: true });
  lastPath = path;
  S.sideOpen = false;
  if (out.after) out.after();
}
window.addEventListener("hashchange", () => { closeModal(); render(); });
window.addEventListener("resize", () => { if ($("#halftone")) drawHalftone(); });
document.addEventListener("DOMContentLoaded", () => { if (!location.hash) location.hash = "#/sign-in"; render(); });
