// 后台脚本 - 处理扩展的后台逻辑

chrome.runtime.onInstalled.addListener(() => {
  console.log("Cookie Manager 扩展已安装")
})

// 监听Cookie变化
chrome.cookies.onChanged.addListener((changeInfo) => {
  console.log("Cookie发生变化:", changeInfo)
})

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCookies") {
    chrome.cookies.getAll({ domain: request.domain }, (cookies) => {
      sendResponse({ cookies })
    })
    return true // 保持消息通道开放
  }
})