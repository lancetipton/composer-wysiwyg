import { createElement, prependChild } from './util'
import { CODE_EDITOR_ID } from './constants'

const formatText = html => {
  return html
    .replace(/&nbsp;/g, ' ')
}

const buildTextWrap = () => {
  const textAreaWrap = createElement('div')
  textAreaWrap.style.position = 'relative'
  return textAreaWrap
}

const buildTextArea = settings => {
  const textArea = createElement('textarea')
  textArea.style.position = 'absolute'
  const rect = settings.Editor.contentEl.getBoundingClientRect()
  textArea.style.height = `${rect.height}px`
  textArea.style.width = `${rect.width}px`
  textArea.style.top = '0px'
  textArea.style.left = '0px'
  textArea.style.right = '0px'
  textArea.style.bottom = '0px'
  textArea.style.border = 'none'
  textArea.style.padding = '0px'
  textArea.className = settings.classes.CODE_EDITOR
  textArea.id = CODE_EDITOR_ID
  return textArea
}

const toggleCodeEditor = (args) => {
  args.button.classList.contains(args.settings.classes.BTN_SELECTED)
    ? hideCodeEditor(args)
    : showCodeEditor(args)
}

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

export {
  toggleCodeEditor
}
