import Buttons, { buildToolBtns } from './buttons'
import { StylesLoader } from './styles'
import buildPopper from './popper'
import CleanEditor from './clean'
import { getSelectionCoords, getSelectedText } from './selection'
import {
  PARA_SEP_STR,
  FORMAT_BLOCK,
} from './constants'
import {
  addEventListener,
  debounce,
  exec,
  noContent,
  checkListDisable,
  getMutationObserver,
  checkCall,
  setLogs,
  logData
} from './utils'
import {
  buildContent,
  buildContentActions,
  buildRoot,
  buildSettings,
  buildStyles,
  buildTools,
  buildToolBar,
  registerTools,
  registerTheme,
} from './builders'

const StyleLoader = new StylesLoader()

/**
 * Adds the content dom node to the composing object
 * Adds event listeners to the content dom node
 * @param  { object } content - dom node to be edited
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { void }
 */
const setupEditor = (settings, buttons) => {
  const { defParaSep, styleWithCSS } = settings
  const editorCls = createEditor(settings, buttons)
  const Editor = new editorCls()

  styleWithCSS && exec('styleWithCSS')
  exec(PARA_SEP_STR, defParaSep)
  settings.Editor = Editor
}

const createEditor = (settings, buttons) => {
  const handelKeys = { Backspace: true, Tab: true, Enter: true }
  let toolsVisible
  let mutationObs

  const addEvents = (settings, Editor) => {
    addEventListener(Editor.contentEl, 'click', Editor.onClick)
    addEventListener(Editor.contentEl, 'compositionstart', Editor.composition.start)
    addEventListener(Editor.contentEl, 'compositionend', Editor.composition.end)
    addEventListener(Editor.contentEl, 'keydown', Editor.onKeyDown)
    addEventListener(document, 'selectionchange', Editor.onSelChange)
    addEventListener(document, 'click', Editor.onClick)
    mutationObs = getMutationObserver(
      Editor.contentEl,
      debounce(Editor.onContentChange, settings.changeDebounce)
    )
  }

  return class Editor {

    constructor(){
      this.composition = {
        start: () => {},
        end: event => this.onContentChange([ event ])
      }

      this.popper = undefined
      this.buttons = buttons
      this.contentEl = buildContent(settings, this)
      addEvents(settings, this)
    }

    onClick = event => {
      logData('On Click Event')
      if (event.currentTarget === document){
        this.isActive = false
        return null
      }
      else if (event.currentTarget === this.contentEl){
        event.preventDefault()
        event.stopPropagation()
      }

      const { isStatic, showOnClick } = settings

      this.isActive = true

      const resp = checkCall(settings.onClick, event, this)
      if (resp === false) return null

      if (!isStatic && showOnClick && !toolsVisible)
        this.toggleTools('on')

      this.buttons && this.buttons.clearDropdown()
    }

    /**
    * Called when the text selection changes, updates the xy pos of the caret
    * Turns on tools if they are not visitable
    * @param { object } settings - props that define how WYSIWYG editor functions
    * @return { function } function called when the selection changes
    */
    onSelChange = e => {
      logData('On Select Event')

      if (settings.destroy || this.isActive === false) return null

      const { isStatic, showOnClick, onSelect, classes } = settings
      const selection = getSelection()
      if (!selection) return null
      // Find the closest dom node to search for the editor dom node
      // text nodes don't have a .closest method, so we need on that does
      const findNode = selection.anchorNode && selection.anchorNode.nodeType === 3
        ? selection.anchorNode.parentNode
        : selection.anchorNode
      // Check if we have the correct editor for this event
      const isEditor = findNode.closest(`[contenteditable="true"]`) === this.contentEl
      // Check if any buttons should be active
      isEditor && checkActiveButtons(findNode, this, classes.BTN_SELECTED)

      if (isStatic) return null

      // If is active not defined, check if its the active editor
      if (this.isActive === undefined)
        this.isActive = document.activeElement === this.contentEl
      // If it is active, but wrong editor, turn it off
      else if (this.isActive && !isEditor)
        this.isActive = false
      // If it's not active, but we have the correct editor
      // Check settings to see if the tools should be shown
      else if (!this.isActive && isEditor && !showOnClick)
        return null

      // Check for a settings callback on select, and call it
      const resp = checkCall(onSelect, e, settings)
      if (resp === false) return null

      // If wrong editor, and the tools are visible, turn them off
      if (!isEditor)
        return toolsVisible && this.toggleTools('off')

      // If the tools are on, update their pos based on the selection
      toolsVisible && this.updateToolsPos(selection)

      // Check if anything was selected
      // if anchorOffset and focusOffset are 0, then nothing was selected, so return
      if (!selection || (!selection.anchorOffset && !selection.focusOffset))
        return null

      // Check if the tools are off, and if so turn them on
      !toolsVisible && this.toggleTools('on')
      e.preventDefault()
    }

    /**
    * Returns a function that listens for changes
    * Checks for change type, and updates the content based on change
    * Calls the passed in onChange callback if it exists
    * @param  { dom node } content - holds the editable content
    * @param  { object } settings - props that define how WYSIWYG editor functions
    * @return { void }
    */
    onContentChange = observer => {
      logData('On Content Change Event')
      if (settings.destroy ||  settings.codeEditActive || this.isActive === false)
        return null

      const { defParaSep, onChange } = settings
      if (!observer || !observer[0]) return null

      // Call the passed in on change handler if it exists
      const resp = checkCall(onChange, this.contentEl.innerHTML, observer, this)
      if (resp === false) return null

      this.buttons && this.buttons.clearDropdown()
      const el = observer[0].target
      const firstChild = el.firstChild
      // Clean up the the element content if needed
      firstChild &&
        firstChild.nodeType === 3
        && exec(FORMAT_BLOCK, `<${defParaSep}>`)

      // Check if the actions should be disabled

      const { disableIds, state } = checkListDisable(this.buttons && this.buttons.getCache())
      disableIds &&
        disableIds.length &&
        this.buttons &&
        this.buttons.disableToggle(state, disableIds)

      // Check if the tools should be turned on
      if (!toolsVisible) this.toggleTools('on')

    }

    /**
    * Handles input from the keyboard
    * @param  { object } event - browser window event
    * @return { boolean } - should do default browser behavior
    */
    onKeyDown = event => {
      logData('On Keydown Event', event.key)
      
      if (settings.destroy || this.isActive === false) return null

      const { isStatic, defParaSep } = settings
      // If response is false, just return
      const resp = checkCall(settings.onKeyDown, event, this)
      if (resp === false) return null

      this.buttons && this.buttons.clearDropdown()

      if (
        !this.contentEl ||
        !handelKeys[event.key] ||
        !event.target ||
        event.target !== this.contentEl
      ) return null

      switch (event.key){
        case 'Tab': return event.preventDefault()
        case 'Enter': {
          exec(PARA_SEP_STR, `<${defParaSep}>`)
          return setTimeout(() => (this.updateToolsPos()), 0)
        }
        case 'Backspace': {
          !isStatic && this.updateToolsPos()
          const selection = getSelection()
          if (!selection) return null

          const selectedText  = getSelectedText(selection)
          if (
            selection.isCollapsed &&
            !selection.anchorOffset &&
            !selectedText.length &&
            noContent(this.contentEl)
          ){
            // If no el content, reset it, and return
            return event.preventDefault()
          }
        }
      }
    }

    /**
    * Updates the pos of the editor tools
    * @param { object } settings - props that define how WYSIWYG editor functions
    * @param { object } selection - dom selection object
    * @param { object } selPos - new pos for the tools
    * @return { void }
    */
    updateToolsPos = (selection, selPos) => {
      const { isStatic, offset, onUpdateToolPos } = settings
      if (isStatic || !this.popper || !this.active) return null

      selPos = selPos || getSelectionCoords(selection)
      if (!selPos) return null

      const resp = checkCall(onUpdateToolPos, settings.Editor, selection, selPos)
      if (resp === false) return null

      settings.caretPos = {
        x: selPos.x + offset.x || 0,
        y: selPos.y + offset.y || 0
      }

      this.popper &&
        this.popper.scheduleUpdate &&
        this.popper.scheduleUpdate()
    }

    /**
    * Show / Hides the Editor tools
    * @param  { string } toggle - must be `on` || `off`
    * @return { void }
    */
    toggleTools = toggle => {
      const { isStatic, classes, onToggleTools } = settings
      if (isStatic) return null

      const popperTool = this.popper || {}
      const toolsRoot = popperTool.popper
      if (!toolsRoot) return null

      // Check if the show class is on the root el
      const visibleTools = toolsRoot.classList.contains(classes.SHOW)

      const resp = checkCall(onToggleTools, settings.Editor, visibleTools)
      if (resp === false) return null

      if (settings.destroy || this.isActive === false)
        toggle == 'off'

      // If toggle is not defined, use the visible flag to set the toggle
      if (toggle === undefined)
        toggle = visibleTools ? 'off' : 'on'

      if (toggle === 'off'){
        toolsRoot.classList.remove(classes.SHOW)
        toolsRoot.classList.add(classes.HIDDEN)
        toolsVisible = false
      }
      else {
        toolsRoot.classList.add(classes.SHOW)
        toolsRoot.classList.remove(classes.HIDDEN)
        toolsVisible = true
      }
      logData('Toggle Tools: ', toolsVisible)

    }

    destroy = () => {
      logData('Destroy Editor')
      
      this.isActive = false
      settings.destroy = true
      // Remove mutation observer
      mutationObs && mutationObs.disconnect()
      mutationObs = undefined
      StyleLoader.remove(this.styleId)
      CleanEditor(settings)
      settings = undefined
    }

  }
}

