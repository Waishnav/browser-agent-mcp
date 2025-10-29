// Simple script to create placeholder PNG icons
// Uses canvas to create simple colored squares with text

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  
  // Draw rounded rectangle
  const radius = size / 5;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Draw robot emoji
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('��', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

// Check if canvas module is available
try {
  require.resolve('canvas');
  generateIcon(16, './icon16.png');
  generateIcon(48, './icon48.png');
  generateIcon(128, './icon128.png');
} catch (e) {
  console.log('Canvas module not available. Creating simple placeholder files.');
  // Create minimal PNG files as fallback
  const createPlaceholder = (size, filename) => {
    // This is a minimal 1x1 transparent PNG, not ideal but works as placeholder
    const minimalPNG = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(filename, minimalPNG);
    console.log(`Created placeholder ${filename}`);
  };
  
  createPlaceholder(16, './icon16.png');
  createPlaceholder(48, './icon48.png');
  createPlaceholder(128, './icon128.png');
}
