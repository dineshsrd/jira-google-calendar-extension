#!/usr/bin/env node

/**
 * Generate PNG icons for the Chrome extension
 * Run with: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple SVG to PNG conversion using a basic approach
// Note: This is a simplified version. For production, you might want to use a library like sharp

function generateIcon(size) {
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#0052cc" rx="${size / 8}"/>
    <rect x="${size / 8}" y="${size / 6}" width="${size * 3 / 4}" height="${size * 2 / 3}" fill="white" rx="${size / 16}"/>
    <rect x="${size / 4}" y="${size / 4}" width="${size / 2}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size / 4}" y="${size / 3}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size * 3 / 8}" y="${size / 3}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size / 2}" y="${size / 3}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size / 4}" y="${size * 2 / 3}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size * 3 / 8}" y="${size * 2 / 3}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size / 2}" y="${size * 2 / 3}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size / 4}" y="${size * 5 / 6}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size * 3 / 8}" y="${size * 5 / 6}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
    <rect x="${size / 2}" y="${size * 5 / 6}" width="${size / 8}" height="${size / 16}" fill="#0052cc"/>
</svg>`;

    return svg;
}

function createIconFiles() {
    const iconSizes = [16, 48, 128];
    const iconsDir = path.join(__dirname, 'icons');

    // Ensure icons directory exists
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('🎨 Generating Chrome extension icons...');

    iconSizes.forEach(size => {
        const svg = generateIcon(size);
        const svgPath = path.join(iconsDir, `icon${size}.svg`);
        const pngPath = path.join(iconsDir, `icon${size}.png`);

        // Save SVG file
        fs.writeFileSync(svgPath, svg);
        console.log(`✅ Created icon${size}.svg`);

        // Note: Converting SVG to PNG requires additional libraries
        // For now, we'll create the SVG files and provide instructions
        console.log(`📝 To convert to PNG: Open icon${size}.svg in a browser and save as PNG`);
    });

    console.log('\n📋 Next steps:');
    console.log('1. Open the SVG files in a web browser');
    console.log('2. Right-click and "Save image as..." PNG');
    console.log('3. Or use online converters like favicon.io');
    console.log('4. Place the PNG files in the icons/ folder');
    console.log('\n🎯 Alternative: Use the create-icons.html file for easier conversion!');
}

// Run the script
if (require.main === module) {
    createIconFiles();
}

module.exports = { generateIcon, createIconFiles }; 