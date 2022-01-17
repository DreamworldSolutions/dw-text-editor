import { html, css } from 'lit-element';
import { LitElement } from '@dreamworld/pwa-helpers/lit-element.js';
import '@dreamworld/dw-icon/dw-icon';
import { scrollIntoView } from '@dreamworld/web-util/scrollIntoView';
import * as contentHeightUtil from './content-height-util.js';
import { htmlTrim } from '@dreamworld/web-util/htmlTrim.js';
import isEmpty from 'lodash-es/isEmpty';
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
 *  - proxy events which is provided into `proxyEvents` property.
 * 
 * ## CSS Variables: 
 *  - `--toolbar-icon-color`
 *  - `--toolbar-bottom-border`
 *  - `--toolbar-button-width`
 *  - `--toolbar-button-height`
 *  - `--toolbar-button-border-radius` 
 *  - `--toolbar-button-margin`
 *  - `--toolbar-top`
 *  - `--toolbar-left`
 *  - `--toolbar-right` 
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
          border-bottom: var(--toolbar-bottom-border, 1px solid var(--toolbar-border-color, black));
          position: sticky;
          position: -webkit-sticky;
          position: -moz-sticky;
          position: -ms-sticky;
          position: -o-sticky;
          top: var(--toolbar-top, 0);
          left: var(--toolbar-left, 0);
          right: var(--toolbar-right, 0);
          background: var(--toolbar-background, #FFF);
          min-height: var(--toolbar-min-height, 42px);
          z-index: 1;
          padding: var(--dw-text-editor-toolbar-padding, 0px);
          margin: var(--dw-text-editor-toolbar-margin, 0px);
        }

        :host([readonly]) #toolbar{
          display: none;
        }

        .menu-btn{
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0px;
          width: var(--toolbar-button-width, 32px);
          height: var(--toolbar-button-height, 32px);
          background: transparent;
          box-shadow: none;
          border: 1px solid transparent;
          border-radius: var(--toolbar-button-border-radius, 4px);
          outline: none;
          margin: var(--toolbar-button-margin, 4px);
          cursor: pointer;
        }

        .menu-btn:hover, .menu-btn[active], .menu-btn[active]:hover{
          background-color: var(--menu-btn-hover-color, #ebebeb);
        }

        :host(:not([autoheight])) .iframe-container {
          -ms-flex: 1 1 0.000000001px;
          -webkit-flex: 1;
          flex: 1;
          -webkit-flex-basis: 0.000000001px;
          flex-basis: 0.000000001px;
          overflow: auto;
          position: relative;
        }

        .iframe-container {
          padding: var(--dw-text-editor-iframe-container-padding, 0px);
          margin: var(--dw-text-editor-iframe-container-margin, 0px);
        }

        :host([readonly]) iframe {
          display: block;
        }

        iframe{
          width: 100%;
          height: 98%; /* Actually 100% should be worked but doesn't works. Need to find cause. */
          border: none;
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
       * Input property. 
       * Editor's minimum height. Default is 150;
       */
      minHeight: { type: Number },

      /**
       * Set `true` to set auto focus into iFrame body when iFrame is ready with its initial content
       */
      autoFocus: {
        type: Boolean
      },

      /**
       * Input property.
       * Passed scroll element for show content into view.
       * Default scrolling element is iframe content.
       */
      scrollingElement: { type: Object },

      /**
       * Placeholder of text-editor.
       */
      placeholder: { type: String },

      /**
       * Input property.
       * List of comma seperated events to be proxied. e.g "click, focusin, focusout"
       */
      proxyEvents: { type: String, attribute: 'proxy-events' },

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
    this.minHeight = 150; // Minumun height for edit mode. Default is 150px;

    /**
     * content height util's is ready or not.
     */
    this._contentHeightUtilReady;
    this.__dispatchProxyEvent = this.__dispatchProxyEvent.bind(this);
  }

  updated(changedProperties) {
    super.updated && super.updated(changedProperties);
    if(changedProperties.has('placeholder') || (changedProperties.has('value') && this.value !== this.getValue())) {
      this.__showHidePlaceholder();
    }

    if (changedProperties.has('readonly')) {
      this._updateReadOnly();
      this.__showHidePlaceholder();
    }

    if (changedProperties.has('value') && this.value !== this.getValue()) {
      this.setValue(this.value);
    }

    if (changedProperties.has('proxyEvents')) {
      if (this.proxyEvents && changedProperties.get('proxyEvents')) {
        this.__unlistenProxyEvents();
        this.__listenProxyEvents();
        return;
      }

      if (!this.proxyEvents && changedProperties.get('proxyEvents')) {
        this.__unlistenProxyEvents();
        return;
      }
    }
  }

  /**
   * Adds listeners for proxy events.
   */
  __listenProxyEvents() {
    if (!this.proxyEvents || typeof this.proxyEvents !== 'string' || !this.content) {
      return;
    }
    let proxyEvents = this.proxyEvents;
    proxyEvents = proxyEvents.split(",").map(item => item.trim());
    for (let event of proxyEvents) {
      this.content.addEventListener(event, this.__dispatchProxyEvent);
    }
  }

  /**
   * Removes listeners for proxy events.
   */
  __unlistenProxyEvents() {
    if (!this.proxyEvents || typeof this.proxyEvents !== 'string' || !this.content) {
      return;
    }

    let proxyEvents = this.proxyEvents;
    proxyEvents = proxyEvents.split(",").map(item => item.trim());

    if (isEmpty(proxyEvents)) {
      return;
    }

    for (let event of proxyEvents) {
      this.content.removeEventListener(event, this.__dispatchProxyEvent);
    }
  }

  /**
   * Dispatches proxy events.
   * @param {String} eventName Event Name
   * @param {Object} event Event
   */
   __dispatchProxyEvent(e) {
     const eventName = e.type;
     // See reference here: https://stackoverflow.com/questions/11974262/how-to-clone-or-re-dispatch-dom-events
     const proxyEvent = new e.constructor(eventName, e);
     proxyEvent.details = { event: e };
     this.dispatchEvent(proxyEvent);
    if (eventName === 'click') {
      this._scrollActiveElementIntoView();
    }
  }

  /**
    * Called every time the element is removed from the DOM. Useful for 
    * running clean up code (removing event listeners, etc.).
    */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.__unlistenProxyEvents();
    this._editor && this._editor.removeEventListener('pathChange', this._pathChanged);
    this._editor && this._editor.removeEventListener('input', this._dispatchValueChange);
  }

  /**
   * Updates `readonly` property.
   * Sets `contenteditable` based on `readonly`.
   */
  _updateReadOnly() {
    if (!this.content) {
      return;
    }

    if (!this.readonly) {
      this.content.setAttribute('contenteditable', true);
    } else {
      this.content.removeAttribute('contenteditable');
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
      this.value = html || '';
      return;
    }

    this._editor.setHTML(html || '');
    this.refreshHeight();
    this.__showHidePlaceholder();
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
    if(!this._iframe || !this.content) {
      console.warn('Iframe is not ready');
      return;
    }

    if(!this.autoHeight) {
      return;
    }

    //Old height
    const oldHeight = this._iframe.style.height;
    const minHeight = this.readonly ? 0 : this.minHeight;

    const contentHeight = this.__getContentHeight();
    const scrollHeight = Math.max(contentHeight, minHeight);

    //Sets iframe Height to content height & fires height changed event if iFrame height is changed
    if (oldHeight != `${scrollHeight}px`) {
      if (!this.readonly) {
        this.content.style.height = `${scrollHeight}px`;
      }
      this._iframe.style.height =  `${scrollHeight}px`;
      const toolbarHeight = this.readonly ? 0 : 41; // 41px is toolbar height
      this.style.height = `${scrollHeight + toolbarHeight}px`;
      this._dispatchHeightChange(scrollHeight);
    }
  }

  /**
   * @returns {Number} iframe content height.
   * @private
   */
  __getContentHeight() {
    let contentHeight =  this.content.scrollHeight;

    //If content-height util is ready and iframe contetn has a width then
    //Why are we checking the width of the iframe content?
    //  - When we set the content to the iframe then the initial width of the iframe is 0.
    //  - At that time, the display css property of the content of the iframe is also block.
    //  - After that we get the proper width of the iframe, so we are skip first time.
    if(this._contentHeightUtilReady && this.content.offsetWidth) {
      contentHeight = contentHeightUtil.getContentHeight(this.getValue(), this.readonly, this.content.offsetWidth);
    }

    return contentHeight;
  }

  /**
   * When text-editor value is empty then shows a placeholder, otherwise hide a placeholder.
   * @private
   */
  __showHidePlaceholder() {
    if(!this.content) {
      return;
    }
    
    if(!this.placeholder || this.readonly) {
      this.content.removeAttribute('show-placeholder');
      this.content.removeAttribute('placeholder');
      return;
    }
    
    const oldPlaceholderText = this.content.getAttribute('placeholder');
    //If old and new text is not same then only change a placeholder value.
    if(oldPlaceholderText !== this.placeholder) {
      this.content.setAttribute('placeholder', this.placeholder);
    }
    
    const alredyShowPlaceholder = this.content.getAttribute('show-placeholder') === 'true';
    let value = this.getValue();
    value = value.includes('</li>') ? value : htmlTrim(value); // When list exists, do not trim value.
    if((alredyShowPlaceholder && !value) || (!alredyShowPlaceholder && value)) {
      return;
    }
    this.content.setAttribute('show-placeholder', !value ? 'true': 'false');
  }

  /**
   * @returns {String} user selected value.
   * @public
   */
  getSelectedText() {
    let doc = this.content.ownerDocument || this.content.document;
    let win = doc.defaultView || doc.parentWindow;
    return win && win.getSelection && win.getSelection().toString() || '';
  }

  /**
   * Call this to set focus in the richtext-editor.
   * @public
   */
  focus() {
    this._editor && this._editor.focus();
  }

  _init() {
    if (!this.iframePath) {
      console.warn('Plese set iFrame path to `iframePath` attribute');
      return;
    }
    this._iframe = this.shadowRoot.querySelector('iframe');
    this._editor = this._iframe.contentWindow.editor;
    this._editor.linkRegExp = null;
    this.content = this._iframe.contentDocument.body;
    this.content.style.overflow = 'hidden'; 
    this.scrollingElement = this.scrollingElement || this.content;
    this._updateReadOnly();
    this.setValue(this.value);

    //Set focus if `autoFocus` is true
    if(this.autoFocus) {
      this.focus();
    }
    
    //Initialize dummy text editor for get content height;
    contentHeightUtil.init(this.iframePath).then(() => {
      this._contentHeightUtilReady = true;
    });

    this.__unlistenProxyEvents();
    this.__listenProxyEvents();
    this._pathChanged = this._pathChanged.bind(this);
    this._dispatchValueChange = this._dispatchValueChange.bind(this);

    this._editor.addEventListener('pathChange', this._pathChanged);
    this._editor.addEventListener('input', this._dispatchValueChange);
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
    this._scrollActiveElementIntoView();
    if (this.autoHeight) {
      this.refreshHeight();
    }
    this.__showHidePlaceholder();
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
   * Scroll current focused element into view.
   */
  _scrollActiveElementIntoView() {
    const doc = this.content.ownerDocument || this.content.document;
    const win = doc.defaultView || doc.parentWindow;
    const focusNode = win.getSelection().focusNode;
    if (focusNode && focusNode.nodeType == 1 && focusNode !== this.content) {
      scrollIntoView(this.scrollingElement, focusNode);
    }
  }
}

customElements.define('dw-text-editor', DwTextEditor);
