import ReadMe from '../../README.md'

const iconMap = {
  install: '<i class="fas fa-clipboard-check"></i>',
  dependencies: '<i class="fas fa-plug"></i>',
  features: '<i class="fab fa-font-awesome-flag"></i>',
  theme: '<i class="fas fa-palette"></i>',
  tools: '<i class="fas fa-tools"></i>',
  'custom-tools': '<i class="fas fa-hammer"></i>',
  settings: '<i class="fas fa-magic"></i>',
  styles: '<i class="fas fa-paint-brush"></i>',
  'compose-it-api': '<i class="fas fa-atom"></i>',
  'editor-api': '<i class="fas fa-atom"></i>',
  'full-example': '<i class="fas fa-book-open"></i>',
}

const headerFilter = [
  'editor-api',
  'custom-tools',
  'dependencies',
]

const addNavItem = (navList, element) => {
  const linkWrp = document.createElement('li')
  const link = document.createElement('a')
  const cleaned = element
    .innerText
    .toLowerCase()
    .replace(/ /g, '-')

  if (headerFilter.indexOf(cleaned) !== -1) return

  element.id = `compose-nav-${cleaned}`
  link.setAttribute('href', `#${element.id}`)
  link.innerHTML = `${iconMap[cleaned] || ''}\n${element.innerText}`
  link.className = 'compose-link'
  linkWrp.appendChild(link)
  linkWrp.className = 'compose-link-wrapper'
  navList.appendChild(linkWrp)
}


document.addEventListener('DOMContentLoaded', () => {


  const compHW = document.getElementById('markdown-content')

  const markDown = window.markdownit({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: false,
    typographer: false,
    quotes: '“”‘’',
    highlight: () => ('')
  })

  compHW.innerHTML = markDown.render(ReadMe)

  Array.from(document.getElementsByTagName('a'))
    .map(link => {
      link.setAttribute('target', '_blank')
    })

  const navList = document.getElementById('nav-list')
  navList && Array.from(compHW.getElementsByTagName('h2'))
    .map(element => {
      if (!element.id) addNavItem(navList, element)
    })


})
