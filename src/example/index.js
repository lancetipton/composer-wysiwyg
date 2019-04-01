const onChange = (html) => {
  // console.log('------------------on change------------------')
  // console.log(html)
}

const onSave = () => {
  console.log('------------------I am save------------------')
}

const onCancel = () => {
  console.log('------------------I am cancel------------------')
}

const options = {
  // styleWithCSS: true,
  onChange: onChange,
  onSave: onSave,
  onCancel: onCancel,
  popper: {},
  textIcons: true,
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
}

const buildPopEditor = () => {
  const popEditor =  document.getElementById('editor-pop')
  if (!popEditor) return console.warn('Can not find dom node with id "#editor-pop"')
  const popOpts = Object.assign({}, options)
  popOpts.element = popEditor
  popOpts.content = popEditor.innerHTML
  const popComp = window.composer.init(popOpts)
  return popComp
}

const buildStaticEditor = () => {
  const staticEditor =  document.getElementById('editor-static')
  if (!staticEditor) return console.warn('Can not find dom node with id "#editor-static"')
  const staticOpts = Object.assign({}, options)
  staticOpts.onCancel = undefined
  staticOpts.onSave = undefined
  staticOpts.element = staticEditor
  staticOpts.content = staticEditor.innerHTML
  staticOpts.type = 'static'
  const staticComp = window.composer.init(staticOpts)
  return staticComp
}

const init = () => {
  const popComp = buildPopEditor()
  const staticComp = buildStaticEditor()
}


init()

