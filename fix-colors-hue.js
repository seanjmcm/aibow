const sharp = require('sharp');

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hueDistance(h1, h2) {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

async function applyTwoColorsHue() {
  const input = 'aibo-logo-cleaned.png';
  const output = 'aibo-logo-two-colors.png';
  
  try {
    const { data, info } = await sharp(input)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const c1 = [28, 48, 90]; // Dark blue
    const c2 = [78, 182, 197]; // Teal

    const h1 = rgbToHsl(c1[0], c1[1], c1[2])[0];
    const h2 = rgbToHsl(c2[0], c2[1], c2[2])[0];

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const [h, s, l] = rgbToHsl(r, g, b);

        // If a pixel is completely gray/black/white, it has no hue. 
        // We'll fall back to RGB distance for low saturation pixels, 
        // but for faded edges, saturation is usually > 0.
        let isC1 = true;
        if (s < 0.05) {
            // achromatic fallback
            const d1 = Math.pow(r - c1[0], 2) + Math.pow(g - c1[1], 2) + Math.pow(b - c1[2], 2);
            const d2 = Math.pow(r - c2[0], 2) + Math.pow(g - c2[1], 2) + Math.pow(b - c2[2], 2);
            isC1 = d1 < d2;
        } else {
            const dist1 = hueDistance(h, h1);
            const dist2 = hueDistance(h, h2);
            isC1 = dist1 < dist2;
        }

        if (isC1) {
          data[i] = c1[0];
          data[i + 1] = c1[1];
          data[i + 2] = c1[2];
        } else {
          data[i] = c2[0];
          data[i + 1] = c2[1];
          data[i + 2] = c2[2];
        }
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
    
    console.log('Applied two colors via Hue successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

applyTwoColorsHue();