/**
 * Checks if buttons should be active based on dom node closest to the selection
 * @param  { dom node } findNode - node closest to the selection
 * @param  { object } Editor - WYSIWYG config object
 * @return { void }
 */
const checkActiveButtons = (findNode, Editor, selCls) => {
  const lnkId = 'composer-button-link'
  const { buttons: { cache } } = Editor
  if (!cache[lnkId] || !cache[lnkId].button) return

  if (findNode.tagName !== 'A')
    cache[lnkId].button.classList.remove(selCls)
  else
    cache[lnkId].button.classList.add(selCls)
}


const onSave = settings => {
  return e => {
    logData('On Save Event')
    settings.onSave && settings.onSave(
      settings.Editor.contentEl.innerHTML,
      e,
      settings.Editor
    )
      ? null
      : settings.destroyOnSave && settings.Editor.destroy()
  }
}

const onCancel = settings => {
  return e => {
    logData('On Cancel Event')
    // Reset the element content
    settings.Editor.contentEl.innerHTML = settings.content || ''
    settings.onCancel && settings.onCancel(e, settings.Editor)
      ? null
      : settings.destroyOnCancel && settings.Editor.destroy()
  }
}

/**
 * Builds the WYSIWYG editor
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { object } - WYSIWYG editor object
 */
const init = opts => {
  if (!opts || !opts.element)
    throw new Error('element is required when calling ComposeIt.init')
  
  // Set option to show logs
  setLogs(opts.log)
  logData('Init Editor')
  const settings = buildSettings(opts)
  const tools = buildTools(settings || {})
  const toolbar = buildToolBar(settings.classes.TOOL_BAR)
  const btnCls = Buttons(settings)
  const buttons = new btnCls()

  // Add Editor / WYSIWYG settings to the document
  setupEditor(settings, buttons)
  buildToolBtns(buttons, tools, toolbar, settings)

  const contentActions = buildContentActions(
    settings,
    onSave(settings),
    onCancel(settings)
  )
  const rootEl = buildRoot(settings, toolbar, contentActions)

  // Add editor styles to the dom
  buildStyles(settings, StyleLoader)
  // If not a static editor, build the popper element
  !settings.isStatic && buildPopper(settings, rootEl, settings.Editor.updateToolsPos)

  return settings.Editor
}

export default {
  exec,
  init,
  registerTools,
  registerTheme,
}

export {
  exec,
  init,
  registerTools,
  registerTheme,
}
