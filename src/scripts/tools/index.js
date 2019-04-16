import { FORMAT_BLOCK, INSERT_HTML } from '../constants'
import { toggleCodeEditor, windowPrompt } from './plugins'

let addedTools = {}

/**
 * Helper to build a tool icon with FA
 * @param  { string } type - Font Awesome icon type
 * @param  { string } text
 * @return { string } html button icon as string
 */
const buildIcon = (type, text) => `<span class="btn-icon ${type}">${text || ''}</span>`

/**
 * Adds tool to the default tools
 * @param  { object } tools - to be added to the default tools ( Global )
 * @return { void }
 */
const registerTools = tools => {
  addedTools = {
    ...addedTools,
    ...tools,
  }
}
registerTools.buildIcon = buildIcon

/**
 * Builds the default tools, and joins with any added tools
 * @param  { object } settings - setting defined when calling ComposeIt.init
 * @return { object } - built tools object with joined added tools
 */
const defaultTools = settings => {
  const faType = settings.iconType
  return {
    redo: {
      icon: buildIcon(`${faType} fa-redo`),
      title: 'Redo',
      cmd: 'redo',
      action: 'exec'
    },
    undo: {
      icon: buildIcon(`${faType} fa-undo`),
      title: 'Undo',
      cmd: 'undo',
      action: 'exec'
    },
    bold: {
      icon: buildIcon(`${faType} fa-bold`),
      title: 'Bold',
      cmd: 'bold',
      action: 'exec'
    },
    italic: {
      icon: buildIcon(`${faType} fa-italic`),
      title: 'Italic',
      cmd: 'italic',
      action: 'exec'
    },
    underline: {
      key: [ 'cmd', 'u' ],
      icon: buildIcon(`${faType} fa-underline`),
      title: 'Underline',
      cmd: 'underline',
      action: 'exec'
    },
    strikethrough: {
      key: [ 'cmd', 'o' ],
      icon: buildIcon(`${faType} fa-strikethrough`),
      title: 'Strike-through',
      cmd: 'strikeThrough',
      action: 'exec'
    },
    heading: {
      key: [ 'cmd', 'h' ],
      icon: buildIcon(`${faType} fa-heading`),
      title: 'Heading',
      cmd: 'dropdown',
      listDisable: true,
      options: {
        heading1: {
          key: [ 'cmd', 'h', '1' ],
          icon: buildIcon('', '<b>1</b>'),
          title: 'Heading 1',
          el: '<h1>',
          cmd: 'h1',
          action: FORMAT_BLOCK
        },
        heading2: {
          key: [ 'cmd', 'h', '2' ],
          icon: buildIcon('', '<b>2</b>'),
          title: 'Heading 2',
          el: '<h2>',
          cmd: 'h2',
          action: FORMAT_BLOCK
        },
        heading3: {
          key: [ 'cmd', 'h', '3' ],
          icon: buildIcon('', '<b>3</b>'),
          title: 'Heading 3',
          el: '<h3>',
          cmd: 'h3',
          action: FORMAT_BLOCK
        },
        heading4: {
          key: [ 'cmd', 'h', '4' ],
          icon: buildIcon('', '<b>4</b>'),
          title: 'Heading 4',
          el: '<h4>',
          cmd: 'h4',
          action: FORMAT_BLOCK
        },
        heading5: {
          key: [ 'cmd', 'h', '5' ],
          icon: buildIcon('', '<b>5</b>'),
          title: 'Heading 5',
          el: '<h5>',
          cmd: 'h5',
          action: FORMAT_BLOCK
        },
        heading6: {
          key: [ 'cmd', 'h', '6' ],
          icon: buildIcon('', '<b>6</b>'),
          title: 'Heading 6',
          el: '<h6>',
          cmd: 'h6',
          action: FORMAT_BLOCK
        },
      }
    },
    dent: {
      key: [ 'cmd', 'd' ],
      icon: buildIcon(`${faType} fa-indent`),
      title: 'Dent',
      cmd: 'dropdown',
      options: {
        indent: {
          key: [ 'cmd', 'd', 'i' ],
          icon: buildIcon(`${faType} fa-indent`),
          title: 'Indent',
          cmd: 'indent',
          action: 'exec'
        },
        outdent: {
          key: [ 'cmd', 'd', 'o' ],
          icon: buildIcon(`${faType} fa-outdent`),
          title: 'Outdent',
          cmd: 'outdent',
          action: 'exec'
        },
      }
    },
    align: {
      key: [ 'cmd', 'j' ],
      icon: buildIcon(`${faType} fa-align-justify`),
      title: 'Align',
      cmd: 'dropdown',
      options: {
        justifyLeft: {
          key: [ 'cmd', 'j', 'l' ],
          icon: buildIcon(`${faType} fa-align-left`),
          title: 'Left',
          cmd: 'justifyLeft',
          action: 'exec'
        },
        justifyCenter: {
          key: [ 'cmd', 'j', 'c' ],
          icon: buildIcon(`${faType} fa-align-center`),
          title: 'Center',
          cmd: 'justifyCenter',
          action: 'exec'
        },
        justifyRight: {
          key: [ 'cmd', 'j', 'r' ],
          icon: buildIcon(`${faType} fa-align-right`),
          title: 'Right',
          cmd: 'justifyRight',
          action: 'exec'
        },
        justifyFull: {
          key: [ 'cmd', 'j', 'f' ],
          icon: buildIcon(`${faType} fa-align-justify`),
          title: 'Justify',
          cmd: 'justifyFull',
          action: 'exec'
        },

      }
    },
    script: {
      key: [ 'cmd', 'g' ],
      icon: buildIcon(`${faType} fa-subscript`),
      title: 'Script',
      cmd: 'dropdown',
      options: {
        subscript: {
          key: [ 'cmd', 'g', '-' ],
          icon: buildIcon(`${faType} fa-subscript`),
          title: 'Subscript',
          cmd: 'subscript',
          action: 'exec'
        },
        superscript: {
          key: [ 'cmd', 'g', '+' ],
          icon: buildIcon(`${faType} fa-superscript`),
          title: 'Superscript',
          cmd: 'superscript',
          action: 'exec'
        },
      }
    },
    paragraph: {
      key: [ 'cmd', 'p' ],
      listDisable: true,
      icon: buildIcon(`${faType} fa-paragraph`),
      title: 'Paragraph',
      el: '<p>',
      action: FORMAT_BLOCK
    },
    quote: {
      key: [ 'cmd', 'q' ],
      listDisable: true,
      icon: buildIcon(`${faType} fa-quote-right`),
      title: 'Quote',
      el: '<blockquote>',
      action: FORMAT_BLOCK
    },
    list: {
      key: [ 'cmd', 'l' ],
      icon: buildIcon(`${faType} fa-list`),
      title: 'List',
      cmd: 'dropdown',
      options: {
        olist: {
          key: [ 'cmd', 'l', 'o' ],
          icon: buildIcon(`${faType} fa-list-ol`),
          title: 'Ordered List',
          cmd: 'insertOrderedList',
          action: 'exec'
        },
        ulist: {
          key: [ 'cmd', 'l', 'u' ],
          icon: buildIcon(`${faType} fa-list-ul`),
          title: 'Unordered List',
          cmd: 'insertUnorderedList',
          action: 'exec'
        }
      }
    },
    code: {
      key: [ 'cmd', 'm' ],
      icon: buildIcon(`${faType} fa-code`),
      title: 'Code',
      action: (tool, settings, button, e) => toggleCodeEditor({
        tool,
        settings,
        button
      })
    },
    line: {
      key: [ 'cmd', '-' ],
      icon: buildIcon(`${faType} fa-arrows-alt-h`),
      title: 'Horizontal Line',
      el: '<hr>',
      action: INSERT_HTML
    },
    link: {
      key: [ 'cmd', 'k' ],
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
      key: [ 'cmd', 'i' ],
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
