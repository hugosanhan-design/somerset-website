# GEN01 — Answer key

Companion to `gen01-b2first.ts`. Exam id: `gen01-b2first`.
Every objectively-scored part was blind-solved by a fresh, context-isolated subagent
with zero visibility into this key (idea_008's non-negotiable gate), 22 Sep 2026.
Status: DRAFT, not teacher-reviewed. Enter into whichever system scores `/mocks` before
this exam can be assigned to anyone. Question numbers below match gen01-b2first.ts
exactly as of the 22 Sep 2026 build (verified against the live file, including a
renumbering fix applied after an initial draft mis-numbered Part 2 and briefly
corrupted two Listening Part 4 question numbers during that fix — both confirmed
correct as of this version; see idea_008 log entry for what went wrong and how it was
caught).

## Part 1 — Multiple-choice cloze (q1–8)
1-B, 2-D, 3-A, 4-C, 5-A, 6-D, 7-B, 8-C
Blind-solve: 8/8 exact match, no ambiguity found.

## Part 2 — Open cloze (q9–16)
9. although / though / yet / but
10. on / about
11. in
12. have
13. that
14. this / the
15. why
16. as
Blind-solve flagged 3 of these (9, 10, 14) as having a genuine second valid answer —
both alternates are listed above, not guessed after the fact.

## Part 3 — Word formation (q17–24)
17. provocative
18. imaginative
19. attractive
20. economic
21. enthusiastic
22. recognition
23. spontaneity
24. inevitability
Blind-solve: 8/8 accepted, no genuine second answer for any gap. Item 23 (spontaneity)
is deliberately irregular (idea_008's 6:2 clean-to-irregular ratio rule, derived from
comparing the real Test 4 vs the official C1 sample). Item 22 was changed from an
earlier SANCTION→sanctioned draft after blind-solve flagged that as a weak,
non-affixal item — replaced with RECOGNISE→recognition, a clean regular -ion noun.

## Part 4 — Key word transformation (q25–30)
25. gave up smoking
26. wish I had told (accept: wish I'd told)
27. Had Sarah not
28. works the hardest (accept: is the hardest worker)
29. turned down
30. must have been left
Blind-solve: 4/6 single answer, 2/6 (26, 28) have a genuine second valid phrasing —
both alternates confirmed acceptable by the blind solver, not just guessed.

## Part 5 — Reading multiple choice (q31–36)
31-B, 32-C, 33-B, 34-C, 35-C, 36-B
Blind-solve: 6/6 exact match, no ambiguity found.

## Part 6 — Gapped text (q37–42)
37-B, 38-A, 39-C, 40-D, 41-E, 42-F (G unused)
Blind-solve: 6/6 + extra exact match, no ambiguity found.

## Part 7 — Multiple matching (q43–52)
43-C, 44-A, 45-C, 46-A, 47-B, 48-D, 49-B, 50-D, 51-B, 52-C
Blind-solve: 10/10 exact match, no ambiguity found.

## Listening Part 1 (q1–8)
1-A, 2-B, 3-B, 4-C, 5-A, 6-C, 7-C, 8-B
Blind-solve: 8/8 exact match.

## Listening Part 2 (q9–18)
9. 1994 (nineteen ninety-four)
10. August
11. portrait
12. lighting techniques
13. borrow
14. 35
15. Alderley Castle
16. registration form
17. Lensview
18. manual
Blind-solve: 10/10 exact match. Reviewer note: this script has no built-in "near-miss"
distractor numbers/facts (unlike the real exam), so every gap is a straight lift with
no discrimination value — fine for a first draft, worth revisiting before live use.

## Listening Part 3 (q19–23)
19-C, 20-G, 21-H, 22-A, 23-B (D, E, F unused)
Blind-solve: 5/5 exact match. Reviewer flagged speakers 2 (G) and 5 (B) as having
close-but-resolvable overlapping wording — correctly resolved to different options in
both cases; worth a light reword before live use.

## Listening Part 4 (q24–30)
24-B, 25-C, 26-A, 27-B, 28-B, 29-B, 30-C
Blind-solve: 7/7 exact match, no ambiguity found.

---

## Note on the renumbering fix (transparency, not hidden)
The first version of gen01-b2first.ts written to disk had a real bug: Part 2's passage
accidentally absorbed its own gaps 1 and 2 into fixed/example text while being
transcribed from the working draft, shrinking Part 2 from 8 gaps to 6 and knocking
every subsequent part's question numbers 2 short of where they should be. Restoring
Part 2 to 8 gaps and shifting Parts 3–7 by +2 was done with scoped find/replace, and a
second pass of that same fix briefly cross-contaminated two Listening Part 4 numbers
(q29/q30 got wrongly bumped to q31/q32 because both Reading Part 5 and Listening Part
4 happened to reuse those numbers with the same internal field pattern). Both issues
were caught by a full numeric audit of every `q:` field and gap marker in the file
(cross-checked against a TypeScript compile of the file, which passed cleanly) before
this key was finalised. Flagging this here deliberately: it's exactly the kind of
silent, easy-to-miss error automated generation can introduce, and the fix was
verified programmatically rather than trusted by eye.
