import {
  CLASSES,
  PARA_SEP_STR,
  FORMAT_BLOCK,
  TOOLS_OFFSET,
  EMPTY_INPUT,
} from './constants'
import {
  addEventListener,
  appendChild,
  createElement,
  debounce,
  exec,
  getMutationObserver,
  queryCommandValue,
  removeEventListener,
  noContent,
  checkListDisable,
} from './util'
import { getSelectionCoords, setCaretPosition } from './selection'
import Popper from 'popper.js'
import Buttons from './buttons'
import Styles from './style_loader'
import {
  buildContentActions,
  buildRoot,
  buildStyles,
  buildTools,
  buildToolBar,
  buildPopperOpts,
} from './builders'

const Composing = {
  content: undefined,
  end: undefined,
  onSelChange: undefined,
  start: () => {},
  toolsVisible: undefined,
  onKeyDown: undefined,
  onClickEditor: undefined,
  POPPER_TOOL: undefined,
  OBSERVER: undefined,
}

const onClickEditor = settings => {
  return e => {
    typeof settings.onEditorClick === 'function' && settings.onEditorClick(e, settings, Composing)
  }
}

/**
 * Returns a function that listens for changes
 * Checks for change type, and updates the content based on change
 * Calls the passed in onChange callback if it exists
 * @param  { dom node } content - holds the editable content
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { void }
 */
const onContentChange = (content, settings) => {
  return (observer) => {
    if (!observer || !observer[0]) return null
    const el = observer[0].target
    const firstChild = el.firstChild
    // Clean up the the element content if needed
    firstChild &&
      firstChild.nodeType === 3
      && exec(FORMAT_BLOCK, `<${settings.defParaSep}>`)

    // Check if the actions should be disabled
    const { disableIds, state } = checkListDisable(Buttons.getCache())
    disableIds && disableIds.length && Buttons.disableToggle(state, disableIds)

    // Check if the tools should be turned on
    if (!Composing.toolsVisible) toggleTools('on')
    // Call the passed in on change handler if it exists
    settings.onChange && settings.onChange(content.innerHTML, content)
  }
}

/**
 * Adds the content dom node to the composing object
 * Adds event listeners to the content dom node
 * @param  { object } content - dom node to be edited
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { void }
 */
const setComposing = (content, settings) => {
  Composing.content = content
  Composing.end = event => onContentChange(content, settings)([ event ])
  addEventListener(content, 'compositionstart', Composing.start)
  addEventListener(content, 'compositionend', Composing.end)
}

/**
 * Builds content dom node with contentEditable for editing its content
 * Adds event listeners to capture 'Enter' and 'Tab' keyboard events
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { dom node } - build dom node that holds the editable content
 */
const buildContent = settings => {
  const isStatic = settings.type === 'static'
  const content = !isStatic && settings.element || createElement('div')
  content.innerHTML = settings.content || EMPTY_INPUT
  content.contentEditable = true
  content.classList.add(settings.classes.CONTENT)
  Composing.OBSERVER = getMutationObserver(
    content,
    debounce(onContentChange(content, settings))
  )
  setComposing(content, settings)
  if (settings.placeholder && !content.innerHTML)
    content.dataset.placeholder = settings.placeholder

  Composing.onKeyDown = onKeyDown(settings)
  addEventListener(content, 'keydown', Composing.onKeyDown)

  if (isStatic){
    content.style.width = `${settings.element.clientWidth}px`
    content.style.height = `${settings.element.clientHeight - 24}px`
    appendChild(settings.element, content)
  }

  return content
}

/**
 * Handels input from the keyboard
 * @param  { object } event - browser window event
 * @return { boolean } - should do default browser behavior
 */
const onKeyDown = settings => {
  const handelKeys = { Backspace: true, Tab: true, Enter: true }
  return event => {
    Buttons.clearDropdown(null, settings.classes)

    if (
      !Composing.content ||
      !handelKeys[event.key] ||
      !event.target ||
      event.target !== Composing.content
    ) return null

    switch (event.key){
      case 'Tab': return event.preventDefault()
      case 'Enter': return (
        queryCommandValue(FORMAT_BLOCK) === 'blockquote' &&
        setTimeout(() => exec(FORMAT_BLOCK, `<${settings.defParaSep}>`), 0)
      )
      case 'Backspace': {
        updateToolsPos(settings)
        const el = event.target
        // Check if more then one child, if there is then return normal
        if (el.childElementCount > 1) return null

        // Check if no content in the element
        if (!el.firstChild || noContent(el) || noContent(el.firstChild)){
          // If no el content, reset it, and return
          updateToolsPos(settings)
          return event.preventDefault()
        }
      }
    }
  }
}

