const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const axios = require('axios');

// 获取 IP 和端口
const fetchProxyDetails = async () => {
  try {
    const response = await axios.get('http://api1.ydaili.cn/tools/BUnlimitedApi.ashx?key=8B4B350B49A764E6FF073D763761FB65&action=BUnlimited&qty=1&orderNum=SH20240601153533558&isp=&format=txt');
    const proxyDetails = response.data.trim(); // 处理响应数据
    const [ip, port] = proxyDetails.split(':'); // 假设 IP 和端口用冒号分隔
    return { ip, port };
  } catch (error) {
    console.error('Error fetching proxy details:', error);
    return { ip: '127.0.0.1', port: '8080' }; // 默认值
  }
};

// 读取 JSON 文件
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON file:', err);
    return null;
  }
};

// 修改 JSON 条目
const modifyJsonEntry = (filePath, ip, port, index, jsonData) => {
  try {
    if (index >= jsonData.users.length) {
      console.log('No more entries to modify.');
      return null;
    }

    const user = jsonData.users[index];
    const workerId = user.id; // 使用用户的 id 作为 workerId

    user.proxy.mode = 2;
    user.proxy.protocol = 'http';
    user.proxy.host = ip;
    user.proxy.port = port;

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log(`Modified entry with workerId ${workerId} at index ${index} successfully.`);
    return { workerId, index };
  } catch (err) {
    console.error('Error processing JSON file:', err);
    return null;
  }
};

// 删除 JSON 条目
const deleteJsonEntry = (filePath, index, jsonData) => {
  try {
    if (index < 0 || index >= jsonData.users.length) {
      console.log(`Index ${index} is out of bounds.`);
      return;
    }

    jsonData.users.splice(index, 1);

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Deleted entry at index ${index} successfully.`);
  } catch (err) {
    console.error('Error deleting JSON entry:', err);
  }
};

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const filePath = path.join(process.env.localappdata, 'VirtualBrowser', 'User Data', 'virtual.dat');
  const maxWindows = 30; // 要保持的浏览器窗口数量
  const viewportWidth = 1280; // 设置窗口宽度
  const viewportHeight = 800; // 设置窗口高度
  let currentIndex = 0;  // 当前处理的 JSON 条目索引

  // 存储正在运行的浏览器实例
  const runningBrowsers = new Set();

  const startBrowser = async (workerId, index) => {
    const { ip, port } = await fetchProxyDetails(); // 每次启动前获取新的 IP 和端口

    const browser = await chromium.launchPersistentContext(
      `${process.env.localappdata}\\VirtualBrowser\\Workers\\${workerId}`,
      {
        executablePath: 'D:\\Program Files\\vb\\VirtualBrowser\\VirtualBrowser\\120.0.6099.62\\VirtualBrowser.exe',
        args: [`--worker-id=${workerId}`],
        headless: false,
        defaultViewport: null,
      }
    );

    runningBrowsers.add(workerId);

    const page = await browser.newPage();
    await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
    await page.goto('https://www.baidu.com');

    // 等待 1 分钟
    await delay(60000);

    await browser.close();
    console.log(`Browser closed for workerId ${workerId}.`);

    // 删除 JSON 条目并启动新窗口
    deleteJsonEntry(filePath, index, jsonData);
    runningBrowsers.delete(workerId);

    // 更新 JSON 数据
    jsonData = readJsonFile(filePath);

    // 启动新窗口
    if (currentIndex < jsonData.users.length) {
      const result = modifyJsonEntry(filePath, ip, port, currentIndex, jsonData);
      if (result) {
        const { workerId: newWorkerId, index: newIndex } = result;
        currentIndex = newIndex + 1; // 更新索引
        startBrowser(newWorkerId, newIndex);
      }
    }
  };

  // 启动初始的 30 个浏览器窗口
  for (let i = 0; i < maxWindows; i++) {
    const result = modifyJsonEntry(filePath, await fetchProxyDetails(), port, currentIndex, jsonData);
    if (result) {
      const { workerId, index } = result;
      currentIndex = index + 1; // 更新索引
      startBrowser(workerId, index);
      await delay(10000); // 启动之间的延迟，防止过于卡顿
    }
  }

  // 持续运行以保持 30 个窗口
  while (true) {
    if (runningBrowsers.size < maxWindows) {
      const { ip, port } = await fetchProxyDetails(); // 获取新的 IP 和端口
      const result = modifyJsonEntry(filePath, ip, port, currentIndex, jsonData);
      if (result) {
        const { workerId, index } = result;
        currentIndex = index + 1; // 更新索引
        startBrowser(workerId, index);
      }
    }
    await delay(5000); // 每 5 秒检查一次运行中的浏览器窗口
  }
})();