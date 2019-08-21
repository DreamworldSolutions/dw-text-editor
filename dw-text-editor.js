import { LitElement, html, css } from 'lit-element';
import { getIcon } from 'icons';

/**
 * It is a HTML5 rich text editor.
 * 
 * ## TOOLBAR : 
 *    Bold : 
 *    Italic :
 *    Underline :
 *    Number :
 *    Bullet : 
 * 
 * ## Events
 *  - `value-changed`: Fired with final value whenever rich text content is changed
 *  - `height-changed`: Fired when `autoHeight` is true and rich content height is changed
 *  - `body-tap`: Fired when user tap on iFrame body
 * 
 * ## USAGE PATTERN: 
 *  <dw-text-editor iframePath="/path/to/squire.html" value="<h2>Hello World.</h2>" readonly autoHeight></dw-text-editor>
 */

class DwTextEditor extends LitElement {
  static get styles() {
    return [
      css`
        :host{
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        #toolbar{
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--toolbar-border-color, black);
        }

        :host([readonly]) #toolbar{
          display: none;
        }

        .menu-btn{
          padding: 0px;
          width: 32px;
          height: 32px;
          background: transparent;
          box-shadow: none;
          border: 1px solid transparent;
          border-radius: 4px;
          outline: none;
          margin: 4px 4px;
        }

        .menu-btn[active], .menu-btn[active]:hover{
          fill: var(--menu-btn-active-color, #c11e5c);
        }

        .menu-btn:hover{
          background-color: var(--menu-btn-hover-color, #ebebeb);
        }

        iframe{
          width: 100%;
          -webkit-flex: 1; /* Safari 6.1+ */
          -ms-flex: 1; /* IE 10 */ 
          flex: 1;
          height: calc(100% - 40px);
          border: none;
        }

        :host([readonly]) iframe{
          height: 100%;
        }

        :host([autoHeight]) {
          position: relative;
          display: grid;
        }

        :host([autoHeight]) iframe{
          height: 1.5em;
        }

      `
    ]
  }
  static get properties() {
    return {
      /**
       * Path for `iFrame`.
       */
      iframePath: {
        type: String
      },

      /**
       * HTML value of editor
       */
      value: {
        type: String,
      },

      /**
       * Hides/Shows toolbar & makes editor editable / non-editable. 
       */
      readonly: {
        type: Boolean,
        reflect: true
      },

      /**
       * Set `true` to make iFrame height as its content height
       * By default value is `false`.
       */
      autoHeight: {
        type: Boolean,
        reflect: true
      },

      /**
       * Current state of Bold menu in toolbar.
       */
      _isBold: {
        type: Boolean
      },

      /**
       * Current state of Italic menu in toolbar.
       */
      _isItalic: {
        type: Boolean
      },

      /**
       * Current state of Underline menu in toolbar.
       */
      _isUnderlined: {
        type: Boolean
      },

      /**
       * Current state of Number menu in toolbar.
       */
      _isOrderedList: {
        type: Boolean
      },

      /**
       *  Current state of Bullet menu in toolbar.
       */
      _isUnorderedList: {
        type: Boolean
      },
    };
  }

  render() {
    return html`
      <div id="toolbar">
        <button 
          class="menu-btn" 
          title="Bold" 
          ?active="${this._isBold}"
          @click="${this._updateBold}">
          ${getIcon('editor.format_bold')}
        </button>

        <button 
          class="menu-btn" 
          title="Italic" 
          ?active="${this._isItalic}"
          @click="${this._updateItalic}">
          ${getIcon('editor.format_italic')}
        </button>

        <button 
          class="menu-btn" 
          title="Underline" 
          ?active="${this._isUnderlined}"
          @click="${this._updateUnderlined}">
          ${getIcon('editor.format_underlined')}
        </button>

        <button 
          class="menu-btn" 
          title="Ordered List" 
          ?active="${this._isOrderedList}"
          @click="${this._updateOrdredList}">
          ${getIcon('editor.format_list_numbered')}
        </button>

        <button 
          class="menu-btn" 
          title="Unordered List" 
          ?active="${this._isUnorderedList}"
          @click="${this._updateUnoredredList}">
          ${getIcon('editor.format_list_bulleted')}
        </button>
      </div>

      <iframe 
        @load="${this._init}"
        src="${this.iframePath}"></iframe>  
    `;
  }

  constructor() {
    super();
    this.autoHeight = false;
    this.iframePath = '/squire.html';
  }

  updated(changedProperties) {
    if (changedProperties.has('readonly')) {
      this._updateReadOnly();
    }
  }

