import React from 'react'
import ReactDOM from 'react-dom'

import Popper from 'popper.js'

import Portal from './Portal'

class Bubble extends React.Component {
  componentDidMount() {
    if (this.props.open) {
      this.popper = this.createPopper()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open && !this.props.open) {
      if (this.popper) {
        this.popper.destroy()
        this.popper = null
      }
    }
    if (!prevProps.open && this.props.open) {
      this.popper = this.createPopper()
    }
    if (this.popper && prevProps.positionKey !== this.props.positionKey) {
      this.popper.update()
    }
  }

  createPopper() {
    const target = ReactDOM.findDOMNode(this)
    return new Popper(target, this.bubble, {
      placement: 'bottom-start'
    })
  }

  render() {
    const { open, bubble, children } = this.props
    return (
      <span>
        {children}
        {open && (
          <Portal>
            <span ref={node => (this.bubble = node)} className="bubble">
              <span className="bubbleContent">{bubble}</span>
            </span>
          </Portal>
        )}
      </span>
    )
  }
}

export default Bubble
