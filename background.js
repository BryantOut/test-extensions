async function handleNotBaidu() {
  const Toast = '当前未打开百度首页，已停止定时提醒。';
  const webhookURL = 'https://open.feishu.cn/open-apis/bot/v2/hook/64eb0327-2138-48ef-a5c3-2f1bab3a6a57';

  try {
    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text: Toast }
      })
    });

    if (response.ok) {
      console.log('飞书通知成功');
    } else {
      console.log(`飞书通知失败，状态码: ${response.status}`);
    }
  } catch (error) {
    console.log('飞书通知请求出错:', error);
  }

  // 清理定时器与徽章
  chrome.alarms.clearAll();
  chrome.action.setBadgeText({ text: '' });
}

function notify(title, message) {
  console.log(`[${title}] ${message}`);

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'stay_hydrated.png',
    title: title,
    message: message,
    priority: 0,
  });
}

function refreshTabAndExtract() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) return;
    const tab = tabs[0];
    const tabId = tab.id;
    const url = tab.url || '';
    const isBaidu = url.startsWith('https://www.baidu.com');

    if (!isBaidu) {
      // 当前不是百度，提醒用户并停止定时器和徽章
      handleNotBaidu();
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
          }, async (results) => {
            const webhookURL = 'https://open.feishu.cn/open-apis/bot/v2/hook/64eb0327-2138-48ef-a5c3-2f1bab3a6a57';
            const text = results?.[0]?.result || '未找到热搜内容';
            // chrome.notifications.create({
            //   type: 'basic',
            //   iconUrl: 'stay_hydrated.png',
            //   title: '百度热搜第一条',
            //   message: text,
            //   priority: 0,
            // });
            try {
              const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  msg_type: 'text',
                  content: { text: `百度热搜第一条：${text}` }
                })
              });

              if (response.ok) {
                notify('飞书通知成功', '热搜内容已发送');
              } else {
                notify('飞书通知失败', `状态码: ${response.status}`);
              }
            } catch (error) {
              notify('飞书通知请求出错', error.message || String(error));
            }
          });
        }
      }
      chrome.tabs.onUpdated.addListener(onUpdatedListener);
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  refreshTabAndExtract();
});
