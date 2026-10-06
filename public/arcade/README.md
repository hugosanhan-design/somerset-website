# Somerset Arcade

A Baamboozle-style classroom game engine, branded Somerset, that runs **offline from a double-click**. No server, no build step, no accounts, no student devices — one screen at the front of the room, exactly like Baamboozle.

**Open it:** double-click `index.html`.
**Full screen:** press `F`. **Close an overlay / stop the timer:** `Esc`.

---

## The one idea that makes this worth building

**One data file per unit drives every game.**

You write a unit's content once — vocabulary, questions, the card deck, the mystery — and you get six games from it. Adding October means writing `units/unit-02.js` and adding one line to `index.html`. It does not mean writing six games again.

```
somerset-arcade/
├── index.html          ← the engine. Rarely changes.
├── units/
│   └── unit-01.js      ← all of September's content
├── cards/              ← the 24 deck photos (shared with the printed deck)
├── test-arcade.js      ← smoke test, 31 assertions
└── README.md
```

---

## It opens on the class you are about to teach

The Arcade reads the clock. Walk in on a Monday at 18:40 and it is already on Monday Adults; walk in at 17:20 and it is on Children. A gold chip in the top bar says which class it picked and why (`⏱ Monday 18:45 · Monday Adults`). The unit dropdown still overrides it — the guess is never a trap.

Rules: inside a lesson, that lesson. In the **45 minutes before** it starts, that lesson (so it is right while you are setting up). Otherwise the next class still to come today. Otherwise nothing, and it opens on the first unit it has.

**Editing the timetable** — one block at the top of `index.html`, marked `THE TIMETABLE`:

```js
{d:1, from:'18:45', to:'20:45', group:'adults-monday', label:'Monday Adults'},
```

`d` is the weekday, 0 = Sunday. Every unit file declares which group it belongs to (`group:'children'`), and the Arcade picks that group's newest unit. **Lines marked `⚠ UNCONFIRMED` are guesses** — only Monday Adults and the Tuesday/Thursday adults have real times from the production briefs.

---

## Teams — set them up once, they last the lesson

Press **👥 Teams** in the top bar.

- **How many teams** — 2 to 5.
- **Who is here today** — type or paste the names (one per line, or commas). **Shuffle** deals them out at random; no team ends up more than one player bigger than another. Teams get named after their members, so the board says *Marc & Aina*, not *Team 1*.
- **Handicap** — on by default. A team of 2 playing against teams of 3 earns **×1.5** on everything, shown as a gold badge on their card. Nobody has to remember a rule mid-game and the short team stays in it.
- Leave the names empty to just play with numbered teams.

Teams and scores survive switching game **and** switching unit. They only reset when you change the team count or press Clear.

---

## The ten games

| Game | What happens | Language it forces |
|---|---|---|
| **🎯 Point Grab** | 20 numbered tiles, three teams. Pick a tile, answer the question, take the points. Two tiles are **STEAL**, two are **×2**. | whatever is in `questions` |
| **🧠 Memory Match** | 12 cards face down. Flip two, say a true comparative, keep them. | *Number 3 is taller than number 9.* |
| **🕵️ Guess Who** | All 24 faces on the board. Yes/no questions; click a face to cross it out. Teacher gets the secret number in a toast. | *Has he got curly hair? Is she wearing glasses?* |
| **⚡ Speed Round** | One word at a time, 60-second timer, +1 per word. | the unit's vocabulary |
| **🔤 Word Flash** | One huge word on the board. Say it, use it, next. | vocabulary drill |
| **🪢 Hangman** | Letter-by-letter reveal off the unit's wordlist, clue in Spanish. Six wrong letters and the word is gone. Finishing it earns nothing until the team uses it in a sentence. | **spelling**, plus one productive sentence |
| **🎾 Pilota** | Right English wins the strike; the rally is luck. Scored *quinze · trenta · val · joc*. | whatever is in `questions`, plus the numbers |
| **🥘 La Paella** | Claim ingredients for the pan. Real ones +10; chorizo, peas or onion −10. | food vocabulary + the questions |
| **🦶 Sambori** | Valencian hopscotch, 1 to CEL. Squares 3 and 7 jump you up, 5 and 9 drop you back. | the questions |
| **🔥 La Falla** | Eight pieces to build. Finish it and it burns, with your name on it. | the questions |
| **🔦 The Case** | The escape room — four locks, opened in order. The whole class against the clock. | everything, in sequence |

### Why these four, and why they cost nothing to extend

