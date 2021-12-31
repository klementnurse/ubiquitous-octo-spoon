/**
 * React and the browser integrated Google Translate (extension or built-in to Chrome
 * Mobile) do not play nicely together. Some interactions can crash the app as React
 * is expecting to manipulate DOM nodes that have been changed by Google Translate.
 * @see https://github.com/facebook/react/issues/11538
 *
 * Potential solutions are:
 *
 * 1. Wrapping all text nodes in another node. It's hard to know which text nodes
 *    are problematic, and the issue can be re-introduced by future code changes
 *    that are not aware of this issue.
 * 2. Monkey-patch Node.removeChild and Node.insertBefore. This may cause some legitimate
 *    DOM errors to be logged instead of crashing, and has some undefined but small
 *    performance impact. Regardless, this method has been generally accepted as
 *    the recommended solution and was proposed by Dan Abramov.
 *    @see https://github.com/facebook/react/issues/11538#issuecomment-417504600
 *
 * This module implements the second approach.
 */
;(() => {
  if (typeof Node === 'function' && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (console) {
          console.error(
            'Cannot remove a child from a different parent',
            child,
            this
          )
        }
        return child
      }
      return originalRemoveChild.apply(this, [child]) as T
    }

    const originalInsertBefore = Node.prototype.insertBefore
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null
    ) {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.error(
            'Cannot insert before a reference node from a different parent',
            referenceNode,
            this
          )
        }
        return newNode
      }
      return originalInsertBefore.apply(this, [newNode, referenceNode]) as T
    }
  }
})()

export {}
