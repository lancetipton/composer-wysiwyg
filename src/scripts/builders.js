import { defaultTools, registerTools } from './tools'
import { getStyles, registerTheme } from './styles'
import {
  appendChild,
  createElement,
  prependChild,
} from './utils'
import {
  EMPTY_INPUT,
  STYLE_ID,
  DEF_SETTINGS,
  KEY_MODS,
} from './constants'

/**
 * Creates a uuid, unique up to around 20 million iterations. good enough for us
 * @param  { number } start of the uuid
 * @return { string } - build uuid
 */
const uuid = a => a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,uuid)

const buildSettings = settings => ({
  ...joinSettings(settings),
  isStatic: settings.type === 'static'
})

/**
 * Builds the Dom Node for the tool bar
 * @param  { string } toolBarCls - class for the tool bar dom node
 * @return { dom node } - the build tool bar dom node
 */
const buildToolBar = toolBarCls => {
  const toolbar = createElement('div')
  toolbar.className = toolBarCls

  return toolbar
}

/**
 * Builds the Root dom node for the editor and adds to the dom based on settings
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @param { dom node } toolbar - dom node that holds the editor tools dom nodes
 * @return { void }
 */
const buildRoot = (settings, toolbar, contentActs) => {
  const wrapper = createElement('div')
  wrapper.className = settings.classes.WRAPPER

  // Add the content actions first, so dropdowns in the toolbar show up above them
  Array.isArray(contentActs) &&
    contentActs.map(contentAct => appendChild(wrapper, contentAct))
  // Add the toolbar actions
  settings.isStatic
    ? prependChild(wrapper, toolbar)
    : appendChild(wrapper, toolbar)

  const rootEl = createElement('div')
  settings.styleId = settings.styleId || buildStyleId(settings)
  rootEl.classList.add(settings.classes.ROOT)
  rootEl.classList.add(settings.styleId)

  appendChild(rootEl, wrapper)

  if (!settings.isStatic) appendChild(document.body, rootEl)
  else {
    rootEl.classList.add(settings.type)
    prependChild(settings.element, rootEl)
  }

  return rootEl
}

/**
 * Gets the tools by joining the default and passed in tools together
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { array } - joined default and passed in tools
 */
const buildTools = settings => {
  const defTools = defaultTools(settings)
  return settings.tools && settings.tools.length
    ? (settings.tools
      .reduce((allTools, tool) => {
        if (typeof tool !== 'string' && !Array.isArray(tool))
          allTools.push({ ...defTools[tool.name], ...tool })
        else if (typeof tool === 'string' && defTools[tool])
          allTools.push({ ...defTools[tool] })

        return allTools
      }, [])
    )
    : settings.allowDefTools && Object.values(defTools) || []
}

const buildStyleId = (settings, id) => {
  settings.styleId = `${STYLE_ID}-${ id || uuid()}`
  return settings.styleId
}

/**
 * Builds the styles for the WYSIWYG editor
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { void }
 */
const buildStyles = (settings, StyleLoader) => {
  const styleId = settings.styleId || buildStyleId(settings)
  StyleLoader.add(styleId, getStyles(settings, styleId))
}


/**
 * Builds and action separate from the tools
 * Used for the save and cancel actions of the editor
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @param  { function } onClick - action to preform when clicked
 * @param  { string } type - type of action it is ( used as action text )
 * @param  { string } icon - Font awesome class to show FA icon
 * @return { dom node } - created action
 */
const buildAct = (settings, onClick, type, icon) => {
  const { BTN_CONTENT, BTN_SAVE, BTN_CANCEL } = settings.classes
  const button = createElement('button')
  const icnClass = icon && `far fa-${icon}` || ''
  button.className = `${BTN_CONTENT} ${type === 'save' ? BTN_SAVE : BTN_CANCEL} ${icnClass}`
  button.onclick = onClick
  const btnText = createElement('span')
  btnText.innerHTML = type
  appendChild(button, btnText)

  return button
}

/**
 * Builds Save and Exit actions
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { array } array of dom node content actions
 */
const buildContentActions = (settings, onSave, onCancel) => {
  const contentActs = []
  settings.onSave && contentActs.push(buildAct(
    settings,
    onSave,
    'save',
    'check-circle'
  ))

  settings.onCancel && contentActs.push(buildAct(
    settings,
    onCancel,
    'cancel',
    'times-circle'
  ))

  return contentActs
}

/**
 * Builds content dom node with contentEditable for editing its content
 * Adds event listeners to capture 'Enter' and 'Tab' keyboard events
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { dom node } - build dom node that holds the editable content
 */
const buildContent = (settings, Editor) => {
  const { isStatic, element, classes, content, matchParentWidth, overRideContent } = settings
  const addContent = overRideContent
    ? content || element.innerHTML || EMPTY_INPUT
    : element.innerHTML || content || EMPTY_INPUT
  
  const contentEl = !isStatic && element || createElement('div')
  isStatic && contentEl.classList.add('static')
  element.innerHTML = ''
  contentEl.innerHTML = addContent
  settings.styleId = settings.styleId || buildStyleId(settings)
  contentEl.contentEditable = true
  contentEl.classList.add(classes.CONTENT)
  contentEl.classList.add(settings.styleId)

  if (isStatic){

    if (matchParentWidth)
      contentEl.style.width = `${element.clientWidth}px`
    else contentEl.style.width = '100%'

    contentEl.style.height = `${element.clientHeight - 29}px`
    appendChild(element, contentEl)
  }

  return contentEl
}


const buildKeyCmds = (tools, keyCmds = {}) => (
  Array.isArray(tools) && tools.reduce((keyCmds, tool) => {
    if(!Array.isArray(tool.key)) return keyCmds

    const cmd = { mod: [], key: [] }
    Array.isArray(tool.key) && tool.key.map(key => {
      KEY_MODS.indexOf(key.toLowerCase()) !== -1
        ? cmd.mod.push(key.toLowerCase())
        : cmd.key.push(key.toLowerCase())
    })
    cmd.mod.sort()
    cmd.key.sort()
    keyCmds[tool.title] = cmd

    if(tool.options)
      keyCmds = buildKeyCmds(Object.values(tool.options), keyCmds)

    return keyCmds
  }, keyCmds) || keyCmds
)
  

/**
 * Joins settings together with default settings
 * @param  { object } [settings={}] - user settings to override the defaults
 * @return { object } - joined user settings and default settings
 */
const joinSettings = (settings = {}) => {
  const styles = settings.styles || {}
  return {
    ...DEF_SETTINGS,
    ...settings,
    classes: {
      ...DEF_SETTINGS.classes,
      ...settings.classes
    },
    offset: {
      ...DEF_SETTINGS.offset,
      ...settings.offset,
    },
    tools: [
      ...DEF_SETTINGS.tools,
      ...(settings.tools || [])
    ],
    styles: {
      ...DEF_SETTINGS.styles,
      ...styles,
      pop: {
        ...DEF_SETTINGS.styles.pop,
        ...(styles.pop || {}),
      },
      static: {
        ...DEF_SETTINGS.styles.static,
        ...(styles.static || {}),
      }
    },
    popper: {
      ...DEF_SETTINGS.popper,
      ...settings.popper,
      modifiers: {
        ...DEF_SETTINGS.popper.modifiers,
        ...(settings.popper && settings.popper.modifiers || {})
      }
    },
  }

}

export {
  buildContent,
  buildContentActions,
  buildKeyCmds,
  buildRoot,
  buildSettings,
  buildStyles,
  buildToolBar,
  buildTools,
  registerTools,
  registerTheme,
}
