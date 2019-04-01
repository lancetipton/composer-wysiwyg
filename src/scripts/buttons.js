import {
  addEventListener,
  appendChild,
  removeEventListener,
  queryCommandState,
  createElement,
  exec
} from './util'
import { BTN_ID_EXT, FORMAT_BLOCK } from './constants'

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
 * Builds the dom nodes for buttons using an 'a' element
 * Add the onclick tool, and icon
 * @param  { object } tool - tool corresponding to the button dom node
 * @param  { string } id - identifier for the button dom node
 * @param  { object } classes - class names set for the editor
 * @param  { dom node } contentEl - holds the editable contentEl
 * @return { dom node } - built button dom node
 */
const buildButton = (Button, tool, classes, contentEl) => {
  const button = createElement('a')
  button.className = classes.BTN_TOOL
  button.id = Button.buildId(tool.title)
  button.href = 'javascript:void(0)'
  button.innerHTML = tool.icon
  button.title = tool.title
  button.onclick = e => {
    Button.clearDropdown(button, classes)
    if (tool.type === 'dropdown')
      Button.toggleDropdown(button, classes)
    else  tool.result === 'exec'
      ? exec(tool.state)
      : tool.result === FORMAT_BLOCK && tool.el
        ? exec(tool.result, tool.el)
        : typeof tool.result === 'function'
          ? tool.result.call(contentEl, tool, button.id, button, e) && contentEl.focus()
          : null

    e.preventDefault()
  }

  return button
}

/**
 * Builds a tool button contained within a tool dropdown
 * @param  {any} tool - data used to build the button
 * @param  { object } classes - class names set for the editor
 * @param  { dom node } contentEl - element being edited
 * @return { object } - container dom node of the button and its parent Li wrapper
 */
const builSubItem = (Button, tool, classes, contentEl) => {
  const li = createElement('li')
  const btn = buildButton(Button, tool, classes, contentEl)
  appendChild(li, btn)
  return { btn, li }
}

/**
 * Builds tools dropdown to show sub tools from the parent tool
 * @param  { object } buttons - currently build buttons
 * @param  { object } buttonObj - button being built
 * @param  { object } classes - class names set for the editor
 * @param  { dom node } contentEl - element being edited
 * @param  { dom node } btnGrp - wrapper to hold the dropdown
 * @return { object } - updated passed in buttons object
 */
const buildDropDown = (Button, buttons, buttonObj, classes, contentEl, btnGrp) => {
  const { button, tool } = buttonObj
  const btnList = createElement('ul')
  const btnWrap = createElement('div')
  btnList.className = classes.BTN_DROP_LIST
  btnWrap.className = classes.BTN_WRAP
  appendChild(btnWrap, button)

  Object.keys(tool.options).map(key => {
    const option = tool.options[key]
    const { btn, li } = builSubItem(Button, option, classes, contentEl)
    appendChild(btnList, li)
    const id = btn.id
    buttons[id] = { tool: option, button: btn }
    if (option.state)
      buttons[id] = buildState(buttons[id], contentEl, classes.BTN_SELECTED)
  })
  appendChild(btnWrap, btnList)
  appendChild(btnGrp, btnWrap)

  return buttons
}

/**
 * Builds a tool buttons event handlers, and buttonObj to be stored in button cache
 * @param  { object } buttonObj - button being built
 * @param  { dom node } contentEl - element being edited
 * @param  { string } selCls - class for when a button is active
 * @return { object } - contains data to access all parts of the button
 */
const buildState = (buttonObj, contentEl, selCls) => {
  const handler = buildHandler(buttonObj.button, buttonObj.tool.state, selCls)
  addEventListener(contentEl, 'keyup', handler)
  addEventListener(contentEl, 'mouseup', handler)
  addEventListener(buttonObj.button, 'click', handler)
  buttonObj.contentEl = contentEl
  buttonObj.handler = handler

  return buttonObj
}

export default class Buttons{

  constructor(settings){
    this.settings = settings
    this.cache = {}
    this.openDropdown = undefined
  }

  /**
  * Builds an id for a tool based on passed in string
  * @param  { string } str - used to build the id
  * @return { string } build id for the tool
  */
  buildId(str){
    return `${BTN_ID_EXT}-${str.replace(/ /g, '-').toLowerCase()}`
  }
  /**
  * Clears the current tool buttons in cache
  * @return {void}
  */
  clearCache(){
    this.cache && Object
      .entries(this.cache)
      .map(([ id, { button, contentEl, handler } ]) => {
        if (typeof handler === 'function') {
          contentEl && removeEventListener(contentEl, 'keyup', handler)
          contentEl && removeEventListener(contentEl, 'mouseup', handler)
          button && removeEventListener(button, 'click', handler)
        }
        button = undefined
        contentEl = undefined
        handler = undefined
        this.cache[id] = undefined
      })

    this.cache = undefined
  }
  /**
  * Gets the cached tool buttons
  * @return { object } - this.cache
  */
  getCache() {
    return this.cache
  }

  /**
  * Toggles disabled on tools buttons based on passed in state
  * @param  { boolean } state - what the disabled state should be
  * @param  { array } ids - goupe of button IDs to disable
  * @return { void }
  */
  disableToggle (state, ids){
    ids && ids.map(id => {
      if (!this.cache[id] || !this.cache[id].button) return
      this.cache[id].button.disabled = state
    })
  }

  /**
 * Toggles the SHOW class on a tool dropdown
 * @param  { dom node } button - node to toggle the dropdown on
 * @return { void }
 */
  toggleDropdown(button, classes){
    button.parentNode.classList.toggle(classes.SHOW)
    this.openDropdown = button.parentNode.classList.contains(classes.SHOW)
      ? button
      : undefined

    if (this.openDropdown)
      this.openDropdown.classList.add(classes.BTN_SELECTED)
  }

  /**
  * Hides a tool dropdown if its open
  * @param  { dom node } button - parent button of the drop down
  * @param  { object } classes - class names set for the editor
  * @return
  */
  clearDropdown(button, classes){
    button = button || this.openDropdown
    if (!button) return null
    button.parentNode.classList.remove(classes.SHOW)
    button.classList.remove(classes.BTN_SELECTED)
    this.openDropdown = undefined
  }

  /**
  * Builds the button dom nodes based on each tool, and adds event listeners
  * @param  { array } tools - tools to be added to the toolbar
  * @param  { dom node } toolbar - holds all the tool buttons for the editor
  * @param  { object } classes - class names set for the editor
  * @param  { dom node } contentEl - element being edited
  * @return { object } - container the button dom node and corisponding tool object
  */
  buildToolBtns(tools, toolbar, classes, contentEl){
    const btnGrp = createElement('div')
    btnGrp.className = classes.BTN_GRP
    appendChild(toolbar, btnGrp)
    // Add buttons to the cache to be accessed later
    this.cache = tools.reduce((buttons, tool) => {
      if (!tool || !tool.title) return buttons
      const button = buildButton(this, tool, classes, contentEl)
      const id = button.id
      buttons[id] = { button, tool }

      if (tool.type === 'dropdown' && tool.options)
        return buildDropDown(this, buttons, buttons[id], classes, contentEl, btnGrp)
      else if (tool.state)
        buttons[id] = buildState(buttons[id], contentEl, classes.BTN_SELECTED)

      appendChild(btnGrp, buttons[id].button)

      return buttons
    }, {})

    return this.cache
  }

}
