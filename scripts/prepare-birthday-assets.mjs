import { writeFile } from 'node:fs/promises';
const families = [
  ['bricolage', 'Bricolage+Grotesque:wght@200..800'],
  ['manrope', 'Manrope:wght@200..800'],
  ['caveat', 'Caveat:wght@400..700'],
];
await Promise.all(families.map(async ([name, family]) => {
  const response = await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' } });
  if (!response.ok) throw new Error(`Font stylesheet failed: ${name}`);
  const css = await response.text();
  const fontUrl = [...css.matchAll(/url\((https:[^)]+)\)/g)].at(-1)?.[1];
  if (!fontUrl) throw new Error(`No font URL: ${name}`);
  const font = await fetch(fontUrl);
  if (!font.ok) throw new Error(`Font download failed: ${name}`);
  await writeFile(`public/fonts/${name}.woff2`, Buffer.from(await font.arrayBuffer()));
  console.log(`Downloaded ${name}`);
}));
