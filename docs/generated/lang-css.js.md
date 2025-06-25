/**
 * This is a JavaScript documentation for a code snippet that registers language handlers for CSS.
 * It defines the lexer patterns for CSS syntax highlighting.
 */

/**
 * Function PR.registerLangHandler
 * Purpose: Registers a language handler for syntax highlighting.
 * Parameters:
 *   - lexer: The lexer object containing the patterns for syntax highlighting.
 * Return values: None
 * Usage example: PR.registerLangHandler(PR.createSimpleLexer([["pln",...],["str",...]]),["css"]);
 */

/**
 * Function PR.createSimpleLexer
 * Purpose: Creates a simple lexer object for syntax highlighting.
 * Parameters:
 *   - patterns: Array of lexical patterns for syntax highlighting.
 * Return values: A lexer object for the specified language.
 * Usage example: PR.createSimpleLexer([["kwd", /^(?:url|rgb|!important|@import|@page|@media|@charset|inherit)(?=[^\w-]|$)/i, null]])
 */

/**
 * Function PR.registerLangHandler
 * Purpose: Registers a language handler for syntax highlighting.
 * Parameters:
 *   - lexer: The lexer object containing the patterns for syntax highlighting.
 * Return values: None
 * Usage example: PR.registerLangHandler(PR.createSimpleLexer([["kwd",...]]),["css-kw"]);
 */