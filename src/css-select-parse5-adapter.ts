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

import {Adapter as CSSSelectAdapter, Predicate} from 'css-select/lib/types';
import {TreeAdapter, defaultTreeAdapter, DefaultTreeAdapterMap} from 'parse5';
import {Node, Element, ParentNode} from 'parse5/dist/tree-adapters/default';

/**
 * This is an implementation of the Adapter interface from `css-select` package
 * that is bound to a specific `parse5` `TreeAdapter`.  Unless you need to bind
 * to a `TreeAdapter` *other than* the `defaultTreeAdapter` from `parse5`,
 * you'll want the exported `parse5Adapter` instance of this class.
 */
export class Parse5Adapter implements CSSSelectAdapter<Node, Element> {
  treeAdapter: TreeAdapter<DefaultTreeAdapterMap>;

  /**
   * @param treeAdapter defines the `TreeAdapter` implementation for `parse5` to
   *     bind this `css-select` adapter to.
   */
  constructor(treeAdapter: TreeAdapter<DefaultTreeAdapterMap>) {
    this.treeAdapter = treeAdapter;
  }

  isTag(node: Node): node is Element {
    return this.treeAdapter.isElementNode(node);
  }

  existsOne(test: Predicate<Element>, elems: Node[]): boolean {
    return elems.some((value) => {
      return test(value as Element);
    });
  }

  getAttributeValue(elem: Node, name: string): string {
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
    if (this._isParent(node)) {
      const n = node as ParentNode;
      return n.childNodes && n.childNodes.length > 0 ? [...n.childNodes] : [];
    }
    return [];
  }

  _isParent(node: Node): node is ParentNode {
    return 'childNodes' in node;
  }

  getName(elem: Element): string {
    return this.treeAdapter.getTagName(elem);
  }

  getParent(node: Element): Element | null {
    return node.parentNode as Element;
  }

  getSiblings(node: Node): Node[] {
    const siblings = this._getParent(node);
    if (siblings) {
      return siblings;
    }
    return [];
  }

  _getParent(node: Node) {
    return this.treeAdapter.getParentNode(node)?.childNodes;
  }

  getText(node: Node): string {
    return this.treeAdapter.isTextNode(node) ?
        this.treeAdapter.getTextNodeContent(node) :
        this.getChildren(node).map((node: Node) => this.getText(node)).join('');
  }

  hasAttrib(elem: Element, name: string): boolean {
    return this.isTag(elem) &&
        this.treeAdapter.getAttrList(elem).some(
            (attr) => attr.name === name);
  }

  removeSubsets(nodes: Node[]): Node[] {
    const filtered: Set<Node> = new Set(nodes);
    for (const node of [...filtered]) {
      if (this._findAncestor(
          (ancestor: Node) => filtered.has(ancestor), node)) {
        filtered.delete(node);
        continue;
      }
    }
    return [...filtered];
  }

  findAll(test: Predicate<Element>, nodes: Node[]): Element[] {
    const results: Element[] = [];
    this._findAll(test, nodes, results);
    return results;
  }

  _findAll(test: Predicate<Element>, nodes: Node[], results: Element[]) {
    for (const node of nodes) {
      if (test(node as Element)) {
        results.push(node as Element);
      }
      this._findAll(test, this.getChildren(node), results);
    }
  }

  findOne(test: Predicate<Element>, nodes: Node[]): Element|null {
    for (const node of nodes) {
      if (test(node as Element)) {
        return node as Element;
      }
      const foundChild = this.findOne(test, this.getChildren(node));
      if (foundChild) {
        return foundChild;
      }
    }
    return null;
  }

  _findAncestor(test: Predicate<Node>, node: Node): Node|undefined {
    let n: Node | null = node;
    do {
      n = this.getParent(node as Element);
      if (n) {
        if (test(n)) {
          return n;
        }
      }
    } while (n);
    return undefined;
  }
}

/**
 * This is an instance of the `Parse5Adapter` class which uses the
 * `defaultTreeAdapter` from `parse5` to manipulate the AST.  This
 * is most likely what you'll want to import.
 */
export const parse5Adapter = new Parse5Adapter(defaultTreeAdapter);