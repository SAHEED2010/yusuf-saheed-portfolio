# Portfolio Source Audit

Audited: 2026-08-18

This note records what first-party sources currently support for Yusuf Saheed's portfolio. Repository descriptions and README files are useful evidence of scope, but they do not by themselves prove production adoption, business outcomes, awards, or Yusuf's exact contribution to collaborative work.

## Confirmed identity sources

- GitHub profile: [SAHEED2010](https://github.com/SAHEED2010)
- LinkedIn URL supplied by Yusuf: [yusuf-saheed123](https://www.linkedin.com/in/yusuf-saheed123/)
- GitHub organization: [coded-devs](https://github.com/coded-devs)
- CodedDevs' first-party repository identifies the company as CODEDDEVS TECHNOLOGY LTD, located in Lagos, and lists `https://codeddevs.com` as its live URL. The local source is `C:/Users/USER/Desktop/website/README.md`.

The approved public contact and profile set is:

- Email: `yusufsaheed2012@gmail.com`
- Phone/WhatsApp: `08106249995` / `+2348106249995`
- LinkedIn: `https://www.linkedin.com/in/yusuf-saheed123/`
- X: `https://x.com/yusufsaheed01`
- GitHub: `https://github.com/SAHEED2010`
- Buy Me a Coffee candidate: `https://buymeacoffee.com/yusufsaheed`

The Buy Me a Coffee page is live and Yusuf wants the route visible in the portfolio. The signed-in creator view still states that a payout method must be set up before Yusuf can receive support, and the page currently presents a follow form rather than a payment panel. Treat payout setup as an operational blocker, but keep the requested external route visible without claiming that payments are already enabled.

The GitHub CLI is authenticated as `SAHEED2010`. GitHub GraphQL reported **140 contributions** from 1 September 2025 through 18 August 2026, and GitHub reported **48 public repositories** at the time of audit. These are snapshots, not permanent copy; production must fetch and cache fresh values server-side.

WakaTime integration check on 18 August 2026: the WakaTime VS Code extension is installed and a local `.wakatime.cfg` exists, but its contents were not inspected. The signed-in Chrome session reached the WakaTime homepage in a logged-out state, and no public WakaTime profile was verified. Production should keep the activity state as unavailable until Yusuf configures a server-only WakaTime API token; do not publish coding hours or infer quality from activity volume.

## Local document evidence

The current CV at `C:/Users/USER/Downloads/Yusuf_Saheed_CV_FINAL (1).pdf` is a useful interview and sourcing guide, but it is self-authored. Claims appearing only in the CV must not be treated as independently verified portfolio facts.

### Independently supported

- A GOMYCODE certificate names Yusuf Saheed and confirms completion of the **Software Development Bootcamp with AI Skills** course on **13 December 2025**. The certificate also displays state-approved training center number `11-1940-2`. Local source: `C:/Users/USER/Downloads/Yusuf Saheed-Software Development Bootcamp with AI skills Certificate of Completion (1).pdf`.
- An official 2026 JAMB result slip names Yusuf Saheed Akanbi and confirms an aggregate UTME score of **294**, with University of Lagos Systems Engineering as the first choice. The document contains sensitive personal data and must not be published, embedded, or linked from the portfolio. Only the aggregate score and academic direction may be used publicly. Local source: `C:/Users/USER/Downloads/Yusuf_Saheed_Akanbi_Result_Slip.PDF`.
- A Nomba certificate names Yusuf Saheed and confirms completion of the **Nomba Developer Certification through the Nomba x DevCareer Hackathon 2026**, issued **29 June 2026** with certificate ID `NMB-2026-74IU7K`. This proves certification completion, not a hackathon placement or StorePass submission result. Local source: `C:/Users/USER/Downloads/nomba-certified-NMB-2026-74IU7K.png`.
- A GDG Lagos ticket was issued to **Saheed Yusuf** for the **Build With AI Lagos Buildathon**, scheduled for 29-30 May 2026 at Learn2Earn HQ in Lagos. This proves registration/ticket issuance only; it does not prove attendance, participation, a completed project, or an award. Local source: `C:/Users/USER/Downloads/GDG_HACKATHON`.
- Two WhatsApp images support Yusuf's registration for, and stated intention to attend, the **234 AI Hackathon & Commerce Fusion** event. They do not prove attendance, a WIZZA submission, or the claimed second-place result. Local sources: `C:/Users/USER/Downloads/WhatsApp Image 2026-06-12 at 10.22.52.jpeg` and `C:/Users/USER/Downloads/WhatsApp Image 2026-06-12 at 10.48.28.jpeg`.

### Present in the CV but still requiring proof

- Four hackathon placements in 2026: Africa's Talking BuildWithAI Lagos first place, Pan-African finals first place, 234 AI Hackathon second place, and Africa's Talking Monthly Hackathon third place.
- The associated DialAI, Swifta, WIZZA, and Hardware-OS contribution and placement narratives.
- Completion of the Future Interns software-engineering internship.
- Exact age and age-at-achievement statements.
- Attendance at the GDG Lagos buildathon.

The local `Hackathon Post.png` contains only DevCareer and Nomba branding and does not identify Yusuf, a placement, or a submitted project. `Hackathon Playbook.docx` and `Hackathonfile_prompt.txt` are planning materials rather than achievement evidence.

The initial local filename and text scan found no IYMC certificate, IAAC certificate, award notice, publication manuscript, or publication acceptance record. These remain evidence gaps rather than negative findings.

`C:/Users/USER/Downloads/Yusuf Saheed .jpg.jpeg` is a high-resolution, clean-background portrait and is the leading local headshot candidate. It should not be copied into the production project until Yusuf confirms that this is the image he wants published.

The CV also conflicts with approved portfolio decisions by using the title **CTO** and an `@email.com` address. The public portfolio should continue to use **Co-founder** and `yusufsaheed2012@gmail.com` unless Yusuf explicitly changes those approved details.

## Strongest project candidates

### Twizrr

Sources: [repository](https://github.com/SAHEED2010/Twizrr-Mvp), [repository README](https://github.com/SAHEED2010/Twizrr-Mvp#readme)

- Public repository owned by Yusuf's GitHub account.
- Described as a Nigerian social-commerce marketplace for shoppers and store owners, with WhatsApp discovery and buyer protection.
- The README documents a substantive TypeScript monorepo: a NestJS API, Next.js application, shared types, PostgreSQL with pgvector, Redis/BullMQ, Prisma migrations, payment and delivery boundaries, and deployment checks.
- GitHub currently attributes the repository's single visible commit to `SAHEED2010`. This may be an imported or squashed history, so a case study still needs Yusuf's account of what he designed and implemented.
- Do not publish adoption, transaction, user, or revenue claims without supplied evidence.

Recommendation: flagship product candidate, pending Yusuf's contribution narrative, current product status, screenshots, and live URL confirmation.

### Atlas

Sources: [repository](https://github.com/coded-devs/Atlas), [live demo linked by the repository](https://atlas-fivetran.streamlit.app/)

- Public CodedDevs repository built for the Google Cloud Rapid Agent Hackathon 2026, Fivetran track.
- GitHub attributes all 31 visible commits to `SAHEED2010`.
- The project analyzes the downstream impact of schema changes with Gemini, a Fivetran-compatible tool layer, deterministic lineage and severity logic, a human approval gate, and a Streamlit interface.
- The README explicitly says the demo uses curated in-memory fixtures rather than live Fivetran credentials. The portfolio should preserve that distinction.
- A hackathon placement or award is not currently evidenced.

Recommendation: strongest confirmed AI/agent engineering case study candidate.

### Home Science Association portal

Sources: [repository](https://github.com/SAHEED2010/Home-Science-Association), [live URL linked by GitHub](https://home-science-association.vercel.app/)

- Public repository owned by Yusuf's account with a Next.js frontend and Node.js/Express/MongoDB backend.
- The README describes role-based school administration, attendance, assignments, exams, fees, announcements, and multi-branch support.
- GitHub attributes the single visible commit to `SAHEED2010`; exact origin, client relationship, production status, and Yusuf's role require confirmation.
- Default credentials and organization-specific claims in the README should not be copied into the public portfolio.

Recommendation: supporting full-stack project after ownership, permission, and current live-state confirmation.

### JAMB Center Locator

Source: [repository](https://github.com/SAHEED2010/jambmap)

- Next.js/TypeScript application for finding JAMB registration centers by name, town, state, geolocation, and Google Maps directions.
- GitHub attributes three visible commits to `onerandomd3v` and one to `SAHEED2010`.
- Yusuf confirmed that `onerandomd3v` is not his alternate account. Yusuf's specific contribution is still unresolved.

Recommendation: supporting project only after contribution attribution is clarified.

## Collaborative projects needing attribution

### DialAI

Source: [repository](https://github.com/coded-devs/dial-ai)

- Offline-access AI healthcare-assistance demo using USSD, SMS, voice, Africa's Talking, Gemini, Node.js, and Next.js.
- The README frames it as an Africa's Talking Hackathon project for low-connectivity communities.
- GitHub's contributor endpoint currently attributes visible commits to `onerandomd3v` and `amoomustakim-hue`, not `SAHEED2010`. Yusuf confirmed that `onerandomd3v` is not his alternate account.

Do not present DialAI as Yusuf's work until his role or alternate GitHub identity is confirmed.

### Wahala

Source: [repository](https://github.com/coded-devs/Wahala)

- GitHub attributes two scaffold commits to `SAHEED2010`.
- The README explicitly says there is no application code yet and describes only a planned WhatsApp commerce AI assistant.

Recommendation: exclude from the first portfolio release unless the project has progressed elsewhere and Yusuf supplies current evidence.

## CodedDevs relationship

First-party company code and documentation describe CodedDevs as a Lagos-based product company building software, payment, and AI products for African markets. The company website code states there are three founders and explicitly names Kareem Aliameen, Yusuf Saheed, and Amoo Mustakheem.

This supports describing Yusuf as a CodedDevs founder. Use "Co-founder" as the role. The company can remain supporting context without making its URL a prominent portfolio action in the first release.

## Explicitly excluded

- [LineageGuard](https://github.com/coded-devs/lineageguard) is not Yusuf's project and must not appear as his work.

## Current editorial conclusion

The evidence supports a portfolio led by engineering depth and practical AI systems rather than a generic list of web-development skills. The strongest current sequence is:

1. Atlas as the clearest verified AI/agent engineering story.
2. Twizrr after contribution and current-status details are supplied.
3. One verified supporting project, likely the school portal or JAMB locator.
4. CodedDevs as company-building context, not as the portfolio's dominant identity.

DialAI may become an addition only after Yusuf's exact contribution is established. LineageGuard is excluded.
