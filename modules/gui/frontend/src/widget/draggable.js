import {compose} from 'compose'
import Hammer from 'hammerjs'
import PropTypes from 'prop-types'
import React from 'react'
import {animationFrameScheduler, fromEvent, interval} from 'rxjs'
import {distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators'
import withSubscriptions from 'subscription'
import Portal from 'widget/portal'
import styles from './draggable.module.css'

class _Draggable extends React.Component {
    state = {
        dragging: null,
        x: null,
        y: null
    }

    draggableRef = React.createRef()

    render() {
        const {element, children} = this.props
        const {dragging, position} = this.state
        return (
            <div
                ref={this.draggableRef}
                className={[
                    styles.draggable,
                    dragging ? styles.dragging : null
                ].join(' ')}>
                {children}
                {/*{dragging && position*/}
                {/*    ? <Portal type='global'>*/}
                {/*        <div className={styles.elementWrapper} style={{left: position.x, top: position.y}}>*/}
                {/*            <div className={styles.element}>*/}
                {/*                {element}*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </Portal>*/}
                {/*    : null*/}
                {/*}*/}
            </div>
        )
    }

    componentDidMount() {
        const {addSubscription} = this.props
        const draggable = this.draggableRef.current
        const hammer = new Hammer(draggable)
        hammer.get('pan').set({direction: Hammer.DIRECTION_ALL})
        const pan$ = fromEvent(hammer, 'panstart panmove panend')
        const filterPanEvent = type => pan$.pipe(filter(e => e.type === type))
        const start$ = filterPanEvent('panstart')
        const move$ = filterPanEvent('panmove')
        const end$ = filterPanEvent('panend')
        const animationFrame$ = interval(0, animationFrameScheduler)
        const drag$ = start$.pipe(
            switchMap(() =>
                animationFrame$.pipe(
                    switchMap(() =>
                        move$.pipe(
                            map(e => e.center)
                        )),
                    distinctUntilChanged()
                )
            )
        )
        addSubscription(
            start$.subscribe(() => this.onStart()),
            drag$.subscribe(e => this.onDrag(e)),
            end$.subscribe(() => this.onEnd())
        )
    }

    onStart() {
        const {onStart} = this.props
        this.setState({dragging: true})
        onStart && onStart()
    }

    onDrag(position) {
        const {onDrag} = this.props
        this.setState({position})
        onDrag && onDrag(position)
    }

    onEnd() {
        const {onEnd} = this.props
        this.setState({dragging: false, position: null})
        onEnd && onEnd()
    }
}

const Draggable = compose(
    _Draggable,
    withSubscriptions()
)

export default Draggable

Draggable.propTypes = {
    children: PropTypes.any.isRequired

}
