import {
  EditorState,
  SelectionState,
  Modifier,
  getDefaultKeyBinding,
  KeyBindingUtil
} from 'draft-js'

import { BehaviorSubject } from 'rxjs'

import insertText from './utils/insertText'
import insertLink from './utils/insertLink'
import convertLink from './utils/convertLink'
import findEntities from './utils/findEntities'
import removeLink from './utils/removeLink'
import mergeEntityData from './utils/mergeEntityData'
import linkify from './utils/linkify'
import { getSelectionText } from 'draftjs-utils'
import { hasEntity } from '../../../helpers/draftJSHelper'

import React from 'react'
import Link from './components/Link'

const { hasCommandModifier } = KeyBindingUtil

const createLinkPlugin = (config = {}) => {
  const store = {}
  const currentEntityKey = new BehaviorSubject()
  const autoTrigger = !!config.autoTrigger

  //  Delete link
  const remove = () => {
    const newEditorState = removeLink(store.getEditorState())
    if (newEditorState) {
      store.setEditorState(newEditorState)
    }
  }

  // Update link
  const update = (blockKey, entityKey, decoratedText, text, url) => {
    const data = store
      .getEditorState()
      .getCurrentContent()
      .getEntity(entityKey)
      .getData()

    const editorState = store.getEditorState()
    const contentState = editorState.getCurrentContent()
    const block = contentState.getBlockForKey(blockKey)

    // eslint-disable-next-line one-var
    let start, end
    block.findEntityRanges(
      char => char.getEntity() === entityKey,
      (rangeStart, rangeEnd) => {
        start = rangeStart
        end = rangeEnd
      }
    )

    const entitySelection = new SelectionState({
      hasFocus: true,
      anchorKey: blockKey,
      anchorOffset: start,
      focusKey: blockKey,
      focusOffset: end
    })

    let newEditorState = editorState

    if (url !== data.url) {
      if (url) {
        newEditorState = mergeEntityData(newEditorState, entityKey, {
          url
        })
      } else {
        entityKey = null
        newEditorState = EditorState.push(
          newEditorState,
          Modifier.applyEntity(
            newEditorState.getCurrentContent(),
            entitySelection,
            null
          ).set('selectionAfter', newEditorState.getSelection()),
          'apply-entity'
        )
      }
    }

    if (text !== decoratedText) {
      newEditorState = EditorState.push(
        newEditorState,
        Modifier.replaceText(
          newEditorState.getCurrentContent(),
          entitySelection,
          text || url,
          null,
          entityKey
        ),
        'insert-fragment'
      )
    }

    if (newEditorState !== editorState) {
      store.setEditorState(newEditorState)
    }
  }

  return {
    initialize: pluginFunctions => {
      Object.assign(store, pluginFunctions)
    },
    willUnmount: () => {
      currentEntityKey.complete()
    },
    decorators: [
      {
        strategy: findEntities('LINK'),
        component: ({ offsetKey, entityKey, decoratedText, ...props }) => (
          <Link
            entityKey={entityKey}
            decoratedText={decoratedText}
            {...props}
            currentEntityKey={currentEntityKey}
            onRemove={remove}
            onUpdate={(text, url) => {
              const blockKey = offsetKey.split('-')[0]
              update(blockKey, entityKey, decoratedText, text, url)
            }}
            setReadOnly={store.setReadOnly}
            autoTrigger={autoTrigger}
          />
        )
      }
    ],
    onChange: editorState => {
      const selection = editorState.getSelection()

      if (selection.getHasFocus()) {
        const contentState = editorState.getCurrentContent()
        const blockKey = selection.getStartKey()
        const block = contentState.getBlockForKey(blockKey)
        const offset = selection.getStartOffset()
        currentEntityKey.next(block.getEntityAt(offset - 1))
      } else {
        currentEntityKey.next(null)
      }
      return editorState
    },
    handleReturn: () => {
      const newEditorState = convertLink(store.getEditorState(), editorState =>
        EditorState.push(
          editorState,
          Modifier.splitBlock(
            editorState.getCurrentContent(),
            editorState.getSelection()
          ),
          'split-block'
        )
      )
      if (newEditorState) {
        store.setEditorState(newEditorState)
        return 'handled'
      }
      return 'not-handled'
    },
    keyBindingFn: e => {
      if (e.keyCode === 75 /* `K` key */ && hasCommandModifier(e)) {
        return 'link'
      }
      return getDefaultKeyBinding(e)
    },
    handleKeyCommand: command => {
      if (command === 'link') {
        if (!hasEntity('LINK', store.getEditorState())) {
          const selectionText = getSelectionText(store.getEditorState())
          const newEditorState = insertLink(
            store.getEditorState(),
            selectionText === '' ? ' ' : selectionText,
            ''
          )

          if (newEditorState) {
            store.setEditorState(newEditorState)
          }
          return 'handled'
        }
      }
      return 'not-handled'
    },
    handleBeforeInput: chars => {
      if (chars === ' ') {
        const newEditorState = convertLink(
          store.getEditorState(),
          editorState =>
            insertText(editorState, ' ', editorState.getCurrentInlineStyle())
        )
        if (newEditorState) {
          store.setEditorState(newEditorState)
          return 'handled'
        }
      }
      return 'not-handled'
    },
    handlePastedText: text => {
      const matched = linkify.match(text)
      if (
        matched &&
        matched.length === 1 &&
        matched[0].index === 0 &&
        matched[0].lastIndex === text.length
      ) {
        const newEditorState = insertLink(
          store.getEditorState(),
          matched[0].url,
          matched[0].url
        )
        if (newEditorState) {
          store.setEditorState(newEditorState)
          return 'handled'
        }
      }
      return 'not-handled'
    }
  }
}

export default createLinkPlugin
