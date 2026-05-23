const FORGE_PROGRAM = {
  appName: "FORGE",
  fullName: "Focused Operations for Robotics Growth & Excellence",
  cohort: "FRC 10332 — 2026 Season",
  passingScore: 80,

  demo: {
    name: "Alex Chen",
    initials: "AC",
    memberId: "#10332-026",
    role: "rookie",
    joined: "September 2025",
    subteam: "Control",
    email: "alex.chen@frc10332.org"
  },

  roles: {
    rookie:    { label: "Rookie Member",    level: 1, exempt: false, color: "#7fa6d3", description: "First-year team member — all training modules required before shop access." },
    sophomore: { label: "Sophomore Member", level: 2, exempt: false, color: "#8fbac0", description: "Second-year member — safety and subteam-specific modules required." },
    existing:  { label: "Veteran Member",   level: 3, exempt: true,  color: "#78c8a0", description: "Three-plus year veteran — exempt from standard training track by default." },
    captain:   { label: "Team Captain",     level: 4, exempt: true,  color: "#c0a060", description: "Elected team captain — leadership-track supplement recommended." },
    lead:      { label: "Subteam Lead",     level: 4, exempt: true,  color: "#d09040", description: "Subteam lead role — may mark sections complete for direct reports." },
    mentor:    { label: "Mentor / Coach",   level: 5, exempt: true,  color: "#c07878", description: "Adult technical or business mentor — full administrative override access." },
    alumnus:   { label: "Alumni Observer",  level: 0, exempt: true,  color: "#9090c0", description: "Alumni with read-only access to all training materials and resources." }
  },

  teams: {
    mechanical:  {
      label: "Mechanical",       code: "MECH",  color: "#ef4444",
      required: ["safety","fabrication","design"],
      optional: ["control","strategy"],
      description: "Build, fabricate, and maintain the physical robot."
    },
    electrical:  {
      label: "Electrical",       code: "ELEC",  color: "#f97316",
      required: ["safety","control","fabrication"],
      optional: ["design"],
      description: "Wire, power, and diagnose all robot electronics."
    },
    software:    {
      label: "Software",         code: "SW",    color: "#3b82f6",
      required: ["safety","control","strategy"],
      optional: ["design","fabrication"],
      description: "Program the robot using Java/WPILib and drive-team tools."
    },
    media:       {
      label: "Business & Media", code: "BIZ",   color: "#a855f7",
      required: ["safety","business-media","art"],
      optional: ["strategy"],
      description: "Manage sponsorships, social media, and team brand."
    },
    strategy:    {
      label: "Strategy",         code: "STRAT", color: "#22c55e",
      required: ["safety","strategy","business-media"],
      optional: ["art","design"],
      description: "Scout, analyze game data, and optimize match strategy."
    },
    leadership:  {
      label: "Leadership",       code: "LEAD",  color: "#eab308",
      required: ["safety","strategy","business-media","design"],
      optional: ["fabrication","control","art"],
      description: "Captains and leads — cross-functional leadership track."
    }
  },

  modules: [
    {
      key: "safety",
      title: "Safety",
      icon: "safety",
      difficulty: "beginner",
      estimatedTime: "90 min",
      prerequisites: [],
      owner: "Safety Captains",
      modulePage: "modules/safety.html",
      outcome: "Operate in the shop and pit with zero-compromise safety habits.",
      sections: [
        {
          id: "safety-1",
          title: "Personal Protective Equipment",
          notes: "<h4>PPE Overview</h4><p>PPE is mandatory any time tools or the robot are active. Standards for all FRC 10332 members:</p><ul><li><strong>Safety glasses</strong> — required at all times in the shop, no exceptions.</li><li><strong>Closed-toe shoes</strong> — required for all build sessions and competition days.</li><li><strong>Hearing protection</strong> — required when operating loud machinery (router, chop saw, grinder).</li><li><strong>Gloves</strong> — required for sheet metal and soldering; <em>never</em> wear near rotating equipment.</li></ul><p>PPE is stored in the red bins near each station. Report damaged PPE to the safety captain immediately.</p>",
          video: "https://www.youtube.com/embed/4x8fGYGsPCE",
          quiz: [
            { q: "Safety glasses must be worn:", options: ["Only when mentors are present", "Any time tools or the robot are active", "During competition only"], answer: 1 },
            { q: "Gloves should NOT be worn when:", options: ["Handling sheet metal", "Operating rotating equipment", "Soldering circuit boards"], answer: 1 },
            { q: "Where is PPE stored in the shop?", options: ["The captain's locker", "Red bins near each station", "The main office shelf"], answer: 1 }
          ]
        },
        {
          id: "safety-2",
          title: "Shop Zones and Access",
          notes: "<h4>Color-Coded Zone System</h4><p>The shop uses a three-tier zone system to match risk level with experience:</p><ul><li><strong>Green zone</strong> — open access for all trained and certified members.</li><li><strong>Yellow zone</strong> — requires one-on-one mentor sign-off before first solo use.</li><li><strong>Red zone</strong> — authorized access only; senior members and mentors exclusively.</li></ul><p>Zone boundaries are marked with colored tape on the floor. Access levels are posted on the main bulletin board. <strong>Never enter a zone above your clearance without explicit supervisor approval.</strong></p>",
          video: "https://www.youtube.com/embed/JCH91hxqJz0",
          quiz: [
            { q: "A red zone requires:", options: ["Any certified member", "One mentor present", "Authorized personnel only"], answer: 2 },
            { q: "Zone access levels are posted on:", options: ["The shop bulletin board", "The team website", "Google Classroom"], answer: 0 },
            { q: "To use a yellow-zone machine solo, you need:", options: ["No extra approval", "One-on-one mentor sign-off", "Two mentors present simultaneously"], answer: 1 }
          ]
        },
        {
          id: "safety-3",
          title: "Tool Safety Fundamentals",
          notes: "<h4>Safe Tool Use</h4><p>Every power tool must be inspected before use. Check for:</p><ul><li>Frayed cords or damaged housings</li><li>Missing guards or blade covers</li><li>Loose bits, blades, or drill chucks</li><li>Proper speed settings for the material</li></ul><p>Always use a two-hand start on power tools where required. Never bypass guards. If a tool is defective, tag it with a <strong>RED OUT-OF-SERVICE tag</strong> and notify a mentor before leaving the station.</p>",
          video: "https://www.youtube.com/embed/hbYFU8jv_jA",
          quiz: [
            { q: "A damaged or defective tool should be:", options: ["Used very carefully", "Tagged OUT-OF-SERVICE and reported to a mentor", "Set aside for someone else to check later"], answer: 1 },
            { q: "Before using a power tool, you must:", options: ["Start it immediately to warm up", "Inspect it for damage, missing guards, and loose parts", "Ask a teammate to supervise"], answer: 1 },
            { q: "A tool with a missing blade guard is:", options: ["Acceptable if you go slowly", "Out of service until repaired", "Fine for experienced members only"], answer: 1 }
          ]
        },
        {
          id: "safety-4",
          title: "Emergency Procedures",
          notes: "<h4>Emergency Response</h4><p>Know these locations and procedures before your first build session:</p><ul><li><strong>First aid kit</strong> — main door, restocked monthly. Do not remove it from the hook.</li><li><strong>Fire extinguisher</strong> — at each exit, type ABC. Know PASS technique (Pull, Aim, Squeeze, Sweep).</li><li><strong>Emergency stop</strong> — large red button on the main breaker panel near the center wall.</li><li><strong>Evacuation route</strong> — posted on all four walls; rally point is the far corner of the parking lot.</li></ul><p><strong>Any injury, regardless of severity, must be reported to a mentor and logged in the incident binder within 24 hours.</strong></p>",
          video: "https://www.youtube.com/embed/vW0vRkRtJVQ",
          quiz: [
            { q: "The emergency stop button is located:", options: ["Near the main entry door", "On the main breaker panel near the center wall", "Inside the first aid kit enclosure"], answer: 1 },
            { q: "An injury must be logged in the incident binder:", options: ["Only if it requires medical attention", "Within 24 hours of the incident", "At the next scheduled team meeting"], answer: 1 },
            { q: "The PASS technique is used for:", options: ["Safe battery handling", "Operating the fire extinguisher", "Emergency robot shutdown"], answer: 1 }
          ]
        },
        {
          id: "safety-5",
          title: "Competition Pit Safety",
          notes: "<h4>Pit Safety at Events</h4><p>Pits are crowded, high-pressure environments. Safety standards are non-negotiable:</p><ul><li>Maintain a clear <strong>18-inch aisle</strong> at all times for emergency egress.</li><li>Never enable the robot without calling out <strong>\"ENABLE!\"</strong> — wait for clearance from all team members.</li><li>All tools and spare parts must be stowed — nothing on the floor.</li><li>Only credentialed team members may be in the pit during active repairs.</li><li>Robot power must be <strong>physically disconnected</strong> (main breaker off) before any mechanical work.</li></ul>",
          video: "https://www.youtube.com/embed/9keeDyFxzY4",
          quiz: [
            { q: "The minimum clear aisle width in the competition pit is:", options: ["6 inches", "12 inches", "18 inches"], answer: 2 },
            { q: "Before enabling the robot in the pit, you must:", options: ["Announce 'ENABLE!' and wait for clearance", "Silently check the area yourself", "Ask the event field supervisor first"], answer: 0 },
            { q: "Before mechanical work on the robot, power must be:", options: ["Reduced to low voltage", "Physically disconnected via the main breaker", "Turned off via the Driver Station only"], answer: 1 }
          ]
        },
        {
          id: "safety-6",
          title: "Chemical and Battery Safety",
          notes: "<h4>Chemicals and Battery Handling</h4><p>FRC robots use sealed lead-acid (SLA) batteries that require careful handling:</p><ul><li>Never short battery terminals — always use insulated terminal covers when disconnected.</li><li>Store batteries <strong>upright in designated racks</strong>. Never stack or lay flat.</li><li>Inspect batteries for swelling, cracks, or corrosion before each use. Remove from service immediately if found.</li><li>Dispose of damaged batteries only at a certified recycling facility.</li></ul><p>Adhesives, lubricants, and solvents must be stored in the <strong>flammables cabinet</strong> and used only with adequate ventilation and PPE.</p>",
          video: "https://www.youtube.com/embed/ZvOXnzJTvTo",
          quiz: [
            { q: "Batteries must be stored:", options: ["Stacked flat to save space", "Upright in designated racks", "On the floor near the robot"], answer: 1 },
            { q: "A swollen or cracked battery must be:", options: ["Used with extra caution", "Removed from service and recycled at a certified facility", "Stored separately and monitored"], answer: 1 },
            { q: "Solvents and adhesives must be kept in:", options: ["Any available cabinet", "The designated flammables cabinet", "Your personal tool bag"], answer: 1 }
          ]
        }
      ]
    },
    {
      key: "business-media",
      title: "Business and Media",
      icon: "business",      difficulty: "beginner",
      estimatedTime: "60 min",
      prerequisites: ["safety"],      owner: "Business Team + Media Team",
      modulePage: "modules/business-media.html",
      outcome: "Build sponsor-ready, community-facing communication.",
      sections: [
        {
          id: "bm-1",
          title: "Brand Identity and Consistency",
          notes: "<h4>Team Brand Standards</h4><p>A consistent visual identity builds credibility with sponsors and the public. FRC 10332 brand rules:</p><ul><li>Only use <strong>approved logo files</strong> from the shared brand drive — never recreate or modify the logo.</li><li>Official colors: navy <code>#071a33</code> and silver <code>#bfc8d4</code>. Do not substitute other shades.</li><li>Primary font is <strong>Rajdhani</strong> for headings; Space Grotesk for body text in digital assets.</li><li>All public-facing materials must be reviewed by the media lead before publication.</li></ul><p>When in doubt, ask before publishing.</p>",
          video: "https://www.youtube.com/embed/4KlyPZ6ztiM",
          quiz: [
            { q: "Team logo files should be sourced from:", options: ["Any team member's files", "The shared brand drive approved files only", "The FIRST website directly"], answer: 1 },
            { q: "Who must review public-facing materials before publishing?", options: ["Any team captain", "The media lead", "A parent volunteer"], answer: 1 },
            { q: "When you are unsure whether a design is on-brand, you should:", options: ["Publish it and see if anyone notices", "Ask the media lead before publishing", "Use your best judgment"], answer: 1 }
          ]
        },
        {
          id: "bm-2",
          title: "Sponsor Acquisition and Relations",
          notes: "<h4>Sponsorship Best Practices</h4><p>Sponsors are the financial foundation of the team. Maintain these standards:</p><ul><li>All sponsor outreach must use the <strong>approved email template</strong> sent from the official team account.</li><li>Follow up within <strong>2 weeks</strong> of any sponsor meeting or presentation.</li><li>Provide sponsors with a yearly <strong>impact report</strong> documenting what their support enabled.</li><li>Never promise a sponsor anything (logo size, event appearances) without lead approval.</li><li>Thank sponsors publicly on social media after each major event.</li></ul>",
          video: "https://www.youtube.com/embed/0zpflsYc4PA",
          quiz: [
            { q: "Sponsor outreach emails must be sent from:", options: ["Any member's personal email", "The official team account using the approved template", "The mentor's school email"], answer: 1 },
            { q: "How long after a sponsor meeting should you follow up?", options: ["Within 2 weeks", "Within 2 months", "Only if they contact you first"], answer: 0 },
            { q: "Promising a sponsor robot logo placement requires:", options: ["No approval — it's a standard offer", "Lead approval before making the promise", "Business captain approval only"], answer: 1 }
          ]
        },
        {
          id: "bm-3",
          title: "Social Media Content Strategy",
          notes: "<h4>Social Media Standards</h4><p>Our social media channels are the team's public face. All content must be planned, approved, and professional:</p><ul><li>Use the <strong>content calendar</strong> to plan posts at least one week in advance during build season.</li><li>All posts featuring members' faces must have signed <strong>media release consent</strong> on file.</li><li>Never post scores, robot details, or strategy hints before explicit lead approval during competition.</li><li>Respond to comments and DMs within 48 hours in a professional tone.</li><li>Document all post engagement metrics monthly for sponsor reporting.</li></ul>",
          video: "https://www.youtube.com/embed/7e9nM9YeqRQ",
          quiz: [
            { q: "Posts featuring members' faces require:", options: ["Verbal permission on the day", "Signed media release consent on file", "Parent approval per post"], answer: 1 },
            { q: "Competition robot details and strategy should be posted:", options: ["Immediately after each match", "Only with explicit lead approval", "Only after the event season ends"], answer: 1 },
            { q: "Content calendar posts should be planned:", options: ["The same day they go live", "At least one week in advance during build season", "By the media lead alone, not shared with team"], answer: 1 }
          ]
        },
        {
          id: "bm-4",
          title: "Community Outreach Events",
          notes: "<h4>Outreach Planning and Documentation</h4><p>Outreach is critical for award eligibility and community standing. Key requirements:</p><ul><li>Log every outreach event in the <strong>outreach tracking sheet</strong> with date, location, attendance, and a photo.</li><li>A minimum of <strong>2 outreach events per semester</strong> is required for award consideration.</li><li>Events require mentor approval at least <strong>2 weeks before</strong> the scheduled date.</li><li>Members must wear official team gear and adhere to the code of conduct.</li><li>Write a 2-sentence summary per event for the award submission portfolio.</li></ul>",
          video: "https://www.youtube.com/embed/mRbFDlnMRmo",
          quiz: [
            { q: "Every outreach event must be logged in:", options: ["The team captain's notes", "The outreach tracking sheet with date, location, and photo", "The FIRST registration system only"], answer: 1 },
            { q: "Outreach events require mentor approval:", options: ["At least 2 weeks before the event", "The day before", "Only for events off school property"], answer: 0 },
            { q: "For award consideration, minimum outreach events per semester is:", options: ["1", "2", "4"], answer: 1 }
          ]
        },
        {
          id: "bm-5",
          title: "Photography and Video Production",
          notes: "<h4>Documenting the Team</h4><p>High-quality documentation is essential for awards, sponsorship, and media. Standards:</p><ul><li>Use the team camera or a phone at <strong>minimum 1080p</strong> for official content.</li><li>All raw files must be uploaded to the shared drive within <strong>48 hours</strong> of the session.</li><li>Do not delete original files — only archive them into dated folders.</li><li>B-roll (shop work, robot close-ups) should be captured every build session from week 3 onward.</li><li>Videos for social media must be exported at <strong>1080p 30fps minimum</strong>.</li></ul>",
          video: "https://www.youtube.com/embed/B9-8N_oZ18U",
          quiz: [
            { q: "Raw photo/video files must be uploaded to the shared drive within:", options: ["1 week", "48 hours", "30 days"], answer: 1 },
            { q: "Official social media video exports must be at minimum:", options: ["480p 24fps", "720p 30fps", "1080p 30fps"], answer: 2 },
            { q: "Original raw files should be:", options: ["Deleted after editing to save space", "Archived in dated folders, never deleted", "Kept only by the media lead"], answer: 1 }
          ]
        },
        {
          id: "bm-6",
          title: "Grants and Awards Applications",
          notes: "<h4>Funding and Recognition</h4><p>Grants and FIRST awards can significantly expand team capabilities. Key practices:</p><ul><li>Maintain an <strong>evidence portfolio</strong> throughout the year — awards are won by documented work, not last-minute summaries.</li><li>Assign a specific owner to each award application at the start of the season.</li><li>Most FIRST awards require an <strong>Executive Summary</strong> (500–1000 words) submitted before the event.</li><li>Grant application deadlines must be tracked in the team calendar — missing a deadline is unrecoverable.</li><li>Review previous winning submissions for style and depth benchmarks.</li></ul>",
          video: "https://www.youtube.com/embed/xRqhDU-5F5M",
          quiz: [
            { q: "The best time to start building an award evidence portfolio is:", options: ["The week before the competition", "Throughout the entire season from day one", "After the first event results are known"], answer: 1 },
            { q: "FIRST award Executive Summaries are typically:", options: ["Submitted verbally at judging sessions", "Written documents submitted before the event", "Optional supplemental materials"], answer: 1 },
            { q: "Missing a grant application deadline is:", options: ["Usually forgivable with a late note", "Unrecoverable — the opportunity is gone", "Handled by the business lead automatically"], answer: 1 }
          ]
        }
      ]
    },
    {
      key: "strategy",
      title: "Strategy",
      icon: "strategy",
      difficulty: "intermediate",
      estimatedTime: "75 min",
      prerequisites: ["safety"],
      owner: "Scouting + Drive Team",
      modulePage: "modules/strategy.html",
      outcome: "Turn game analysis into winning match decisions.",
      sections: [
        {
          id: "strat-1",
          title: "Game Manual Analysis",
          notes: "<h4>Reading the Game Manual</h4><p>Every FRC season starts with the game manual. Effective analysis requires:</p><ul><li>Read the <strong>scoring section first</strong> to identify the highest-value actions and multipliers.</li><li>Identify <strong>penalty-heavy rules</strong> that could cost more than they save.</li><li>Note any rules specific to the <strong>autonomous period</strong> — auto often sets the tone for the match.</li><li>Create a \"key rules\" summary card for all drive team members.</li><li>Re-read after every official Q&amp;A update — rules evolve during build season.</li></ul>",
          video: "https://www.youtube.com/embed/2B9hM4QqF14",
          quiz: [
            { q: "When reading the game manual, you should read which section first?", options: ["The robot rules section", "The scoring section to identify highest-value actions", "The appendix for field dimensions"], answer: 1 },
            { q: "After official Q&A updates are published, you should:", options: ["Wait for the season recap to review changes", "Re-read the relevant sections — rules may have changed", "Assume your original summary is still accurate"], answer: 1 },
            { q: "A key rules summary card is distributed to:", options: ["Only the drive coach", "All drive team members", "Only senior captains"], answer: 1 }
          ]
        },
        {
          id: "strat-2",
          title: "Capability Mapping and Auto Planning",
          notes: "<h4>Mapping Robot Capabilities</h4><p>Strategic planning starts with honest documentation of what your robot can reliably do:</p><ul><li>Document each scoring action as: <strong>Reliable (&gt;90%)</strong>, Developing, or Not Planned.</li><li>Plan autonomous routines around your most reliable actions — one consistent auto beats a flashy unreliable one.</li><li>Rate capabilities across field locations — a robot scoring at one position may fail at another.</li><li>Revisit capability ratings at the start of each competition week as reliability changes.</li><li>Share capability sheets with potential alliance partners during selection.</li></ul>",
          video: "https://www.youtube.com/embed/YlXv7WmVYVA",
          quiz: [
            { q: "A 'Reliable' scoring action has a success rate of:", options: ["Greater than 70%", "Greater than 90%", "100% in practice only"], answer: 1 },
            { q: "Autonomous routines should prioritize:", options: ["The most impressive visual moves", "The most reliable, consistently executable actions", "Actions that score the maximum theoretical points"], answer: 1 },
            { q: "Capability ratings should be revisited:", options: ["Only before the first competition", "At the start of each competition week", "When alliance partners request it"], answer: 1 }
          ]
        },
        {
          id: "strat-3",
          title: "Scouting Methods",
          notes: "<h4>Effective Scouting</h4><p>Good scouting data drives every strategic decision. FRC 10332 scouting standards:</p><ul><li>Assign one scout per alliance robot for every qualification match. <strong>Never skip a match.</strong></li><li>Record quantitative data (cycle count, auto score, end-game result) — not just subjective impressions.</li><li>Use the team's <strong>standardized scouting sheet</strong> — custom fields create inconsistent data.</li><li>Scout the robot's <em>actual</em> match performance, not their stated capabilities.</li><li>Upload data to the shared spreadsheet within <strong>10 minutes</strong> after each match.</li></ul>",
          video: "https://www.youtube.com/embed/9keeDyFxzY4",
          quiz: [
            { q: "Scouting data should primarily be:", options: ["Subjective impressions from experienced members", "Quantitative (cycle count, score, end-game result)", "Based on the other team's pit interview answers"], answer: 1 },
            { q: "How soon after a match should scouting data be uploaded?", options: ["Within 10 minutes", "Within 1 hour", "By end of the competition day"], answer: 0 },
            { q: "If a match is missed, a scout should:", options: ["Leave the scouting sheet blank", "Estimate based on the team's pit interview", "Never skip — a missed match is unacceptable"], answer: 2 }
          ]
        },
        {
          id: "strat-4",
          title: "Alliance Selection Process",
          notes: "<h4>Alliance Selection Strategy</h4><p>Alliance selection is one of the highest-stakes decisions at an event. Prepare in advance:</p><ul><li>Build a <strong>ranked pick list</strong> using scouting data by lunch on Day 2 — never improvise during selection.</li><li>Identify your top 3 preferred picks and 3 backup options.</li><li>Consider <strong>complementary capabilities</strong> — pick robots that fill gaps in your strategy, not just the highest OPR.</li><li>Watch each candidate robot's last 2–3 matches before selection to confirm real performance.</li><li>Communicate your strategy clearly to alliance partners immediately after selection.</li></ul>",
          video: "https://www.youtube.com/embed/GpYzIH7bpcc",
          quiz: [
            { q: "The ranked pick list must be ready:", options: ["By the morning of alliance selection", "By lunch on Day 2 of the competition", "After the first few elimination rounds"], answer: 1 },
            { q: "The best alliance partner pick strategy is to choose:", options: ["The robot with the highest OPR regardless of fit", "Robots with complementary capabilities that fill your gaps", "Teams you have practiced with before"], answer: 1 },
            { q: "Before finalizing your pick list, you should watch each candidate's:", options: ["Most recent 2–3 matches to confirm real performance", "Practice match footage only", "Auto routine videos from week 1"], answer: 0 }
          ]
        },
        {
          id: "strat-5",
          title: "Match Planning and Communication",
          notes: "<h4>Pre-Match and In-Match Communication</h4><p>Clear, concise communication is a competitive advantage:</p><ul><li>Hold a <strong>30-second pre-match meeting</strong> with your alliance before every match. Assign each robot a primary and fallback role.</li><li>The drive coach is the <strong>sole communicator</strong> during the match — drivers focus on the robot.</li><li>Use pre-agreed signal words: \"Clear,\" \"Block,\" \"Fallback\" — never improvise new calls mid-match.</li><li>If the planned strategy fails in the first 30 seconds, switch to the agreed fallback immediately.</li><li>After each match, give the drive team a maximum 3-minute debrief before moving on.</li></ul>",
          video: "https://www.youtube.com/embed/FVvYaZFNAUw",
          quiz: [
            { q: "During a match, who is the sole communicator?", options: ["Both drivers simultaneously", "The drive coach", "The HP (Human Player)"], answer: 1 },
            { q: "If the planned strategy fails in the first 30 seconds, you should:", options: ["Continue with the plan anyway", "Improvise a new strategy based on field conditions", "Switch to the pre-agreed fallback plan immediately"], answer: 2 },
            { q: "Pre-match alliance meetings should last approximately:", options: ["30 seconds", "5 minutes", "As long as needed"], answer: 0 }
          ]
        },
        {
          id: "strat-6",
          title: "Post-Event Data Review",
          notes: "<h4>Learning from Every Event</h4><p>Post-event review converts competition experience into documented improvement:</p><ul><li>Within <strong>48 hours</strong> of an event, hold a structured debrief with drive team and strategy leads.</li><li>Review match footage for at least 2 matches per elimination round — identify patterns in failures.</li><li>Update the capabilities matrix based on <em>real event performance</em>, not practice.</li><li>Document each identified issue with an <strong>owner and deadline</strong> before the next event.</li><li>Share the written debrief summary with all team leads to drive improvements.</li></ul>",
          video: "https://www.youtube.com/embed/hPQ_bOwHbDw",
          quiz: [
            { q: "A post-event debrief should be held:", options: ["Within 48 hours of the event", "At the next regular meeting (whenever that is)", "Only if the team did not advance to eliminations"], answer: 0 },
            { q: "Each identified issue from the debrief should have:", options: ["Only a description, no assigned owner", "An assigned owner and a resolution deadline", "A rank in severity but no further action"], answer: 1 },
            { q: "The capabilities matrix should be updated based on:", options: ["Practice session data", "Drive coach gut feeling", "Real event performance data"], answer: 2 }
          ]
        }
      ]
    },
    {
      key: "design",
      title: "Design",
      icon: "design",
      difficulty: "intermediate",
      estimatedTime: "80 min",
      prerequisites: ["safety"],
      owner: "CAD + Systems Design",
      modulePage: "modules/design.html",
      outcome: "Create robust mechanisms and clear design documentation.",
      sections: [
        {
          id: "design-1",
          title: "CAD Standards and File Organization",
          notes: "<h4>Onshape and CAD Standards</h4><p>Consistent CAD practices prevent version conflicts and keep designs accessible to the whole team:</p><ul><li>All parts are created in Onshape. <strong>Never work in a personal account</strong> — always use the team workspace.</li><li>Part naming convention: <code>[Subsystem]-[Part Name]-[Version]</code> (e.g., <code>Intake-Roller-v2</code>).</li><li>Create a new <strong>version snapshot</strong> before making significant changes — this enables rollback.</li><li>Every assembly must have a <strong>master sketch</strong> defining key dimensions and reference planes.</li><li>Complete all CAD work in the designated sprint before fabrication begins.</li></ul>",
          video: "https://www.youtube.com/embed/o6Xf6V9sWlI",
          quiz: [
            { q: "CAD work for FRC 10332 must be done in:", options: ["Any personal CAD software the member prefers", "The official team Onshape workspace", "SolidWorks on the school computer"], answer: 1 },
            { q: "The correct part naming convention is:", options: ["PartName_Date", "[Subsystem]-[Part Name]-[Version]", "v1_PartName_Member"], answer: 1 },
            { q: "Before making significant changes in Onshape, you must:", options: ["Email the design lead for approval first", "Create a version snapshot to enable rollback", "Delete the previous version to avoid confusion"], answer: 1 }
          ]
        },
        {
          id: "design-2",
          title: "Mechanism Design Principles",
          notes: "<h4>Designing Reliable Mechanisms</h4><p>FRC mechanisms must survive high-speed collisions and hundreds of cycles. Key design principles:</p><ul><li><strong>KISS rule:</strong> Keep It Simple. Every added component is a potential failure point.</li><li>Design for <strong>graceful degradation</strong> — if one part fails, the robot should still function at reduced capacity.</li><li>Prototype first — use cardboard, PVC, or LEGO before committing to aluminum. Prototyping is faster than redesigning.</li><li>Account for <strong>game piece variation</strong> — field pieces may differ from practice pieces in size and texture.</li><li>All mechanisms must pass a <strong>10-cycle reliability test</strong> before final CAD sign-off.</li></ul>",
          video: "https://www.youtube.com/embed/oxLHhH8kkJk",
          quiz: [
            { q: "The KISS principle in mechanism design means:", options: ["Keep It Serviceable and Safe", "Keep It Simple (every added part is a failure point)", "Keep It Strong and Sturdy"], answer: 1 },
            { q: "Prototyping should happen:", options: ["After full CAD is complete", "Before committing to final aluminum fabrication", "Only if the initial design fails"], answer: 1 },
            { q: "Mechanisms must pass how many cycles in a reliability test before CAD sign-off:", options: ["5 cycles", "10 cycles", "50 cycles"], answer: 1 }
          ]
        },
        {
          id: "design-3",
          title: "Design for Manufacturability",
          notes: "<h4>DFM Principles</h4><p>A brilliant design that's impossible to build in your shop is worthless. DFM means designing within your actual fabrication constraints:</p><ul><li>Use <strong>standard stock sizes</strong> — 1-inch box tubing, ¼-inch plate, standard bore sizes.</li><li>Every hole pattern should be achievable on the team's drill press or mill without special fixturing.</li><li>Design minimum wall thickness of <strong>0.063 inches</strong> (1/16\") for structural aluminum parts.</li><li>Eliminate unnecessary tight tolerances — only call out ±0.005\" where mechanically critical.</li><li>All parts must be fabricable within the available <strong>6-week build window</strong>.</li></ul>",
          video: "https://www.youtube.com/embed/o6mxI2OAFBI",
          quiz: [
            { q: "DFM (Design for Manufacturability) primarily means:", options: ["Making the design as complex as possible", "Designing within actual shop fabrication constraints", "Using the same parts as top-ranked FRC teams"], answer: 1 },
            { q: "Minimum wall thickness for structural aluminum parts is:", options: ["0.020 inches", "0.063 inches (1/16\")", "0.125 inches (1/8\")"], answer: 1 },
            { q: "Tight tolerances (±0.005\") should be specified:", options: ["Everywhere for maximum precision", "Only where mechanically critical", "Never — all parts use standard tolerances"], answer: 1 }
          ]
        },
        {
          id: "design-4",
          title: "Tolerance Analysis and Structural Review",
          notes: "<h4>Tolerance Stack-Up and Structural Checks</h4><p>Avoiding interference fits and structural failures requires tolerance analysis:</p><ul><li>Perform a <strong>worst-case tolerance stack-up</strong> for any moving interface before finalizing dimensions.</li><li>All structural tubes carrying load must have safety factor <strong>≥ 3</strong>.</li><li>Running clearances: minimum <strong>0.010-inch gap</strong> on sliding fits, 0.005-inch on rotating shaft fits.</li><li>Have a second designer independently review all stress-bearing parts before fabrication approval.</li><li>Document all analyses in the design review packet — undocumented analysis is treated as unapproved.</li></ul>",
          video: "https://www.youtube.com/embed/eJiBuaB8fAg",
          quiz: [
            { q: "A worst-case tolerance stack-up finds:", options: ["The average expected fit between parts", "The maximum possible interference by summing tolerances in one direction", "Whether a part is within standard stock dimensions"], answer: 1 },
            { q: "The minimum safety factor for structural parts is:", options: ["1.5", "2", "3"], answer: 2 },
            { q: "An undocumented tolerance analysis is treated as:", options: ["Approved if the designer is experienced", "Unapproved — documentation is required", "Optional for non-structural parts"], answer: 1 }
          ]
        },
        {
          id: "design-5",
          title: "Design Review Process",
          notes: "<h4>Formal Design Reviews</h4><p>Design reviews catch problems before they become expensive fabrication mistakes:</p><ul><li>Every subsystem requires a <strong>Gate Review</strong> before fabrication can begin. No exceptions.</li><li>The review must include: lead designer, one fabrication rep, one control rep, and the design lead.</li><li>Use the standard <strong>design review checklist</strong> — all checklist items must be marked before approval.</li><li>Issues found in review get written up as action items with owners and deadlines.</li><li>A design that fails review must be revised and re-reviewed — it cannot proceed to fab until approved.</li></ul>",
          video: "https://www.youtube.com/embed/TbpRv5BO1NU",
          quiz: [
            { q: "A Gate Review is required:", options: ["Only for major subsystems like drivetrains", "Before every subsystem can proceed to fabrication", "Only if the design has not been used before"], answer: 1 },
            { q: "Who must be present at a design review?", options: ["Only the lead designer and design lead", "Lead designer, fabrication rep, control rep, and design lead", "Any two design team members"], answer: 1 },
            { q: "A design that fails review:", options: ["Proceeds to fab anyway with noted issues", "Must be revised and re-reviewed before proceeding", "Is cancelled and restarted from scratch"], answer: 1 }
          ]
        },
        {
          id: "design-6",
          title: "BOM and Technical Documentation",
          notes: "<h4>Bill of Materials and Docs</h4><p>Accurate documentation enables fast, accurate fabrication and future design iteration:</p><ul><li>Every assembly must have a <strong>BOM</strong> with part numbers, quantities, material, and source (COTS vs. custom).</li><li>All custom parts need a 2D drawing with GD&amp;T callouts, material spec, and revision history.</li><li>COTS parts must list vendor part number and reorder link in the BOM.</li><li>BOM must be completed and linked to the Onshape assembly <strong>before fabrication begins</strong>.</li><li>Every part's estimated cost must be logged. Total subsystem cost must be approved by design lead before ordering.</li></ul>",
          video: "https://www.youtube.com/embed/Q12mCfBbCpE",
          quiz: [
            { q: "The BOM must include:", options: ["Only custom-fabricated parts", "Part numbers, quantities, material, and source (COTS vs. custom)", "Just a count of total parts needed"], answer: 1 },
            { q: "The BOM must be completed:", options: ["After fabrication is underway", "Before fabrication begins, linked to the Onshape assembly", "At the end of the season for documentation purposes"], answer: 1 },
            { q: "Subsystem cost must be approved by the design lead before:", options: ["Any CAD work begins", "Ordering parts", "The design review"], answer: 1 }
          ]
        }
      ]
    },
    {
      key: "control",
      title: "Control",
      icon: "control",
      difficulty: "advanced",
      estimatedTime: "100 min",
      prerequisites: ["safety","design"],
      owner: "Programming + Electrical",
      modulePage: "modules/control.html",
      outcome: "Deliver reliable wiring, firmware, and software workflows.",
      sections: [
        {
          id: "ctrl-1",
          title: "Electrical Wiring Standards",
          notes: "<h4>Wiring the Robot Safely</h4><p>Reliable wiring prevents match-ending failures. FRC 10332 wiring standards:</p><ul><li><strong>Wire gauges by circuit:</strong> 6 AWG for battery to PDP, 12 AWG for drive motors, 18 AWG for sensors and solenoids.</li><li>Every wire must be <strong>labeled at both ends</strong> with the circuit identifier before installation.</li><li>All connections use <strong>ferrule crimp terminals</strong> for stranded wire — no bare twisted wire in screw terminals.</li><li>Strain relief must be applied within 2 inches of every connector — no wires under tension at the crimp point.</li><li>All wiring must pass electrical inspection before the robot powers on for the first time.</li></ul>",
          video: "https://www.youtube.com/embed/mU1lRJiT8h0",
          quiz: [
            { q: "Drive motor circuits use what gauge wire?", options: ["6 AWG", "12 AWG", "18 AWG"], answer: 1 },
            { q: "Wires in screw terminals must use:", options: ["Bare twisted ends", "Ferrule crimp terminals", "Solder and heat shrink only"], answer: 1 },
            { q: "Every wire must be labeled:", options: ["Only at the power source end", "At both ends with the circuit identifier", "Only if it runs more than 12 inches"], answer: 1 }
          ]
        },
        {
          id: "ctrl-2",
          title: "CAN Bus and Motor Controllers",
          notes: "<h4>CAN Bus Network</h4><p>The CAN bus is the communication backbone for FRC motor controllers. Proper setup prevents random failures:</p><ul><li>CAN is a <strong>daisy-chain topology</strong> — devices are chained from the RoboRIO through all motor controllers and back.</li><li>The two ends of the CAN chain must be <strong>terminated</strong> (120 Ω resistors). Most RoboRIOs and REV devices include built-in termination.</li><li>Each device needs a <strong>unique CAN ID</strong>. Duplicate IDs cause communication errors that are hard to debug.</li><li>All motor controller IDs must be documented in the wiring diagram before competition.</li><li>CAN bus wiring should be physically separated from high-current motor wires to reduce noise.</li></ul>",
          video: "https://www.youtube.com/embed/xVa7cBPMomM",
          quiz: [
            { q: "The CAN bus uses what network topology?", options: ["Star (hub and spoke)", "Daisy-chain", "Mesh"], answer: 1 },
            { q: "Duplicate CAN IDs on the bus will cause:", options: ["No problem — they operate independently", "Communication errors that are hard to debug", "Only slightly slower response times"], answer: 1 },
            { q: "The ends of the CAN bus chain must be:", options: ["Left open (floating)", "Terminated with 120 Ω resistors", "Connected together in a loop"], answer: 1 }
          ]
        },
        {
          id: "ctrl-3",
          title: "Pneumatics System",
          notes: "<h4>Pneumatics Safety and Setup</h4><p>Pneumatic systems store significant energy and require careful handling:</p><ul><li>Maximum high-pressure side: <strong>120 PSI</strong>. Regulator must be set to <strong>60 PSI</strong> for the working circuit.</li><li>All fittings must be thread-sealed with <strong>PTFE tape</strong> — wrap threads 2–3 times in the tightening direction.</li><li>Perform a <strong>24-hour leak test</strong> (pressurize, shut off compressor, check pressure drop) before every competition.</li><li>The pressure relief valve and pressure gauge must be visible and accessible at all times.</li><li>Never exceed rated pressure on any fitting — check manufacturer spec sheets for max ratings.</li></ul>",
          video: "https://www.youtube.com/embed/dWqPDwRkHRA",
          quiz: [
            { q: "The pneumatic working circuit must be regulated to:", options: ["120 PSI", "60 PSI", "30 PSI"], answer: 1 },
            { q: "PTFE tape is applied to fittings:", options: ["In the direction opposite to tightening", "In the tightening direction, 2–3 wraps", "Only to the female (nut) side of the fitting"], answer: 1 },
            { q: "A 24-hour leak test involves:", options: ["Running the compressor continuously for 24 hours", "Pressurizing, shutting off the compressor, and checking pressure drop", "Testing each solenoid individually for 4 hours each"], answer: 1 }
          ]
        },
        {
          id: "ctrl-4",
          title: "Software Architecture (WPILib)",
          notes: "<h4>WPILib Command-Based Architecture</h4><p>FRC 10332 uses the WPILib command-based framework for all robot code. Key concepts:</p><ul><li><strong>Subsystems</strong> encapsulate physical mechanisms (e.g., <code>DrivetrainSubsystem</code>). Each subsystem has one default command.</li><li><strong>Commands</strong> define actions (e.g., <code>DriveWithJoysticksCommand</code>). Commands declare required subsystems — the scheduler enforces no conflicts.</li><li>Robot state that persists between commands lives in the <strong>subsystem</strong>, not in commands.</li><li>All code must pass a <strong>peer review</strong> (minimum one other programmer) before merging to main.</li><li>Use <strong>NetworkTables</strong> for all tunable constants — never hardcode values that need tuning on competition day.</li></ul>",
          video: "https://www.youtube.com/embed/o_uEHxObE6E",
          quiz: [
            { q: "In WPILib command-based, persistent robot state lives in:", options: ["A static class accessible globally", "The Subsystem, not in Commands", "The RobotContainer class"], answer: 1 },
            { q: "Tunable constants like PID gains should be:", options: ["Hardcoded as final values before competition", "Stored in NetworkTables for on-the-fly tuning", "Commented out and re-entered each competition day"], answer: 1 },
            { q: "Code must pass peer review from at least:", options: ["Three other programmers", "One other programmer before merging to main", "The lead mentor only"], answer: 1 }
          ]
        },
        {
          id: "ctrl-5",
          title: "Sensors and Closed-Loop Control",
          notes: "<h4>Sensors and Feedback Loops</h4><p>Reliable autonomous and assisted teleop require well-tuned sensor feedback:</p><ul><li><strong>Encoders</strong> measure wheel/mechanism rotation. Always document encoder CPR and gear ratio for distance calculations.</li><li><strong>Limit switches</strong> define hard endpoints for mechanisms. Wire as <strong>normally closed (NC)</strong> — a disconnected wire triggers the limit, preventing runaway.</li><li>Camera-based vision (Limelight/PhotonVision) requires a calibrated pipeline — test at the <em>field's</em> lighting conditions, not just the lab.</li><li>All sensor wiring must be shielded or routed away from high-current motor wires to prevent noise.</li><li>PID tuning: start with kI = kD = 0, tune <strong>kP first</strong>, then add derivative to reduce oscillation.</li></ul>",
          video: "https://www.youtube.com/embed/MNgHkXicwM4",
          quiz: [
            { q: "Limit switches should be wired as:", options: ["Normally open (NO) — current flows when triggered", "Normally closed (NC) — a wire break triggers the limit", "Either way — configured in software"], answer: 1 },
            { q: "When starting PID tuning, the first parameter to tune is:", options: ["kD (derivative)", "kI (integral)", "kP (proportional)"], answer: 2 },
            { q: "Vision pipelines for competition should be calibrated:", options: ["Only in the school lab lighting", "At the event's field lighting conditions", "Once during initial setup, never changed"], answer: 1 }
          ]
        },
        {
          id: "ctrl-6",
          title: "Competition Electrical Checklist",
          notes: "<h4>Pre-Match Electrical Verification</h4><p>A systematic pre-match check prevents avoidable match failures. Run this checklist before every match:</p><ul><li>✓ Battery voltage above <strong>12.5 V</strong> (measured with the team voltmeter, not DS reported voltage).</li><li>✓ All <strong>CAN IDs verified</strong> in the DS diagnostics pane — no yellow or red indicators.</li><li>✓ All <strong>breakers fully seated</strong> — gently press each PDP breaker to confirm engagement.</li><li>✓ No loose or disconnected wires visible during 360° robot inspection.</li><li>✓ Radio powered and linked — DS shows <strong>green \"Robot\" indicator</strong> before leaving pit.</li><li>✓ Main breaker accessible and unobstructed per game manual requirements.</li></ul>",
          video: "https://www.youtube.com/embed/K6jopFVWxPg",
          quiz: [
            { q: "Minimum acceptable battery voltage before a match is:", options: ["11.0 V", "12.5 V", "13.0 V"], answer: 1 },
            { q: "PDP breakers should be checked by:", options: ["Visually inspecting from a distance", "Gently pressing each breaker to confirm it is fully seated", "Running the robot at full power for 10 seconds"], answer: 1 },
            { q: "Before leaving the pit, the DS must show:", options: ["Yellow 'Communications' indicator", "Green 'Robot' indicator", "Any color indicator other than red"], answer: 1 }
          ]
        }
      ]
    },
    {
      key: "fabrication",
      title: "Fabrication",
      icon: "fabrication",
      difficulty: "intermediate",
      estimatedTime: "85 min",
      prerequisites: ["safety"],
      owner: "Manufacturing Team",
      modulePage: "modules/fabrication.html",
      outcome: "Produce safe, accurate parts with repeatable quality.",
      sections: [
        {
          id: "fab-1",
          title: "Measurement and Precision",
          notes: "<h4>Accurate Measurement</h4><p>Precise measurement is the foundation of quality fabrication. FRC 10332 measurement standards:</p><ul><li>Use digital calipers (accurate to <strong>±0.001 inch</strong>) for all critical dimensions. Verify calipers are zeroed before use.</li><li>Measure from a <strong>datum reference</strong> — never chain measurements (A to B, B to C) as errors accumulate.</li><li>Take each measurement <strong>three times</strong> independently. If readings vary by more than 0.005 inches, identify the cause before proceeding.</li><li>Mark cut lines with a <strong>scriber</strong> on metal — pencil marks are too wide for precise cuts.</li><li>Record all critical dimensions in the job traveler before fabrication begins.</li></ul>",
          video: "https://www.youtube.com/embed/PfCKY8th6FA",
          quiz: [
            { q: "Digital calipers used at FRC 10332 are accurate to:", options: ["±0.01 inch", "±0.001 inch", "±0.1 inch"], answer: 1 },
            { q: "Measurements should be taken from:", options: ["Any convenient reference point", "A defined datum reference to prevent error accumulation", "The nearest existing hole as a reference"], answer: 1 },
            { q: "Cut lines on metal should be marked with a:", options: ["Pencil (softer, easier to remove)", "Scriber (narrow mark for precision)", "Sharpie marker"], answer: 1 }
          ]
        },
        {
          id: "fab-2",
          title: "Manual Mill Operations",
          notes: "<h4>Milling Machine Use</h4><p>The manual vertical mill is a <strong>yellow-zone machine</strong> requiring prior mentor sign-off. Key procedures:</p><ul><li>Always use a <strong>vice stop and work stop</strong> to prevent workpiece movement during cutting.</li><li>Feeds and speeds: aluminum typically uses <strong>500–1000 RPM</strong> for end mills in this shop — check the speed chart on the machine.</li><li>Use cutting fluid (WD-40 or CNC coolant) on every aluminum cut — dry cutting builds heat and dulls tools rapidly.</li><li>Never leave the machine running unattended — hand must be near the e-stop at all times.</li><li>Always <strong>deburr all edges</strong> after milling — sharp edges are a safety hazard.</li></ul>",
          video: "https://www.youtube.com/embed/Nv5mH7gqViM",
          quiz: [
            { q: "The manual mill is designated as which zone?", options: ["Green zone (open access)", "Yellow zone (mentor sign-off required)", "Red zone (authorized only)"], answer: 1 },
            { q: "Cutting fluid during aluminum milling is used to:", options: ["Improve surface finish only", "Prevent heat buildup and extend tool life", "Help the work stop grip better"], answer: 1 },
            { q: "After milling, all edges must be:", options: ["Left as-is for the assembly team", "Deburred to remove sharp edges", "Painted to prevent corrosion"], answer: 1 }
          ]
        },
        {
          id: "fab-3",
          title: "Lathe and Turning Operations",
          notes: "<h4>Lathe Operations</h4><p>The lathe is a <strong>red-zone machine</strong>. Only authorized members may operate it. Key procedures:</p><ul><li>Never wear gloves or loose clothing near the lathe — entanglement hazard.</li><li>Work extending more than <strong>3× the stock diameter</strong> from the chuck must be supported with a tailstock center.</li><li>Facing and turning passes: take maximum <strong>0.050-inch depth of cut</strong> per pass on aluminum with the shop lathe.</li><li>Always stop the lathe completely before measuring the workpiece — never use calipers on a rotating part.</li><li>Parts must be within <strong>0.005 inch</strong> of the drawing dimension for all bearing and shaft interfaces.</li></ul>",
          video: "https://www.youtube.com/embed/n3R3i4W7qrM",
          quiz: [
            { q: "The lathe is designated as which zone?", options: ["Yellow zone", "Green zone", "Red zone"], answer: 2 },
            { q: "Work extending more than 3× the stock diameter must be supported by:", options: ["A longer chuck jaw set", "A tailstock center", "Hand-holding at the far end"], answer: 1 },
            { q: "When should you measure a workpiece on the lathe?", options: ["While it is spinning slowly for convenience", "Only after completely stopping the lathe", "Every 3 passes regardless of lathe state"], answer: 1 }
          ]
        },
        {
          id: "fab-4",
          title: "CNC, Laser, and 3D Printing",
          notes: "<h4>Computer-Driven Fabrication</h4><p>CNC, laser, and 3D printers extend the team's manufacturing capabilities significantly:</p><ul><li><strong>CNC Router:</strong> All CAM files must be reviewed by a senior fab member before running. Use simulation mode to verify toolpaths before cutting real material.</li><li><strong>Laser Cutter:</strong> Never leave unattended. Maximum material: 0.25-inch wood, 0.080-inch acrylic. No metals, PVC, or foams.</li><li><strong>3D Printing:</strong> Structural parts must use <strong>PETG or ABS</strong> (not PLA) at minimum <strong>40% infill</strong>. Label all print files with material, infill, and print date.</li><li>All CNC-produced parts must be inspected against the drawing before use in assembly.</li></ul>",
          video: "https://www.youtube.com/embed/6NG3AUmTy9k",
          quiz: [
            { q: "Structural 3D-printed FRC parts must use:", options: ["PLA at 20% infill (fastest print)", "PETG or ABS at minimum 40% infill", "Any material at 100% infill"], answer: 1 },
            { q: "Before running CNC router code on real material, you must:", options: ["Just press start — the code was CAD-generated", "Review in simulation mode to verify toolpaths", "Run it on scrap material first without simulation"], answer: 1 },
            { q: "The laser cutter must:", options: ["Never be left unattended during operation", "Only be operated by mentors", "Only cut wood materials"], answer: 0 }
          ]
        },
        {
          id: "fab-5",
          title: "Fasteners and Assembly Hardware",
          notes: "<h4>Fastener Standards</h4><p>Using the correct fastener in the correct way prevents structural failures under competition loads:</p><ul><li>All structural fasteners are <strong>10-32 or ¼-20</strong> stainless or Grade 5 steel. Never substitute zinc hardware-store bolts.</li><li>Apply <strong>Loctite Blue (242)</strong> to all fasteners that may vibrate loose. Do not use Red (271) on field-replaceable parts.</li><li>Minimum thread engagement: <strong>1.5× the bolt diameter</strong> into any tapped hole (e.g., ¼-20 needs ≥ 0.375 inch).</li><li>Always use a washer under bolt heads and nuts for load distribution unless the drawing specifies otherwise.</li><li>Torque all critical fasteners to spec using a calibrated torque wrench — never by feel.</li></ul>",
          video: "https://www.youtube.com/embed/K2tnrYt3r-w",
          quiz: [
            { q: "Structural fasteners at FRC 10332 should be:", options: ["Standard zinc hardware-store bolts", "10-32 or ¼-20 stainless or Grade 5 steel", "Any bolt that physically fits the hole"], answer: 1 },
            { q: "Loctite Blue (242) is applied to fasteners that:", options: ["Must never be removed in the field", "May vibrate loose during robot operation", "Are used in the pneumatics system only"], answer: 1 },
            { q: "Minimum thread engagement for a ¼-20 bolt is:", options: ["0.250 inches", "0.375 inches (1.5× bolt diameter)", "0.500 inches for all bolt sizes"], answer: 1 }
          ]
        },
        {
          id: "fab-6",
          title: "Part Inspection and Quality Control",
          notes: "<h4>Inspection and Sign-Off</h4><p>Every custom part must be inspected before assembly. The fabrication QC process:</p><ul><li>Complete a <strong>first-article inspection</strong> on the first part of any new design — measure all critical dimensions against the drawing.</li><li>Use the <strong>job traveler form</strong> to record all measurements, any deviations, and the inspector's initials.</li><li>Parts with deviations greater than the drawing tolerance are <strong>quarantined</strong> (red tag) until reviewed by the design lead.</li><li>Quarantined parts may be approved with a written deviation note or scrapped — no verbal-only approvals.</li><li>Target <strong>first-pass yield ≥ 90%</strong>. If yield drops below this, trigger a root-cause investigation.</li></ul>",
          video: "https://www.youtube.com/embed/Y0xHN5FIheM",
          quiz: [
            { q: "A first-article inspection is performed on:", options: ["Every single part made", "Only the first part of a new design", "The last part before assembly"], answer: 1 },
            { q: "Parts with out-of-tolerance dimensions are:", options: ["Approved by the fabricator who made them", "Quarantined with a red tag and reviewed by the design lead", "Scrapped immediately without further review"], answer: 1 },
            { q: "The target first-pass yield for fabricated parts is:", options: ["70%", "80%", "90%"], answer: 2 }
          ]
        }
      ]
    },
    {
      key: "art",
      title: "Art",
      icon: "art",
      difficulty: "beginner",
      estimatedTime: "55 min",
      prerequisites: ["safety","business-media"],
      owner: "Brand + Aesthetic Team",
      modulePage: "modules/art.html",
      outcome: "Maintain visual identity across robot, pit, and media assets.",
      sections: [
        {
          id: "art-1",
          title: "Team Brand Standards",
          notes: "<h4>Living the Brand</h4><p>Visual consistency across all materials makes FRC 10332 look professional to judges and sponsors:</p><ul><li>The official logo has three variants: full color, white-on-navy, and embossed silver. Use the correct variant for each context.</li><li>Official colors: <strong>Navy #071a33</strong> and <strong>Silver #bfc8d4</strong>. Always use exact hex codes in digital work — never approximate.</li><li>The wordmark \"FORGE\" must always appear in <strong>Rajdhani Bold, uppercase</strong>. Never stretch, rotate, or recolor it.</li><li>All print or published materials must be reviewed using the <strong>brand compliance checklist</strong> before submission.</li></ul>",
          video: "https://www.youtube.com/embed/mH2jK6TNTLQ",
          quiz: [
            { q: "The official team silver color hex code is:", options: ["#c0c0c0 (generic silver)", "#bfc8d4 (official team silver)", "#999999 (medium gray)"], answer: 1 },
            { q: "The team wordmark 'FORGE' must always appear in:", options: ["Rajdhani Bold, uppercase", "Space Grotesk, title case", "Any bold sans-serif font for flexibility"], answer: 0 },
            { q: "Before printing or publishing, materials must be reviewed using the:", options: ["Design team's personal style guide", "Brand compliance checklist", "Captain's informal approval only"], answer: 1 }
          ]
        },
        {
          id: "art-2",
          title: "Color Theory and Typography",
          notes: "<h4>Effective Visual Communication</h4><p>Well-designed materials are more persuasive and more readable. Core principles for team materials:</p><ul><li><strong>Contrast ratio:</strong> all body text must meet <strong>WCAG AA standard</strong> (minimum 4.5:1 contrast ratio). Use a contrast checker before finalizing layouts.</li><li>Limit each layout to <strong>two typeface families</strong> maximum — one for headings (Rajdhani), one for body (Space Grotesk).</li><li>Use white space intentionally — approximately <strong>40% of a page or slide</strong> should be empty to allow content to breathe.</li><li>Accent colors used beyond the primary navy/silver palette must be approved by the brand lead.</li></ul>",
          video: "https://www.youtube.com/embed/j4Anh5mRkl8",
          quiz: [
            { q: "The minimum contrast ratio for body text (WCAG AA) is:", options: ["2:1", "3:1", "4.5:1"], answer: 2 },
            { q: "A well-designed layout should have approximately __ of empty space:", options: ["10%", "40%", "70%"], answer: 1 },
            { q: "FRC 10332 materials use how many typeface families maximum?", options: ["One", "Two", "As many as needed for visual interest"], answer: 1 }
          ]
        },
        {
          id: "art-3",
          title: "Pit Display Design",
          notes: "<h4>Designing the Competition Pit</h4><p>The pit is the team's brand experience during events. Layout and design standards:</p><ul><li>The pit layout must be approved by the design lead no later than <strong>2 weeks before the event</strong>.</li><li>All printed displays must use <strong>300 DPI minimum</strong> resolution to avoid pixelation on large-format prints.</li><li>Sponsor logos are sized by contribution tier. Tier 1 (lead) sponsors receive largest placement.</li><li>Lighting: use directed LED strips on the pit frame — color temperature <strong>4000–5000 K</strong>.</li><li>Ensure all printed materials have a <strong>3 mm bleed</strong> beyond the trim mark for professional print quality.</li></ul>",
          video: "https://www.youtube.com/embed/cWuT0PZsE4E",
          quiz: [
            { q: "Minimum print resolution for large-format pit displays is:", options: ["72 DPI (screen resolution)", "150 DPI", "300 DPI"], answer: 2 },
            { q: "The pit layout must be approved how far in advance of the event?", options: ["The night before", "2 weeks before", "1 month before"], answer: 1 },
            { q: "Print files must include a bleed of:", options: ["No bleed needed if printed on a team printer", "3 mm beyond the trim mark", "10 mm for safety margin"], answer: 1 }
          ]
        },
        {
          id: "art-4",
          title: "Robot Aesthetics and Decals",
          notes: "<h4>Robot Decal Application</h4><p>The robot's appearance is judged and matters to sponsors. Proper decal application ensures longevity:</p><ul><li>All surfaces receiving decals must be <strong>cleaned with isopropyl alcohol (91%+)</strong> and allowed to dry fully before application.</li><li>Apply decals in a temperature of <strong>65–85°F</strong> — cold surfaces cause adhesive failure.</li><li>Use an application squeegee to eliminate air bubbles — work from center outward in smooth strokes.</li><li>Sponsor decals must follow the <strong>approved placement plan</strong> — do not apply sponsor logos without verification.</li><li>Allow <strong>24 hours</strong> after application before exposing decals to water, cutting fluid, or competition impacts.</li></ul>",
          video: "https://www.youtube.com/embed/8J42Bv6C8gI",
          quiz: [
            { q: "Before applying decals, surfaces must be cleaned with:", options: ["Soap and water", "Isopropyl alcohol (91%+)", "A dry cloth only"], answer: 1 },
            { q: "Decals should be applied in what temperature range?", options: ["Any temperature if applied carefully", "40–65°F (cool surfaces help adhesion)", "65–85°F (too cold causes adhesive failure)"], answer: 2 },
            { q: "After applying decals, how long before exposing to water or impacts?", options: ["1 hour", "24 hours", "Immediately — decals are fully cured on contact"], answer: 1 }
          ]
        },
        {
          id: "art-5",
          title: "Digital and Social Media Assets",
          notes: "<h4>Creating Digital Assets</h4><p>Consistent, high-quality digital assets reinforce the brand across all platforms:</p><ul><li>Social media graphics must be created at the <strong>platform's native resolution</strong> (Instagram: 1080×1080, Stories: 1080×1920, Twitter/X: 1200×675).</li><li>Export all social graphics as <strong>PNG</strong> (for graphics with text) or JPEG at 90%+ quality (for photos).</li><li>All editable source files (.ai, .psd, .fig) must be saved to the <strong>team brand drive</strong>, not just exported versions.</li><li>Animated content (GIFs, Reels) must be reviewed by the media lead before publishing.</li><li>Never use unlicensed stock photography — use the team's original photos or approved royalty-free sources.</li></ul>",
          video: "https://www.youtube.com/embed/0eJkPFYRJhw",
          quiz: [
            { q: "Social media graphics with text should be exported as:", options: ["JPEG for all uses", "PNG for crisp text and transparency", "GIF for compatibility"], answer: 1 },
            { q: "Editable source files (.ai, .psd, .fig) must be saved to:", options: ["The creator's personal computer only", "The team brand drive (not just the exported final)", "Google Photos for easy sharing"], answer: 1 },
            { q: "Photos used in team materials must be:", options: ["Downloaded from the first Google Images result", "The team's original photos or approved royalty-free sources", "Any image found online if credited"], answer: 1 }
          ]
        },
        {
          id: "art-6",
          title: "Print, Banners, and Signage",
          notes: "<h4>Print Production Standards</h4><p>Professional print materials require proper file setup and vendor coordination:</p><ul><li>All print files must be submitted as <strong>PDF/X-1a</strong> format with embedded fonts and CMYK color mode.</li><li>Banner files require <strong>150 DPI minimum</strong> at final print size (lower than display graphics due to viewing distance).</li><li>Allow a minimum of <strong>3 business days</strong> lead time for any print order — rush fees come out of the team budget.</li><li>Proof-read every print file at <strong>200% zoom</strong> before submitting — small text errors are invisible at standard zoom.</li><li>After receiving prints, compare against the digital file for color accuracy. Approve before paying the vendor.</li></ul>",
          video: "https://www.youtube.com/embed/jRFXXRl5niE",
          quiz: [
            { q: "Print files must be submitted in what format?", options: ["PNG at 300 DPI", "PDF/X-1a with embedded fonts and CMYK colors", "RGB JPEG for color accuracy"], answer: 1 },
            { q: "Minimum lead time for any print order is:", options: ["Same day if urgent", "3 business days", "1 business day for digital printing"], answer: 1 },
            { q: "Before submitting a print file, proof-read it at:", options: ["100% zoom (normal view)", "200% zoom to catch small text errors", "50% zoom to see the full layout"], answer: 1 }
          ]
        }
      ]
    }
  ]
};
