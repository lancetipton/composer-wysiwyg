/**
 * Gets the currently selected text content
 * @return { object } selected rage of text
 */
export const getSelection = () =>
  window.getSelection
    ? window.getSelection()
    : document.selection
      ? document.selection.createRange()
      : null

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
    : null

}


/**
 * Gets the current position of the caret
 * @param  { dom Node } element - editable dom node
 * @param  { object } selection - current select rage of text
 * @return { number } current caret position
 */
export const getCaretPosition = (el, selection) => {
  const range = selection.getRangeAt(0)
  const selected = range.toString().length
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(el)
  preCaretRange.setEnd(range.endContainer, range.endOffset)

  return preCaretRange.toString().length - selected
}


/**
 * Sets the caret position in the editable area of the element
 * @param  { dom Node } element - editable dom node
 * @param  { number } position - current pos of the caret
 * @return { void }
 */
export const setCaretPosition = (element, position) => {
  const sel = getSelection()
  const range = document.createRange()
  range.setStart(element, position)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

