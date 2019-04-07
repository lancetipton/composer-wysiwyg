import Popper from 'popper.js'
import { setCaretPosition } from './selection'

/**
 * Callback called when a popper.js instance is created
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { function }
 */
const onPopperCreate = settings => {
  return (instance) => {
    const { element, popper } = settings
    const caretEl = element.firstChild || element
    setCaretPosition(caretEl, 0)
    // Check if the popper onCreate method exists and call it
    popper && popper.onCreate && popper.onCreate(popper, settings)
    element.focus()
  }
}

/**
 * Add Popper to the editor with the joined default and passed int popper settings
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @param  { dom node } rootEl - root element of the editor
 * @return { void }
 */
export default (settings, rootEl, cb) => {
  const { Editor, element, isStatic, offset } = settings
  if (isStatic) return null
  // Check if a popper already exists, and is so kill it
  if (Editor.popper){
    Editor.popper.destroy()
    Editor.popper = null
  }

  settings.caretPos = element.getBoundingClientRect()
  settings.caretPos.y = settings.caretPos.y + offset.y || 0
  settings.caretPos.x = settings.caretPos.x + offset.x || 0
  // Set the def caret pos
  // Will be updated separately, but the popper holds a reference to this object
  // When updating this object it also updates the reference in the popper object
  const ref = {
    getBoundingClientRect: () => ({
      top: settings.caretPos.y,
      right: settings.caretPos.x,
      bottom: settings.caretPos.y,
      left: settings.caretPos.x,
      width: settings.caretPos.width,
      height: settings.caretPos.height,
    }),
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight,
  }
  // Copy the popper settings
  const popperProps = { ...settings.popper }
  // Overwrite the onCreate method if it exists
  popperProps.onCreate = onPopperCreate(settings)
  // Create the new popper
  Editor.popper = new Popper(ref, rootEl, popperProps)
  cb(settings)
}