Baamboozle offers nineteen "games" — Baseball, Bowling, Snakes and Ladders, Tic Tac Toe, Egg Hunt, Popman and the rest. They are **five mechanics** in different art: a hidden-value grid, a sport, a race, a territory grab, and a build-and-reveal. The question deck never changes; only the wrapper does.

So the four Valencian modes are those mechanics with local clothes on — and, crucially, **they read nothing but the unit's existing `questions` array**. Write `units/unit-02.js` for October and all four work immediately, with no extra authoring. The only game that needs bespoke content is The Case.

### The Case — how the escape room works

Four locks, each a different **type**, so the class has to switch skill four times:

1. **`match`** — drag-free word/meaning matching. All pairs must be matched before it opens.
2. **`choice`** — pick the correct sentence. A wrong answer stays wrong; nothing unlocks.
3. **`choice`** — a listening/logic clue from the story.
4. **`suspects`** — the five suspect files. Click a card to cross it out, then press **Accuse**. Accusing the wrong person crosses them out instead of opening the lock.

A lock only opens on a genuinely correct answer, and the locks are strictly sequential — the next one is not even displayed until the current one opens. When the fourth opens, the **Case closed** panel appears.

**The reveal is never in the student booklet** — it exists only here and on the teacher slides, so nobody can flip ahead.

---

## Adding a unit

1. Copy `units/unit-01.js` to `units/unit-02.js`.
2. Change the top line: `window.SOMERSET_UNITS['unit-02'] = { … }`.
3. Fill in the fields below.
4. Add one line to `index.html`, next to the existing one:
   ```html
   <script src="units/unit-02.js"></script>
   ```
5. Run the test: `node test-arcade.js` (needs `npm i jsdom` once).

The unit picker in the top bar finds it automatically.

### The unit schema

```js
{
  id, title, book, month, colour,

  vocab:     [ {w:"taller", t:"más alto"}, … ]        // Word Flash + Speed Round
  questions: [ {q:"My dad is ___ (tall) than my mum.",
                a:"taller", type:"gap"}, … ]          // Point Grab. type: gap | say | fix
  cards:     [ {n:1, img:"cards/01.jpg", hair, colour,
                glasses, tall, stats:{…}, plan}, … ]  // Memory + Guess Who
  case: {
    title, intro,
    locks: [ {name, type:"match",    prompt, pairs:[["taller","más alto"], …]},
             {name, type:"choice",   prompt, options:[…], answer:1},
             {name, type:"suspects", prompt, clues:[…], suspects:[…], answer:"E"} ],
    solved: "…"
  }
}
```

**Twenty questions.** Point Grab lays out a 5×4 grid, so give it at least 20 or tiles will be empty.

**Topic-filtered Point Grab.** Tag any question with `"topic":"something"` and the launcher grows an extra tile — *Point Grab · Something* — that plays the same game but only draws from that tag. Added 7 Sep 2026 so unit-01's Point Grab could run on just the first-day summer word-search words (`topic:"summer"`) without surfacing the comparative-grammar questions the class hasn't written yet. The untagged tile still draws from every question in the unit.

---

## Rules the engine assumes (break them and a game breaks)

- **`match` translations must be unique.** Two English words meaning the same thing makes the matching ambiguous and unsolvable. The test checks this.
- **Exactly one suspect may survive all the clues.** If two survive, the case has no answer; if none do, it is unwinnable. The test checks this too, by filtering the suspects against the clues and asserting a single survivor that equals `answer`.
- **Card features should be spread.** If only two cards have curly hair, Guess Who elimination is pointless. Aim for roughly even thirds on hair type.

---

## Testing

```bash
npm i jsdom          # once
node test-arcade.js
```

31 assertions: the launcher renders, Point Grab scores and passes the turn, Memory deals face down, Guess Who picks a secret, Speed and Flash advance, and **the escape room is played through all four locks** — including asserting that a wrong choice and a wrong accusation do *not* open a lock.

This test caught a real bug during the build: the suspect card said "click twice to accuse" while the code required three clicks. The interaction was rebuilt with an explicit **Accuse** button rather than the label being fixed.

---

## Deliberately not included

- **A digital Top Trumps.** They have 24 laminated cards for that. Cards in hands beat cards on a screen for a game whose whole point is arguing across a table.
- **Student devices, logins, accounts.** Same reason Baamboozle works: one screen, no admin.
- **Sound.** Add it if you want it; the room is loud enough.

## 7 September 2026 — Turn Two and versions

Turn Two now initializes persistent teams, shows selectable team names and scores, limits each turn to two different cards, awards one point (with existing handicap), and passes the turn on correct/wrong. Duplicate scoring is ignored. Cards fit alongside the scoreboard at 1280×720. Original preserved in `_archive/index-before-turn-two-20260907.html`.

