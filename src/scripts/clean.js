import { removeEventListener } from './utils'

/**
 * Removes the event listeners from the content editor dom node
 * @return { void }
 */
const clearEvents = (settings) => {
  const { Editor } = settings
  if (Editor.contentEl){
    try {
      removeEventListener(Editor.contentEl, 'compositionstart', Editor.composition.start)
      removeEventListener(Editor.contentEl, 'compositionend', Editor.composition.end)
      removeEventListener(Editor.contentEl, 'keydown', Editor.onKeyDown)
      removeEventListener(Editor.contentEl, 'click', Editor.onClick)
    }
    catch (e){
      console.warn('Failed to remove event listeners')
    }
  }
  // Remove selection change listener
  Editor.onSelChange &&
    removeEventListener(document, 'selectionchange', Editor.onSelChange)
}

const clearObj = obj => Object
  .keys(obj)
  .map(key => {
    obj[key] = undefined
    delete obj[key]
  })

/**
 * Cleans up the Editor object
 * Cleans up the Editor object
 */
const clearEditor = settings => {
  const { Editor, isStatic, classes } = settings
  Editor.composition.end = undefined
  Editor.composition.start = undefined
  try {
    Editor.popper && Editor.popper.destroy && Editor.popper.destroy()
    // Popper does not completely remove the object and refs on destroy
    // So do our own clean up, clear out all props of the popper tool
    Editor.popper &&
      Editor.popper.popper &&
      Editor.popper.popper.parentNode &&
      Editor.popper.popper.parentNode.removeChild(Editor.popper.popper)

    Editor.popper && Object
      .keys(Editor.popper)
      .map(key => Editor.popper[key] = undefined)
    // Remove ref to the popper tool
    Editor.popper = undefined

    if (isStatic){
      const currentCont = Editor.contentEl.innerHTML
      Editor.contentEl.parentNode.innerHTML = currentCont
    }
    else {
      Editor.contentEl.removeAttribute('contenteditable')
      Editor.contentEl.classList.remove(classes.CONTENT)
    }
  }
  catch (e){
    console.warn(e)
  }
  // Clean up the settings
  try {
    clearObj(Editor.buttons)
    clearObj(Editor)
    clearObj(settings)
  }
  catch (e){
    console.warn(e)
  }
}


export default (settings) => {
  settings.Editor &&
    settings.Editor.buttons &&
    settings.Editor.buttons.clearCache()

  clearEvents(settings)
  clearEditor(settings)
}

