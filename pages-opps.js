// Jobs, perks, resources.

// ================= JOBS =================
const JOB = { q: "" };
const JOB_FILTERS = [["fn", "Function", (j) => j.fn], ["type", "Type", (j) => j.type], ["mode", "Work mode", (j) => j.mode], ["loc", "Location", (j) => j.location], ["stage", "Company stage", (j) => company(j.company).stage], ["sector", "Sector", (j) => company(j.company).sectors]];
PAGES.jobs = (parts) => {
  if (parts[1] === "new") return newJobPage();
  if (parts[1]) return jobPage(parts[1]);
  const st = filterState("jobs", JOB_FILTERS.map((f) => f[0]));
  const getters = Object.fromEntries(JOB_FILTERS.map((f) => [f[0], f[2]]));
  const q = JOB.q.toLowerCase();
  const res = D.jobs.filter((j) => (!q || (j.title + " " + company(j.company).name + " " + j.desc + " " + j.location).toLowerCase().includes(q)) && passes(st, j, getters)).sort((a, b) => a.postedDays - b.postedDays);
  const defs = JOB_FILTERS.map(([key, label, fn]) => ({ key, label, values: counted(D.jobs, fn) }));
  const mine = D.jobs.filter((j) => j.poster === S.me);
  return { section: "jobs", title: "Jobs", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Jobs</h1><p class="fact">${D.jobs.length} open roles</p></div><a class="btn pri" href="#/jobs/new">Post a job</a></div>
    <div class="cols">
      <div>
        <div class="searchbar">${icon("search")}<input type="search" id="job-q" aria-label="Search roles, companies or cities" placeholder="Search roles, companies or cities" value="${h(JOB.q)}" oninput="JOB.q=this.value; render()"></div>
        ${filterChips("jobs", defs, st)}
        <div class="resultshead"><span class="label">${res.length} open roles</span></div>
        <div class="list">${res.map((j) => { const c = company(j.company); return `<div class="li has-link" style="align-items:flex-start">${logo(c)}<div class="grow stack" style="gap:3px"><h2 class="h3"><a class="stretch" href="#/jobs/${j.id}">${hl(j.title, JOB.q)}</a></h2><div class="small"><a href="#/companies/${c.id}">${h(c.name)}</a><span class="muted" style="margin-left:8px">${h(c.stage)}</span></div>
          <div class="row" style="gap:6px; margin-top:4px"><span class="tag">${h(j.fn)}</span><span class="tag out">${h(j.type)}</span><span class="tag out">${h(j.mode)}</span><span class="small muted">${h(j.location)}</span></div></div>
          <div class="stack" style="justify-items:end; gap:4px; text-align:right"><span class="small strong">${h(j.comp)}</span><span class="xs faint">${j.postedDays === 0 ? "Today" : j.postedDays + "d ago"}</span></div></div>`; }).join("") || `<div class="li"><div class="empty grow" style="border:0">No roles match. Try another filter.</div></div>`}</div>
      </div>
      <aside class="stack">
        ${mine.length ? `<div class="card"><h2 class="h3">Your listings</h2><div class="stack" style="gap:10px">${mine.map((j) => `<a class="spread" href="#/jobs/${j.id}" style="color:inherit"><span class="small strong">${h(j.title)}</span><span class="xs muted">${j.clicks} clicks</span></a>`).join("")}</div><p class="xs faint" style="margin-top:10px">Clicks count people who opened the application link.</p></div>` : ""}
        <div class="card stack"><h2 class="h3">Who can post</h2><p class="small muted">Alumni and participants can post roles at their own company. Listings stay up 60 days, then you're asked to renew.</p></div>
      </aside>
    </div></div>` };
};
function jobPage(id) {
  const j = D.jobs.find((x) => x.id === id); if (!j) return { section: "jobs", html: "Not found" };
  const c = company(j.company); const poster = person(j.poster); const mine = j.poster === S.me;
  return { section: "jobs", title: j.title, html: `<div class="wrap read">
    <a class="back" href="#/jobs">${icon("back", "sm")}Jobs</a>
    <div class="card stack-lg" style="padding:24px">
      <div class="row" style="flex-wrap:nowrap; gap:14px; align-items:flex-start">${logo(c)}<div class="grow stack" style="gap:4px"><h1 class="dtitle">${h(j.title)}</h1><div><a href="#/companies/${c.id}">${h(c.name)}</a><span class="muted small" style="margin-left:8px">${h(c.oneLiner)}</span></div></div></div>
      <dl class="dl"><dt>Pay</dt><dd class="strong">${h(j.comp)}</dd>${j.equity ? `<dt>Equity</dt><dd>${h(j.equity)}</dd>` : ""}<dt>Type</dt><dd>${h(j.type)}, ${h(j.mode)}</dd><dt>Location</dt><dd>${h(j.location)}</dd><dt>Team</dt><dd>${h(c.team)} people, ${h(c.stage)}</dd><dt>Posted</dt><dd>${j.postedDays === 0 ? "Today" : j.postedDays + " days ago"} by <a href="#/people/${poster.id}">${h(poster.name)}</a></dd></dl>
      <div class="stack"><h2 class="h3">About the role</h2><p>${h(j.desc)}</p></div>
      <div class="stack"><h2 class="h3">What they're looking for</h2><ul>${j.reqs.map((r) => `<li>${h(r)}</li>`).join("")}</ul></div>
      <div class="row">
        <button class="btn pri lg" onclick="A.applyClick('${j.id}')">Apply on ${h(c.name)}'s site</button>
        ${mine ? "" : `<a class="btn lg" href="#/people/${poster.id}">Ask ${h(poster.name.split(" ")[0])} about it</a>`}
        <span class="grow"></span><button class="btn sm ghost" onclick="A.report('Job','${j.id}')">Report</button>
      </div>
      <p class="xs faint">You'll leave NEXT Alumni to apply. ${h(new URL(j.applyUrl).hostname)}</p>
      ${mine ? `<div class="note"><b>${j.clicks} people</b> have opened the application link. Only you and NEXT admins see this number.</div>` : ""}
    </div></div>` };
}
A.applyClick = (id) => { const j = D.jobs.find((x) => x.id === id); j.clicks++; S.clicks.jobs++; toast("Opened the application page in a new tab (prototype: link not followed)"); render(); };
function newJobPage() {
  const mine = D.companies.filter((c) => c.founders.includes(S.me));
  return { section: "jobs", title: "Post a job", html: `<div class="wrap read">
    <a class="back" href="#/jobs">${icon("back", "sm")}Jobs</a>
    <div class="pagehead"><div><h1>Post a job</h1><p class="fact">People apply on your site.</p></div></div>
    <form class="card stack-lg" onsubmit="event.preventDefault(); A.postJob()">
      <label class="field"><span>Company</span><select id="nj-co">${(mine.length ? mine : D.companies.slice(0, 1)).map((c) => `<option value="${c.id}">${h(c.name)}</option>`).join("")}</select><span class="hint">Pulled from the companies on your profile.</span></label>
      <label class="field"><span>Job title</span><input type="text" id="nj-title" required placeholder="Senior product designer"></label>
      <div class="grid sm" style="gap:14px"><label class="field"><span>Function</span><select id="nj-fn">${D.TAXONOMY.jobFunctions.map((x) => `<option>${x}</option>`).join("")}</select></label><label class="field"><span>Type</span><select id="nj-type">${D.TAXONOMY.jobTypes.map((x) => `<option>${x}</option>`).join("")}</select></label><label class="field"><span>Work mode</span><select id="nj-mode">${D.TAXONOMY.workModes.map((x) => `<option>${x}</option>`).join("")}</select></label></div>
      <div class="grid sm" style="gap:14px"><label class="field"><span>Location</span><input type="text" id="nj-loc" placeholder="Toronto, ON"></label><label class="field"><span>Pay range</span><input type="text" id="nj-comp" required placeholder="$100K – $120K"></label><label class="field"><span>Equity (optional)</span><input type="text" id="nj-eq" placeholder="0.1% – 0.3%"></label></div>
      <label class="field"><span>Description</span><textarea id="nj-desc" rows="5" required></textarea></label>
      <label class="field"><span>Application link</span><input type="url" id="nj-url" required placeholder="https://yourcompany.com/careers/role"><span class="hint">Where people apply. We don't collect applications here.</span></label>
      <div class="row" style="justify-content:flex-end"><a class="btn ghost" href="#/jobs">Cancel</a><button class="btn pri">Post job</button></div>
    </form></div>` };
}
A.postJob = () => {
  const id = "j" + Date.now();
  D.jobs.unshift({ id, company: $("#nj-co").value, title: $("#nj-title").value, fn: $("#nj-fn").value, type: $("#nj-type").value, mode: $("#nj-mode").value, location: $("#nj-loc").value || "Canada", comp: $("#nj-comp").value, equity: $("#nj-eq").value, postedDays: 0, poster: S.me, clicks: 0, applyUrl: $("#nj-url").value, desc: $("#nj-desc").value, reqs: [] });
  go("#/jobs/" + id); toast("Job posted");
};

// ================= PERKS =================
const PERK = { cat: "All", revealed: {} };
PAGES.perks = () => {
  const cats = ["All"].concat([...new Set(D.perks.map((p) => p.cat))]);
  const isFounder = me().badges.includes("Founder");
  const list = D.perks.filter((p) => PERK.cat === "All" || p.cat === PERK.cat);
  return { section: "perks", title: "Perks", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Perks</h1><p class="fact">${D.perks.length} partner offers</p></div><a class="btn" href="#/people/sofia-reyes">Suggest a partner</a></div>
    <div class="row" style="margin-bottom:16px">${cats.map((c) => `<button class="chip ${PERK.cat === c ? "on" : ""}" onclick="PERK.cat='${c}'; render()">${h(c)}</button>`).join("")}</div>
    ${[...new Set(list.map((p) => p.cat))].map((cat) => `<section style="margin-bottom:22px"><h2 class="h3" style="margin-bottom:8px">${h(cat)}</h2><div class="list">${list.filter((p) => p.cat === cat).map((p) => { const locked = p.who === "Founders" && !isFounder; return `<div class="li" style="align-items:flex-start">
      <div class="grow stack" style="gap:3px"><div class="strong" style="font-size:16px">${h(p.value)}</div><div class="small">${h(p.partner)}<span class="muted" style="margin-left:10px">${p.who === "Founders" ? "Founders only" : "All members"}</span></div><p class="small muted">${h(p.detail)} Expires: ${h(p.expires)}.</p></div>
      <div style="flex:none">${locked ? `<button class="btn sm" disabled>Founders only</button>` :
          p.how === "code" ? (PERK.revealed[p.id] ? `<button class="btn sm dark" onclick="A.copy('${p.code}')" aria-label="Copy code ${h(p.code)}">${h(p.code)}</button>` : `<button class="btn sm pri" onclick="A.perk('${p.id}')">Show code</button>`) :
          p.how === "link" ? `<button class="btn sm pri" onclick="A.perk('${p.id}')">Claim offer</button>` :
          `<button class="btn sm pri" onclick="A.perk('${p.id}'); go('#/people/${p.contact}')">Contact ${h(person(p.contact).name.split(" ")[0])}</button>`}</div>
    </div>`; }).join("")}</div></section>`).join("")}
  </div>` };
};
A.perk = (id) => { const p = D.perks.find((x) => x.id === id); p.clicks++; S.clicks.perks++; if (p.how === "code") PERK.revealed[id] = true; if (p.how === "link") toast("Opened " + p.partner + " in a new tab (prototype)"); render(); };
A.copy = (txt) => { try { navigator.clipboard.writeText(txt); } catch (e) {} toast("Copied " + txt); };

