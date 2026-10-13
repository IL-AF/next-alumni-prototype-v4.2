// Admin: reports queue, engagement metrics, members.

// ================= REPORTS =================
const REP = { tab: "open", type: "All" };
PAGES["admin/reports"] = () => {
  const types = ["All", "Post", "Comment", "Profile", "Event", "Job", "Message"];
  const list = D.reports.filter((r) => r.status === REP.tab && (REP.type === "All" || r.type === REP.type));
  const nOpen = D.reports.filter((r) => r.status === "open").length;
  return { section: "admin/reports", title: "Reports", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Reports</h1><p class="fact">${nOpen} need review</p></div></div>
    <div class="tabs">${[["open", "Needs review", nOpen], ["resolved", "Resolved", 0]].map(([k, l, n]) => `<button class="${REP.tab === k ? "on" : ""}" onclick="REP.tab='${k}'; render()">${l}${n ? `<span class="count">${n}</span>` : ""}</button>`).join("")}</div>
    <div class="row" style="margin-bottom:14px">${types.map((t) => `<button class="chip ${REP.type === t ? "on" : ""}" onclick="REP.type='${t}'; render()">${t}</button>`).join("")}</div>
    <div class="stack">${list.map((r) => `<div class="card stack">
      <div class="spread"><div class="row"><span class="tag ${r.status === "open" ? "red" : ""}">${h(r.type)}</span><span class="strong">${h(r.reason)}</span>${r.count > 1 ? `<span class="xs muted">${r.count} reports</span>` : ""}</div><span class="xs faint">${ago(r.hoursAgo)}</span></div>
      <div class="small">${r.target ? `<a href="#/${r.target}">${h(r.targetLabel)}</a>` : h(r.targetLabel)}</div>
      <blockquote style="margin:0; border-left:3px solid var(--line-strong); padding:4px 0 4px 14px">${h(r.excerpt)}${r.author ? `<div class="xs muted" style="margin-top:6px">Written by <a href="#/people/${r.author}">${h(person(r.author).name)}</a></div>` : ""}</blockquote>
      <div class="xs muted">Reported by ${r.by ? `<a href="#/people/${r.by}">${h(person(r.by).name)}</a>` : "a member"}</div>
      ${r.status === "open" ? `<div class="row" style="justify-content:flex-end">
        <button class="btn sm" onclick="A.resolve('${r.id}', 'Dismissed. No rule broken.')">Dismiss</button>
        <button class="btn sm" onclick="A.resolve('${r.id}', 'Hidden from members.')">Hide content</button>
        ${r.author ? `<button class="btn sm" onclick="A.resolve('${r.id}', 'Hidden and author warned.')">Hide and warn author</button>` : ""}
        ${r.author ? `<button class="btn sm danger" onclick="A.suspend('${r.id}')">Suspend author</button>` : ""}
      </div>` : `<div class="note">${h(r.resolution)}${r.resolvedBy ? ` <span class="faint">By ${h(person(r.resolvedBy).name)}</span>` : ""}</div>`}
    </div>`).join("") || `<div class="empty"><h2 class="h3">${REP.tab === "open" ? "Nothing to review" : "No resolved reports yet"}</h2><p>${REP.tab === "open" ? "New reports show up here and in the sidebar count." : "Reports you act on move here."}</p></div>`}</div>
  </div>` };
};
A.resolve = (id, res) => {
  const r = D.reports.find((x) => x.id === id); r.status = "resolved"; r.resolution = res; r.resolvedBy = S.me;
  D.auditLog.unshift({ who: S.me, what: `${res.replace(/\.$/, "")}: ${r.targetLabel}`, hoursAgo: 0 });
  render(); toast(res);
};
A.suspend = (id) => {
  const r = D.reports.find((x) => x.id === id); const p = person(r.author);
  modal(`${modalHead("Suspend " + h(p.name) + "?", "They can't sign in until an admin restores access. Their posts stay up unless you hide them.")}
    <label class="field"><span>Reason (shared with the member)</span><textarea id="susp-r" rows="3">Repeated breaks of the community rules.</textarea></label>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="person('${p.id}').status='Suspended'; A.closeModal(); A.resolve('${id}', 'Author suspended.')">Suspend</button></footer>`);
};

// ================= METRICS =================
const MET = { range: 8 };
function lineChart(values, labels, opts = {}) {
  const W = 640, H = 200, pl = 36, pr = 12, pt = 12, pb = 26;
  const max = Math.ceil(Math.max(...values) * 1.15 / 10) * 10 || 10;
  const x = (i) => pl + (i * (W - pl - pr)) / (values.length - 1); const y = (v) => pt + (H - pt - pb) * (1 - v / max);
  const ticks = [0, max / 2, max];
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(opts.label || "")}">
    <g class="grid">${ticks.map((t) => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl - 8}" y="${y(t) + 4}" text-anchor="end">${fmt(Math.round(t))}</text>`).join("")}</g>
    ${labels.map((l, i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${h(l)}</text>`).join("")}
    <polyline points="${pts}" fill="none" stroke="var(--red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === values.length - 1 ? 4.5 : 3}" fill="${i === values.length - 1 ? "var(--red)" : "var(--surface)"}" stroke="var(--red)" stroke-width="2"/>
      <rect x="${x(i) - 20}" y="${pt}" width="40" height="${H - pt - pb}" fill="transparent" onmousemove="A.tip(event, 'Week of ${h(labels[i])}: ${fmt(v)} ${h(opts.unit || "")}')" onmouseleave="A.tip()"/>`).join("")}
    <text x="${x(values.length - 1)}" y="${y(values[values.length - 1]) - 10}" text-anchor="end" style="fill:var(--fg); font-weight:700">${fmt(values[values.length - 1])}</text>
  </svg>`;
}
A.tip = (e, text) => {
  let t = $("#tip"); if (!e) { if (t) t.remove(); return; }
  if (!t) { t = document.createElement("div"); t.id = "tip"; t.className = "tip"; document.body.appendChild(t); }
  t.textContent = text; t.style.left = e.clientX + 12 + "px"; t.style.top = e.clientY - 34 + "px";
};
const bars = (rows, unit = "") => { const max = Math.max(...rows.map((r) => r.n), 1); return rows.map((r) => `<div class="bar-row" onmousemove="A.tip(event, '${h(r.label).replace(/'/g, "\\'")}: ${fmt(r.n)} ${unit}')" onmouseleave="A.tip()"><span class="small">${r.link ? `<a href="${r.link}" style="color:inherit">${h(r.label)}</a>` : h(r.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(r.n / max) * 100}%"></div></div><span class="n small">${fmt(r.n)}</span></div>`).join(""); };
PAGES["admin/metrics"] = () => {
  const M = D.metrics; const n = MET.range;
  const sum = (arr) => arr.slice(-Math.min(n, arr.length)).reduce((a, b) => a + b, 0);
  const prev = (arr) => { const k = Math.min(n, arr.length / 2 | 0) || 1; return arr.slice(-2 * k, -k).reduce((a, b) => a + b, 0) * (n / k); };
  const delta = (cur, before) => { if (!before) return ""; const pct = Math.round(((cur - before) / before) * 100); return `<span class="d ${pct >= 0 ? "up" : "down"}">${pct >= 0 ? "Up" : "Down"} ${Math.abs(pct)}% vs. before</span>`; };
  const jobClicks = D.jobs.reduce((a, j) => a + j.clicks, 0); const perkClicks = D.perks.reduce((a, p) => a + p.clicks, 0);
  const kpi = (label, v, d = "") => `<div class="kpi"><span class="small muted">${label}</span><span class="v">${typeof v === "number" ? fmt(v) : v}</span>${d}</div>`;
  const lastWeek = M.activeMembers[M.activeMembers.length - 1];
  const funnelMax = M.funnel[0].n;
  return { section: "admin/metrics", title: "Engagement", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Engagement</h1><p class="fact">Counts only. Never message content.</p></div>
      <div class="row"><div class="seg">${[[4, "4 weeks"], [8, "8 weeks"]].map(([k, l]) => `<button class="${MET.range === k ? "on" : ""}" onclick="MET.range=${k}; render()">${l}</button>`).join("")}</div><button class="btn sm" onclick="toast('Downloaded engagement.csv (prototype)')">Export CSV</button></div></div>
    <div class="kpis">
      ${kpi("Weekly active members", lastWeek, delta(lastWeek, M.activeMembers[M.activeMembers.length - 2] * 1))}
      ${kpi("Posts", sum(M.posts) + D.posts.filter((p) => p.hoursAgo < 1).length, delta(sum(M.posts), prev(M.posts)))}
      ${kpi("Replies", sum(M.replies), delta(sum(M.replies), prev(M.replies)))}
      ${kpi("Intro requests accepted", `${Math.round((sum(M.introsAccepted) / sum(M.introsSent)) * 100)}%`, `<span class="d muted">${fmt(sum(M.introsAccepted))} of ${fmt(sum(M.introsSent))}</span>`)}
      ${kpi("Event RSVPs", sum(M.rsvps), delta(sum(M.rsvps), prev(M.rsvps)))}
      ${kpi("Job link clicks", jobClicks, `<span class="d muted">${D.jobs.length} open listings</span>`)}
      ${kpi("Perk redemptions", perkClicks, `<span class="d muted">${D.perks.length} partner perks</span>`)}
      ${kpi("Room and meeting bookings", sum(M.bookings) + D.bookings.length - 1, delta(sum(M.bookings), prev(M.bookings)))}
    </div>
    <div class="cols wide-side" style="margin-top:16px">
      <div class="card"><div class="spread"><h2 class="h3">Weekly active members</h2><span class="xs muted">Signed in and did something</span></div>${lineChart(M.activeMembers.slice(-n), M.weeks.slice(-n), { label: "Weekly active members, " + M.weeks.slice(-n)[0] + " to " + M.weeks[M.weeks.length - 1] + ", latest " + M.activeMembers[M.activeMembers.length - 1], unit: "active members" })}<details class="chart-table"><summary>Show as table</summary><table class="t"><thead><tr><th scope="col">Week of</th><th scope="col">Active members</th></tr></thead><tbody>${M.weeks.slice(-n).map((w, i) => `<tr><td>${w}</td><td>${fmt(M.activeMembers.slice(-n)[i])}</td></tr>`).join("")}</tbody></table></details></div>
      <div class="card"><h2 class="h3">Onboarding</h2><p class="xs muted" style="margin-bottom:10px">Everyone invited so far</p>${M.funnel.map((f) => `<div style="margin-bottom:10px"><div class="spread small"><span>${f.step}</span><span class="strong">${fmt(f.n)} <span class="muted" style="font-weight:400">${Math.round((f.n / funnelMax) * 100)}%</span></span></div><div class="bar-track" style="margin-top:4px; background:var(--chip); border-radius:4px"><div class="bar-fill" style="width:${(f.n / funnelMax) * 100}%; border-radius:4px; background:var(--red)"></div></div></div>`).join("")}</div>
    </div>
    <div class="cols" style="grid-template-columns: 1fr 1fr; margin-top:16px">
      <div class="card"><div class="spread"><h2 class="h3">Job link clicks by listing</h2><a class="xs" href="#/jobs">All jobs</a></div>${bars(D.jobs.slice().sort((a, b) => b.clicks - a.clicks).map((j) => ({ label: `${j.title}, ${company(j.company).name}`, n: j.clicks, link: "#/jobs/" + j.id })), "clicks")}</div>
      <div class="card"><div class="spread"><h2 class="h3">Perk redemptions</h2><a class="xs" href="#/perks">All perks</a></div>${bars(D.perks.slice().sort((a, b) => b.clicks - a.clicks).map((p) => ({ label: p.partner, n: p.clicks })), "redemptions")}</div>
      <div class="card"><h2 class="h3">Most active board channels</h2><p class="xs muted" style="margin-bottom:8px">Posts and replies, last ${n} weeks</p>${bars(M.channels.map((c) => ({ label: c.name, n: c.n })), "posts and replies")}</div>
      <div class="card"><h2 class="h3">Event RSVPs by event</h2><p class="xs muted" style="margin-bottom:8px">Upcoming events</p>${bars(D.events.slice().sort((a, b) => b.going - a.going).slice(0, 6).map((e) => ({ label: e.title, n: e.going + (S.rsvp[e.id] ? 1 : 0), link: "#/events/" + e.id })), "going")}</div>
    </div>
    <p class="xs faint" style="margin-top:14px">In the real build these come from an activity log kept for 13 months. Which numbers NEXT wants here is still an open question.</p>
  </div>` };
};

