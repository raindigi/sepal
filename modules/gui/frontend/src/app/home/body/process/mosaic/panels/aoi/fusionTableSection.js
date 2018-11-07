import {setAoiLayer} from 'app/home/map/aoiLayer'
import {loadFusionTableColumns$, queryFusionTable$} from 'app/home/map/fusionTable'
import {sepalMap} from 'app/home/map/map'
import _ from 'lodash'
import React from 'react'
import {Subject} from 'rxjs'
import {map, takeUntil} from 'rxjs/operators'
import {connect} from 'store'
import {msg} from 'translate'
import ComboBox from 'widget/comboBox'
import {Input} from 'widget/form'
import {RecipeActions, RecipeState} from '../../mosaicRecipe'

const mapStateToProps = (state, ownProps) => {
    const recipeState = RecipeState(ownProps.recipeId)
    return {
        columns: recipeState('ui.fusionTable.columns'),
        rows: recipeState('ui.fusionTable.rows')
    }
}

class FusionTableSection extends React.Component {
    constructor(props) {
        super(props)
        this.fusionTableChanged$ = new Subject()
        this.fusionTableColumnChanged$ = new Subject()
        this.fusionTableRowChanged$ = new Subject()
        this.recipe = RecipeActions(props.recipeId)
    }

    loadFusionTableColumns(fusionTableId) {
        this.props.stream('LOAD_FUSION_TABLE_COLUMNS',
            loadFusionTableColumns$(fusionTableId, {excludedTypes: ['LOCATION']}).pipe(
                map(response => {
                    if (response.error)
                        this.props.inputs.fusionTable.setInvalid(
                            msg(response.error.key)
                        )
                    this.recipe.setFusionTableColumns(response.columns || [])
                        .dispatch()
                }),
                takeUntil(this.fusionTableChanged$))
        )
    }

    loadFusionTableRows(column) {
        this.props.stream('LOAD_FUSION_TABLE_ROWS',
            queryFusionTable$(`
                    SELECT '${column}'
                    FROM ${this.props.inputs.fusionTable.value}
                    ORDER BY '${column}' ASC
            `).pipe(
                map(e => {
                        this.recipe.setFusionTableRows(
                            (e.response.rows || [])
                                .map(row => row[0])
                                .filter(value => value))
                            .dispatch()
                    }
                ),
                takeUntil(this.fusionTableColumnChanged$),
                takeUntil(this.fusionTableChanged$)
            )
        )
    }

    updateBounds(updatedBounds) {
        const {recipeId, inputs: {bounds}} = this.props
        if (!_.isEqual(bounds.value, updatedBounds))
            bounds.set(updatedBounds)
        sepalMap.getContext(recipeId).fitLayer('aoi')
    }

    render() {
        const {stream, columns, rows, inputs: {fusionTable, fusionTableColumn, fusionTableRow}} = this.props
        const columnState = stream('LOAD_FUSION_TABLE_COLUMNS') === 'ACTIVE'
            ? 'loading'
            : columns && columns.length > 0
                ? 'loaded'
                : 'noFusionTable'
        const rowState = stream('LOAD_FUSION_TABLE_ROWS') === 'ACTIVE'
            ? 'loading'
            : rows
                ? (rows.length === 0 ? 'noRows' : 'loaded')
                : fusionTable.value
                    ? 'noColumn'
                    : 'noFusionTable'

        return (
            <React.Fragment>
                <Input
                    label={msg('process.mosaic.panel.areaOfInterest.form.fusionTable.fusionTable.label')}
                    autoFocus
                    input={fusionTable}
                    placeholder={msg('process.mosaic.panel.areaOfInterest.form.fusionTable.fusionTable.placeholder')}
                    spellCheck={false}
                    onChange={e => {
                        fusionTableColumn.set('')
                        fusionTableRow.set('')
                        this.recipe.setFusionTableColumns(null).dispatch()
                        this.recipe.setFusionTableRows(null).dispatch()
                        this.fusionTableChanged$.next()
                        this.fusionTableColumnChanged$.next()
                        this.fusionTableRowChanged$.next()
                        const fusionTableMinLength = 30
                        if (e && e.target.value.length > fusionTableMinLength)
                            this.loadFusionTableColumns(e.target.value)
                    }}
                    errorMessage
                />
                <ComboBox
                    label={msg('process.mosaic.panel.areaOfInterest.form.fusionTable.column.label')}
                    input={fusionTableColumn}
                    isLoading={stream('LOAD_FUSION_TABLE_COLUMNS') === 'ACTIVE'}
                    disabled={!columns || columns.length === 0}
                    placeholder={msg(`process.mosaic.panel.areaOfInterest.form.fusionTable.column.placeholder.${columnState}`)}
                    options={(columns || []).map(({name}) => ({value: name, label: name}))}
                    onChange={e => {
                        fusionTableRow.set('')
                        this.recipe.setFusionTableRows(null).dispatch()
                        this.fusionTableColumnChanged$.next()
                        this.fusionTableRowChanged$.next()
                        if (e && e.value)
                            this.loadFusionTableRows(e.value)
                    }}
                    errorMessage
                />
                <ComboBox
                    label={msg('process.mosaic.panel.areaOfInterest.form.fusionTable.row.label')}
                    input={fusionTableRow}
                    isLoading={stream('LOAD_FUTION_TABLE_ROWS') === 'ACTIVE'}
                    disabled={!rows}
                    placeholder={msg(`process.mosaic.panel.areaOfInterest.form.fusionTable.row.placeholder.${rowState}`)}
                    options={(rows || []).map(value => ({value, label: value}))}
                    onChange={() => this.fusionTableRowChanged$.next()}
                    errorMessage
                />
            </React.Fragment>
        )
    }

    componentDidMount() {
        const {inputs: {fusionTable, fusionTableColumn}} = this.props
        if (fusionTable.value)
            this.loadFusionTableColumns(fusionTable.value)
        if (fusionTableColumn.value)
            this.loadFusionTableRows(fusionTableColumn.value)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.inputs === this.props.inputs)
            return

        const {recipeId, inputs: {fusionTable, fusionTableColumn, fusionTableRow, bounds}, componentWillUnmount$} = this.props
        setAoiLayer({
            contextId: recipeId,
            aoi: {
                type: 'FUSION_TABLE',
                id: fusionTable.value,
                keyColumn: fusionTableColumn.value,
                key: fusionTableRow.value,
                bounds: bounds.value
            },
            fill: true,
            destroy$: componentWillUnmount$,
            onInitialized: layer => this.updateBounds(layer.bounds)
        })
    }
}

export default connect(mapStateToProps)(FusionTableSection)
