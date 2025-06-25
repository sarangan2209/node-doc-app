/**
 * Function to add line numbers and highlight selected line in a code block
 *
 * @param {HTMLElement[]} source - An array of elements with class 'prettyprint source linenums'
 * 
 * @returns {void}
 * 
 * @example
 * 
 * HTML:
 * <pre class="prettyprint source linenums">
 *      <code>
 *          // Code block with line numbers
 *      </code>
 * </pre>
 * 
 * JavaScript:
 * addLineNumbersAndHighlight();
 */
(() => {
    const source = document.getElementsByClassName('prettyprint source linenums');
    let i = 0;
    let lineNumber = 0;
    let lineId;
    let lines;
    let totalLines;
    let anchorHash;

    if (source && source[0]) {
        anchorHash = document.location.hash.substring(1);
        lines = source[0].getElementsByTagName('li');
        totalLines = lines.length;

        for (; i < totalLines; i++) {
            lineNumber++;
            lineId = `line${lineNumber}`;
            lines[i].id = lineId;
            if (lineId === anchorHash) {
                lines[i].className += ' selected';
            }
        }
    }
})();