import Buttons from './buttons'
import Styles from './style_loader'
import buildPopper from './popper'
import CleanEditor from './clean_editor'
import { getSelectionCoords, getSelectedText } from './selection'
import {
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
  registerTools,
  updateDefaultStyles,
} from './builders'

const StyleLoader = new Styles()

const onClickEditor = settings => {
  return e => {
    const { isStatic, showOnClick, Editor, onClick } = settings
    Editor.isActive = true
    if (!isStatic && showOnClick && !Editor.toolsVisible)
      toggleTools('on', settings)
    typeof onClick === 'function'
      && onClick(e, Editor)
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
const onContentChange = settings => {
  return (observer) => {
    const { Editor, defParaSep, onChange } = settings
    if (!Editor || !observer || !observer[0]) return null

    const el = observer[0].target
    const firstChild = el.firstChild
    // Clean up the the element content if needed
    firstChild &&
      firstChild.nodeType === 3
      && exec(FORMAT_BLOCK, `<${defParaSep}>`)

    // Check if the actions should be disabled

    const { disableIds, state } = checkListDisable(Editor.buttons.getCache())
    disableIds && disableIds.length && Editor.buttons.disableToggle(state, disableIds)

    // Check if the tools should be turned on
    if (!Editor.toolsVisible) toggleTools('on', settings)

    // Call the passed in on change handler if it exists
    typeof onChange === 'function' &&
      onChange(Editor.contentEl.innerHTML, observer, Editor)
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
  const { Editor, defParaSep, styleWithCSS } = settings
  Editor.onSelChange = onSelChange(settings)
  Editor.contentEl = contentEl
  Editor.buttons = buttons
  Editor.onClick = onClickEditor(settings)
  Editor.composition.end = event => onContentChange(settings)([ event ])
  Editor.destroy = destroy(settings)

  addEventListener(Editor.contentEl, 'click', Editor.onClick)
  addEventListener(Editor.contentEl, 'compositionstart', Editor.composition.start)
  addEventListener(Editor.contentEl, 'compositionend', Editor.composition.end)

  styleWithCSS && exec('styleWithCSS')
  exec(PARA_SEP_STR, defParaSep)
}

/**
 * Handels input from the keyboard
 * @param  { object } event - browser window event
 * @return { boolean } - should do default browser behavior
 */
const onKeyDown = settings => {
  const handelKeys = { Backspace: true, Tab: true, Enter: true }
  return event => {
    const { Editor, isStatic, onKeyDown, defParaSep } = settings
    Editor.buttons.clearDropdown()

    typeof onKeyDown === 'function' &&
      onKeyDown(event, settings.Editor)

    if (
      !Editor.contentEl ||
      !handelKeys[event.key] ||
      !event.target ||
      event.target !== Editor.contentEl
    ) return null

    switch (event.key){
      case 'Tab': return event.preventDefault()
      case 'Enter': {
        exec(PARA_SEP_STR, `<${defParaSep}>`)
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
    const { Editor, isStatic, showOnClick, onSelect } = settings
    if (isStatic) return null

    const selection = getSelection()
    // Find the closest dom node to search for the editor dom node
    // text nodes don't have a .closest method, so we need on that does
    const findNode = selection.anchorNode.nodeType === 3
      ? selection.anchorNode.parentNode
      : selection.anchorNode

    // Could add updating the link color, but not worth the prof hit
    // const btnLnk = document.getElementById('composer-button-link')
    // if (findNode.tagName !== 'A'){
    //   btnLnk && btnLnk.classList.remove(settings.classes.BTN_SELECTED)
    // }
    // else {
    //   btnLnk && btnLnk.classList.add(settings.classes.BTN_SELECTED)
    // }

    // button.classList.add(settings.classes.BTN_SELECTED)
    // Check if we have the correct editor for this event
    const isEditor = findNode.closest(`[contenteditable="true"]`) === Editor.contentEl

    // If is active not defined, check if its the active editor
    if (Editor.isActive === undefined)
      Editor.isActive = document.activeElement === Editor.contentEl
    // If it is active, but wrong editor, turn it off
    else if (Editor.isActive && !isEditor)
      Editor.isActive = false
    // If it's not active, but we have the correct editor
    // Check settings to see if the tools should be shown
    else if (!Editor.isActive && isEditor && !showOnClick)
      return null

    // If wrong editor, and the tools are visable, turn them off
    if (!isEditor)
      return Editor.toolsVisible && toggleTools('off', settings)

    // Check for a settings callback on select, and call it
    typeof onSelect === 'function' && onSelect(e, settings)

    // If the tools are on, update their pos based on the selection
    Editor.toolsVisible && updateToolsPos(settings, selection)

    // Check if anything was selected
    // if anchorOffset and focusOffset are 0, then nothing was selected, so return
    if (!selection || (!selection.anchorOffset && !selection.focusOffset))
      return null

    // Check if the tools are off, and if so turn them on
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
  const { Editor, isStatic, offset } = settings
  if (isStatic || !Editor.popper) return null

  selPos = selPos || getSelectionCoords(selection)
  if (!selPos) return null

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
  const { Editor, isStatic, classes } = settings
  if (isStatic) return null

  const popperTool = Editor.popper || {}
  const toolsRoot = popperTool.popper
  if (!toolsRoot) return null

  // Check if the show class is on the root el
  const toolsVisible = toolsRoot.classList.contains(classes.SHOW)

  // If toggle is not defined, use the visible flag to set the toggle
  if (toggle === undefined)
    toggle = toolsVisible ? 'off' : 'on'

  if (toggle === 'off'){
    toolsRoot.classList.remove(classes.SHOW)
    toolsRoot.classList.add(classes.HIDDEN)
    Editor.toolsVisible = false
    return
  }

  toolsRoot.classList.add(classes.SHOW)
  toolsRoot.classList.remove(classes.HIDDEN)
  Editor.toolsVisible = true
}

const onSave = settings => {
  return e => {


    settings.onSave && settings.onSave(
      settings.Editor.contentEl.innerHTML,
      e,
      settings.Editor
    )
      ? null
      : settings.destroyOnSave && destroy(settings)()
  }
}

const onCancel = settings => {
  return e => {
    // Reset the element content
    settings.Editor.contentEl.innerHTML = settings.content || ''
    settings.onCancel && settings.onCancel(e, settings.Editor)
      ? null
      : settings.destroyOnCancel && destroy(settings)()
  }
}

/**
 * Builds the WYSIWYG editor
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { object } - WYSIWYG editor object
 */
const init = opts => {
  const settings = buildSettings(opts)
  const tools = buildTools(settings || {})
  const toolbar = buildToolBar(settings.classes.TOOL_BAR)
  const contentEl = buildContent(settings, onContentChange, onKeyDown)

  const buttons = new Buttons(settings)
  buttons.buildToolBtns(tools, toolbar, contentEl)

  const contentActions = buildContentActions(settings, onSave(settings), onCancel(settings))
  const rootEl = buildRoot(settings, toolbar, contentActions)

  // Add editor styles to the dom
  buildStyles(settings, StyleLoader)
  // Add Editor / WYSIWYG settings to the document
  setupEditor(settings, contentEl, buttons)
  // If not a static editor, build the popper element
  !settings.isStatic && buildPopper(settings, rootEl, updateToolsPos)

  return settings.Editor
}


/**
 * Cleans up the WYSIWYG editor by removing events, tools and popper object
 */
const destroy = (settings) => {
  return () => {
    StyleLoader.remove(settings.Editor.styleId)
    CleanEditor(settings)
    settings = undefined
  }
}

export {
  destroy,
  exec,
  init,
  registerTools,
  updateDefaultStyles,
}
