import { LitElement, html, css } from 'lit-element';
import { getIcon } from 'icons';

/**
 * It is a HTML5 rich text editor.
 * 
 * TOOLBAR : 
 *    Bold : 
 *    Italic :
 *    Underline :
 *    Number :
 *    Bullet : 
 * 
 * USAGE PATTERN: 
 *  <dw-text-editor iframePath="/path/to/squire.html" value="<h2>Hello World.</h2>" readonly></dw-text-editor>
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
          fill: #c11e5c;
        }

        .menu-btn:hover{
          background-color: #ebebeb;
        }

        iframe{
          width: 100%;
          -webkit-flex: 1; /* Safari 6.1+ */
          -ms-flex: 1; /* IE 10 */ 
          flex: 1;
          height: calc(100% - 40px);
          border: none;
          border-top: 1px solid black;
        }

        :host([readonly]) iframe{
          height: 100%;
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
    this._editor.setHTML(html);
  }

  /**
   * Returns the HTML value of the editor in its current state. 
   * This value is equivalent to the contents of the <body> tag.
   */
  getValue() {
    return this.value = this._editor.getHTML();
  }

  _init() {
    if (!this.iframePath) {
      console.warn('Plese set iFrame path to `iframePath` attribute');
      return;
    }
    const iframe = this.shadowRoot.querySelector('iframe');
    this._editor = iframe.contentWindow.editor;
    this._content = iframe.contentDocument.body;
    this._updateReadOnly();
    this.setValue(this.value);
    this._editor.addEventListener('pathChange', this._pathChanged.bind(this));
    this._editor.addEventListener('input', this._dispatchValueChange.bind(this));
  }

  /**
   * Makes selected text Bold / Unbold
   */
  _updateBold() {
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
}

customElements.define('dw-text-editor', DwTextEditor);
