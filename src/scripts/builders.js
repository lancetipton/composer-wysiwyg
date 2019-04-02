import { defaultTools } from './tools'
import Styles from './style_loader'
import { getStyles } from './styles'
import {
  addEventListener,
  appendChild,
  createElement,
  debounce,
  getMutationObserver,
  prependChild,
} from './util'
import {
  CLASSES,
  EMPTY_INPUT,
  STYLE_ID,
  DEF_CONFIG,
} from './constants'


export const buildSettings = opts => ({
  ...opts,
  Editor: { ...buildEditor() },
  classes: { ...CLASSES, ...opts.classes },
  isStatic: opts.type === 'static',
  config: buildConfig(opts.config)
})

/**
 * Builds the Dom Node for the tool bar
 * @param  { string } toolBarCls - class for the tool bar dom node
 * @return { dom node } - the build tool bar dom node
 */
export const buildToolBar = toolBarCls => {
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
export const buildRoot = (settings, toolbar, contentActs) => {
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
  rootEl.className = settings.classes.ROOT
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
export const buildTools = settings => {
  const defTools = defaultTools(settings.config.iconType)
  return settings.tools
    ? (settings
      .tools
      .map(tool => {
        if (typeof tool !== 'string' && defTools[tool.name])
          return { ...defTools[tool.name], ...tool }
        if (typeof tool !== 'string') return
        if (defTools[tool]) return defTools[tool]
      })
    )
    : Object
      .keys(defTools)
      .map(tool => defTools[tool])
}

/**
 * Builds the styles for the WYSIWYG editor
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { void }
 */
export const buildStyles = (settings) => (Styles.add(STYLE_ID, getStyles(settings)))


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
export const buildContentActions = settings => {
  const contentActs = []
  settings.onSave && contentActs.push(buildAct(
    settings,
    settings.onSave,
    'save',
    'check-circle'
  ))

  settings.onCancel && contentActs.push(buildAct(
    settings,
    settings.onCancel,
    'cancel',
    'times-circle'
  ))

  return contentActs
}

export const buildEditor = () => ({
  contentEl: undefined,
  end: undefined,
  onSelChange: undefined,
  composition: {
    start: () => {},
  },
  toolsVisible: undefined,
  onKeyDown: undefined,
  onClick: undefined,
  popper: undefined,
  mutObs: undefined,
})

/**
 * Builds content dom node with contentEditable for editing its content
 * Adds event listeners to capture 'Enter' and 'Tab' keyboard events
 * @param  { object } settings - props that define how WYSIWYG editor functions
 * @return { dom node } - build dom node that holds the editable content
 */
export const buildContent = (settings, onContentChange, onKeyDown) => {
  const { Editor, isStatic, element, classes, placeholder } = settings
  const content = !isStatic && element || createElement('div')
  content.innerHTML = settings.content || EMPTY_INPUT
  content.contentEditable = true
  content.classList.add(classes.CONTENT)
  Editor.mutObs = getMutationObserver(
    content,
    debounce(onContentChange(content, settings))
  )

  if (placeholder && !content.innerHTML)
    content.dataset.placeholder = placeholder

  Editor.onKeyDown = onKeyDown(settings)
  addEventListener(content, 'keydown', Editor.onKeyDown)

  if (isStatic){
    content.style.width = `${element.clientWidth}px`
    content.style.height = `${element.clientHeight - 24}px`
    appendChild(element, content)
  }

  return content
}


const buildConfig = (config = {}) => {
  const styles = config.styles || {}
  return {
    ...DEF_CONFIG,
    ...config,
    tools: {
      ...DEF_CONFIG.tools,
      ...(config.tools || {})
    },
    editor: {
      ...DEF_CONFIG.editor,
      ...(config.editor || {})
    },
    styles: {
      ...DEF_CONFIG.styles,
      ...styles,
      pop: {
        ...DEF_CONFIG.styles.pop,
        ...(styles.pop || {}),
      },
      static: {
        ...DEF_CONFIG.styles.static,
        ...(styles.static || {}),
      }
    }
  }

}
