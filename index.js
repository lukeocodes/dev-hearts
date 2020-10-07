const fs = require('fs');
const { convertFile } = require('convert-svg-to-png');

const config = require('./.heartrc.json')

const srcDir = fs.readdirSync('./src');
const srcFiles = srcDir.filter(e => e.match(/.*\.svg/ig));

let destFilename;

process.setMaxListeners(0);

const convertHearts = (srcDir, buildDir) => {
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
  }
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
  config.sizes.map((size) => {
    srcFiles.map((file) => {
      destFilename = file.substring(0, file.length - 4) + '_' + size + '.png';
      convertFile(srcDir + file, {
        outputFilePath: buildDir + destFilename,
        width: size,
        height: size
      })
        .then(d => console.log('Created ' + d))
        .catch(e => console.error(e));
    });
  });
}

convertHearts(config.srcDir, config.destDir);
