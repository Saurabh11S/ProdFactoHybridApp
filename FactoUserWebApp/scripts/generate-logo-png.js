/**
 * Script to convert SVG logo to PNG format
 * 
 * Requirements:
 * - Install puppeteer: npm install --save-dev puppeteer
 * - Or use sharp: npm install --save-dev sharp
 * 
 * Usage:
 * node scripts/generate-logo-png.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoDir = path.join(__dirname, '../public/logo');
const svgPath = path.join(logoDir, 'NavLogo.svg');
const outputSizes = [
  { size: 32, name: 'favicon-32.png' },
  { size: 64, name: 'favicon-64.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 200, name: 'NavLogo.png' } // Default size
];

async function convertSvgToPng() {
  try {
    // Check if puppeteer is available
    let puppeteer;
    try {
      puppeteer = await import('puppeteer');
    } catch (e) {
      console.log('Puppeteer not found. Trying alternative method...');
      // Fallback: Use sharp if available
      try {
        const sharp = (await import('sharp')).default;
        await convertWithSharp(sharp);
        return;
      } catch (e2) {
        console.error('Neither puppeteer nor sharp is installed.');
        console.log('\nTo install puppeteer: npm install --save-dev puppeteer');
        console.log('Or install sharp: npm install --save-dev sharp');
        console.log('\nAlternatively, you can:');
        console.log('1. Open NavLogo.svg in a browser');
        console.log('2. Use browser DevTools to take a screenshot');
        console.log('3. Or use online tools like CloudConvert');
        return;
      }
    }

    // Read SVG file
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    // Launch browser
    const browser = await puppeteer.default.launch();
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 512, height: 512 });
    
    // Create HTML with SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: transparent;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PNGs for each size
    for (const { size, name } of outputSizes) {
      await page.setViewport({ width: size, height: size });
      const outputPath = path.join(logoDir, name);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        clip: { x: 0, y: 0, width: size, height: size }
      });
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    await browser.close();
    console.log('\n✓ All PNG files generated successfully!');
    
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    console.log('\nManual conversion options:');
    console.log('1. Open NavLogo.svg in Chrome/Firefox');
    console.log('2. Right-click > Inspect > Screenshot node');
    console.log('3. Or use online tools: CloudConvert, SVGtoPNG');
  }
}

async function convertWithSharp(sharp) {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const { size, name } of outputSizes) {
    const outputPath = path.join(logoDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }
  
  console.log('\n✓ All PNG files generated successfully!');
}

// Run conversion
convertSvgToPng();

