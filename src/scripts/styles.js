import { CLASSES } from './constants'

const defaultStyles = {
  colors: {
    gray: '#bfbec3',
    white: '#ffffff',
    ebonyBlack: '#242a35',
    green: '#4caf50',
    red: '#fa0719',
    blue: '#03a9f4'
  },
  fonts: {
    raleway: `"Raleway", sans-serif`
  },
  speeds: {
    showTools: '0.75s ease-in-out'
  },
  shadow: '2px 2px 8px rgba(0,0,0,0.2)'
}

const updateDefaultStyles = styleProps => {
  if (typeof styleProps !== 'object' || Array.isArray(styleProps))
    return console.warn(`Updating default styles requires a styles object argument`)

  if (styleProps.colors)
    defaultStyles.colors = {
      ...defaultStyles.colors,
      ...styleProps.colors
    }
  if (styleProps.colors)
    defaultStyles.fonts = {
      ...defaultStyles.fonts,
      ...styleProps.fonts
    }
  if (styleProps.colors)
    defaultStyles.speeds = {
      ...defaultStyles.speeds,
      ...styleProps.speeds
    }

  return defaultStyles
}

const getStyles = settings => {
  const useCls = { ...CLASSES, ...(settings.classes || {}) }
  const { colors, speeds, fonts, shadow } = defaultStyles
  const popRules = settings.styles.pop || {}
  const staticRules = settings.styles.static || {}

  return {
    ...(popRules || {}),
    [`.${useCls.ROOT}`]: {
      position: 'absolute',
      display: 'inline-block',
      opacity: 0,
      transition: `opacity ${speeds.showTools}`,
      visibility: 'hidden',
      maxHeight: 24,
      ...popRules.root,
      //----- WYSIWYG WRAPPER ----- //
      [`.${useCls.WRAPPER}`]: {
        ...popRules.wrapper,

        //----- TOOL BAR ----- //
        [`.${useCls.TOOL_BAR}`]: {
          borderRadius: '20px',
          backgroundColor: colors.ebonyBlack,
          boxShadow: shadow,
          ...popRules.toolBar,

          //----- BTN GROUP ----- //
          [`.${useCls.BTN_GRP}`]: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px',
            ...popRules.btnGrp,

            [`.${useCls.BTN_WRAP}`]: {
              position: 'relative',
              border: '1px solid transparent',
              borderLeft: `1px solid ${colors.gray}`,
              display: 'flex',
              ...popRules.btnList,

              [`.${useCls.BTN_TOOL}`]: {
                border: 'none',
                ...popRules.btnWrp,
              },
              [`.${useCls.BTN_TOOL}:first-of-type`]: {
                border: 'none',
                ...popRules.btnFirstWrp,
              },
              [`.${useCls.BTN_DROP_LIST}`]: {
                position: 'absolute',
                listStyleType: 'none',
                margin: 0,
                padding: 0,
                backgroundColor: colors.ebonyBlack,
                visibility: 'hidden',
                top: 19,
                width: '100%',
                textAlign: 'center',
                boxShadow: shadow,
                ...popRules.dropList,
                [`li`]: {
                  borderTop: `1px solid ${colors.gray}`,
                  paddingTop: `4px`,
                  paddingBottom: `4px`,
                  fontSize: `10px`,
                  display: 'inline-block',
                  ...popRules.dropListItem,
                }
              }
            },

            [`.${useCls.BTN_WRAP}.${CLASSES.SHOW}`]: {

              [`.${useCls.BTN_DROP_LIST}`]: {
                visibility: 'visible',
                ...popRules.dropListOpen,
              },
            },

            //----- BTN Tools ----- //
            [`.${useCls.BTN_TOOL}`]: {
              borderRadius: '0',
              margin: '0',
              cursor: 'pointer',
              position: 'relative',
              flex: '0 1 auto',
              display: 'inline-block',
              textAlign: 'center',
              border: '1px solid transparent',
              borderLeft: `1px solid ${colors.gray}`,
              padding: '0 10px',
              color: colors.gray,
              fontSize: '12px',
              textDecoration: 'none',
              ...popRules.btn,
            },
            [`.${useCls.BTN_TOOL}:first-of-type`]: {
              borderLeft: '1px solid transparent',
              ...popRules.btnFirst,
            },
            [`.${useCls.BTN_TOOL}:hover`]: {
              color: colors.white,
              ...popRules.btnHover,
            },
            [`.${useCls.BTN_SELECTED}`]: {
              color: colors.blue,
              ...popRules.btnSelected,
            },

          },

        },

        //----- BTN CONTENT ----- //
        [`button.${useCls.BTN_CONTENT}`]: {
          position: 'absolute',
          width: 'auto',
          height: 'auto',
          fontSize: '14px',
          transition: 'all 0.5s ease',
          top: '30px',
          color: colors.gray,
          border: 'none',
          padding: '5px',
          paddingRight: '10px',
          boxShadow: shadow,
          backgroundColor: colors.ebonyBlack,
          borderRadius: '20px',
          cursor: 'pointer',
          ...popRules.contentBtn,
        },
        [`button.${useCls.BTN_CONTENT}:hover`]: {
          ...popRules.contentBtnHover,
        },
        [`button.${useCls.BTN_CONTENT} > span`]: {
          marginLeft: '4px',
          position: 'relative',
          top: '-2px',
          fontFamily: fonts.raleway,
          fontSize: '12px',
          ...popRules.contentBtnText,
        },

        //----- BTN SAVE ----- //
        [`button.${useCls.BTN_SAVE}`]: {
          right: '75px',
          ...popRules.saveBtn,
        },
        [`button.${useCls.BTN_SAVE}:hover`]: {
          color: colors.ebonyBlack,
          backgroundColor: colors.green,
          ...popRules.saveBtnHover,
        },

        //----- BTN CANCEL ----- //
        [`button.${useCls.BTN_CANCEL}`]: {
          right: '0px',
          ...popRules.cancelBtn,
        },
        [`button.${useCls.BTN_CANCEL}:hover`]: {
          color: colors.ebonyBlack,
          backgroundColor: colors.red,
          ...popRules.cancelBtnHover,
        }
      },
    },
    [`.${useCls.ROOT}.${CLASSES.SHOW}`]: {
      opacity: 1,
      visibility: 'visible',
    },
    [`.${useCls.ROOT}.${CLASSES.HIDDEN}`]: {
      opacity: 0,
      visibility: 'visible',
    },
    [`.${useCls.ROOT}.static`]: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      transition: 'initial',
      opacity: 'initial',
      visibility: 'initial',
      backgroundColor: colors.ebonyBlack,
      ...staticRules.root,
      [`.${useCls.WRAPPER}`]: {
        display: 'flex',
        justifyContent: 'space-evenly',
        ...staticRules.wrapper,

        [`button.${useCls.BTN_CONTENT}`]: {
          position: 'initial',
          top: 'initial',
          border: 'initial',
          boxShadow: 'initial',
          borderRadius: 'initial',
          ...staticRules.contentBtn,
        },
      }
    }
  }

}

export {
  getStyles,
  updateDefaultStyles,
}
