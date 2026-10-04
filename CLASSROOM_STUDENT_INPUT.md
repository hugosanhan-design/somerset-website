# iPad "Student input" (classroom mode) — added 29 Sep 2026

**What it does.** On the day the children do the tap-able exercises in the booklet (multiple choice,
match, true/false, a/an, sort, word bank), they come to Hugo's iPad, tap their name, tap the answers
they chose in the booklet, and press "Save my answers". Hugo sees the results at once.

**Where.** Sidebar → "Student input" (`/classroom`). Choose group + lesson date, then:
- **Start**: opens the child kiosk (full screen). Name grid → PAGE NUMBER cards → the booklet page rebuilt
  on screen → Save. The child is never told right/wrong. After 60 s idle it returns to the name grid.
  Exit the kiosk: hold the padlock (top corner) for 2 seconds. Use iPad Guided Access to lock it.
- **Results**: student × exercise matrix + "Hardest questions" (most common wrong answer), for
  correcting together.

**Offline.** If the wifi drops, answers queue in the iPad (localStorage `somerset-classroom-queue-v1`)
and retry every 10 s.

**Files.**
| File | Role |
|---|---|
| `data/flyers-2026-10-exercises.json` | 15 exercises / 80 items with answer key (server-side only) |
| `lib/classroomExercises.ts` | loads the JSON, `forChild()` strips answers, "test" → "check" |
| `app/api/classroom/exercises` | GET roster, dates, exercises (no answers), who has answered |
| `app/api/classroom/answers` | POST; validates group/student/exercise; marks on server; upsert |
| `app/api/classroom/results` | GET teacher matrix + hardest items (has the key; teacher only) |
| `app/(portal)/classroom/page.tsx` | UI (Kiosk + Results) |
| `lib/db.ts` | table `exercise_answers` (auto-created by `initSchema` on first request) |

**Group matching.** Group name containing "flyers" or "children" gets the Flyers sets.
If the DB group is named differently, edit `slugForGroupName`.

**Adding a month.** Build `data/flyers-YYYY-MM-exercises.json` (same schema), import it in
`lib/classroomExercises.ts` and add it to `SETS`. Ids must be unique per date.

**Known limits.** 21 Oct has no tap-able exercises. Results are not yet copied into
`work_entries` / progress reports. Not yet tested against the real Neon DB or on a real iPad.

**Looks like the booklet (30 Sep 2026).** The child taps a page number (3, 5, 6, ...) and sees that page's
exercises with the same running head, title, numbering and layout as on paper: lettered a/b/c pills,
circle-the-word inside the sentence, odd-one-out pills, T/F circles, match letters with the a-h
meaning list beside them, a sticky word bank (tap the word for the highlighted line; the next
empty line lights up), a/an, and under/above sort buttons. All exercises of one page are on one
screen with one Save. Page titles are in `PAGE_HEAD` at the top of the kiosk section of
`app/(portal)/classroom/page.tsx`: add a line for each new page when building a new month.
