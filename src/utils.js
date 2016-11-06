/**
 * Utils
 */

/**
 *
 * @param node1
 * @param node2
 */
exports.getCommonParent = function (node1, node2) {
  if (!node1 || !node2) {
    return null;
  }

  const maxLength = Math.max(node1.parents.length, node2.parents.length);
  for (let i = 0; i < maxLength; i++) {
    const p1 = node1.parents[i];
    const p2 = node2.parents[i];
    if (p1 != p2) {
      return node1.parents[i - 1];
    }
  }

  // todo: warn
  return node1.parents[node1.parents.length - 1];
};