// ================= RESOURCES =================
const RES = { tab: "rooms", day: 1, room: "r1", slot: null, oh: null };
const SLOTS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const taken = (room, day, s) => (room.charCodeAt(1) + day * 3 + s.length + parseInt(s)) % 4 === 0 || D.bookings.some((b) => b.roomId === room && b.day === day && b.slot === s);
PAGES.resources = (parts) => {
  if (parts[1] === "bookings") RES.tab = "mine";
  const days = Array.from({ length: 10 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }).filter((d) => d.getDay() !== 0 && d.getDay() !== 6).slice(0, 7);
  const tabs = [["rooms", "Book a room"], ["hours", "Office hours"], ["guides", "Guides and templates"], ["mine", "My bookings"]];
  let body = "";
  if (RES.tab === "rooms") {
    const room = D.rooms.find((r) => r.id === RES.room); const day = Math.min(RES.day, days.length - 1); const d = days[day];
    body = `<div class="cols wide-side">
      <div class="stack-lg">
        <div class="card stack"><h2 class="h3">Pick a space at NEXT Toronto</h2>
          <div class="list">${D.rooms.map((r) => `<label class="li click" style="cursor:pointer"><input type="radio" name="room" ${RES.room === r.id ? "checked" : ""} onchange="RES.room='${r.id}'; RES.slot=null; render()" style="accent-color:var(--red)"><div class="grow"><div class="strong">${h(r.name)}</div><div class="xs muted">${r.amenities.map(h).join(", ")}</div></div><span class="small muted nowrap">${r.cap === 1 ? "1 person" : "Up to " + r.cap}</span></label>`).join("")}</div></div>
        <div class="card stack"><h2 class="h3">Pick a time</h2>
          <div class="daystrip">${days.map((x, i) => `<button class="${i === day ? "on" : ""}" onclick="RES.day=${i}; RES.slot=null; render()">${DOW[x.getDay()]}<b>${x.getDate()}</b></button>`).join("")}</div>
          <div class="slots">${SLOTS.map((s) => { const t = taken(room.id, day, s); return `<button class="slot ${t ? "taken" : ""} ${RES.slot === s ? "on" : ""}" ${t ? "disabled aria-disabled=true" : ""} onclick="RES.slot='${s}'; render()">${time12(s)}</button>`; }).join("")}</div>
          <span class="xs faint">One-hour blocks. Crossed-out times are booked.</span></div>
      </div>
      <div class="card stack" style="position:sticky; top:80px"><h2 class="h3">Your booking</h2>
        <dl class="dl"><dt>Space</dt><dd>${h(room.name)}</dd><dt>Day</dt><dd>${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}</dd><dt>Time</dt><dd>${RES.slot ? time12(RES.slot) + " for 1 hour" : '<span class="muted">Pick a time</span>'}</dd><dt>Where</dt><dd>NEXT office, Toronto</dd></dl>
        ${room.approval ? `<div class="note">The event space needs NEXT approval. David Osei confirms within 2 business days.</div>` : ""}
        <button class="btn pri block" ${RES.slot ? "" : "disabled"} onclick="A.bookRoom()">${room.approval ? "Request booking" : "Book"}</button>
        <p class="xs faint">Bring your member QR code to the front desk. Cancel up to 2 hours before.</p></div>
    </div>`;
  } else if (RES.tab === "hours") {
    body = `<div class="grid">${D.officeHours.map((o) => { const p = person(o.who); return `<div class="card stack">
      <div class="row" style="flex-wrap:nowrap; gap:12px">${av(p.id, "md")}<div class="grow"><a class="strong" href="#/people/${p.id}" style="color:inherit">${h(p.name)}</a><div class="row" style="gap:4px">${badges(p, 1)}</div></div><span class="xs muted">${o.length} min</span></div>
      <p class="small">${h(o.topic)}</p>
      <div class="slots">${o.slots.map((s) => `<button class="slot ${RES.oh === o.id + s ? "on" : ""}" onclick="RES.oh='${o.id}${s}'; render()">${h(s)}</button>`).join("")}</div>
      <button class="btn sm pri" ${RES.oh && RES.oh.startsWith(o.id) ? "" : "disabled"} onclick="A.bookOH('${o.id}')">Book a meeting</button></div>`; }).join("")}</div>`;
  } else if (RES.tab === "guides") {
    body = `<div class="list">${D.guides.map((g) => `<div class="li has-link">${icon("resources")}<div class="grow"><div class="strong"><button class="stretch btn link" style="color:inherit; font:inherit; font-weight:600" onclick="toast('Opens the ${h(g.kind.toLowerCase())} (hosted file in the real build)')">${h(g.title)}</button></div><div class="small muted">${h(g.about)}</div></div><div class="stack" style="justify-items:end; gap:2px"><span class="tag out">${h(g.kind)}</span><span class="xs faint">${h(g.by)}, ${h(g.updated)}</span></div></div>`).join("")}</div>`;
  } else {
    const mine = D.bookings.filter((b) => b.who === S.me);
    body = mine.length ? `<div class="list">${mine.map((b) => `<div class="li">${icon(b.kind === "room" ? "door" : "clock")}<div class="grow"><div class="strong">${h(b.what)}</div><div class="small muted">${h(b.when)}</div></div><button class="btn sm" onclick="A.cancelBooking('${b.id}')">Cancel</button></div>`).join("")}</div>`
      : `<div class="empty"><h2 class="h3">No bookings yet</h2><p>Book a room at NEXT or a meeting with staff.</p><button class="btn" onclick="RES.tab='rooms'; render()">Book a room</button></div>`;
  }
  return { section: "resources", title: "Resources", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Resources</h1></div></div>
    <div class="tabs">${tabs.map(([k, l]) => `<button class="${RES.tab === k ? "on" : ""}" onclick="RES.tab='${k}'; ${k === "mine" ? "" : "location.hash === '#/resources/bookings' ? go('#/resources') : "}render()">${l}${k === "mine" && D.bookings.filter((b) => b.who === S.me).length ? `<span class="count">${D.bookings.filter((b) => b.who === S.me).length}</span>` : ""}</button>`).join("")}</div>
    ${body}
  </div>` };
};
A.bookRoom = () => {
  const room = D.rooms.find((r) => r.id === RES.room); const d = new Date(); let n = 0; const target = RES.day;
  const days = []; while (days.length <= target) { const x = new Date(); x.setDate(x.getDate() + n++); if (x.getDay() !== 0 && x.getDay() !== 6) days.push(x); }
  const dd = days[target];
  D.bookings.push({ id: "b" + Date.now(), kind: "room", roomId: room.id, day: RES.day, slot: RES.slot, what: room.name + (room.approval ? " (waiting for approval)" : ""), when: `${DOW[dd.getDay()]}, ${MONTHS[dd.getMonth()]} ${dd.getDate()}, ${time12(RES.slot)}`, who: S.me });
  D.metrics.bookings[D.metrics.bookings.length - 1]++;
  RES.slot = null; RES.tab = "mine"; render(); toast(room.approval ? "Request sent to NEXT" : "Booked. It's in My bookings.");
};
A.bookOH = (oid) => {
  const o = D.officeHours.find((x) => x.id === oid); const slot = RES.oh.slice(oid.length);
  D.bookings.push({ id: "b" + Date.now(), kind: "meeting", what: `${o.length}-min meeting with ${person(o.who).name}`, when: slot + ", video link by email", who: S.me });
  D.metrics.bookings[D.metrics.bookings.length - 1]++;
  RES.oh = null; RES.tab = "mine"; render(); toast("Meeting booked with " + person(o.who).name);
};
A.cancelBooking = (id) => { D.bookings = D.bookings.filter((b) => b.id !== id); render(); toast("Booking cancelled"); };
