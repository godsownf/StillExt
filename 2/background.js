/* Optimized background.js - Full Logic with Keep-Alive Persistence */
const STORAGE_KEY = 'fingerprintProfiles';
const ACTIVE_PROFILE_KEY = 'activeProfile';
const SAVED_SETTINGS_KEY = 'savedSettings';


function keepAlive() {
  setInterval(() => {
    chrome.runtime.getPlatformInfo(function (info) {
      console.log('Keeping service worker alive. Platform: ' + info.os);
    });
  }, 20000);
}

keepAlive();

const defaultProfiles = {
  chrome_win: {
    name: 'Chrome Windows',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      platform: 'Win32', vendor: 'Google Inc.', appName: 'Netscape',
      appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      product: 'Gecko', productSub: '20030107',
      languages: 'en-US,en', hardwareConcurrency: '8', deviceMemory: '8', maxTouchPoints: '0',
      doNotTrack: true, cookieEnabled: true, hideWebdriver: true,
      screenWidth: '1920', screenHeight: '1080', pixelRatio: '1', colorDepth: '24', pixelDepth: '24',
      webglVendor: 'Google Inc. (Intel)', webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11)',
      canvasNoise: true, canvasNoiseLevel: '0.1', canvasFingerprint: 'win_chrome_seed_88',
      spoofGeo: true, geoLat: '40.7128', geoLon: '-74.0060' // New York
    },
  },
  chrome_mac: {
    name: 'Chrome macOS',
    settings: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      platform: 'MacIntel', vendor: 'Google Inc.', appName: 'Netscape',
      appVersion: '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      product: 'Gecko', productSub: '20030107',
      languages: 'en-US,en-GB', hardwareConcurrency: '10', deviceMemory: '16', maxTouchPoints: '0',
      doNotTrack: true, cookieEnabled: true, hideWebdriver: true,
      screenWidth: '2560', screenHeight: '1440', pixelRatio: '2', colorDepth: '24', pixelDepth: '24',
      webglVendor: 'Google Inc. (Apple)', webglRenderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)',
      canvasNoise: true, canvasNoiseLevel: '0.15', canvasFingerprint: 'mac_chrome_seed_99',
      spoofGeo: true, geoLat: '34.0522', geoLon: '-118.2437' // Los Angeles
    },
  },
  firefox_win: {
    name: 'Firefox Windows',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
      platform: 'Win32', vendor: '', appName: 'Netscape',
      appVersion: '5.0 (Windows)', product: 'Gecko', productSub: '20100101',
      languages: 'en-US,en', hardwareConcurrency: '4', deviceMemory: '8', maxTouchPoints: '0',
      doNotTrack: false, cookieEnabled: true, hideWebdriver: true,
      screenWidth: '1366', screenHeight: '768', pixelRatio: '1', colorDepth: '24', pixelDepth: '24',
      webglVendor: 'Google Inc. (Intel)', webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620)',
      canvasNoise: false, canvasNoiseLevel: '0.1', canvasFingerprint: '',
      spoofGeo: false, geoLat: '', geoLon: ''
    },
  },
  safari_mac: {
    name: 'Safari macOS',
    settings: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
      platform: 'MacIntel', vendor: 'Apple Computer, Inc.', appName: 'Netscape',
      appVersion: '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
      product: 'Gecko', productSub: '20030107',
      languages: 'en-US', hardwareConcurrency: '8', deviceMemory: '8', maxTouchPoints: '0',
      doNotTrack: true, cookieEnabled: true, hideWebdriver: true,
      screenWidth: '1440', screenHeight: '900', pixelRatio: '2', colorDepth: '24', pixelDepth: '24',
      webglVendor: 'Apple Inc.', webglRenderer: 'Apple M1',
      canvasNoise: true, canvasNoiseLevel: '0.05', canvasFingerprint: 'apple_safari_v17',
      spoofGeo: true, geoLat: '37.3382', geoLon: '-121.8863' // San Jose
    },
  },
  mobile_chrome: {
    name: 'Android Phone',
    settings: {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
      platform: 'Linux armv8l', vendor: 'Google Inc.', appName: 'Netscape',
      appVersion: '5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
      product: 'Gecko', productSub: '20030107',
      languages: 'en-US,en', hardwareConcurrency: '8', deviceMemory: '8', maxTouchPoints: '5',
      doNotTrack: true, cookieEnabled: true, hideWebdriver: true,
      screenWidth: '393', screenHeight: '852', pixelRatio: '3', colorDepth: '24', pixelDepth: '24',
      webglVendor: 'Google Inc. (Qualcomm)', webglRenderer: 'Adreno (TM) 740',
      canvasNoise: true, canvasNoiseLevel: '0.1', canvasFingerprint: 'pixel_7_android_noise',
      spoofGeo: true, geoLat: '51.5074', geoLon: '-0.1278' // London
    },
  },
  mobile_safari: {
    name: 'iPhone / iOS',
    settings: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
      platform: 'iPhone', vendor: 'Apple Computer, Inc.', appName: 'Netscape',
      appVersion: '5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
      product: 'Gecko', productSub: '20030107',
      languages: 'en-US', hardwareConcurrency: '6', deviceMemory: '6', maxTouchPoints: '5',
      doNotTrack: true, cookieEnabled: true, hideWebdriver: true,
      screenWidth: '393', screenHeight: '852', pixelRatio: '3', colorDepth: '24', pixelDepth: '24',
      webglVendor: 'Apple Inc.', webglRenderer: 'Apple GPU',
      canvasNoise: true, canvasNoiseLevel: '0.08', canvasFingerprint: 'ios_17_iphone_15_pro',
      spoofGeo: true, geoLat: '48.8566', geoLon: '2.3522' // Paris
    },
  },
};

