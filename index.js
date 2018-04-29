'use strict';

const htmlMinifier = require('html-minifier');

// This placeholder has a space so that, if an expressions is used
// in an attribute like `class="ab${something}cd"`, html-minifier
// doesn't remove the attribute quotes.
const placeholder = '__BABEL HTML MINIFIER PLACEHOLDER$$__';
const placeholderRx = /_{2}BABEL HTML MINIFIER PLACEHOLDER\${2}_{2}/g;

function getNames(name, option = ['html']) {
  if (Array.isArray(option)) return option;
  if (typeof option === 'string') return [option];
  if (option == null) return [];
  throw new TypeError(
    `Expected an array of strings in the "${name}" option, got ${typeof option}`,
  );
}

module.exports = babel => {
  const t = babel.types;

  function escapeSingleQuote(text) {
    return text.replace(/[^\\]'/g, "\\'");
  }

  function minify(
    template,
    options = {
      sortAttributes: true,
      sortClassName: true,
      collapseWhitespace: true,
      conservativeCollapse: false,
      removeComments: true,
      removeEmptyAttributes: true,
      removeTagWhitespace: true,
    },
  ) {
    const { node } = template.get('quasi');
    const quasis = node.quasis.map(quasi => quasi.value.cooked);

    const html = quasis.join(placeholder);
    const minified = htmlMinifier.minify(html, {
      ...options,
      quoteCharacter: '"',
    });

    const parts = minified.split(placeholderRx);
    if (parts.length > 1) {
      parts.forEach((value, i) => {
        template
          .get('quasi')
          .get('quasis')
          [i].replaceWith(
            t.templateElement(
              { cooked: value, raw: value },
              i === parts.length - 1,
            ),
          );
      });
      template.replaceWith(template.get('quasi'));
    } else template.replaceWithSourceString(`'${escapeSingleQuote(minified)}'`);
  }

  return {
    visitor: {
      Program: {
        enter() {
          this.bindings = new Set();
        },
      },

      TaggedTemplateExpression(path) {
        const tag = path.get('tag');
        const isHtmlTag =
          getNames('tags', this.opts.tags).some(name =>
            tag.isIdentifier({ name }),
          ) ||
          (tag.isIdentifier() &&
            this.bindings.has(path.scope.getBinding(tag.node.name)));
        if (isHtmlTag) {
          minify(path, this.opts);
        }
      },
    },
  };
};
