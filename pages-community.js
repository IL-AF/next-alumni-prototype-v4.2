// Board, events and messages.

// ================= BOARD =================
const BOARD = { sort: "hot", channels: new Set(), q: "" };
const countReplies = (list) => list.reduce((n, c) => n + 1 + countReplies(c.replies), 0);
const hot = (p) => (p.votes + countReplies(p.replies)) / Math.pow(p.hoursAgo + 2, 1.2);
function voteBtn(id, votes, sm = "") {
  const on = !!S.votes[id];
  return `<button class="pill ${sm} ${on ? "voted" : ""}" onclick="event.stopPropagation(); A.vote('${id}')" aria-pressed="${on}" aria-label="Upvote, ${votes + (on ? 1 : 0)} votes">${icon("up", "sm")}${votes + (on ? 1 : 0)}</button>`;
}
A.vote = (id) => { S.votes[id] = !S.votes[id]; render(); };
function postCard(p) {
  const a = person(p.author);
  return `<article class="card post has-link">
    ${p.pinned ? `<span class="pinned">Pinned by NEXT</span>` : ""}
    <div class="meta">${av(a.id, "xs")}${plink(a.id)}${badges(a)}<span>${ago(p.hoursAgo)}</span></div>
    <h2 class="h3"><a class="stretch" href="#/board/${p.id}">${h(p.title)}</a></h2>
    <p class="muted clamp2">${linkify(p.body)}</p>
    ${p.poll ? `<span class="small muted">Poll with ${p.poll.options.length} options, ${p.poll.options.reduce((n, o) => n + o.votes, 0)} votes so far</span>` : ""}
    <div class="row">${voteBtn(p.id, p.votes)}<span class="pill">${icon("comment", "sm")}${countReplies(p.replies)}<span class="sr"> replies</span></span>
      ${p.channels.map((c) => `<button class="tag out" style="cursor:pointer" onclick="BOARD.channels = new Set(['${c}']); go('#/board')" aria-label="Show only ${h(c)}">${h(c)}</button>`).join("")}</div>
  </article>`;
}
PAGES.board = (parts) => {
  if (parts[1] === "new") return newPostPage();
  if (parts[1]) return threadPage(parts[1], parts[2]);
  let posts = D.posts.filter((p) => !BOARD.channels.size || p.channels.some((c) => BOARD.channels.has(c)));
  if (BOARD.q) { const q = BOARD.q.toLowerCase(); posts = posts.filter((p) => (p.title + " " + p.body).toLowerCase().includes(q)); }
  const sorter = { hot: (a, b) => hot(b) - hot(a), new: (a, b) => a.hoursAgo - b.hoursAgo, top: (a, b) => b.votes - a.votes }[BOARD.sort];
  posts = posts.slice().sort(sorter);
  const pinned = posts.filter((p) => p.pinned); const rest = posts.filter((p) => !p.pinned);
  const chCount = (c) => D.posts.filter((p) => p.channels.includes(c)).length;
  return { section: "board", title: "Board", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Board</h1></div><a class="btn pri" href="#/board/new">New post</a></div>
    <div class="cols">
      <div class="stack">
        <div class="spread">
          <div class="seg" role="group" aria-label="Sort posts">${["hot", "new", "top"].map((s) => `<button class="${BOARD.sort === s ? "on" : ""}" onclick="BOARD.sort='${s}'; render()">${s[0].toUpperCase() + s.slice(1)}</button>`).join("")}</div>
          <div class="searchbar" style="flex:1; max-width:320px">${icon("search")}<input type="search" id="board-q" aria-label="Search posts" placeholder="Search posts" value="${h(BOARD.q)}" oninput="BOARD.q=this.value; render()" style="padding:8px 12px 8px 40px; font-size:14px"></div>
        </div>
        ${BOARD.channels.size ? `<div class="row small muted">Showing posts in ${[...BOARD.channels].map((c) => `<b>${h(c)}</b>`).join(", ")}. <button class="btn link" onclick="BOARD.channels.clear(); render()">Show all</button></div>` : ""}
        ${pinned.concat(rest).map(postCard).join("") || `<div class="empty"><h2 class="h3">No posts here yet</h2><p>Start the conversation in this channel.</p><a class="btn pri" href="#/board/new">New post</a></div>`}
      </div>
      <aside class="stack">
        <div class="card"><h2 class="h3">Channels</h2>
          <div class="stack" style="gap:2px">${D.TAXONOMY.channels.map((c) => `<label class="opt row" style="justify-content:space-between; padding:5px 0; cursor:pointer"><span class="row"><input type="checkbox" style="accent-color:var(--red)" ${BOARD.channels.has(c) ? "checked" : ""} onchange="this.checked ? BOARD.channels.add('${c}') : BOARD.channels.delete('${c}'); render()">${h(c)}</span><span class="xs faint">${chCount(c)}</span></label>`).join("")}</div>
        </div>
        <div class="card stack"><h2 class="h3">Need an intro?</h2><p class="small muted">Post in Intro requests to ask everyone, or send a private request from someone's profile.</p><button class="btn sm" onclick="BOARD.channels = new Set(['Intro requests']); render()">Open Intro requests</button></div>
        <div class="card stack"><h2 class="h3">Board rules</h2><p class="small muted">Be useful, be kind, no selling. Report anything that breaks the rules and a moderator will review it.</p><a class="small" href="#/rules-view">Read the community rules</a></div>
      </aside>
    </div></div>` };
};
const UI = { collapsed: {}, replyTo: null, threadSort: "top" };
function findComment(list, id, parent = null) { for (const c of list) { if (c.id === id) return { c, parent }; const f = findComment(c.replies, id, c); if (f) return f; } return null; }
function commentHtml(c, postId, depth) {
  const a = person(c.author); const col = UI.collapsed[c.id];
  const kids = c.replies.slice().sort(UI.threadSort === "top" ? (x, y) => y.votes - x.votes : (x, y) => x.hoursAgo - y.hoursAgo);
  return `<div class="comment">
    <div class="rail">${av(a.id, "sm")}${!col && (c.replies.length || UI.replyTo === c.id) ? `<button class="line" onclick="UI.collapsed['${c.id}']=true; render()" aria-label="Collapse thread"></button>` : ""}</div>
    <div>
      <div class="meta">${plink(a.id)}${badges(a, 2)}<span>${ago(c.hoursAgo)}</span>${col ? `<button class="btn link" style="font-size:13px" onclick="UI.collapsed['${c.id}']=false; render()">Show ${1 + countReplies(c.replies)} hidden</button>` : ""}</div>
      ${col ? "" : `<div class="body">${linkify(c.body)}</div>
      <div class="acts">${voteBtn(c.id, c.votes, "sm")}<button class="txt" onclick="UI.replyTo='${c.id}'; render(); setTimeout(()=>$('#reply-${c.id}')?.focus())">Reply</button><button class="txt" onclick="A.report('Comment', '${c.id}')">Report</button></div>
      ${UI.replyTo === c.id ? `<div class="composer" style="margin-top:10px">${mentionArea("reply-" + c.id, "Reply to " + a.name.split(" ")[0] + "…", 2)}<div class="row"><button class="btn pri sm" onclick="A.addReply('${postId}','${c.id}')">Reply</button><button class="btn sm ghost" onclick="UI.replyTo=null; render()">Cancel</button></div></div>` : ""}
      ${depth >= 5 && kids.length ? `<a class="btn link" style="display:inline-block; margin-top:10px" href="#/board/${postId}/${c.id}">Continue this thread (${countReplies(c.replies)} more)</a>` : kids.map((k) => commentHtml(k, postId, depth + 1)).join("")}`}
    </div></div>`;
}
function threadPage(id, focusId) {
  const p = D.posts.find((x) => x.id === id);
  if (!p) return { section: "board", html: `<div class="empty"><h2 class="h3">Post not found</h2></div>` };
  const a = person(p.author);
  let roots = p.replies;
  if (focusId) { const f = findComment(p.replies, focusId); if (f) roots = [f.c]; }
  roots = roots.slice().sort(UI.threadSort === "top" ? (x, y) => y.votes - x.votes : (x, y) => x.hoursAgo - y.hoursAgo);
  const pollTotal = p.poll ? p.poll.options.reduce((n, o) => n + o.votes, 0) : 0;
  return { section: "board", title: p.title, html: `<div class="wrap read">
    <a class="back" href="#/board">${icon("back", "sm")}Board</a>
    <article class="card post" style="padding:22px 24px">
      ${p.pinned ? `<span class="pinned">Pinned by NEXT</span>` : ""}
      <div class="meta">${av(a.id, "xs")}${plink(a.id)}${badges(a, 2)}<span>${ago(p.hoursAgo)}</span></div>
      <h1 class="dtitle">${h(p.title)}</h1>
      <p style="white-space:pre-wrap">${linkify(p.body)}</p>
      ${p.poll ? `<div class="poll">${p.poll.options.map((o, i) => { const pct = Math.round((o.votes / pollTotal) * 100); return `<button class="pollopt ${p.poll.voted === i ? "mine" : ""}" onclick="A.pollVote('${p.id}', ${i})" ${p.poll.voted !== null ? "disabled" : ""}>${p.poll.voted !== null ? `<span class="fill" style="width:${pct}%"></span>` : ""}<span>${h(o.label)}${p.poll.voted === i ? " (your vote)" : ""}</span><span class="strong">${p.poll.voted !== null ? pct + "%" : ""}</span></button>`; }).join("")}<span class="xs muted">${pollTotal} votes. Closes ${p.poll.closes}.</span></div>` : ""}
      <div class="row">${voteBtn(p.id, p.votes)}<span class="pill">${icon("comment", "sm")}${countReplies(p.replies)}</span>${p.channels.map((c) => `<span class="tag out">${h(c)}</span>`).join("")}<span class="grow"></span><button class="btn sm ghost" onclick="A.report('Post', '${p.id}')">Report</button></div>
    </article>
    <div class="card composer" style="margin-top:12px">${mentionArea("reply-root", "Add a reply…", 3)}<div class="spread"><span class="xs muted">Type @ to mention someone. They get notified.</span><button class="btn pri sm" onclick="A.addReply('${p.id}', null)">Reply</button></div></div>
    ${focusId ? `<div class="note" style="margin-top:14px">You're viewing one thread. <a href="#/board/${p.id}">View all ${countReplies(p.replies)} replies</a></div>` : ""}
    <div class="spread" style="margin-top:22px"><h2 class="h3">${countReplies(p.replies)} replies</h2><div class="seg">${["top", "new"].map((s) => `<button class="${UI.threadSort === s ? "on" : ""}" onclick="UI.threadSort='${s}'; render()">${s === "top" ? "Top" : "New"}</button>`).join("")}</div></div>
    <div>${roots.map((c) => commentHtml(c, p.id, 0)).join("") || `<p class="muted" style="margin-top:12px">No replies yet. Be the first to help.</p>`}</div>
  </div>` };
}
A.pollVote = (pid, i) => { const p = D.posts.find((x) => x.id === pid); p.poll.voted = i; p.poll.options[i].votes++; render(); toast("Vote counted"); };
A.addReply = (postId, parentId) => {
  const ta = $(parentId ? "#reply-" + parentId : "#reply-root"); const text = ta.value.trim();
  if (!text) { ta.focus(); return; }
  const p = D.posts.find((x) => x.id === postId);
  const c = { id: "c" + Date.now(), author: S.me, hoursAgo: 0.01, votes: 0, body: text, replies: [] };
  if (parentId) findComment(p.replies, parentId).c.replies.push(c); else p.replies.unshift(c);
  UI.replyTo = null; render();
  const mentioned = D.people.filter((x) => text.includes("@" + x.name));
  toast(mentioned.length ? `Reply posted. ${mentioned.map((x) => x.name).join(", ")} will be notified.` : "Reply posted");
};
function newPostPage() {
  const staff = me().badges.includes("NEXT Staff");
  return { section: "board", title: "New post", html: `<div class="wrap read">
    <a class="back" href="#/board">${icon("back", "sm")}Board</a>
    <div class="pagehead"><div><h1>New post</h1><p class="fact">Visible to every member.</p></div></div>
    <form class="card stack-lg" onsubmit="event.preventDefault(); A.publishPost()">
      <div class="field"><span>Channels</span><div class="row">${D.TAXONOMY.channels.filter((c) => c !== "Announcements" || staff).map((c) => `<label class="chip" style="cursor:pointer"><input type="checkbox" name="ch" value="${h(c)}" style="accent-color:var(--red); margin:0">${h(c)}</label>`).join("")}</div><span class="hint">Pick at least one.${staff ? "" : " Announcements are for NEXT staff."}</span></div>
      <label class="field"><span>Title</span><input type="text" id="np-title" maxlength="140" placeholder="Ask a question or share something useful" required></label>
      <div class="field"><span>Details</span>${mentionArea("np-body", "Add context. Type @ to mention someone.", 6)}</div>
      <label class="check"><input type="checkbox" id="np-poll" onchange="$('#pollopts').hidden = !this.checked"><span>Add a poll</span></label>
      <div id="pollopts" class="stack" hidden>
        ${[1, 2, 3].map((i) => `<input type="text" class="pollin" placeholder="Option ${i}">`).join("")}
        <span class="hint xs muted">2 to 6 options. Closes in 7 days.</span>
      </div>
      <div class="row" style="justify-content:flex-end"><a class="btn ghost" href="#/board">Cancel</a><button class="btn pri">Publish</button></div>
    </form></div>` };
}
A.publishPost = () => {
  const chans = $$('input[name="ch"]:checked').map((i) => i.value);
  if (!chans.length) { toast("Pick at least one channel"); return; }
  const id = "p" + Date.now();
  const post = { id, author: S.me, channels: chans, hoursAgo: 0.01, votes: 0, title: $("#np-title").value, body: $("#np-body").value, replies: [] };
  if ($("#np-poll").checked) { const opts = $$(".pollin").map((i) => i.value.trim()).filter(Boolean); if (opts.length >= 2) post.poll = { options: opts.map((l) => ({ label: l, votes: 0 })), closes: "in 7 days", voted: null }; }
  D.posts.unshift(post); go("#/board/" + id); toast("Published");
};

// Shared report modal (posts, comments, events, jobs, profiles, messages)
A.report = (type, id) => {
  modal(`${modalHead("Report this " + type.toLowerCase(), "A NEXT moderator will review it. The author isn't told who reported it.")}
    <div class="stack">${["Spam or self-promotion", "Harassment or unwanted contact", "Misleading or fake", "Selling to members", "Breaks job board rules", "Something else"].map((r, i) => `<label class="check"><input type="radio" name="rr" ${i === 0 ? "checked" : ""} value="${r}"><span>${r}</span></label>`).join("")}
    <label class="field"><span>Anything else? (optional)</span><textarea rows="2" id="rr-note"></textarea></label></div>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="A.sendReport('${type}','${id}')">Send report</button></footer>`);
};
A.sendReport = (type, id) => {
  const reason = $('input[name="rr"]:checked').value;
  D.reports.unshift({ id: "r" + Date.now(), type, target: "", targetLabel: `${type} reported by ${me().name}`, excerpt: "(content from the item you reported)", author: "", reason, by: S.me, hoursAgo: 0.01, status: "open", count: 1 });
  closeModal(); toast("Report sent. Thanks for flagging it."); render();
};

// ================= EVENTS =================
const EV = { view: "calendar", month: null, sel: null, filter: "all" };
const eventDate = (e) => parseDate(e.date);
function eventsFiltered() { return D.events.filter((e) => EV.filter === "all" || (EV.filter === "next" ? e.nextHosted : !e.nextHosted)).sort((a, b) => (a.date + a.start.padStart(5, "0")).localeCompare(b.date + b.start.padStart(5, "0"))); }
function eventRow(e) {
  const d = eventDate(e); const host = person(e.host);
  return `<div class="li has-link">
    <div class="datebox ${e.nextHosted ? "next" : ""}" aria-hidden="true"><b>${MONTHS[d.getMonth()]}</b><span>${d.getDate()}</span></div>
    <div class="grow stack" style="gap:3px">
      <span class="small ${e.nextHosted ? "strong" : "muted"}" style="${e.nextHosted ? "color:var(--red)" : ""}">${e.nextHosted ? "Hosted by NEXT" : "Community event"}${S.rsvp[e.id] ? `<span style="color:var(--good); margin-left:10px">You're going</span>` : ""}</span>
      <h2 class="h3"><a class="stretch" href="#/events/${e.id}">${h(e.title)}</a></h2>
      <div class="meta"><span>${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${time12(e.start)}–${time12(e.end)}</span><span>${e.mode === "Virtual" ? "Online" : h(e.city)}</span></div>
    </div>
    <div class="xs muted nowrap">${e.going + (S.rsvp[e.id] ? 1 : 0)} going${e.capacity ? ` of ${e.capacity}` : ""}</div>
  </div>`;
}
PAGES.events = (parts) => {
  if (parts[1] === "new") return newEventPage();
  if (parts[1]) return eventPage(parts[1]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (!EV.month) EV.month = new Date(today.getFullYear(), today.getMonth(), 1);
  const m = EV.month; const list = eventsFiltered();
  const first = new Date(m.getFullYear(), m.getMonth(), 1); const start = new Date(first); start.setDate(1 - first.getDay());
  const cells = []; for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); cells.push(d); }
  const key = (d) => D.iso(d);
  const sel = EV.sel; const agenda = sel ? list.filter((e) => e.date === sel) : list.filter((e) => eventDate(e) >= today).slice(0, 6);
  const calendar = `<div class="card flush">
      <div class="spread" style="padding:12px 14px"><h2>${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m.getMonth()]} ${m.getFullYear()}</h2>
        <div class="row"><button class="btn sm" onclick="EV.month = new Date(${m.getFullYear()}, ${m.getMonth() - 1}, 1); render()" aria-label="Previous month">Prev</button><button class="btn sm" onclick="EV.month=null; EV.sel=null; render()">Today</button><button class="btn sm" onclick="EV.month = new Date(${m.getFullYear()}, ${m.getMonth() + 1}, 1); render()" aria-label="Next month">Next</button></div></div>
      <div class="cal">${DOW.map((d) => `<div class="dow">${d}</div>`).join("")}
        ${cells.map((d) => { const evs = list.filter((e) => e.date === key(d)); return `<button class="day ${d.getMonth() !== m.getMonth() ? "out" : ""} ${key(d) === key(today) ? "today" : ""} ${sel === key(d) ? "sel" : ""}" onclick="EV.sel = EV.sel === '${key(d)}' ? null : '${key(d)}'; render()" aria-label="${d.toDateString()}: ${evs.length ? evs.map((e) => h(e.title) + (e.nextHosted ? " (hosted by NEXT)" : "")).join("; ") : "no events"}"><span class="num">${d.getDate()}</span>${evs.map((e) => `<span class="ev ${e.nextHosted ? "next" : ""}">${time12(e.start)} ${h(e.title)}</span>`).join("")}</button>`; }).join("")}
      </div></div>`;
  return { section: "events", title: "Events", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Events</h1><p class="fact">${D.events.filter((e) => eventDate(e) >= new Date(new Date().toDateString())).length} upcoming</p></div><a class="btn pri" href="#/events/new">Create event</a></div>
    <div class="spread" style="margin-bottom:14px">
      <div class="seg">${[["calendar", "Calendar"], ["list", "List"]].map(([k, l]) => `<button class="${EV.view === k ? "on" : ""}" onclick="EV.view='${k}'; render()">${l}</button>`).join("")}</div>
      <div class="row">${[["all", "All events"], ["next", "Hosted by NEXT"], ["community", "Community"]].map(([k, l]) => `<button class="chip ${EV.filter === k ? "on" : ""}" onclick="EV.filter='${k}'; render()">${l}</button>`).join("")}</div>
    </div>
    ${EV.view === "calendar" ? `<div class="cols wide-side">${calendar}<div class="stack"><div class="spread"><h2 class="h3">${sel ? parseDate(sel).toDateString() : "Coming up"}</h2>${sel ? `<button class="btn link" onclick="EV.sel=null; render()">Show all upcoming</button>` : ""}</div><div class="list">${agenda.map(eventRow).join("") || `<div class="li muted">Nothing on this day. <a href="#/events/new">Create an event</a></div>`}</div></div></div>`
      : `<div class="list">${list.filter((e) => eventDate(e) >= today).map(eventRow).join("")}</div><h2 class="h3" style="margin:22px 0 10px">Past</h2><div class="list">${list.filter((e) => eventDate(e) < today).map(eventRow).join("") || `<div class="li muted">No past events yet.</div>`}</div>`}
  </div>` };
};
function eventPage(id) {
  const e = D.events.find((x) => x.id === id); if (!e) return { section: "events", html: "Not found" };
  const d = eventDate(e); const host = person(e.host); const going = e.going + (S.rsvp[e.id] ? 1 : 0); const full = e.capacity && going >= e.capacity && !S.rsvp[e.id];
  const mine = e.host === S.me;
  return { section: "events", title: e.title, html: `<div class="wrap read">
    <a class="back" href="#/events">${icon("back", "sm")}Events</a>
    <div class="card stack-lg" style="padding:24px">
      <div class="row" style="gap:16px; align-items:flex-start">
        <div class="datebox ${e.nextHosted ? "next" : ""}" style="width:64px"><b>${MONTHS[d.getMonth()]}</b><span style="font-size:24px">${d.getDate()}</span></div>
        <div class="grow stack" style="gap:6px"><span class="badge ${e.nextHosted ? "next" : "community"}" style="justify-self:start">${e.nextHosted ? "Hosted by NEXT" : "Community event"}</span><h1 class="dtitle">${h(e.title)}</h1>
          <div class="meta">${av(host.id, "xs")}<span>Hosted by ${plink(host.id)}</span></div></div>
      </div>
      <dl class="dl">
        <dt>When</dt><dd>${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${time12(e.start)}–${time12(e.end)} ET</dd>
        <dt>Where</dt><dd>${e.mode === "Virtual" ? "Online. " : h(e.city) + ". "}${h(e.location)}</dd>
        <dt>Spots</dt><dd>${going} going${e.capacity ? ` of ${e.capacity}` : ", no limit"}</dd>
      </dl>
      <p>${h(e.description)}</p>
      <div class="row">
        ${mine ? `<button class="btn" onclick="toast('Editing events works the same as creating one.')">Edit</button><button class="btn danger" onclick="toast('Event cancelled. Everyone who RSVP\\'d gets an email.')">Cancel event</button>` :
          S.rsvp[e.id] ? `<button class="btn dark" onclick="A.rsvp('${e.id}')">Going. Cancel RSVP</button>` : full ? `<button class="btn" disabled>Full</button>` : `<button class="btn pri" onclick="A.rsvp('${e.id}')">RSVP</button>`}
        <button class="btn" onclick="A.ics('${e.id}')">Add to calendar</button>
        <span class="grow"></span><button class="btn sm ghost" onclick="A.report('Event','${e.id}')">Report</button>
      </div>
      <div class="stack" style="gap:8px"><h2 class="h3">Who's going</h2><div class="row"><div class="avstack">${e.attendees.concat(S.rsvp[e.id] ? [S.me] : []).slice(0, 9).map((pid) => av(pid, "sm")).join("")}</div><span class="small muted">${going} members</span></div></div>
    </div></div>` };
}
A.rsvp = (id) => { S.rsvp[id] = !S.rsvp[id]; render(); toast(S.rsvp[id] ? "You're going. We'll send a reminder the day before." : "RSVP cancelled"); };
A.ics = (id) => {
  const e = D.events.find((x) => x.id === id); const dt = (t) => e.date.replace(/-/g, "") + "T" + t.padStart(5, "0").replace(":", "") + "00";
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NEXT Alumni prototype//EN", "BEGIN:VEVENT", "UID:" + e.id + "@next-alumni.example", "DTSTART:" + dt(e.start), "DTEND:" + dt(e.end), "SUMMARY:" + e.title, "LOCATION:" + e.location, "DESCRIPTION:" + e.description, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = e.title.replace(/\W+/g, "-") + ".ics"; a.click();
  toast("Downloaded a calendar file");
};
function newEventPage() {
  const staff = me().badges.includes("NEXT Staff");
  return { section: "events", title: "Create event", html: `<div class="wrap read">
    <a class="back" href="#/events">${icon("back", "sm")}Events</a>
    <div class="pagehead"><div><h1>Create event</h1><p class="fact">Goes live right away. NEXT doesn't approve community events.</p></div></div>
    <form class="card stack-lg" onsubmit="event.preventDefault(); A.createEvent()">
      <label class="field"><span>Title</span><input type="text" id="ne-title" required placeholder="Waterloo founders breakfast"></label>
      <div class="grid sm" style="gap:14px"><label class="field"><span>Date</span><input type="date" id="ne-date" required value="${D.iso(new Date(Date.now() + 7 * 864e5))}"></label><label class="field"><span>Starts</span><input type="time" id="ne-start" value="18:00"></label><label class="field"><span>Ends</span><input type="time" id="ne-end" value="20:00"></label></div>
      <div class="grid sm" style="gap:14px"><label class="field"><span>Format</span><select id="ne-mode"><option>In person</option><option>Virtual</option></select></label><label class="field"><span>City</span><input type="text" id="ne-city" placeholder="Toronto"></label><label class="field"><span>Spots</span><input type="number" id="ne-cap" min="1" placeholder="No limit"></label></div>
      <label class="field"><span>Location details</span><input type="text" id="ne-loc" placeholder="Shown to people who RSVP"></label>
      <label class="field"><span>Description</span><textarea id="ne-desc" rows="4"></textarea></label>
      ${staff ? `<label class="check"><input type="checkbox" id="ne-next" checked><span>Mark as Hosted by NEXT</span></label>` : ""}
      <div class="row" style="justify-content:flex-end"><a class="btn ghost" href="#/events">Cancel</a><button class="btn pri">Publish event</button></div>
    </form></div>` };
}
A.createEvent = () => {
  const id = "e" + Date.now();
  D.events.push({ id, title: $("#ne-title").value, date: $("#ne-date").value, start: $("#ne-start").value, end: $("#ne-end").value, mode: $("#ne-mode").value, city: $("#ne-city").value, location: $("#ne-loc").value || "Details after RSVP", host: S.me, nextHosted: !!($("#ne-next") && $("#ne-next").checked), capacity: +$("#ne-cap").value || null, going: 0, description: $("#ne-desc").value, attendees: [] });
  EV.month = null; go("#/events/" + id); toast("Event published");
};

