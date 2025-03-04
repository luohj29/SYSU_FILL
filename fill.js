(function () {
  // 避免重复初始化 self.defaults
  if (!self.defaults) {
    self.defaults = window.defaults;
  }

  // 根据placeholder或label匹配输入框并填充值
  function findNearestChineseElement(inputElement) {
    if (!inputElement) return null;

    // 检测元素是否包含汉字文本（排除含“请”的提示文本）
    function containsChineseText(element) {
      const str = element.textContent.trim();
      if (str.includes("请")) return false;
      return /[\u4E00-\u9FFF]/.test(str);
    }

    // BFS搜索子树
    function searchSubTreeBFS(root) {
      if (!root) return null;
      const queue = [root];
      while (queue.length > 0) {
        const node = queue.shift();
        if (containsChineseText(node)) return node;
        queue.push(...node.children);
      }
      return null;
    }

    // 搜索兄弟节点
    function searchSiblings(element) {
      let sibling = element.nextElementSibling;
      while (sibling) {
        const found = searchSubTreeBFS(sibling);
        if (found) return found;
        sibling = sibling.nextElementSibling;
      }
      sibling = element.previousElementSibling;
      while (sibling) {
        const found = searchSubTreeBFS(sibling);
        if (found) return found;
        sibling = sibling.previousElementSibling;
      }
      return null;
    }

    let currentElement = inputElement;
    while (currentElement && currentElement !== document.body) {
      const found = searchSiblings(currentElement);
      if (found) return found;
      currentElement = currentElement.parentElement;
    }
    return null;
  }

  // 增强版设置输入值函数
  function setInputValue(input, value) {
    // 聚焦输入框
    input.focus();

    // 直接设置值
    input.value = value;

    // 触发 input 事件
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);

    // 触发 change 事件
    const changeEvent = new Event("change", { bubbles: true });
    input.dispatchEvent(changeEvent);

    // 触发 blur 事件（模拟用户离开输入框）
    input.blur();

    // 处理 React 框架的特殊情况
    if (input._valueTracker) {
      input._valueTracker.setValue(value);
    }
  }

  // 监视 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // 处理新添加的元素
            processElement(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  function processElement(element) {
    const inputs = element.querySelectorAll("input, textarea, select");
    inputs.forEach((currentInput) => {
      const placeholder = currentInput.getAttribute("placeholder");
      const labelElement = findNearestChineseElement(currentInput);
      const label = labelElement?.textContent?.trim();

      // 处理文件输入框
      if (currentInput.type === "file") {
        console.log("跳过文件输入框");
        currentInput.value = "";
        return;
      }

      // 匹配并填充值
      let matched = false;
      for (const key in self.defaults.profile) {
        if (
          (placeholder && placeholder.includes(key)) ||
          (label && label.includes(key))
        ) {
          // 根据 class 分类处理
          if (currentInput.classList.contains("atsx-select-search__field")) {
            setSelectSearchValue(currentInput, self.defaults.profile[key]); // 处理特定 class 的选择框
          } else if (
            currentInput.tagName === "SELECT" ||
            currentInput.type === "radio" ||
            currentInput.type === "checkbox"
          ) {
            console.log(
              "select",
              `当前输入框: placeholder=${placeholder}, label=${label}`
            );
            setSelectValue(currentInput, self.defaults.profile[key]); // 处理普通选择框
          } else {
            console.log(
              "input",
              `当前输入框: placeholder=${placeholder}, label=${label}`
            );
            setInputValue(currentInput, self.defaults.profile[key]); // 处理普通输入框
          }
          console.log(`已填充: ${key}=${self.defaults.profile[key]}`);
          matched = true;
          break;
        }
      }

      if (!matched) {
        console.log("未匹配到字段，设置为默认值");
        setInputValue(currentInput, "NULL VALUE");
      }
    });
  }

  // 初始处理现有的元素
  processElement(document);

  // 设置普通输入框的值
  function setInputValue(input, value) {
    input.value = value;
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);
    const changeEvent = new Event("change", { bubbles: true });
    input.dispatchEvent(changeEvent);
  }

  // 设置普通选择框的值
  function setSelectValue(select, value) {
    if (select.tagName === "SELECT") {
      // 处理下拉选择框
      const option = Array.from(select.options).find(
        (opt) => opt.text.includes(value) || opt.value.includes(value)
      );
      if (option) {
        select.value = option.value;
        const changeEvent = new Event("change", { bubbles: true });
        select.dispatchEvent(changeEvent);
      }
    } else if (select.type === "radio" || select.type === "checkbox") {
      // 处理单选框和复选框
      if (select.value === value) {
        select.checked = true;
        const changeEvent = new Event("change", { bubbles: true });
        select.dispatchEvent(changeEvent);
      }
    }
  }

  // 设置特定 class 的选择框的值
  function setSelectSearchValue(input, value) {
    // 假设这是一个自定义的选择框，需要模拟用户输入
    input.value = value;
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);

    // 如果需要触发选择逻辑，可以模拟点击或触发其他事件
    const searchEvent = new Event("search", { bubbles: true });
    input.dispatchEvent(searchEvent);
  }
})();
