import React from 'react'
import PropTypes from 'prop-types'
import Bubble from './Bubble'

import '../style/Link.scss'

import linkify from '../utils/linkify'

class Link extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bubbleOpen: false,
      isSmallBubble: true,
      isBigBubble: false,
      isBubble: false,
      isSelf: true,
      inputText: '',
      inputLink: ''
    }
    this.remove = this.remove.bind(this)
    this.apply = this.apply.bind(this)
    this.focusOut = this.focusOut.bind(this)
    this.handlerKeyDown = this.handlerKeyDown.bind(this)
  }
  remove() {
    this.setState(
      {
        bubbleOpen: false
      },
      () => {
        if (!this.state.isSmallBubble) {
          this.setState({
            isSmallBubble: true
          })
        }
        if (this.state.inputText === ' ') {
          this.props.onRemove()
          return false
        }
      }
    )
  }

  apply() {
    const inputText = this.state.inputText.trim()
    let inputLink = this.state.inputLink.trim()
    if (inputLink === '') inputLink = inputText
    const matched = linkify.match(inputLink)
    if (matched && matched.length === 1 && matched[0].index === 0) {
      if (inputText === '') {
        this.props.onUpdate(matched[0].url, matched[0].url)
      } else {
        this.props.onUpdate(inputText, matched[0].url)
      }
    }
  }

  handlerKeyDown(event) {
    if (event.keyCode === 13 /* enter key */) {
      if (this.state.bubbleOpen && !this.state.isSmallBubble) {
        this.props.setReadOnly(false)
        this.refs.applyButton.click()
        event.preventDefault()
      }
    }
    if (event.keyCode === 27 /* esc key */) {
      if (this.state.bubbleOpen && !this.state.isSmallBubble) {
        this.props.setReadOnly(false)
        this.remove()
      }
    }
  }

  focusOut(event) {
    const list = [
      'linkbubble-change',
      'linkbubble-big',
      'linkbubble-text-wrapper',
      'linkbubble-text-input',
      'linkbubble-link-wrapper',
      'linkbubble-link-input',
      'linkbubble-small'
    ]

    if (list.some(item => event.target.classList.contains(item))) {
      return false
    }

    try {
      if (
        event.target.parentNode &&
        event.target.parentNode.parentNode &&
        event.target.parentNode.parentNode.classList.contains('linkbubble-link')
      ) {
        if (this.state.isSelf) {
          this.setState({
            bubbleOpen: true
          })
          return false
        }
      }
    } catch (error) {
      return false
    }

    this.remove()
  }

  componentDidMount() {
    const { entityKey, decoratedText, contentState } = this.props
    const entity = contentState.getEntity(entityKey)
    const data = entity.getData()
    this.setState({
      inputText: decoratedText,
      inputLink: data.link
    })

    if (this.props.autoTrigger) {
      this.setState({
        bubbleOpen: true
      })
    }

    this.subscription = this.props.currentEntityKey.subscribe(
      currentEntityKey => {
        if (currentEntityKey !== null) {
          this.setState({
            isSelf: currentEntityKey === this.props.entityKey
          })
        }
      }
    )

    document.addEventListener('click', this.focusOut)
    document.addEventListener('keydown', this.handlerKeyDown)
  }

  componentWillUnmount() {
    this.subscription.unsubscribe()
    cancelAnimationFrame(this.handler)
    document.removeEventListener('click', this.focusOut)
    document.removeEventListener('keydown', this.handlerKeyDown)
  }

  render() {
    const {
      entityKey,
      decoratedText,
      contentState,
      onRemove,
      children
    } = this.props
    const entity = contentState.getEntity(entityKey)
    const data = entity.getData()

    const smallBubble = (
      <div className="linkbubble-small">
        <a href={data.link} target="_blank">
          {data.link}
        </a>
        <span>
          {' – '}
          <span
            className="linkbubble-change"
            role="button"
            tabIndex="0"
            onClick={() => {
              this.setState({
                isSmallBubble: false,
                isBubble: true
              })
            }}
          >
            {this.state.inputText.trim() === '' ||
            this.state.inputLink.includes(this.state.inputText)
              ? 'Add title'
              : 'Change'}
          </span>
          {' | '}
          <span
            className="linkbubble-remove"
            role="button"
            tabIndex="0"
            onClick={onRemove}
          >
            Remove
          </span>
        </span>
      </div>
    )

    const bigBubble = (
      <div
        className="linkbubble-big"
        onMouseDown={() => {
          this.setState({
            isSmallBubble: false,
            isBigBubble: true,
            isBubble: true
          })
        }}
      >
        <div className="linkbubble-text-wrapper">
          <label className="linkbubble-text-label">Text</label>
          <input
            type="text"
            autoFocus={
              this.state.inputText.trim() === '' ||
              this.state.inputLink.includes(this.state.inputText)
                ? 'autofocus'
                : ''
            }
            tabIndex="0"
            className="linkbubble-text-input"
            value={this.state.inputText}
            onSelect={() => {
              this.props.setReadOnly(true)
              this.setState({
                isSmallBubble: false,
                isBigBubble: true,
                isBubble: true
              })
            }}
            onBlur={() => this.props.setReadOnly(false)}
            onChange={event =>
              this.setState({
                inputText: event.target.value
              })
            }
          />
        </div>
        <div className="linkbubble-link-wrapper">
          <label className="linkbubble-link-label">Link</label>
          <input
            type="text"
            autoFocus={
              this.state.inputText.trim() === '' ||
              this.state.inputLink.includes(this.state.inputText)
                ? ''
                : 'autofocus'
            }
            tabIndex="0"
            placeholder="Paste a link"
            className="linkbubble-link-input"
            onSelect={() => {
              this.props.setReadOnly(true)
              this.setState({
                isSmallBubble: false,
                isBigBubble: true,
                isBubble: true
              })
            }}
            onBlur={() => this.props.setReadOnly(false)}
            value={this.state.inputLink}
            onClick={() => {
              this.setState({
                isSmallBubble: false,
                isBigBubble: true,
                isBubble: true
              })
            }}
            onChange={event =>
              this.setState({
                inputLink: event.target.value
              })
            }
          />
        </div>
        <div className="linkbubble-button-wrapper">
          <div
            ref="applyButton"
            role="button"
            className="linkbubble-button"
            tabIndex="0"
            onClick={this.apply}
          >
            Apply
          </div>
        </div>
      </div>
    )

    return (
      <Bubble
        open={this.state.bubbleOpen}
        positionKey={decoratedText}
        bubble={
          <span>
            {data.link !== '' &&
            this.state.isSmallBubble &&
            !this.state.isBigBubble
              ? smallBubble
              : bigBubble}
          </span>
        }
      >
        {decoratedText !== ' ' ? (
          <a
            className="linkbubble-link"
            href={data.link}
            onClickCapture={() => {
              this.setState({
                isSmallBubble: true,
                isBigBubble: false,
                isBubble: true
              })
            }}
          >
            {children}
          </a>
        ) : (
          <span
            className="linkbubble-link"
            href={data.link}
            onClickCapture={() => {
              this.setState({
                isSmallBubble: false,
                isBigBubble: true,
                isBubble: true
              })
            }}
          >
            {children}
          </span>
        )}
      </Bubble>
    )
  }
}

Link.propTypes = {
  entityKey: PropTypes.string.isRequired,
  decoratedText: PropTypes.string.isRequired,
  contentState: PropTypes.object.isRequired,
  // Automatically pop-up when first converted to a link
  autoTrigger: PropTypes.bool.isRequired,
  /**
   * Update the current edit entity
   *
   * function (
   *  text string,
   *  link string?
   * )
   */
  onUpdate: PropTypes.func.isRequired,
  /**
   * Remove the current edit entity
   *
   * function (
   * )
   */
  onRemove: PropTypes.func.isRequired,
  /**
   * Set whether the draft is readonly
   *
   * function (
   *  isReadOnly bool
   * )
   */
  setReadOnly: PropTypes.func.isRequired
}

export default Link
