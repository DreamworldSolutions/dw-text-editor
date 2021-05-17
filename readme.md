# dw-text-editor

## Introduction
- HTML5 rich text editor

## Installation Steps
1. `npm i @dw/dw-text-editor`
2. Copy the `squire.html` file into your server root directory.

## Usage
### Import
- `import '@dw/dw-text-editor'`

### Use
- Set `iframePath` attribute  to `path/to/squire.html` if `squire.html` file isn't on root directory.
- Set `autoHeight` to avoid iframe scroll. In this case iframe has same height as its content always.
- Set `readOnly` to mark content as read only and hide toolbar action manu.
- Set `autoFocus` to set focus into iFrame body when iFrame is ready.
- Set `proxy-events` to proxy events from editor content.

- ```
  <dw-text-editor 
    iframePath="path/to/squire.html" 
    value=""
    autoHeight
    readOnly>
  </dw-text-editor>
  ```