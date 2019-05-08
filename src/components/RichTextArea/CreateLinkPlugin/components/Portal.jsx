import React from 'react'
import ReactDOM from 'react-dom'

class Portal extends React.Component {
  constructor(props) {
    super(props)
    this.root = document.createElement('div')
  }

  appendMaskIntoDoc() {
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      this.props.children,
      this.root
    )
  }
  componentDidMount() {
    document.body.appendChild(this.root)
    this.appendMaskIntoDoc()
  }

  componentDidUpdate() {
    this.appendMaskIntoDoc()
  }

  componentWillUnmount() {
    document.body.removeChild(this.root)
  }

  render() {
    return null
    // return ReactDOM.createPortal(this.props.children, this.root)
  }
}

export default Portal
