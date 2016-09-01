import React, { Component, PropTypes } from 'react'
import Modal from 'react-modal'
import _ from 'lodash'
import update from 'react-addons-update'
import FeaturePicker from '../../FeatureSelector/FeaturePicker'
import { Formsy, Icons } from 'appirio-tech-react-components'

import SpecSection from './SpecSection'

class EditProjectForm extends Component {

  constructor(props) {
    super(props)
    this.enableButton = this.enableButton.bind(this)
    this.disableButton = this.disableButton.bind(this)
    this.showFeaturesDialog = this.showFeaturesDialog.bind(this)
    this.hideFeaturesDialog = this.hideFeaturesDialog.bind(this)
    this.saveFeatures = this.saveFeatures.bind(this)
    this.resetFeatures = this.resetFeatures.bind(this)
    this.submit = this.submit.bind(this)
  }

  componentWillMount() {
    this.setState({
      project: Object.assign({}, this.props.project),
      isFeaturesDirty: false,
      canSubmit: false,
      showFeaturesDialog: false
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      project: Object.assign({}, nextProps.project),
      isFeaturesDirty: false,
      canSubmit: false
    })
  }


  enableButton() {
    this.setState( { canSubmit: true })
  }

  disableButton() {
    this.setState({ canSubmit: false })
  }

  showFeaturesDialog() {
    this.setState({ showFeaturesDialog : true})
  }

  hideFeaturesDialog() {
    this.setState({ showFeaturesDialog: false })
  }

  saveFeatures(features) {
    const obj = { value: features, seeAttached: false }
    this.setState(update(this.state, {
      project: { details: { appDefinition: { features: { $set: obj } } } },
      isFeaturesDirty: { $set: true },
      canSubmit: { $set: true }
    }))
  }

  resetFeatures() {
    this.saveFeatures([])
  }

  submit(model, resetForm, invalidateForm) {
    if (this.state.isFeaturesDirty) {
      model.details.appDefinition.features.value = this.state.project.details.appDefinition.features.value
    }
    this.props.submitHandler(model, resetForm, invalidateForm)
  }

  render() {
    const { isEdittable, sections } = this.props
    const { project } = this.state
    const renderSection = (section, idx) => (
      <SpecSection
        key={idx}
        {...section}
        project={project}
        resetFeatures={this.resetFeatures}
        showFeaturesDialog={this.showFeaturesDialog}
      />
    )

    return (
      <div>
        <Formsy.Form onSubmit={this.submit} onValid={this.enableButton} disabled={!isEdittable} onInvalid={this.disableButton}>
          {sections.map(renderSection)}
          <div className="button-area">
            <button className="tc-btn tc-btn-primary tc-btn-md" type="submit" disabled={!this.state.canSubmit}>Save Changes</button>
          </div>
        </Formsy.Form>
        <Modal
          isOpen={ this.state.showFeaturesDialog }
          className="feature-selection-dialog"
          onRequestClose={ this.hideFeaturesDialog }
        >
          <FeaturePicker features={ _.get(project, 'details.appDefinition.features.value', []) } onSave={ this.saveFeatures }/>
          <div onClick={ this.hideFeaturesDialog } className="feature-selection-dialog-close">
            <Icons.XMarkIcon />
          </div>
        </Modal>
      </div>
    )
  }
}

EditProjectForm.propTypes = {
  project: PropTypes.object.isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  isEdittable: PropTypes.bool.isReqiured,
  submitHandler: PropTypes.func.isRequired
}

export default EditProjectForm