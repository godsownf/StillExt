const STORAGE_KEY = 'fingerprintProfiles';
const ACTIVE_PROFILE_KEY = 'activeProfile';
const SAVED_SETTINGS_KEY = 'savedSettings';

const defaultProfiles = {
  chrome: {
    name: 'Chrome Windows',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      platform: 'Win32', vendor: 'Google Inc.', appName: 'Netscape',
      appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      product: 'Gecko', productSub: '20030107',
      language: 'en-US', languages: 'en-US,en',
      hardwareConcurrency: '8', deviceMemory: '8', maxTouchPoints: '0',
      cookieEnabled: true, pdfViewerEnabled: true, hideWebdriver: true, hideAutomation: true,
      pixelRatio: '1', screenWidth: '1920', screenHeight: '1080',
      colorDepth: '24', pixelDepth: '24', availWidth: '1920', availHeight: '1040',
      outerWidth: '1920', outerHeight: '1080', innerWidth: '1920', innerHeight: '937',
      screenX: '0', screenY: '0',
      webglVendor: 'Google Inc. (Intel)',
      webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      webglVersion: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
      webglGlsl: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',
      canvasNoise: false, canvasNoiseLevel: '0.1',
      audioNoise: false, audioNoiseLevel: '0.0001',
      plugins: 'PDF Viewer, Chrome PDF Viewer, Chromium PDF Viewer, Microsoft Edge PDF Viewer, WebKit built-in PDF',
    },
  },
  firefox: {
    name: 'Firefox Windows',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
      platform: 'Win32', vendor: '', appName: 'Netscape',
      appVersion: '5.0 (Windows)', product: 'Gecko', productSub: '20100101',
      language: 'en-US', languages: 'en-US,en',
      hardwareConcurrency: '8', deviceMemory: '', maxTouchPoints: '0',
      cookieEnabled: true, pdfViewerEnabled: false, hideWebdriver: true, hideAutomation: false,
      pixelRatio: '1', screenWidth: '1920', screenHeight: '1080',
      colorDepth: '24', pixelDepth: '24', availWidth: '1920', availHeight: '1040',
      outerWidth: '1920', outerHeight: '1080', innerWidth: '1920', innerHeight: '937',
      screenX: '0', screenY: '0',
      webglVendor: 'Google Inc. (Intel)',
      webglRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630)',
      webglVersion: 'WebGL 1.0', webglGlsl: 'WebGL GLSL ES 1.0',
      canvasNoise: false, canvasNoiseLevel: '0.1',
      audioNoise: false, audioNoiseLevel: '0.0001',
      plugins: '',
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
    chrome.storage.sync.get([ACTIVE_PROFILE_KEY], (result) => {
      resolve(result[ACTIVE_PROFILE_KEY]);
    });
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
  if (!profile) { log(`Profile ${profileName} not found.`); return; }
  await saveSettingsToStorage(profile.settings);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (settings) => chrome.runtime.sendMessage({ action: 'applySettings', settings }),
        args: [profile.settings],
      });
      setActiveProfile(profileName);
      log(`Applied profile: ${profileName}`);
    }
  });
}

function log(msg) { console.log(`[Background] ${msg}`); }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'saveProfile':
      saveProfiles(request.profiles).then(() => {
        log('Profiles saved.');
        sendResponse({ status: 'Profiles saved' });
      });
      return true;

    case 'saveSettings':
      saveSettingsToStorage(request.settings).then(() => {
        log('Settings saved to storage.');
        sendResponse({ status: 'Settings saved' });
      });
      return true;

    case 'setActiveProfile':
      setActiveProfile(request.profileName).then(() => {
        log(`Active profile set to ${request.profileName}`);
        sendResponse({ status: 'Active profile set' });
      });
      return true;

    case 'getProfiles':
      getStorage().then((storage) => {
        sendResponse({ profiles: storage[STORAGE_KEY] || defaultProfiles });
      });
      return true;

    case 'getActiveProfile':
      getActiveProfile().then((profileName) => {
        sendResponse({ profileName });
      });
      return true;

    case 'applyProfile':
      applyProfile(request.profileName);
      sendResponse({ status: 'Applying profile' });
      return true;

    case 'getSavedSettings':
      getStorage().then((storage) => {
        sendResponse({ settings: storage[SAVED_SETTINGS_KEY] || null });
      });
      return true;

    case 'importProfiles':
      saveProfiles(request.profiles).then(() => {
        log('Profiles imported.');
        sendResponse({ status: 'Profiles imported' });
      });
      return true;

    case 'exportProfiles':
      getStorage().then((storage) => {
        sendResponse({ profiles: storage[STORAGE_KEY] || defaultProfiles });
      });
      return true;

    case 'log':
      log(request.message);
      sendResponse({ status: 'Logged' });
      break;

    default:
      log(`Unknown action: ${request.action}`);
  }
});

initializeProfiles();

chrome.runtime.onInstalled.addListener(() => {
  log('Extension installed. Initializing profiles...');
  initializeProfiles();
});
