import Buttons from './buttons'
import Styles from './style_loader'
import buildPopper from './popper'
import CleanEditor from './clean_editor'
import { getSelectionCoords, getSelectedText } from './selection'
import {
  CLASSES,
  PARA_SEP_STR,
  FORMAT_BLOCK,
} from './constants'
import {
  addEventListener,
  exec,
  noContent,
  checkListDisable,
} from './util'
import {
  buildContent,
  buildContentActions,
  buildRoot,
  buildSettings,
  buildStyles,
  buildTools,
  buildToolBar,
} from './builders'


const onClickEditor = settings => {
  return e => {
    const { isStatic, config, Editor } = settings
    if (!isStatic && config.editor.showOnClick && !Editor.toolsVisible)
      toggleTools('on', settings)
    typeof config.editor.onClick === 'function' && config.editor.onClick(e, settings)
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
    const { Editor, onChange, config } = settings
    if (!Editor || !observer || !observer[0]) return null

    const el = observer[0].target
    const firstChild = el.firstChild
    // Clean up the the element content if needed
    firstChild &&
      firstChild.nodeType === 3
      && exec(FORMAT_BLOCK, `<${config.defParaSep}>`)

    // Check if the actions should be disabled

    const { disableIds, state } = checkListDisable(Editor.buttons.getCache())
    disableIds && disableIds.length && Editor.buttons.disableToggle(state, disableIds)

    // Check if the tools should be turned on
    if (!Editor.toolsVisible) toggleTools('on', settings)
    // Call the passed in on change handler if it exists
    onChange && onChange(content.innerHTML, content)
  }
}

/**
 * Adds the content dom node to the composing object
 * Adds event listeners to the content dom node
 * @param  { object } content - dom node to be edited
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { void }
 */
const setupEditor = (settings, contentEl, buttons) => {
  const { Editor, config } = settings
  Editor.onSelChange = onSelChange(settings)
  Editor.contentEl = contentEl
  Editor.buttons = buttons
  Editor.onClick = onClickEditor(settings)
  Editor.composition.end = event => onContentChange(Editor.contentEl, settings)([ event ])
  Editor.destroy = destroy(settings)

  addEventListener(Editor.contentEl, 'click', Editor.onClick)
  addEventListener(Editor.contentEl, 'compositionstart', Editor.composition.start)
  addEventListener(Editor.contentEl, 'compositionend', Editor.composition.end)

  config.styleWithCSS && exec('styleWithCSS')
  exec(PARA_SEP_STR, config.defParaSep)
}

/**
 * Handels input from the keyboard
 * @param  { object } event - browser window event
 * @return { boolean } - should do default browser behavior
 */
const onKeyDown = settings => {
  const handelKeys = { Backspace: true, Tab: true, Enter: true }
  return event => {
    console.log('------------------key down------------------')

    const { Editor, classes, isStatic, config } = settings
    Editor.buttons.clearDropdown(null, classes)

    typeof config.editor.onKeyDown === 'function' &&
      config.editor.onKeyDown(e, settings)

    if (
      !Editor.contentEl ||
      !handelKeys[event.key] ||
      !event.target ||
      event.target !== Editor.contentEl
    ) return null

    switch (event.key){
      case 'Tab': return event.preventDefault()
      case 'Enter': {
        exec(PARA_SEP_STR, `<${config.defParaSep}>`)
        return setTimeout(() => (updateToolsPos(settings)), 0)
      }
      case 'Backspace': {
        !isStatic && updateToolsPos(settings)
        const selection = getSelection()
        const selectedText  = getSelectedText(selection)
        if (
          selection.isCollapsed &&
          !selection.anchorOffset &&
          !selectedText.length &&
          noContent(Editor.contentEl)
        ){
          // If no el content, reset it, and return
          return event.preventDefault()
        }
      }
    }
  }
}

/**
 * Called when the text selection changes, updates the xy pos of the caret
 * Turns on tools if they are not visitable
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { function } function called when the selection changes
 */
const onSelChange = settings => {
  return e => {
    const { Editor, isStatic, config } = settings
    if (isStatic) return null
    const selection = getSelection()
    const findNode = selection.anchorNode.nodeType === 3
      ? selection.anchorNode.parentNode
      : selection.anchorNode

    if (findNode.closest(`[contenteditable="true"]`) !== Editor.contentEl)
      return Editor.toolsVisible && toggleTools('off', settings)

    typeof config.editor.onSelect === 'function' &&
      config.editor.onSelect(e, settings)

    // This is causing tools to show up when first clicking on editor
    !Editor.toolsVisible && updateToolsPos(settings, selection)

    // Check if anything was selected
    // if anchorOffset and focusOffset are 0, then nothing was selected, so return
    if (!selection || (!selection.anchorOffset && !selection.focusOffset))
      return null

    !Editor.toolsVisible && toggleTools('on', settings)
    e.preventDefault()
  }
}

/**
 * Updates the pos of the editor tools
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @param { object } selection - dom selection object
 * @param { object } selPos - new pos for the tools
 * @return { void }
 */
const updateToolsPos = (settings, selection, selPos) => {
  const { Editor, config, isStatic } = settings
  if (isStatic) return null

  selPos = selPos || getSelectionCoords(selection)
  if (!selPos) return null
  const offset = config.tools.offset

  Editor.caretPos = {
    x: selPos.x + offset.x || 0,
    y: selPos.y + offset.y || 0
  }
  Editor.popper &&
    Editor.popper.scheduleUpdate &&
    Editor.popper.scheduleUpdate()
}

/**
 * Show / Hides the Editor tools
 * @param  { string } toggle - must be `on` || `off`
 * @return { void }
 */
const toggleTools = (toggle, settings) => {
  const { Editor, isStatic } = settings
  if (isStatic) return null

  const popperTool = Editor.popper || {}
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
    Editor.toolsVisible = false
    return
  }

  toolsRoot.classList.add(CLASSES.SHOW)
  toolsRoot.classList.remove(CLASSES.HIDDEN)
  Editor.toolsVisible = true
}


/**
 * Builds the WYSIWYG editor
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { object } - WYSIWYG editor object
 */
export const init = opts => {
  const settings = buildSettings(opts)
  const tools = buildTools(settings || {})
  const toolbar = buildToolBar(settings.classes.TOOL_BAR)
  const contentEl = buildContent(settings, onContentChange, onKeyDown)

  const buttons = new Buttons(settings)
  buttons.buildToolBtns(tools, toolbar, settings.classes, contentEl)

  const contentActions = buildContentActions(settings, contentEl)
  const rootEl = buildRoot(settings, toolbar, contentActions)

  // Add Editor / WYSIWYG settings to the document
  setupEditor(settings, contentEl, buttons)
  // If not a static editor, build the popper element
  !settings.isStatic && buildPopper(settings, rootEl, updateToolsPos)
  // Add editor styles to the dom
  buildStyles(settings)

  return settings.Editor
}


/**
 * Cleans up the WYSIWYG editor by removing events, tools and popper object
 */
export const destroy = (settings) => {
  return () => {
    CleanEditor(settings)
    Styles.destroy()
    settings = undefined
  }
}


export default { destroy, exec, init }