/**
 * Builds the button dom nodes based on each tool, and adds event listeners
 * @param  { array } tools
 * @param  { dom node } toolbar
 * @param  { object } classes
 * @param  { string } content
 * @return { object } - container the button dom node and corisponding tool object
 */
const buildToolBtns = (tools, toolbar, classes, content) => {
  const btnGrp = createElement('div')
  btnGrp.className = classes.BTN_GRP
  appendChild(toolbar, btnGrp)

  return tools.reduce((buttons, tool) => {
    if (!tool || !tool.title) return buttons
    const button = Buttons.buildButton(tool, classes, content)
    const id = button.id
    buttons[id] = { button, tool }

    if (tool.type === 'dropdown' && tool.options)
      return Buttons.buildDropDown(buttons, buttons[id], classes, content, btnGrp)
    else if (tool.state)
      buttons[id] = Buttons.buildState(buttons[id], content, classes.BTN_SELECTED)

    appendChild(btnGrp, buttons[id].button)

    return buttons
  }, {})
}

/**
 * Add Popper to the editor with the joined default and passed int popper settings
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @param  { dom node } rootEl - root element of the editor
 * @return { void }
 */
const buildPopper = (settings, rootEl) => {
  if (Composing.POPPER_TOOL){
    Composing.POPPER_TOOL.destroy()
    Composing.POPPER_TOOL = null
  }

  Composing.caretPos = settings.element.getBoundingClientRect()
  // Set the def caret pos
  // Will be updated separately, but the popper holds a reference to this object
  // When updating this object it also updates the reference in the popper object
  const ref = {
    getBoundingClientRect: () => ({
      top: Composing.caretPos.y,
      right: Composing.caretPos.x,
      bottom: Composing.caretPos.y,
      left: Composing.caretPos.x,
      width: Composing.caretPos.width,
      height: Composing.caretPos.height,
    }),
    clientWidth: settings.element.clientWidth,
    clientHeight: settings.element.clientHeight,
  }

  const popperProps = buildPopperOpts(settings, onPopperCreate)
  Composing.POPPER_TOOL = new Popper(ref, rootEl, popperProps)
  updateToolsPos(settings)
}

/**
 * Called when the text selection changes, updates the xy pos of the caret
 * Turns on tools if they are not visitable
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { function } function called when the selection changes
 */
const onSelChange = settings => {
  return e => {
    const selection = getSelection()
    updateToolsPos(settings, selection)
    // Check if anything was selected
    // if anchorOffset and focusOffset are 0, then nothing was selected, so return
    if (!selection || (!selection.anchorOffset && !selection.focusOffset))
      return null

    !Composing.toolsVisible && toggleTools('on')
    e.preventDefault()
  }
}

/**
 * Updates the pos of the editor tools
 * @param  {any} toolOffset
 * @return
 */
const updateToolsPos = (settings, selection, selPos) => {
  selPos = selPos || getSelectionCoords(selection)
  if (!selPos) return null

  Composing.caretPos = {
    x: selPos.x + settings.toolOffset.x || 0,
    y: selPos.y + settings.toolOffset.y || 0
  }
  Composing.POPPER_TOOL.scheduleUpdate()
}

/**
 * Show / Hides the Editor tools
 * @param  { string } toggle - must be `on` || `off`
 * @return { void }
 */
const toggleTools = toggle => {
  const popperTool = Composing.POPPER_TOOL || {}
  const toolsRoot = popperTool.popper
  if (!toolsRoot) return null

  // Check if the show class is on the root el
  const toolsVisible = toolsRoot.classList.contains(CLASSES.SHOW)

  // If toggle is not defined, use the visible flag to set the toggle
  if (toggle === undefined)
    toggle = toolsVisible ? 'off' : 'on'

  if (toggle === 'off'){
    toolsRoot.classList.remove(CLASSES.SHOW)
    toolsRoot.classList.add(CLASSES.HIDDEN)
    Composing.toolsVisible = false
  }
  else {
    toolsRoot.classList.add(CLASSES.SHOW)
    toolsRoot.classList.remove(CLASSES.HIDDEN)
    Composing.toolsVisible = true
  }
}

