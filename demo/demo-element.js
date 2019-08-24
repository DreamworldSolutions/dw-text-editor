import { LitElement, html, css } from 'lit-element'
import '../dw-text-editor';

class DemoElement extends LitElement {
  static get styles() {
    return [
      css`
        :host{
          display: block;
        }

        .editor-container{
          width: 100%;
          height: 250px;
          border: 1px solid black;
          position: relative;
        }
      `
    ]
  }
  render() {
    return html`
      <h2>dw-text-editor Demo:</h2>
      <h3>Edit Mode</h3>
      <div class="editor-container">
        <dw-text-editor autoFocus value="Hello world.." @value-changed="${this._valueChange}"></dw-text-editor>
      </div>

      <h3>Readonly Mode</h3>
      <div class="editor-container">
        <dw-text-editor readonly value="Hello world.."></dw-text-editor>
      </div>
    `
  }

  _valueChange(e) {
    console.log(e.detail.value);
  }


}

customElements.define('demo-element', DemoElement);