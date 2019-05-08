import { EditorState, Modifier } from 'draft-js'

const insertText = (
  editorState,
  text,
  inlineStyle = null,
  entityKey = null
) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const newContentState = Modifier.replaceText(
    contentState,
    selection,
    text,
    inlineStyle,
    entityKey
  )
  return EditorState.push(editorState, newContentState, 'insert-fragment')
}

export default insertText
