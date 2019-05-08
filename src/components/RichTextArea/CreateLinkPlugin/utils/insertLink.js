import { EditorState, Modifier } from 'draft-js'

const insertLink = (editorState, text, link) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

  let newContentState = contentState.createEntity('LINK', 'MUTABLE', {
    link
  })
  const entityKey = newContentState.getLastCreatedEntityKey()

  newContentState = Modifier.replaceText(
    newContentState,
    selection,
    text || link,
    null,
    entityKey
  )
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'insert-fragment'
  )

  return newEditorState
}

export default insertLink
