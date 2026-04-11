import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PDFParse } from 'pdf-parse';

const pdfUrl = 'https://tortoladehenares.es/wp-content/uploads/tortola-guia-turistica.pdf';
const outDir = path.join(process.cwd(), '.tmp-pdf');

await mkdir(outDir, { recursive: true });

const parser = new PDFParse({ url: pdfUrl });
const result = await parser.getScreenshot({ desiredWidth: 260 });

const meta = [];

for (let index = 0; index < result.pages.length; index += 1) {
  const filePath = path.join(outDir, `page-${String(index + 1).padStart(2, '0')}.png`);
  await writeFile(filePath, result.pages[index].data);
  meta.push({ filePath, page: index + 1 });
}

const cellWidth = 260;
const cellHeight = 360;
const labelHeight = 34;
const columns = 3;
const thumbs = [];

for (const item of meta) {
  const image = sharp(item.filePath).resize(cellWidth, cellHeight, {
    fit: 'contain',
    background: '#ffffff'
  });

  const label = Buffer.from(
    `<svg width="${cellWidth}" height="${labelHeight}">
      <rect width="100%" height="100%" fill="#163f6b" />
      <text x="18" y="23" font-size="18" font-family="Arial" fill="#ffffff">Página ${item.page}</text>
    </svg>`
  );

  const buffer = await sharp({
    create: {
      width: cellWidth,
      height: cellHeight + labelHeight,
      channels: 4,
      background: '#f5f7fb'
    }
  })
    .composite([
      { input: await image.png().toBuffer(), top: labelHeight, left: 0 },
      { input: label, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  thumbs.push(buffer);
}

const rows = Math.ceil(thumbs.length / columns);
const sheetWidth = columns * cellWidth;
const sheetHeight = rows * (cellHeight + labelHeight);

const composites = thumbs.map((buffer, index) => ({
  input: buffer,
  left: (index % columns) * cellWidth,
  top: Math.floor(index / columns) * (cellHeight + labelHeight)
}));

const contactSheetPath = path.join(outDir, 'contact-sheet.png');

await sharp({
  create: {
    width: sheetWidth,
    height: sheetHeight,
    channels: 4,
    background: '#e9eef5'
  }
})
  .composite(composites)
  .png()
  .toFile(contactSheetPath);

await parser.destroy();

console.log(contactSheetPath);