import { createElement, prependChild } from '../../utils'
import { CODE_EDITOR_ID } from '../../constants'

/**
 * Cleans up html text for textarea
 * @param  { string } html
 * @return { string } - cleaned html string
 */
const formatText = html => {
  return html
    .replace(/&nbsp;/g, ' ')
}

/**
 * Build textarea wrapper dom node
 * @return { dom node } - wrapper dom node
 */
const buildTextWrap = () => {
  const textAreaWrap = createElement('div')
  textAreaWrap.style.position = 'relative'
  return textAreaWrap
}

/**
 * Builds a textarea dom node for editing the editor content directly
 * @param { object } settings - props that define how WYSIWYG editor functions
 * @return { dom node } - built textarea content
 */
const buildTextArea = settings => {
  const textArea = createElement('textarea')
  const rect = settings.Editor.contentEl.getBoundingClientRect()
  textArea.style.height = `${rect.height}px`
  textArea.style.width = `${rect.width}px`
  textArea.className = settings.classes.CODE_EDITOR
  textArea.id = CODE_EDITOR_ID
  return textArea
}

/**
 * Makes the code editor visible
 * @param  { object } { settings, button, tool }
 * @return { void }
 */
const showCodeEditor = ({ settings, button, tool }) => {
  const { Editor } = settings
  if (!Editor || !Editor.contentEl) return

  const textAreaWrap = buildTextWrap()
  const textArea = buildTextArea(settings)

  textArea.value = formatText(Editor.contentEl.innerHTML)

  Editor.contentEl.removeAttribute('contenteditable')
  prependChild(textAreaWrap, textArea)
  prependChild(Editor.contentEl, textAreaWrap)
  button.classList.add(settings.classes.BTN_SELECTED)
  settings.codeEditActive = true
}

/**
 * Makes the code editor hidden
 * @param  { object } { settings, button, tool }
 * @return { void }
 */
const hideCodeEditor = ({ settings, button, tool }) => {
  const { Editor } = settings
  if (!Editor || !Editor.contentEl) return
  const textWrap = Editor.contentEl.firstChild
  const textArea = textWrap.firstChild
  Editor.contentEl.innerHTML = textArea.value
  Editor.contentEl.setAttribute('contenteditable', true)
  button.classList.remove(settings.classes.BTN_SELECTED)
  settings.codeEditActive = false
}

/**
 * Show / Hides the code editor element
 * @param  { object } args - holds settings to show hide the code editor
 * @return { void }
 */
const toggleCodeEditor = (args) => {
  args.button.classList.contains(args.settings.classes.BTN_SELECTED)
    ? hideCodeEditor(args)
    : showCodeEditor(args)
}

export {
  toggleCodeEditor
}
