export const BTN_ID_EXT = 'composer-button'
export const PARA_SEP_STR = 'defaultParagraphSeparator'
export const EMPTY_INPUT = ''
export const FORMAT_BLOCK = 'formatBlock'
export const STYLE_ID = 'composer-stylesheet-rules'

export const DEF_STYLES = Object.freeze({
  colors: Object.freeze({
    gray: '#bfbec3',
    white: '#ffffff',
    ebonyBlack: '#242a35',
    green: '#4caf50',
    red: '#fa0719',
    blue: '#03a9f4'
  }),
  fonts: Object.freeze({
    raleway: `"Raleway", sans-serif`
  }),
  speeds: Object.freeze({
    showTools: '0.75s ease-in-out'
  }),
  shadow: '2px 2px 8px rgba(0,0,0,0.2)'
})

export const DEF_SETTINGS =  Object.freeze({
  destroyOnSave: true,
  destroyOnCancel: true,
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
})
