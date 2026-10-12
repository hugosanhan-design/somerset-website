# flyers-2026-10-exercises.json

Tap-to-answer exercises from the Flyers I October 2026 booklet (october-booklet-v2.html), for the iPad "student input" screen.

## Schema
- `group`, `month`, `lessons` {date: {n, pages}}.
- `exercises[]`: `id`, `page` (printed page), `date` (lesson date), `title`, `instruction`, `type` (mc | match | tf | aan | sort | bank), `items[]`.
- `items[]`: `n`, `q` (booklet wording; `___` marks the gap), `options[]` {key, text}, `correct` (an option key).
- Keys: a/b/c or a-h for letter choices; `T`/`F`; `a`/`an`; `under`/`above`; for word choices (circle, bank, odd one out, frequency phrases) the key is the word or phrase itself.
- match/bank items repeat the shared option list.

## Included (15 exercises, 80 items)
| Date | Exercise | Items |
|---|---|---|
| 05 Oct | p3 What do I know? (mc), p5 True or false (tf), p6 Match the word (match), p6 Odd one out (mc), p6 Fill the gaps (bank) | 8+5+8+3+6 |
| 07 Oct | p8 A Circle the right words (mc) | 5 |
| 14 Oct | p11 Match the two halves, p12 A Read and write (bank), p12 B a or an, p12 C Sort them | 4+6+8+6 |
| 19 Oct | p14 Nora's week (bank, items 1-3), p15 A Circle the right word | 3+4 |
| 26 Oct | p21 Farm check T/F (printed on p21, about the p20 text) | 4 |
| 28 Oct | p23 Test Part 1 (a/b/c only), p24 Test Part 3 (bank of 7, two extra) | 5+5 |

Answers cross-checked against Vista `EX`, the master HTML, the lesson plan keys and the Unit 2 Test Teacher Key.

## Excluded
- Writing: p6 order 1-5 (two valid orders for water/weed), p7 write-it, p8 B word order, p8 C, p11 unjumble, p12 D and E, p13 (all), p14 complete-the-sentences (no word bank on paper), p14 item 4 (own answer), p15 B and C, p19, p21 rule check, p22 warm-up, p9/p18 play change-its.
- Test: Part 1 written words in items 3-5; Part 2, 4 and 5 (typed or free writing).
- p10, p20 reading and cut-outs: no exercises.
