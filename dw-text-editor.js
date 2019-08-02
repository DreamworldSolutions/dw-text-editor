import { LitElement, html, css } from 'lit-element';

/**
 * It is a HTML5 rich text editor.
 * 
 * TOOLBAR : 
 *    Bold : 
 *    Italic :
 *    Underline :
 *    Number :
 *    Bullet : 
 *    ALIGN : (left, center, right)
 *    FONT_SIZE : (h1, h2, h3, h4, h5, p)
 *    SAVE : 
 *    CANCEL : 
 * 
 * EDITOR: 
 *    Mode: view | edit
 * 
 * USAGE PATTERN: 
 *  <dw-text-editor value="<h2>Hello World.</h2>" readonly></dw-text-editor>
 * 
 */
class DwTextEdiror extends LitElement {
  static get styles() {
    return [
      css`
        :host{
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        #toolbar{
          height: 48px;
        }

        iframe{
          width: 100%;
          height: calc(100% - 48px);
          border: none;
          border-top: 1px solid black;
        }
      `
    ]
  }
  static get properties() {
    return {
      
      /**
       * HTML value of editor
       */
      value: {
        type: String,
        notify: true
      },
      
      /**
       * 
       */
      readonly: {
        type: Boolean
      },

      /**
       * Squire editor instance
       */
      _editor: { type: Object },

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
      _isUnderline: {
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
      
      /**
       * Text alighnment of current line.
       */
      _textAlignment: {
        type: String
      },

      /**
       * Font size of selected text.
       */
      _fontSize: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.value = '';
  }

  render() {
    return html`
      <div id="toolbar"></div>
      <iframe 
        @load="${this._init}"
        src="../Squire/document.html"></iframe>  
    `;
  }

  updated() {
    
  }

  _init() {
    this._editor = this.shadowRoot.querySelector('iframe').contentWindow.editor;
    this._editor.focus();
    this._setHTML(this.value);
    this._editor.addEventListener('pathChange', this._pathChanged)
  }

  /**
   * Sets the HTML value for the editor. 
   * The value supplied should not contain <body> tags or anything outside of that.
   * @param {*} html 
   */
  _setHTML(html) {
    this._editor._setHTML(html);
  }

  /**
   * Returns the HTML value of the editor in its current state. 
   * This value is equivalent to the contents of the <body> tag and does not include any surrounding boilerplate.
   */
  _getHTML() {

  }


  /**
   * Saves current value into Database.
   * sets `readonly` true
   */
  _save() {

  }

  /**
   * sets `readonly` true.
   */
  _cancel() {

  }


  /**
   * Makes any non-bold currently selected text bold
   */
  _bold() {
    
  }

  /**
   * Removes any bold formatting from the selected text.
   */
  _removeBold() {

  }

  /**
   * Removes any italic formatting from the selected text.
   */
  _italic() {

  }

  /**
   * Removes any italic formatting from the selected text.
   */
  _removeItalic() {

  }

  /**
   * Makes any non-underlined currently selected text underlined
   */
  _underline() {

  }

  /**
   * Removes any underline formatting from the selected text.
   */
  _removeUnderline() {

  }

  /**
   * Changes all at-least-partially selected blocks to be part of an ordered list.
   */
  _makeOrderedList() {

  }

  /**
   * Changes all at-least-partially selected blocks to be part of an unordered list.
   */
  _makeUnorderedList() {

  }

  /**
   * Changes any at-least-partially selected blocks which are part of a list to no longer be part of a list.
   */
  _removeList() {

  }

 /**
  * Sets the text alignment
  * @param {*} position ('left' | 'right' | 'center')
  */
  _setTextAlignment(position) {

  }

  /**
   * Sets the font size for text.
   * @param {*} size 
   */
  _setFontSize(size) {

  }

  /**
   * Sets state of all toolbar menus
   * @param {*} e : path change event object.
   */
  _pathChanged(e) {
    
  }
}

customElements.define('dw-text-editor', DwTextEdiror);