  /**
   * Updates `readonly` property.
   * Sets `contenteditable` based on `readonly`.
   */
  _updateReadOnly() {
    if (!this._content) {
      return;
    }

    if (!this.readonly) {
      this._content.setAttribute('contenteditable', true);
    } else {
      this._content.removeAttribute('contenteditable');
    }
  }

  /**
   * Sets the HTML value for the editor. 
   * The value supplied should not contain <body> tags or anything outside of that.
   * @param {*} html 
   */
  setValue(html) {
    if(!this._editor) {
      //Set `value` property so this value is set by default when iFrame is ready
      this.value = html;
      return;
    }

    this._editor.setHTML(html);
    this.refreshHeight();
  }

  /**
   * Returns the HTML value of the editor in its current state. 
   * This value is equivalent to the contents of the <body> tag.
   */
  getValue() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    return this.value = this._editor.getHTML();
  }

  /**
   * If `autoHeight` is `true` then reset iframe height as content height.
   */
  refreshHeight() {
    if(!this._iframe || !this._content) {
      console.warn('Iframe is not ready');
      return;
    }

    if(!this.autoHeight) {
      return;
    }

    this._content.style.overflowY = 'hidden';

    //Old height
    let _oldHeight = this._iframe.style.height;

    //Set iframe Height to content height
    let _scrollHeight = this._content.scrollHeight;
    this._iframe.style.height = _scrollHeight + 'px';

    //Fire height changed event if iFrame height is changed
    if(_oldHeight !== _scrollHeight + 'px') {
      this._dispatchHeightChange(_scrollHeight);
    }
  }

  _init() {
    if (!this.iframePath) {
      console.warn('Plese set iFrame path to `iframePath` attribute');
      return;
    }
    this._iframe = this.shadowRoot.querySelector('iframe');
    this._editor = this._iframe.contentWindow.editor;
    this._content = this._iframe.contentDocument.body;
    this._updateReadOnly();
    this.setValue(this.value);
    this._editor.focus();
    this._content.addEventListener('click', this._dispatchBodyTapEvent.bind(this));
    this._editor.addEventListener('pathChange', this._pathChanged.bind(this));
    this._editor.addEventListener('input', this._dispatchValueChange.bind(this));
  }

  /**
   * Makes selected text Bold / Unbold
   */
  _updateBold() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._isBold) {
      this._editor.removeBold();
    } else {
      this._editor.bold();
    }
  }

  /**
   * Makes selected Text Italic / Non Italic.
   */
  _updateItalic() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._isItalic) {
      this._editor.removeItalic();
    } else {
      this._editor.italic();
    }
  }

  /**
   * Makes selected text underlined / non-underlined.
   */
  _updateUnderlined() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._isUnderlined) {
      this._editor.removeUnderline();
    } else {
      this._editor.underline();
    }
  }

  /**
   * Sets or removes numbered list.
   */
  _updateOrdredList() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._isOrderedList) {
      this._editor.removeList();
    } else {
      this._editor.makeOrderedList();
    }
  }

  /**
   * Sets or removes bullet list.
   */
  _updateUnoredredList() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._isUnorderedList) {
      this._editor.removeList();
    } else {
      this._editor.makeUnorderedList();
    }
  }

  /**
   * Sets state of all toolbar menus
   * @param {*} e : path change event object.
   */
  _pathChanged(e) {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._editor.hasFormat('B')) {
      this._isBold = true;
    } else {
      this._isBold = false;
    }

    if (this._editor.hasFormat('I')) {
      this._isItalic = true;
    } else {
      this._isItalic = false;
    }

    if (this._editor.hasFormat('U')) {
      this._isUnderlined = true;
    } else {
      this._isUnderlined = false;
    }

    if (this._editor.hasFormat('OL')) {
      this._isOrderedList = true;
    } else {
      this._isOrderedList = false;
    }

    if (this._editor.hasFormat('UL')) {
      this._isUnorderedList = true;
    } else {
      this._isUnorderedList = false;
    }
  }

  /**
   * Dispatches `value-changed` event on value change
   */
  _dispatchValueChange() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: {
        value: this.getValue()
      }
    }));
  }

  /**
   * Dispatches `height-changed` event on content height changed
   */
  _dispatchHeightChange(height) {
    this.dispatchEvent(new CustomEvent('height-changed', {
      detail: {
        height
      }
    }));
  }

  /**
   * Dispatches `body-tap` event when user tap on body
   */
  _dispatchBodyTapEvent(event) {
    this.dispatchEvent(new CustomEvent('body-tap', {
      detail: {
        event
      }
    }));
  }
}

customElements.define('dw-text-editor', DwTextEditor);
