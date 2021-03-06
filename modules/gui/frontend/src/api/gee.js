import {get$, postForm$, postJson$} from 'http-client'
import {map} from 'rxjs/operators'

export default {
    preview$: ({recipe, ...params}) =>
        postJson$('/api/gee/preview', {body: {recipe, ...params}, retries: 0}),
    bands$: ({asset, recipe, ...params}) =>
        postJson$('/api/gee/bands', {body: {asset, recipe, ...params}, retries: 0})
            .pipe(toResponse),
    imageMetadata$: ({asset, recipe}) =>
        postJson$('/api/gee/imageMetadata', {body: {asset, recipe}, retries: 0})
            .pipe(toResponse),
    sceneAreas$: ({aoi, source}) =>
        postJson$('/api/gee/sceneareas', {
            body: {
                aoi,
                source
            }
        }).pipe(toResponse),
    scenesInSceneArea$: ({sceneAreaId, dates, sources, sceneSelectionOptions}) =>
        get$(`/api/data/sceneareas/${sceneAreaId}`, {
            query: {
                query: JSON.stringify({dates, sources, sceneSelectionOptions})
            }
        }).pipe(toResponse),
    autoSelectScenes$: ({sceneAreaIds, sources, dates, sceneSelectionOptions, sceneCount, cloudCoverTarget}) =>
        postForm$('/api/data/best-scenes', {
            body: {
                query: JSON.stringify({
                    sceneAreaIds, sources, dates, sceneSelectionOptions, sceneCount, cloudCoverTarget
                })
            }
        }).pipe(toResponse),
    recipeGeometry$: recipe =>
        postJson$('/api/gee/recipe/geometry', {body: {recipe}})
            .pipe(toResponse),
    loadEETableColumns$: tableId =>
        get$('/api/gee/table/columns',
            {query: {tableId}}
        ).pipe(toResponse),
    loadEETableColumnValues$: (tableId, columnName) =>
        get$('/api/gee/table/columnValues',
            {query: {tableId, columnName}}
        ).pipe(toResponse),
    eeTableMap$: ({tableId, columnName, columnValue, color, fillColor}) =>
        get$('/api/gee/table/map',
            {query: {tableId, columnName, columnValue, color, fillColor}}
        ).pipe(toResponse),
    queryEETable$: ({select, from, where, orderBy}) =>
        postJson$('/api/gee/table/query',
            {body: {select, from, where, orderBy}}
        ).pipe(toResponse),
    loadCCDCTimeSeries$: ({recipe, latLng}) =>
        postJson$('/api/gee/loadCCDCTimeSeries',
            {body: {recipe, latLng}, retries: 0}
        ).pipe(toResponse),
    loadCCDCSegments$: ({asset, latLng}) =>
        postJson$('/api/gee/loadCCDCSegments',
            {body: {asset, latLng}, retries: 0}
        ).pipe(toResponse)
}

const toResponse = map(e => e.response)
