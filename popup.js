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
        chrome.tabs.create({ url: 'https://www.baidu.com' });
        window.close();
      });
    }
  });
});

'use strict';

function setAlarm() {

  chrome.action.setBadgeText({ text: 'ON' });
  chrome.alarms.create({ when: Date.now(), periodInMinutes: 0.5 });
  chrome.storage.sync.set({ minute: 0.5 });

  window.close();
}

function clearAlarm() {
  chrome.action.setBadgeText({ text: '' });
  chrome.alarms.clearAll();
  window.close();
}

document.getElementById('sampleMinute').addEventListener('click', setAlarm);
document.getElementById('cancelAlarm').addEventListener('click', clearAlarm);
