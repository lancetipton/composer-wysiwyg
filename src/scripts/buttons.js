import {
  addEventListener,
  appendChild,
  removeEventListener,
  queryCommandState,
  createElement,
  exec,
  logData
} from './utils'
import { BTN_ID_EXT, FORMAT_BLOCK, INSERT_HTML } from './constants'

/**
 * Updates the selected cmd of the a button dom node
 * @param  { dom node } button - dom node to update
 * @param  { string } cmd - command to check is active
 * @param  { selectedClass } selected - class name for a selected / acitve button
 * @return {void}
 */
const buildHandler = (button, cmd, selectedClass) => (() => (
  button.classList[queryCommandState(cmd) ? 'add' : 'remove'](selectedClass)
))

/**
 * Builds a tool buttons event handlers, and buttonObj to be stored in button cache
 * @param  { object } buttonObj - button being built
 * @param  { dom node } contentEl - element being edited
 * @param  { string } selCls - class for when a button is active
 * @return { object } - contains data to access all parts of the button
 */
const buildState = (buttonObj, contentEl, selCls) => {
  const handler = buildHandler(buttonObj.button, buttonObj.tool.cmd, selCls)
  addEventListener(contentEl, 'keyup', handler)
  addEventListener(contentEl, 'mouseup', handler)
  addEventListener(buttonObj.button, 'click', handler)
  buttonObj.contentEl = contentEl
  buttonObj.handler = handler

  return buttonObj
}