Each launcher game opens Original / True or false / Fill in / Multiple choice. Point Grab and Valencian games use the shared question renderer; Turn Two asks a unit question after two flips. Guess Who, Speed Round, Word Flash and The Case provide explicitly labelled quiz editions for the alternate formats, preserving their original editions. Responses are oral and teacher-marked. Questions derive from existing unit content. This change updates index.html, not the separate standalone export.

Verification: existing smoke suite plus Turn Two team selection, two-card limit, scoring, duplicate protection, wrong answer, launcher clicks and all three formats pass. Browser verified actual team selection/scoring and 1280×720 layout. No Git repository at workspace root; no push command applicable.

### Image true/false correction
Turn Two true/false now displays the two selected photos alongside a comparative sentence about them: looks happier/older/younger, or longer/shorter/curlier hair. Left/right labels avoid ambiguity. Learners answer orally and correct false sentences; teacher accepts the answer (+1) or passes. No fabricated answer key from arbitrary card stats. Six regression checks cover image identity, prompt, scoring and reset.

### Turn Two image choices and fill-in
Multiple choice now keeps the two selected photos visible and asks a visual comparison (happier/older/younger appearance or hair length/curliness). Left / Right / About the same are clickable, with a single highlighted selection. Teacher accepts a justified response for points; no automatic truth inferred from arbitrary stats. Fill-in also compares the same images, with a comparative adjective cue and oral response. Existing and new regression tests pass, including actual selected images, switching choices, score award and duplicate resolution. Browser visual recheck remains unavailable under the previously reported local-file URL policy.

### Full-sentence multiple choice
Replaces Left/Right/About the same. Three shuffled sentences compare visible hair length, shade or curliness; one true and two false. Broad categories were checked visually on all 24 photos. Equal/unknown traits are excluded. Indistinguishable pairs ask for another second card. Check answer shows the result and correction; Next turn applies scoring once. No skin-tone comparisons or emotion-based automatic grading added.
Validation: JavaScript syntax check passed; standalone executable generation test passed all 276 unique pairs (three unique options with one true, or no unambiguous question). Full jsdom regression rerun stalled before producing output; not claimed as passing for this revision.

### Guess Who review — 7 September 2026 (proposal, not implemented)
Hugo asked about whole-class play, group worksheets and a private laptop teacher window alongside the projector. Current implementation: random secret, manual elimination, peek toast in the public page, public reveal; no question history, guessing check or turn/score rules. Teacher peek is not private. Proposed teacher window must open concealed until manually placed on the private display, then show secret photo, verified visible description, questions/answers and projector controls. Extended desktop is required for different content on laptop/projector; automatic placement cannot be guaranteed across browsers. Suggested class pilot: cooperative question budget with rotating team speakers and everyone discussing before the question; print matching candidate grid + question stems + yes/no record per level. Separate student-question Guess Who from teacher-description listening mode. Photo 22 and 23 appear to show the same person; avoid both in the same identity round or define the target as the exact photograph. Descriptions must be photo-verified, including background only when visible, rather than trusting synthetic card statistics. Awaiting preferred next scope; no game modifications in this review.

### Guess Who teacher panel and worksheet — implemented
Original Guess Who now uses 12 checked photos (1,2,3,4,6,8,9,15,16,18,19,22), excluding duplicate identity 23. Teacher panel opens concealed, then reveals secret photo, visible person/background descriptions and question models only after an explicit unlock. Requires extended displays and user placement on private screen. Popup-blocked message leaves secret hidden. Controls record yes/no questions (10 max), undo, manually eliminate/restore, check guesses, reveal and start next round. Leaving via Menu/Class/Teams closes teacher window. The two-page Flyers worksheet HTML preview uses exactly the same photo IDs, question stems and a ten-question log; final print/PDF conversion awaits worksheet review. No other units/groups are claimed to have checked photo sets.

Validation: `node test-teacher-panel.cjs` passes concealed/open/blocked popup, unlock/hide, question cap/undo, elimination/restore, wrong/right guess and close-on-menu cases. Full jsdom suite stalled; browser and physical dual-display checks remain unverified. Worksheet is HTML preview, not print-certified.

---

## The Point Grab countdown (added 10 September 2026)

Opening a tile starts a **25-second clock**, top right. Gold, coral for the last five seconds, coral **TIME!** at zero.

**It does not score.** At zero the teacher still presses Correct or Wrong — same rule as every other game here. A student halfway through a good full sentence should not lose the points to a `setTimeout`.

