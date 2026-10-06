# Banner artwork refresh — 2 October 2026

Replaced the castle and three sheep instances with naturalistic transparent artwork. Kept the existing SVG wrappers, click targets, moving/eating sheep hooks, castle window/peeking overlays, weather filters and responsive layout. Other scenery remains unchanged. Castle is an AI-generated illustration inspired by Dunster, not an architectural record.

Assets: public/scene/castle-v2.webp (114,110 bytes), sheep-walk-v2.webp (15,032 bytes), sheep-graze-v2.webp (12,092 bytes).
Generated with the built-in image generation tool, then resized and encoded to WebP with alpha preserved.
Original homepage saved at ../_archive/banner-2026-10-02/page-before-realistic-art.tsx relative to repository root.

Verification: production build (next build --webpack) passed, TypeScript passed, desktop and 390px mobile visual checks passed, no mobile horizontal overflow, castle fact popover opens. Existing lint errors remain: five internal-anchor rules and one font warning outside changed artwork.

The local branch is nav-rail, with existing staged site-html.ts and untracked public/juegos work. Its navigation differs from production. Nothing committed or pushed by this task. Do not merge or deploy the entire branch solely for the artwork without reviewing those existing changes.

## Prompts

### Castle
Create one high-quality transparent-background website scenery asset: a realistic, finely detailed miniature of Dunster Castle in Somerset, England, its warm red-brown sandstone castellated country-house towers, mullioned windows and slate roofs, nestled among mature English deciduous trees atop a small grassy knoll. Three-quarter front view, natural architectural proportions, beautifully textured weathered masonry, individual leaves, soft warm daylight from upper left. Premium naturalistic matte painting with photographic material detail, NOT cartoon, NOT flat vector, NOT fantasy fortress. Entire castle and trees fit comfortably inside frame. Compact landscape composition 4:3. No sky, no backdrop, no text, no frame. Gently irregular grassy lower edge suitable for blending into green rolling hills. Transparent alpha around silhouette. This is an independently positioned element in a narrow animated website footer; strong readable silhouette at 190px wide.

### Walking sheep
One realistic English Suffolk sheep, entire body in strict side profile FACING RIGHT, gently walking with all four anatomically correct legs and small dark hooves visible. Creamy ivory dense curly wool with finely detailed fleece, black face and ears, natural eye, realistic sturdy sheep proportions. Soft warm daylight from upper left, naturalistic premium matte-painted photographic detail. Isolated transparent alpha background, no ground patch, no grass, no scenery, no text, no frame, no accessories. Subject fills frame with small clear margin around hooves and ears. Horizontal 3:2 composition. Readable silhouette for a small animated website landscape element. Not cartoon, no exaggerated eyes, no outlines.

### Grazing sheep
One realistic English Suffolk sheep grazing, whole body in strict side profile FACING LEFT with head naturally lowered to graze, all four anatomically correct legs and small dark hooves visible. Creamy ivory dense curly wool with finely detailed fleece, black face and ears, natural eye, realistic sturdy sheep proportions. Soft warm daylight from upper left, naturalistic premium matte-painted photographic detail. Isolated transparent alpha background, no ground patch, no grass, no scenery, no text, no frame, no accessories. Subject fills frame with small clear margin around hooves and ears. Horizontal 3:2 composition. Readable silhouette for a small animated website landscape element. Not cartoon, no exaggerated eyes, no outlines.

## Save and push this artwork to the existing branch

These commands commit only the named artwork changes and push nav-rail; they do not merge into main or publish production.

```sh
cd "/Users/hugos/Documents/Claude/Projects/Somerset Project/Somerset Website/somerset-website"
git add -- src/app/page.tsx public/scene docs/banner-refresh
git commit --only -m "Improve castle and sheep banner artwork" -- src/app/page.tsx public/scene docs/banner-refresh
git push origin nav-rail
```


## 2 October refinement — watercolour and pencil sketch

Hugo asked for a less game-like, more handmade look. The active artwork is now `castle-watercolour-v3.webp`, `sheep-walk-watercolour-v3.webp`, and `sheep-graze-watercolour-v3.webp`. They use loose graphite contours, pale ochre and sage watercolour washes, paper showing within the painted forms, and irregular cutout edges. Earlier v2 assets remain in `public/scene/` as recoverable previous versions, but the page references v3. The old glowing-window and peeping-person overlays were removed from the castle to suit the quieter sketch style; the castle and sheep remain clickable, and the walking sheep retains its motion.

Generated with the built-in image tool from these final prompts:

### Castle v3
Make a transparent cutout illustration for a refined school website footer, in the unmistakable style of an artist's loose WATERCOLOUR AND PENCIL SKETCH. Subject: Dunster Castle, Somerset, on a small wooded green knoll, 3/4 front view, compact horizontal silhouette. VISUAL LANGUAGE: two-dimensional loose ink/graphite outlines visibly drawn by hand, spare architectural linework, pale washes of ochre sandstone, moss and sage foliage made of irregular brush dabs, visible water blooms and granulated pigment, large areas of unpainted paper within the forms, understated collage-like layering, wobbly imperfect edges. Approx 30-40% white paper showing INSIDE the silhouette. It should look like a small illustration from a hand-bound travel journal or artisan letterpress children's book, not realistic, not rendered, not a 3D model, not Disney, not game art, not detailed photorealistic masonry. Single isolated asset only, transparent outside silhouette; no rectangular page, no text, no frame, no gradient background. Keep castle identifiable at 190 px wide and leave air around the edge.

