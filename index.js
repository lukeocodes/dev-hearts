const fs = require('fs')
const { convertFile } = require('convert-svg-to-png')
const tablemark = require('tablemark')
const { capitalCase } = require('change-case')
const config = require('./.heartrc.json')

process.setMaxListeners(0)

const _srcLink = (file) => {
  return config.srcDir + file
}

const _destLink = (file) => {
  return config.destDir + file
}

const _htmlLink = (path, name) => {
  return `[${name}](${path})`
}

const _htmlImg = (path, name, size) => {
  return `<img src="${path}" alt="${name}" width="${size || '64'}" />`
}

const setup = () => {
  if (!fs.existsSync(config.srcDir)) {
    fs.mkdirSync(config.srcDir)
  }
  if (!fs.existsSync(config.destDir)) {
    fs.mkdirSync(config.destDir)
  }
}

const buildFileObject = () => {
  const srcFiles = fs
    .readdirSync(config.srcDir)
    .filter(e => e.match(/.*\.svg/ig))

  return srcFiles.map(file => {
    const name = file.substring(0, file.length - 4)

    return {
      name,
      svg: file,
      pngs: config.sizes.map(
        size => ({ 
          size,
          name: `${name}${size/config.defaultSize === 1 ? '' : `@${size/config.defaultSize}x`}.png`
        })
      )
    }
  })
}

const writeFiles = (files) => {
  files.forEach(file => {
    file.pngs.forEach(png => {
      convertFile(_srcLink(file.svg), {
        outputFilePath: _destLink(png.name),
        width: png.size,
        height: png.size
      })
        .then(d => console.log('Created ' + d))
        .catch(e => console.error(e))
    })
  })
}

const buildTableOutput = (files) => {
  files = files.map(file => ({
    name: capitalCase(file.name),
    code: `: ${file.name} :`,
    svg: _htmlImg(_srcLink(file.svg), file.name),
    pngs: file.pngs.map(png =>_htmlLink(_destLink(png.name), `${png.size}px`)).join(', ')
  }))

  return tablemark(files, config.tablemark)
}

const writeTableOutput = (output) => {
  const README = fs.readFileSync(config.table.file, 'utf8')
  const regex = new RegExp(String.raw`${config.table.openTag}[\s\S]*?${config.table.closeTag}`)
  fs.writeFileSync(config.table.file, README.replace(regex, `${config.table.openTag}\n${output}\n${config.table.closeTag}`), 'utf8')
}

setup()
const allFiles = buildFileObject()
writeFiles(allFiles)
const tableOutput = buildTableOutput(allFiles)
writeTableOutput(tableOutput)