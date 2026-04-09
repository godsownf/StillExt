function loadCookies() {
  const match = document.cookie.match(/fingerprintConfig=([^;]+)/);
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match[1]);
    const config = {};
    raw.split(';').forEach(pair => {
      const [k, v] = pair.trim().split('=');
      if (k) config[k.trim()] = v?.trim();
    });
    return config;
  } catch (e) { return null; }
}

function loadRecent() {
  const recent = localStorage.getItem('recentConfig');
  return recent ? JSON.parse(recent) : null;
}

function saveRecent(config) {
  localStorage.setItem('recentConfig', JSON.stringify(config));
}

function getCurrentConfig() {
  const ids = ['userAgent', 'languages', 'hardwareConcurrency', 'deviceMemory', 'pixelRatio', 'screenWidth', 'screenHeight', 'colorDepth', 'plugins', 'mimeTypes', 'webglVendor', 'webglRenderer', 'audioInput', 'videoInput', 'cookies', 'canvasFingerprint', 'webglFingerprint'];
  const config = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) config[id] = el.value;
  });
  config.canvasNoise = document.getElementById('canvasNoise').checked;
  config.touchSupport = document.getElementById('touchSupport').checked;
  return config;
}

function loadConfig(config) {
  if (!config) return;
  const ids = ['userAgent', 'languages', 'hardwareConcurrency', 'deviceMemory', 'pixelRatio', 'screenWidth', 'screenHeight', 'colorDepth', 'plugins', 'mimeTypes', 'webglVendor', 'webglRenderer', 'audioInput', 'videoInput', 'cookies', 'canvasFingerprint', 'webglFingerprint'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && config[id] !== undefined) el.value = config[id];
  });
  document.getElementById('canvasNoise').checked = !!config.canvasNoise;
  document.getElementById('touchSupport').checked = !!config.touchSupport;
}

function saveSettings() {
  const config = getCurrentConfig();
  localStorage.setItem('savedConfig', JSON.stringify(config));
  const cookieStr = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('; ');
  document.cookie = `fingerprintConfig=${encodeURIComponent(cookieStr)}; path=/; max-age=31536000`;
  showStatus('Settings saved.');
}

function clearSettings() {
  localStorage.removeItem('savedConfig');
  document.cookie = "fingerprintConfig=; Max-Age=0; path=/";
  showStatus('Settings cleared.');
}

function applyCurrentSettings() {
  const config = getCurrentConfig();
  saveRecent(config);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (settings) => chrome.runtime.sendMessage({ action: 'applySettings', settings }),
        args: [config],
      });
      showStatus('Settings applied.');
    }
  });
}

function applyPreset(presetName) {
  if (presetName === 'recent') {
    const recent = loadRecent();
    if (recent) loadConfig(recent);
  }
}

function showStatus(msg) {
  const statusDiv = document.getElementById('status');
  statusDiv.innerText = msg;
  setTimeout(() => { statusDiv.innerText = ''; }, 3000);
}

function importSettings() {
  const textarea = document.getElementById('importTextarea').value.trim();
  const format = document.getElementById('importFormat').value;
  try {
    let config = format === 'json' ? JSON.parse(textarea) : {};
    if (format !== 'json') {
      textarea.split(';').forEach(pair => {
        const [k, v] = pair.trim().split('=');
        if (k) config[k.trim()] = v.trim();
      });
    }
    loadConfig(config);
    showStatus('Settings imported.');
  } catch (e) { alert('Invalid format.'); }
}

function exportNetscape() {
  const str = Object.entries(getCurrentConfig()).map(([k, v]) => `${k}=${v}`).join('; ');
  prompt('Netscape format:', str);
}

function exportJson() {
  prompt('JSON format:', JSON.stringify(getCurrentConfig(), null, 2));
}

function keepAlive() {
  setInterval(() => { chrome.runtime.getPlatformInfo(() => {}); }, 20000);
}

document.getElementById('setBtn').addEventListener('click', saveSettings);
document.getElementById('clearBtn').addEventListener('click', clearSettings);
document.getElementById('applyBtn').addEventListener('click', applyCurrentSettings);
document.getElementById('importBtn').addEventListener('click', importSettings);
document.getElementById('exportNetscapeBtn').addEventListener('click', exportNetscape);
document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
document.getElementById('presetSelect').addEventListener('change', (e) => applyPreset(e.target.value));

function init() {
  const saved = localStorage.getItem('savedConfig');
  loadConfig(saved ? JSON.parse(saved) : loadCookies());
  keepAlive();
}
init();
