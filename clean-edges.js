const sharp = require('sharp');

async function cleanEdges() {
  const input = 'aibo-logo-cropped.png';
  const output = 'aibo-logo-cleaned.png';
  
  try {
    const { data, info } = await sharp(input)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Apply contrast stretch to alpha channel to remove soft halos/fringes
    for (let i = 3; i < data.length; i += 4) {
      const a = data[i];
      if (a < 80) {
        data[i] = 0; // Drop faint fringes
      } else if (a > 180) {
        data[i] = 255; // Solidify core
      } else {
        // Smooth transition for anti-aliasing
        data[i] = Math.round((a - 80) * (255 / 100));
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png({ quality: 100 })
    .toFile(output);
    
    console.log('Cleaned edges successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

cleanEdges();
