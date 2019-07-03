/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import cssSelect from 'css-select';
import {parse, serialize} from 'parse5';
import test from 'tape';

import {parse5Adapter} from '../css-select-parse5-adapter';

const HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>I am document</title>
  </head>
  <body>
    <h1>I am a <span data-something="something">header</span></h1>
    <p>Look at my <span class="zomg">first paragraph</span>
    <p>I am a <span class="omg">second paragraph</span>
  </body>
</html>
`;

const AST = parse(HTML, {sourceCodeLocationInfo: true});

test('Lets try some selectors', (t) => {
  t.plan(5);
  t.deepEqual(
      (cssSelect('span', AST, {adapter: parse5Adapter}))
          .map((elem) => serialize(elem)),
      ['header', 'first paragraph', 'second paragraph'],
      'simple tag selector');
  t.deepEqual(
      (cssSelect('[data-something*="thing"]', AST, {adapter: parse5Adapter}))
          .map((elem) => serialize(elem)),
      ['header'],
      'attribute selector *=');
  t.deepEqual(
      (cssSelect('.zomg', AST, {adapter: parse5Adapter}))
          .map((elem) => serialize(elem)),
      ['first paragraph'],
      'class selector');
  t.deepEqual(
      (cssSelect('p span', AST, {adapter: parse5Adapter}))
          .map((elem) => serialize(elem)),
      ['first paragraph', 'second paragraph'],
      'simple descendant combinator selectors');
  t.deepEqual(
      (cssSelect('[class~=omg]', AST, {adapter: parse5Adapter}))
          .map((elem) => serialize(elem)),
      ['second paragraph'],
      'attribute selector for class contains ~=');
});
