# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** owners and directors of manufacturing and other mid-sized firms in Bosnia and Herzegovina who run operations on spreadsheets, disconnected tools, and paper. They are buying certainty, not technology: they want to stop reconciling three versions of the same number.

**Secondary:** IT managers and operations leads who evaluate whether a vendor can actually integrate with what already runs; and firms that need a website, web app, or mobile app and are deciding between an agency and a software house.

**Their situation:** the evaluation happens in a browser, often late, often on a phone, often while comparing two or three vendors. They give a page a few minutes before deciding whether to send an inquiry.

## Product Purpose

A single page that shows, within a few minutes, what ShadowDev builds, what kind of work it does, and why it can be trusted — ending in one clear contact action. Success is a qualified inquiry, not a pageview.

## Positioning

ShadowDev connects the systems a firm already runs into one working whole: ERP, MES, custom integrations, web, mobile, and marketing from one partner. The claim is integration and continuity — one partner, one system, everything connected — not a longer service list than the competition.

## Operating Context

- Manufacturing clients live with work orders, machines, shifts, warehouse stock, and production reporting; the vocabulary of the page must be theirs, not the vendor's.
- The offer spans six areas: ERP (finance, procurement, warehouse, HR), MES (production tracking), custom software and integrations, websites and web apps, mobile apps, digital marketing.
- Sales conversations start with an analysis of what already exists; this page is the first step of that process, not a self-service product.
- Content language is Bosnian (ijekavian), with an optional English switch.
- The name and slogan are fixed: **ShadowDev**, **OneForAll** ("one partner, one system, everything connected").

## Capabilities and Constraints

- Static single page, built with Astro; 3D via Three.js, animation via GSAP ScrollTrigger, smooth scroll via Lenis.
- Must work fully without WebGL and under `prefers-reduced-motion`.
- Must be usable at 375 px; must hold WCAG AA contrast, keyboard operation, visible focus.
- Contact form is a static-site form (Netlify Forms style). No server side, no secrets in the bundle.
- Claims about security are limited to what is operationally true: role-based access, change logs, backups. No invented certificates, no invented client names, no invented metrics.
- Undecided, to be supplied by the client: real contact details, domain, client references, and numbers.

## Brand Commitments

- Name **ShadowDev**, slogan **OneForAll**. Both fixed.
- Client-supplied logo: orange hexagonal monogram with a custom wide squarish wordmark and the line "ONE FOR ALL" (`public/logo.png`, `public/banner.png`). It is the identity's anchor; the page must not compete with it.
- Required brand colors: **#FF5E1F** (main) and **#FF9911** (secondary). Pinned by the client; not to be replaced.
- Tone: modern, secure, futuristic, advanced, consistent. Trustworthy, not a toy.
- Copy: from the client's point of view, plain words, active verbs. Buttons name the action exactly. One action name used consistently across the page.

## Evidence on Hand

- **Provided:** logo lockup (`public/logo.png`), wordmark banner (`public/banner.png`), brand colors, slogan.
- **Not provided — must stay clearly marked as placeholders:** client names, project references, numeric results, testimonials, certifications, real email, phone, street address, social profiles, domain.
- No stock photography is needed; the visual world is authored, not photographic.

## Product Principles

1. **Show the system working, never claim it.** Every proof on the page is a demonstration or an honest placeholder.
2. **One partner, one system.** Any element that fragments the offer into unrelated services contradicts the product.
3. **Speak the client's language.** Finance, warehouse, work orders, shifts — not frameworks and stacks.
4. **Calm confidence over spectacle.** The one memorable element earns its scale; everything else stays disciplined and readable.
5. **Nothing invented.** No certificate, client, metric, or capability that does not exist.

## Accessibility & Inclusion

WCAG 2.2 AA: semantic structure, one `h1`, visible keyboard focus, contrast-checked palette, labelled form controls with error text tied by `aria-describedby`, canvas marked `aria-hidden` with the full content available as text, and `prefers-reduced-motion` honored by removing the camera journey entirely.
