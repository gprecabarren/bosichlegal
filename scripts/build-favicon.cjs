const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));

(async () => {
  const root = path.resolve(__dirname, '..');
  const svg = await fs.readFile(path.join(root, 'public/favicon.svg'));
  for (const [file, size] of [['public/favicon.png', 512], ['src/app/icon.png', 512], ['src/app/apple-icon.png', 180]]) {
    await sharp(svg).resize(size, size).png().toFile(path.join(root, file));
  }
  const png = await sharp(svg).resize(32, 32).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = header[7] = 32;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  await fs.writeFile(path.join(root, 'public/favicon.ico'), Buffer.concat([header, png]));
  console.log('Favicons SVG, PNG, ICO y Apple generados desde la pieza original del logo.');
})();
