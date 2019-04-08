document.addEventListener('DOMContentLoaded', function(){

  const compose = window.ComposeIt

  const onChange = (html) => {
    console.log('on change')
    console.log(html)
  }

  // Calls composer.destroy() after this method CB
  const onSave = (html) => {
    console.log('on save')
    console.log(html)
  }

  // Calls composer.destroy() after this method CB
  const onCancel = () => {
    console.log('on cancel')

  }

  const tools = [
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
    'image',
    'alert'
  ]

  const options = {
    offset: {},
    // called on editor changes
    onChange: onChange,
    // Wait time before each change ( def 50 )
    changeDebounce: 50,
    // Callback method when save button is clicked
    onSave: onSave,
    // Remove the editor and all events when save button is hit ( popup editor only )
    destroyOnSave: false,
    // Callback method when cancel button is clicked
    onCancel: onCancel,
    // Remove the editor and all events when cancel button is hit ( popup editor only )
    destroyOnCancel: false,
    // Show the popup tools when editor is clicked on
    showOnClick: true,
    // Font awesome icon type ( Default is far )
    iconType: 'fas',
    // Set editor to add changes as style tags
    styleWithCSS: true,
    styles: {},
  }

  let popComp
  let hasDblClk = false
  const buildPopEditor = () => {
    // Use register light theme
    compose.registerTheme({ theme: 'light' })

    const popEditorEl = document.getElementById('editor-pop')
    if (!popEditorEl)
      return console.warn('Can not find dom node with id "#editor-pop"')

    const popOpts = Object.assign({}, options)
    // The element to attach the editor
    popOpts.element = popEditorEl
    // Default content for the editor
    popOpts.content = 'Pop Editor overwriting the default content'
    // Add the tools, with the link tool as text to get the registered default
    popOpts.tools = tools.concat([ 'link' ])

    // Turn on settings to remove the editor on save and cancel
    popOpts.destroyOnSave = true
    popOpts.destroyOnCancel = true

    popComp = compose.init(popOpts)

    // Listener to toggle the editor on / off with double click
    !hasDblClk && popEditorEl.addEventListener('dblclick', e => {
      if (popComp.isActive) return null
      popComp = buildPopEditor()
    })
    // Flag to ensure the event is only attached once
    hasDblClk = true
    return popComp
  }

  let staticOpts
  const buildStaticEditor = () => {
    const staticEditor =  document.getElementById('editor-static')
    if (!staticEditor) return console.warn('Can not find dom node with id "#editor-static"')
    staticOpts = Object.assign({}, options)
    staticOpts.onCancel = undefined
    staticOpts.onSave = undefined
    staticOpts.element = staticEditor
    staticOpts.type = 'static'
    // Add the tools with the link tool as an object to use this instead of the default
    staticOpts.tools = tools.concat([
      {
        // Name is required when overriding as an object
        name: 'link',
        icon: compose.registerTools.buildIcon(`fas fa-link`),
        title: 'Link',
        action: (tool, settings, button, e) => {
          alert('Overwrite the link action with www.duckduckgo.com')
          compose.exec('CreateLink', 'www.duckduckgo.com')
        }
      }
    ])

    return compose.init(staticOpts)
  }


  const init = () => {
    // Register some tools, before calling the init method
    compose.registerTools({
      link: {
        icon: compose.registerTools.buildIcon(`fas fa-link`),
        title: 'Link',
        action: (tool, settings, button, e) => {
          alert('Overwrite the link action with www.google.com')
          // Use the exec command to update the editor
          compose.exec('CreateLink', 'www.google.com')
        }
      },
      alert: {
        icon: compose.registerTools.buildIcon(`fas fa-exclamation`),
        title: 'Link',
        action: (tool, settings, button, e) => {
          alert('Added alert tool!')
        }
      }
    })

    // Builds a static editor, works like normal WYSIWYG
    let staticComp = buildStaticEditor()
    // Add actions to build / destroy the static editor
    const destBtn = document.getElementById('destroy-pop-editor')
    destBtn.addEventListener('click', e => {
      staticComp && staticComp.destroy()
      staticComp = null
    })

    const addBtn = document.getElementById('add-pop-editor')
    addBtn.addEventListener('click', e => {
      if (staticComp) return
      compose.registerTheme({ theme: 'dark' })
      staticComp = compose.init(staticOpts)
    })

    // Builds a popup editor that follows along with the text
    buildPopEditor()

  }

  init()

})
