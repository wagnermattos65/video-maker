const fs = require('fs')
const contentFilePath = './content.json'
const imagesBlacklistPath = './images-blacklist.json'

function save(content) {
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

function load() {
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

function loadBlacklist() {
    try {
        const fileBuffer = fs.readFileSync(imagesBlacklistPath, 'utf-8')
        const contentJson = JSON.parse(fileBuffer)

    } catch (err) {
        contentJson = []
    }
    return contentJson
}

module.exports = {
    save,
    load,
    loadBlacklist
}