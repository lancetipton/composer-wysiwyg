import { exec } from './util'
import { FORMAT_BLOCK } from './constants'
let addedTools = {}
const windowPrompt = prompt => {
  const url = window.prompt(prompt.message)
  if (url) exec(prompt.action, url)
}

const buildIcon = (type, text) => {
  return `<span class="btn-icon ${type}">${text || ''}</span>`
}

const registerTools = tools => {
  addedTools = {
    ...addedTools,
    ...tools,
  }
}


const defaultTools = faType => {
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
          icon: buildIcon(`${faType} fa-h1`, faType !== 'far' && '<b>1<b>'),
          title: 'Heading 1',
          el: '<h1>',
          action: FORMAT_BLOCK
        },
        heading2: {
          icon: buildIcon(`${faType} fa-h2`, faType !== 'far' && '<b>2<b>'),
          title: 'Heading 2',
          el: '<h2>',
          action: FORMAT_BLOCK
        },
        heading3: {
          icon: buildIcon(`${faType} fa-h3`, faType !== 'far' && '<b>3<b>'),
          title: 'Heading 3',
          el: '<h3>',
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
      action: FORMAT_BLOCK
    },
    line: {
      icon: buildIcon(`${faType} fa-arrows-alt-h`),
      title: 'Horizontal Line',
      action: 'exec'
    },
    link: {
      icon: buildIcon(`${faType} fa-link`),
      title: 'Link',
      prompt: {
        message: 'Enter the link URL',
        action: 'createLink'
      },
      action: () => windowPrompt({
        message: 'Enter the link URL',
        action: 'createLink'
      })
    },
    image: {
      icon: buildIcon(`${faType} fa-image`),
      title: 'Image',
      action: () => windowPrompt({
        message: 'Enter the image URL',
        action: 'insertImage'
      })
    },
    ...addedTools
  }

}

export {
  defaultTools,
  registerTools
}
