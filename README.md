# Monster Realm

Installable web game. Hosted on Cloudflare Pages, with a Google Apps Script backend for saves and live battles.

## Setup
1. **Backend:** script.google.com → New project → paste `backend/Code.gs` → Deploy → New deployment → Web app → Execute as **Me**, access **Anyone** → copy the web app URL.
2. Put that URL in `index.html` (`window.MR_BACKEND = "..."`) and push.
3. **Hosting:** Cloudflare Pages → Connect to Git → this repo → no build command, output directory `/`.
4. **Phone:** open the site in Safari → Share → Add to Home Screen.

Saves go to a "Monster Realm Saves" Google Sheet the backend creates on first use. `src/` holds the game's source pieces.
