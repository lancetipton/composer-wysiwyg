const onChange = (html) => {
  // console.log('------------------on change------------------')
  // console.log(html)
}

// Calls composer.destroy() after this method CB
// return true from onSave, will stop destroy from being called
const onSave = () => {
  console.log('------------------I am save------------------')
}

// Calls composer.destroy() after this method CB
// return true from onCancel, will stop destroy from being called
const onCancel = () => {
  console.log('------------------I am cancel------------------')
}

const options = {
  onChange: onChange,
  onSave: onSave,
  onCancel: onCancel,
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
  config: {
    editor: {
      showOnClick: true,
    },
    iconType: 'fas',
    styleWithCSS: true,
    styles: {},
    popper: {},
  },
}

const buildPopEditor = () => {
  const popEditor =  document.getElementById('editor-pop')
  if (!popEditor) return console.warn('Can not find dom node with id "#editor-pop"')
  const popOpts = Object.assign({}, options)
  popOpts.element = popEditor
  popOpts.content = 'I am the pop editor'
  const popComp = window.Composer.init(popOpts)
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
  const popComp = buildPopEditor()
  const staticComp = buildStaticEditor()
}


init()

