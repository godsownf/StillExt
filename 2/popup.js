/* Optimized popup.js - High Verbosity */

const FIELDS = [
  'userAgent', 'platform', 'vendor', 'appName', 'product', 'productSub',
  'languages', 'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints',
  'screenWidth', 'screenHeight', 'pixelRatio', 'colorDepth', 'pixelDepth',
  'webglVendor', 'webglRenderer', 'canvasNoiseLevel', 'canvasFingerprint',
  'geoLat', 'geoLon'
];

const CHECKBOXES = [
  'canvasNoise', 'doNotTrack', 'cookieEnabled', 'hideWebdriver', 'touchSupport', 'spoofGeo'
];

const statusDiv = document.getElementById('status');

// Load config from cookies
function loadCookies() {
  const match = document.cookie.match(/fingerprintConfig=([^;]+)/);
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match[1]);
    const config = {};
    raw.split(';').forEach(pair => {
      const [k, v] = pair.trim().split('=');
      if (k && v !== undefined) config[k.trim()] = v.trim();
    });
    return config;
  } catch (e) {
    return null;
  }
}

// Recent config
function loadRecent() {
  const recent = localStorage.getItem('recentConfig');
  return recent ? JSON.parse(recent) : null;
}
function saveRecent(config) {
  localStorage.setItem('recentConfig', JSON.stringify(config));
}

// Get current UI config
function getCurrentConfig() {
  return {
    userAgent: document.getElementById('userAgent').value,
    platform: document.getElementById('platform').value,
    vendor: document.getElementById('vendor').value,
    appName: document.getElementById('appName').value,
    product: document.getElementById('product').value,
    productSub: document.getElementById('productSub').value,
    languages: document.getElementById('languages').value,
    hardwareConcurrency: document.getElementById('hardwareConcurrency').value,
    deviceMemory: document.getElementById('deviceMemory').value,
    maxTouchPoints: document.getElementById('maxTouchPoints').value,
    screenWidth: document.getElementById('screenWidth').value,
    screenHeight: document.getElementById('screenHeight').value,
    pixelRatio: document.getElementById('pixelRatio').value,
    colorDepth: document.getElementById('colorDepth').value,
    pixelDepth: document.getElementById('pixelDepth').value,
    webglVendor: document.getElementById('webglVendor').value,
    webglRenderer: document.getElementById('webglRenderer').value,
    canvasNoise: document.getElementById('canvasNoise').checked,
    canvasNoiseLevel: document.getElementById('canvasNoiseLevel').value,
    canvasFingerprint: document.getElementById('canvasFingerprint').value,
    doNotTrack: document.getElementById('doNotTrack').checked,
    cookieEnabled: document.getElementById('cookieEnabled').checked,
    hideWebdriver: document.getElementById('hideWebdriver').checked,
    touchSupport: document.getElementById('touchSupport').checked,
    geoLat: document.getElementById('geoLat').value,
    geoLon: document.getElementById('geoLon').value,
    spoofGeo: document.getElementById('spoofGeo').checked
  };
}

// Load config into UI
function loadConfig(config) {
  if (!config) return;
  const fields = [
    'userAgent', 'platform', 'vendor', 'appName', 'product', 'productSub',
    'languages', 'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints',
    'screenWidth', 'screenHeight', 'pixelRatio', 'colorDepth', 'pixelDepth',
    'webglVendor', 'webglRenderer', 'canvasNoiseLevel', 'canvasFingerprint',
    'geoLat', 'geoLon'
  ];

  fields.forEach(fid => {
    const el = document.getElementById(fid);
    if (el) el.value = config[fid] || '';
  });

  document.getElementById('canvasNoise').checked = !!config.canvasNoise;
  document.getElementById('doNotTrack').checked = !!config.doNotTrack;
  document.getElementById('cookieEnabled').checked = !!config.cookieEnabled;
  document.getElementById('hideWebdriver').checked = !!config.hideWebdriver;
  document.getElementById('touchSupport').checked = !!config.touchSupport;
  document.getElementById('spoofGeo').checked = !!config.spoofGeo;
}

// Load config into UI explicitly
function loadConfigIntoUI(config) {
  if (!config) return;
  FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && config[id] !== undefined) {
      el.value = config[id];
    }
  });
  CHECKBOXES.forEach(id => {
    const el = document.getElementById(id);
    if (el && config[id] !== undefined) {
      el.checked = !!config[id];
    }
  });
}

// Handle preset change
async function handlePresetChange(presetKey) {
  if (!presetKey) return;
  if (presetKey === 'recent') {
    const recent = JSON.parse(localStorage.getItem('recentConfig') || 'null');
    if (recent) loadConfigIntoUI(recent);
    showStatus('Loaded recent settings');
    return;
  }
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getProfiles' });
    if (response.profiles && response.profiles[presetKey]) {
      const selectedProfile = response.profiles[presetKey];
      loadConfigIntoUI(selectedProfile.settings);
      showStatus(`Profile: ${selectedProfile.name} loaded`);
    }
  } catch (error) {
    showStatus('Error loading profile', 'red');
    console.error(error);
  }
}

