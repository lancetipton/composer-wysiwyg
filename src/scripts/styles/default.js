import { DEF_SETTINGS, DEF_THEME } from '../constants'

const defaultTheme = { ...DEF_THEME }

const registerTheme = styleProps => {
  if (typeof styleProps !== 'object' || Array.isArray(styleProps))
    return console.warn(`Updating default styles requires a styles object argument`)

  if (styleProps.theme && styleProps.theme === 'light' || styleProps.theme === 'dark')
    defaultTheme.colors = { ...DEF_THEME.themes[styleProps.theme] }

  if (styleProps.colors)
    defaultTheme.colors = {
      ...defaultTheme.colors,
      ...styleProps.colors
    }
  if (styleProps.fonts)
    defaultTheme.fonts = {
      ...defaultTheme.fonts,
      ...styleProps.fonts
    }
  if (styleProps.speeds)
    defaultTheme.speeds = {
      ...defaultTheme.speeds,
      ...styleProps.speeds
    }

  return defaultTheme
}

const getStyles = (settings, styleId) => {
  styleId = styleId && `.${styleId}` || ''
  const { isStatic, classes, styles } = settings
  const useCls = { ...DEF_SETTINGS.classes, ...(classes || {}) }
  const { colors, speeds, fonts, shadow, maxToolsHeight } = defaultTheme
  const popRules = styles.pop || {}
  const staticRules = styles.static || {}
  const useStyles = isStatic && staticRules || popRules || {}

  return {
    ...(useStyles || {}),
    // Root editor
    [`.${useCls.ROOT}${styleId}`]: {
      position: 'absolute',
      display: 'inline-block',
      opacity: 0,
      transition: `opacity ${speeds.showTools}`,
      visibility: 'hidden',
      maxHeight: 24,
      ...useStyles.root,

      //----- WYSIWYG WRAPPER ----- //
      [`.${useCls.WRAPPER}`]: {
        ...useStyles.editorWrp,

        //----- TOOL BAR ----- //
        [`.${useCls.TOOL_BAR}`]: {
          borderRadius: '20px',
          backgroundColor: colors.background,
          boxShadow: shadow,
          maxHeight: maxToolsHeight,
          ...useStyles.toolBar,

          //----- BTN GROUP ----- //
          [`.${useCls.BTN_GRP}`]: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px',
            ...useStyles.toolGrp,

            [`.${useCls.BTN_WRAP}`]: {
              position: 'relative',
              border: '1px solid transparent',
              borderLeft: `1px solid ${colors.toolBorder}`,
              display: 'flex',
              ...useStyles.toolList,

              [`.${useCls.BTN_TOOL}`]: {
                border: 'none',
                ...useStyles.toolWrp,
              },
              [`.${useCls.BTN_TOOL}:first-of-type`]: {
                border: 'none',
                ...useStyles.toolFirstWrp,
              },
              [`.${useCls.BTN_DROP_LIST}`]: {
                position: 'absolute',
                listStyleType: 'none',
                margin: 0,
                padding: 0,
                backgroundColor: colors.background,
                visibility: 'hidden',
                top: 19,
                width: '100%',
                textAlign: 'center',
                boxShadow: shadow,
                ...useStyles.dropList,

                [`li`]: {
                  borderTop: `1px solid ${colors.toolBorder}`,
                  paddingTop: `4px`,
                  paddingBottom: `4px`,
                  fontSize: `10px`,
                  display: 'inline-block',
                  ...useStyles.dropListItem,
                }
              }
            },

            [`.${useCls.BTN_WRAP}.${useCls.SHOW}`]: {
              ...useStyles.btnWrpShow,

              [`.${useCls.BTN_DROP_LIST}`]: {
                visibility: 'visible',
                ...useStyles.dropListOpen,
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
              borderLeft: `1px solid ${colors.toolBorder}`,
              padding: '0 10px',
              color: colors.toolColor,
              fontSize: '12px',
              fontFamily: fonts.btn,
              textDecoration: 'none',
              ...useStyles.tool,
            },
            [`.${useCls.BTN_TOOL}:first-of-type`]: {
              borderLeft: '1px solid transparent',
              ...useStyles.toolFirst,
            },
            [`.${useCls.BTN_TOOL}:hover`]: {
              color: colors.toolHover,
              ...useStyles.toolHover,
            },
            [`.${useCls.BTN_SELECTED}`]: {
              color: colors.toolSelected,
              ...useStyles.toolSelected,
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
          color: colors.toolColor,
          border: 'none',
          padding: '5px',
          paddingRight: '10px',
          boxShadow: shadow,
          backgroundColor: colors.background,
          borderRadius: '20px',
          cursor: 'pointer',
          ...useStyles.contentBtn,
        },
        [`button.${useCls.BTN_CONTENT}:hover`]: {
          ...useStyles.contentBtnHover,
        },
        [`button.${useCls.BTN_CONTENT} > span`]: {
          marginLeft: '4px',
          position: 'relative',
          top: '-2px',
          fontFamily: fonts.btn,
          fontSize: '12px',
          ...useStyles.contentBtnText,
        },

        //----- BTN SAVE ----- //
        [`button.${useCls.BTN_SAVE}`]: {
          right: '75px',
          ...useStyles.saveBtn,
        },
        [`button.${useCls.BTN_SAVE}:hover`]: {
          color: colors.background,
          backgroundColor: colors.commit,
          ...useStyles.saveBtnHover,
        },

        //----- BTN CANCEL ----- //
        [`button.${useCls.BTN_CANCEL}`]: {
          right: '0px',
          ...useStyles.cancelBtn,
        },
        [`button.${useCls.BTN_CANCEL}:hover`]: {
          color: colors.background,
          backgroundColor: colors.danger,
          ...useStyles.cancelBtnHover,
        }
      },
    },
    [`.${useCls.ROOT}${styleId}.${useCls.SHOW}`]: {
      opacity: 1,
      visibility: 'visible',
    },
    [`.${useCls.ROOT}${styleId}.${useCls.HIDDEN}`]: {
      opacity: 0,
      visibility: 'visible',
    },
    [`.${useCls.ROOT}.static${styleId}`]: isStatic && {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      transition: 'initial',
      opacity: 'initial',
      visibility: 'initial',
      backgroundColor: colors.background,
      ...useStyles.root,
      [`.${useCls.WRAPPER}`]: {
        display: 'flex',
        justifyContent: 'space-evenly',
        ...useStyles.editorWrp,

        //----- TOOL BAR ----- //
        [`.${useCls.TOOL_BAR}`]: {
          boxShadow: 'none',
          ...useStyles.toolBar,
        },

        //----- BTN CONTENT ----- //
        [`button.${useCls.BTN_CONTENT}`]: {
          position: 'initial',
          top: 'initial',
          border: 'initial',
          boxShadow: 'initial',
          borderRadius: 'initial',
          ...useStyles.contentBtn,
        },

      }
    } || {},

    //----- CONTENT ----- //
    [`.${useCls.CONTENT}${styleId}`]: {
      ...useStyles.content,
      //----- CONTENT EDITOR ( textarea ) ----- //
      [`.${useCls.CODE_EDITOR}`]: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        border: 'none',
        padding: '0px',
        ...useStyles.code_editor,
      }
    }
  }

}

export {
  getStyles,
  registerTheme,
}
