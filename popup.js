// popup.js

// Load recent configuration from localStorage
function loadRecent() {
  const recent = localStorage.getItem('recentConfig');
  return recent ? JSON.parse(recent) : null;
}

// Save recent configuration to localStorage
function saveRecent(config) {
  localStorage.setItem('recentConfig', JSON.stringify(config));
}

// Get current settings from input fields
function getCurrentConfig() {
  return {
    userAgent: document.getElementById('userAgent').value,
    languages: document.getElementById('languages').value,
    hardwareConcurrency: document.getElementById('hardwareConcurrency').value,
    deviceMemory: document.getElementById('deviceMemory').value,
    pixelRatio: document.getElementById('pixelRatio').value,
    screenWidth: document.getElementById('screenWidth').value,
    screenHeight: document.getElementById('screenHeight').value,
    colorDepth: document.getElementById('colorDepth').value,
    plugins: document.getElementById('plugins').value,
    mimeTypes: document.getElementById('mimeTypes').value,
    canvasNoise: document.getElementById('canvasNoise').checked,
    canvasPattern: document.getElementById('canvasPattern').value,
    webglVendor: document.getElementById('webglVendor').value,
    webglRenderer: document.getElementById('webglRenderer').value,
    audioInput: document.getElementById('audioInput').value,
    videoInput: document.getElementById('videoInput').value,
    cookies: document.getElementById('cookies').value,
    // New canvas and fingerprint options
    canvasFingerprint: document.getElementById('canvasFingerprint').value,
    webglFingerprint: document.getElementById('webglFingerprint').value,
    touchSupport: document.getElementById('touchSupport').checked,
    deviceMemory: document.getElementById('deviceMemory').value,
    // Add more as needed
  };
}

// Load configuration into input fields
function loadConfig(config) {
  if (!config) return;
  document.getElementById('userAgent').value = config.userAgent || '';
  document.getElementById('languages').value = config.languages || '';
  document.getElementById('hardwareConcurrency').value = config.hardwareConcurrency || '';
  document.getElementById('deviceMemory').value = config.deviceMemory || '';
  document.getElementById('pixelRatio').value = config.pixelRatio || '';
  document.getElementById('screenWidth').value = config.screenWidth || '';
  document.getElementById('screenHeight').value = config.screenHeight || '';
  document.getElementById('colorDepth').value = config.colorDepth || '';
  document.getElementById('plugins').value = config.plugins || '';
  document.getElementById('mimeTypes').value = config.mimeTypes || '';
  document.getElementById('canvasNoise').checked = config.canvasNoise || false;
  document.getElementById('canvasPattern').value = config.canvasPattern || '';
  document.getElementById('webglVendor').value = config.webglVendor || '';
  document.getElementById('webglRenderer').value = config.webglRenderer || '';
  document.getElementById('audioInput').value = config.audioInput || '';
  document.getElementById('videoInput').value = config.videoInput || '';
  document.getElementById('cookies').value = config.cookies || '';
  // New
  document.getElementById('canvasFingerprint').value = config.canvasFingerprint || '';
  document.getElementById('webglFingerprint').value = config.webglFingerprint || '';
  document.getElementById('touchSupport').checked = config.touchSupport || false;
}

// Save current settings to localStorage and cookies
function saveSettings() {
  const config = getCurrentConfig();
  localStorage.setItem('savedConfig', JSON.stringify(config));
  const cookieStr = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('; ');
  document.cookie = `fingerprintConfig=${encodeURIComponent(cookieStr)}; path=/; max-age=31536000`;
  showStatus('Settings saved.');
}

// Clear saved settings
function clearSettings() {
  localStorage.removeItem('savedConfig');
  document.cookie = "fingerprintConfig=; Max-Age=0; path=/";
  showStatus('Settings cleared.');
}

// Apply current configuration and send to content script
function applyCurrentSettings() {
  const config = getCurrentConfig();
  saveRecent(config);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.sendMessage({ action: 'applySettings', settings: config });
      showStatus('Settings applied.');
    }
  });
}

// Load preset or recent configuration
function applyPreset(presetName) {
  if (presetName === 'recent') {
    const recent = loadRecent();
    if (recent) {
      loadConfig(recent);
      showStatus('Recent configuration loaded.');
    } else {
      showStatus('No recent configuration found.');
    }
  } else if (presetName.startsWith('preset')) {
    // Define preset configurations here if needed
    showStatus(`Preset "${presetName}" selected (not implemented).`);
  } else {
    showStatus(`Preset "${presetName}" not found.`);
  }
}

// Show status message
function showStatus(msg) {
  const statusDiv = document.getElementById('status');
  statusDiv.innerText = msg;
  setTimeout(() => { statusDiv.innerText = ''; }, 3000);
}

// Import settings from textarea input
function importSettings() {
  const textarea = document.getElementById('importTextarea').value.trim();
  const format = document.getElementById('importFormat').value;
  let config = null;

  if (format === 'json') {
    try {
      config = JSON.parse(textarea);
    } catch (e) {
      alert('Invalid JSON format.');
      return;
    }
  } else if (format === 'netscape') {
    config = {};
    const pairs = textarea.split(';');
    pairs.forEach(pair => {
      const [k, v] = pair.trim().split('=');
      if (k && v !== undefined) {
        config[k.trim()] = v.trim();
      }
    });
  }

  if (config) {
    loadConfig(config);
    showStatus('Settings imported.');
  }
}

// Export current config in Netscape format
function exportNetscape() {
  const config = getCurrentConfig();
  const str = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('; ');
  prompt('Netscape format:', str);
}

// Export JSON
function exportJson() {
  const config = getCurrentConfig();
  const jsonStr = JSON.stringify(config, null, 2);
  prompt('JSON format:', jsonStr);
}

// Event bindings
document.getElementById('setBtn').addEventListener('click', () => {
  saveSettings();
});
document.getElementById('clearBtn').addEventListener('click', () => {
  clearSettings();
});
document.getElementById('applyBtn').addEventListener('click', () => {
  applyCurrentSettings();
});
document.getElementById('presetSelect').addEventListener('change', (e) => {
  applyPreset(e.target.value);
});
document.getElementById('importBtn').addEventListener('click', () => {
  importSettings();
});
document.getElementById('exportNetscapeBtn').addEventListener('click', () => {
  exportNetscape();
});
document.getElementById('exportJsonBtn').addEventListener('click', () => {
  exportJson();
});

// Initialize form with saved or recent settings
function init() {
  const saved = localStorage.getItem('savedConfig');
  if (saved) {
    loadConfig(JSON.parse(saved));
  } else {
    const cookiesConfig = loadCookies();
    if (cookiesConfig) {
      loadConfig(cookiesConfig);
    }
  }
  const recent = loadRecent();
  if (recent) {
    loadConfig(recent);
  }
}
init();
