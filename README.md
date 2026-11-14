# BERIX website

React and Vite landing page with case-study motion films, optional interactive 3D,
and a separate Supabase-backed admin area.

## Local development

Use Node.js 22 and run:

```sh
npm ci
cp .env.example .env
npm run dev
```

Fill in `.env` for the admin area. The public landing page loads independently.
Vite embeds `VITE_*` values in browser code; use only a Supabase browser key,
never a server or service-role key. Keep the package lockfile committed.

```sh
npm run build
npm run preview
```

## Publishing

Pushing `main` triggers `.github/workflows/deploy.yml` and publishes `dist` to
GitHub Pages at https://berixsystems.com/. The workflow also creates the SPA
fallback for direct routes such as `/motion-studies` and `/admin/login`.

Configure these repository Actions secrets before deploying:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

`.env` stays local and is not tracked. The workflow supplies the same values at
build time from Actions secrets.

## Motion assets

Commit the MP4s, WebP posters, and GLBs in `public/motion-studies`: films are the
default presentation, and GLBs load only when a visitor chooses Explore 3D.
Self-hosted fonts and their licenses are in `public/fonts`.

`design/motion-studies` contains the Python builders, storyboards, and provenance
manifest. Editable `.blend` masters remain local and in the linked Higgsfield
projects. Backups, local verification reports, and the superseded Connected Core
experiment are ignored without deleting the local files.
