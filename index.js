"use strict";

const htmlMinifier = require("html-minifier-terser");

/**
 * @typedef {import('babel-types').TaggedTemplateExpression} TaggedTemplateExpression
 * @typedef {import('babel-types').TemplateLiteral} TemplateLiteral
 * @typedef {import('@babel/traverse').Visitor<TaggedTemplateExpression>} Visitor
 * @typedef {import('@babel/traverse').NodePath<TaggedTemplateExpression>} NodePath
 */

// This placeholder has a space so that, if an expressions is used
// in an attribute like `class="ab${something}cd"`, html-minifier
// doesn't remove the attribute quotes.
const placeholder = "_BABEL_HTML_TAG_";
const placeholderRx = /_babel_html_tag_/gi;

/**
 *
 * @param {string} name
 * @param {string | string[]} [option=html]
 * @returns {string[]}
 */
function getNames(name, option = ["html"]) {
  if (Array.isArray(option)) return option;
  if (typeof option === "string") return [option];
  if (option == null) return [];
  throw new TypeError(
    `Expected an array of strings in the "${name}" option, got ${typeof option}`
  );
}

/**
 *
 * @param {string} text
 * @returns {string}
 */
function escapeStaticString(text) {
  // escape single quotes (if not already escaped)
  return text.replace(/(?<!\\)'/g, "\\'").replace(/\n+/g, "\\n");
}

module.exports =
  /**
   * @param {import('@babel/core')} babel
   * @returns {{ visitor: Visitor }}
   */
  (babel) => {
    const t = babel.types;

    /**
     *
     * @param {NodePath} template
     * @param {Pick<htmlMinifier.Options, Exclude<keyof htmlMinifier.Options, ['quoteCharacter', 'sortAttributes', 'removeAttributeQuotes', 'sortClassName', 'removeTagWhitespace']>>} [options={}]
     */
    function minify(template, options = {}) {
      /** @type {{ node: TemplateLiteral }} */
      const { node } = template.get("quasi");
      const { quasis } = node;
      const cookedQuasis = quasis.map((quasi) => quasi.value.cooked);

      let minifyCSS = true;
      for (const part of cookedQuasis) {
        const openingStyles = (part.match(/<style>/gim) || []).length;
        const closingStyles = (part.match(/<\/style>/gim) || []).length;
        if (openingStyles > closingStyles) {
          minifyCSS = false;
          break;
        }
      }
      const html = cookedQuasis.join(placeholder);
      const minified = htmlMinifier.minify(html, {
        collapseWhitespace: true,
        conservativeCollapse: false,
        removeComments: true,
        removeEmptyAttributes: true,
        preserveLineBreaks: false,
        ...options,
        minifyCSS,
        /* setting below must be enforced in order to prevent replacement mistakes */
        quoteCharacter: '"',
        sortAttributes: false,
        removeAttributeQuotes: false,
        sortClassName: false,
        removeTagWhitespace: false,
      });

      const parts = minified.split(placeholderRx);
      if (parts.length > 1) {
        parts.forEach((value, i) => {
          template
            .get("quasi")
            .get("quasis")
            [i].replaceWith(
              t.templateElement(
                { cooked: value, raw: value },
                i === parts.length - 1
              )
            );
        });
        template.replaceWith(template.get("quasi"));
      } else {
        template.replaceWithSourceString(`'${escapeStaticString(minified)}'`);
      }
    }

    return {
      visitor: {
        TaggedTemplateExpression(path) {
          const tag = path.get("tag");
          const isHtmlTag = getNames("tags", this.opts.tags).some((name) =>
            tag.isIdentifier({ name })
          );
          if (isHtmlTag) {
            minify(path, this.opts);
          }
        },
      },
    };
  };
