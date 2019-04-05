import { exec } from './util'
import { FORMAT_BLOCK } from './constants'
import { getSelection } from './selection'
import { toggleCodeEditor } from './code_editor'

let addedTools = {}
const windowPrompt = ({ remove, message, action, settings, button }) => {

  if (action === 'CreateLink'){
    const selection = getSelection()
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


const buildIcon = (type, text) => `<span class="btn-icon ${type}">${text || ''}</span>`

const registerTools = tools => {
  addedTools = {
    ...addedTools,
    ...tools,
  }
}


const defaultTools = settings => {
  const faType = settings.iconType
  return {
    redo: {
      icon: buildIcon(`${faType} fa-redo`),
      title: 'Redo',
      state: 'redo',
      action: 'exec'
    },
    undo: {
      icon: buildIcon(`${faType} fa-undo`),
      title: 'Undo',
      state: 'undo',
      action: 'exec'
    },
    bold: {
      icon: buildIcon(`${faType} fa-bold`),
      title: 'Bold',
      state: 'bold',
      action: 'exec'
    },
    italic: {
      icon: buildIcon(`${faType} fa-italic`),
      title: 'Italic',
      state: 'italic',
      action: 'exec'
    },
    underline: {
      icon: buildIcon(`${faType} fa-underline`),
      title: 'Underline',
      state: 'underline',
      action: 'exec'
    },
    strikethrough: {
      icon: buildIcon(`${faType} fa-strikethrough`),
      title: 'Strike-through',
      state: 'strikeThrough',
      action: 'exec'
    },
    heading: {
      icon: buildIcon(`${faType} fa-heading`),
      title: 'Heading',
      state: 'heading',
      type: 'dropdown',
      listDisable: true,
      options: {
        heading1: {
          icon: buildIcon('', '<b>1</b>'),
          title: 'Heading 1',
          el: '<h1>',
          state: 'h1',
          action: FORMAT_BLOCK
        },
        heading2: {
          icon: buildIcon('', '<b>2</b>'),
          title: 'Heading 2',
          el: '<h2>',
          state: 'h2',
          action: FORMAT_BLOCK
        },
        heading3: {
          icon: buildIcon('', '<b>3</b>'),
          title: 'Heading 3',
          el: '<h3>',
          state: 'h3',
          action: FORMAT_BLOCK
        },
        heading4: {
          icon: buildIcon('', '<b>4</b>'),
          title: 'Heading 4',
          el: '<h4>',
          state: 'h4',
          action: FORMAT_BLOCK
        },
        heading5: {
          icon: buildIcon('', '<b>5</b>'),
          title: 'Heading 5',
          el: '<h5>',
          state: 'h5',
          action: FORMAT_BLOCK
        },
        heading6: {
          icon: buildIcon('', '<b>6</b>'),
          title: 'Heading 6',
          el: '<h6>',
          state: 'h6',
          action: FORMAT_BLOCK
        },
      }
    },
    dent: {
      icon: buildIcon(`${faType} fa-indent`),
      title: 'Dent',
      state: 'dent',
      type: 'dropdown',
      options: {
        indent: {
          icon: buildIcon(`${faType} fa-indent`),
          title: 'Indent',
          state: 'indent',
          action: 'exec'
        },
        outdent: {
          icon: buildIcon(`${faType} fa-outdent`),
          title: 'Outdent',
          state: 'outdent',
          action: 'exec'
        },
      }
    },
    align: {
      icon: buildIcon(`${faType} fa-align-justify`),
      title: 'Align',
      state: 'align',
      type: 'dropdown',
      options: {
        justifyLeft: {
          icon: buildIcon(`${faType} fa-align-left`),
          title: 'Left',
          state: 'justifyLeft',
          action: 'exec'
        },
        justifyCenter: {
          icon: buildIcon(`${faType} fa-align-center`),
          title: 'Center',
          state: 'justifyCenter',
          action: 'exec'
        },
        justifyRight: {
          icon: buildIcon(`${faType} fa-align-right`),
          title: 'Right',
          state: 'justifyRight',
          action: 'exec'
        },
        justifyFull: {
          icon: buildIcon(`${faType} fa-align-justify`),
          title: 'Justify',
          state: 'justifyFull',
          action: 'exec'
        },

      }
    },
    script: {
      icon: buildIcon(`${faType} fa-subscript`),
      title: 'Script',
      state: 'script',
      type: 'dropdown',
      options: {
        subscript: {
          icon: buildIcon(`${faType} fa-subscript`),
          title: 'Subscript',
          state: 'subscript',
          action: 'exec'
        },
        superscript: {
          icon: buildIcon(`${faType} fa-superscript`),
          title: 'Superscript',
          state: 'superscript',
          action: 'exec'
        },
      }
    },
    paragraph: {
      listDisable: true,
      icon: buildIcon(`${faType} fa-paragraph`),
      title: 'Paragraph',
      el: '<p>',
      action: FORMAT_BLOCK
    },
    quote: {
      listDisable: true,
      icon: buildIcon(`${faType} fa-quote-right`),
      title: 'Quote',
      el: '<blockquote>',
      action: FORMAT_BLOCK
    },
    list: {
      icon: buildIcon(`${faType} fa-list`),
      title: 'List',
      state: 'list',
      type: 'dropdown',
      options: {
        olist: {
          icon: buildIcon(`${faType} fa-list-ol`),
          title: 'Ordered List',
          state: 'insertOrderedList',
          action: 'exec'
        },
        ulist: {
          icon: buildIcon(`${faType} fa-list-ul`),
          title: 'Unordered List',
          state: 'insertUnorderedList',
          action: 'exec'
        }
      }
    },
    code: {
      icon: buildIcon(`${faType} fa-code`),
      title: 'Code',
      el: '<pre>',
      action: (tool, settings, button, e) => toggleCodeEditor({
        tool,
        settings,
        button
      })
    },
    line: {
      icon: buildIcon(`${faType} fa-arrows-alt-h`),
      title: 'Horizontal Line',
      action: 'exec'
    },
    link: {
      icon: buildIcon(`${faType} fa-link`),
      title: 'Link',
      action: (tool, settings, button, e) => windowPrompt({
        message: 'Enter the link URL',
        action: 'CreateLink',
        remove: 'unlink',
        check: 'A',
        settings,
        button
      })
    },
    image: {
      icon: buildIcon(`${faType} fa-image`),
      title: 'Image',
      action: (tool, settings, button, e) => windowPrompt({
        message: 'Enter the image URL',
        action: 'InsertImage',
        settings,
        button,
      })
    },
    ...addedTools
  }

}

export {
  defaultTools,
  registerTools
}
