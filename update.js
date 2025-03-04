document.getElementById("add-row").addEventListener("click", addRow);
document.getElementById("save").addEventListener("click", saveAll);
document.getElementById("retrieve").addEventListener("click", retrieveAll);

// 加载并显示默认键值对
window.addEventListener("DOMContentLoaded", () => {
  console.log("Update script is running!");
  initializeDefaults();
  loadStoredData();
});

// 初始化存储默认键值对
function initializeDefaults() {
  chrome.storage.local.get("profile", (result) => {
    if (!result.profile) {
      chrome.storage.local.set({ profile: window.defaults.profile }, () => {
        console.log("Defaults initialized in local storage.");
      });
    } else {
        console.log("Defaults already exist in local storage.");
    }
  });
}

function loadStoredData() {
    chrome.storage.local.get("profile", (result) => {
      // ||表示如果result.profile不存在，就返回一个空对象
      const data = result.profile || {};
      //找到html预留的table body
    const tbody = document.querySelector("#kv-table tbody");
    tbody.innerHTML = ""; // 清空表格
    for (const [key, value] of Object.entries(data)) {
      addRow(key, value);
    }
  });
}

// 添加新行
function addRow(key = "", value = "") {
  const tbody = document.querySelector("#kv-table tbody");
  const row = document.createElement("tr");

  // Key 输入框
  const keyCell = document.createElement("td");
  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.placeholder = "Enter key";
  keyInput.value = key;
  keyCell.appendChild(keyInput);

  // Value 输入框
  const valueCell = document.createElement("td");
  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.placeholder = "Enter value";
  valueInput.value = value;
  valueCell.appendChild(valueInput);

  // 删除按钮
  const actionCell = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    tbody.removeChild(row);
  });
  actionCell.appendChild(deleteButton);

  // 将单元格添加到行中
  row.appendChild(keyCell);
  row.appendChild(valueCell);
  row.appendChild(actionCell);

  // 将行添加到表格中
  tbody.appendChild(row);
}

// 保存所有键值对
function saveAll() {
  const rows = document.querySelectorAll("#kv-table tbody tr");
  const data = {};

  rows.forEach((row) => {
    const key = row.querySelector('input[type="text"]').value.trim();
    const value = row.querySelectorAll('input[type="text"]')[1].value.trim();

    if (key && value) {
      data[key] = value;
    }
  });

  if (Object.keys(data).length > 0) {
    chrome.storage.local.set({ profile: data }, () => {
      console.log("All key-value pairs saved:", data);
      alert("Saved successfully!");
    });
  } else {
    alert("No valid key-value pairs to save.");
  }
}

// 检索所有键值对
function retrieveAll() {
  chrome.storage.local.get("profile", (result) => {
    const data = result.profile || {};
    const output = document.getElementById("output");
    output.innerHTML = "";

    if (Object.keys(data).length === 0) {
      output.innerHTML = "<p>No data found.</p>";
    } else {
      const ul = document.createElement("ul");
      for (const [key, value] of Object.entries(data)) {
        const li = document.createElement("li");
        li.textContent = `${key}: ${value}`;
        ul.appendChild(li);
      }
      output.appendChild(ul);
    }
  });
}
