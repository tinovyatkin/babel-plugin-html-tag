"use strict";

/* global html */

const b = "test";
const a = html`<p class="zoom center justify">
  This is paragraph with ${b} subsitutions at several lines: ${1 + 2}
</p>`;

const z = html`<table class="center">
  <tr class="left">
    <td>HTML without substitutions</td>
  </tr>
</table>`;

const e = html`<style>
  [data-clipboard-text] {
    cursor: copy !important;
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }

  [data-clipboard-text]:hover {
    background-color: green !important;
    color: white !important;
  }
</style>`;

const n = html`<div ng-class="{'my-class': myVar}"></div>`;

const classNames = {};
const t = {
  item(data) {
    return strToEl(
      html`
        <div
          class="${String(classNames.item)} ${String(
            data.highlighted
              ? classNames.highlightedState
              : classNames.itemSelectable
          )}"
          data-item
          data-id="${String(data.id)}"
          data-value="${String(data.value)}"
          ${String(data.active ? 'aria-selected="true"' : "")}
        >
          <span>
            ${String(data.label)} </span
          >&nbsp;&nbsp;(
          <strong class="mono" style="font-size: 110%"
            >${String(data.value)} </strong
          >)
        </div>
      `
    );
  },
  choice(data) {
    return strToEl(
      html`
        <div
          class="nobr ${String(classNames.item)} ${String(
            classNames.itemChoice
          )} ${classNames.itemSelectable}"
          data-choice
          data-choice-selectable
          data-id="${String(data.id)}"
          data-value="${String(data.value)}"
          role="option"
        >
          <span>${String(data.label)}</span>
          <strong class="mono">${String(data.value)} </strong>
        </div>
      `
    );
  },
  option(data) {
    return strToEl(
      html`
        <option
          value="${data.value}"
          selected
          data-lat="${data.customProperties.pos[1]}"
          data-lng="${data.customProperties.pos[0]}"
          data-place-id="${data.customProperties.placeId}"
          >${data.label}
        </option>
      `
    );
  },
};

const st = html`<style>
    @media only screen and (min-width: 768px) {
      ${fieldsets
      .map(
        (className) =>
          `fieldset.${className} { background-image: url(${basePath}${className}-1400px.${ext}); }`
      )
      .join("\n")}
    }
  </style>
  <style>
    .byaka {
      background: ${eee};
    }
  </style>`;