- Change the length: `POINT_GRAB_SECONDS` at the top of the script block. One number, nothing else.
- Turn it off mid-lesson: the `⏱ 25s countdown: ON/OFF` chip above the grid. Off survives until you switch it back.
- The clock stops on Correct, Wrong, a steal, and `Esc`.
- Only Point Grab. Speed Round keeps its own 60 seconds; the Valencian modes are untimed.

Test: `node test-pointgrab-timer.cjs` — 16 assertions, including that the Correct button is still live after TIME!.

---

## Hangman (added 11 September 2026)

The sixth mechanic — letter-by-letter reveal — and the only game here that drills **spelling**, which is where Spanish speakers quietly lose Use of English marks: *embarrassment*, *misophonia*, *frustration*.

Two rules stop it being the weak playground version:

1. **The clue is the Spanish**, so it is vocabulary recall, not letter roulette. A team that knows the word can spell straight to it.
2. **Finishing the word scores nothing.** The panel then asks the team to use it in a sentence, and Hugo presses *Good sentence · +2* or *No points* — same teacher-marked rule as the rest of the app. See [[feedback_arcade_no_auto_scoring]].

Mechanics: six wrong letters, the gallows draws in six strokes (green frame, coral figure). A correct letter keeps the same team on; a wrong letter passes the turn. Words come from the unit's `vocab` array — bracketed glosses stripped, `/` alternatives reduced to the first, a leading *to* removed, anything under four letters dropped. Type a letter on the keyboard instead of clicking; while the Hangman board is up, **F guesses F** rather than toggling fullscreen.

Alternate versions (True or false / Fill in / Multiple choice) route to the shared quiz edition, like Guess Who and Word Flash.

Test: `node test-hangman.cjs` — 30 assertions, including that a loss offers no points and a win offers them only on a teacher click.

---

## Level Ladder Point Grab (added 14 September 2026)

`unit-01` (Flyers I, Our World 4 Unit 1) now carries a second `topic`-tagged question set alongside `summer`: `ladder`. It surfaces as its own tile on the unit's Point Grab screen — **Point Grab · Ladder** — same mechanic, same countdown, same steal/×2 tiles, filtered to just these 11 questions.

The 11 questions are drawn directly from *The Level Ladder* (the 9 September 2026 grammar diagnostic, 30 questions / 6 rungs, all 11 students graded) — specifically the gaps the whole class missed together, already identified and grouped in `Flyers-LevelLadder-ClassReview-Vista.html`:

- Present perfect — `Have` (Q26, missed by all 11)
- Present continuous — `are playing` (Q16), `am doing` (Q20)
- Past simple — `was` (Q21), `went` (Q22), `there were` (Q25)
- `should` for advice (Q27)
- Bonus round: `have got` not *has got* (Q7), `goes` not *go* (Q8), `kind` not *kindly* (Q14), `less` not *little* (Q30)

All 11 are `type: "fix"` ("Make it correct") so the badge in-game reads **Find the mistake** — the point of the session is the class correcting its own errors together, out loud, as a team, rather than a fresh drill.

One content note, flagged rather than silently smoothed over: the source test's Q25 stem ("In the year 1800, ____ no cars in Valencia.") omits *there* from the sentence itself even though *were* is the keyed answer — the corrected sentence here reads "In the year 1800, THERE WERE no cars in Valencia" to stay grammatical.

Test: `node test-arcade.js` — the tile-count assertion was updated from 13 to 14 to account for the new topic tile.

## PET I · pet1-u01 "this week" set (16 Sep 2026)

`units/pet1-u01.js` (PET I, New Close-up B1 Unit 1) now carries 22 questions tagged `"topic":"this week"`, surfacing as **Point Grab · This week**. They mirror the revised Unit 1 booklet (Grammar spotlight, Exercises C and D): habit vs "this week" contrasts built from the students' own first-day answers, stative-verb fixes, and the Level Ladder item 4 sentence that 4 of 5 students missed. The plain Point Grab tile still draws from all 42 questions. Previous version kept in `_archive/pet1-u01_before_16Sep_update.js`. All seven test files pass; no engine change, so no tile-count assertion moved (that assertion is for unit-01).

## Turn Two · height added, skin tone stays out (16 Sep 2026)

Hugo asked to compare more than hair between the two Turn Two photos: hair length/shade/curliness (already built), skin tone, and "something else shown under the photo." Two different answers:

