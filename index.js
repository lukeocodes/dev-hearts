const fs = require('fs')
const { convertFile } = require('convert-svg-to-png')

const config = require('./.heartrc.json')

const srcDir = fs.readdirSync('./src')
const srcFiles = srcDir.filter(e => e.match(/.*\.svg/ig))

process.setMaxListeners(0)

const convertHearts = (srcDir, buildDir) => {
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir)
  }
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir)
  }

  const fileTable = srcFiles.map(file => {
    const name = file.substring(0, file.length - 4)

    return {
      name: `:${name}:`,
      path: file,
      pngs: config.sizes.map(
        size => ({ 
          size,
          name: `${name}${size/config.defaultSize === 1 ? '' : `@${size/config.defaultSize}x`}.png`
        })
      )
    }
  })

  console.log(fileTable)

  fileTable.forEach(file => {
    file.pngs.forEach(png => {
      convertFile(srcDir + file.path, {
        outputFilePath: buildDir + png.name,
        width: png.size,
        height: png.size
      })
        .then(d => console.log('Created ' + d))
        .catch(e => console.error(e))
    })
  })
}

convertHearts(config.srcDir, config.destDir)
