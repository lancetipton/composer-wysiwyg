const onChange = (html) => {
  console.log('on change')
  console.log(html)
}

// Calls composer.destroy() after this method CB
// return true from onSave, will stop destroy from being called
const onSave = (html) => {
  console.log('on save')
  console.log(html)
}

// Calls composer.destroy() after this method CB
// return true from onCancel, will stop destroy from being called
const onCancel = () => {
  console.log('on cancel')

}

const options = {
  tools: [
    'redo',
    'undo',
    'bold',
    'italic',
    'heading',
    'align',
    'script',
    'paragraph',
    'underline',
    'strikethrough',
    'dent',
    'quote',
    'list',
    'code',
    'line',
    'link',
    'image'
  ],
  offset: {},
  onChange: onChange,
  onSave: onSave,
  destroyOnSave: false,
  onCancel: onCancel,
  destroyOnCancel: false,
  showOnClick: true,
  iconType: 'fas',
  styleWithCSS: true,
  styles: {},
  popper: {}
}

let popComp
let hasDblClk = false
const buildPopEditor = () => {
  const popEditorEl =  document.getElementById('editor-pop')
  if (!popEditorEl)
    return console.warn('Can not find dom node with id "#editor-pop"')

  const popOpts = Object.assign({}, options)
  popOpts.element = popEditorEl
  popOpts.content = 'I am the pop editor'
  popComp = window.Composer.init(popOpts)

  !hasDblClk && popEditorEl.addEventListener('dblclick', e => {
    if (popComp.isActive) return null
    popComp = buildPopEditor()
  })

  hasDblClk = true

  return popComp
}

const buildStaticEditor = () => {
  const staticEditor =  document.getElementById('editor-static')
  if (!staticEditor) return console.warn('Can not find dom node with id "#editor-static"')
  const staticOpts = Object.assign({}, options)
  staticOpts.onCancel = undefined
  staticOpts.onSave = undefined
  staticOpts.element = staticEditor
  staticOpts.content = 'I am the static editor'
  staticOpts.type = 'static'
  const staticComp = window.Composer.init(staticOpts)
  return staticComp
}

const init = () => {
  popComp = buildPopEditor()
  const staticComp = buildStaticEditor()
}


init()

