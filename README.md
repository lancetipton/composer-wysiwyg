# Compose It ( WYSIWYG Editor )

A small (141kb) and customizable content editor. Check out the [demo](https://lancetipton.github.io/Compose-It/)

## Install

  * Download the repo
    ```js
      // Clone repo
      git clone https://github.com/lancetipton/composeIt.git
      // Or Add to package.json
      "dependencies": {
        "ComposeIt": "https://github.com/lancetipton/composeIt.git"
        ...
      },
    ```
  * Add to your code
    ```js
      // * Import into code
        import ComposeIt from 'ComposeIt'
        // Or only the methods you need
        import { exec, init, registerTools, registerTheme } from 'ComposeIt'

      // * Require code
        const ComposeIt = require('ComposeIt')
      
      // * Add as html script
        <script src='/path/to/composeIt/build/ComposeIt.min.js'></script>
        // ComposeIt will be available on the window 
        <script>
          const composeIt = window.ComposeIt
          const Editor = composeIt.init({ ...settings })
        </script>
    ```

## Dependencies

  * [Font Awesome](http://fontawesome.com)
    * Used for icons
  * Install
    ```bash
      yarn install @fortawesome/fontawesome-free
    ```

## Features

  * Two Editor Types
    * Static
      * Normal WYSIWYG layout
    * Pop-Up
      * Editor moves as content is added, following the cursor

  * Customizable Theme
    * See theme section below for more information
    * Two Themes - light / dark ( default is dark )

  * Customizable Tools
    * All tools can be overwritten
    * Easy to add custom tools
      * Call the `ComposeIt.registerTools({ ...tool object })`
        * Includes helper for building tool icon
        * `ComposeIt.registerTools.buildIcon('FA icon type "fas || far"', 'tool text')`
    * See tools section below for more information

  * Lots of other custom settings
    * See settings section

## Theme

  * Defaults
    ```js
      const theme = {
        theme: 'dark',
        colors: {
          toolBorder: '#bfbec3',
          toolColor: '#bfbec3',
          toolHover: '#03a9f4',
          background: '#242a35',
          commit: '#4caf50',
          danger: '#fa0719',
          toolSelected: '#03a9f4',
        },
        fonts: {
          btn: `sans-serif`
        },
        speeds: {
          showTools: '0.75s ease-in-out'
        },
        shadow: '2px 2px 8px rgba(0,0,0,0.2)'
      }
    ```

  * Update default theme

    * `ComposeIt.registerTheme({ ...css in js styles })`
      * Must be called before calling the `ComposeIt.init` method
      * Below code will overwrite the default white color, and the showTools speed **ONLY**
      ```js
        ComposeIt.registerTheme({
          colors: {
            toolHover: '#FFFFFF',
          },
          speeds: {
            showTools: '0.20s'
          }
        })
      ```

## Tools

  * **Important** Only tools passed into the `ComposeIt.init` call will be added to the editor, unless `settings.allowDefTools` is set to `true`
  
      ```js
        const settings = { tools: [ 'bold', 'underline' ] }
        ComposeIt.init(settings)
      ```
      * Only the bold and underline tool will appear in the editor
      * **NO** other tools will be added

  * Default tools
    * redo
    * undo
    * bold
    * italic
    * underline
    * strikethrough
    * heading ( Dropdown )
      * heading1
      * heading2
      * heading3
      * heading4
      * heading5
      * heading6
    * dent ( Dropdown )
      * indent
      * outdent
    * align ( Dropdown )
      * justifyLeft
      * justifyCenter
      * justifyRight
      * justifyFull
    * script ( Dropdown )
      * subscript
      * superscript
    * paragraph
    * quote
    * list ( Dropdown )
      * olist
      * ulist
    * code
    * line
    * link
    * image

## Custom Tools


  * Custom tool properties
      * icon ( String )
        * html string
      * title ( String )
        * Name of the tool
        * Set as the button title property, that is shown when tool is `hovered`
      * name ( String )
        * Key of the tool in the `Default tools` object
        * Must match one of the keys from the `Default tools` section above to override that tool
        * Or used to define a custom tool when registering it
      * el ( String )
        * html string element; i.e. ```"<p>"```
        * passed to `document.execCommand` when `action` property is `formatBlock || insertHTML`
      * cmd ( String )
        * If set to 'dropdown', will toggle its sub-tools dropdown if it exists
        * Else, value is passed to the `document.execCommand` when `action` property is `exec`
      * options ( Object )
        * Holds sub-tools as key / value pair
          * key - name of the tool
          * value - tool object
        * **IMPORTANT** - For sub-tools to be built, `cmd` property must be set to `dropdown`
      * action ( String | Function )
        * Called when the tool is pressed
        * If a string, must be one of
          * `exec`
            * calls the `document.execCommand`, passing in the `cmd` property of the tool
          * `formatBlock` || `insertHTML`
            * calls the `document.execCommand`, passing in the `el` property of the tool
        * If a Function
          * Function is bound to the editor dom node element, and called
            * Params are passed in this order
              * tool, settings, button, event

  * Add custom tool **Global** ( Must be called before init method )

      ```js
        ComposeIt.registerTools({
          alert: {
            icon: ComposeIt.registerTools.buildIcon(`fas fa-exclamation`),
            title: 'Alert',
            action: (tool, settings, button, e) => {
              // Will show this alert when tool button is pressed
              alert('Added alert tool!')
            }
          }
        })
      ```

  * Add custom tool to editor instance **Only**

      ```js
        ComposeIt.init({
          // ...other settings
          tools: [
            // ...other tools
            {
              name: 'alert'
              icon: ComposeIt.registerTools.buildIcon(`fas fa-exclamation`),
              title: 'Alert',
              action: (tool, settings, button, e) => {
                // Will show this alert when tool button is pressed
                alert('Added alert tool!')
              }
            }
          ]
        })
      ```

  * Overwrite default tool **Global** ( Must be called before init method )

      ```js
        ComposeIt.registerTools({
          link: {
            icon: ComposeIt.registerTools.buildIcon(`fas fa-link`),
            title: 'Link',
            action: (tool, settings, button, e) => {
              alert('Overwrite the link action with www.google.com')
              // Will add a link to google every time the link button is pressed
              // Use the exec command to update the editor
              ComposeIt.exec('CreateLink', 'www.google.com')
            }
          }
        })
      ```

  * Overwrite default tool for editor instance **Only**
    * name property is **REQUIRED**

      ```js
        ComposeIt.init({
          // ...other settings
          tools: [
            // ...other tools
            {
              // REQUIRED - must be one from the list defined in default tools section above
              name: 'link',
              icon: ComposeIt.registerTools.buildIcon(`fas fa-link`),
              title: 'Link',
              action: (tool, settings, button, e) => {
                alert('Overwrite the link action with www.google.com')
                // Will add a link to google every time the link button is pressed
                // Use the exec command to update the editor
                ComposeIt.exec('CreateLink', 'www.google.com')
              }
            }
          ]
        })
      ```

## Settings


  * Overwrite default settings
    * Pass the settings object to the on init call
      ```js
        const Editor = ComposeIt.init({
          // ...custom settings object
        })
      ```
  * Default settings
    ```js
      const settings = {
        // Dom node to bind the editor to ( REQUIRED )
        element: undefined,

        // Sets the width of the content editor ( Static Editor ONLY )
        // If set to true, will set the content area to the parents width
        // If not set, width will be set to '100%'
        matchParentWidth: undefined,
        
        // Initial content for the editor
          // * If not set, will use element.innerHTML
          // * IMPORTANT - gets set every time the init method is called on the element
        content: 'I am the initial content',
        
        // Overrides the the innerHTML of the element with the passed in content ( above )
        // If not set, it will try to use the elements innerHTML
        // If the element is empty, it will use the content setting above
        overRideContent: false
        
        // Should the editor be destroyed after the save button is pressed
        destroyOnSave: true,

        // Should the editor be destroyed after the cancel button is pressed
        destroyOnCancel: true,

        // Limit the calls to the onChange method to improve performance
        // Uses debounce to call the onChange method every 50ms
        changeDebounce: 50,

        // Uses Font Awesome pro by default
        // Works with Font Awesome free as well by setting to 'fas'
        iconType: 'far',

        // element to be used to separate paragraphs
        defaultParagraphSeparator: 'div',

        // Editor classes used when building styles
        // update the value change to custom classes
        classes: {
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
          CODE_EDITOR: `composer-code-edit`
        },

        // Allows customizing the styles of the editor for each instance of the editor
        // See styles section for more information
        styles: {
          // Add styles to customize the pop up editor
          pop: {},
          // Add styles to customize the static editor
          static: {},
        },

        // Offsets the editor pop-up relative to the cursor - ( Pop Editor )
        offset: {
          x: 0,
          y: 35
        },
        
        /* -- Tools  -- */
        // Set true to allow not passing a tools array, and have all tools added to the editor
        allowDefTools: undefined  // ( boolean )
        
        // Tools to be included in the editor ( White list )
          // * Tool names must be added for tool to exist in the editor
          // * Only tools added to this list will show in the Editor
          // * Global Custom tools must be registered before calling init
        tools: [
          //... Can be a string from the list defined in default tools section above
          //... Or an object as defined in the `editor instance` tools sections above
        ],

        // Show the Editor tools when clicking on the edit content element - ( Pop Editor )
        showOnClick: true,

        // Style the content with inline css
        styleWithCSS: false,

        // popper.js options from https://popper.js.org
        popper: {
          removeOnDestroy: true,
          placement: 'bottom-start',
          modifiers: {
            offset: { offset: 5 },
            keepTogether: { enabled: true },
            preventOverflow: {
              enabled: true,
              padding: 10,
              escapeWithReference: false,
            }
          }
        },

        /* -- Callback Methods  -- */
          // * Default to undefined
          // * Set as a function to use
          // * Return false to bypass the default method action
        
        // Logs an event message when the event is fired
        log: false

        // Called when the Editor content is changed
        onChange: undefined
          
        // Called when Editor save button is pressed
          // * Only shown in the editor when it's defined
          // * Destroys the editor
          // * return false, to bypass call to Editor.destroy
        onSave: undefined

        // Called when the Editor cancel button is pressed
          // * Only shown in the editor when it's defined
          // * Destroys the editor
          // * return false, to bypass call to Editor.destroy
        onCancel: undefined

        // Called when a selection is changed in the Editor Content
        onSelect: undefined

        // Called when a key is pressed
        onKeyDown: undefined

        // Called when the Editor is clicked on
        onClick: undefined

        // Called when the Editor tools position updates
        onUpdateToolPos: undefined

        // Called when the Editor tools are toggled
        onToggleTools: undefined
      }
    ```

## Styles


  * Each editor gets its own style id, which applies only to that editor
    * Updating the theme will only apply to editors built after update has been applied

  * Override the default styles with the `settings.styles.pop || settings.styles.static`

  * `pop || static` should be an object that looks similar to below
    ```js
      settings.styles[ pop || static ] = {
        root: {},
        editorWrp: {},
        toolBar: {},
        toolGrp: {},
        toolList: {},
        toolWrp: {},
        toolFirstWrp: {},
        dropList: {},
        dropListItem: {},
        btnWrpShow: {},
        dropListOpen: {},
        tool: {},
        toolFirst: {},
        toolHover: {},
        toolSelected: {},
        contentBtn: {},
        contentBtnHover: {},
        contentBtnText: {},
        saveBtn: {},
        saveBtnHover: {},
        cancelBtn: {},
        cancelBtnHover: {},
        toolBar: {},
        contentBtn: {},
        content: {},
        code_editor: {}
      }
    ```

  * Inside each property, add override styles with `CSS in JS` format

  * Styles are applied by editor type
    * Static editor will only get static styles, same for pop up editor

  * Example - `settings.styles.pop = { editorWrp: { backgroundColor: '#1a1a1a' } }`
    * Only the editorWrp backgroundColor style will be over written for pop up editors
    * All other styles till apply
  

## Compose It API

  * init
    * Example 
      ```js
        const settings = {
          tools: [ 'redo', 'undo', 'bold', 'italic', 'underline' ],
          styleWithCSS: true,
          onChange: (html) => { console.log(html) }
        }
        const Editor = ComposeIt.init(settings)
      ```
    * param 1
      * Settings object, see more in the settings section above
    * returns **Editor Object**
      * See more information in the Editor API methods section below 

  * exec
    * Example
      ```js
        ComposeIt.exec('CreateLink', 'www.google.com')
      ```
      * param 1
        * **Required**
        * String of command to execute
        * See list of exec commands => https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
      * param 2
        * Value to be passed to the exec command ( Based on param 1 )

  * registerTools
    * Example - see example in the tools section above

  * registerTheme
    * Example - see example in the theme section above

## Editor API

  * Returned from the **ComposeIt.init** method

  * buttons ( Class )
    * Buttons Manager for managing Editor Tool buttons

  * composition ( Object )
    * Holds start and end callback when browser enters a composition state
    * Useful for special characters

  * contentEl ( Dom Node )
    * Element the Editor is attached to

  * destroy ( Function )
    * Cleans up the editor and event handlers

  * isActive ( Bool ) - ( Pop Editor )
    * If the pop up editor is active

  * onClick ( Function )
    * method called when the editor is clicked on

  * onContentChange ( Function )
    * method called when the editor content is changed

  * onKeyDown ( Function )
    * method called when editor is active an a key is pressed

  * onSelChange ( Function )
    * method called when the editor content is selected

  * popper ( Object )
    * object returned when calling `new Popper` method in popper js

  * toggleTools ( Function ) - ( Pop Editor )
    * method to turn the Editor tools on or off

  * updateToolsPos ( Function ) - ( Pop Editor )
    * method to update the position of the Editor tools
    
** Editor API Notes**
  * Editor methods are bound to Dom Events
    * If you try to override the methods of the editor, you're going to have a bad time

## Full Example

  ```html
    <head>
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
      <script src="ComposeIt.min.js"></script>
    </head>
    <body>
      <div class="editor editor-pop" id="editor-pop">
        Default editor content
      </div>
      <button class="button fas fa-times" id="add-pop-editor" >
        <span>
          Add
        </span>
      </button>
      <button class="button fas fa-times" id="destroy-pop-editor" >
        <span>
          Destroy
        </span>
      </button>
    <script>
      const compose = window.ComposeIt
      compose.registerTools({
        // Custom defined tool
        alert: {
          icon: compose.registerTools.buildIcon(`fas fa-exclamation`),
          title: 'Alert',
          action: (tool, settings, button, e) => {
            // Will show alert when clicked
            alert('Added alert tool!')
          }
        },
        // Override the default link tool
        link: {
          icon: compose.registerTools.buildIcon(`fas fa-link`),
          title: 'Link',
          action: (tool, settings, button, e) => {
            alert('Overwrite the link action with www.google.com')
            // Use the exec command to update the editor
            compose.exec('CreateLink', 'www.google.com')
          }
        },
      })

      compose.registerTheme({
        colors: {
          white: '#f1f1f1',
        },
        speeds: {
          showTools: '0.20s'
        }
      })

      const options = {
        element: document.getElementById('editor-pop'),
        onChange: (html) => console.log(html),
        onSave: (html) => console.log(html),
        onCancel: () => console.log('on cancel'),
        iconType: 'fas',
        tools: [
          'redo',
          'undo',
          'bold',
          'italic',
          'align',
          'underline',
          'strikethrough',
          // Add global custom tool ( name / key )
          'alert',
          // Add editor instance ONLY tool
          {
            // name is REQUIRED
            name: 'alert2',
            icon: compose.registerTools.buildIcon(`fas fa-exclamation`),
            title: 'Alert TOO',
            action: (tool, settings, button, e) => {
              // Will show alert when clicked
              alert('I am Alert 2!')
            }
          }
        ]
      }

      const Editor = compose.init(options)
      const destBtn = document.getElementById('destroy-pop-editor')
      destBtn.addEventListener('click', e => {
        Editor && Editor.destroy()
        Editor = null
      })

      const addBtn = document.getElementById('add-pop-editor')
      addBtn.addEventListener('click', e => {
        if (Editor) return
        Editor = compose.init(options)
      })
    </script>
    </body>
    </html>
  ```