import Properties from './properties'
const sheetCache = {}

const get = id => {
  if (sheetCache[id]) return sheetCache[id]
  const newSheet = document.createElement('style')
  newSheet.id = id
  sheetCache[id] = newSheet
  document.head.appendChild(sheetCache[id])
  return sheetCache[id]
}

const set = (id, styleStr) => {
  const styleEl = get(id)
  if (styleEl.styleSheet) styleEl.styleSheet.cssText = styleStr
  else styleEl.innerHTML = styleStr
}

const remove = id => {
  try {
    sheetCache[id] && document.head.removeChild(sheetCache[id])
  }
  catch (e){
    sheetCache[id] && sheetCache[id].parentNode.removeChild(sheetCache[id])
  }
  sheetCache[id] = undefined
}

const destroy = () => Object.keys(sheetCache).map(remove)

/**
 * Deep merges an array of objects together
 * @param { array } sources - array of objects to join
 * @returns
 */
const deepMerge = (...sources) => sources.reduce(
  (merged, source) =>
    source instanceof Array
      ? // Check if it's array, and join the arrays
      [ ...((merged instanceof Array && merged) || []), ...source ]
      : // Check if it's an object, and loop the properties
      source instanceof Object
        ? Object.entries(source)
          // Loop the entries of the object, and add them to the merged object
          .reduce(
            (joined, [ key, value ]) => ({
              ...joined,
              [key]:
                // Check if the value is an object, and deep merge the object with the current merged object
                (value instanceof Object &&
                  key in joined &&
                  deepMerge(joined[key], value)) ||
                // Otherwise just set the value
                value
            }),
            merged
          )
        : // If it's not an array or object, just return the merge object
        merged,
  {}
)

/**
 *
 * @param  {any} selector
 * @param  {any} rls
 * @return
 */
const createBlock = (selector, rls) => {
  const subSelect = []
  const filteredRls = Object.keys(rls).reduce((filtered, key) => {
    if (typeof rls[key] !== 'object') filtered[key] = rls[key]
    else subSelect.push([ `${selector} ${key}`, rls[key] ])

    return filtered
  }, {})
  const styRls = createRules(filteredRls)
  let block = `${selector} {${styRls}\n}\n`
  subSelect.length && subSelect.map(subItem => {
    block += createBlock(subItem[0], subItem[1])
  })

  return block
}

/**
 *
 * @param  {any} rule
 * @return {void}
 */
const createRules = (rule) => Object
  .entries(rule)
  .reduce((ruleString, [ propName, propValue ]) => {
    const name = propName
      .replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`)

    const hasUnits = !Properties.noUnits[propName]
    const val = hasUnits && typeof propValue === 'number' && propValue + 'px' || propValue

    return `${ruleString}\n\t${name}: ${val};`
  }, '')

/**
 *
 * @param  { array of objects } rules -
 * @return {void}
 */
const build = (...rules) => Object
  .entries(deepMerge(...rules))
  .reduce((styles, [ selector, rls ]) => (
    styles + createBlock(selector, rls)
  ), '')


export default {
  build,
  destroy,
  remove,
  set
}

