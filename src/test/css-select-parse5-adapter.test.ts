import cssSelect from 'css-select';
import {parse, serialize} from 'parse5';
import test from 'tape';

import {adapter} from '../css-select-parse5-adapter';

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
      (cssSelect('span', AST, {adapter})).map((elem) => serialize(elem)),
      ['header', 'first paragraph', 'second paragraph'],
      'simple tag selector');
  t.deepEqual(
      (cssSelect('[data-something*="thing"]', AST, {adapter}))
          .map((elem) => serialize(elem)),
      ['header'],
      'attribute selector *=');
  t.deepEqual(
      (cssSelect('.zomg', AST, {adapter})).map((elem) => serialize(elem)),
      ['first paragraph'],
      'class selector');
  t.deepEqual(
      (cssSelect('p span', AST, {adapter})).map((elem) => serialize(elem)),
      ['first paragraph', 'second paragraph'],
      'simple descendant combinator selectors');
  t.deepEqual(
      (cssSelect('[class~=omg]', AST, {adapter}))
          .map((elem) => serialize(elem)),
      ['second paragraph'],
      'attribute selector for class contains ~=');
});