- **Height — added.** Both picture-comparison modes (multiple choice and true/false) now also generate *taller than / shorter than* sentences, and the figcaption under each photo prints a 5-dot height indicator (●●●○○) so the fact is given, not guessed from a head-and-shoulders photo where no body is visible. The number is the card's existing `stats.height` (1-10), the same Top Trumps stat already printed on the physical deck — nothing new was invented, it just wasn't surfaced digitally before. This also directly drills this unit's target grammar (comparatives, *-er than*).
- **Skin tone — deliberately still not added.** This was the original decision from the Turn Two build ("No skin-tone comparisons... added") and it stands after being raised again: the 24-photo deck is real stock photography of real children and adults across a real range of skin tones, and turning "who has darker skin" into a scored, spoken quiz answer risks exactly the classroom dynamic Somerset doesn't want, whatever the intent. Flagged to Hugo directly; not implemented without a clear new reason to revisit it.

`pictureStatements()` now reads height straight off `card.stats.height` rather than from the hand-checked `pictureTraits` table (that table stays hair-only, still built from visually checking all 24 photos). All engine tests pass, including the 276-pair unique-answer sweep in `test-arcade.js`. Same schema (`cards[].stats.height`) already exists in every unit built so far (`unit-01`, `unit-02`, `unit-03`), so this applies to all of them with no per-unit work.

## Deep linking via URL (added 17 September 2026)

The Arcade still opens on the manual **"which class? → which unit? → which game?"** tile-picking intro on a plain double-click — nothing below changes that. This is only an optional shortcut for a page that already knows which unit (and optionally which game) it wants, so it can send the teacher straight there instead of making them tap through the tiles.

`Game.boot()` → `Game.deepLink()` reads either of these (checked in this order — a query string wins if it has a `unit`, otherwise the hash is used):

