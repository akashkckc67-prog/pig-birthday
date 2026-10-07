# Nayana · Twenty Eight

An interactive birthday celebration using four supplied personal photos, an original yellow pear mascot, and playful animated pigs.

## Run locally

Requires Node 22.13 or newer. Run `npm ci`, then `npm run dev`.

For a local production preview, run `npm start`. It automatically runs the build when `dist/server/wrangler.json` is missing, then starts the local worker. After changing the source, run `npm run build` to refresh an existing production build.

The five scenes are `/`, `/home`, `/memories`, `/surprises`, and `/birthday`. The surprise scene features the additional curl-haired portrait and 28 short birthday wishes with character reactions. All banana decorations and gags have been replaced with pigs. The birthday cake automatically blows out its candles after a short countdown and reveals the final photograph. Replay resets the candles and intro.

Music starts on the first click, including Enter or Skip intro. The music control is also available during the opening, and pauses both background music and cartoon sounds. A manual pause stays off across navigation and replay. The same audio element continues across scenes, pauses when the page is hidden, and resumes on return after successful playback. Playback failures show a retry message instead of claiming the music is on.

## Photos and artwork

Replace the photo files in `public/photos`, or update `components/birthday/photos.ts`. The original supplied JPEGs are preserved. No facial transformations or color filters are applied.

`public/art/pip-sprites.webp`, `cake.webp`, and `pig-sprites.webp` are original bitmap artwork generated with the built-in imagegen tool. Prompts: yellow pear mascot in a blue hoodie with turquoise glasses (happy, waving, surprised, celebrating); matching vanilla/yellow cake with blue piping and sprinkles without candles; pink baby pig (happy, winking, surprised, celebrating). Sprite sheets use four equal quadrants.

Fonts are locally served Bricolage Grotesque, Manrope, and Caveat. Motion uses transform and opacity, canvas confetti is temporary, and reduced-motion preferences disable continuous effects and make the opening available immediately. Mobile includes bottom chapter navigation and swipe chapter navigation.

`public/audio/birthday-music.wav` is an original 40-second instrumental loop synthesized for this site: bells, plucked keys, soft bass, and light percussion. It is stereo 22.05 kHz, 16-bit PCM, with a peak of −10 dBFS and no clipped samples. It is served locally and contains no third-party song recording.

To recreate the loop, run `node scripts/create-birthday-music.cjs public/audio/birthday-music.wav`.

The experimental WebMCP celebration action is feature-detected and does not affect ordinary browsing.

Validation: TypeScript and production build pass. Browser checks cover the automatic celebration/replay journey, pig reaction, sound toggle, memory dialog, all five requested phone widths, and reduced motion. Native experimental WebMCP validation was unavailable in the installed browser.

Music checks confirm a decoded nonzero waveform, advancing playback time, continuous looping, chapter and replay continuity, touch and keyboard controls, mute preference, foreground resume, cancelled loading, and recovery from blocked or failed playback.

Production-worker checks verify successful image and audio responses, a loaded cake before automatic celebration, the final photograph, both floating memory photos, and replay without failed resource requests.
