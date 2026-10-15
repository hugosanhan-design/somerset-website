# Portal mini-games: content files

One JSON file per game. The game screen is shared, so to change a question you only edit its file.

## The shape

```json
{
  "id": "story-time",                 // must match the file name
  "title": "Story Time",
  "tags": ["tense"],                  // only the 10 error tags in data/errorTags.ts
  "engine": "choice",                 // "choice" (pick an option) or "pairs" (word + partner)
  "intro": "One or two calm sentences: what the student practises.",
  "items": {
    "B2": [
      { "id": "st-b2-01", "q": "The sheriff ___ his coffee when …", "options": ["was drinking", "drank", "had drunk"], "answer": 0, "why": "Short reason, shown after the answer." }
    ]
  }
}
```

- `___` in `q` is the gap. `answer` is the position of the right option, counting from 0. Options are shuffled when played.
- **Pairs games** use `{ "id", "left", "right", "why"? }`. They play as: the left card, then its partner and 3 partners from other pairs.
- **Levels:** A2, B1, B2, C1. Each level needs at least 10 items; 12 is the target. With fewer than 10 the game is a draft (`"draft": true`): students can't open it, and you can review it at `/games/<id>?preview=1`.
- **`why`** is optional, but every new game should have it. Without it the game shows only the right answer.

## Rules (the validator checks them)

Run `node scripts/games-validate.mjs` after any edit. It fails on:
- a tag outside the 10;
- fewer than 10 items in a level;
- a duplicate item or id;
- an answer index out of range;
- American spelling (-ize, color, center…), any emoji, or the word "test".

## Where the files come from

- `story-time.json` and `who-did-it.json` were written for the Wednesday B2 course.
- Every file with `"source"` was copied from the website by `scripts/games-import.mjs`. Re-running that script overwrites those files, so put lasting edits in the script's `FIXES` or `INTROS` list, or remove `"source"` from the file to take it over by hand.
