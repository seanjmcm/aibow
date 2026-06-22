const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');

async function run() {
  console.log('Removing background...');
  const blob = await removeBackground('aibo-logo.png');
  const buffer = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync('aibo-logo-temp.png', buffer);
  console.log('Saved aibo-logo-temp.png');
}
run();
