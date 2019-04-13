export const appendChild = (parent, child) => parent && child && parent.appendChild(child)

export const prependChild = (parent, child) => parent && child && parent.prepend(child)

export const createElement = tag => tag && document.createElement(tag)

export const queryCommandState = command => command && document.queryCommandState(command)

export const queryCommandValue = command => command && document.queryCommandValue(command)

export const exec = (command, value = null) =>
  command && document.execCommand(command, false, value)

export const removeEventListener = (parent, type, listener) =>
  parent && parent.removeEventListener(type, listener)

export const addEventListener = (parent, type, listener) =>
  parent && parent.addEventListener(type, listener)

export const getMutationObserver = (elementSelector, callback) => {
  const observer = new MutationObserver(callback)
  const obsParams = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
  }
  observer.observe(elementSelector, obsParams)

  return observer
}

export const debounce = (func, wait = 250, immediate = false) => {
  let timeout
  return (...args) => {
    if(typeof func !== 'function') return null

    let context = this
    let later = () => {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    let callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      return typeof func === 'function' && func.apply(context, args)
    }
  }
}

export const noContent = el => Boolean(!el || (
  el.nodeType === 3 && !el.length || (
    el.nodeType !== 3 && !el.innerHTML ||
    el.innerHTML === '<br>' ||
    el.innerHTML === '<div><br></div>'
  ))
)


export const checkCall = (method, ...params) => {
  if (typeof method === 'function')
    return method(...params)
}

/**
 * Checks the current list state for UL or OL
 * If in list state, then disable tools not allowed for list items
 * @return {void}
 */
export const checkListDisable = (buttons) => {
  if(!buttons) return

  const isUl = queryCommandState('insertUnorderedList')
  const isOl = queryCommandState('insertOrderedList')
  const state = isUl != false || isOl != false

  const disableIds = Object
    .entries(buttons)
    .reduce((ids, [ id, { tool } ]) => {
      id && tool && tool.listDisable && ids.push(id)
      return ids
    }, [])

  return { disableIds, state }
}

let SHOW_LOGS
export const setLogs = log => (SHOW_LOGS = log)
export const logData = (...args) => (SHOW_LOGS && console.dir(...args))