const {concat} = require('rx')
const {switchMap} = require('rx/operators')
const moment = require('moment')
const {mkdirSafe$} = require('root/rxjs/fileSystem')
const {createVrt$, setBandNames$} = require('sepal/gdal')
const {exportImageToSepal$} = require('../jobs/export/toSepal')
const ImageFactory = require('sepal/ee/imageFactory')
const {getCurrentContext$} = require('root/jobs/service/context')

module.exports = {
    submit$: (id, {image: {recipe, bands, scale}}) =>
        getCurrentContext$().pipe(
            switchMap(({config}) => {
                const description = recipe.title || recipe.placeholder
                const preferredDownloadDir = `${config.homeDir}/downloads/${description}/`
                return mkdirSafe$(preferredDownloadDir, {recursive: true}).pipe(
                    switchMap(downloadDir =>
                        concat(
                            export$({description, downloadDir, recipe, bands, scale}),
                            postProcess$({description, downloadDir, bands})
                        )
                    )
                )
            })
        )
}

const export$ = ({description, downloadDir, recipe, bands, scale}) =>
    ImageFactory(recipe, bands).getImage$().pipe(
        switchMap(image =>
            exportImageToSepal$({
                image,
                folder: `${description}_${moment().format('YYYY-MM-DD_HH:mm:ss.SSS')}`,
                description, downloadDir, scale, crs: 'EPSG:4326'
            })
        )
    )

const postProcess$ = ({description, downloadDir, bands}) => {
    const vrtPath = `${downloadDir}/${description}.vrt`
    return concat(
        createVrt$({
            inputPaths: `${downloadDir}/*.tif`,
            outputPath: vrtPath
        }),
        setBandNames$(vrtPath, bands.selection)
    )
}
