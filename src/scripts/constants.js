export const BTN_ID_EXT = 'composer-button'
export const PARA_SEP_STR = 'defaultParagraphSeparator'
export const EMPTY_INPUT = ''
export const FORMAT_BLOCK = 'formatBlock'
export const INSERT_HTML = 'insertHTML'
export const STYLE_ID = 'comp-styles'
export const CODE_EDITOR_ID = 'composer-code-edit'

const themes = {
  light: {
    toolBorder: '#40413C',
    toolColor: '#40413C',
    toolHover: '#FC560B',
    background: '#FFFFFF',
    commit: '#4caf50',
    danger: '#fa0719',
    toolSelected: '#FC560B',
  },
  dark: {
    toolBorder: '#bfbec3',
    toolColor: '#bfbec3',
    toolHover: '#03a9f4',
    background: '#242a35',
    commit: '#4caf50',
    danger: '#fa0719',
    toolSelected: '#03a9f4'
  }
}


export const DEF_THEME = Object.freeze({
  themes: themes,
  colors: Object.freeze({ ...themes.dark }),
  fonts: Object.freeze({
    btn: `sans-serif`
  }),
  speeds: Object.freeze({
    showTools: '0.75s ease-in-out'
  }),
  shadow: '2px 2px 8px rgba(0,0,0,0.2)',
  maxToolsHeight: 29,
})

export const DEF_SETTINGS =  Object.freeze({
  matchParentWidth: undefined,
  destroyOnSave: true,
  destroyOnCancel: true,
  changeDebounce: 50,
  iconType: 'far',
  defaultParagraphSeparator: 'div',
  classes: Object.freeze({
    ROOT: 'composer-wysisyg',
    HIDDEN: 'composer-hidden',
    SHOW: 'composer-show',
    TOOL_BAR: 'composer-tool-bar',
    BTN_TOOL: 'composer-btn',
    BTN_GRP: 'composer-btn-group',
    BTN_DROP_LIST: 'composer-btn-drop-list',
    BTN_WRAP: 'composer-btn-wrapper',
    BTN_SELECTED: 'composer-button-selected',
    CONTENT: 'composer-content',
    WRAPPER: 'composer-wrapper',
    BTN_CONTENT: 'composer-content-action',
    BTN_SAVE: 'composer-btn-save',
    BTN_CANCEL: 'composer-btn-cancel',
    CODE_EDITOR: CODE_EDITOR_ID
  }),
  styles: Object.freeze({
    pop: {},
    static: {},
  }),
  offset: Object.freeze({
    x: 0,
    y: 35
  }),
  tools: [],
  showOnClick: true,
  styleWithCSS: false,
  codeEditActive: false,
  popper: {
    eventsEnabled: false,
    removeOnDestroy: true,
    placement: 'bottom-start',
    modifiers: {},
  }
})
