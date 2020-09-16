import moment from 'moment'

const J_DAYS = 0
const FRACTIONAL_YEARS = 1
const UNIX_TIME_MILLIS = 2

const POINTS = 100
const SCALE = 10000

export const fitSegments = ({segments, band, dateFormat = J_DAYS}) => {
    if (!segments.tStart)
        return undefined
    const startDate = moment(fromT(segments.tStart[0]))
    const endDate = moment(fromT(segments.tEnd[segments.tEnd.length - 1]))
    const totalDays = endDate.diff(startDate, 'days')
    const daysPerPoint = totalDays / POINTS

    return segments.tStart.map((_, i) => fitSegment({
        tStart: segments.tStart[i],
        tEnd: segments.tEnd[i],
        coefs: segments[`${band}_coefs`][i],
        daysPerPoint,
        dateFormat
    }))
}

const fitSegment = ({tStart, tEnd, coefs, daysPerPoint, dateFormat}) => {
    const startDate = moment(fromT(tStart))
    const endDate = moment(fromT(tEnd))
    const days = endDate.diff(startDate, 'days')
    return sequence(0, days, daysPerPoint).map(dateOffset => {
        const date = moment(startDate).add(dateOffset, 'days').toDate()
        const value = fit(coefs, date, dateFormat) / SCALE
        return {date, value}
        }
    )
}

const fit = (coefs, date, dateFormat) => {
    const t = toT(date)
    const omega = getOmega(dateFormat)

    return coefs[0] + (coefs[1] * t) +
        coefs[2] * Math.cos(t * omega) + coefs[3] * Math.sin(t * omega) +
        coefs[4] * Math.cos(t * omega * 2) + coefs[5] * Math.sin(t * omega * 2) +
        coefs[6] * Math.cos(t * omega * 3) + coefs[7] * Math.sin(t * omega * 3)
}

const getOmega = (dateFormat) => {
    switch(dateFormat) {
        case J_DAYS:
            return 2.0 * Math.PI / 365.25
        case FRACTIONAL_YEARS:
            return 2.0 * Math.PI
        case UNIX_TIME_MILLIS:
            return 2.0 * Math.PI * 60 * 60 * 24 * 365.25
        default:
            throw Error('Only dateFormat 0 (jdate), 1 (fractional years), and 2 (unix seconds) is supported')
    }
}

const fromT = (t, dateFormat = J_DAYS) => {
    switch (dateFormat) {
        case J_DAYS:
            const epochDay = 719529
            return new Date((t - epochDay) * 1000 * 3600 * 24)
        // case FRACTIONAL_YEARS:
        //     const firstOfYear = ee.Date.fromYMD(t.floor(), 1, 1)
        //     const firstOfNextYear = firstOfYear.advance(1, 'year')
        //     const daysInYear = firstOfNextYear.difference(firstOfYear, 'day')
        //     const dayOfYear = daysInYear.multiply(t.mod(1)).floor()
        //     return firstOfYear.advance(dayOfYear, 'day')
        case UNIX_TIME_MILLIS:
            return new Date(t)
        default:
            throw Error('Only dateFormat 0 (jdate), 1 (fractional years), and 2 (unix seconds) is supported')
    }
}

const toT = (date, dateFormat = J_DAYS) => {
    switch (dateFormat) {
        case J_DAYS:
            const epochDay = 719529
            return date.getTime() / 1000 / 3600 / 24 + epochDay
        case FRACTIONAL_YEARS:
            const firstOfYear = new Date(Date.UTC(date.getFullYear(), 0, 1, 0, 0, 0))
            const firstOfNextYear = new Date(Date.UTC(date.getFullYear() + 1, 0, 1, 0, 0, 0))
            const fraction = (date - firstOfYear) / (firstOfNextYear - firstOfYear)
            return date.getFullYear() + fraction
        case UNIX_TIME_MILLIS:
            return date.getTime()
        default:
            throw Error('Only dateFormat 0 (jdate), 1 (fractional years), and 2 (unix seconds) is supported')
    }
}

const sequence = (start, end, step = 1) =>
    Array.apply(null, {length: Math.floor((end - start) / step) + 1})
        .map((_, i) => i * step + start)