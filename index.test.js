"use strict";

const babel = require("@babel/core");
const path = require("path");
const { readFileSync } = require("fs");

const plugin = require("./index");

function transform(code) {
  return babel.transform(code, {
    plugins: [plugin]
  }).code;
}

describe("babel-plugin-html-tag", () => {
  test("returns tagged template", () => {
    const res = transform("html`<p>\n${ textToTest }\n</p >`");
    console.log(res);
    expect(res).toMatchSnapshot();
  });

  test("returns static string when possible", () => {
    const res = transform("html`<p class=\"center\">AAA bbb, 'fff'</p>`");
    console.log(res);
    expect(res).toMatchSnapshot();
  });

  test("fixture test", () => {
    const code = readFileSync(
      path.resolve(__dirname, "./__fixtures__/a.js"),
      "utf8"
    );
    expect(transform(code)).toMatchSnapshot();
  });

  test("style tag with generated content", () => {
    const res = transform(`html\`
    <style>
      @media only screen and (min-width: 768px) {
        \${fieldsets
          .map(
            className =>
              \`fieldset.\${className} { background-image: url(\${basePath}\${className}-1400px.\${ext}); }\`,
          )
          .join(\'\\n\')}
      }
    </style>\`
    `);
    expect(res).toMatchSnapshot();
  });
});
