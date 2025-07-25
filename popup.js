// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url || '';
    const isBaidu = url.startsWith('https://www.baidu.com');

    const featureList = document.getElementById('feature-list');
    const notSupported = document.getElementById('not-supported');
    const goBtn = document.getElementById('go-to-baidu');

    if (isBaidu) {
      if (featureList) featureList.style.display = 'block';
      if (notSupported) notSupported.style.display = 'none';
    } else {
      if (featureList) featureList.style.display = 'none';
      if (notSupported) notSupported.style.display = 'block';
    }

    if (!isBaidu && goBtn) {
      goBtn.addEventListener('click', () => {
        chrome.tabs.update(tabs[0].id, { url: 'https://www.baidu.com' });
        window.close();
      });
    }
  });
});

'use strict';

function setAlarm(event) {
  const seconds = parseInt(event.currentTarget.getAttribute('data-seconds'), 10);

  if (isNaN(seconds)) {
    alert('无效的秒数');
    return;
  }

  // const delayInMinutes = seconds / 60;

  chrome.action.setBadgeText({ text: 'ON' });
  chrome.alarms.create({ delayInMinutes: seconds, periodInMinutes: seconds });
  chrome.storage.sync.set({ seconds: seconds });

  window.close();
}

function clearAlarm() {
  chrome.action.setBadgeText({ text: '' });
  chrome.alarms.clearAll();
  window.close();
}

// An Alarm delay of less than the minimum 1 minute will fire
// in approximately 1 minute increments if released
document.getElementById('sampleMinute').addEventListener('click', setAlarm);
document.getElementById('min15').addEventListener('click', setAlarm);
document.getElementById('cancelAlarm').addEventListener('click', clearAlarm);