### Walking sheep v3
Isolated small website illustration cutout: one Suffolk sheep, whole body in side profile walking RIGHT, four legs, compact natural silhouette. Drawn entirely as a 2D WATERCOLOUR AND PENCIL SKETCH by a human illustrator. Expressive wobbly charcoal pencil contours, just a few spiral fleece marks, loose cream washes with granulated pigment and visible blank paper within the wool, grey-black face and legs drawn with spare dry-brush marks; muted, warm, rustic English countryside sketchbook, tactile handmade. Very simple at thumbnail size, NOT photographic, NOT rendered, NOT CGI, NOT glossy game art, NOT cartoon mascot, no detailed fur strands, no dramatic lighting. Transparent background around the sheep, no ground, no shadow, no paper rectangle, no text. Composition horizontal 3:2 with a little breathing room.

### Grazing sheep v3
Isolated small website illustration cutout: one Suffolk sheep, whole body in side profile facing LEFT with head lowered to graze, four legs, compact natural silhouette. Drawn entirely as a 2D WATERCOLOUR AND PENCIL SKETCH by a human illustrator. Expressive wobbly charcoal pencil contours, just a few spiral fleece marks, loose cream washes with granulated pigment and visible blank paper within the wool, grey-black face and legs drawn with spare dry-brush marks; muted, warm, rustic English countryside sketchbook, tactile handmade. Very simple at thumbnail size, NOT photographic, NOT rendered, NOT CGI, NOT glossy game art, NOT cartoon mascot, no detailed fur strands, no dramatic lighting. Transparent background around the sheep, no ground, no shadow, no paper rectangle, no text. Composition horizontal 3:2 with a little breathing room.

Preview: [watercolour-desktop-preview.png](watercolour-desktop-preview.png). The listed commit message above should read "Give banner a watercolour sketch style" when this revision is committed.

## 2 October colour study — v4

Hugo asked to see the same hand-drawn design with more colour. The homepage now references the v4 castle and sheep assets, with coral and honey masonry, blue slate, richer greenery and pink/lavender heather. Sheep remain natural but use warmer cream and peach washes. The v3 assets remain for comparison and recovery. The scene saturation defaults to 1.0, including 0.94 under cloudy skies.

The in-app browser's local preview was blocked by browser URL policy during this pass, so the full-page composition is not visually verified here. The generated cutouts were inspected directly. No production deployment was performed.

### Castle v4 prompt
Edit this exact transparent watercolour castle cutout into a COLOURFUL artist's sketch. Preserve the castle silhouette, wooded mound, linework, transparency and hand-painted paper texture. Enrich pigment washes visibly: warm honey and coral sandstone walls, soft lavender shadows, blue-grey slate roofs, vibrant yet tasteful emerald/sage/olive trees, small dabs of heather purple and pink wildflowers on the slope. Give it the lively colour of a hand-illustrated travel journal, with graphite pencil contours and irregular watercolour bleeds. It must remain TWO-DIMENSIONAL, loose, handmade, not CGI, not photorealistic, not toy or game art. No flat digital blocks, no background rectangle, no sky, no text, no added characters. Transparent outside silhouette. Maintain same composition, aspect ratio and placement for a website footer.

### Walking sheep v4 prompt
Edit this exact walking sheep cutout into a COLOURFUL watercolour-and-pencil artist's sketch. Preserve whole sheep, exact RIGHT-facing walking pose, complete legs, graphite contour and transparent silhouette. Add stronger luminous pigment variation while keeping a natural Suffolk sheep: warm golden cream and light peach washes across the fleece, hints of lavender-grey in shadow, rich soft charcoal face and legs, subtle brown pencil curls. Visible hand-laid watercolour bleeds and paper grain, lively but tasteful. It should match a colorful British countryside travel journal illustration, two-dimensional and visibly handmade. No rainbow fleece, costume, scarf, flowers, background, glow, shadow, digital/game rendering, photorealism or text. Transparent outside the sheep, same composition and aspect ratio.

### Grazing sheep v4 prompt
Edit this exact grazing sheep cutout into a COLOURFUL watercolour-and-pencil artist's sketch. Preserve whole sheep, exact LEFT-facing head-down grazing pose, complete legs, graphite contour and transparent silhouette. Add stronger luminous pigment variation while keeping a natural Suffolk sheep: warm golden cream and light peach washes across the fleece, hints of lavender-grey in shadow, rich soft charcoal face and legs, subtle brown pencil curls. Visible hand-laid watercolour bleeds and paper grain, lively but tasteful. It should match a colorful British countryside travel journal illustration, two-dimensional and visibly handmade. No rainbow fleece, costume, scarf, flowers, background, glow, shadow, digital/game rendering, photorealism or text. Transparent outside the sheep, same composition and aspect ratio.
