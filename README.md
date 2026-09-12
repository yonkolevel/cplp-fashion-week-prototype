# CPLP Fashion Week — TinaCMS spike

Throwaway prototype for evaluating TinaCMS as the editing experience for the CPLP Fashion Week homepage. It is **not production code**.

## Run locally

Requirements: Node.js Active LTS and npm.

```bash
npm install
npm run dev
```

Open:

- <http://localhost:3000/> — Portuguese homepage
- <http://localhost:3000/admin/index.html> — TinaCMS visual editor
- <http://localhost:4001/altair/> — local GraphQL playground

The local editor starts in local mode. Changes update the preview immediately and `Save` writes to the repository filesystem; use `Reset` to discard an experiment. No TinaCloud account is needed for local development.

### Route-protection prototype

`middleware.ts` demonstrates route-level protection without restricting the public homepage:

- `/` remains public.
- `/admin` and everything below `/admin/*` use HTTP Basic Authentication when protection is enabled.
- Local development is unprotected by default. To exercise the gate, run:

  ```bash
  CPLP_ADMIN_AUTH=true CPLP_ADMIN_USER=editor CPLP_ADMIN_PASSWORD='use-a-local-password' npm run dev
  ```

- Vercel production deployments enable the gate automatically; set `CPLP_ADMIN_USER` and `CPLP_ADMIN_PASSWORD` as server-side environment variables. Preview deployments can opt in with `CPLP_ADMIN_AUTH=true`.

This is intentionally a throwaway proof of route-level access control, not a production identity system. For production, use an authenticated provider such as Cloudflare Access or a real application auth flow rather than a shared Basic Auth password. Never use `NEXT_PUBLIC_*` for the credentials.

For a production-style smoke build without cloud credentials:

```bash
npm run build-local
```

This command supplies non-secret placeholder values, skips cloud checks, regenerates Tina's admin and types, and runs `next build`. It is only a build check; it does not publish content.

## What is editable

The schema intentionally exposes only the fields needed to judge the homepage workflow:

- **Global:** header name, navigation links, social links and theme options.
- **Hero:** background, headline, tagline, actions and image/alt text.
- **Content:** rich text body.
- **Features:** title, description and repeatable feature items.
- **Stats:** title, description and repeatable statistics.
- **CTA:** title, description and repeatable actions.

Typography, spacing, responsive behavior, components and the allowed block types remain code-owned. This is the key boundary to preserve in production: CPLP should edit routine content, while Yonko Level should change structure through GitHub pull requests.

## Spike result

### Editing experience

**Positive.** Tina's visual editor is materially easier than asking a non-technical editor to edit Markdown or open a code pull request:

- A field can be selected from the page or from the section list.
- Text changes appear in the page preview while typing.
- Rich text, repeaters, links, image/alt text and select fields are presented as form controls.
- `Reset` makes experimentation safe before saving.
- The constrained block schema prevents the editor from changing layout or adding arbitrary components.

The local smoke test covered heading text, rich text, image metadata, links, repeatable features/statistics/actions, live preview and reset behavior.

### Publishing and permissions

The local flow is not the production publishing flow. TinaCloud requires a Tina project connected to the GitHub repository, GitHub authorization for editors, site URLs, Tina client ID/token environment variables, and a deployed `/admin/index.html` route. Tina's documented default cloud flow automatically pushes saved edits to the configured Git repository and then relies on the hosting build/deploy pipeline.

That is different from Yonko Level's preferred code workflow:

```text
CPLP editor: edit → preview → save → GitHub content update → hosting deploy
Yonko Level: branch → pull request → review → merge → production deploy
```

A reviewable branch/PR workflow is not demonstrated by this local spike. Tina documents editorial workflow features for Git-based approvals; availability, plan requirements and the exact PR behavior must be confirmed in a TinaCloud account before promising it. Without that configuration, do not describe Tina's default save action as a Yonko Level-reviewed PR.

Client-owned accounts should be used for GitHub, TinaCloud, hosting and the domain. Do not put production credentials in this repository.

## Cost and infrastructure notes

Prices change, so verify them when preparing the proposal. At the time of this spike, the official pricing pages showed:

- **TinaCloud:** Free at $0 forever for 2 users/2 roles; paid per-project plans were listed from Team ($29/month or $290/year), with larger Team Plus and Business plans. Paid plans add users/support and other features.
- **Prismic:** Free at $0 per repository for 1 user and 2 locales; Starter was listed at $10/month for 3 users/3 locales, with larger plans for more users/locales and governance.
- **Hosting:** a small static/hybrid Next.js site can use a client-owned Vercel or Netlify project; no DigitalOcean server or database is needed for this scope.

Sources: [TinaCMS pricing](https://tina.io/pricing/) and [Prismic pricing](https://prismic.io/pricing). Treat these as indicative, not a permanent free-tier or commercial-price guarantee.

## TinaCMS vs Prismic verdict

**Recommendation: use Prismic for the production CPLP site unless the client explicitly prioritises Git-backed content over the simpler operational fit.**

Prismic is the better default here because Yonko Level already uses it successfully (including Etermar), it gives the client a CMS account without making GitHub a prerequisite for routine editing, and the content/deployment workflow is more clearly separate from code review. Its visual editing experience is good enough for structured landing-page sections, and the free/low-cost entry plans are currently cheaper for a small editorial team.

TinaCMS remains a credible alternative when these benefits are decisive:

- content must remain Markdown/JSON in the client-owned GitHub repository;
- the team is comfortable with GitHub-based identity and permissions;
- direct content commits are acceptable, or Tina editorial workflow is enabled and verified;
- the client accepts TinaCloud's per-project pricing and service dependency.

The prototype validates that Tina is pleasant to edit; it does not by itself justify switching away from Prismic.

## Production migration checklist

If Tina is selected despite the recommendation:

1. Create the TinaCloud project against the client-owned repository and verify the intended branch/approval model.
2. Replace placeholder content with approved fifth-edition details, languages, contacts, legal copy and media.
3. Keep only the approved schema blocks; remove starter/demo content.
4. Configure client-owned hosting, domain, Tina environment variables, GitHub permissions and media storage.
5. Add a real deployment preview and test the editor with a non-technical CPLP user.
6. Document rollback, editor access, content ownership and who approves structural changes.

If Prismic is selected, retain the same code-owned block boundary and map these fields into a Prismic custom type/slice model rather than carrying this throwaway Tina setup into production.
