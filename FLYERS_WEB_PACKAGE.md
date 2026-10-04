# Flyers I - October 2026 web package

Built by `Somerset Worksheets/_method/booklet-build/build_flyers_web.py` into `app/public/flyers/2026-10/`
(and it re-syncs `app/public/arcade/` from `_apps/somerset-arcade/`: index.html, units/, cards/).

## What is inside (53 files, about 50 MB)
- `index.html` - teacher digital booklet (fonts and the 7 audio clips are embedded). Deep link `?p=N` opens page N.
- `images/` - the 21 photos the booklet uses.
- `slides/L1..L7_*.pdf` - lesson slides; `slides/Warmer-*.html` - Vista warmers.
- `plays/*.html` (+ Unit 2 Review Play 1-4 `.pdf`) - the six plays.
- `audio/final/*.mp3`, `audio/test/Unit 2 Test - Listening.mp3`.
- `correct-together.htm` - click-to-reveal answers (`?lesson=7&pages=23-24` works).
- `teacher/teacher-key.htm` and `teacher/Unit 2 Test - Teacher Key.pdf`.
- `october-booklet-v2.pdf` (student booklet) and `october-booklet-v2-PRINT-BOOKLET.pdf`.
Not published: .pptx files, lesson plans .md, share-pack zips.

## Public vs login (from middleware.ts: only png/jpg/jpeg/svg/ico/webp/mp3/html skip the login)
PUBLIC (anyone with the URL): `index.html`, `images/*.jpg`, `audio/**/*.mp3`, `plays/*.html`, `slides/Warmer-*.html`, `/arcade/index.html`, arcade card jpgs.
LOGIN REQUIRED: every `.pdf`, `correct-together.htm`, `teacher/teacher-key.htm`, `/arcade/units/*.js` (so the Arcade itself only works in a logged-in browser).
Consequences: the answers page and Teacher Key are protected on purpose (.htm). The test listening mp3 and the booklet HTML are public but unlisted.

## URLs (base https://somerset-language-centre.vercel.app)
- /flyers/2026-10/index.html?p=7
- /flyers/2026-10/correct-together.htm?lesson=7&pages=23-24   (login)
- /flyers/2026-10/slides/L1_Mon-05-Oct.pdf ... L7_Wed-28-Oct.pdf   (login)
- /flyers/2026-10/plays/Saturday%20at%20the%20huerto.html
- /arcade/index.html#unit=unit-02&play=pointGrab&topic=unit%202

## Publish
```
cd "/Users/hugos/Documents/Claude/Projects/Somerset Project/Somerset App/app"
python3 "../../Somerset Worksheets/_method/booklet-build/build_flyers_web.py"   # only if sources changed
./deploy.sh
```
Re-run the same two commands after ANY change to the digital booklet, slides, plays, audio or Arcade units. The script only overwrites; if it prints "stale file" warnings, delete those files by hand. Never edit `public/flyers/2026-10` by hand.

## Known limits
- Plays load Google Fonts (need internet in class); Arcade too.
- The dashboard's Blob links (migrate-materials) are separate from this package; this package is only reached through `bookletDigitalWeb` and Arcade links.
