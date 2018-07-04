import {RecipeActions, RecipeState} from 'app/home/body/process/mosaic/mosaicRecipe'
import {googleMap, MapObject, sepalMap} from 'app/home/map/map'
import React from 'react'
import {connect} from 'store'
import styles from './sceneAreas.module.css'

const mapStateToProps = (state, ownProps) => {
    const {recipeId, sceneAreaId} = ownProps
    const recipeState = RecipeState(recipeId)
    const selectedScenes = recipeState(['scenes', sceneAreaId]) || []
    return {
        selectedSceneCount: selectedScenes.length,
        loading: recipeState('ui.autoSelectingScenes')
    }
}

class SceneAreaMarker extends React.Component {
    constructor(props) {
        super(props)
        this.recipe = RecipeActions(props.recipeId)
    }

    render() {
        const {sceneAreaId, center, polygon, selectedSceneCount, loading} = this.props
        const zoom = sepalMap.getZoom()
        const scale = Math.min(1, Math.pow(zoom, 2.5) / Math.pow(8, 2.5))
        const size = `${1.5 * 4 * scale}rem`
        const halfSize = `${1.5 * 2 * scale}rem`
        return (
            <MapObject
                lat={center.lat()}
                lng={center.lng()}
                width={size}
                height={size}
                className={[styles.sceneArea, loading ? styles.loading : null].join(' ')}>
                <svg
                    height={size}
                    width={size}
                    onMouseOver={() => !loading && polygon.setMap(googleMap)}
                    onMouseLeave={() => polygon.setMap(null)}
                    onClick={() => loading ? null : this.selectScenes(sceneAreaId)}>
                    <circle cx={halfSize} cy={halfSize} r={`${2 * scale}rem`}/>
                    {zoom > 4
                        ? <text x={halfSize} y={halfSize} textAnchor='middle' alignmentBaseline="central">
                            {selectedSceneCount}
                        </text>
                        : null}
                </svg>
            </MapObject>
        )
    }

    selectScenes(sceneAreaId) {
        this.recipe.setSceneSelection(sceneAreaId).dispatch()
    }

}

export default connect(mapStateToProps)(SceneAreaMarker)