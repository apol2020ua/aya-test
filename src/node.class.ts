// internal class-helper for AppService.importDatabase fn.

type NodeValue = Record<string, any> | Array<Record<string, any>>;

export class Node {
  constructor(pNode: Node = null, val: NodeValue = {}, level = -1) {
    this.parent = pNode;
    this.val = val;
    this.level = level;
  }
  parent: Node = null;
  level: number = -1;
  val: NodeValue = {};

  get isArray() {
    return Array.isArray(this.val);
  }

  attachToParent() {
    return this.parent.val.push(this.val);
  }
}
