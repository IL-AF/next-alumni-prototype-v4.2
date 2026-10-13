// People, companies, investors, intros.

// ================= PEOPLE =================
const PPL = { q: "", sort: "match" };
const PEOPLE_FILTERS = [
  ["badge", "Badge", (p) => p.badges], ["program", "Program", (p) => p.programs.map((x) => x.name)], ["cohort", "Cohort", (p) => p.programs.map((x) => `${x.name} ${x.year}`)],
  ["country", "Country", (p) => p.country], ["city", "City", (p) => p.city], ["sector", "Sector", (p) => p.sectors], ["skill", "Expertise", (p) => p.skills],
  ["looking", "Looking for", (p) => p.lookingFor.picks], ["open", "Open to", (p) => p.openTo],
];
function personMatches(p, q) {
  if (!q) return { ok: true, where: [] };
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean); const where = new Set();
  const fields = { Name: p.name, Headline: p.headline, Expertise: p.skills.join(" "), Sectors: p.sectors.join(" "), "Ask me about": p.ask, About: p.about, Location: `${p.city} ${p.region} ${p.country}`, Company: p.companies.map((c) => c.name).join(" ") + " " + p.role };
  const ok = terms.every((t) => Object.entries(fields).some(([k, v]) => { const hit = v.toLowerCase().includes(t); if (hit) where.add(k); return hit; }));
  return { ok, where: [...where] };
}
const hl = (text, q) => { let s = h(text); if (!q) return s; q.split(/\s+/).filter((t) => t.length > 1).forEach((t) => { s = s.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); }); return s; };
function personCard(p, q, where) {
  const qq = (q || "").toLowerCase();
  const tagHit = (t) => qq && qq.split(/\s+/).some((w) => w.length > 1 && t.toLowerCase().includes(w));
  return `<div class="prow has-link">
    ${av(p.id, "md")}
    <div><div class="nm"><a class="stretch" href="#/people/${p.id}">${hl(p.name, q)}</a></div>
      <div>${badges(p)}</div>
      <div class="xs muted">${h(p.city)}, ${h(p.region)}${p.country !== "Canada" ? ", " + h(p.country) : ""}</div></div>
    <div><p class="small clamp2">${hl(p.headline, q)}</p>
      <div class="tags">${p.skills.slice(0, 3).map((s) => `<span class="tag ${tagHit(s) ? "hit" : ""}">${h(s)}</span>`).join("")}${p.sectors.slice(0, 2).map((s) => `<span class="tag out ${tagHit(s) ? "hit" : ""}">${h(s)}</span>`).join("")}</div></div>
    <div class="stack" style="gap:4px"><span class="opento">${openToText(p)}</span><span class="xs faint">${where && where.length ? "Matched in " + where.slice(0, 2).join(", ") : "Updated " + (p.updatedDays < 1 ? "today" : p.updatedDays + "d ago")}</span></div>
  </div>`;
}
PAGES.people = (parts, query) => {
  if (parts[1]) return profilePage(parts[1]);
  if (query.q !== undefined && query.q !== PPL.lastQ) { PPL.q = query.q; PPL.lastQ = query.q; }
  const st = filterState("people", PEOPLE_FILTERS.map((f) => f[0]));
  const getters = Object.fromEntries(PEOPLE_FILTERS.map((f) => [f[0], f[2]]));
  let res = D.people.map((p) => ({ p, m: personMatches(p, PPL.q) })).filter((x) => x.m.ok && passes(st, x.p, getters));
  const sorts = { match: (a, b) => b.m.where.length - a.m.where.length || a.p.updatedDays - b.p.updatedDays, name: (a, b) => a.p.name.localeCompare(b.p.name), updated: (a, b) => a.p.updatedDays - b.p.updatedDays, cohort: (a, b) => Math.max(0, ...b.p.programs.map((x) => x.year)) - Math.max(0, ...a.p.programs.map((x) => x.year)) };
  res.sort(sorts[PPL.sort]);
  const defs = PEOPLE_FILTERS.map(([key, label, fn]) => ({ key, label, values: counted(D.people, fn) }));
  return { section: "people", title: "People", html: `<div class="wrap">
    <div class="pagehead"><div><h1>People</h1><p class="fact">${D.people.length} members</p></div></div>
    <div class="searchbar">${icon("search")}<input type="search" id="ppl-q" placeholder="Search by name, expertise, company, city…" value="${h(PPL.q)}" oninput="PPL.q=this.value; render()" aria-label="Search people"></div>
    <p class="xs faint" style="margin:8px 4px 0">AI search ("find me someone who has sold to hospitals") comes in the real build.</p>
    ${filterChips("people", defs, st)}
    <div class="resultshead"><span class="label">${res.length} ${res.length === 1 ? "person" : "people"}${PPL.q ? ` matching “${h(PPL.q)}”` : ""}</span>
      <select onchange="PPL.sort=this.value; render()" aria-label="Sort">${[["match", "Best match"], ["name", "Name A–Z"], ["updated", "Recently updated"], ["cohort", "Newest cohort"]].map(([k, l]) => `<option value="${k}" ${PPL.sort === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    ${res.length ? `<div class="list">${res.map((x) => personCard(x.p, PPL.q, x.m.where)).join("")}</div>` : ""}<div>${res.length ? "" : `<div class="empty"><h2 class="h3">No one matches yet</h2><p>Try fewer filters or a broader word, or ask the network on the board.</p><button class="btn" onclick="A.clearAll('people'); PPL.q=''; render()">Clear search and filters</button></div>`}</div>
  </div>` };
};
function profilePage(id) {
  const p = person(id); if (!p) return { section: "people", html: `<div class="empty"><h2 class="h3">Profile not found</h2></div>` };
  const own = p.id === S.me;
  const pending = D.intros.find((i) => i.from === S.me && i.to === p.id && i.status === "pending");
  const conv = D.conversations.find((c) => c.kind === "direct" && c.members.includes(p.id) && c.members.includes(S.me));
  const canIntro = p.openTo.includes("Intro requests");
  const action = own ? `<a class="btn" href="#/profile/edit">Edit profile</a>`
    : conv ? `<a class="btn pri" href="#/messages/${conv.id}">Message</a>`
    : pending ? `<button class="btn" disabled>Intro requested</button>`
    : canIntro ? `<button class="btn pri" onclick="A.requestIntro('${p.id}')">Request intro</button>` : `<button class="btn" disabled title="${h(p.name.split(" ")[0])} isn't taking intro requests">Not taking intros</button>`;
  const cos = D.companies.filter((c) => c.founders.includes(p.id));
  const posts = D.posts.filter((x) => x.author === p.id);
  const card = (title, body) => `<div class="card"><h2 class="h3">${title}</h2>${body}</div>`;
  return { section: "people", title: p.name, html: `<div class="wrap">
    ${own ? "" : `<a class="back" href="#/people">${icon("back", "sm")}People</a>`}
    <div class="card hero"><div class="band"></div><div class="body">
      ${av(p.id, "lg")}
      <div class="who"><div class="row" style="gap:8px"><h1>${h(p.name)}</h1>${p.pronouns ? `<span class="muted small">${h(p.pronouns)}</span>` : ""}</div>
        <div class="affil">${badgesFull(p)}</div>
        <p style="font-size:16px">${h(p.headline)}</p>
        <div class="row small muted">${icon("map", "sm")}${h(p.city)}, ${h(p.region)}, ${h(p.country)}${p.programs.map((x) => `<span class="row" style="gap:4px; margin-left:8px" title="Imported from NEXT's records">${icon("shield", "sm")}${h(x.name)} ${x.year}</span>`).join("")}</div>
      </div>
      <div class="stack" style="justify-items:end; gap:6px">${action}<span class="xs faint">Updated ${p.updatedDays} days ago</span>${!own ? `<button class="btn link xs" style="font-size:12.5px" onclick="A.report('Profile','${p.id}')">Report profile</button>` : ""}</div>
    </div></div>
    <div class="cols wide-side" style="margin-top:16px">
      <div class="stack">
        ${card("About", `<p>${h(p.about)}</p>`)}
        ${card("Ask me about", `<p>${h(p.ask)}</p>`)}
        ${p.lookingFor.picks.length ? card("Looking for", `<div class="row" style="margin-bottom:8px">${p.lookingFor.picks.map((x) => `<span class="tag red">${h(x)}</span>`).join("")}</div><p>${h(p.lookingFor.text)}</p><p class="xs faint" style="margin-top:6px">Updated ${h(p.lookingFor.updated)}</p>`) : ""}
        ${p.companies.length ? card("Companies founded", `<div class="stack">${p.companies.map((c) => { const co = D.companies.find((x) => x.name === c.name); return `<div class="row" style="flex-wrap:nowrap; gap:12px">${co ? logo(co) : ""}<div class="grow"><div class="strong">${co ? `<a href="#/companies/${co.id}" style="color:inherit">${h(c.name)}</a>` : h(c.name)}</div><div class="small muted">${h(c.role)}, ${h(c.years)}</div></div><span class="tag ${c.status === "Active" ? "good" : ""}">${h(c.status)}</span></div>`; }).join("")}</div>`) : ""}
        ${posts.length ? card("Recent posts", `<div class="stack" style="gap:8px">${posts.map((x) => `<a href="#/board/${x.id}">${h(x.title)}</a>`).join("")}</div>`) : ""}
      </div>
      <div class="stack">
        ${card("Expertise", `<div class="row">${p.skills.map((s) => `<span class="tag">${h(s)}</span>`).join("") || '<span class="muted small">None added</span>'}</div>`)}
        ${card("Sectors", `<div class="row">${p.sectors.map((s) => `<span class="tag out">${h(s)}</span>`).join("") || '<span class="muted small">None added</span>'}</div>`)}
        ${card("Open to", `<p>${openToText(p)}.</p>`)}
        ${card("Details", `<dl class="dl"><dt>Role</dt><dd>${h(p.role) || "–"}</dd><dt>Programs</dt><dd>${h(programLine(p)) || "–"}</dd><dt>Links</dt><dd>${p.links.map((l) => `<a href="#" onclick="event.preventDefault(); toast('Opens ${h(l)} in a new tab')">${l.includes("linkedin") ? "LinkedIn" : h(l)}</a>`).join("<br>") || "–"}</dd></dl>`)}
      </div>
    </div></div>` };
}
A.requestIntro = (pid) => {
  const p = person(pid);
  if (S.introsLeft <= 0) { toast("You've used your 5 intro requests this week. More on Monday."); return; }
  modal(`${modalHead("Request an intro to " + h(p.name), `${h(p.name.split(" ")[0])} gets an email and can accept or decline. If they accept, a message thread opens with your note as the first message.`)}
    <label class="field"><span>Why do you want to connect?</span><textarea id="intro-note" rows="5" maxlength="300" oninput="$('#intro-n').textContent = this.value.length" placeholder="Be specific: what you're working on and what you'd like to ask."></textarea><span class="hint"><span id="intro-n">0</span>/300. You have ${S.introsLeft} of 5 requests left this week.</span></label>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="A.sendIntro('${pid}')">Send request</button></footer>`);
};
A.sendIntro = (pid) => {
  const note = $("#intro-note").value.trim(); if (note.length < 20) { toast("Add a little more context (20 characters minimum)"); return; }
  D.intros.unshift({ id: "i" + Date.now(), from: S.me, to: pid, status: "pending", hoursAgo: 0, note }); S.introsLeft--;
  closeModal(); render(); toast("Intro request sent to " + person(pid).name);
};

// Edit profile
PAGES.profile = () => {
  const p = me();
  const pick = (name, all, chosen) => `<div class="row">${all.map((x) => `<label class="chip" style="cursor:pointer"><input type="checkbox" name="${name}" value="${h(x)}" ${chosen.includes(x) ? "checked" : ""} style="accent-color:var(--red); margin:0">${h(x)}</label>`).join("")}</div>`;
  return { section: "people", title: "Edit profile", html: `<div class="wrap read">
    <a class="back" href="#/people/${p.id}">${icon("back", "sm")}My profile</a>
    <div class="pagehead"><div><h1>Edit profile</h1><p class="fact">Program and cohort come from NEXT's records and can't be edited.</p></div></div>
    <form class="stack-lg" onsubmit="event.preventDefault(); A.saveProfile()">
      <div class="card stack-lg">
        <div class="row">${av(p.id, "md")}<button type="button" class="btn sm" onclick="toast('Photo upload comes in the real build')">Upload photo</button></div>
        <div class="grid sm" style="gap:14px"><label class="field"><span>Name</span><input type="text" id="ep-name" value="${h(p.name)}"></label><label class="field"><span>Pronouns (optional)</span><input type="text" id="ep-pro" value="${h(p.pronouns)}"></label></div>
        <label class="field"><span>Headline</span><input type="text" id="ep-head" value="${h(p.headline)}" maxlength="120" required></label>
        <label class="field"><span>About</span><textarea id="ep-about" maxlength="500">${h(p.about)}</textarea><span class="hint">Up to 500 characters.</span></label>
        <label class="field"><span>Ask me about</span><textarea id="ep-ask" rows="3">${h(p.ask)}</textarea><span class="hint">This is what search will lean on most. List what people should come to you for.</span></label>
      </div>
      <div class="card stack-lg"><h2 class="h3">Expertise and sectors</h2>
        <div class="field"><span>Expertise</span>${pick("ep-skill", D.TAXONOMY.skills, p.skills)}</div>
        <div class="field"><span>Sectors</span>${pick("ep-sector", D.TAXONOMY.sectors, p.sectors)}<button type="button" class="btn link" style="justify-self:start" onclick="toast('Suggestion sent to NEXT')">Suggest a new sector</button></div>
      </div>
      <div class="card stack-lg"><h2 class="h3">What you're looking for</h2>
        ${pick("ep-look", D.TAXONOMY.lookingFor, p.lookingFor.picks)}
        <input type="text" id="ep-looktext" value="${h(p.lookingFor.text)}" placeholder="One line about what would help right now">
        <div class="field"><span>Open to</span>${pick("ep-open", D.TAXONOMY.openTo, p.openTo)}</div>
      </div>
      <div class="card stack-lg"><h2 class="h3">Location and work</h2>
        <div class="grid sm" style="gap:14px"><label class="field"><span>City</span><input type="text" id="ep-city" value="${h(p.city)}"></label><label class="field"><span>Province or state</span><input type="text" id="ep-region" value="${h(p.region)}"></label><label class="field"><span>Country</span><select id="ep-country">${["Canada", "United States", "Other"].map((c) => `<option ${p.country === c ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>
        <label class="field"><span>Current role</span><input type="text" id="ep-role" value="${h(p.role)}"></label>
        <dl class="dl small"><dt>Program</dt><dd>${h(programLine(p)) || "–"} ${icon("lock", "sm")}</dd><dt>Sign-in email</dt><dd>${h(p.email)} ${icon("lock", "sm")}</dd></dl>
      </div>
      <div class="row" style="justify-content:flex-end"><a class="btn ghost" href="#/people/${p.id}">Cancel</a><button class="btn pri">Save profile</button></div>
    </form></div>` };
};
A.saveProfile = () => {
  const p = me(); const vals = (n) => $$(`input[name="${n}"]:checked`).map((i) => i.value);
  Object.assign(p, { name: $("#ep-name").value, pronouns: $("#ep-pro").value, headline: $("#ep-head").value, about: $("#ep-about").value, ask: $("#ep-ask").value, skills: vals("ep-skill"), sectors: vals("ep-sector"), openTo: vals("ep-open"), city: $("#ep-city").value, region: $("#ep-region").value, country: $("#ep-country").value, role: $("#ep-role").value, updatedDays: 0 });
  p.lookingFor = { picks: vals("ep-look"), text: $("#ep-looktext").value, updated: "today" };
  go("#/people/" + p.id); toast("Profile saved");
};

// ================= COMPANIES =================
const CO = { q: "", sort: "name" };
const COMPANY_FILTERS = [
  ["sector", "Sector", (c) => c.sectors], ["stage", "Stage", (c) => c.stage], ["model", "Sells to", (c) => c.model], ["country", "Country", (c) => c.country],
  ["hq", "HQ city", (c) => c.hq], ["team", "Team size", (c) => c.team], ["program", "Program", (c) => c.program.replace(/ \d{4}$/, "")], ["hiring", "Hiring", (c) => (c.hiring ? "Hiring now" : "Not hiring")],
];
const stageTag = (s) => `<span class="tag ${["Acquired"].includes(s) ? "good" : s === "Closed" ? "out" : ""}">${h(s)}</span>`;
PAGES.companies = (parts) => {
  if (parts[1]) return companyPage(parts[1]);
  const st = filterState("companies", COMPANY_FILTERS.map((f) => f[0]));
  const getters = Object.fromEntries(COMPANY_FILTERS.map((f) => [f[0], f[2]]));
  const q = CO.q.toLowerCase();
  let res = D.companies.filter((c) => (!q || (c.name + " " + c.oneLiner + " " + c.sectors.join(" ") + " " + c.hq + " " + c.founders.map((f) => person(f).name).join(" ")).toLowerCase().includes(q)) && passes(st, c, getters));
  const order = D.TAXONOMY.stages;
  res.sort({ name: (a, b) => a.name.localeCompare(b.name), founded: (a, b) => b.founded - a.founded, stage: (a, b) => order.indexOf(b.stage) - order.indexOf(a.stage) }[CO.sort]);
  const defs = COMPANY_FILTERS.map(([key, label, fn]) => ({ key, label, values: counted(D.companies, fn) }));
  return { section: "companies", title: "Companies", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Companies</h1><p class="fact">${D.companies.length} companies</p></div><button class="btn" onclick="toast('Add a company from your profile. Co-founders can join it instead of creating a copy.')">Add your company</button></div>
    <div class="searchbar">${icon("search")}<input type="search" id="co-q" placeholder="Search by company, founder, sector or city" value="${h(CO.q)}" oninput="CO.q=this.value; render()" aria-label="Search companies"></div>
    ${filterChips("companies", defs, st)}
    <div class="resultshead"><span class="label">${res.length} companies</span><select onchange="CO.sort=this.value; render()" aria-label="Sort">${[["name", "Name A–Z"], ["founded", "Newest first"], ["stage", "Latest stage"]].map(([k, l]) => `<option value="${k}" ${CO.sort === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    <div class="card flush tablewrap"><table class="t">
      <thead><tr><th>Company</th><th>Stage</th><th>Sector</th><th>HQ</th><th>Team</th><th>Raised</th><th>Founders</th></tr></thead>
      <tbody>${res.map((c) => `<tr class="click" onclick="go('#/companies/${c.id}')">
        <td><div class="row" style="flex-wrap:nowrap; gap:12px">${logo(c, "sm")}<div><div class="strong"><a href="#/companies/${c.id}" style="color:inherit">${hl(c.name, CO.q)}</a>${c.hiring ? ' <span class="tag good" style="margin-left:4px">Hiring</span>' : ""}</div><div class="xs muted" style="max-width:42ch">${hl(c.oneLiner, CO.q)}</div></div></div></td>
        <td>${stageTag(c.stage)}</td><td class="small">${c.sectors.map(h).join(", ")}</td><td class="small nowrap">${h(c.hq)}</td><td class="small">${h(c.team)}</td><td class="small strong">${h(c.raised)}</td>
        <td><div class="avstack">${c.founders.map((f) => av(f, "xs")).join("")}</div></td></tr>`).join("") || `<tr><td colspan="7"><div class="empty" style="border:0">No companies match. Try removing a filter.</div></td></tr>`}</tbody></table></div>
  </div>` };
};
function companyPage(id) {
  const c = company(id); if (!c) return { section: "companies", html: "Not found" };
  const jobs = D.jobs.filter((j) => j.company === c.id);
  const invs = c.investors.map((i) => D.investors.find((x) => x.id === i)).filter(Boolean);
  return { section: "companies", title: c.name, html: `<div class="wrap">
    <a class="back" href="#/companies">${icon("back", "sm")}Companies</a>
    <div class="card hero"><div class="band"></div><div class="body">
      ${logo(c, "lg")}
      <div class="who"><div class="row"><h1>${h(c.name)}</h1>${stageTag(c.stage)}${c.hiring ? '<span class="tag good">Hiring</span>' : ""}</div><p style="font-size:16px">${h(c.oneLiner)}</p><div class="row small muted">${icon("map", "sm")}${h(c.hq)}<span style="margin-left:8px">Founded ${c.founded}</span><span style="margin-left:8px">${h(c.program)}</span></div></div>
      <div class="stack" style="justify-items:end"><a class="btn" href="#" onclick="event.preventDefault(); toast('Opens ${h(c.site)} in a new tab')">Website</a></div>
    </div></div>
    <div class="cols wide-side" style="margin-top:16px">
      <div class="stack">
        <div class="card"><h2 class="h3">Founders</h2><div class="stack">${c.founders.map((f) => { const p = person(f); const r = p.companies.find((x) => x.name === c.name); return `<a class="row" href="#/people/${p.id}" style="color:inherit; flex-wrap:nowrap; gap:12px">${av(p.id, "md")}<div class="grow"><div class="strong">${h(p.name)}</div><div class="small muted">${h(r ? r.role : "Founder")}</div></div><div class="row" style="gap:4px">${badges(p, 2)}</div></a>`; }).join("")}</div></div>
        <div class="card"><div class="spread"><h2 class="h3">Open jobs</h2>${jobs.length ? `<span class="xs muted">${jobs.length} listed</span>` : ""}</div>${jobs.length ? `<div class="stack" style="gap:10px">${jobs.map((j) => `<a href="#/jobs/${j.id}" class="spread" style="color:inherit"><span><span class="strong">${h(j.title)}</span><br><span class="small muted">${h(j.location)}, ${h(j.mode)}</span></span><span class="small strong">${h(j.comp)}</span></a>`).join("")}</div>` : `<p class="muted small">No open jobs listed.</p>`}</div>
      </div>
      <div class="stack">
        <div class="card"><h2 class="h3">Details</h2><dl class="dl"><dt>Stage</dt><dd>${h(c.stage)}</dd><dt>Raised</dt><dd>${h(c.raised)}</dd><dt>Team</dt><dd>${h(c.team)} people</dd><dt>Sells to</dt><dd>${h(c.model)}</dd><dt>Sectors</dt><dd>${c.sectors.map(h).join(", ")}</dd><dt>Traction</dt><dd>${h(c.customers)}</dd></dl></div>
        ${invs.length ? `<div class="card"><h2 class="h3">Investors</h2><div class="stack" style="gap:8px">${invs.map((i) => `<a href="#/investors/${i.id}">${h(i.name)}</a>`).join("")}</div></div>` : ""}
      </div>
    </div></div>` };
}

// ================= INVESTORS =================
const INV = { q: "" };
const INVESTOR_FILTERS = [["type", "Type", (i) => i.type], ["stage", "Stage", (i) => i.stages], ["sector", "Sector", (i) => i.sectors], ["lead", "Leads rounds", (i) => i.lead], ["geo", "Invests in", (i) => i.geo]];
const portfolio = (inv) => D.companies.filter((c) => c.investors.includes(inv.id));
PAGES.investors = (parts) => {
  if (parts[1]) return investorPage(parts[1]);
  const st = filterState("investors", INVESTOR_FILTERS.map((f) => f[0]));
  const getters = Object.fromEntries(INVESTOR_FILTERS.map((f) => [f[0], f[2]]));
  const q = INV.q.toLowerCase();
  const res = D.investors.filter((i) => (!q || (i.name + " " + i.about + " " + i.sectors.join(" ") + " " + i.hq).toLowerCase().includes(q)) && passes(st, i, getters));
  const defs = INVESTOR_FILTERS.map(([key, label, fn]) => ({ key, label, values: counted(D.investors, fn) }));
  return { section: "investors", title: "Investors", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Investors</h1><p class="fact">${D.investors.length} investors</p></div><button class="btn" onclick="toast('Members suggest investors; NEXT staff approve them before they appear.')">Suggest an investor</button></div>
    <div class="searchbar">${icon("search")}<input type="search" id="inv-q" aria-label="Search by name, sector or city" placeholder="Search by name, sector or city" value="${h(INV.q)}" oninput="INV.q=this.value; render()"></div>
    ${filterChips("investors", defs, st)}
    <div class="resultshead"><span class="label">${res.length} investors</span></div>
    <div class="card flush tablewrap"><table class="t">
      <thead><tr><th>Investor</th><th>Type</th><th>Stages</th><th>Cheque size</th><th>Focus</th><th>NEXT portfolio</th></tr></thead>
      <tbody>${res.map((i) => { const pf = portfolio(i); return `<tr class="click" onclick="go('#/investors/${i.id}')">
        <td><div class="strong"><a href="#/investors/${i.id}" style="color:inherit">${hl(i.name, INV.q)}</a></div><div class="xs muted">${h(i.hq)}</div></td><td class="small">${h(i.type)}</td><td class="small">${i.stages.map(h).join(", ")}</td><td class="small nowrap">${h(i.cheque)}</td><td class="small">${i.sectors.map(h).join(", ")}</td>
        <td>${pf.length ? `<div class="row" style="gap:4px">${pf.slice(0, 3).map((c) => logo(c, "sm")).join("")}<span class="xs muted">${pf.length}</span></div>` : '<span class="xs faint">None yet</span>'}</td></tr>`; }).join("")}</tbody></table></div>
    <p class="xs faint" style="margin-top:10px">Investor details are entered by NEXT staff. Founder reviews of investors are not part of this version.</p>
  </div>` };
};
function investorPage(id) {
  const i = D.investors.find((x) => x.id === id); if (!i) return { section: "investors", html: "Not found" };
  const pf = portfolio(i); const founders = pf.flatMap((c) => c.founders);
  return { section: "investors", title: i.name, html: `<div class="wrap read">
    <a class="back" href="#/investors">${icon("back", "sm")}Investors</a>
    <div class="card stack-lg" style="padding:24px">
      <div class="spread"><div class="stack" style="gap:6px"><span class="tag" style="justify-self:start">${h(i.type)}</span><h1 class="dtitle">${h(i.name)}</h1><span class="muted small">${h(i.hq)}${i.site ? `<span style="margin-left:10px">${h(i.site)}</span>` : ""}</span></div></div>
      <p>${h(i.about)}</p>
      <dl class="dl"><dt>Stages</dt><dd>${i.stages.map(h).join(", ")}</dd><dt>Cheque size</dt><dd>${h(i.cheque)}</dd><dt>Leads rounds</dt><dd>${h(i.lead)}</dd><dt>Sectors</dt><dd>${i.sectors.map(h).join(", ")}</dd><dt>Invests in</dt><dd>${h(i.geo)}</dd><dt>Last known deal</dt><dd>${h(i.lastDeal)}</dd></dl>
    </div>
    ${i.contacts.length ? `<h2 class="h3" style="margin:22px 0 10px">People here on the platform</h2><div class="list">${i.contacts.map((pid) => `<a class="li click" href="#/people/${pid}" style="color:inherit">${av(pid, "md")}<div class="grow"><div class="strong">${h(person(pid).name)}</div><div class="small muted">${h(person(pid).headline)}</div></div></a>`).join("")}</div>` : ""}
    <h2 class="h3" style="margin:22px 0 10px">NEXT companies they've backed</h2>
    ${pf.length ? `<div class="list">${pf.map((c) => `<a class="li click" href="#/companies/${c.id}" style="color:inherit">${logo(c, "sm")}<div class="grow"><div class="strong">${h(c.name)}</div><div class="small muted">${h(c.oneLiner)}</div></div>${stageTag(c.stage)}</a>`).join("")}</div>
      <div class="note" style="margin-top:12px">Want an intro? ${[...new Set(founders)].map((f) => `<a href="#/people/${f}">${h(person(f).name)}</a>`).join(", ")} ${founders.length > 1 ? "have" : "has"} raised from them.</div>` : `<p class="muted">No NEXT companies listed yet.</p>`}
  </div>` };
}

// ================= INTROS =================
const INTRO = { tab: "received" };
PAGES.intros = () => {
  const received = D.intros.filter((i) => i.to === S.me); const sent = D.intros.filter((i) => i.from === S.me);
  const list = INTRO.tab === "received" ? received : sent;
  const statusTag = (s) => s === "pending" ? '<span class="tag warn">Waiting</span>' : s === "accepted" ? '<span class="tag good">Accepted</span>' : '<span class="tag out">Declined</span>';
  const row = (i) => {
    const other = person(INTRO.tab === "received" ? i.from : i.to);
    return `<div class="card stack">
      <div class="row" style="flex-wrap:nowrap; gap:12px">${av(other.id, "md")}<div class="grow"><a class="strong" href="#/people/${other.id}" style="color:inherit">${h(other.name)}</a><div class="small muted">${h(other.headline)}</div></div><div class="stack" style="justify-items:end; gap:4px">${statusTag(i.status)}<span class="xs faint">${ago(i.hoursAgo || 0.1)}</span></div></div>
      <p style="background:var(--raised); border:1px solid var(--line); border-radius:10px; padding:10px 14px">${h(i.note)}</p>
      ${INTRO.tab === "received" && i.status === "pending" ? `<div class="row" style="justify-content:flex-end"><button class="btn" onclick="A.introRespond('${i.id}', false)">Decline</button><button class="btn pri" onclick="A.introRespond('${i.id}', true)">Accept and message</button></div>` : ""}
      ${i.status === "accepted" ? `<div class="row" style="justify-content:flex-end"><a class="btn sm" href="#/messages/${(D.conversations.find((c) => c.kind === "direct" && c.members.includes(other.id) && c.members.includes(S.me)) || {}).id || ""}">${icon("msg", "sm")}Open messages</a></div>` : ""}
    </div>`;
  };
  return { section: "intros", title: "Intros", html: `<div class="wrap read">
    <div class="pagehead"><div><h1>Intros</h1></div><a class="btn" href="#/people">Find someone</a></div>
    <div class="note spread" style="margin-bottom:16px"><span>You have <b>${S.introsLeft} of 5</b> requests left this week. Want to ask everyone instead? Post in Intro requests on the board.</span><button class="btn sm" onclick="BOARD.channels = new Set(['Intro requests']); go('#/board')">Ask the network</button></div>
    <div class="tabs">${[["received", "Received", received.filter((i) => i.status === "pending").length], ["sent", "Sent", 0]].map(([k, l, n]) => `<button class="${INTRO.tab === k ? "on" : ""}" onclick="INTRO.tab='${k}'; render()">${l}${n ? `<span class="count">${n}</span>` : ""}</button>`).join("")}</div>
    <div class="stack">${list.map(row).join("") || `<div class="empty"><h2 class="h3">No ${INTRO.tab} requests</h2><p>${INTRO.tab === "sent" ? "Find someone in People and request an intro from their profile." : "When someone asks to connect, it shows up here."}</p></div>`}</div>
  </div>` };
};
A.introRespond = (id, yes) => {
  const i = D.intros.find((x) => x.id === id); i.status = yes ? "accepted" : "declined";
  if (!yes) { render(); toast("Declined. " + person(i.from).name.split(" ")[0] + " won't see a reason."); return; }
  const cid = "dm-" + i.from;
  if (!D.conversations.find((c) => c.id === cid)) D.conversations.push({ id: cid, kind: "direct", members: [S.me, i.from], unread: 0, messages: [{ from: i.from, hoursAgo: i.hoursAgo || 0, text: i.note }] });
  go("#/messages/" + cid); toast("Intro accepted. Say hello.");
};
