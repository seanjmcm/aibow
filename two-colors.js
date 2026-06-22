const sharp = require('sharp');

function colorDistance(c1, c2) {
  return Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2);
}

async function applyTwoColors() {
  const input = 'aibo-logo-cleaned.png';
  const output = 'aibo-logo-two-colors.png';
  
  try {
    const { data, info } = await sharp(input)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 128) {
        pixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }

    if (pixels.length === 0) {
      console.log('No opaque pixels found');
      return;
    }

    // Initialize centers with two most distant pixels to ensure we capture two distinct colors
    let centers = [pixels[0], pixels[0]];
    let maxDist = 0;
    for (let i = 0; i < 200; i++) {
        let p1 = pixels[Math.floor(Math.random() * pixels.length)];
        let p2 = pixels[Math.floor(Math.random() * pixels.length)];
        let d = colorDistance(p1, p2);
        if (d > maxDist) {
            maxDist = d;
            centers = [p1, p2];
        }
    }

    let assignments = new Array(pixels.length).fill(0);
    
    // K-means iteration
    for (let iter = 0; iter < 10; iter++) {
      const sums = [[0,0,0], [0,0,0]];
      const counts = [0, 0];

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        const d0 = colorDistance(p, centers[0]);
        const d1 = colorDistance(p, centers[1]);
        const cluster = d0 < d1 ? 0 : 1;
        assignments[i] = cluster;
        sums[cluster][0] += p[0];
        sums[cluster][1] += p[1];
        sums[cluster][2] += p[2];
        counts[cluster]++;
      }

      for (let k = 0; k < 2; k++) {
        if (counts[k] > 0) {
          centers[k] = [
            Math.round(sums[k][0] / counts[k]),
            Math.round(sums[k][1] / counts[k]),
            Math.round(sums[k][2] / counts[k])
          ];
        }
      }
    }

    console.log('Found colors:', centers);

    // Snap all pixels to the two found colors
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const p = [data[i], data[i + 1], data[i + 2]];
        const d0 = colorDistance(p, centers[0]);
        const d1 = colorDistance(p, centers[1]);
        const cluster = d0 < d1 ? 0 : 1;
        data[i] = centers[cluster][0];
        data[i + 1] = centers[cluster][1];
        data[i + 2] = centers[cluster][2];
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
    
    console.log('Applied two colors successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

applyTwoColors();
