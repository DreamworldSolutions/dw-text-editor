import once from 'lodash-es/once.js';

/**
 * A Utility to identify the content height for an HTML content. It's used to compute the required
 * height for the editor when auto-height feature is enabled. 
 * 
 * ## How it works?
 * - Creates an extra TextEditor, which is rendered off-screen. (out of the screen viewable area)
 * - When content height needs to be find, that TextEditor's width is set to the desired width 
 *   and then the value (HTML) is set into it. It's height (considering scroll-height too) is the
 *   content-height.
 * - This Extra TextEditor is rendered/initialized in early stage. So, extra time isn't spent
 *   at the time of finding the content-height.
 * 
 * ## Why the text-editor being auto-resized can be used to compute the content height?
 * To find the content-height for a text-editor, algorith applied is as follows:
 * - Set it's initial height to the minimum height (1 line height).
 * - Set the content
 * - Compute the content height based on the editor's height & scrollheight.
 * 
 * If we run the same algorithm on the live editor (where user is editing too), this provides
 * false result, and user-experience issue too. This falsle result is specifically in the case
 * when user is erasing the content frequently (backspace key is kept pressed).
 */


/**
 * Initial width of the TextEditor in pixels.
 * This width is actually of no use (in practical), because each time the content-height is 
 * to be computed actual width of the TextEditor is set on this editor first.
 */
const INIT_WIDTH = 500;


/**
 * An instance of the Squire editor which is retrieved from the `iframe.contentWindow.editor`.
 */
let textEditor;

/**
 * An instance of the iframe body which is retrieved from the `iframe.contentWindow.body`. 
 */
let textContent;

/**
 * A function used to create/initialize the extra text-editor, which is used to compute the
 * content-height later.
 * 
 * It can be invoked multiple times, but actual work is done only on the first invocation
 * (when text-editor isn't initialized).
 * 
 * Usage:
 * It is invoked by the TextEditor when it's first rendered.
 * 
 * @returns {Promise} Resolved when TextEditor is initialized.
 * 
 */
export const init = once((iframePath) => {
  let resolve;
  let promise = new Promise((res) => { resolve = res });
  let iframe = document.createElement('iframe');
  iframe.addEventListener('load', () => {
    textEditor = iframe.contentWindow.editor;
    textContent = iframe.contentDocument.body;
    textContent.style.width = INIT_WIDTH + 'px';
    resolve({textEditor, textContent});
  });

  iframe.style.position = 'fixed';
  iframe.style.top = '-99999px';
  iframe.style.left = '-99999px';
  document.body.appendChild(iframe);
  iframe.src = iframePath;
  return promise;
});

/**
 * Identifies the content-height for the given HTML. 
 * 
 * @param {*} html HTML content for which content-height is to be identified.
 * @param {Boolean} readonly text-editor is read-only or not.
 *                  Because when the user has style applied based on readonly property of the iframe content, 
*                   then we can also count the proper height for it.
 * @param {Number} width Width of the TextEditor for which content-height is to be identified.
 *                  It's important configuration, because the content height is properly
 *                  computed only when the width of the editor is properly set.
 * @param {Number} height height of iframe. Default value is 150.
 *                  Because every browser has different height for iframe so, 
 *                  we can set's a iframe height, to get proper content height.
 * @returns {Number} Required content height.
 */
export const getContentHeight = (html, readonly, width, height = 24) => {
  if (!html) {
    return 0;
  }

  if (!textEditor) {
    throw new Error("textEditor isn't yet initialized. Please invoked `init()` before this.");
  }

  if (!width) {
    throw new Error("width is mandatory arguments.");
  }

  if (!readonly) {
    textContent.setAttribute('contenteditable', true);
  } else {
    textContent.removeAttribute('contenteditable');
  }

  textContent.style.width = width + 'px';
  textContent.style.height = height + 'px';
  textEditor.setHTML(html);
  return textContent.scrollHeight;
}