function getStorage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY, ACTIVE_PROFILE_KEY, SAVED_SETTINGS_KEY], resolve);
  });
}

function saveProfiles(profiles) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: profiles }, resolve);
  });
}

function setActiveProfile(profileName) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [ACTIVE_PROFILE_KEY]: profileName }, resolve);
  });
}

function getActiveProfile() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([ACTIVE_PROFILE_KEY], (res) => resolve(res[ACTIVE_PROFILE_KEY]));
  });
}

function saveSettingsToStorage(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [SAVED_SETTINGS_KEY]: settings }, resolve);
  });
}

async function initializeProfiles() {
  const storage = await getStorage();
  if (!storage[STORAGE_KEY]) await saveProfiles(defaultProfiles);
  if (!storage[ACTIVE_PROFILE_KEY]) await setActiveProfile('chrome');
}

async function applyProfile(profileName) {
  const storage = await getStorage();
  const profiles = storage[STORAGE_KEY] || defaultProfiles;
  const profile = profiles[profileName];
  if (!profile) {
    log(`Profile ${profileName} not found.`);
    return;
  }

  await saveSettingsToStorage(profile.settings);
  await setActiveProfile(profileName);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        world: 'MAIN',
        func: (s) => window.dispatchEvent(new CustomEvent('applySettingsEvent', { detail: s })),
        args: [profile.settings],
      });
      log(`Applied profile: ${profileName}`);
    }
  });
}

function log(msg) { console.log(`[Background] ${msg}`); }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handler = async () => {
    switch (request.action) {
      case 'saveProfile':
        await saveProfiles(request.profiles);
        return { status: 'Profiles saved' };
      case 'saveSettings':
        await saveSettingsToStorage(request.settings);
        return { status: 'Settings saved' };
      case 'setActiveProfile':
        await setActiveProfile(request.profileName);
        return { status: 'Active profile set' };
      case 'getProfiles':
        const s1 = await getStorage();
        return { profiles: s1[STORAGE_KEY] || defaultProfiles };
      case 'getActiveProfile':
        return { profileName: await getActiveProfile() };
      case 'applyProfile':
        await applyProfile(request.profileName);
        return { status: 'Applying profile' };
      case 'getSavedSettings':
        const s2 = await getStorage();
        return { settings: s2[SAVED_SETTINGS_KEY] || null };
      case 'importProfiles':
        await saveProfiles(request.profiles);
        return { status: 'Profiles imported' };
      case 'exportProfiles':
        const s3 = await getStorage();
        return { profiles: s3[STORAGE_KEY] || defaultProfiles };
      case 'log':
        log(request.message);
        return { status: 'Logged' };
      default:
        return { error: 'Unknown action' };
    }
  };
  handler().then(sendResponse);
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  log('Extension installed. Initializing...');
  initializeProfiles();
});

initializeProfiles();