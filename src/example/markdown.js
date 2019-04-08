import ReadMe from '../../README.md'

document.addEventListener('DOMContentLoaded', () => {
  const compHW = document.getElementById('compose-header-wrapper')
  const markDown = window.markdownit({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: false,
    typographer: false,
    quotes: '“”‘’',
    highlight: function (/*str, lang*/) {
      return ''
    }
  })

  compHW.innerHTML = markDown.render(ReadMe)

})
