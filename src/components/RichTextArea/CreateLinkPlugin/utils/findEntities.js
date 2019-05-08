const findEntities = type => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity()
    if (!entityKey) return false
    const entity = contentState.getEntity(entityKey)
    return entity.getType() === type
  }, callback)
}

export default findEntities
