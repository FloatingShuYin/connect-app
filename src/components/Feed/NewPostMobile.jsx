/**
 * Create a new post for mobile devices
 *
 * It's done in two steps:
 * - enter post title (status)
 * - enter post/comment text
 *
 * This component use native textarea instead of DraftJS editor for mobile devices
 * because DraftJS editor has critical bug on mobile devices https://github.com/facebook/draft-js/issues/1077
 * and it's not officially support them https://draftjs.org/docs/advanced-topics-issues-and-pitfalls.html#mobile-not-yet-supported
 */
import React from 'react'
import PropTypes from 'prop-types'
import MobilePage from '../MobilePage/MobilePage'

import SwitchButton from 'appirio-tech-react-components/components/SwitchButton/SwitchButton'
import XMartIcon from '../../assets/icons/x-mark.svg'
import './NewPostMobile.scss'

export const NEW_POST_STEP = {
  STATUS: 'STATUS',
  COMMENT: 'COMMENT'
}

// we need it to calulate body height based on the actual mobile browser viewport height
const HEADER_HEIGHT = 50

class NewPostMobile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      step: props.step,
      statusValue: '',
      commentValue: '',
      browserActualViewportHeigth: document.documentElement.clientHeight,
      isPrivate: false
    }

    this.setStep = this.setStep.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
    this.updateBrowserHeight = this.updateBrowserHeight.bind(this)
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateBrowserHeight)
    this.updateBrowserHeight()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateBrowserHeight)
  }

  updateBrowserHeight() {
    this.setState({ browserActualViewportHeigth: document.documentElement.clientHeight })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isCreating !== this.props.isCreating && !nextProps.isCreating && !nextProps.hasError) {
      this.props.onClose()
    }
  }

  setStep(step) {
    this.setState({ step })
  }

  onValueChange() {
    if (this.state.step === NEW_POST_STEP.STATUS) {
      this.setState({ statusValue: this.refs.value.value })
      if (this.props.onPostChange) {
        this.props.onPostChange(this.refs.value.value, this.state.commentValue)
      }
    } else {
      this.setState({ commentValue: this.refs.value.value })
      if (this.props.onPostChange) {
        this.props.onPostChange(this.state.statusValue, this.refs.value.value)
      }
    }
  }

  render() {
    const {
      statusTitle, commentTitle, commentPlaceholder, submitText, onPost, onClose,
      isCreating, nextStepText, statusPlaceholder, canAccessPrivatePosts
    } = this.props
    const { step, statusValue, commentValue, browserActualViewportHeigth, isPrivate } = this.state

    let value
    let title
    let placeholder
    let onBtnClick
    let btnText

    if (step === NEW_POST_STEP.STATUS) {
      value = statusValue
      title = statusTitle
      placeholder = statusPlaceholder
      onBtnClick = () => {
        this.setStep(NEW_POST_STEP.COMMENT)
      }
      btnText = nextStepText
    } else {
      value = commentValue
      title = commentTitle
      placeholder = commentPlaceholder
      onBtnClick = () => onPost({
        title: statusValue,
        content: commentValue,
        isPrivate
      })
      btnText = submitText
    }

    return (
      <MobilePage>
        <div styleName="header">
          {canAccessPrivatePosts ?
            <SwitchButton
              name="private-post"
              onChange={(evt) => this.setState({isPrivate: evt.target.checked})}
              checked={isPrivate}
              label="Private"
            /> :
            <div styleName="plug" />
          }
          <div styleName="title">{title}</div>
          <div styleName="close-wrapper"><XMartIcon onClick={onClose} /></div>
        </div>
        <div styleName="body" style={{ height: browserActualViewportHeigth - HEADER_HEIGHT }}>
          <textarea
            ref="value"
            value={value}
            styleName="textarea"
            placeholder={placeholder}
            onChange={this.onValueChange}
            disabled={isCreating}
          />
          <div styleName="submit-wrapper">
            <button
              className="tc-btn tc-btn-primary tc-btn-md"
              onClick={onBtnClick}
              disabled={!value.trim() || isCreating}
            >{isCreating ? 'Posting...' : btnText}</button>
          </div>
        </div>
      </MobilePage>
    )
  }
}

NewPostMobile.defaultProps = {
  step: NEW_POST_STEP.STATUS
}

NewPostMobile.propTypes = {
  statusTitle: PropTypes.string,
  commentTitle: PropTypes.string,
  statusPlaceholder: PropTypes.string,
  commentPlaceholder: PropTypes.string,
  submitText: PropTypes.string,
  nextStepText: PropTypes.string,
  onPost: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isCreating: PropTypes.bool,
  hasError: PropTypes.bool,
  canAccessPrivatePosts: PropTypes.bool,
}

export default NewPostMobile
