import {
  addEventListener,
  appendChild,
  removeEventListener,
  queryCommandState,
  createElement,
  exec
} from './util'
import { BTN_ID_EXT, FORMAT_BLOCK, CLASSES } from './constants'

let buttonsCache
let openDropdown
/**
 * Sets the passed in buttons to the buttons cache
 * @param  { object } buttons - all tools built as buttons
 * @return { void }
 */
const setCache = buttons => (buttonsCache = buttons)
/**
 * Clears the current tool buttons in cache
 * @return {void}
 */
const clearCache = () => {

  buttonsCache && Object
    .entries(buttonsCache)
    .map(([ id, { button, content, handler } ]) => {
      if (typeof handler === 'function') {
        content && removeEventListener(content, 'keyup', handler)
        content && removeEventListener(content, 'mouseup', handler)
        button && removeEventListener(button, 'click', handler)
      }
      button = undefined
      content = undefined
      handler = undefined
      buttonsCache[id] = undefined
    })

  buttonsCache = undefined
}
/**
 * Gets the cached tool buttons
 * @return { object } - buttonsCache
 */
const getCache = () => buttonsCache || {}

/**
 * Toggles disabled on tools buttons based on passed in state
 * @param  { boolean } state - what the disabled state should be
 * @param  { array } ids - goupe of button IDs to disable
 * @return { void }
 */
const disableToggle = (state, ids) => {
  ids && ids.map(id => {
    if (!buttonsCache[id] || !buttonsCache[id].button) return
    buttonsCache[id].button.disabled = state
  })
}

/**
 * Builds an id for a tool based on passed in string
 * @param  { string } str - used to build the id
 * @return { string } build id for the tool
 */
export const buildId = str => (
  `${BTN_ID_EXT}-${str.replace(/ /g, '-').toLowerCase()}`
)

/**
 * Updates the selected state of the a button dom node
 * @param  { dom node } button - dom node to update
 * @param  { string } state - command to check is active
 * @param  { selectedClass } selected - class name for a selected / acitve button
 * @return {void}
 */
const buildHandler = (button, state, selectedClass) => (() => (
  button.classList[queryCommandState(state) ? 'add' : 'remove'](selectedClass)
))

/**
 * Toggles the SHOW class on a tool dropdown
 * @param  { dom node } button - node to toggle the dropdown on
 * @return { void }
 */
const toggleDropdown = (button, classes) => {
  button.parentNode.classList.toggle(classes.SHOW)
  openDropdown = button.parentNode.classList.contains(classes.SHOW)
    ? button
    : undefined

  if (openDropdown)
    openDropdown.classList.add(classes.BTN_SELECTED)
}

/**
 * Hides a tool dropdown if its open
 * @param  { dom node } button - parent button of the drop down
 * @param  { object } classes - class names set for the editor
 * @return
 */
const clearDropdown = (button, classes) => {
  button = button || openDropdown
  if (!button) return null
  button.parentNode.classList.remove(classes.SHOW)
  button.classList.remove(classes.BTN_SELECTED)
  openDropdown = undefined
}
/**
 * Builds the dom nodes for buttons using an 'a' element
 * Add the onclick tool, and icon
 * @param  { object } tool - tool corresponding to the button dom node
 * @param  { string } id - identifier for the button dom node
 * @param  { object } classes - class names set for the editor
 * @param  { dom node } content - holds the editable content
 * @return { dom node } - built button dom node
 */
const buildButton = (tool, classes, content) => {
  const button = createElement('a')
  button.className = classes.BTN_TOOL
  button.id = buildId(tool.title)
  button.href = 'javascript:void(0)'
  button.innerHTML = tool.icon
  button.title = tool.title
  button.onclick = e => {
    clearDropdown(button, classes)
    if (tool.type === 'dropdown')
      toggleDropdown(button, classes)
    else  tool.result === 'exec'
      ? exec(tool.state)
      : tool.result === FORMAT_BLOCK && tool.el
        ? exec(tool.result, tool.el)
        : typeof tool.result === 'function'
          ? tool.result.call(content, tool, button.id, button, e) && content.focus()
          : null

    e.preventDefault()
  }

  return button
}

/**
 * Builds a tool button contained within a tool dropdown
 * @param  {any} tool - data used to build the button
 * @param  { object } classes - class names set for the editor
 * @param  { dom node } content - element being edited
 * @return { object } - container dom node of the button and its parent Li wrapper
 */
const builSubItem = (tool, classes, content) => {
  const li = createElement('li')
  const btn = buildButton(tool, classes, content)
  appendChild(li, btn)
  return { btn, li }
}

/**
 * Builds tools dropdown to show sub tools from the parent tool
 * @param  { object } buttons - currently build buttons
 * @param  { object } buttonObj - button being built
 * @param  { object } classes - class names set for the editor
 * @param  { dom node } content - element being edited
 * @param  { dom node } btnGrp - wrapper to hold the dropdown
 * @return { object } - updated passed in buttons object
 */
const buildDropDown = (buttons, buttonObj, classes, content, btnGrp) => {
  const { button, tool } = buttonObj
  const btnList = createElement('ul')
  const btnWrap = createElement('div')
  btnList.className = classes.BTN_DROP_LIST
  btnWrap.className = classes.BTN_WRAP
  appendChild(btnWrap, button)

  Object.keys(tool.options).map(key => {
    const option = tool.options[key]
    const { btn, li } = builSubItem(option, classes, content)
    appendChild(btnList, li)
    const id = btn.id
    buttons[id] = { tool: option, button: btn }
    if (option.state)
      buttons[id] = buildState(buttons[id], content, classes.BTN_SELECTED)
  })
  appendChild(btnWrap, btnList)
  appendChild(btnGrp, btnWrap)

  return buttons
}

/**
 * Builds a tool buttons event handlers, and buttonObj to be stored in button cache
 * @param  { object } buttonObj - button being built
 * @param  { dom node } content - element being edited
 * @param  { string } selCls - class for when a button is active
 * @return
 */
const buildState = (buttonObj, content, selCls) => {
  const handler = buildHandler(buttonObj.button, buttonObj.tool.state, selCls)
  addEventListener(content, 'keyup', handler)
  addEventListener(content, 'mouseup', handler)
  addEventListener(buttonObj.button, 'click', handler)
  buttonObj.content = content
  buttonObj.handler = handler

  return buttonObj
}

export default {
  buildButton,
  buildDropDown,
  buildState,
  clearCache,
  disableToggle,
  getCache,
  setCache,
  clearDropdown,
}
