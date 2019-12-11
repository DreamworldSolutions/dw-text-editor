import { LitElement, html, css } from 'lit-element';
import '@dreamworld/dw-icon/dw-icon';

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
 *  - `height-changed`: Fired when `autoHeight` is true and rich content height is changed.
 *      - By defalult it opens link in browser tab when user tap on link. If integrator wants to do something new then prevent this event and do work as you want.
 *  - `body-tap`: Fired when user tap on iFrame body
 * 
 * ## CSS Variables: 
 *  - --toolbar-icon-color
 * 
 * ## Future work:
 *  - Make action buttons as disabled until iFrame editor is not ready.
 * 
 * ## USAGE PATTERN: 
 *  <dw-text-editor iframePath="/path/to/squire.html" value="<h2>Hello World.</h2>" readonly autoHeight autoFocus></dw-text-editor>
 */

class DwTextEditor extends LitElement {
  static get styles() {
    return [
      css`
        :host{
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: column;
          -webkit-flex-direction: column;
          flex-direction: column;
          --dw-icon-color: var(--toolbar-icon-color, rgba(0, 0, 0, 0.54));
        }

        #toolbar{
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          -ms-flex-align: center;
          -webkit-align-items: center;
          align-items: center;
          -ms-flex-wrap: wrap;
          -webkit-flex-wrap: wrap;
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
          cursor: pointer;
        }

        .menu-btn:hover, .menu-btn[active], .menu-btn[active]:hover{
          background-color: var(--menu-btn-hover-color, #ebebeb);
        }

        .iframe-container{
          -ms-flex: 1 1 0.000000001px;
          -webkit-flex: 1;
          flex: 1;
          -webkit-flex-basis: 0.000000001px;
          flex-basis: 0.000000001px;
          overflow: auto;
          position: relative;
        }

        iframe{
          width: 100%;
          height: 98%; /* Actually 100% should be worked but doesn't works. Need to find cause. */
          border: none;
        }

        :host([autoHeight]) {
          position: relative;
          display:-ms-grid;
          display:grid;
        }

        :host([autoHeight]) iframe{
          height: 1.5em;
        }

        @media(max-width: 460px){
          .menu-btn, .menu-btn:hover{
            background-color: transparent;
          }

          .menu-btn[active], .menu-btn[active]:hover{
            background-color: var(--menu-btn-hover-color, #ebebeb);
          }
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
       * Input property.
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
       * Set `true` to set auto focus into iFrame body when iFrame is ready with its initial content
       */
      autoFocus: {
        type: Boolean
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
       * Current state of Strikethrough menu in toolbar.
       */
      _isStrikethrough: {
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
          <dw-icon name="format_bold"></dw-icon>
        </button>

        <button 
          class="menu-btn" 
          title="Italic" 
          ?active="${this._isItalic}"
          @click="${this._updateItalic}">
          <dw-icon name="format_italic"></dw-icon>
        </button>

        <button 
          class="menu-btn" 
          title="Underline" 
          ?active="${this._isUnderlined}"
          @click="${this._updateUnderlined}">
          <dw-icon name="format_underlined"></dw-icon>
        </button>

        <button 
          class="menu-btn" 
          title="Strikethrough" 
          ?active="${this._isStrikethrough}"
          @click="${this._updateStrikethrough}">
          <dw-icon name="format_strikethrough"></dw-icon>
        </button>

        <button 
          class="menu-btn" 
          title="Ordered List" 
          ?active="${this._isOrderedList}"
          @click="${this._updateOrdredList}">
          <dw-icon name="format_list_numbered"></dw-icon>
        </button>

        <button 
          class="menu-btn" 
          title="Unordered List" 
          ?active="${this._isUnorderedList}"
          @click="${this._updateUnoredredList}">
          <dw-icon name="format_list_bulleted"></dw-icon>
        </button>
      </div>

      <div class="iframe-container">
        <iframe 
          @load="${this._init}"
          src="${this.iframePath}"></iframe> 
      </div>
    `;
  }

  constructor() {
    super();
    this.autoHeight = false;
    this.autoFocus = false;
    this.iframePath = '/squire.html';
  }

  updated(changedProperties) {
    if (changedProperties.has('readonly')) {
      this._updateReadOnly();
    }

    if (changedProperties.has('value') && this.value !== this.getValue()) {
      this.setValue(this.value);
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

    return this._editor.getHTML();
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

    //Set focus if `autoFocus` is true
    if(this.autoFocus) {
      this._editor.focus();
    }

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
   * Updates `strikethrough` status of selected text.
   */
  _updateStrikethrough() {
    if(!this._editor) {
      console.warn('Editor is not ready.');
      return;
    }

    if (this._isStrikethrough) {
      this._editor.removeStrikethrough();
    } else {
      this._editor.strikethrough();
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

    if (this._editor.hasFormat('S')) {
      this._isStrikethrough = true;
    } else {
      this._isStrikethrough = false;
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