// ================= MESSAGES =================
const MSG = { filter: "all", q: "" };
const myConvs = () => D.conversations.filter((c) => c.members.includes(S.me));
function convName(c) { if (c.kind === "direct") return person(c.members.find((m) => m !== S.me)).name; return c.name; }
function convAv(c) {
  if (c.kind === "direct") return av(c.members.find((m) => m !== S.me), "");
  const ini = c.kind === "cohort" ? c.name.replace("NEXT ", "").split(" ").map((w) => (/\d/.test(w) ? "'" + w.slice(2) : w[0])).join("") : initials(c.name);
  return `<span class="groupav ${c.kind === "cohort" ? "cohort" : ""}">${h(ini)}</span>`;
}
PAGES.messages = (parts) => {
  const convs = myConvs().filter((c) => MSG.filter === "all" || c.kind === MSG.filter).filter((c) => !MSG.q || convName(c).toLowerCase().includes(MSG.q.toLowerCase()))
    .sort((a, b) => a.messages[a.messages.length - 1].hoursAgo - b.messages[b.messages.length - 1].hoursAgo);
  const active = parts[1] && D.conversations.find((c) => c.id === parts[1]);
  if (active) active.unread = 0;
  return { section: "messages", title: "Messages", html: `<div class="wrap">
    <div class="pagehead"><div><h1>Messages</h1></div><button class="btn" onclick="A.newGroup()">New group chat</button></div>
    <div class="msgs ${active ? "has-thread" : ""}">
      <div class="convlist">
        <div class="filt"><div class="searchbar">${icon("search")}<input type="search" id="msg-q" aria-label="Search conversations" placeholder="Search conversations" value="${h(MSG.q)}" oninput="MSG.q=this.value; render()" style="padding:8px 12px 8px 40px; font-size:14px"></div>
          <div class="seg" style="justify-self:start">${[["all", "All"], ["direct", "Direct"], ["group", "Groups"], ["cohort", "Cohorts"]].map(([k, l]) => `<button class="${MSG.filter === k ? "on" : ""}" onclick="MSG.filter='${k}'; render()">${l}</button>`).join("")}</div></div>
        <div class="items">${convs.map((c) => { const last = c.messages[c.messages.length - 1]; return `<div class="conv ${active && active.id === c.id ? "on" : ""}" onclick="go('#/messages/${c.id}')">${convAv(c)}<div class="grow"><div class="nm"><span class="t">${h(convName(c))}</span>${c.kind === "cohort" ? '<span class="badge cohort">Cohort</span>' : ""}</div><div class="pv">${last.from === S.me ? "You: " : c.kind !== "direct" ? h(person(last.from).name.split(" ")[0]) + ": " : ""}${h(last.text)}</div></div><div class="stack" style="gap:4px; justify-items:end"><span class="xs faint">${ago(last.hoursAgo)}</span>${c.unread ? `<span class="count">${c.unread}</span>` : ""}</div></div>`; }).join("") || `<div class="empty" style="margin:14px">No conversations yet. Accept an intro request to start one.</div>`}</div>
      </div>
      <div class="thread">${active ? threadHtml(active) : `<div class="empty" style="margin:auto; border:0"><h2 class="h3">Pick a conversation</h2><p>Or start a group chat with people you're connected to.</p></div>`}</div>
    </div></div>`,
    after: () => { const sc = $(".thread .scroll"); if (sc) sc.scrollTop = sc.scrollHeight; } };
};
function threadHtml(c) {
  const sub = c.kind === "direct" ? h(person(c.members.find((m) => m !== S.me)).headline) : c.kind === "cohort" ? `${c.memberCount} members. Everyone in the cohort is added automatically.` : `${c.members.length} members: ${c.members.map((m) => h(person(m).name.split(" ")[0])).join(", ")}`;
  let lastFrom = null;
  const msgs = c.messages.map((m, i) => {
    const mine = m.from === S.me; const showName = !mine && c.kind !== "direct" && lastFrom !== m.from; lastFrom = m.from;
    const sep = i === 0 || Math.floor(c.messages[i - 1].hoursAgo / 24) !== Math.floor(m.hoursAgo / 24) ? `<div class="daysep">${m.hoursAgo < 24 ? "Today" : Math.floor(m.hoursAgo / 24) === 1 ? "Yesterday" : Math.floor(m.hoursAgo / 24) + " days ago"}</div>` : "";
    return `${sep}${showName ? `<div class="msgmeta">${h(person(m.from).name)}</div>` : ""}<div class="msgrow ${mine ? "me" : ""}">${!mine && c.kind !== "direct" ? av(m.from, "xs") : ""}<div class="bubble">${linkify(m.text)}</div></div>`;
  }).join("");
  return `<header><button class="iconbtn backbtn" onclick="go('#/messages')" aria-label="Back to conversations" style="flex:none">${icon("back")}</button>${convAv(c)}<div class="grow"><div class="strong">${c.kind === "direct" ? `<a href="#/people/${c.members.find((m) => m !== S.me)}" style="color:inherit">${h(convName(c))}</a>` : h(convName(c))}</div><div class="xs muted" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${sub}</div></div>
    <div style="position:relative"><button class="iconbtn" onclick="A.menu('convmenu', event)" aria-label="Conversation options">${icon("more")}</button>
      <div class="menu" id="convmenu" hidden>${c.kind === "direct" ? `<button class="mi" onclick="toast('Blocked. They can no longer message you.')">Block ${h(convName(c).split(" ")[0])}</button>` : `<button class="mi" onclick="toast('Notifications muted for this chat')">Mute notifications</button>`}${c.kind === "group" ? `<button class="mi" onclick="toast('Left the group')">Leave group</button>` : ""}<button class="mi" onclick="A.report('Message','${c.id}')">Report a message</button></div></div></header>
    <div class="scroll" tabindex="0" aria-label="Conversation with ${h(convName(c))}">${msgs}</div>
    <form onsubmit="event.preventDefault(); A.sendMsg('${c.id}')"><textarea id="msg-input" aria-label="Message ${h(convName(c))}" placeholder="Message ${h(convName(c))}" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); A.sendMsg('${c.id}')}"></textarea><button class="btn pri" aria-label="Send">Send</button></form>`;
}
A.sendMsg = (id) => {
  const ta = $("#msg-input"); const text = ta.value.trim(); if (!text) return;
  const c = D.conversations.find((x) => x.id === id);
  c.messages.forEach((m) => (m.hoursAgo += 0)); c.messages.push({ from: S.me, hoursAgo: 0, text });
  render(); $("#msg-input").focus();
  if (c.kind === "direct") setTimeout(() => {
    const other = c.members.find((m) => m !== S.me);
    c.messages.push({ from: other, hoursAgo: 0, text: ["Sounds good!", "Thanks, that's helpful.", "Let me check and get back to you.", "Perfect, talk then."][c.messages.length % 4] });
    if (location.hash === "#/messages/" + id) render(); else c.unread++;
  }, 1600);
};
A.newGroup = () => {
  const connected = [...new Set(D.conversations.filter((c) => c.kind === "direct" && c.members.includes(S.me)).flatMap((c) => c.members))].filter((x) => x !== S.me)
    .concat(D.intros.filter((i) => i.status === "accepted" && (i.from === S.me || i.to === S.me)).map((i) => (i.from === S.me ? i.to : i.from)));
  const ids = [...new Set(connected.concat(["jordan-lee", "tomas-rivera", "isha-verma"]))];
  modal(`${modalHead("New group chat", "You can add people you're already connected with.")}
    <div class="stack"><label class="field"><span>Group name</span><input type="text" id="ng-name" placeholder="Waterloo founders"></label>
    <div class="field"><span>People</span><div class="list">${ids.map((pid) => `<label class="li" style="cursor:pointer"><input type="checkbox" class="ng-p" value="${pid}" style="accent-color:var(--red)">${av(pid, "sm")}<span class="grow">${h(person(pid).name)}<br><span class="xs muted">${h(person(pid).role)}</span></span></label>`).join("")}</div></div></div>
    <footer><button class="btn ghost" onclick="A.closeModal()">Cancel</button><button class="btn pri" onclick="A.createGroup()">Create group</button></footer>`);
};
A.createGroup = () => {
  const ppl = $$(".ng-p:checked").map((i) => i.value); if (ppl.length < 2) { toast("Pick at least two people"); return; }
  const id = "grp-" + Date.now();
  D.conversations.push({ id, kind: "group", name: $("#ng-name").value || ppl.map((p) => person(p).name.split(" ")[0]).join(", "), members: [S.me].concat(ppl), unread: 0, messages: [{ from: S.me, hoursAgo: 0, text: "Started this group." }] });
  closeModal(); go("#/messages/" + id);
};

