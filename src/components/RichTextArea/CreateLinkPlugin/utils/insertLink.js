import { EditorState, Modifier } from 'draft-js'

const insertLink = (editorState, text, url) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()

  let newContentState = contentState.createEntity('LINK', 'MUTABLE', {
    url
  })
  const entityKey = newContentState.getLastCreatedEntityKey()

  newContentState = Modifier.replaceText(
    newContentState,
    selection,
    text || url,
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