// ================= MEMBERS =================
const MEM = { q: "", tab: "members" };
PAGES["admin/members"] = () => {
  const q = MEM.q.toLowerCase();
  const list = D.people.filter((p) => !q || (p.name + p.email + p.badges.join(" ") + programLine(p)).toLowerCase().includes(q));
  const roleSel = (p) => `<select style="width:auto; padding:5px 28px 5px 10px; font-size:13px; border-radius:999px" onchange="A.setRole('${p.id}', this.value)" aria-label="Role for ${h(p.name)}">${["Member", "Moderator", "Admin"].map((r) => `<option ${p.permission === r ? "selected" : ""}>${r}</option>`).join("")}</select>`;
  return { section: "admin/members", title: "Members", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Members</h1><p class="fact">${D.people.length} members</p></div>
      <div class="row"><button class="btn" onclick="A.invite()">Invite someone</button><button class="btn pri" onclick="A.importCsv()">Import cohort CSV</button></div></div>
    <div class="tabs">${[["members", "Members"], ["log", "Admin log"]].map(([k, l]) => `<button class="${MEM.tab === k ? "on" : ""}" onclick="MEM.tab='${k}'; render()">${l}</button>`).join("")}</div>
    ${MEM.tab === "members" ? `
    <div class="spread" style="margin-bottom:12px"><div class="searchbar" style="flex:1; max-width:420px">${icon("search")}<input type="search" id="mem-q" aria-label="Search name, email, badge or cohort" placeholder="Search name, email, badge or cohort" value="${h(MEM.q)}" oninput="MEM.q=this.value; render()" style="padding:9px 12px 9px 40px; font-size:14px"></div><span class="small muted">${list.length} of ${D.people.length}</span></div>
    <div class="card flush tablewrap"><table class="t">
      <thead><tr><th>Member</th><th>Badges</th><th>Program</th><th>Role</th><th>Last active</th><th>Status</th><th><span class="sr">Actions</span></th></tr></thead>
      <tbody>${list.map((p) => `<tr>
        <td><div class="row" style="flex-wrap:nowrap; gap:10px">${av(p.id, "sm")}<div><a class="strong" href="#/people/${p.id}" style="color:inherit">${h(p.name)}</a><div class="xs muted">${h(p.email)}</div></div></div></td>
        <td class="small">${badgesFull(p)}</td><td class="small nowrap">${h(programLine(p)) || "–"}</td><td>${roleSel(p)}</td>
        <td class="small nowrap">${p.lastActiveDays === 0 ? "Today" : p.lastActiveDays + "d ago"}</td>
        <td>${p.status === "Active" ? '<span class="tag good">Active</span>' : `<span class="tag red">${h(p.status)}</span>`}</td>
        <td><div style="position:relative"><button class="iconbtn" onclick="A.menu('mm-${p.id}', event)" aria-label="More for ${h(p.name)}">${icon("more")}</button>
          <div class="menu" id="mm-${p.id}" hidden><button class="mi" onclick="A.editBadges('${p.id}')">Edit badges</button><button class="mi" onclick="toast('Sign-in email changed (prototype)')">Change sign-in email</button><button class="mi" onclick="toast('Profile hidden from the directory')">Hide profile</button><button class="mi" onclick="person('${p.id}').status = person('${p.id}').status === 'Active' ? 'Removed' : 'Active'; render()">${p.status === "Active" ? "Remove access" : "Restore access"}</button></div></div></td>
      </tr>`).join("")}</tbody></table></div>` : `
    <div class="list">${D.auditLog.map((l) => `<div class="li">${av(l.who, "sm")}<div class="grow"><span class="strong">${h(person(l.who).name)}</span> <span>${h(l.what)}</span></div><span class="xs faint nowrap">${ago(l.hoursAgo || 0.02)}</span></div>`).join("")}</div>`}
  </div>` };
};
A.setRole = (id, role) => { const p = person(id); p.permission = role; D.auditLog.unshift({ who: S.me, what: `Gave ${p.name} the ${role} role`, hoursAgo: 0 }); toast(`${p.name} is now a ${role}`); };
A.editBadges = (id) => {
  const p = person(id);
  modal(`${modalHead("Badges for " + h(p.name), "Badges are visible on profiles. A person can have several. They don't change permissions.")}
    <div class="stack">${D.TAXONOMY.badges.map((b) => `<label class="check"><input type="checkbox" class="eb" value="${b}" ${p.badges.includes(b) ? "checked" : ""}><span class="badge ${BADGE_CLASS[b]}">${b}</span></label>`).join("")}</div>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="person('${id}').badges = $$('.eb:checked').map(i=>i.value); D.auditLog.unshift({who:S.me, what:'Updated badges for ${h(p.name).replace(/'/g, "\\'")}', hoursAgo:0}); A.closeModal(); render(); toast('Badges saved')">Save badges</button></footer>`);
};
A.invite = () => {
  modal(`${modalHead("Invite someone", "They'll get an email with a sign-in link. Use this for staff, board members, or anyone missing from an import.")}
    <div class="stack"><label class="field"><span>Name</span><input type="text" id="inv-name"></label><label class="field"><span>Email</span><input type="email" id="inv-email"></label>
    <div class="field"><span>Badges</span><div class="row">${D.TAXONOMY.badges.map((b) => `<label class="chip"><input type="checkbox" style="accent-color:var(--red);margin:0">${b}</label>`).join("")}</div></div></div>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="A.closeModal(); toast('Invite sent')">Send invite</button></footer>`);
};
A.importCsv = () => {
  const rows = [["Avery Singh", "avery.singh@example.com", "NEXT AI", "2027", "ok"], ["Mateo Ruiz", "mateo.ruiz@example.com", "NEXT AI", "2027", "ok"], ["Jun Park", "jun.park@example", "NEXT AI", "2027", "Email looks wrong"], ["Claire Dubois", "claire.dubois@example.com", "NEXT AI", "2027", "ok"], ["Priya Shah", "priya.shah@example.com", "NEXT AI", "2027", "Already a member. Will add the 2027 cohort to her profile"]];
  modal(`${modalHead("Import a cohort", "Upload NEXT's CSV. We check every row before anyone is invited.")}
    <div class="note row" style="margin-bottom:14px">${icon("upload")}<span class="grow"><b>next-ai-2027.csv</b> <span class="muted">(sample file loaded)</span></span><button class="btn sm" onclick="toast('Choose a different file (prototype)')">Change file</button></div>
    <div class="card flush tablewrap"><table class="t"><thead><tr><th>Name</th><th>Email</th><th>Program</th><th>Cohort</th><th>Check</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td class="small">${r[1]}</td><td class="small">${r[2]}</td><td class="small">${r[3]}</td><td class="small">${r[4] === "ok" ? `<span style="color:var(--good)">${icon("check", "sm")} Ready</span>` : r[4].startsWith("Already") ? `<span class="muted">${r[4]}</span>` : `<span style="color:var(--red)">${r[4]}</span>`}</td></tr>`).join("")}</tbody></table></div>
    <p class="small muted" style="margin-top:10px">3 new invites, 1 update, 1 row to fix. Fix it in the file, or skip it and import the rest.</p>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="A.closeModal(); D.auditLog.unshift({who:S.me, what:'Imported cohort NEXT AI 2027 (3 invited, 1 updated, 1 skipped)', hoursAgo:0}); toast('3 invites sent. 1 row skipped.')">Import and send 3 invites</button></footer>`, "wide");
};
PAGES.admin = PAGES["admin/reports"];
