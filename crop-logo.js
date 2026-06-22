const sharp = require('sharp');

async function crop() {
  try {
    await sharp('aibo-logo-bg-removed.png')
      .trim()
      .toFile('aibo-logo-cropped.png');
    console.log('Successfully cropped image');
  } catch (err) {
    console.error('Error:', err);
  }
}

crop();
