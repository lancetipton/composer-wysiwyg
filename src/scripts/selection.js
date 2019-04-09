/**
 * Gets the currently selected text content
 * @return { object } selected rage of text
 */
export const getSelection = () => {
  if(typeof window === 'undefined') return
  else {
    return window.getSelection
      ? window.getSelection()
      : document.selection
        ? document.selection
        : null
  }
}
  

/**
 * Gets the selected text content
 * @param  { object } selection - dom api selection || range object { IE }
 * @return { string } - selected text
 */
export const getSelectedText = selection => {
  if(typeof window === 'undefined') return ''
  else {
    selection = selection || getSelection()
    return window.getSelection
      ? selection && selection.toString()
      : selection && selection.createRange && selection.createRange().text
  }
}

/**
 * Gets the x / y document pos of the caret based on the current selection
 * @return { object } - x / y pos of the caret
 */
export const getSelectionCoords = selection => {
  selection = selection || getSelection()
  if (!selection) return null

  if (selection.boundingLeft && selection.boundingTop)
    return { x: selection.boundingLeft, y: selection.boundingTop }

  if (!selection.rangeCount) return null

  const range  = selection.getRangeAt && selection.getRangeAt(0)
  if ((!range || !range.getClientRects) && !selection.rangeCount) return null
  const rects = range.getClientRects()

  return rects.length > 0
    ? { x: rects[0].left, y: rects[0].top }
    : selection.anchorNode && selection.anchorNode.getBoundingClientRect()
}


/**
 * Gets the current position of the caret
 * @param  { dom Node } element - editable dom node
 * @param  { object } selection - current select rage of text
 * @return { number } current caret position
 */
export const getSelectionRange = selection => {
  selection = selection || getSelection()
  return selection.rangeCount
    ? selection.getRangeAt(0)
    : null
}

export const getCaretPosition = (el, selection) => {
  const range = getSelectionRange(selection)
  if (!range) return null

  const selected = range.toString().length
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(el)
  preCaretRange.setEnd(range.endContainer, range.endOffset)

  return preCaretRange.toString().length - selected
}

export const addSelectionRange = (range, selection, clean = true) => {
  selection = selection || getSelection()
  if (!range || selection || !selection.addRange) return null
  clean && selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * Sets the caret position in the editable area of the element
 * @param  { dom Node } element - editable dom node
 * @param  { number } position - current pos of the caret
 * @return { void }
 */
export const setCaretPosition = (element, position) => {
  const selection = getSelection()
  if (!selection.rangeCount) return null
  const range = document.createRange()
  range.setStart(element, position)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

