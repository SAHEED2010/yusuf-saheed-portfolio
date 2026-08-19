# Portfolio Context

This is the shared language for Yusuf Saheed's personal portfolio. It keeps public identity, proof, and visitor actions distinct from implementation details.

## Language

**Portfolio**:
Yusuf Saheed's public body of selected work, capabilities, evidence, and contact paths. It is a personal presentation, not the CodedDevs company website or a generic project catalogue.

**Owner**:
Yusuf Saheed, the person whose work, experience, and contact path the portfolio represents.
_Avoid_: Portfolio owner, brand

**Public identity**:
The concise professional frame used to introduce Yusuf: "Engineering, Science & AI."
_Avoid_: Full-stack developer as the sole headline

**Supporting areas**:
Software Engineering, Artificial Intelligence, Computer Science, Emerging Technologies, Research, Product Development, and Entrepreneurship.
_Avoid_: Presenting every area as an equal headline

**Public email**:
The approved email address visitors may use to contact Yusuf: `yusufsaheed2012@gmail.com`.
_Avoid_: Treating a Google workspace or administrator login as a public contact address

**Public phone**:
The approved phone number visitors may use to contact Yusuf: `08106249995`, normalized internationally as `+2348106249995`.
_Avoid_: Publishing a placeholder number or exposing the number in unrelated telemetry

**WhatsApp contact**:
The approved direct contact route using `+2348106249995` and the professional prefilled message: "Hello Yusuf, I found your portfolio and would like to discuss a technology project or opportunity with you."
_Avoid_: An empty WhatsApp link that gives visitors no context

**Support link**:
An optional route for visitors who want to support Yusuf's public teaching, research, and open work. The approved visible route is `https://buymeacoffee.com/yusufsaheed` and must remain editable from the dashboard. The external account still needs payout setup before it can receive support.
_Avoid_: Presenting support as payment for unavailable services

**Visitor**:
A person evaluating Yusuf's work, capabilities, or fit for an opportunity.

**Project**:
A selected piece of work presented as evidence. It explains the context, Yusuf's contribution, and the result rather than only naming technologies.

**Project template**:
A presentation pattern for a project type, such as a product system, research experiment, tool, team or startup project, or achievement. A template controls which evidence and story fields are expected; it does not replace the project's content.

**Selected systems**:
The public label for Yusuf's strongest products, experiments, tools, and shipped work. It replaces generic labels such as experience built when the portfolio is describing evidence rather than employment history.

**Case study**:
A deeper project account connecting a problem, Yusuf's decisions and contribution, the work performed, and the outcome.

**Evidence**:
Concrete support for a claim, such as shipped work, source code, screenshots, links, verified metrics, verified recognition, or a clearly described contribution.

**Team work**:
A project built with collaborators and presented with Yusuf's exact role distinguished from the team's combined outcome.
_Avoid_: Describing a team project as solo work

**Full-stack portfolio**:
The complete portfolio product, including its public experience, server-side capabilities, persistent content, authentication, administration, and approved AI features.
_Avoid_: Using full-stack to mean only a long single-page portfolio

**Admin dashboard**:
Yusuf's private interface for creating, editing, organizing, previewing, publishing, and removing portfolio content without changing source code.
_Avoid_: Hardcoded content as the normal editing workflow

**AI assistant**:
An assistant grounded in Yusuf-approved information that helps visitors understand his work and helps Yusuf manage portfolio content within explicit permissions.
_Avoid_: Giving unauthenticated visitors content-editing capabilities

**Visitor assistant**:
The public, read-only assistant that identifies itself as Yusuf's AI portfolio assistant and answers questions using approved published evidence.
_Avoid_: Impersonating Yusuf or exposing drafts and private information

**Admin assistant**:
The private assistant available only inside the authenticated admin dashboard. It may prepare content changes but cannot publish them without Yusuf's confirmation.
_Avoid_: Direct, unreviewed publishing

**Suggested question**:
A curated question visitors can ask without consuming their custom-question allowance.
_Avoid_: Frequently asked question

**Custom question**:
A visitor-written question submitted to the visitor assistant. Each visitor may submit up to five custom questions in a rolling 24-hour period.

**Approved social source**:
A public social profile Yusuf has explicitly allowed the portfolio to read as assistant context. Approval never includes private messages or permission to publish.
_Avoid_: Social media account access

**Primary action**:
The single next step the portfolio most wants a visitor to take, such as contacting Yusuf, viewing a case study, or opening a live product.

**Library**:
The public collection for Yusuf's Tutorials, Research & Publications, Tough Questions, Videos & Resources, and Hackathons & Achievements.
_Avoid_: Forcing all educational, scientific, and reflective material into either "Research" or "Writing"

**Verified metric**:
A numerical claim supported by an approved source and labeled with its source or synchronization time. GitHub activity may synchronize from GitHub; project, publication, and achievement counts derive from published dashboard content.
_Avoid_: Hardcoded achievement claims without evidence

**Developer activity**:
Live or recently synchronized GitHub and WakaTime data shown with its source and refresh time. GitHub data is fetched server-side through GitHub APIs; WakaTime data uses a server-only API token.
_Avoid_: Static contribution artwork, invented streaks, browser-exposed API keys, or treating coding time as a quality score

**Newsletter subscriber**:
A visitor who has explicitly opted in to receive notifications about Yusuf's published articles, research, publications, or other selected releases. Subscription requires verification, includes an unsubscribe path, and does not grant access to private content.

**Global time display**:
A small live indication of Yusuf's current local time in Lagos, Nigeria (West Africa Time), presented as context for an international audience rather than as a hardcoded timestamp.

**Content source**:
The approved origin of a public fact or content item, such as dashboard content, a public GitHub profile, WakaTime synchronization, or a linked evidence document. A source is shown or recorded when freshness or provenance matters.

## Current decisions

- The selected homepage direction is **Direction A: Signal Lab**.
- The public experience must support both dark and light themes.
- Atlas leads the initial project sequence. Other projects appear only after their role, status, and evidence are clear.
- The visitor audience includes recruiters, collaborators, founders, business owners and other people seeking technology solutions, learners, and science or research audiences.
- The main content collection is named **Library** and uses the five content types defined above.
- Yusuf's approved public profiles are GitHub, LinkedIn, X (`https://x.com/yusufsaheed01`), email, WhatsApp, and Buy Me a Coffee.
- Buy Me a Coffee remains visible as requested, while payout setup remains an external operational task.
- The production product is one full-stack **multi-page** Next.js App Router application with distinct public routes, an authenticated admin dashboard, and separate public and private assistant permission boundaries. It must not behave as a one-page-only SPA.
- Public content is structured and admin-managed. Projects, Library items, achievements, profile details, navigation, support links, newsletter settings, and footer content must be editable without code changes.
- Projects use reusable presentation templates with shared evidence fields and type-specific sections. The homepage, index pages, and case studies read the same approved content records.
- The site shows Lagos local time as a live global-context signal, and the Buy Me a Coffee action remains visible in both the contact system and a prominent support placement.
- Newsletter signup uses explicit consent, verification, unsubscribe, and delivery-status handling before production notifications are enabled.
- GitHub and WakaTime activity must be synchronized from their APIs through server-side integrations with caching, refresh timestamps, and graceful unavailable states.
- Production delivery requires GitHub Actions, review checks, CodeRabbit, protected branches, preview deployment, controlled production deployment, and security automation.
