const STORAGE_KEY = 'fingerprintProfiles';
const ACTIVE_PROFILE_KEY = 'activeProfile';

const defaultProfiles = {
  chrome: {
    name: 'Chrome Default',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      screenWidth: 1920,
      screenHeight: 1080,
      language: 'en-US',
    },
  },
  firefox: {
    name: 'Firefox Default',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0',
      screenWidth: 1366,
      screenHeight: 768,
      language: 'en-US',
    },
  },
};

async function initializeProfiles() {
  const storage = await getStorage();
  if (!storage[STORAGE_KEY]) {
    await saveProfiles(defaultProfiles);
  }
  if (!storage[ACTIVE_PROFILE_KEY]) {
    await setActiveProfile('chrome');
  }
}

function getStorage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY, ACTIVE_PROFILE_KEY], (result) => {
      resolve(result);
    });
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

async function applyProfile(profileName) {
  const storage = await getStorage();
  const profiles = storage[STORAGE_KEY] || defaultProfiles;
  const profile = profiles[profileName];
  if (profile) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (settings) => {
            chrome.runtime.sendMessage({ action: 'applySettings', settings });
          },
          args: [profile.settings],
        });
        setActiveProfile(profileName);
        log(`Applied profile: ${profileName}`);
      }
    });
  } else {
    log(`Profile ${profileName} not found.`);
  }
}

function log(message) {
  console.log(`[Background] ${message}`);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'saveProfile':
      saveProfiles(request.profiles).then(() => {
        log('Profiles saved.');
        sendResponse({ status: 'Profiles saved' });
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
