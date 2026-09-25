// The Somerset house rules for generated class material.
//
// These were scattered across ~70 feedback files in Hugo's memory folder, which meant
// they only ever applied when Claude was in the room. Anything the app generates has to
// obey them too, or it is not Somerset material. Each rule below carries the date Hugo
// set it, so nobody quietly "improves" one away later.
//
// When Hugo sets a new rule, add it here as well as to the memory folder.

export const HOUSE_RULES = `
SOMERSET HOUSE RULES. These are not style suggestions. A material that breaks one of
these is rejected, however good its content.

SOURCE FIDELITY (set 15 Sep 2026, after a worksheet used words that were not in the unit)
- Use ONLY the vocabulary given to you below. Do not add words that "fit the topic".
  If a task needs a word that is not on the list, change the task.
- Do not invent an exercise the coursebook does not set and present it as the book's.
  Practising the book's language in a new way is right; teaching a different point is not.
- If the vocabulary you have been given cannot support the activity type requested, say so
  in duration_note rather than padding the material out with invented items.

WORD BANKS (set 14 Sep 2026)
- A word bank, option list or matching list must NEVER be printed in the order of the
  answers. Scramble it, then check position by position that no item sits opposite its
  own answer, especially the first three.
- A list of options inside an exercise heading is a word bank and obeys the same rule.
- Distractors are welcome but do not excuse an in-order list.

PUNCTUATION (set 10 Jul 2026)
- Never use an em-dash or en-dash as punctuation, anywhere, in student-facing or
  teacher-facing text. Use a comma, or a colon. Level ranges are a plain hyphen: A1-A2.

LANGUAGE OF INSTRUCTIONS (set 10 Jul 2026)
- No folksy metaphors as instructions. Not "fill your cupboard with words", not "warm the
  engine up". Plain literal imperatives: "Get your words ready", "Practise out loud for
  five minutes". Warm in tone, never gimmicky.
- Never use the word "test" in student-facing text. Say quiz, game, challenge or check-in.
- Instructions must be at or below the class level, so a student can follow them without
  the teacher translating. The target vocabulary may be harder. That is the point.

LAYOUT AND LEGIBILITY (set 12 Jun 2026)
- Nothing may be too small to read at arm's length. Treat white space as space to USE:
  where content sits in a narrow column, widen it rather than shrinking the text.
- Never split an exercise across a page break. Prefer an empty half page to a split task.
- Reading passages are set larger than body text.

VALENCIA (standing rule, every material)
- At least one natural Valencia or Spain reference: El Carmen, Ruzafa, Cabanyal,
  Benimaclet, the Turia, Mestalla, Mercat Central, the Albufera, Fallas, horchata, the
  metro, a real local habit. Never forced, never a stereotype, never a tourist brochure.

PAIRWORK AND INFO-GAP (standing rule)
- In an info-gap, each student holds information the others do not, and the pair or trio
  completes a shared grid by asking. Nobody reads their card aloud.
- Every card must carry an "Ask Student X" section for every OTHER student in its group.
  Count them before finishing: each card needs (group size - 1) of them.

CORRECTION AND FEEDBACK (set 21 Jul 2026)
- Where a material shows a student error, print it in bold red and do not strike it
  through. It has to stay readable.

THE TEACHER KEY
- Every answer is given, and every answer that could be argued carries a one-line reason.
- Name the two or three errors a Spanish speaker is most likely to make here, specifically,
  not generically.
- Say what to cut if the teacher is short of time, and what must never be cut.
`.trim()

/** Checks the teacher is asked to make before printing. Rendered under the key. */
export const REVIEW_CHECKLIST: string[] = [
  'Every word used comes from the unit list, with nothing invented',
  'No word bank or option list is in the order of its answers',
  'There is a real Valencia or Spain reference, and it is not forced',
  'No em-dashes or en-dashes anywhere',
  'The word "test" does not appear in the student text',
  'Info-gap cards each have one "Ask Student X" section per other student in the group',
  'Nothing is too small to read, and no exercise is split across a page break',
  'The answer key is complete and you agree with every answer in it',
]
