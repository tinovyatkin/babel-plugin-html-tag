'use strict';

/* global html */

const b = 'test';
const a = html`<p class="zoom center justify">
    This is paragraph with ${b} subsitutions at several lines: ${1 + 2}
</p>`;

const z = html`<table class="center">
    <tr class='left'>
        <td>HTML without substitutions</td>
    </tr>
</table>`;

const e = html`<style>
    [data-clipboard-text] {
        cursor: copy !important;
        transition: all .5s cubic-bezier(.19, 1, .22, 1);
    }

    [data-clipboard-text]:hover {
        background-color: green !important;
        color: white !important;
    }
</style>`;
