# css-select-parse5-adapter

An adapter for `css-select` that allows you to query `parse5` generated ASTs.

## Installation

You'll need `css-select` and `parse5` for this adapter to be of any use, so install all three packages:

```sh
npm install \
    css-select \
    css-select-parse5-adapter \
    parse5
```

## Usage

```js
const {parse,serialize} = require('parse5');
const {parse5Adapter} = require('css-select-parse5-adapter'); 
const cssSelect = require('css-select');
const ast = parse(`
  <div id="greeting">
    Hello <span class="name">Alice</span>
  </div>
`);
const nodes = cssSelect('#greeting .name', ast, {adapter: parse5adapter});
assert(nodes.length === 1);
assert(serialize(nodes[0]) === 'Alice');
```

## Options

The `adapter` export from the package is an instance of an `Adapter` class which is configured to use the `defaultTreeAdapter` for `parse5`.  If you have a `parse5` generated tree which used a different adapter, you can create a new instance of the `Parse5Adapter` class using that `parse5` tree adapter as the constructor argument.  At present, there appears to be only one other tree adapter for `parse5` which is the [`parse5-htmlparser2-tree-adapter`](https://www.npmjs.com/package/parse5-htmlparser2-tree-adapter), but this tree format is actually the default tree type for `css-select` package, so it would probably be a silly thing to use `css-select-parse5-adapter` with it.  If you did, it would look like the following (keeping example here in the event another parse5 tree adapter shows up on the scene for some reason):

```js
const h2adapter = require('parse5-htmlparser2-tree-adapter');
const {Parse5Adapter} = require('css-select-parse5-adapter');
const cssSelect = require('css-select');
const adapter = new Parse5Adapter(h2adapter);
const nodes = cssSelect('#greeting .name', ast, {adapter});
```
