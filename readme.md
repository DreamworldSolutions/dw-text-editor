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
- ```
  <dw-text-editor 
    iframePath="path/to/squire.html" 
    value="" readonly>
  </dw-text-editor>
  ```