const onPopperCreate = settings => {
  return (popper) => {
    const caretEl = settings.element.firstChild || settings.element
    setCaretPosition(caretEl, 0)
    settings.popper && settings.popper.onCreate && settings.popper.onCreate(popper, settings)
    Composing.onSelChange = onSelChange(settings)
    document.addEventListener('selectionchange', Composing.onSelChange)
  }
}

/**
 * Added WYSIWYG editor settings to the document
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return {void}
 */
const setupEditor = (settings, rootEl) => {
  settings.styleWithCSS && exec('styleWithCSS')
  exec(PARA_SEP_STR, settings.defParaSep)
  Composing.clearSettings = () => Object
    .keys(settings)
    .map(key => settings[key] = undefined)
}

/**
 * Removes the event listeners from the content editor dom node
 * @return { void }
 */
const clearEvents = () => {
  if (Composing.content){
    try {
      removeEventListener(Composing.content, 'compositionstart', Composing.start)
      removeEventListener(Composing.content, 'compositionend', Composing.end)
      removeEventListener(Composing.content, 'keydown', Composing.onKeyDown)
      removeEventListener(Composing.content, 'click', Composing.onClickEditor)
    }
    catch (e){
      console.warn('Failed to remove event listeners')
    }
  }
  // Remove selection change listener
  Composing.onSelChange &&
    removeEventListener(document, 'selectionchange', Composing.onSelChange)
  // Remove mutation observer
  Composing.OBSERVER && Composing.OBSERVER.disconnect()
  Composing.OBSERVER = undefined
}

/**
 * Cleans up the Composing object
 * Cleans up the Composing object
 */
const clearComposing = () => {
  // We don't want to clear out unless all event listeners have been removed
  // Extra check to make sure that happends
  if (Composing.OBSERVER) clearEvents()

  Composing.content = undefined
  Composing.end = undefined
  Composing.onSelChange = undefined
  Composing.toolsVisible = undefined
  Composing.caretPos = undefined
  Composing.onClickEditor = undefined
  try {
    Composing.POPPER_TOOL && Composing.POPPER_TOOL.destroy()
    // Popper does not completely remove the object and refs on destroy
    // So do our own clean up, clear out all props of the popper tool
    Object
      .keys(Composing.POPPER_TOOL)
      .map(key => Composing.POPPER_TOOL[key] = undefined)
    // Remove ref to the popper tool
    Composing.POPPER_TOOL = undefined
  }
  catch (e){
    console.warn(e)
  }
  // Clean up the settings
  try {
    Composing.clearSettings()
    Composing.clearSettings = undefined
  }
  catch (e){
    console.warn(e)
  }
}

/**
 * Ensures the WYSIWYG editor dom node is remove. Should happen from popper
 * This is just an extra check, just incase something changes with that code
 * @return { void }
 */
const cleanDom = () => {
  if (!Composing.POPPER_TOOL || !Composing.POPPER_TOOL.popper) return null
  const rootEl = Composing.POPPER_TOOL.popper
  rootEl.parentNode.removeChild(rootEl)
}

/**
 * Builds the WYSIWYG editor
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { object } - WYSIWYG editor object
 */
export const init = settings => {
  const tools = buildTools(settings || {})
  settings.classes = { ...CLASSES, ...settings.classes }
  settings.defParaSep = settings[PARA_SEP_STR] || 'div'
  settings.toolOffset = { ...TOOLS_OFFSET, ...settings.toolOffset }

  const toolbar = buildToolBar(settings.classes.TOOL_BAR)
  const content = buildContent(settings)
  const toolBtns = buildToolBtns(tools, toolbar, settings.classes, content)
  const contentActions = buildContentActions(settings, content)
  const rootEl = buildRoot(settings, toolbar, contentActions)
  // Build the poper element
  settings.type !== 'static' && buildPopper(settings, rootEl)
  setupEditor(settings, rootEl)
  Buttons.setCache(toolBtns)
  buildStyles(settings)

  Composing.onClickEditor = onClickEditor(settings)
  addEventListener(Composing.content, 'click', Composing.onClickEditor)

  return {
    ...settings,
    destroy,
    tools,
    popper: Composing.POPPER_TOOL,
  }
}

/**
 * Cleans up the WYSIWYG editor by removing events, tools and popper object
 */
export const destroy = () => {
  clearEvents()
  clearComposing()
  cleanDom()
  Buttons.clearCache()
  Styles.destroy()
}

export default { destroy, exec, init }
