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

import {Adapter as CSSSelectAdapter} from 'css-select';
import {Attribute, Element, Node, TreeAdapter} from 'parse5';

const defaultTreeAdapter = require('parse5/lib/tree-adapters/default');

export type Predicate = (node: Node) => boolean;

export class Parse5Adapter implements CSSSelectAdapter<Node, Element> {
  treeAdapter: TreeAdapter;
  constructor(treeAdapter: TreeAdapter) {
    this.treeAdapter = treeAdapter;
  }
  isTag(node: Node): node is Element {
    return this.treeAdapter.isElementNode(node);
  }
  existsOne(test: Predicate, elems: Element[]): boolean {
    return elems.some(test);
  }
  getAttributeValue(elem: Element, name: string): string {
    if (!this.isTag(elem)) {
      return '';
    }
    const attrs = this.treeAdapter.getAttrList(elem);
    for (const attr of attrs) {
      if (attr.name === name) {
        return attr.value;
      }
    }
    return '';
  }
  getChildren(node: Node): Node[] {
    const children = this.treeAdapter.getChildNodes(node);
    return children && children.length > 0 ? [...children] : [];
  }
  getName(elem: Element): string {
    return this.treeAdapter.getTagName(elem);
  }
  getParent(node: Node): Node {
    return this.treeAdapter.getParentNode(node);
  }
  getSiblings(node: Node): Node[] {
    return this.getChildren(this.getParent(node));
  }
  getText(node: Node): string {
    return this.treeAdapter.isTextNode(node) ?
        this.treeAdapter.getTextNodeContent(node) :
        this.getChildren(node).map((node: Node) => this.getText(node)).join('');
  }
  hasAttrib(elem: Element, name: string): boolean {
    return this.isTag(elem) &&
        this.treeAdapter.getAttrList(elem).some(
            (attr: Attribute) => attr.name === name);
  }
  removeSubsets(nodes: Node[]): Node[] {
    const filtered: Set<Node> = new Set(nodes);
    for (const node of [...filtered]) {
      if (this.findAncestor((ancestor: Node) => filtered.has(ancestor), node)) {
        filtered.delete(node);
        continue;
      }
    }
    return [...filtered];
  }
  findAncestor(test: Predicate, node: Node): Node|undefined {
    do {
      node = this.getParent(node);
      if (node) {
        if (test(node)) {
          return node;
        }
      }
    } while (node);
    return undefined;
  }
  findAll(test: Predicate, nodes: Node[]): Element[] {
    const results: Element[] = [];
    this._findAll(test, nodes, results);
    return results;
  }
  _findAll(test: Predicate, nodes: Node[], results: Element[]) {
    for (const node of nodes) {
      if (test(node)) {
        results.push(node);
      }
      this._findAll(test, this.getChildren(node), results);
    }
  }
  findOne(test: Predicate, nodes: Node[]): Element|undefined {
    for (const node of nodes) {
      if (test(node)) {
        return node as Element;
      }
      const foundChild = this.findOne(test, this.getChildren(node));
      if (foundChild) {
        return foundChild;
      }
    }
    return undefined;
  }
}

export const parse5Adapter = new Parse5Adapter(defaultTreeAdapter);
