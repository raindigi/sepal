const ee = require('@google/earthengine')
const {toGeometry} = require('@sepal/ee/aoi')
const {createCollection} = require('./collection')
const {toDateComposite, toTimeScan} = require('@sepal/ee/radar/composite')

const moment = require('moment')

const mosaic = (recipe, selectedBands) => {
    const model = recipe.model
    const region = toGeometry(model.aoi)
    let {fromDate: startDate, toDate: endDate, targetDate} = model.dates
    const {orbits, geometricCorrection, speckleFilter, outlierRemoval} = model.options
    const harmonicDependents = [...new Set(selectedBands
        .filter(harmonicBand)
        .map(band => {
            return band.replace('_' + harmonicBand(band), '')
        }))]
    return {
        getImage() {
            const dateFormat = 'YYYY-MM-DD'
            const days = 366 / 2
            if (targetDate && !startDate)
                startDate = moment(targetDate).add(-days, 'days').format(dateFormat)
            if (targetDate && !endDate)
                endDate = moment(targetDate).add(days, 'days').format(dateFormat)

            const collection = createCollection({
                startDate,
                endDate,
                targetDate,
                region,
                orbits,
                geometricCorrection,
                speckleFilter,
                outlierRemoval,
                harmonicDependents
            })
            let mosaic = targetDate
                ? toDateComposite(collection, targetDate)
                : toTimeScan(collection)
            if (harmonicDependents.length) {
                const harmonics = ee.Image(collection.get('harmonics'))
                mosaic = mosaic.addBands(harmonics)
            }
            return mosaic.clip(region)
        },
        getVisParams() {
            const bands = {
                VV: {range: [-20, 2]},
                VV_min: {range: [-25, 4]},
                VV_mean: {range: [-18, 6]},
                VV_median: {range: [-18, 6]},
                VV_max: {range: [-17, 10]},
                VV_stdDev: {range: [0, 5]},
                VV_CV: {range: [-6, 28]},
                VV_fitted: {range: [-22, 0]},
                VV_residuals: {range: [0, 2.4], stretch: [1, 0.5]},
                VV_t: {range: [-4, 4]},
                VV_phase: {range: [-3.14, 3.14]},
                VV_amplitude: {range: [0.5, 5]},
                VH: {range: [-22, 0]},
                VH_min: {range: [-34, 4]},
                VH_mean: {range: [-27, 0]},
                VH_median: {range: [-27, 0]},
                VH_max: {range: [-26, 2]},
                VH_stdDev: {range: [0, 6]},
                VH_fitted: {range: [-20, 2]},
                VH_residuals: {range: [0, 2.4], stretch: [1, 0.5]},
                VH_t: {range: [-4, 4]},
                VH_phase: {range: [-3.14, 3.14]},
                VH_amplitude: {range: [0.5, 5]},
                VH_CV: {range: [0, 35]},
                ratio_VV_median_VH_median: {range: [2, 16]},
                NDCV: {range: [-1, 1]},
                ratio_VV_VH: {range: [3, 14]},
                constant: {range: [-280, 215]},
                dayOfYear: {range: [0, 366], palette: '00FFFF, 000099'},
                daysFromTarget: {range: [0, 183], palette: '008000, FFFF00, FF0000'},
            }
            const min = selectedBands.map(band => bands[band].range[0])
            const max = selectedBands.map(band => bands[band].range[1])
            const stretch = selectedBands.map(band => bands[band].stretch)
            const palette = selectedBands.length === 1
                ? selectedBands[0].stretch
                : null

            const hsv = harmonicDependents.length > 0
            return {bands: selectedBands, min, max, stretch, palette, hsv}
        }
    }
}

const harmonicBand = band =>
    ['constant', 't', 'phase', 'amplitude', 'residuals']
        .find(harmonicBand => band.endsWith('_' + harmonicBand))

module.exports = mosaic