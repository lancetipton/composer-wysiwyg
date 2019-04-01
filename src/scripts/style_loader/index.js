import Properties from './properties'
let sheetCache = {}

/**
 * Gets or creates a style dom node
 * @param  { string } id - id of the cached style
 * @return { dom node } - the found or created style dom node
 */
const get = id => {
  if (sheetCache[id]) return sheetCache[id]
  const newSheet = document.createElement('style')
  newSheet.id = id
  sheetCache[id] = newSheet
  document.head.appendChild(sheetCache[id])
  return sheetCache[id]
}

/**
 * Gets the dom style node and sets its content to be the passed in value
 * @param  { string } id - id of the cached style
 * @param  { string } styleStr - contents to update the style with
 * @return { void }
 */
const set = (id, styleStr) => {
  const styleEl = get(id)
  if (styleEl.styleSheet) styleEl.styleSheet.cssText = styleStr
  else styleEl.innerHTML = styleStr
}

/**
 * Removes style cache item from cache and dom
 * @param  { string } id - id of the cached style
 * @return { void }
 */
const remove = id => {
  try {
    sheetCache[id] && document.head.removeChild(sheetCache[id])
  }
  catch (e){
    sheetCache[id] && sheetCache[id].parentNode.removeChild(sheetCache[id])
  }
  sheetCache[id] = undefined
}

/**
 * Removes all styles nodes from cache and dom
 * @return {void}
 */
const destroy = () => (
  sheetCache = Object
    .keys(sheetCache)
    .reduce((cache, key) => {
      remove(key)
      return cache
    }, {})
)

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
 * Converts a block of JS CSS into CSS string
 * @param  { string } selector - CSS selector for the rules
 * @param  { object } rls - CSS rules to be converted into a string
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
 * Converts JS CSS rule into CSS string
 * @param  { object } rule - style as JS CSS
 * @return { string } rule convert into CSS string
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
 * @param  { array of objects } rules - array of object styles to add convert into string
 * @return { string } styles objects converted into string as formatted css styles
 */
const build = (...rules) => Object
  .entries(deepMerge(...rules))
  .reduce((styles, [ selector, rls ]) => (
    styles + createBlock(selector, rls)
  ), '')

/**
 * Builds and sets the styles object to the document
 * @param  { string } id - id for the style tag dom node
 * @param  { object } styleObj - hold styles to be added to dom as JS style css
 * @return { void }
 */
const add = (id, styleObj) => set(id, build(styleObj))

export default {
  add,
  build,
  destroy,
  remove,
  set
}

