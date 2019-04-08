const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require("./state")

const googleSearchCredentials = require('../credentials/google_search.json')

async function robot() {
    const content = state.load()

    await updateContentImageBlacklist();
    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)
    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImageLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImageLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineID,
            q: query,
            searchType: 'image',
            imgSize: 'huge',
            rights: 'cc_publicdomain',
            num: 5
        })

        const imageUrl = response.data.items.map(item => {
            return item.link
        })

        return imageUrl
    }

    async function downloadAllImages(content) {
        content.downloadedImages = []
        for (let sentencesIndex = 0; sentencesIndex < content.sentences.length; sentencesIndex++) {
            const images = content.sentences[sentencesIndex].images
            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]

                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Imagem já foi baixada.')
                    }
                    if (content.blacklistedImages.includes(imageUrl)) {
                        throw new Error('Blacklisted Image refused.')
                    }
                    await downloadAndSave(imageUrl, `${sentencesIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`>>> [${sentencesIndex}][${imageIndex}]:Baixou imagem com sucesso: ${imageUrl}`)
                    break
                } catch (err) {
                    console.log(`>>> [${sentencesIndex}][${imageIndex}]:Erro ao baixar (${imageUrl}): ${err}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName) {
        return imageDownloader.image({
            url,
            url,
            dest: `./content/${fileName}`
        })
    }

    async function updateContentImageBlacklist() {
        const imageBlacklist = state.loadBlacklist()
        for (image in imageBlacklist) {
            if (!content.blacklistedImages) {
                content.blacklistedImages = []
            }
            if (!content.blacklistedImages.includes(imageBlacklist[image])) {
                content.blacklistedImages.push(imageBlacklist[image])
            }
        }
    }
}

module.exports = robot