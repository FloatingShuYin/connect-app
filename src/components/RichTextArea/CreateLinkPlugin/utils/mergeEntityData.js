import { EditorState } from 'draft-js'

const mergeEntityData = (editorState, entityKey, data) => {
  const contentState = editorState.getCurrentContent()
  const newContentState = contentState.mergeEntityData(entityKey, data)
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'change-entity-data'
  )
  return EditorState.forceSelection(
    EditorState.set(newEditorState, { lastChangeType: 'change-entity-data' }),
    newEditorState.getSelection()
  )
}

export default mergeEntityData
