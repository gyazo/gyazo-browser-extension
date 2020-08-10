/* eslint-env node */
const { writeFileSync } = require('fs');
const path = require('path');
const type = process.argv[2];
const extensionBaseName = type === 'teams' ? 'Gyazo Teams' : 'Gyazo';
const extensionId =
  type === 'teams'
    ? 'gyazo-teams-extension@gyazo.com'
    : 'gyazo-extension@gyazo.com';

const { version } = require('../package.json');

[('chrome', 'firefox')].forEach((browser) => {
  const manifestBase = require(`../src/manifests/${browser}.json`);
  const overwrite =
    browser === 'firefox'
      ? {
          version,
          name: extensionBaseName,
          applications: { gecko: { id: extensionId } },
        }
      : { version, name: extensionBaseName };
  const manifest = {
    ...manifestBase,
    ...overwrite,
  };
  writeFileSync(
    path.resolve(__dirname, `../dist/${type}/${browser}/manifest.json`),
    JSON.stringify(manifest)
  );
});
