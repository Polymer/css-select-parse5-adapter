# css-select-parse5-adapter

An adapter for `css-select` that allows you to query `parse5` generated ASTs.

## Installation

You'll need `css-select`, `parse5` for this adapter to be of any use, so install all three:

```sh
npm install \
    css-select \
    css-select-parse5-adapter \
    parse5
```

## Usage

```js
const {parse,serialize} = require('parse5');
const {adapter} = require('css-select-parse5-adapter'); 
const cssSelect = require('css-select');
const ast = parse(`
  <div id="greeting">
    Hello <span class="name">Alice</span>
  </div>
`);
const nodes = cssSelect('#greeting .name', ast, {adapter});
assert(nodes.length === 1);
assert(serialize(nodes[0]) === 'Alice');
```

## Options

The `adapter` export from the package is an instance of an `Adapter` class which is configured to use the `defaultTreeAdapter` for `parse5`.  You may have a `parse5` generated tree which used a different adapter, for example [`parse5-htmlparser2-tree-adapter`](https://www.npmjs.com/package/parse5-htmlparser2-tree-adapter).  Below is an example of using this adapter:

```js
const h2adapter = require('parse5-htmlparser2-tree-adapter');
const {Adapter} = require('css-select-parse5-adapter');
const cssSelect = require('css-select');
const adapter = new Adapter(h2adapter);
const nodes = cssSelect('#greeting .name', ast, {adapter});
```

