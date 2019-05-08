import Linkify from 'linkify-it'
import tlds from 'tlds'

const linkify = new Linkify()

linkify
  .tlds(tlds)
  .add('ftp:', null)
  .add('mailto:', null)
  .set({ fuzzyEmail: false })

export default linkify
