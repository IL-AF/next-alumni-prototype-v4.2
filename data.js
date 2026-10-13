// Fictional data for prototype v4. Every person, company, fund, perk and event is made up.
// Program names are NEXT's real programs; cohort years are made up.
window.DATA = (function () {
  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600e3).toISOString();
  const daysFromNow = (d) => { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + d); return x; };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  const TAXONOMY = {
    badges: ["Founder", "Alumni", "Current participant", "NEXT Staff", "Board"],
    programs: ["NEXT 36", "NEXT Founders", "NEXT AI"],
    sectors: ["AI / ML", "Agtech", "B2B SaaS", "Biotech", "Climate", "Consumer", "Edtech", "Fintech", "Hardware", "Health tech", "Legal tech", "Marketplaces"],
    skills: ["Engineering leadership", "Enterprise sales", "Fundraising", "Go-to-market", "Hiring", "International expansion", "Legal", "Marketing", "Operations", "Partnerships", "Pricing", "Product", "Regulatory"],
    lookingFor: ["Advice", "Co-founder", "Customers", "Hires", "Investors", "Partners"],
    openTo: ["Coffee chats", "Intro requests", "Mentoring"],
    countries: ["Canada", "United States"],
    channels: ["General", "Announcements", "Fundraising", "Hiring", "Intro requests", "Events", "Legal & finance", "Product & tech", "Sales & marketing"],
    stages: ["Idea", "Pre-seed", "Seed", "Series A", "Series B+", "Acquired", "Closed"],
    teamSizes: ["1–5", "6–15", "16–50", "51–200", "200+"],
    models: ["B2B", "B2C", "B2G", "Marketplace"],
    jobFunctions: ["Engineering", "Product", "Design", "Sales", "Marketing", "Operations", "Finance"],
    jobTypes: ["Full-time", "Part-time", "Contract", "Internship"],
    workModes: ["On-site", "Hybrid", "Remote"],
    investorTypes: ["VC fund", "Angel", "Angel group", "Corporate VC", "Public funding"],
  };

  // ---------- People: v2 people + new ones ----------
  const extraPeople = [
    { id: "noah-fraser", name: "Noah Fraser", pronouns: "he/him", city: "Guelph", region: "ON", country: "Canada", badges: ["Founder", "Alumni"], programs: [{ name: "NEXT Founders", year: 2021 }],
      headline: "Co-founder @ Fieldnote, soil data for mid-size farms", about: "Grew up on a dairy farm. Fieldnote turns soil samples into planting plans for farms of 500 to 5,000 acres.",
      ask: "Selling to farmers, agtech grants, hardware-plus-software pricing.", sectors: ["Agtech", "Climate"], skills: ["Go-to-market", "Partnerships", "Fundraising"],
      lookingFor: { picks: ["Customers", "Investors"], text: "Seed investors who back agtech.", updated: "1 month ago" }, openTo: ["Coffee chats", "Intro requests"],
      companies: [{ name: "Fieldnote", role: "Co-founder & CEO", years: "2021 – present", status: "Active", site: "fieldnote.example" }], role: "CEO, Fieldnote", links: ["linkedin.com/in/noah-fraser-example"], updatedDays: 30 },
    { id: "isha-verma", name: "Isha Verma", pronouns: "she/her", city: "Mississauga", region: "ON", country: "Canada", badges: ["Founder", "Alumni"], programs: [{ name: "NEXT Founders", year: 2021 }],
      headline: "CEO @ Lumen Payroll, payroll for multi-province teams", about: "Lumen handles payroll and remittances for companies with staff in more than one province. 900 customers.",
      ask: "Scaling a fintech, payments compliance, hiring a VP Engineering, Series A.", sectors: ["Fintech", "B2B SaaS"], skills: ["Fundraising", "Hiring", "Regulatory", "Pricing"],
      lookingFor: { picks: ["Hires"], text: "Senior backend engineers and a VP Engineering.", updated: "2 weeks ago" }, openTo: ["Intro requests", "Mentoring"],
      companies: [{ name: "Lumen Payroll", role: "Co-founder & CEO", years: "2020 – present", status: "Active", site: "lumenpayroll.example" }], role: "CEO, Lumen Payroll", links: ["linkedin.com/in/isha-verma-example"], updatedDays: 12 },
    { id: "ben-tremblay", name: "Ben Tremblay", pronouns: "he/him", city: "Québec City", region: "QC", country: "Canada", badges: ["Alumni"], programs: [{ name: "NEXT Founders", year: 2021 }],
      headline: "Product lead @ Lumen Payroll. Ex-founder (shut down 2023)", about: "Ran a hiring marketplace for three years and shut it down. Now leading product at Lumen.",
      ask: "Shutting down a company well, product discovery, pricing pages.", sectors: ["Fintech", "Marketplaces"], skills: ["Product", "Pricing"],
      lookingFor: { picks: ["Advice"], text: "Talking to founders thinking about a pivot.", updated: "3 months ago" }, openTo: ["Coffee chats", "Mentoring"],
      companies: [], role: "Product lead, Lumen Payroll", links: [], updatedDays: 90 },
    { id: "zoe-campbell", name: "Zoe Campbell", pronouns: "she/her", city: "Toronto", region: "ON", country: "Canada", badges: ["Founder", "Current participant"], programs: [{ name: "NEXT AI", year: 2026 }],
      headline: "Founder @ Copperleaf, contract review for in-house legal teams", about: "Ex-corporate lawyer. Copperleaf flags risky clauses in vendor contracts. Pre-seed, five design partners.",
      ask: "Selling to general counsel, legal AI accuracy, pre-seed.", sectors: ["Legal tech", "AI / ML"], skills: ["Legal", "Product"],
      lookingFor: { picks: ["Customers", "Investors"], text: "Intros to GCs at mid-size companies.", updated: "1 week ago" }, openTo: ["Coffee chats", "Intro requests"],
      companies: [{ name: "Copperleaf", role: "Founder & CEO", years: "2025 – present", status: "Active", site: "copperleaf.example" }], role: "CEO, Copperleaf", links: ["linkedin.com/in/zoe-campbell-example"], updatedDays: 7 },
    { id: "kenji-sato", name: "Kenji Sato", pronouns: "he/him", city: "Vancouver", region: "BC", country: "Canada", badges: ["Founder", "Current participant"], programs: [{ name: "NEXT AI", year: 2026 }],
      headline: "Co-founder & CTO @ Kitewing", about: "Computer vision engineer. Previously built perception systems for warehouse robots.",
      ask: "Edge ML, camera hardware, hiring ML engineers.", sectors: ["AI / ML", "Hardware"], skills: ["Engineering leadership", "Hiring"],
      lookingFor: { picks: ["Hires"], text: "Two ML engineers in Vancouver.", updated: "5 days ago" }, openTo: ["Coffee chats"],
      companies: [{ name: "Kitewing", role: "Co-founder & CTO", years: "2025 – present", status: "Active", site: "kitewing.example" }], role: "CTO, Kitewing", links: [], updatedDays: 5 },
    { id: "fatima-diallo", name: "Fatima Diallo", pronouns: "she/her", city: "Toronto", region: "ON", country: "Canada", badges: ["Founder", "Alumni"], programs: [{ name: "NEXT 36", year: 2019 }],
      headline: "CEO @ Harvest Table, local food delivered to offices", about: "Harvest Table supplies office kitchens with food from Ontario farms. Series A, 70 staff.",
      ask: "Consumer and B2B logistics, Series A, managing a growing ops team.", sectors: ["Consumer", "Marketplaces"], skills: ["Operations", "Fundraising", "Hiring"],
      lookingFor: { picks: ["Hires", "Partners"], text: "Ops managers and farm partners.", updated: "1 month ago" }, openTo: ["Coffee chats", "Intro requests", "Mentoring"],
      companies: [{ name: "Harvest Table", role: "Founder & CEO", years: "2019 – present", status: "Active", site: "harvesttable.example" }], role: "CEO, Harvest Table", links: ["linkedin.com/in/fatima-diallo-example"], updatedDays: 28 },
    { id: "liam-oconnor", name: "Liam O'Connor", pronouns: "he/him", city: "Halifax", region: "NS", country: "Canada", badges: ["Alumni"], programs: [{ name: "NEXT 36", year: 2019 }],
      headline: "Principal @ Birchline Ventures. Seed investing in Atlantic Canada", about: "I invest at seed in software companies east of Montréal. Former founder of a small analytics company.",
      ask: "Raising a seed round, building a board, Atlantic Canada ecosystem.", sectors: ["B2B SaaS", "Fintech", "Climate"], skills: ["Fundraising"],
      lookingFor: { picks: ["Advice"], text: "Meeting founders raising seed in 2027.", updated: "2 weeks ago" }, openTo: ["Coffee chats", "Intro requests"],
      companies: [], role: "Principal, Birchline Ventures", links: ["linkedin.com/in/liam-oconnor-example"], updatedDays: 15 },
    { id: "sofia-reyes", name: "Sofia Reyes", pronouns: "she/her", city: "Toronto", region: "ON", country: "Canada", badges: ["NEXT Staff"], programs: [],
      headline: "Partnerships at NEXT. Perks and partner offers", about: "I look after NEXT's partner perks. If a perk isn't working or you know a partner we should add, message me.",
      ask: "Partner perks, sponsorships.", sectors: [], skills: ["Partnerships"],
      lookingFor: { picks: ["Partners"], text: "New partners for founder perks.", updated: "1 week ago" }, openTo: ["Coffee chats", "Intro requests"],
      companies: [], role: "Partnerships, NEXT Canada", links: [], updatedDays: 8 },
    { id: "david-osei", name: "David Osei", pronouns: "he/him", city: "Toronto", region: "ON", country: "Canada", badges: ["NEXT Staff"], programs: [],
      headline: "Operations at NEXT. Office space and member support", about: "I manage NEXT's Toronto office, room bookings and member accounts.",
      ask: "Booking space, account problems.", sectors: [], skills: ["Operations"],
      lookingFor: { picks: [], text: "", updated: "" }, openTo: ["Intro requests"],
      companies: [], role: "Operations, NEXT Canada", links: [], updatedDays: 3 },
    { id: "emma-larsen", name: "Emma Larsen", pronouns: "she/her", city: "Toronto", region: "ON", country: "Canada", badges: ["Founder", "Alumni"], programs: [{ name: "NEXT 36", year: 2017 }],
      headline: "Angel investor. Co-founded Stackhouse (acquired 2022)", about: "Co-founded Stackhouse with Hannah. Now I angel invest in dev tools and help founders with their first engineering hires.",
      ask: "Dev tools, first engineering hires, selling a company.", sectors: ["B2B SaaS", "AI / ML"], skills: ["Engineering leadership", "Hiring"],
      lookingFor: { picks: ["Advice"], text: "Meeting dev-tools founders.", updated: "1 month ago" }, openTo: ["Coffee chats", "Intro requests", "Mentoring"],
      companies: [{ name: "Stackhouse", role: "Co-founder & CTO", years: "2016 – 2022", status: "Acquired", site: "stackhouse.example" }], role: "Angel investor", links: [], updatedDays: 40 },
  ];
  const people = window.BASE_PEOPLE.concat(extraPeople);
  people.forEach((p, i) => { p.lastActiveDays = [0, 1, 0, 2, 5, 0, 3, 1, 9, 4, 0, 6, 12, 0, 2, 1, 3, 0, 20, 1, 4, 8, 2, 0, 0, 14][i % 26]; p.email = p.id.replace("-", ".") + "@example.com"; p.role = p.role || ""; p.permission = p.badges.includes("NEXT Staff") ? (p.id === "nadia-morin" ? "Admin" : "Moderator") : "Member"; p.status = "Active"; });
  people.find((p) => p.id === "david-osei").permission = "Admin";

  // ---------- Companies (each stored once, shared by co-founders) ----------
  const companies = [
    { id: "tidepool", name: "Tidepool Health", oneLiner: "Scheduling software that cuts no-shows at community health clinics.", sectors: ["Health tech", "B2B SaaS"], stage: "Seed", model: "B2B", hq: "Waterloo, ON", country: "Canada", founded: 2021, team: "16–50", raised: "$4.2M", hiring: true, program: "NEXT Founders 2021", site: "tidepool.example", founders: ["maya-okonkwo"], customers: "40 clinics in Ontario and Manitoba", investors: ["maple-ridge", "harbourfront"] },
    { id: "ledgerline", name: "Ledgerline", oneLiner: "AI bookkeeping that automates month-end close for small accounting firms.", sectors: ["Fintech", "AI / ML"], stage: "Seed", model: "B2B", hq: "Toronto, ON", country: "Canada", founded: 2022, team: "6–15", raised: "$3.0M", hiring: true, program: "NEXT AI 2022", site: "ledgerline.example", founders: ["priya-shah"], customers: "120 accounting firms", investors: ["maple-ridge", "sam-whitehorse-angel"] },
    { id: "voltaire", name: "Voltaire Grid", oneLiner: "Battery storage for small and municipal utilities.", sectors: ["Climate", "Hardware"], stage: "Series A", model: "B2G", hq: "Montréal, QC", country: "Canada", founded: 2021, team: "16–50", raised: "$18M", hiring: false, program: "NEXT Founders 2018", site: "voltairegrid.example", founders: ["etienne-gagnon"], customers: "6 utilities in Québec and New England", investors: ["cold-lake", "sdtc-like"] },
    { id: "parcel9", name: "Parcel9", oneLiner: "Last-mile delivery for Canadian e-commerce brands.", sectors: ["Marketplaces", "Consumer"], stage: "Acquired", model: "B2B", hq: "Montréal, QC", country: "Canada", founded: 2016, team: "51–200", raised: "$11M", hiring: false, program: "NEXT Founders 2018", site: "parcel9.example", founders: ["etienne-gagnon"], customers: "Acquired 2020", investors: [] },
    { id: "kitewing", name: "Kitewing", oneLiner: "Computer vision that spots safety hazards on construction sites.", sectors: ["AI / ML", "Hardware"], stage: "Pre-seed", model: "B2B", hq: "Vancouver, BC", country: "Canada", founded: 2025, team: "1–5", raised: "$650K", hiring: true, program: "NEXT AI 2026", site: "kitewing.example", founders: ["aisha-rahman", "kenji-sato"], customers: "3 pilots with BC contractors", investors: ["prairie-angels"] },
    { id: "prairie-freight", name: "Prairie Freight", oneLiner: "Freight marketplace for Prairie shippers.", sectors: ["Marketplaces", "Fintech"], stage: "Acquired", model: "Marketplace", hq: "Calgary, AB", country: "Canada", founded: 2014, team: "51–200", raised: "$22M", hiring: false, program: "NEXT 36 2015", site: "prairiefreight.example", founders: ["sam-whitehorse"], customers: "Acquired 2021", investors: ["cold-lake"] },
    { id: "brightpath", name: "Brightpath Learning", oneLiner: "Reading support for grades 1–4, sold to school boards.", sectors: ["Edtech", "Consumer"], stage: "Series A", model: "B2G", hq: "Ottawa, ON", country: "Canada", founded: 2019, team: "16–50", raised: "$9.5M", hiring: true, program: "NEXT Founders 2020", site: "brightpath.example", founders: ["lena-novak"], customers: "120 schools in Ontario", investors: ["harbourfront"] },
    { id: "souk", name: "Souk Direct", oneLiner: "Wholesale ordering for independent grocers.", sectors: ["Marketplaces", "Consumer"], stage: "Pre-seed", model: "Marketplace", hq: "Montréal, QC", country: "Canada", founded: 2025, team: "1–5", raised: "$400K", hiring: false, program: "NEXT Founders 2026", site: "soukdirect.example", founders: ["omar-haddad"], customers: "60 grocers in Montréal", investors: [] },
    { id: "stackhouse", name: "Stackhouse", oneLiner: "Developer environments in the browser.", sectors: ["B2B SaaS", "AI / ML"], stage: "Acquired", model: "B2B", hq: "San Francisco, CA", country: "United States", founded: 2016, team: "51–200", raised: "$31M", hiring: false, program: "NEXT 36 2017", site: "stackhouse.example", founders: ["hannah-brooks", "emma-larsen"], customers: "Acquired 2022", investors: ["birchline"] },
    { id: "quillmark", name: "Quillmark", oneLiner: "AI drafting for small law firms.", sectors: ["Legal tech", "AI / ML"], stage: "Closed", model: "B2B", hq: "Waterloo, ON", country: "Canada", founded: 2022, team: "1–5", raised: "$1.1M", hiring: false, program: "NEXT AI 2022", site: "quillmark.example", founders: ["ravi-patel"], customers: "Closed 2024", investors: [] },
    { id: "cellwise", name: "Cellwise Bio", oneLiner: "Machine learning for cell therapy manufacturing.", sectors: ["Biotech", "AI / ML"], stage: "Seed", model: "B2B", hq: "Boston, MA", country: "United States", founded: 2023, team: "6–15", raised: "$5.8M", hiring: true, program: "NEXT AI 2023", site: "cellwise.example", founders: ["tomas-rivera"], customers: "2 manufacturing partners", investors: ["birchline"] },
    { id: "fieldnote", name: "Fieldnote", oneLiner: "Soil data and planting plans for mid-size farms.", sectors: ["Agtech", "Climate"], stage: "Seed", model: "B2B", hq: "Guelph, ON", country: "Canada", founded: 2021, team: "6–15", raised: "$2.4M", hiring: false, program: "NEXT Founders 2021", site: "fieldnote.example", founders: ["noah-fraser"], customers: "210 farms", investors: ["prairie-angels"] },
    { id: "lumen", name: "Lumen Payroll", oneLiner: "Payroll and remittances for teams across provinces.", sectors: ["Fintech", "B2B SaaS"], stage: "Series A", model: "B2B", hq: "Mississauga, ON", country: "Canada", founded: 2020, team: "51–200", raised: "$16M", hiring: true, program: "NEXT Founders 2021", site: "lumenpayroll.example", founders: ["isha-verma"], customers: "900 companies", investors: ["maple-ridge", "cold-lake"] },
    { id: "copperleaf", name: "Copperleaf", oneLiner: "Contract review for in-house legal teams.", sectors: ["Legal tech", "AI / ML"], stage: "Pre-seed", model: "B2B", hq: "Toronto, ON", country: "Canada", founded: 2025, team: "1–5", raised: "$300K", hiring: false, program: "NEXT AI 2026", site: "copperleaf.example", founders: ["zoe-campbell"], customers: "5 design partners", investors: [] },
    { id: "harvest", name: "Harvest Table", oneLiner: "Local food from Ontario farms, delivered to office kitchens.", sectors: ["Consumer", "Marketplaces"], stage: "Series A", model: "B2B", hq: "Toronto, ON", country: "Canada", founded: 2019, team: "51–200", raised: "$14M", hiring: true, program: "NEXT 36 2019", site: "harvesttable.example", founders: ["fatima-diallo"], customers: "300 offices in the GTA", investors: ["harbourfront", "birchline"] },
  ];

  // ---------- Investors ----------
  const investors = [
    { id: "maple-ridge", name: "Maple Ridge Ventures", type: "VC fund", hq: "Toronto, ON", stages: ["Seed", "Series A"], cheque: "$500K – $3M", lead: "Leads", sectors: ["Fintech", "B2B SaaS", "Health tech"], geo: "Canada", about: "Early-stage fund backing Canadian software companies. Partner Grace Chen sits on NEXT's board.", contacts: ["grace-chen"], site: "mapleridge.example", lastDeal: "Aug 2026" },
    { id: "birchline", name: "Birchline Ventures", type: "VC fund", hq: "Halifax, NS", stages: ["Pre-seed", "Seed"], cheque: "$250K – $1.5M", lead: "Leads or follows", sectors: ["B2B SaaS", "Biotech", "Climate"], geo: "Canada and US Northeast", about: "Seed fund with a focus on Atlantic Canada and founders who've been through NEXT.", contacts: ["liam-oconnor"], site: "birchline.example", lastDeal: "Sep 2026" },
    { id: "cold-lake", name: "Cold Lake Capital", type: "VC fund", hq: "Calgary, AB", stages: ["Series A", "Series B+"], cheque: "$3M – $15M", lead: "Leads", sectors: ["Climate", "Fintech", "Marketplaces"], geo: "North America", about: "Growth-stage fund for companies with clear revenue and a path to profit.", contacts: [], site: "coldlake.example", lastDeal: "Jun 2026" },
    { id: "harbourfront", name: "Harbourfront Seed", type: "VC fund", hq: "Toronto, ON", stages: ["Pre-seed", "Seed"], cheque: "$150K – $750K", lead: "Leads or follows", sectors: ["Edtech", "Health tech", "Consumer"], geo: "Canada", about: "Pre-seed and seed fund for companies that sell to public institutions.", contacts: [], site: "harbourfront.example", lastDeal: "Sep 2026" },
    { id: "prairie-angels", name: "Prairie Angels Network", type: "Angel group", hq: "Saskatoon, SK", stages: ["Pre-seed", "Seed"], cheque: "$50K – $500K (pooled)", lead: "Follows", sectors: ["Agtech", "Hardware", "AI / ML"], geo: "Western Canada", about: "About 60 angels who invest together in Western Canadian companies.", contacts: [], site: "prairieangels.example", lastDeal: "Jul 2026" },
    { id: "sam-whitehorse-angel", name: "Sam Whitehorse", type: "Angel", hq: "Calgary, AB", stages: ["Pre-seed", "Seed"], cheque: "$25K – $100K", lead: "Follows", sectors: ["Marketplaces", "Fintech"], geo: "Canada", about: "NEXT 36 alum and board member. Invests in marketplaces and logistics.", contacts: ["sam-whitehorse"], site: "", lastDeal: "May 2026" },
    { id: "emma-larsen-angel", name: "Emma Larsen", type: "Angel", hq: "Toronto, ON", stages: ["Pre-seed"], cheque: "$10K – $50K", lead: "Follows", sectors: ["B2B SaaS", "AI / ML"], geo: "Canada and US", about: "NEXT 36 alum. Invests in dev tools and AI infrastructure.", contacts: ["emma-larsen"], site: "", lastDeal: "Apr 2026" },
    { id: "northstar-cvc", name: "Northstar Telecom Ventures", type: "Corporate VC", hq: "Montréal, QC", stages: ["Seed", "Series A"], cheque: "$1M – $5M", lead: "Follows", sectors: ["AI / ML", "Hardware"], geo: "Canada", about: "Corporate venture arm investing in companies that could partner with a telecom.", contacts: [], site: "northstar.example", lastDeal: "Mar 2026" },
    { id: "sdtc-like", name: "Clean Growth Fund (provincial)", type: "Public funding", hq: "Québec City, QC", stages: ["Seed", "Series A", "Series B+"], cheque: "Up to $5M non-dilutive", lead: "Grant", sectors: ["Climate", "Hardware", "Agtech"], geo: "Québec", about: "Non-dilutive funding for climate and clean-tech companies with a Québec presence.", contacts: [], site: "cleangrowth.example", lastDeal: "Rolling" },
  ];

  // ---------- Board ----------
  const posts = [{"id":"p1","author":"jordan-lee","channels":["Announcements"],"pinned":true,"hoursAgo":30,"votes":18,"title":"Welcome to the alumni platform (pilot)","body":"This is the new home for NEXT alumni. Fill in your profile so others can find you, and post questions here. Tag people with @ to pull them into a thread.","replies":[{"id":"c1","author":"maya-okonkwo","hoursAgo":28,"votes":7,"body":"Great to have this. Already found two people I want to talk to.","replies":[{"id":"c2","author":"jordan-lee","hoursAgo":27,"votes":3,"body":"Love that. @Maya Okonkwo let us know what would make the directory more useful.","replies":[]}]}]},{"id":"p2","author":"priya-shah","channels":["Fundraising","Legal & finance"],"hoursAgo":5,"votes":24,"title":"Who has raised from US funds as a Canadian company?","body":"We're starting our Series A process. Did you need to flip to a Delaware C-corp? What did legal cost you? @Chloé Martin curious what you see most often.","replies":[{"id":"c3","author":"chloe-martin","hoursAgo":4.5,"votes":19,"body":"Not always required. Many US funds will invest in a Canadian company at Series A, but some fund documents require a Delaware entity. Budget roughly 6 to 10 weeks for a flip.","replies":[{"id":"c4","author":"priya-shah","hoursAgo":4,"votes":6,"body":"Helpful, thank you. Do you know if the flip affects SR&ED credits?","replies":[{"id":"c5","author":"chloe-martin","hoursAgo":3.8,"votes":8,"body":"It can. The Canadian subsidiary usually keeps doing the R&D so you keep the credits, but the structure matters. Worth a call with your accountant early.","replies":[{"id":"c6","author":"tomas-rivera","hoursAgo":3.5,"votes":4,"body":"Can confirm. We kept our Toronto sub for exactly this reason.","replies":[{"id":"c7","author":"priya-shah","hoursAgo":3.2,"votes":2,"body":"@Tomás Rivera did that make hiring in Toronto harder or easier?","replies":[{"id":"c8","author":"tomas-rivera","hoursAgo":3,"votes":3,"body":"Easier, honestly. Payroll and benefits stayed Canadian.","replies":[{"id":"c9","author":"priya-shah","hoursAgo":2.8,"votes":1,"body":"Perfect, that answers it.","replies":[]}]}]}]}]}]}]},{"id":"c10","author":"grace-chen","hoursAgo":4,"votes":11,"body":"From the investor side: we're flexible, but the lead usually decides. Happy to look at your deck in office hours.","replies":[]},{"id":"c11","author":"hannah-brooks","hoursAgo":3,"votes":5,"body":"We flipped. Took about 8 weeks. Happy to share the checklist we used.","replies":[{"id":"c12","author":"priya-shah","hoursAgo":2.5,"votes":2,"body":"Yes please! Sending you an intro request.","replies":[]}]}]},{"id":"p3","author":"aisha-rahman","channels":["Intro requests","Hiring"],"hoursAgo":20,"votes":9,"title":"Looking for a robotics or embedded co-founder","body":"Kitewing is looking for a technical co-founder. Anyone know strong embedded engineers in Vancouver who want to start something?","replies":[{"id":"c13","author":"marcus-bell","hoursAgo":12,"votes":4,"body":"Not in Vancouver but happy to chat. Sending you an intro request.","replies":[]},{"id":"c14","author":"etienne-gagnon","hoursAgo":10,"votes":3,"body":"@Marcus Bell you two should talk. Also try the embedded folks from the NEXT AI 2024 cohort.","replies":[]}]},{"id":"p4","author":"daniel-kwan","channels":["Hiring"],"hoursAgo":50,"votes":6,"title":"Hiring 2 sales engineers in Toronto","body":"Northwind Care is hiring. Health-tech experience is a plus. Referrals welcome.","replies":[]},{"id":"p5","author":"omar-haddad","channels":["General","Legal & finance"],"hoursAgo":2,"votes":3,"title":"Anyone selling a bilingual product in Québec?","body":"Trying to figure out what Bill 96 means for our app and marketing. Would love to hear what others did.","replies":[]},{"id":"p6","author":"sam-whitehorse","channels":["Events","Fundraising"],"hoursAgo":72,"votes":11,"title":"Hosting a fundraising AMA on Oct 22, bring questions","body":"Virtual, one hour. I'll answer anything about raising pre-seed and seed in Canada. RSVP on the Events page.","replies":[{"id":"c15","author":"lena-novak","hoursAgo":60,"votes":5,"body":"Signed up. Can you cover SAFEs vs priced rounds?","replies":[{"id":"c16","author":"sam-whitehorse","hoursAgo":58,"votes":4,"body":"Definitely. That's the most common question I get.","replies":[]}]}]}];
  posts.push(
    { id: "p7", author: "jordan-lee", channels: ["General"], hoursAgo: 26, votes: 14, title: "Poll: what should the next alumni event be?", body: "Help us plan winter programming.", poll: { options: [{ label: "Fundraising workshop", votes: 23 }, { label: "Founder dinner by city", votes: 31 }, { label: "Demo night for alumni companies", votes: 12 }, { label: "Hiring fair", votes: 9 }], closes: "Oct 15", voted: null }, replies: [] },
    { id: "p8", author: "isha-verma", channels: ["Hiring", "Product & tech"], hoursAgo: 9, votes: 8, title: "How did you hire your first VP Engineering?", body: "We're at 60 people and I'm hiring my first VP Eng. Recruiter or network? What did you pay? Anything you'd do differently?", replies: [
      { id: "c20", author: "emma-larsen", hoursAgo: 8, votes: 6, body: "Network first. Our best leaders came from people we'd worked with. Use a recruiter only for the long list.", replies: [] },
      { id: "c21", author: "hannah-brooks", hoursAgo: 7, votes: 3, body: "Run a paid work trial if you can. Half a day on a real problem told us more than five interviews.", replies: [] } ] }
  );
  const flagged = posts.find((p) => p.id === "p5"); flagged.replies.push({ id: "c30", author: "ravi-patel", hoursAgo: 1.5, votes: 0, body: "DM me, I sell a translation tool that fixes all of this, 50% off this week only!!!", replies: [] });

  // ---------- Events ----------
  const events = [{"id":"e1","title":"Vancouver founders coffee","date":"2026-10-15","start":"8:30","end":"10:00","mode":"In person","city":"Vancouver","location":"A café in Gastown (details after RSVP)","host":"aisha-rahman","nextHosted":false,"capacity":12,"going":7,"description":"Casual coffee for founders in Vancouver. No agenda."},{"id":"e2","title":"Fundraising AMA with Sam Whitehorse","date":"2026-10-22","start":"12:00","end":"13:00","mode":"Virtual","city":"","location":"Video link shared after RSVP","host":"sam-whitehorse","nextHosted":false,"capacity":null,"going":41,"description":"Ask anything about raising pre-seed and seed rounds in Canada."},{"id":"e3","title":"Montréal climate founders breakfast","date":"2026-11-05","start":"8:00","end":"9:30","mode":"In person","city":"Montréal","location":"Venue to be confirmed","host":"etienne-gagnon","nextHosted":false,"capacity":20,"going":9,"description":"For anyone building in climate or energy. Bilingual."},{"id":"e4","title":"Toronto alumni mixer","date":"2026-11-26","start":"18:00","end":"20:30","mode":"In person","city":"Toronto","location":"Venue name, Toronto","host":"jordan-lee","nextHosted":true,"capacity":60,"going":38,"description":"NEXT's fall alumni mixer. Drinks and food provided. Bring a founder friend from your cohort."},{"id":"e5","title":"AI Program demo day","date":"2026-12-03","start":"14:00","end":"17:00","mode":"Virtual","city":"","location":"Livestream link shared after RSVP","host":"nadia-morin","nextHosted":true,"capacity":null,"going":112,"description":"The current NEXT AI cohort presents their companies."},{"id":"e6","title":"US expansion office hours","date":"2026-10-08","start":"16:00","end":"17:00","mode":"Virtual","city":"","location":"Video link shared after RSVP","host":"chloe-martin","nextHosted":false,"capacity":10,"going":6,"description":"Small-group office hours on incorporating or raising in the US."},{"id":"e7","title":"NEXT Founders fall kickoff","date":"2026-10-20","start":"17:30","end":"20:00","mode":"In person","city":"Toronto","location":"Venue name, Toronto","host":"nadia-morin","nextHosted":true,"capacity":80,"going":54,"description":"Welcome the new NEXT Founders cohort. Alumni mentors encouraged to attend."},{"id":"e8","title":"Waterloo founders dinner","date":"2026-11-12","start":"18:30","end":"21:00","mode":"In person","city":"Waterloo","location":"Restaurant to be confirmed","host":"maya-okonkwo","nextHosted":false,"capacity":14,"going":11,"description":"Dinner for founders in Waterloo Region. Pay your own way."}];
  events.push(
    { id: "e9", title: "Office hours: SR&ED claims", date: iso(daysFromNow(6)), start: "11:00", end: "12:00", mode: "Virtual", city: "", location: "Video link shared after RSVP", host: "isha-verma", nextHosted: false, capacity: 15, going: 9, description: "Bring your questions about SR&ED claims. Not tax advice." },
    { id: "e10", title: "NEXT AI 2026 cohort dinner", date: iso(daysFromNow(2)), start: "18:30", end: "21:00", mode: "In person", city: "Toronto", location: "NEXT office, Toronto", host: "nadia-morin", nextHosted: true, capacity: 40, going: 31, description: "Dinner for the current NEXT AI cohort and alumni mentors." }
  );
  events.forEach((e) => { e.attendees = people.filter((p, i) => (i + e.id.length) % 3 === 0).slice(0, 8).map((p) => p.id); });

  // ---------- Messages: DMs, groups, cohort chats ----------
  const conversations = [
    { id: "dm-priya", kind: "direct", members: ["maya-okonkwo", "priya-shah"], unread: 2, messages: [
      { from: "priya-shah", hoursAgo: 30, text: "Hi Maya, thanks for accepting. I'd love to hear how you sold to public-sector health buyers." },
      { from: "maya-okonkwo", hoursAgo: 29, text: "Happy to. Short version: start with one clinic network champion and let them pull you in." },
      { from: "priya-shah", hoursAgo: 2, text: "That makes sense. Could we do a 20 minute call next week?" },
      { from: "priya-shah", hoursAgo: 1.9, text: "Tuesday or Wednesday afternoon works for me." } ] },
    { id: "dm-daniel", kind: "direct", members: ["maya-okonkwo", "daniel-kwan"], unread: 0, messages: [
      { from: "maya-okonkwo", hoursAgo: 80, text: "Daniel, your note on hospital procurement in the board thread was great. Can I ask a follow-up?" },
      { from: "daniel-kwan", hoursAgo: 78, text: "Of course. Fire away." },
      { from: "maya-okonkwo", hoursAgo: 77, text: "How long did your first RFP take from submission to signature?" },
      { from: "daniel-kwan", hoursAgo: 60, text: "About 7 months. Plan for 9." } ] },
    { id: "grp-health", kind: "group", name: "Health tech founders", members: ["maya-okonkwo", "daniel-kwan", "tomas-rivera", "jordan-lee"], unread: 1, messages: [
      { from: "jordan-lee", hoursAgo: 48, text: "Started this group after the mixer. Share anything useful for selling into health systems." },
      { from: "tomas-rivera", hoursAgo: 20, text: "Anyone going to the health innovation conference in Boston next month?" },
      { from: "daniel-kwan", hoursAgo: 6, text: "I'll be there Tuesday and Wednesday." } ] },
    { id: "cohort-nf21", kind: "cohort", name: "NEXT Founders 2021", cohort: "NEXT Founders 2021", memberCount: 38, members: ["maya-okonkwo", "noah-fraser", "isha-verma", "ben-tremblay", "nadia-morin"], unread: 4, messages: [
      { from: "nadia-morin", hoursAgo: 200, text: "Welcome to the NEXT Founders 2021 cohort chat. Everyone from the cohort is added automatically." },
      { from: "noah-fraser", hoursAgo: 30, text: "Five year reunion idea: dinner in Toronto in January?" },
      { from: "isha-verma", hoursAgo: 28, text: "Yes! I can host at the Lumen office." },
      { from: "ben-tremblay", hoursAgo: 26, text: "I'll come in from Québec City for that." },
      { from: "noah-fraser", hoursAgo: 3, text: "Made an event for it. Will post the link once the date's set." } ] },
    { id: "cohort-nai26", kind: "cohort", name: "NEXT AI 2026", cohort: "NEXT AI 2026", memberCount: 44, members: ["aisha-rahman", "kenji-sato", "zoe-campbell", "nadia-morin"], unread: 0, messages: [
      { from: "nadia-morin", hoursAgo: 300, text: "Welcome to the NEXT AI 2026 cohort chat." },
      { from: "zoe-campbell", hoursAgo: 40, text: "Anyone have a good template for a pilot agreement?" } ] },
  ];

  // ---------- Intro requests ----------
  const intros = [
    { id: "i1", from: "zoe-campbell", to: "maya-okonkwo", status: "pending", hoursAgo: 5, note: "Hi Maya, I'm building contract review for in-house legal teams and I'm about to sell to my first hospital network. Would you share how you got through their procurement process?" },
    { id: "i2", from: "omar-haddad", to: "maya-okonkwo", status: "pending", hoursAgo: 26, note: "Fellow NEXT Founders alum (2026). I'd love 15 minutes on how you priced Tidepool for clinics. We're figuring out pricing for grocers." },
    { id: "i3", from: "maya-okonkwo", to: "grace-chen", status: "pending", hoursAgo: 50, note: "Hi Grace, we're preparing our Series A for Q1. Would you be open to a quick look at our metrics before we start?" },
    { id: "i4", from: "maya-okonkwo", to: "priya-shah", status: "accepted", hoursAgo: 31, note: "Hi Priya, would love to compare notes on selling to regulated buyers." },
    { id: "i5", from: "maya-okonkwo", to: "chloe-martin", status: "declined", hoursAgo: 200, note: "Hi Chloé, do you have time to talk about a US subsidiary?" },
  ];

  // ---------- Jobs ----------
  const jobs = [
    { id: "j1", company: "tidepool", title: "First account executive", fn: "Sales", type: "Full-time", mode: "Hybrid", location: "Waterloo, ON", comp: "$90K – $110K base + commission", equity: "0.2% – 0.4%", postedDays: 2, poster: "maya-okonkwo", clicks: 41, applyUrl: "https://jobs.tidepool.example/ae", desc: "Own our sales pipeline with community clinics and health networks in Ontario. You'll work directly with the founders and build the playbook.", reqs: ["3+ years selling software to healthcare or public sector", "Comfortable with long sales cycles", "Based in or near Waterloo Region"] },
    { id: "j2", company: "ledgerline", title: "Senior backend engineer", fn: "Engineering", type: "Full-time", mode: "Remote", location: "Canada (remote)", comp: "$150K – $180K", equity: "0.3% – 0.6%", postedDays: 5, poster: "priya-shah", clicks: 88, applyUrl: "https://ledgerline.example/careers", desc: "Build the systems that reconcile thousands of transactions for accounting firms every night.", reqs: ["5+ years backend experience (Python or Go)", "Experience with financial data a plus"] },
    { id: "j3", company: "kitewing", title: "Machine learning engineer, edge vision", fn: "Engineering", type: "Full-time", mode: "On-site", location: "Vancouver, BC", comp: "$130K – $160K", equity: "0.5% – 1.0%", postedDays: 1, poster: "kenji-sato", clicks: 19, applyUrl: "https://kitewing.example/jobs", desc: "Train and ship computer-vision models that run on cameras at construction sites.", reqs: ["Shipped CV models to production", "Experience with model compression or edge devices"] },
    { id: "j4", company: "lumen", title: "VP Engineering", fn: "Engineering", type: "Full-time", mode: "Hybrid", location: "Mississauga, ON", comp: "$230K – $270K", equity: "Meaningful", postedDays: 9, poster: "isha-verma", clicks: 132, applyUrl: "https://lumenpayroll.example/careers/vpe", desc: "Lead a 30-person engineering team through our next stage of growth.", reqs: ["Led an engineering org of 20+", "Fintech or payroll experience preferred"] },
    { id: "j5", company: "harvest", title: "Operations manager, GTA", fn: "Operations", type: "Full-time", mode: "On-site", location: "Toronto, ON", comp: "$75K – $90K", equity: "", postedDays: 12, poster: "fatima-diallo", clicks: 57, applyUrl: "https://harvesttable.example/jobs", desc: "Run daily delivery operations for 300 office kitchens.", reqs: ["2+ years in logistics or food operations", "Driver's licence"] },
    { id: "j6", company: "brightpath", title: "Product designer", fn: "Design", type: "Full-time", mode: "Hybrid", location: "Ottawa, ON", comp: "$95K – $115K", equity: "0.1%", postedDays: 15, poster: "lena-novak", clicks: 64, applyUrl: "https://brightpath.example/careers", desc: "Design reading activities for kids aged 6 to 9, and the teacher tools around them.", reqs: ["Portfolio with shipped product work", "Experience designing for kids is a plus"] },
    { id: "j7", company: "cellwise", title: "Business development intern (summer 2027)", fn: "Sales", type: "Internship", mode: "Remote", location: "North America (remote)", comp: "$30/hr", equity: "", postedDays: 4, poster: "tomas-rivera", clicks: 23, applyUrl: "https://cellwise.example/interns", desc: "Research and reach out to cell therapy manufacturers. 12 weeks.", reqs: ["Studying business or life sciences", "Strong writing"] },
    { id: "j8", company: "tidepool", title: "Contract: clinic onboarding specialist", fn: "Operations", type: "Contract", mode: "Remote", location: "Manitoba (remote)", comp: "$45/hr, 6 months", equity: "", postedDays: 20, poster: "maya-okonkwo", clicks: 12, applyUrl: "https://jobs.tidepool.example/onboarding", desc: "Help new clinics in Manitoba set up Tidepool and train front-desk staff.", reqs: ["Clinic admin experience", "Comfortable training non-technical staff"] },
  ];

  // ---------- Perks ----------
  const perks = [
    { id: "k1", partner: "Stratus Cloud", cat: "Cloud & dev tools", value: "$25,000 in cloud credits", who: "Founders", how: "code", code: "NEXT-STRATUS-25K", expires: "Dec 31, 2026", detail: "Credits valid for 24 months. New accounts only.", clicks: 74 },
    { id: "k2", partner: "Ledgerwise Accounting", cat: "Accounting", value: "3 months free bookkeeping", who: "Founders", how: "link", url: "https://ledgerwise.example/next", expires: "Ongoing", detail: "For companies under $2M revenue.", clicks: 31 },
    { id: "k3", partner: "Hollis & Pryce LLP", cat: "Legal", value: "Free incorporation review + 20% off first engagement", who: "Founders", how: "contact", contact: "chloe-martin", expires: "Ongoing", detail: "Chloé Martin (NEXT 36 2016) handles requests.", clicks: 18 },
    { id: "k4", partner: "Northern Bank for Startups", cat: "Banking", value: "No fees for 12 months", who: "All members", how: "link", url: "https://northernbank.example/next", expires: "Mar 31, 2027", detail: "Business chequing and USD accounts.", clicks: 22 },
    { id: "k5", partner: "Payfield HR", cat: "HR & payroll", value: "50% off for the first year", who: "All members", how: "code", code: "NEXTPAY50", expires: "Ongoing", detail: "Up to 50 employees.", clicks: 15 },
    { id: "k6", partner: "Signal Studio", cat: "Marketing", value: "Free brand audit", who: "Founders", how: "link", url: "https://signalstudio.example/next", expires: "Jan 15, 2027", detail: "One 90-minute session with a senior strategist.", clicks: 9 },
    { id: "k7", partner: "Commonplace Desks", cat: "Office", value: "10 free coworking days a month", who: "All members", how: "code", code: "NEXTDESK", expires: "Ongoing", detail: "Toronto, Montréal and Vancouver locations.", clicks: 40 },
    { id: "k8", partner: "Draftboard", cat: "Cloud & dev tools", value: "Team plan free for 1 year", who: "All members", how: "code", code: "NEXT-DRAFT-1Y", expires: "Ongoing", detail: "Design and whiteboard tool.", clicks: 27 },
  ];

  // ---------- Resources ----------
  const rooms = [
    { id: "r1", name: "Boardroom", office: "NEXT Toronto", cap: 12, amenities: ["Screen", "Video conferencing", "Whiteboard"] },
    { id: "r2", name: "Focus room A", office: "NEXT Toronto", cap: 4, amenities: ["Screen"] },
    { id: "r3", name: "Focus room B", office: "NEXT Toronto", cap: 4, amenities: ["Whiteboard"] },
    { id: "r4", name: "Event space", office: "NEXT Toronto", cap: 80, amenities: ["Projector", "Mics", "Kitchen"], approval: true },
    { id: "r5", name: "Hot desks", office: "NEXT Toronto", cap: 1, amenities: ["Wi-Fi", "Monitor"] },
  ];
  const officeHours = [
    { id: "oh1", who: "nadia-morin", topic: "Program questions and cohort intros", length: 30, slots: ["Tue 10:00", "Tue 10:30", "Thu 14:00", "Thu 14:30"] },
    { id: "oh2", who: "jordan-lee", topic: "Plan or promote an alumni event", length: 30, slots: ["Mon 13:00", "Wed 11:00", "Wed 11:30"] },
    { id: "oh3", who: "grace-chen", topic: "Fundraising and deck review (Board)", length: 30, slots: ["Fri 9:00", "Fri 9:30"] },
    { id: "oh4", who: "chloe-martin", topic: "Legal: incorporation and US expansion", length: 20, slots: ["Tue 16:00", "Tue 16:20", "Tue 16:40"] },
  ];
  const guides = [
    { id: "g1", title: "Fundraising playbook", kind: "Guide", by: "NEXT", updated: "Sep 2026", about: "From pre-seed to Series A: timelines, data room, what Canadian funds ask for." },
    { id: "g2", title: "SAFE and term sheet templates", kind: "Templates", by: "Hollis & Pryce LLP", updated: "Jun 2026", about: "Canadian SAFE, standard seed term sheet, with plain-language notes." },
    { id: "g3", title: "SR&ED and IRAP: what to claim", kind: "Guide", by: "NEXT", updated: "Aug 2026", about: "Government funding programs for Canadian startups." },
    { id: "g4", title: "Hiring your first 10", kind: "Guide", by: "Alumni-written", updated: "Jul 2026", about: "Job descriptions, offers, equity bands, onboarding." },
    { id: "g5", title: "US expansion checklist", kind: "Checklist", by: "Alumni-written", updated: "May 2026", about: "Entity setup, banking, payroll and tax basics." },
    { id: "g6", title: "NEXT brand kit for alumni", kind: "Assets", by: "NEXT", updated: "Jan 2026", about: "Logos and wording for saying you're a NEXT alum." },
  ];
  const bookings = [{ id: "b1", kind: "room", what: "Focus room A", when: iso(daysFromNow(1)) + " 10:00–11:00", who: "maya-okonkwo" }];

  // ---------- Admin: reports ----------
  const reports = [
    { id: "r1", type: "Comment", target: "p5", targetLabel: "Reply on “Anyone selling a bilingual product in Québec?”", excerpt: "DM me, I sell a translation tool that fixes all of this, 50% off this week only!!!", author: "ravi-patel", reason: "Spam or self-promotion", by: "omar-haddad", hoursAgo: 1, status: "open", count: 2 },
    { id: "r2", type: "Profile", target: "people/marcus-bell", targetLabel: "Profile: Marcus Bell", excerpt: "Headline links to an outside crypto course sign-up.", author: "marcus-bell", reason: "Misleading or fake", by: "lena-novak", hoursAgo: 7, status: "open", count: 1 },
    { id: "r3", type: "Event", target: "events/e6", targetLabel: "Event: US expansion office hours", excerpt: "“Small-group office hours… $200 per seat, pay by e-transfer.”", author: "chloe-martin", reason: "Selling to members", by: "fatima-diallo", hoursAgo: 20, status: "open", count: 1 },
    { id: "r4", type: "Job", target: "jobs/j7", targetLabel: "Job: Business development intern", excerpt: "Unpaid for the first 4 weeks.", author: "tomas-rivera", reason: "Breaks job board rules", by: "isha-verma", hoursAgo: 30, status: "open", count: 1 },
    { id: "r5", type: "Message", target: "", targetLabel: "Direct message to Zoe Campbell", excerpt: "“Can you send me your investor list? Need it today.” (sent 6 times)", author: "omar-haddad", reason: "Harassment or unwanted contact", by: "zoe-campbell", hoursAgo: 40, status: "open", count: 1 },
    { id: "r6", type: "Post", target: "board/p4", targetLabel: "Post: Hiring 2 sales engineers in Toronto", excerpt: "Northwind Care is hiring…", author: "daniel-kwan", reason: "Off-topic", by: "ravi-patel", hoursAgo: 72, status: "resolved", resolution: "Dismissed. Hiring posts are allowed.", resolvedBy: "nadia-morin" },
  ];
  const auditLog = [
    { who: "nadia-morin", what: "Dismissed report on “Hiring 2 sales engineers in Toronto”", hoursAgo: 70 },
    { who: "david-osei", what: "Imported cohort NEXT AI 2026 (44 members, 2 rows fixed)", hoursAgo: 260 },
    { who: "nadia-morin", what: "Gave Jordan Lee the Moderator role", hoursAgo: 400 },
    { who: "david-osei", what: "Updated community rules to version 1.1", hoursAgo: 500 },
  ];

  // ---------- Admin: metrics (seeded, weekly, oldest first) ----------
  const metrics = {
    weeks: ["Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5"],
    activeMembers: [212, 248, 261, 305, 342, 366, 401, 428],
    posts: [18, 22, 19, 31, 27, 35, 38, 41],
    replies: [64, 80, 71, 120, 115, 140, 162, 171],
    introsSent: [12, 15, 14, 22, 25, 21, 30, 33],
    introsAccepted: [9, 11, 9, 17, 19, 15, 22, 26],
    rsvps: [40, 33, 52, 61, 48, 70, 66, 84],
    messages: [210, 260, 240, 390, 410, 450, 520, 560],
    bookings: [6, 8, 5, 11, 9, 12, 14, 13],
    funnel: [{ step: "Invited", n: 1240 }, { step: "Signed in", n: 812 }, { step: "Agreed to rules", n: 790 }, { step: "Finished profile", n: 655 }],
    channels: [{ name: "Fundraising", n: 58 }, { name: "Hiring", n: 41 }, { name: "General", n: 37 }, { name: "Intro requests", n: 33 }, { name: "Legal & finance", n: 24 }, { name: "Product & tech", n: 19 }],
    searches: 1874,
  };

  return { TAXONOMY, people, companies, investors, posts, events, conversations, intros, jobs, perks, rooms, officeHours, guides, bookings, reports, auditLog, metrics, hoursAgo, iso };
})();
