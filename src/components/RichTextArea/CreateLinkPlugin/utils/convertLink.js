import { EditorState, SelectionState, Modifier } from 'draft-js'

import linkify from './linkify'

const convertLink = (editorState, preprocess) => {
  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const blockKey = selection.getStartKey()
  const block = contentState.getBlockForKey(blockKey)
  const blockType = block.getType()

  if (blockType === 'atomic' || blockType === 'code-block') return null

  const offset = selection.getStartOffset()
  const text = block.getText().slice(0, offset)

  if (!text.length || !linkify.pretest(text)) return null

  let start
  for (let i = text.length - 1; i >= 0; i--) {
    if (
      text[i] === ' ' ||
      block.getEntityAt(i) !== null ||
      block.getInlineStyleAt(i).has('CODE')
    ) {
      break
    }
    start = i
  }
  const textToSearch = text.slice(start)

  const matched = linkify.match(textToSearch)
  if (!matched || !matched.length) return null

  const lastMatched = matched[matched.length - 1]
  if (lastMatched.lastIndex !== textToSearch.length) return null

  const entitySelection = new SelectionState({
    anchorKey: blockKey,
    anchorOffset: start + lastMatched.index,
    focusKey: blockKey,
    focusOffset: offset
  })

  let newEditorState = editorState
  if (preprocess) {
    newEditorState = preprocess(newEditorState)
  }

  let newContentState = newEditorState.getCurrentContent()
  newContentState = newContentState.createEntity('LINK', 'MUTABLE', {
    url: lastMatched.url
  })
  const entityKey = newContentState.getLastCreatedEntityKey()
  newContentState = Modifier.applyEntity(
    newContentState,
    entitySelection,
    entityKey
  )
  newContentState = newContentState.set(
    'selectionAfter',
    newEditorState.getSelection()
  )
  newEditorState = EditorState.push(
    newEditorState,
    newContentState,
    'apply-entity'
  )

  return newEditorState
}

export default convertLink
