/* =====================================================================
   KEMP ADVISORY GROUP — CATALOG DATA
   ---------------------------------------------------------------------
   This one file feeds the Catalog search, the Our Work page, and the
   three audience pages (Educators, Organizations, Small Business).
   To add a product: copy any block below, give it a new unique id,
   and edit the fields. To add a buy link, paste it into "url".
   An action with url: "" is hidden automatically, so it is safe to
   leave a link blank until you have it.

   FIELDS
   id         unique, lowercase-with-dashes
   title      name shown on the card
   type       book | learning | service | website | case-study
   audiences  any of: "educators", "organizations", "business"
   category   small label above the title
   price      text shown on the card ("$19.99", "From $6,500", "Free")
   priceValue number used for sorting (0 = free, null = no price)
   status     available | coming-soon | free | ongoing
   summary    one or two sentences
   tags       extra search words (people search for these)
   metric     big number for case-study / book covers (optional)
   metricLabel the words under that number (optional)
   cover      short words on a learning-product card cover (optional)
   domain     for websites: the address shown on the card
   assist     true = eligible for Community Assistance (C²)
   featured   audiences whose page should show this item up top
   actions    buttons. First one is the main button.
   ===================================================================== */

window.KAG_CATALOG = [

  /* ---------------------------------------------------------------
     BOOKS & PUBLISHING
     --------------------------------------------------------------- */
  {
    id: "ai-for-educators-book",
    thumb: "/assets/img/t/ai-for-educators-cover.jpg",
    title: "AI for Educators",
    subtitle: "The Practical Guide to Teaching Smarter, Saving Time, and Getting Your Life Back",
    type: "book",
    audiences: ["educators"],
    category: "Book · Professional learning",
    price: "Coming soon",
    priceValue: null,
    status: "coming-soon",
    summary: "Practical strategies for using AI to plan, create, communicate, and differentiate without giving up the professional judgment that makes good teaching good.",
    tags: ["artificial intelligence", "chatgpt", "teachers", "prompts", "lesson planning", "time saving", "book", "author"],
    featured: ["educators"],
    actions: [
      { label: "Get the free Quick-Start Guide", url: "/educators/#quick-start" },
      { label: "Pre-order", url: "" } // TODO: paste Amazon / pre-order link
    ]
  },
  {
    id: "ai-quick-start-guide",
    cover: "Free guide",
    title: "AI for Educators Quick-Start Guide",
    type: "learning",
    audiences: ["educators"],
    category: "Free download",
    price: "Free",
    priceValue: 0,
    status: "free",
    summary: "Practical prompts, smart guardrails, and simple ways to start using AI in your classroom this week.",
    tags: ["free", "guide", "pdf", "ai", "prompts", "teachers", "download"],
    featured: ["educators"],
    actions: [
      { label: "Send me the guide", url: "/educators/#quick-start" }
    ]
  },
  {
    id: "telling-my-daddy",
    title: "I'm Telling My Daddy on You",
    type: "book",
    audiences: ["educators"],
    category: "Children's book",
    price: "Coming soon",
    priceValue: null,
    status: "coming-soon",
    summary: "A children's picture book from Meshayla Kemp. Sign up for updates to hear first when it releases.",
    tags: ["children", "picture book", "kids", "read aloud", "family", "book"],
    actions: [
      { label: "Get release updates", url: "https://kemp-advisory-group.kit.com" },
      { label: "Buy on Amazon", url: "" } // TODO: paste Amazon link at release
    ]
  },

  /* ---------------------------------------------------------------
     LEARNING PRODUCTS (Giselle Chanel / GC Academy)
     --------------------------------------------------------------- */
  {
    id: "gc-academy",
    thumb: "/assets/img/t/gc-academy.jpg",
    cover: "Grades 1–5",
    title: "GC Academy Learning Membership",
    type: "learning",
    audiences: ["educators"],
    category: "Online learning · Grades 1–5",
    price: "$7.99/mo or $59/yr",
    priceValue: 7.99,
    status: "available",
    summary: "A faith-inspired online learning membership for girls in grades 1–5: reading, writing, math, science, history, and Bible study, aligned to TEKS and Common Core. Covers up to 2 children.",
    tags: ["homeschool", "kids", "girls", "elementary", "reading", "math", "writing", "bible", "teks", "common core", "membership", "subscription", "giselle chanel", "gc"],
    featured: ["educators"],
    actions: [
      { label: "Visit GC Academy", url: "https://gisellechanel.com/academy/" }
    ]
  },
  {
    id: "gc-workbooks",
    thumb: "/assets/img/t/gc-workbooks.jpg",
    cover: "Print at home",
    title: "GC Learning Center Workbooks",
    type: "learning",
    audiences: ["educators"],
    category: "Digital workbook · Grades 1–5",
    price: "$19.99 each",
    priceValue: 19.99,
    status: "available",
    summary: "Printable reading, writing, math, and Bible study workbooks that follow the GC Academy courses. Instant digital download.",
    tags: ["workbook", "printable", "pdf", "homeschool", "worksheets", "reading", "math", "writing", "bible study", "etsy", "giselle chanel", "gc"],
    featured: ["educators"],
    actions: [
      { label: "Shop workbooks", url: "https://gisellechanel.com/store/" },
      { label: "Buy on Etsy", url: "" } // TODO: paste Etsy shop link
    ]
  },
  {
    id: "gc-arcade",
    thumb: "/assets/img/t/gc-arcade.jpg",
    cover: "Play free",
    title: "GC Arcade",
    type: "learning",
    audiences: ["educators"],
    category: "Free learning games",
    price: "Free",
    priceValue: 0,
    status: "free",
    summary: "Free browser games for kids, including the Style Studio dress-up game. No sign-up required.",
    tags: ["games", "free", "kids", "style studio", "phaser", "game development", "giselle chanel"],
    actions: [
      { label: "Play now", url: "https://gisellechanel.com/arcade/" }
    ]
  },
  {
    id: "kempbell-academy",
    thumb: "/assets/img/t/kempbell-academy.jpg",
    cover: "Coming soon",
    title: "Kempbell Academy",
    type: "learning",
    audiences: ["educators"],
    category: "Online learning · Coming soon",
    price: "Coming soon",
    priceValue: null,
    status: "coming-soon",
    summary: "An online learning academy for every elementary learner, built on the same academic and faith-inspired approach as GC Academy.",
    tags: ["homeschool", "kids", "boys", "elementary", "kemp academy", "kempacademy", "membership"],
    actions: []
  },

  /* ---------------------------------------------------------------
     WEBSITES WE'VE BUILT (portfolio)
     --------------------------------------------------------------- */
  {
    id: "site-gisellechanel",
    thumb: "/assets/img/t/site-gisellechanel.jpg",
    title: "Giselle Chanel",
    type: "website",
    audiences: ["business", "educators"],
    category: "Brand site + learning platform",
    domain: "gisellechanel.com",
    price: null, priceValue: null,
    status: "available",
    summary: "A children's brand site with a membership learning academy, an online store, and custom-built games.",
    tags: ["web development", "website", "membership", "ecommerce", "games", "phaser", "lms", "portfolio"],
    featured: ["business"],
    actions: [{ label: "Visit site", url: "https://gisellechanel.com" }]
  },
  {
    id: "site-kempventures",
    thumb: "/assets/img/t/site-kempventures.jpg",
    title: "Kemp Ventures, LLC",
    type: "website",
    audiences: ["business", "organizations"],
    category: "Construction & land development",
    domain: "kempventures.com",
    price: null, priceValue: null,
    status: "available",
    summary: "A custom-coded site for an East Texas land development and construction company, built to serve private clients and government buyers.",
    tags: ["web development", "website", "construction", "real estate", "government contracting", "netlify", "portfolio"],
    featured: ["business"],
    actions: [{ label: "Visit site", url: "https://kempventures.com" }]
  },
  {
    id: "site-cornerstoneclay",
    thumb: "/assets/img/t/site-cornerstoneclay.jpg",
    title: "Cornerstone Clay CDC",
    type: "website",
    audiences: ["business", "organizations"],
    category: "Nonprofit",
    domain: "cornerstoneclay.org",
    price: null, priceValue: null,
    status: "available",
    summary: "A funder-ready nonprofit site with program pages, applications, and donation pathways for affordable housing and financial education.",
    tags: ["web development", "website", "nonprofit", "cdc", "housing", "donations", "portfolio"],
    featured: ["business"],
    actions: [{ label: "Visit site", url: "https://cornerstoneclay.org" }]
  },
  {
    id: "site-meshayla",
    thumb: "/assets/img/t/site-meshayla.jpg",
    title: "Meshayla Kemp Portfolio",
    type: "website",
    audiences: ["business", "organizations"],
    category: "Professional portfolio",
    domain: "meshayla.com",
    price: null, priceValue: null,
    status: "available",
    summary: "A personal portfolio presenting enterprise learning projects as readable case studies.",
    tags: ["web development", "website", "portfolio", "resume", "personal brand"],
    actions: [{ label: "Visit site", url: "https://meshayla.com" }]
  },

  {
    id: "nursing-home-guide",
    thumb: "/assets/img/t/nursing-guide.jpg",
    title: "When a Parent Needs Nursing Home Care",
    type: "learning",
    audiences: ["organizations", "educators"],
    category: "Community education · Cornerstone Clay CDC",
    price: "Free",
    priceValue: 0,
    status: "free",
    summary: "A 13-page plain-language family guide for Texas: first five steps, who to call, Medicare vs. Medicaid, power of attorney, choosing a facility, and paper checklists. Written and designed with custom infographics for families in crisis.",
    tags: ["free", "guide", "pdf", "community", "nursing home", "medicaid", "family", "plain language", "cornerstone clay", "instructional design", "infographic"],
    featured: ["organizations"],
    actions: [{ label: "Download the guide (PDF)", url: "/assets/docs/Nursing-Home-Care-Guide-Cornerstone-Clay-CDC.pdf" }, { label: "Cornerstone Clay CDC", url: "https://cornerstoneclay.org" }]
  },

  /* TEACHER STUDIO (added 2026-10-23) */
  {
    id: "cs-teacher-studio",
    thumb: "/assets/img/t/studio-landing.jpg",
    title: "Kempbell Teacher Studio",
    type: "case-study",
    audiences: ["educators", "organizations"],
    category: "K-12 · Teacher planning tool",
    metric: "7,476",
    metricLabel: "ready-made questions across 1,246 K-5 standards",
    price: null, priceValue: null,
    status: "available",
    summary: "A planning and growth tool that turns a Texas standard into a draft lesson, then turns exit-ticket scores into tomorrow's groups. Private by design: no student names, nothing sent to a server. Prototype; questions are machine-checked and go to teacher review before release.",
    tags: ["teacher studio", "kempbell", "lesson planning", "teks", "exit ticket", "groups", "teacher tool", "question bank", "k-5", "case study", "prototype"],
    featured: ["educators", "organizations"],
    actions: [{ label: "Open the studio", url: "https://kempbellacademy.com/teacher-studio/" }, { label: "Read the guide", url: "https://kempbellacademy.com/teacher-studio/guide/" }]
  },
  {
    id: "kempbell-teacher-studio",
    thumb: "/assets/img/t/teacher-studio.jpg",
    cover: "Teacher tool",
    title: "Kempbell Teacher Studio",
    type: "learning",
    audiences: ["educators"],
    category: "Free prototype · Teachers",
    price: "Free",
    priceValue: 0,
    status: "free",
    summary: "Pick a Texas standard, get a draft lesson plan, score an exit ticket by seat number and see tomorrow's groups. Includes a 29-page Teacher Guide written for teachers who do not love technology.",
    tags: ["free", "teacher", "lesson plan", "teks", "exit ticket", "groups", "guide", "pdf", "kempbell"],
    featured: ["educators"],
    actions: [{ label: "Open the studio", url: "https://kempbellacademy.com/teacher-studio/" }, { label: "Teacher Guide (PDF)", url: "https://kempbellacademy.com/teacher-studio/Kempbell-Teacher-Studio-Teacher-Guide.pdf" }]
  },

  /* ---------------------------------------------------------------
     CASE STUDIES (courses, curriculum, training)
     --------------------------------------------------------------- */
  {
    id: "cs-michigan",
    title: "Statewide Educator Certification Program",
    type: "case-study",
    audiences: ["educators", "organizations"],
    category: "Government · State of Michigan",
    metric: "100%",
    metricLabel: "approved on first submission",
    price: null, priceValue: null,
    status: "available",
    summary: "Designed a statewide certification program from scratch: LMS courses, facilitator guides, and assessments. Approved with no revisions.",
    tags: ["michigan", "state", "government", "certification", "lms", "facilitator guide", "assessment", "compliance", "case study"],
    featured: ["educators", "organizations"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },
  {
    id: "cs-utility",
    thumb: "/assets/img/home/substation.jpg",
    title: "Utility Technology Transformation",
    type: "case-study",
    audiences: ["organizations"],
    category: "Utility · Enterprise asset management",
    metric: "288",
    metricLabel: "utility personnel supported",
    price: null, priceValue: null,
    status: "ongoing",
    summary: "Change management and system training for a Texas electric utility's enterprise asset management rollout across two business units and three agile phases.",
    tags: ["utility", "maximo", "eam", "ocm", "change management", "adkar", "prosci", "system training", "go-live", "case study"],
    featured: ["organizations"],
    actions: [{ label: "Discuss a similar project", url: "/services/request-quote/?s=change-management&mode=gov" }]
  },
  {
    id: "cs-concur",
    title: "Enterprise SAP Concur Curriculum",
    type: "case-study",
    audiences: ["organizations"],
    category: "Corporate · Systems training",
    metric: "500+",
    metricLabel: "professionals trained · 95% satisfaction",
    price: null, priceValue: null,
    status: "available",
    summary: "Role-based LMS curriculum that trained more than 500 professionals across departments on SAP Concur.",
    tags: ["sap", "concur", "lms", "role-based", "corporate", "systems training", "case study"],
    featured: ["organizations"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },
  {
    id: "cs-clm",
    title: "Contract & Procurement Lifecycle Rollout",
    type: "case-study",
    audiences: ["organizations"],
    category: "Enterprise · Dual platform launch",
    metric: "2",
    metricLabel: "enterprise platforms launched",
    price: null, priceValue: null,
    status: "available",
    summary: "Built the training program from scratch for a CLM/PCM rollout on GEP Smart, with ClickLearn job aids, Power Apps, Power BI, and post-go-live office hours.",
    tags: ["gep smart", "clm", "pcm", "procurement", "clicklearn", "power apps", "power bi", "job aids", "case study"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },
  {
    id: "cs-leap",
    title: "L.E.A.P. De-escalation Training",
    type: "case-study",
    audiences: ["organizations"],
    category: "Customer service · eLearning",
    metric: "L.E.A.P.",
    metricLabel: "Listen · Empathize · Apologize · Perform",
    price: null, priceValue: null,
    status: "available",
    summary: "An original de-escalation framework delivered as an Articulate Storyline course with AI-enhanced job aids.",
    tags: ["de-escalation", "customer service", "storyline", "articulate", "job aids", "soft skills", "elearning", "case study"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },
  {
    id: "cs-stress",
    title: "Managing Workplace Stress",
    type: "case-study",
    audiences: ["organizations"],
    category: "Wellness · Microlearning",
    metric: "6",
    metricLabel: "step stress-response framework",
    price: null, priceValue: null,
    status: "available",
    summary: "An Articulate Rise wellness course paired with a visual performance-support infographic.",
    tags: ["wellness", "stress", "rise", "articulate", "infographic", "microlearning", "elearning", "case study"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },
  {
    id: "cs-efl",
    title: "Economics & Financial Literacy Curriculum",
    type: "case-study",
    audiences: ["educators"],
    category: "K–12 · Multi-state curriculum · Subcontractor to Accelerate Education",
    metric: "6",
    metricLabel: "states' standards mapped",
    price: null, priceValue: null,
    status: "available",
    summary: "As a subcontractor to Accelerate Education, redesigned a K–12 economics and financial literacy curriculum against Nevada, California, Florida, Pennsylvania, Texas, and Washington standards, reaching 100% Nevada state compliance.",
    tags: ["k-12", "curriculum", "financial literacy", "economics", "standards", "alignment", "crosswalk", "nevada", "texas", "case study"],
    featured: ["educators"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },
  {
    id: "cs-tyler-isd",
    title: "District-wide Curriculum Writing",
    type: "case-study",
    audiences: ["educators"],
    category: "K–12 · Tyler ISD · Prior experience (employment)",
    metric: "17,000+",
    metricLabel: "students reached",
    price: null, priceValue: null,
    status: "available",
    summary: "Prior experience as a district employee: curriculum writer, facilitator, and team lead for a Texas school district, followed by district instructional design.",
    tags: ["k-12", "curriculum", "district", "texas", "teks", "professional development", "case study"],
    actions: [{ label: "Request a curriculum quote", url: "/services/request-quote/?s=training-needs-analysis&mode=gov" }]
  },
  {
    id: "cs-educators-rising",
    title: "Educators Rising National Awards",
    type: "case-study",
    audiences: ["educators"],
    category: "K–12 · CTE Education & Training",
    metric: "2× 1st",
    metricLabel: "place nationally, plus a 2nd",
    price: null, priceValue: null,
    status: "available",
    summary: "Coached high school future-teacher students to 1st place in Public Speaking, 1st in Interactive Bulletin Board, and 2nd in Children's Literature at the national conference.",
    tags: ["cte", "educators rising", "tafe", "high school", "student leadership", "coaching", "case study"],
    actions: [{ label: "Read the case study", url: "https://meshayla.com" }]
  },

  /* ---------------------------------------------------------------
     SERVICES — Government & Public Sector
     --------------------------------------------------------------- */
  svc("training-needs-analysis", "Training Needs & Curriculum Strategy Sprint", "Government & public sector", "$6,500", 6500,
      "A focused sprint that clarifies who needs training, on what, and how to deliver it.",
      ["organizations", "educators"], "gov", ["needs analysis", "tna", "curriculum", "district", "strategy"], ["organizations", "educators"]),
  svc("virtual-training", "Customized Virtual Training", "Government & public sector", "$6,950", 6950,
      "Live virtual training built around your audience, systems, and goals.",
      ["organizations", "educators"], "gov", ["virtual", "webinar", "professional development", "pd", "zoom", "teams"]),
  svc("technical-documentation", "Technical Documentation Accelerator", "Government & public sector", "$7,500", 7500,
      "Clear, usable documentation that helps people follow processes and systems correctly.",
      ["organizations"], "gov", ["sop", "job aids", "manuals", "documentation", "quick reference"]),
  svc("full-day-training", "Full-Day Virtual Training Experience", "Government & public sector", "$9,500", 9500,
      "A complete, customized day of virtual learning with materials and reporting.",
      ["organizations", "educators"], "gov", ["virtual", "workshop", "professional development", "pd"]),
  svc("onsite-training", "On-Site Customized Training", "Government & public sector", "From $10,500 + travel", 10500,
      "In-person, customized training delivered at your location.",
      ["organizations", "educators"], "gov", ["in person", "workshop", "facilitation", "professional development", "pd"], ["organizations"]),
  svc("elearning-development", "Rapid eLearning Development", "Government & public sector", "From $12,500", 12500,
      "Polished, interactive eLearning ready to publish to your LMS.",
      ["organizations", "educators"], "gov", ["elearning", "storyline", "rise", "articulate", "scorm", "lms"], ["organizations"]),
  svc("change-management", "Change & Implementation Readiness Sprint", "Government & public sector", "From $13,500", 13500,
      "Prepare your people, leaders, and communications before a new system or process goes live.",
      ["organizations"], "gov", ["ocm", "change management", "adkar", "prosci", "go-live", "communications", "erp"], ["organizations"]),
  svc("lms-modernization", "Course & LMS Modernization Sprint", "Government & public sector", "From $13,950", 13950,
      "Bring existing courses up to current instructional and LMS standards.",
      ["organizations", "educators"], "gov", ["lms", "modernize", "update courses", "accessibility", "canvas", "moodle"]),

  /* SERVICES — Business Advisory & Formation */
  svc("startup-consultation-30", "30-Minute Startup Consultation", "Business advisory", "$150", 150,
      "A focused conversation to answer your most pressing startup questions.",
      ["business"], "book", ["startup", "new business", "llc", "advice", "consultation"], ["business"], true),
  svc("startup-consultation", "Business Startup Consultation", "Business advisory", "$295", 295,
      "A structured session that leaves you with a personalized startup action plan.",
      ["business"], "book", ["startup", "action plan", "new business", "consultation"], [], true),
  svc("business-formation", "Business Formation Support", "Business advisory", "$895 + filing fees", 895,
      "Guided, organized support to form your business and set it up correctly.",
      ["business"], "book", ["llc", "formation", "ein", "register business", "incorporate"], ["business"], true),
  svc("business-launch-growth", "Business Launch + Growth Package", "Business advisory", "$1,495 + filing fees", 1495,
      "Formation support plus positioning and readiness to pursue larger opportunities.",
      ["business"], "quote", ["llc", "launch", "growth", "package"], [], true),

  /* SERVICES — Government Contracting Readiness */
  svc("sam-readiness-review", "SAM.gov Readiness Review", "Government contracting", "$295", 295,
      "Know exactly what you need before you register, and avoid common delays.",
      ["business"], "book", ["sam", "sam.gov", "uei", "cage", "federal", "government contracting"], [], true),
  svc("sam-registration", "SAM.gov Registration Support", "Government contracting", "$995", 995,
      "Guided support to complete an accurate, well-prepared SAM.gov registration.",
      ["business"], "book", ["sam", "sam.gov", "uei", "cage", "federal", "registration", "government contracting"], ["business"], true),
  svc("capability-statement-review", "Capability Statement Review", "Government contracting", "$250", 250,
      "Expert feedback to make your existing capability statement stronger.",
      ["business"], "book", ["capability statement", "cap statement", "government contracting"], [], true),
  svc("capability-statements", "Professional Capability Statement", "Government contracting", "$795", 795,
      "A polished, buyer-ready capability statement that presents your firm with confidence.",
      ["business"], "book", ["capability statement", "cap statement", "one pager", "government contracting"], ["business"], true),
  svc("government-branding-package", "Government Branding & Capability Package", "Government contracting", "$1,295", 1295,
      "A capability statement plus government-focused messaging for your website and outreach.",
      ["business"], "quote", ["capability statement", "branding", "government contracting", "messaging"], [], true),

  /* SERVICES — Digital Business */
  svc("basic-business-email", "Basic Business Email Setup", "Digital business", "$195 + platform fees", 195,
      "One professional business email address, configured and ready to use.",
      ["business"], "book", ["email", "domain email", "microsoft 365", "google workspace"], [], true),
  svc("business-email", "Professional Business Email Setup", "Digital business", "$295 + platform fees", 295,
      "Branded email addresses and signatures that make every message look professional.",
      ["business"], "book", ["email", "signature", "domain email", "microsoft 365", "google workspace"], [], true),
  svc("basic-business-phone", "Basic Business Phone Setup", "Digital business", "$150 + platform fees", 150,
      "A dedicated business number so you can keep work and personal calls separate.",
      ["business"], "book", ["phone", "business number", "voip"], [], true),
  svc("business-phone", "Business Phone Setup", "Digital business", "$225 + platform fees", 225,
      "A complete business phone setup with greeting, voicemail, and call routing.",
      ["business"], "book", ["phone", "voicemail", "call routing", "voip"], [], true),
  svc("digital-essentials", "Business Digital Essentials", "Digital business", "$695 + third-party fees", 695,
      "Domain, email, and phone set up together for a complete professional foundation.",
      ["business"], "book", ["domain", "email", "phone", "bundle"], [], true),
  svc("starter-website", "Starter Business Website", "Web development", "$995", 995,
      "A clean, mobile-ready one-page website that presents your business professionally.",
      ["business"], "book", ["website", "web design", "web development", "landing page", "one page"], ["business"], true),
  svc("professional-website", "Professional Business Website", "Web development", "From $2,500", 2500,
      "A multi-page website built to explain your services and convert visitors.",
      ["business", "organizations"], "quote", ["website", "web design", "web development", "multi-page", "seo"], ["business"], true),
  svc("business-launch-digital", "Business Launch Digital Package", "Digital business", "$3,950 + filing & third-party fees", 3950,
      "Formation, digital setup, and a website: your complete business launch in one engagement.",
      ["business"], "quote", ["launch", "website", "llc", "bundle", "package"], [], true),

  /* SERVICES — Career & Workforce */
  svc("resume-review", "Professional Resume Review", "Career services", "$175", 175,
      "A clear assessment of what's working in your resume and what to change.",
      ["business"], "book", ["resume", "résumé", "cv", "job search", "career"], [], true),
  svc("resume-refresh", "Resume Refresh", "Career services", "$425", 425,
      "A professional rewrite of your current resume with stronger, achievement-focused language.",
      ["business"], "book", ["resume", "résumé", "cv", "rewrite", "career"], [], true),
  svc("resume-development", "Professional Resume Development", "Career services", "$725", 725,
      "A rebuilt resume that presents your experience and achievements with clarity.",
      ["business"], "book", ["resume", "résumé", "cv", "career", "job search"], ["business"], true),
  svc("federal-executive-resume", "Federal / Executive Resume", "Career services", "From $1,095", 1095,
      "A detailed resume for federal positions or executive-level opportunities.",
      ["business"], "quote", ["resume", "federal", "usajobs", "executive", "career"], [], true),

  /* SERVICES — Learning & Course Development */
  svc("course-strategy-consultation", "Course Strategy Consultation", "Course development", "$495", 495,
      "Expert guidance to shape your course idea into a clear, effective plan.",
      ["educators", "organizations", "business"], "book", ["course", "online course", "course creator", "curriculum", "instructional design"], ["educators"]),
  svc("course-audit", "Existing Course Audit", "Course development", "$750", 750,
      "An instructional-design review that shows how to make an existing course more effective.",
      ["educators", "organizations", "business"], "book", ["course", "audit", "review", "instructional design", "quality"]),
  svc("course-development", "Course Development Sprint", "Course development", "From $6,500", 6500,
      "A well-structured course built on sound instructional design and your expertise.",
      ["educators", "organizations", "business"], "quote", ["course", "online course", "curriculum", "instructional design", "addie"], ["educators"]),
  svc("digital-course-development", "Complete Digital Course Development", "Course development", "From $12,500", 12500,
      "A complete, interactive digital course published and ready for your LMS.",
      ["educators", "organizations", "business"], "quote", ["course", "elearning", "lms", "scorm", "online course", "storyline"]),

  /* SERVICES — Procurement */
  {
    id: "procurement",
    title: "Procurement & Product Sourcing",
    type: "service",
    audiences: ["organizations"],
    category: "Government & institutional supply",
    price: "By quote",
    priceValue: null,
    status: "available",
    summary: "We source commercially available products and supplies to your specifications, RFQs, purchase orders, and micro-purchase requirements.",
    tags: ["procurement", "rfq", "purchase order", "supplies", "sourcing", "micro-purchase", "p-card", "products"],
    featured: ["organizations"],
    actions: [
      { label: "Request a quote", url: "/services/request-quote/?mode=product" },
      { label: "Learn more", url: "/procurement/" }
    ]
  }
];

/* Helper for service entries. You can ignore this unless adding services.
   mode: "book" = Book & Pay, "quote" = Request a Quote, "gov" = Government Quote */
function svc(slug, title, category, price, priceValue, summary, audiences, mode, tags, featured, assist) {
  var main =
    mode === "book"  ? { label: "Book & pay",      url: "/services/book/?s=" + slug } :
    mode === "gov"   ? { label: "Request a quote", url: "/services/request-quote/?s=" + slug + "&mode=gov" } :
                       { label: "Request a quote", url: "/services/request-quote/?s=" + slug };
  return {
    id: slug, title: title, type: "service", audiences: audiences, category: category,
    price: price, priceValue: priceValue, status: "available", summary: summary,
    tags: (tags || []).concat(["service"]), featured: featured || [], assist: !!assist,
    actions: [main, { label: "Details", url: "/services/" + slug + "/" }]
  };
}
