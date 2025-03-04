//根据placeholder以及对应文本框最近的元素来确定一个文本框的信息，根据信息匹配键值的key,输入对应的值
function findNearestChineseElement(inputElement) {
  if (!inputElement) return null;

  // 检测一个元素是否包含汉字文本
  function containsChineseText(element) {
    const str = element.textContent.trim();

    if (str.includes("请")) return false;

    const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");

    return reg.test(str);
  }

  // BFS搜索一棵子树
  function searchSubTreeBFS(root) {
    if (!root) return null;
    let queue = [root]; // 用队列来模拟广度优先搜索
    while (queue.length > 0) {
      let node = queue.shift(); // 取出队列头部元素
      // 检查当前节点是否包含汉字
      if (containsChineseText(node)) {
        return node;
      }
      // 将所有子节点加入队列
      for (let child of node.children) {
        queue.push(child);
      }
    }
    return null; // 没有找到汉字元素
  }

  // 遍历兄弟节点，对每个兄弟节点为根的子树做搜查
  function searchSiblings(element) {
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (searchSubTreeBFS(sibling)) return sibling;
      sibling = sibling.nextElementSibling;
    }

    sibling = element.previousElementSibling;
    while (sibling) {
      if (searchSubTreeBFS(sibling)) return sibling;
      sibling = sibling.previousElementSibling;
    }

    return null;
  }

  let currentElement = inputElement;
  while (currentElement && currentElement !== document.body) {
    // 1. 查找兄弟元素
    let found = searchSiblings(currentElement);
    if (found) return found;

    // 2. 向上递归到更高层的父元素
    currentElement = currentElement.parentElement;
  }

  return null;
}

const inputs = document.querySelectorAll("input, textarea, select");


console.log(inputs?.length);

inputs.forEach((input) => {
  const placeholder = input.getAttribute("placeholder");
  const labelElement = findNearestChineseElement(input);
  const label = labelElement?.textContent;
  console.log(`placeholder: ${placeholder}, label: ${label}`);
});
