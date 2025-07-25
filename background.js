function refreshTabAndExtract() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) return;
    const tab = tabs[0];
    const tabId = tab.id;
    const url = tab.url || '';
    const isBaidu = url.startsWith('https://www.baidu.com');

    if (!isBaidu) {
      // 当前不是百度，提醒用户并停止定时器和徽章
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'stay_hydrated.png',
        title: '提醒喝水',
        message: '请打开百度首页查看热搜内容，已取消定时提醒。',
        priority: 0,
      });
      chrome.alarms.clearAll();
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    // 是百度，刷新并注入脚本
    chrome.tabs.reload(tabId, {}, () => {
      function onUpdatedListener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(onUpdatedListener);

          chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              const wrapper = document.querySelector('#s-hotsearch-wrapper');
              const firstTitle = wrapper?.querySelector('.title-content-title');
              return firstTitle ? firstTitle.textContent.trim() : '未找到热搜内容';
            },
          }, (results) => {
            const text = results?.[0]?.result || '未找到热搜内容';
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'stay_hydrated.png',
              title: '百度热搜第一条',
              message: text,
              priority: 0,
            });
          });
        }
      }
      chrome.tabs.onUpdated.addListener(onUpdatedListener);
    });
  });
}
