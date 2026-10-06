# Audio for The Valencia Files — Mercado Central

Drop the MP3 files in **this folder**, next to `index.html`, with **exactly these names**:

| File            | What it is                       | Where it plays                          |
|-----------------|----------------------------------|-----------------------------------------|
| `street.mp3`    | the adventurous overworld theme  | the academy, the street, the plaza       |
| `market.mp3`    | the market groove                | inside the Mercado Central               |
| `market-amb.mp3`| crowd room tone — **already in place**  | quietly under the market music    |

So the finished folder looks like:

    juegos/mercado/index.html
    juegos/mercado/audio/street.mp3
    juegos/mercado/audio/market.mp3
    juegos/mercado/audio/market-amb.mp3      (optional)

## If a file is missing
Nothing breaks. The game checks for each file, and if it isn't there it simply plays
nothing. That is deliberate: the HTML file on its own still works, emailed or opened from a
USB stick — it is just silent. Only the hosted version has music.

## What has already been done
`market-amb.mp3` is in this folder and working. It came off Hugo's Desktop as
*market background sound effect* (2 min, 192 kbps stereo, 2.9 MB) and was processed before
being dropped in:

- **the fade in and fade out were cut** — the take began and ended 14 dB down, which would
  have pulsed every time it looped;
- **level raised by 11 dB** (with a limiter, no clipping) — the original sat at −37 dB RMS
  and would have been inaudible under the music;
- **mono, 96 kbps** — 2.9 MB down to 1.4 MB.

Result: 116.8 s, start and end within 0.4 dB of each other, so the seam is inaudible.

Still to come: `street.mp3` and `market.mp3`.

## Where the tracks came from
Generated with ElevenLabs Music (`eleven_music_v2`) on 20 Sep 2026. Two takes of each were
made so you can pick; the flows are in your ElevenLabs account:

- Overworld theme, two takes — https://elevenlabs.io/app/flows/OT6jdwWjeJBtNMVyJlLI
- Market theme, two takes — https://elevenlabs.io/app/flows/CA3wVRb1lhRu2MXKzEys
- Market crowd bed, **2 minutes** — https://elevenlabs.io/app/flows/3w58KfJMk5H32q6ATsu3
  (the last generation on that flow, 120 s. The two earlier attempts on the same flow are the
  1- and 2-second ones from the sound-effects model — ignore those.)

Download the take you prefer from the flow, rename it, and drop it here.

## Worth doing before you upload
The takes come back three and four minutes long, which is a 3–5 MB download for a child on
mobile data. Trim each to about 60–90 seconds at a point where the loop sounds natural and
re-encode at 96 kbps mono — that gets each file under a megabyte with no audible loss at
game volume. In Terminal, with ffmpeg installed:

    ffmpeg -i take.mp3 -t 75 -ac 1 -b:a 96k street.mp3

## How long should each file be?
| File | Take length | Keep about | Size at 96 kbps mono |
|------|-------------|-----------|----------------------|
| `street.mp3` | 3:00 | 1:15 – 3:00 | 0.9 – 2.2 MB |
| `market.mp3` | 4:00 | 2:00 – 4:00 | 1.4 – 2.9 MB |
| `market-amb.mp3` | 2:00 | all of it | 1.4 MB |

The market track is the one the child hears for the longest, so it is worth keeping two to
four minutes of it even though the file is bigger — a short loop in the room where she spends
twenty minutes is the one that will start to grate.

## The crowd bed loops even if it is short
The game plays `market-amb.mp3` as **three overlapping copies** at 0.91, 1.0 and 1.07 speed,
started at different points in the file. They drift apart, so the repeat never lines up and
even a ten-second clip sounds like a room rather than a loop. Nothing to do — just drop the
file in.

## Volume
Music plays at 42% and each of the three crowd voices at 16%, set in the game. Sound starts on the first key
press or tap — browsers refuse to play anything before that — and there is a **Sound** switch
at the top of the in-game MENU, which is remembered in the save.
