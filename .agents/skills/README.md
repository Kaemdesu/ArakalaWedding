# Agent skills for this project (Antigravity)

Skills are folders with a `SKILL.md` here in `.agents/skills/`. Antigravity reads
only each skill's `name` + `description` at session start and loads the full
`SKILL.md` on demand — so keep frontmatter descriptions precise and put bulk
detail in `references/`.

## Included (workspace) skills

- `wedding-template/` — template/theme schema, section order, component and data
  conventions for the invitation pages. Always relevant when working on
  `templates/`, `components/wedding/`, `/w/[slug]`, `/edit/[edit_token]`.

## Recommended external skills (install once)

```bash
npx skills add anthropics/skills/frontend-design -a antigravity
npx skills add nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max -a antigravity
npx skills add vercel-labs/agent-skills/web-design-guidelines -a antigravity
```

- **frontend-design** — visual direction when building/restyling a template.
- **ui-ux-pro-max** — palette/font/UX lookups when generating theme variants.
- **web-design-guidelines** — final audit pass (mobile, accessibility, speed)
  before a template or page ships.

Install only these three; do not stack conflicting design skills. Before installing
any third-party skill, read its `SKILL.md` and `scripts/` — skills run with the
agent's permissions.