/**
* Builds a tool button contained within a tool dropdown
* @param  {any} tool - data used to build the button
* @param  { object } classes - class names set for the editor
* @param  { dom node } contentEl - element being edited
* @return { object } - container dom node of the button and its parent Li wrapper
*/
const builSubItem = (BtnCls, tool, contentEl, settings) => {
  const li = createElement('li')
  const btn = buildButton(BtnCls, tool, contentEl, settings)
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
const buildDropDown = (BtnCls, buttons, buttonObj, contentEl, btnGrp, settings) => {
  const { classes } = settings
  const { button, tool } = buttonObj
  const btnList = createElement('ul')
  const btnWrap = createElement('div')
  btnList.className = classes.BTN_DROP_LIST
  btnWrap.className = classes.BTN_WRAP
  appendChild(btnWrap, button)

  Object.keys(tool.options).map(key => {
    const option = tool.options[key]
    const { btn, li } = builSubItem(BtnCls, option, contentEl, settings)

    appendChild(btnList, li)
    const id = btn.id
    buttons[id] = { tool: option, button: btn }
    if (option.cmd)
      buttons[id] = buildState(buttons[id], contentEl, classes.BTN_SELECTED)
  })
  appendChild(btnWrap, btnList)
  appendChild(btnGrp, btnWrap)

  return buttons
}

/**
* Builds an id for a tool based on passed in string
* @param  { string } str - used to build the id
* @return { string } build id for the tool
*/
const buildId = str => `${BTN_ID_EXT}-${str.replace(/ /g, '-').toLowerCase()}`

/**
* Builds the dom nodes for buttons using an 'a' element
* Add the onclick tool, and icon
* @param  { object } tool - tool corresponding to the button dom node
* @param  { string } id - identifier for the button dom node
* @param  { object } classes - class names set for the editor
* @param  { dom node } contentEl - holds the editable contentEl
* @return { dom node } - built button dom node
*/
const buildButton = (BtnCls, tool, contentEl, settings) => {
  const { classes, Editor } =  settings
  const button = createElement('a')
  button.className = classes.BTN_TOOL
  button.id = buildId(tool.title)
  button.href = 'javascript:void(0)'
  button.innerHTML = tool.icon
  button.title = tool.title
  button.onclick = e => {
    if(e){
      e.preventDefault && e.preventDefault()
      e.stopPropagation && e.stopPropagation()
    }
    
    logData('Button Click Event', tool)
    
    if (tool.cmd === 'dropdown')
      BtnCls.toggleDropdown(button)
    else {
      BtnCls.clearDropdown()
      tool.action === 'exec'
        ? exec(tool.cmd)
        : (tool.action === FORMAT_BLOCK || tool.action === INSERT_HTML) && tool.el
          ? exec(tool.action, tool.el)
          : typeof tool.action === 'function'
            ? tool.action.call(Editor.contentEl, tool, settings, button, e) && contentEl.focus()
            : null
    }

    contentEl.focus()
  }

  return button
}

/**
* Builds the button dom nodes based on each tool, and adds event listeners
* @param  { array } tools - tools to be added to the toolbar
* @param  { dom node } toolbar - holds all the tool buttons for the editor
* @param  { object } classes - class names set for the editor
* @param  { dom node } contentEl - element being edited
* @return { object } - container the button dom node and corisponding tool object
*/
export const buildToolBtns = (BtnCls, tools, toolbar, settings) => {
  const { classes, Editor: { contentEl } } =  settings

  const btnGrp = createElement('div')
  btnGrp.className = classes.BTN_GRP
  appendChild(toolbar, btnGrp)
  // Add buttons to the cache to be accessed later
  BtnCls.cache = tools.reduce((buttons, tool) => {
    if (!tool || !tool.title) return buttons
    const button = buildButton(BtnCls, tool, contentEl, settings)
    const id = button.id
    buttons[id] = { button, tool }

    if (tool.cmd === 'dropdown' && tool.options)
      return buildDropDown(
        BtnCls,
        buttons,
        buttons[id],
        contentEl,
        btnGrp,
        settings
      )
    else if (tool.cmd)
      buttons[id] = buildState(
        buttons[id],
        contentEl,
        classes.BTN_SELECTED
      )

    appendChild(btnGrp, buttons[id].button)

    return buttons
  }, {})

  return BtnCls.cache
}


const createButtons = settings => {
  if (!settings) throw new Error(`Settings object is required for Buttons class`)


  return class Buttons{

    constructor(){
    }

    cache = {}

    // --------------
    /**
    * Clears the current tool buttons in cache
    * @return {void}
    */
    clearCache = () => {
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
      this.activeDropdown = undefined
    }
    /**
    * Gets the cached tool buttons
    * @return { object } - this.cache
    */
    getCache = () => this.cache
    /**
    * Gets a single cached tool button based on type param
    * @return { object } - cached button
    */
    getButton = type => this.cache && this.cache[buildId(type)]
    
    /**
    * Toggles disabled on tools buttons based on passed in state
    * @param  { boolean } state - what the disabled state should be
    * @param  { array } ids - group of button IDs to disable
    * @return { void }
    */
    disableToggle = (state, ids) => {
      ids && ids.map(id => {
        if (!this.cache[id] || !this.cache[id].button) return
        this.cache[id].button.disabled = state
      })
    }

    /**
    * Hides a tool dropdown if its open
    * @param  { dom node } button - parent button of the drop down
    * @param  { object } classes - class names set for the editor
    * @return
    */
    clearDropdown = button => {
      button = button || this.activeDropdown
      if (!button) return null
      button.parentNode.classList.remove(settings.classes.SHOW)
      button.classList.remove(settings.classes.BTN_SELECTED)
      this.activeDropdown = undefined
    }

    // --------------

    /**
  * Toggles the SHOW class on a tool dropdown
  * @param  { dom node } button - node to toggle the dropdown on
  * @return { void }
  */
    toggleDropdown = button => {
      logData('Toggle Dropdown Event')
      
      if (this.activeDropdown === button)
        return this.clearDropdown()
      else this.activeDropdown && this.clearDropdown()

      const { classes } = settings
      button.parentNode.classList.toggle(classes.SHOW)


      this.activeDropdown = button.parentNode.classList.contains(classes.SHOW)
        ? button
        : undefined

      this.activeDropdown &&
        this.activeDropdown.classList.add(classes.BTN_SELECTED)
    }

  }

}

export default createButtons
