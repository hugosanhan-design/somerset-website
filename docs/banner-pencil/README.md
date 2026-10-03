# Somerset pencil landscape — 2026-10-03

The attached screenshot of the first coloured-pencil study is the approved visual reference. Use `public/scene/pencil/summer.webp` as the master composition. The seasonal plates keep the castle, cottages, pony, and apple tree in corresponding positions. Sheep and crow are separate animated layers, so the background can change without changing their motion.

- Spring: blossom, bluebells, new green.
- Summer: the approved pencil palette, with the sheep removed from the plate.
- Autumn: copper leaves and harvest grass.
- Winter: leafless and tawny, without snow.
- Snow: a separate winter snow plate, selected only for live snow codes.
- Weather: Open-Meteo current conditions near Dunster (`51.18, -3.44`); checked on load and every 15 minutes. Fog, cloud, rain, snow, and thunder alter the plate with overlays/particles. Rain density uses the current precipitation reading and weather code. The badge reports current conditions or states when unavailable.
- Wind: the same request reads speed, direction, and gusts at 10 m. When breezy, pencil wind strokes, meadow grass, and autumn leaves move; stronger wind increases motion. Rain and snow drift with the horizontal wind component, chimney smoke follows it, and the crow flaps faster. Meteorological direction is converted from the direction wind comes from into the direction it travels on screen.
- Time: season uses the Europe/London calendar. The weather request also supplies the day's actual Dunster sunrise and sunset as Unix timestamps. A drawn sun moves from the eastern sky through midday to the western sky; warm dawn and dusk washes rise and fade around the real solar times. Darkness blends in over an hour, while castle and cottage windows light after sunset. Solar lighting refreshes every minute. Cottage smoke rises in cool weather and at night.
- Motion: scroll moves the sheep along the foreground ground curve; leg angles change with distance. The crow follows its existing flight and wing-flap animation. Reduced-motion settings stop decorative movement.

Verification: production build with Webpack passed; focused weather/season/terrain assertions passed. Browser visual testing was unavailable because the in-app Browser blocked the local preview URL. Review the visual placement in a permitted preview before publishing.

Design lesson: Hugo prefers a slightly uneven, carefully drawn wooden coloured-pencil look over photorealism, game art, or polished vector shapes. The supplied screenshot is the canonical reference for future variants.