**Query string** — for an external page linking in, e.g. a course-plan console:
```
index.html?unit=fce1-u01b&game=pointGrab
```
- **`unit`** (required) — a real unit id, i.e. a key `SOMERSET_UNITS` is registered under in `units/*.js` (check that file's `window.SOMERSET_UNITS['<id>'] = {...}` line for the exact id — e.g. `fce1-u01`, `fce1-u01b`, `unit-02`, `pet1-u01`, `adults-b12-w1`). Missing, or not a real loaded unit id → falls straight through to the ordinary `Game.intro()` flow. Never throws, never leaves a blank screen.
- **`game`** (optional) — one of the game ids, **case-sensitive**, matching the `Game.<id>()` method name: `pointGrab`, `memory` (Turn Two), `guessWho`, `speed`, `flash`, `hangman`, `theCase`. Valid → skips `Game.intro()`, `Game.pickClass()` **and** the per-unit game-picker grid, landing directly on that game's own version screen (Original / True-or-false / Fill in / Multiple choice — teams can still be set up from there). Missing or unrecognised → still skips straight to `Game.load(unit)`, landing on the normal game-picker grid (`Game.home()`) instead of the full intro — safe, and still a big shortcut.
- **`topic`** (optional, Point Grab only) — filters the question pool to one `topic`-tagged set, same as the per-topic Point Grab tiles on the game-picker grid.

Worked example for a "regular class activity" link: `index.html?unit=fce1-u01b&game=pointGrab` opens FCE I's Unit 1 vocabulary/grammar set straight into Point Grab.

**Hash** — the original mechanism, added the same day for the teacher's digital booklet, kept working unchanged:
```
index.html#unit=unit-02&play=pointGrab&topic=have%20to
```
Same rules; the only difference is the key is `play` instead of `game` (both `game` and `play` are accepted in either the query string or the hash — pick whichever reads better for the linking page).

The **"🏫 Change class"** button always calls `Game.intro()` regardless of how the app was entered, so a deep link is just a different entry point into the same state machine — navigating away from it afterwards works exactly as normal.

This is engine-level (`index.html`), not per-group, so any current or future group sharing this engine (Flyers, PET I, B1.2 Adults, FCE I) can be deep-linked the same way — nothing here is hardcoded to one group.

Test: `node test-querylink.cjs` (query-string cases, including the no-params case asserting the manual intro is unchanged) and `node test-deeplink.cjs` (hash cases).

## True/False bonus round + manual "declare winner" screen (added 18 Sep 2026)

Feedback from Hugo after the Friday B2 class on 18 Sep 2026.

**Bonus round.** In the quiz-edition True/False format (`Game.startVersion('tf')`, used by Guess Who, Word Flash, Speed Round, Hangman, The Case and Turn Two's points games via `quizQuestion()`), when a team correctly calls the suggested answer "False" — i.e. they were right that it's wrong — they now get `TF_BONUS_SECONDS` (10, same one-constant pattern as `POINT_GRAB_SECONDS`) to also say the real answer out loud, for one more point on top of the point they already earned for the correct True/False call. Reuses the same global `#tmr` clock as Point Grab, so it follows the same never-auto-scores rule: Correct/Wrong stay live at TIME!, the teacher always decides. Nothing changes for a correct "True" call — straight to the next team, as before. See `Game.tfBonusRound()` / `Game.resolveTfBonus()`.

**Distractor now prefers the same topic.** The suggested (possibly wrong) answer shown in True/False and the three decoys in Multiple Choice used to be pulled from *any* question of the same `type` (gap/say/fix) anywhere in the unit, which could land on something so unrelated it read as obviously false on sight (an "emotions" sentence paired with a "technology" word). `questionView()` now prefers a decoy from a question sharing the same `topic` tag as the one being asked, falling back to the old whole-unit-by-type pool only when the question has no topic or too few topic-mates. This only helps where questions are already topic-tagged (e.g. `fce1-u01`'s emotions set) — it is a mechanical improvement, not a content rewrite, and a question with no `topic` field gets no benefit from it.

**Declare winner.** A 🏆 button now sits beside the team cards on every game screen (`Teams.html()` / `Teams.declareWinner()`) and opens a full-screen announcement in giant text naming the leading team (or every tied team, labelled "tie!"). Deliberately a button the teacher presses, never an automatic threshold — same philosophy as the rest of the Arcade (see the no-auto-scoring rule above): nothing on screen decides a round is over by itself.

Test: `node test-tf-bonus.cjs` covers the bonus round firing only on a correct False call, the shared clock, no-auto-scoring at TIME!, the trophy button not being miscounted as a team, and both a clear winner and a tie.

## Somerset Pursuit (added 25 Sep 2026, B2 Conversación)

A twelfth game, built additively — no other game or unit was touched.
Trivial-Pursuit-style board, scoped to one new unit, `units/b2conv-u01.js`
(group `b2-conv`, the Wednesday 18:45-20:15 adults group). The
**Somerset Pursuit** tile (`tilePursuit()`, own CSS class, cobalt) only
appears in the per-unit game grid for a unit that declares a `pursuit`
block — every other unit's tile grid is unchanged.

**Board.** 24 spaces round the border of a 7×7 CSS grid (a 7×7 grid's
border is exactly 4×7−4 = 24 cells), leaving the interior 5×5 free for
the centre hub with no absolute positioning. Six categories, four
spaces each; the first space of each four-space run (`i%4===0`) is that
colour's HQ. Manises-style ceramic **azulejo** tiles mark categories and
collected pieces — four white quarter-circle petals on a coloured
square, drawn with layered `radial-gradient`s, no external images, same
rule as every icon in this app:

1. Azul cobalto — Historia
2. Verde — Geografía y naturaleza
3. Ocre — Gente y personajes
4. Morado manganeso — Ciencia y curiosidades
5. Terracota — Comida y costumbres
6. Blanco/gris — Cine, música y deporte

**Play.** Roll (`Game.pursuitRoll()`, an animated die face, no external
asset) to move around the ring. Land on a colour, answer a question
from that category out loud. Land exactly on your own colour's HQ and
answer correctly to win that colour's azulejo tile — once per colour,
answering an already-owned HQ again just scores the usual point. Hold
all six tiles and a **🏛 Attempt the centre** button appears in the hub
on your turn; answer one final, any-category question correctly to win.

**Teacher-marked, like every other game here** (see
[[feedback_arcade_no_auto_scoring]]): `Game.askPursuit()` shows Show
answer / ✔ Correct / ✘ Wrong, same as `Game.ask()`. Nothing marks
itself.

**Two adaptations, flagged rather than silently done:**
- The turn always passes after one question, correct or not, the same
  rule Sambori and La Falla already use — Trivial Pursuit's "answer
  right, roll again" was dropped to keep a round a predictable length
  for a fixed lesson slot.
- There is no literal centre square to walk to on a flat ring, so
  reaching the centre is the hub button described above, available on
  a team's own turn once they hold all six tiles, rather than landing
  on one exact space.

**Content.** 48 original questions (8 per category), English
question/answer, real and verifiable Spain- and Valencia-specific
general knowledge, calibrated for a B2 adult learner — not written from
the unit's existing `questions` array like the four Valencian modes,
because this content did not exist yet. The same 48 are also mirrored
into the unit's ordinary top-level `questions` array (topic-tagged per
category id) so the other eleven games render real content, not an
empty board, if a teacher opens one of them on this unit by mistake.

Test: `node test-somerset-pursuit.cjs` — 36 assertions: the tile only
appears for a unit with a `pursuit` block and every other unit/game is
unaffected; the board renders 24 spaces / 6 HQs / 6 legend chips;
landing on a colour never scores or awards a tile until the teacher
clicks Correct or Wrong; a correct HQ answer awards that tile exactly
once; the centre button appears only once all six tiles are held; a
correct centre answer declares a winner; a wrong one sends the team
back without ending the game.

**Pre-existing, unrelated fix made while running the suites:**
`test-arcade.js`'s tile-count assertion for `unit-01` was still `14`;
`unit-01.js` has since picked up a third `topic` tag ("now or future"),
so the real count is `15` (12 + 3 topic-filtered Point Grab tiles).
Confirmed against `_archive/index-before-deeplink-20260917.html` that
this was already true before Somerset Pursuit existed — nothing here
caused it, it was just never re-checked after that content change.
Assertion corrected to `15` so the suite is green again.

## Somerset Rounds and Somerset 1-2-3 (added 1 Oct 2026, B2 Conversación)

Both follow the Pursuit pattern: own tile, no version submenu, shown only when a unit declares the block, teacher-marked, no clock ever scores. Test: `node test-somerset-rounds.cjs`.

**Somerset Rounds** — block `rounds:{students, rounds:[{id,title,intro,listener,questions:[{q,topic?}]}], vote:{topics:[{id,title,blurb}]}}` (unit `b2conv-u00`). Student names are editable on screen (+/− students). Each round: the Draw button picks who asks, which question number and who they ask. Every question is used once. With as many students as questions every student asks once and is asked once (random derangement, nobody asks themselves). After the last round: Vote (+/− per topic, teacher counts hands), Lock picks the top two (ties settled at random) = Topic 1 and Topic 2. No scoring.

**Somerset 1-2-3** — block `quiz123:{quick:[{q,a,alt}], bid:[{q,a,hint}], final:{q,a}}` (units `b2conv-cowboy`, `-weekend`, `-paella`, `-sport`, `-siesta`). Quick-fire 6 q (+5, no loss) · Bid 4 q (bid 10/20/30/40 after a clue; right +bid, wrong −bid, never below the floor of 20) · Final (right +20, ×2 for the team strictly behind). Banks start at 100 and are saved in localStorage under `somerset123:<group>:<YYYY-MM>`, so a new month starts at 100 by itself; names and banks are editable on the setup screen, and ± buttons on the scoreboard correct mistakes. No handicap multiplier.

## Bingo (added 6 Oct 2026)
Modelled on Baamboozle's Bingo, which is a caller, not a board: every child holds a paper card, the board shows one clue at a time in random order, everyone plays at once. Reads only the unit's `vocab` array, so every unit gets it with no extra work.
- Setup: card 3 by 3 or 4 by 4, clue in Spanish or English, win with one line / four corners / full card, word bank (tap a word to drop it).
- Cards: `Print cards` makes one different black-and-white card per child (3 per A4 page for 3 by 3, 2 per page for 4 by 4), footer and page number via `@page`. `Print blank cards` plus `Word bank on the board` is the Baamboozle write-your-own version.
- Calling: space or right arrow = next, left arrow = back, R = show the answer, B = check a Bingo. Called list is hidden from the class and only shown in the teacher's check panel.
- The board never decides a winner and nothing is scored. A child shouts Bingo, the teacher checks the called list and presses the button. Same rule as every other game here.
- Deep link: `index.html#unit=unit-03&play=bingo`. Test: `node test-bingo.cjs`.

## Double Vision (added 6 Oct 2026)
Baamboozle's Double Vision is Dobble on a projector: two discs of pictures, exactly one picture is on both, the whole class races to spot it. It is the revision game for any unit with a `pics` array (October vegetables first).
- Unit data: `pics:[{id,w,t,img,clash?}]` (English, Spanish, file, optional look-alike tag). Fewer than 9 pictures and the tile does not appear. Unit-02 has 14, files in `pics/unit-02/` (480 px squares, about 1 MB in all). Only pictures that show their word unmistakably are in: the booklet's farm, garden, market and seeds shots are in `pics/unit-02/_unclear/` and not used. Carrots and tomatoes have no clear photo yet.
- Setup: 3 to 6 pictures a disc, second disc pictures or words, spin on/off, first to 3/5/8 or no limit, and a chip per picture to take out anything not yet taught.
- Round: the teacher taps the tile a child points at. Wrong tile greys out and play carries on. Right tile lights both matches and asks the winner to SAY it in English; the teacher then presses the team button for the point, or Nobody. Nothing scores by itself.
- The match walks through every selected picture before any repeats. Pictures with the same `clash` tag (courgette/cucumber, plant/weed) never share a round. Words are never rotated.
- Keys: space or N = new round, R = show the match. The knobs (fewer / more, pictures or words) work mid-game.
- Deep link: `index.html#unit=unit-02&play=doubleVision`. Test: `node test-doublevision.cjs`.

## Boxes (added 6 Oct 2026)
Baamboozle's Boxes mode is dots and boxes. Teams take turns: the clue comes up (a picture if the unit has `pics`, otherwise the Spanish word from `vocab`), the team says the English word, the teacher presses "Said it" or "Not yet", and only then can that team draw one line. Closing a box claims it and the team goes again. Most boxes wins; each box is banked as one scoreboard point at the end (so Undo never corrupts scores). Keys: Space = said it, N = not yet, R = show word, U = undo last line. 3x3 or 4x4 boards. Every word comes up before any repeat. Deep link: `index.html#unit=unit-02&play=boxes`. Tile appears on any unit with 6+ vocab. Test: `node test-boxes.cjs`.

## Guess-eroo (added 6 Oct 2026)
Baamboozle's Guess-eroo is Guess Who played with the quiz's own cards. Here the cards are the unit's pictures (`unit.pics`, tile appears with 9+). One secret picture; teams take turns asking a yes/no question in English; the teacher holds Peek (button or P), answers Yes/No, and the class taps cards to flip them. "Make a guess": right = reveal, and the teacher confirms the word was said before +3; wrong = that card flips and the turn passes. Optional question chips per unit via `unit.guessQs` (a default set is built in). Keys: Space = next team, hold P = peek. Deep link `index.html#unit=unit-02&play=guessEroo`. Test: `node test-guesseroo.cjs`.

## Memory (added 6 Oct 2026, replaces the Turn Two tile)
Baamboozle's Memory mode, as the classic pairs game. Two cards up per turn; a pair is a picture and its English word (units with `pics`) or the English word and its Spanish clue (any unit with 8+ vocab). A pair is only kept after the team says the word and the teacher presses "Said it" (Space); "Not yet" puts the pair back and passes the turn. A miss is covered with "Cover them" (Space). Each pair banks one scoreboard point at the end. 6 or 8 pairs per game, drawn from the words in play; words rotate before repeating. Deep links `play=memory` and `play=pairs` open it. Turn Two (comparatives on faces) is no longer in the menu; its code is still in `index.html` (`Game.memory`, `memFlip`...) and nothing was deleted. Test: `node test-pairs.cjs`.

## Somerset Trivial (round board, rewritten 7 Oct 2026)
Replaces the square Flyers version. A round neon board: rim of 42 spaces, six spokes of five, a hub. Each of six colours is a category and an English cheese (Somerset Cheddar, Stilton, Wensleydale, Red Leicester, Double Gloucester, Cheshire). Roll the die, tap any lit space exactly that many steps away (no revisiting), answer the colour you land on. Right = +1 and roll again; right on the cheese space at the end of a spoke wins that cheese. Dice spaces = roll again. With six cheeses go to the hub; the other teams pick the colour of the final question. Teacher marks every answer. Space bar rolls. "Full screen" button hides the header and enlarges the board.
Data: `unit.trivial = {title, blurb, categories:[6 x {id,label,short,colour,cheese,questions:[{q,a,img?}]}]}`. Tile appears only when exactly six categories exist. Deep link: `#unit=ID&play=trivial`.
Content: `unit-02` (Flyers, picture and vocabulary questions, no "have to" yet) and `b2conv-u01` (Somerset Pursuit tile removed 7 Oct 2026; engine kept for other units, old data in `test-fixtures/`) (History of Valencia, Spanish cinema, Hollywood, sport in Spain, sport in the world, Valencian and Spanish geography; 10 each). Re-check the recent-sport facts before use after autumn 2026. Test: `node test-flyers-trivial.cjs`.

## Weekly topic Somerset Trivial (B2 Conversación, 7 Oct 2026)
Closing game of the second class of each topic (replaces Somerset 1-2-3 that day). Topic units `b2conv-cowboy/sport/paella/siesta/weekend` declare `trivial = {winAt:3, teams:2, compose:{pool:'b2conv-u01', topicLabel, topicShort, genres:[4 ids], errors?}}`. Colour 1 = the unit's own `questions` (same facts as its 1-2-3, so use 1-2-3 only in the first class of the topic), colour 2 = "Fix it!" (default bank in `b2conv-u01.trivialPool.errors`; put the group's real errors in `compose.errors` each week), colours 3-6 = genres from the pool (`hist, escine, wcine, essport, wsport, geo`). First team to `winAt` cheeses wins; "⏱ Time's up" ranks by cheeses then points. Test: `node test-trivial-weekly.cjs`.
