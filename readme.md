# dw-text-editor

## Introduction
- HTML5 rich text editor

## Installation Steps
1. `npm i @dw/dw-text-editor`
2. Copy the contents of the `Squire/` directory onto your server.

## Usage
### Import
- `import '@dw/dw-text-editor'`

### Use
- Set `iFramePath` attribute  to `path/to/squire.html` (which copied in Installation Steps)
- ```
  <dw-text-editor 
    iFramePath="path/to/squire.html" 
    value="" readonly>
  </dw-text-editor>
  ```