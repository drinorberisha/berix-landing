# Instrument Sans

`instrument-sans-latin-variable.woff2` is the normal-style Latin subset of
Instrument Sans distributed by Google Fonts, downloaded on 2026-11-12.
It supports continuous weights 400–700 at the default normal width.

- Font project: https://github.com/Instrument/instrument-sans
- Official family metadata: https://github.com/google/fonts/blob/main/ofl/instrumentsans/METADATA.pb
- Distribution request: https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap
- Font binary: https://fonts.gstatic.com/s/instrumentsans/v4/pxiTypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr0SZe1Q.woff2
- SHA-256: `2ee17598a98d8a59e4df8152d015bec9ab8e4d5672cc0ab42bef806b568e3971`
- License: SIL Open Font License 1.1, included as `InstrumentSans-OFL.txt`.
- License source: https://github.com/Instrument/instrument-sans/blob/7fa22308a3d0c94ee2b3cd537a1196b65db34a3e/OFL.txt

The family is designed by Rodrigo Fuenzalida with direction from Jordan Egstad.
This is a locally hosted copy of the official font, with no external runtime
font request required. The Latin subset includes standard English text,
Latin-1 accents, and common punctuation; other scripts use the CSS fallback.

## Legacy admin families

The admin's existing Fraunces, Geist and Geist Mono families are retained as
self-hosted Latin variable subsets. Downloaded on 2026-11-12 from the same
official Google Fonts CSS2 distribution used by the former external stylesheet:

https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Geist:wght@300..900&family=Geist+Mono:wght@300..700&display=swap

The actual font binaries were checked with fontTools. Fraunces normal and italic
retain optical size 9–144 and weight 100–900; Geist and Geist Mono retain weight
100–900. Only the Latin subsets are included. These fonts can remain unloaded
until an admin element uses the corresponding family; do not preload them on
the public landing page.

| File | Official distribution URL | SHA-256 |
| --- | --- | --- |
| `fraunces-latin-variable.woff2` | https://fonts.gstatic.com/s/fraunces/v38/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0KxC9TeA.woff2 | `7234ed860a9cc83045413c4faee63c960a8f2d1917adcf728119307d56e0d783` |
| `fraunces-latin-italic-variable.woff2` | https://fonts.gstatic.com/s/fraunces/v38/6NU58FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChjeveQ.woff2 | `066710ce7ed235a339d3d6cdcc8b55c0bea5632232662d83aacea25852108271` |
| `geist-latin-variable.woff2` | https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwcGFU.woff2 | `19f9c92546aa300c312235e3125af1b81394d8db9a4bc4a425cd5b641d2d54e1` |
| `geist-mono-latin-variable.woff2` | https://fonts.gstatic.com/s/geistmono/v6/or3nQ6H-1_WfwkMZI_qYFrcdmg.woff2 | `684ad5b531f81d43c1e8c7038262d5db7cdc1f68006e04d6c7769efa8d33c8cc` |

Family metadata and source projects:

- Fraunces: https://github.com/google/fonts/blob/main/ofl/fraunces/METADATA.pb;
  https://github.com/undercasetype/Fraunces
- Geist: https://github.com/google/fonts/blob/main/ofl/geist/METADATA.pb;
  https://github.com/vercel/geist-font
- Geist Mono: https://github.com/google/fonts/blob/main/ofl/geistmono/METADATA.pb;
  https://github.com/vercel/geist-font

Each uses SIL Open Font License 1.1. The licenses are included as
`Fraunces-OFL.txt`, `Geist-OFL.txt`, and `GeistMono-OFL.txt`, fetched from their
corresponding `ofl/<family>/OFL.txt` paths in the official Google Fonts repository.