// ================= HOME =================
PAGES.home = () => {
  const p = me(); const first = p.name.split(" ")[0];
  const now = new Date(); const hr = now.getHours(); const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const today = new Date(); today.setHours(0, 0, 0, 0); const in14 = new Date(today); in14.setDate(in14.getDate() + 14);
  const intros = D.intros.filter((i) => i.to === S.me && i.status === "pending");
  const convs = D.conversations.filter((c) => c.members.includes(S.me) && c.unread);
  const events = D.events.filter((e) => eventDate(e) >= today && eventDate(e) <= in14).sort((a, b) => (a.date + a.start.padStart(5, "0")).localeCompare(b.date + b.start.padStart(5, "0")));
  const needs = intros.length + convs.length + (isAdmin() ? openReports() : 0);
  const dayLabel = (e) => { const d = eventDate(e); const diff = Math.round((d - today) / 864e5); return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`; };
  const posts = D.posts.filter((x) => !x.pinned).slice().sort((a, b) => a.hoursAgo - b.hoursAgo).slice(0, 3);
  const jobs = D.jobs.slice().sort((a, b) => a.postedDays - b.postedDays).slice(0, 2);
  const joined = D.people.filter((x) => x.badges.includes("Current participant") && x.id !== S.me).slice(0, 2);
  const convName2 = (c) => (c.kind === "direct" ? person(c.members.find((m) => m !== S.me)).name : c.name);
  return { section: "home", title: "Home", html: `<div class="wrap">
    <p class="home-date">${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()]}, ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][now.getMonth()]} ${now.getDate()}</p>
    <h1 class="home-greet" style="text-transform:none">${greet}, ${h(first)}</h1>
    <div class="trio">
      <section aria-labelledby="h-needs">
        <h2 id="h-needs">Needs you <span class="n">${needs || "Nothing"}</span></h2>
        ${isAdmin() && openReports() ? `<div class="item"><a class="strong" href="#/admin/reports">${openReports()} reports to review</a><span class="small muted">Oldest is ${ago(Math.max(...D.reports.filter((r) => r.status === "open").map((r) => r.hoursAgo)))} old</span></div>` : ""}
        ${intros.map((i) => `<div class="item"><div class="who">${av(i.from, "sm")}<span><a class="strong" href="#/people/${i.from}" style="color:inherit">${h(person(i.from).name)}</a> <span class="small muted">wants an intro</span><br><span class="affil">${h(affilText(person(i.from)))}</span></span></div>
          <q>${h(i.note)}</q>
          <div class="acts"><button class="btn sm" onclick="A.introRespond('${i.id}', false)">Decline</button><button class="btn sm pri" onclick="A.introRespond('${i.id}', true)">Accept</button></div></div>`).join("")}
        ${convs.map((c) => { const last = c.messages[c.messages.length - 1]; return `<div class="item"><div class="who">${c.kind === "direct" ? av(c.members.find((m) => m !== S.me), "sm") : ""}<span><span class="strong">${h(convName2(c))}</span> <span class="small muted">${c.unread} unread</span></span></div>
          <q>${h(last.text)}</q>
          <div class="acts"><a class="btn sm" href="#/messages/${c.id}">Reply</a></div></div>`; }).join("")}
        ${needs ? "" : `<p class="muted small" style="padding:12px 0">You're all caught up.</p>`}
      </section>
      <section aria-labelledby="h-coming">
        <h2 id="h-coming">Coming up <a class="n" href="#/events">Calendar</a></h2>
        ${events.map((e) => `<div class="item"><span class="when ${e.nextHosted ? "next" : ""}">${dayLabel(e)}, ${time12(e.start)}${e.nextHosted ? ", hosted by NEXT" : ""}</span>
          <a class="strong" href="#/events/${e.id}" style="color:inherit">${h(e.title)}</a>
          <span class="small muted">${e.mode === "Virtual" ? "Online" : h(e.city)}${e.capacity ? `, ${e.capacity - e.going - (S.rsvp[e.id] ? 1 : 0)} spots left` : ""}</span>
          <div class="acts">${e.host === S.me ? `<span class="small strong">You're hosting</span>` : S.rsvp[e.id] ? `<span class="small" style="color:var(--good); font-weight:600">You're going</span>` : `<button class="btn sm" onclick="A.rsvp('${e.id}')">RSVP</button>`}</div></div>`).join("") || `<p class="muted small" style="padding:12px 0">Nothing in the next two weeks.</p>`}
      </section>
      <section aria-labelledby="h-around">
        <h2 id="h-around">Around the network</h2>
        ${posts.map((x) => `<div class="item"><span class="small muted">${h(person(x.author).name)} posted in ${h(x.channels[0])}, ${ago(x.hoursAgo)}</span><a class="strong" href="#/board/${x.id}" style="color:inherit">${h(x.title)}</a></div>`).join("")}
        ${jobs.map((j) => `<div class="item"><span class="small muted">New job at ${h(company(j.company).name)}</span><a class="strong" href="#/jobs/${j.id}" style="color:inherit">${h(j.title)}</a></div>`).join("")}
        ${joined.map((x) => `<div class="item"><div class="who">${av(x.id, "sm")}<span><a class="strong" href="#/people/${x.id}" style="color:inherit">${h(x.name)}</a> <span class="small muted">joined</span><br><span class="affil">${h(affilText(x))}</span></span></div></div>`).join("")}
      </section>
    </div>
  </div>` };
};

// ================= SETTINGS =================
const SET = { pauseAll: false, intros: true, messages: true, mentions: true, replies: true, eventReminders: true, eventChanges: true, digest: true, digestDay: "Monday", newsletter: true, perks: false, listed: true, secondEmail: "" };
function sw(key, label, sub, disabled) {
  return `<div class="setrow"><div class="txt"><b id="lbl-${key}">${label}</b>${sub ? `<span id="sub-${key}">${sub}</span>` : ""}</div>
    <button class="switch" role="switch" aria-checked="${!!SET[key]}" aria-labelledby="lbl-${key}" ${sub ? `aria-describedby="sub-${key}"` : ""} ${disabled ? "disabled" : ""} onclick="A.toggleSet('${key}')"></button></div>`;
}
A.toggleSet = (k) => { SET[k] = !SET[k]; render(); toast("Saved"); };
A.openToSet = (o) => { const p = me(); p.openTo = p.openTo.includes(o) ? p.openTo.filter((x) => x !== o) : p.openTo.concat(o); render(); toast("Saved"); };
PAGES.settings = () => {
  const p = me(); const off = SET.pauseAll;
  const openSw = (o, label, sub) => `<div class="setrow"><div class="txt"><b id="lbl-o-${o.replace(/\W/g, "")}">${label}</b><span>${sub}</span></div><button class="switch" role="switch" aria-checked="${p.openTo.includes(o)}" aria-labelledby="lbl-o-${o.replace(/\W/g, "")}" onclick="A.openToSet('${o}')"></button></div>`;
  return { section: "settings", title: "Settings", html: `<div class="wrap read">
    <div class="pagehead"><div><h1>Settings</h1><p class="fact">Changes save as you go.</p></div></div>
    <div class="settings">
      <section class="card" aria-labelledby="h-email"><h2 id="h-email" class="h3">Email</h2>
        <p class="small muted">Sent to ${h(p.email)}. You'll still see everything on the site.</p>
        ${sw("pauseAll", "Pause all email", "Stops every email below until you turn it back on.")}
        ${sw("intros", "Intro requests", "When someone asks to connect, and when they reply to yours.", off)}
        ${sw("messages", "New messages", "Only if a message sits unread for an hour.", off)}
        ${sw("mentions", "@mentions", "When someone mentions you in a post or reply.", off)}
        ${sw("replies", "Replies to your posts", "", off)}
        ${sw("eventReminders", "Event reminders", "The day before events you're going to.", off)}
        ${sw("eventChanges", "Event changes", "If an event you're going to moves or is cancelled.", off)}
        ${sw("digest", "Weekly digest", "Top posts, new members, jobs and upcoming events.", off)}
        ${SET.digest && !off ? `<fieldset class="setrow" style="border:0; margin:0; padding:0 0 14px; border-top:0"><legend class="small muted" style="padding:0; float:left; margin-right:14px">Send it on</legend>
          <div class="seg">${["Monday", "Friday"].map((d) => `<button type="button" class="${SET.digestDay === d ? "on" : ""}" aria-pressed="${SET.digestDay === d}" onclick="SET.digestDay='${d}'; render(); toast('Saved')">${d}</button>`).join("")}</div></fieldset>` : ""}
        ${sw("newsletter", "NEXT newsletter", "Monthly news from NEXT.", off)}
        ${sw("perks", "New perks and partner offers", "", off)}
      </section>
      <section class="card" aria-labelledby="h-priv"><h2 id="h-priv" class="h3">Privacy</h2>
        ${sw("listed", "Show my profile in the directory", "If off, only people you've messaged can see your profile.")}
        ${openSw("Coffee chats", "Open to coffee chats", "Shown on your profile.")}
        ${openSw("Intro requests", "Open to intro requests", "If off, the Request intro button is hidden on your profile.")}
        ${openSw("Mentoring", "Open to mentoring", "Shown on your profile.")}
        <div class="setrow"><div class="txt"><b>Blocked members</b><span>None</span></div></div>
      </section>
      <section class="card" aria-labelledby="h-look"><h2 id="h-look" class="h3">Appearance</h2>
        <div class="setrow"><div class="txt"><b id="lbl-theme">Theme</b><span>System follows your computer's setting.</span></div>
          <div class="seg" role="group" aria-labelledby="lbl-theme">${["system", "light", "dark"].map((t) => `<button class="${S.theme === t ? "on" : ""}" aria-pressed="${S.theme === t}" onclick="A.setTheme('${t}')">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div></div>
      </section>
      <section class="card" aria-labelledby="h-acct"><h2 id="h-acct" class="h3">Account</h2>
        <div class="setrow"><div class="txt"><b>Sign-in email</b><span>${h(p.email)}. Ask NEXT to change it.</span></div></div>
        <div class="setrow"><label class="txt grow" for="second-email"><b>Second email</b><span>Sign in with either address.</span></label>
          <form class="row" onsubmit="event.preventDefault(); SET.secondEmail = $('#second-email').value; toast('Verification email sent')"><input type="email" id="second-email" placeholder="you@personal.com" value="${h(SET.secondEmail)}" style="width:220px"><button class="btn sm">Add</button></form></div>
        <div class="setrow"><div class="txt"><b>Your data</b><span>A copy of your profile, posts and messages.</span></div><button class="btn sm" onclick="toast('A download link is on its way to your email')">Request a copy</button></div>
        <div class="setrow"><div class="txt"><b>Community rules</b><span>You agreed to version 1.1.</span></div><a class="btn sm" href="#/rules-view">Read</a></div>
      </section>
    </div>
  </div>` };
};
