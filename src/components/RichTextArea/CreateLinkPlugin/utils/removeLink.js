import { EditorState, Modifier } from 'draft-js'

const removeLink = editorState => {
  const contentState = editorState.getCurrentContent()
  const selectionState = editorState.getSelection()
  const startKey = selectionState.getStartKey()
  const contentBlock = contentState.getBlockForKey(startKey)
  const startOffset = selectionState.getStartOffset()
  let entity = contentBlock.getEntityAt(startOffset)

  if (!entity) {
    entity = contentBlock.getEntityAt(startOffset - 1) /* ' ' */
    if (!entity) {
      return EditorState.undo(editorState)
    }
  }

  let entitySelection = null

  contentBlock.findEntityRanges(
    character => character.getEntity() === entity,
    (start, end) => {
      entitySelection = selectionState.merge({
        anchorOffset: start,
        focusOffset: end
      })
    }
  )

  const newContentState = Modifier.applyEntity(
    contentState,
    entitySelection,
    null
  ).set('selectionAfter', editorState.getSelection())

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'apply-entity'
  )

  return newEditorState
}

export default removeLink
