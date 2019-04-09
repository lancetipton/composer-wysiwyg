import { exec } from '../../utils'
import { getSelection } from '../../selection'

/**
 * Displays window prompt to capture user input
 * @param  { object } { remove, message, action, settings, button }
 * @return { void }
 */
export const windowPrompt = ({ remove, message, action, settings, button }) => {
  if(typeof window === 'undefined') return

  if (action === 'CreateLink'){
    const selection = getSelection()
    if (!selection) return null

    const checkNode = selection.anchorNode.nodeType === 3
      ? selection.anchorNode.parentNode
      : selection.anchorNode

    if (checkNode.tagName === 'A')
      return exec(remove, url)

    button.classList.add(settings.classes.BTN_SELECTED)
  }

  const url = window.prompt(message)
  if (url) exec(action, url)
}