// Show status message
function showStatus(msg) {
  statusDiv.innerText = msg;
  statusDiv.style.color = '#5b7fff';
  setTimeout(() => {
    statusDiv.innerText = 'Ready';
    statusDiv.style.color = '';
  }, 3000);
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', async () => {
  // Load last saved config
  const saved = localStorage.getItem('savedConfig');
  if (saved) {
    loadConfigIntoUI(JSON.parse(saved));
  } else {
    handlePresetChange('chrome_win');
    document.getElementById('presetSelect').value = 'chrome_win';
  }

  // Preset dropdown
  document.getElementById('presetSelect').addEventListener('change', (e) => {
    handlePresetChange(e.target.value);
  });

  // Buttons
  document.getElementById('setBtn').onclick = saveSettings;
  document.getElementById('clearBtn').onclick = clearSettings;
  document.getElementById('applyBtn').onclick = applyCurrentSettings;
  document.getElementById('importBtn').onclick = importSettings;
  document.getElementById('exportJsonBtn').onclick = exportJson;
  document.getElementById('exportNetscapeBtn').onclick = exportNetscape;

  // Tab navigation
  document.querySelectorAll('.tab-link').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-link, .tab-panel').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      const panelId = 'tab-' + btn.getAttribute('data-tab');
      document.getElementById(panelId).classList.add('active');
    };
  });
});

// Save current settings
async function saveSettings() {
  try {
    const config = getCurrentConfig();
    localStorage.setItem('savedConfig', JSON.stringify(config));
    const cookieStr = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('; ');
    document.cookie = `fingerprintConfig=${encodeURIComponent(cookieStr)}; path=/; max-age=31536000`;
    await chrome.runtime.sendMessage({ action: 'saveSettings', settings: config });
    showStatus('Settings saved.');
  } catch (error) {
    showStatus('Error saving settings', 'red');
    console.error(error);
  }
}

// Clear settings
function clearSettings() {
  localStorage.removeItem('savedConfig');
  document.cookie = "fingerprintConfig=; Max-Age=0; path=/";
  showStatus('Settings cleared.');
}

// Apply all settings with resistance techniques
async function applyCurrentSettings() {
  try {
    const config = getCurrentConfig();
    saveRecent(config);
    await applyAllResistances();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: (s) => window.dispatchEvent(new CustomEvent('applySettingsEvent', { detail: s })),
        args: [config],
      });
    }
    showStatus('Settings applied.');
  } catch (error) {
    showStatus('Error applying settings', 'red');
    console.error(error);
  }
}

// --- RESISTANCE TECHNIQUES ---

async function applyAllResistances() {
  // Canvas Noise
  if (document.getElementById('canvasNoise').checked) {
    const noiseLevel = parseInt(document.getElementById('canvasNoiseLevel').value, 10) || 5;
    const fingerprintCanvas = document.getElementById('fingerprintCanvas');
    if (fingerprintCanvas) {
      injectCanvasNoise(fingerprintCanvas, noiseLevel);
    }
  }

  // WebGL Spoofing
  if (document.getElementById('hideWebdriver').checked) {
    const vendor = document.getElementById('webglVendor').value || 'FakeVendor';
    const renderer = document.getElementById('webglRenderer').value || 'FakeRenderer';
    spoofWebGLVendorAndRenderer(vendor, renderer);
  }

  // Navigator Properties Spoof
  const navigatorProperties = {
    userAgent: document.getElementById('userAgent').value,
    platform: document.getElementById('platform').value,
    vendor: document.getElementById('vendor').value,
    appName: document.getElementById('appName').value,
    product: document.getElementById('product').value,
    productSub: document.getElementById('productSub').value,
    languages: document.getElementById('languages').value,
    hardwareConcurrency: parseInt(document.getElementById('hardwareConcurrency').value, 10),
    deviceMemory: parseInt(document.getElementById('deviceMemory').value, 10),
    maxTouchPoints: parseInt(document.getElementById('maxTouchPoints').value, 10),
  };
  spoofNavigatorProperties(navigatorProperties);

  // Geolocation Spoof
  if (document.getElementById('spoofGeo').checked) {
    const lat = parseFloat(document.getElementById('geoLat').value) || 0;
    const lon = parseFloat(document.getElementById('geoLon').value) || 0;
    spoofGeolocation(lat, lon);
  }
}

function spoofWebGLVendorAndRenderer(vendor, renderer) {
  const getParameterProxy = function (original) {
    return new Proxy(original, {
      apply(target, thisArg, args) {
        const param = args[0];
        if (param === WebGLRenderingContext.VENDOR) return vendor || 'FakeVendor';
        if (param === WebGLRenderingContext.RENDERER) return renderer || 'FakeRenderer';
        return Reflect.apply(target, thisArg, args);
      }
    });
  };
  const glProto = WebGLRenderingContext.prototype;
  glProto.getParameter = getParameterProxy(glProto.getParameter);
}

function spoofNavigatorProperties(properties) {
  for (const [prop, value] of Object.entries(properties)) {
    Object.defineProperty(navigator, prop, {
      get: () => value,
      configurable: true
    });
  }
}

function spoofGeolocation(lat, lon) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition = function (success) {
      success({ coords: { latitude: lat, longitude: lon } });
    };
  }
}

function injectCanvasNoise(canvas, noiseLevel) {
  try {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.floor(Math.random() * noiseLevel);
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.error('Canvas noise injection failed:', e);
  }
}