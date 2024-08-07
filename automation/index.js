const { chromium } = require('playwright')

;(async () => {
  // worker-id 需要先手动创建
  const workerId = 1

  const browser = await chromium.launchPersistentContext(
    `${process.env.localappdata}\\VirtualBrowser\\Workers\\${workerId}`,
    {
      // 配置VirtualBrowser安装路径
      executablePath: 'D:\\Program Files\\vb\\VirtualBrowser\\VirtualBrowser\\120.0.6099.62\\VirtualBrowser.exe',
      args: [`--worker-id=${workerId}`],
      headless: false,
      defaultViewport: null,
    }
  )

  const page = await browser.newPage()
  await page.goto('http://example.com')
  // other actions...
  // await browser.close()
})()







// const { chromium } = require('playwright');

// async function runTest(params) {
//    // 启动 EXE 并打开浏览器上下文
//    const browser = await chromium.launchPersistentContext('', {
//     executablePath: 'D:\\Program Files\\vb\\VirtualBrowser\\VirtualBrowser.exe',
//     headless: false
//   });

//   const page = (await browser.pages())[0]; // 获取第一个页面

//   // 确保页面加载完成
//   await page.waitForLoadState('domcontentloaded');

//   // 调用 Vue 应用中的 API 方法
//   const result = await page.evaluate(async () => {
//     try {
//       // 假设你要调用 getBrowserList 方法
//       const list = await window.getBrowserList();
//       return list; // 返回调用结果
//     } catch (error) {
//       console.error('调用 API 时出错:', error);
//       throw error;
//     }
//   });

//   console.log('API 调用结果:', result);

// } 

// runTest();
// async function run(params)  {
//   try {
//     const workerId = 1;
//     const browserPath = `${process.env.localappdata}\\VirtualBrowser\\Workers\\${workerId}`;

//     console.log(`启动浏览器，路径: ${browserPath}`);

//     const browser = await chromium.launchPersistentContext(browserPath, {
//       executablePath: 'D:\\Program Files\\vb\\VirtualBrowser\\VirtualBrowser\\120.0.6099.62\\VirtualBrowser.exe',
//       args: [`--worker-id=${workerId}`],
//       headless: false,
//       defaultViewport: null,
//     });

//     console.log('浏览器已启动');

//     const page = await browser.newPage();
//     console.log('新页面创建成功，准备跳转...');
    
//     await page.goto('http://example.com', { timeout: 60000 }); // 增加超时时间
//     console.log('页面已成功打开 http://example.com');

//     // other actions...

//     // 确保关闭浏览器上下文
//     // await browser.close();
//     console.log('浏览器已关闭');
//   } catch (error) {
//     console.error('发生错误:', error);
//   }
// };