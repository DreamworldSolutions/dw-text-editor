/**  
 * Auto grow & auto shrink height of text-editor based on it's content, there is no way to calculate content's height into text-editor.
 * So to achieve this, We have create and attached 1 dummy text-editor & set it's html content. From that dummy text-editor, 
 * We can compute it's scrollHeight & set height of actaul visible text-editor to that scrollHeight.
 */
let dummyReachTextEditor;


/**
 * @param {Element} reachTextEditor Passed original text-editor el, because we can use some style with dummy editor.
 *                                  like, width, min-height etc.
 * @returns {Element} text-editor when it's already createa and attached, otherwise create and attached new dummy text-editor's and returns it.
 */
export const getDummyReachTextEditor = (reachTextEditor) => {
  //TODO: set same width to dummy text-editor as a original text-editor.
}

/**
 * @param {*} html Passed html content, so we can set's the content to dummy text-editor.
 * @param {Element} reachTextEditor Passed original text-editor el, because we can use some style with dummy editor.
 *                                  like, width, min-height etc.
 * @returns {Number} scroll height.
 */
export const getReachTextEditorHeight = (html, reachTextEditor) => {

}