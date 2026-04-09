(function () {
  'use strict';

  function def(obj, prop, val) {
    try {
      Object.defineProperty(obj, prop, { 
        get: () => val, 
        set: () => {}, 
        configurable: true, 
        enumerable: true 
      });
    } catch (e) {}
  }

  function applySettings(s) {
    if (!s) return;

    // ==================== NAVIGATOR IDENTITY ====================
    if (s.userAgent) def(navigator, 'userAgent', s.userAgent);
    if (s.platform)  def(navigator, 'platform', s.platform);
    if (s.appName)   def(navigator, 'appName', s.appName);
    if (s.appVersion) def(navigator, 'appVersion', s.appVersion);
    if (s.product)   def(navigator, 'product', s.product);
    if (s.productSub) def(navigator, 'productSub', s.productSub);

    // ==================== LANGUAGES ====================
    if (s.languages) {
      const langs = s.languages.split(',').map(l => l.trim()).filter(Boolean);
      def(navigator, 'language', langs[0] || 'en-US');
      def(navigator, 'languages', Object.freeze(langs));
    }

    // ==================== HARDWARE ====================
    if (s.hardwareConcurrency) def(navigator, 'hardwareConcurrency', parseInt(s.hardwareConcurrency));
    if (s.deviceMemory)        def(navigator, 'deviceMemory', parseFloat(s.deviceMemory));
    if (s.maxTouchPoints !== undefined && s.maxTouchPoints !== '')
      def(navigator, 'maxTouchPoints', parseInt(s.maxTouchPoints));

    // ==================== PRIVACY FLAGS ====================
    if (s.doNotTrack !== undefined) def(navigator, 'doNotTrack', s.doNotTrack ? '1' : null);
    if (s.cookieEnabled !== undefined) def(navigator, 'cookieEnabled', s.cookieEnabled === true || s.cookieEnabled === 'true');
    if (s.pdfViewerEnabled !== undefined) def(navigator, 'pdfViewerEnabled', s.pdfViewerEnabled === true || s.pdfViewerEnabled === 'true');

    if (s.hideWebdriver) {
      def(navigator, 'webdriver', false);
      try { delete navigator.__proto__.webdriver; } catch (e) {}
    }

    if (s.hideAutomation) {
      try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array; } catch (e) {}
      try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise; } catch (e) {}
      try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol; } catch (e) {}
      if (!window.chrome) {
        window.chrome = { runtime: {}, loadTimes: function () {}, csi: function () {}, app: {} };
      }
    }

    // ==================== SCREEN ====================
    if (s.screenWidth)  def(screen, 'width', parseInt(s.screenWidth));
    if (s.screenHeight) def(screen, 'height', parseInt(s.screenHeight));
    if (s.colorDepth)   def(screen, 'colorDepth', parseInt(s.colorDepth));
    if (s.pixelDepth)   def(screen, 'pixelDepth', parseInt(s.pixelDepth));
    if (s.availWidth)   def(screen, 'availWidth', parseInt(s.availWidth));
    if (s.availHeight)  def(screen, 'availHeight', parseInt(s.availHeight));
    if (s.pixelRatio)   def(window, 'devicePixelRatio', parseFloat(s.pixelRatio));
    if (s.outerWidth)   def(window, 'outerWidth', parseInt(s.outerWidth));
    if (s.outerHeight)  def(window, 'outerHeight', parseInt(s.outerHeight));
    if (s.innerWidth)   def(window, 'innerWidth', parseInt(s.innerWidth));
    if (s.innerHeight)  def(window, 'innerHeight', parseInt(s.innerHeight));
    if (s.screenX !== undefined && s.screenX !== '') {
      def(window, 'screenX', parseInt(s.screenX));
      def(window, 'screenLeft', parseInt(s.screenX));
    }
    if (s.screenY !== undefined && s.screenY !== '') {
      def(window, 'screenY', parseInt(s.screenY));
      def(window, 'screenTop', parseInt(s.screenY));
    }

    // ==================== TOUCH ====================
    if (s.touchSupport) {
      def(navigator, 'maxTouchPoints', parseInt(s.maxTouchPoints) || 5);
      def(window, 'ontouchstart', null);
      def(window, 'ontouchmove', null);
      def(window, 'ontouchend', null);
    }

    // ==================== WEBGL ====================
    if (s.webglVendor || s.webglRenderer || s.webglVersion || s.webglGlsl) {
      const getParameter_orig = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (param) {
        if (s.webglVendor && param === 37446) return s.webglVendor;
        if (s.webglRenderer && param === 37445) return s.webglRenderer;
        if (s.webglVersion && param === 7938) return s.webglVersion;
        if (s.webglGlsl && param === 35724) return s.webglGlsl;
        return getParameter_orig.call(this, param);
      };
      try {
        const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function (param) {
          if (s.webglVendor && param === 37446) return s.webglVendor;
          if (s.webglRenderer && param === 37445) return s.webglRenderer;
          if (s.webglVersion && param === 7938) return s.webglVersion;
          if (s.webglGlsl && param === 35724) return s.webglGlsl;
          return getParameter2.call(this, param);
        };
      } catch (e) {}
    }

    // ==================== CANVAS NOISE ====================
    if (s.canvasNoise) {
      const noiseAmt = parseFloat(s.canvasNoiseLevel) || 0.1;
      const toDataURL_orig = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
        addCanvasNoise(this, noiseAmt, s.canvasFingerprint);
        return toDataURL_orig.call(this, type, quality);
      };
      const toBlob_orig = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
        addCanvasNoise(this, noiseAmt, s.canvasFingerprint);
        return toBlob_orig.call(this, callback, type, quality);
      };
      const getImageData_orig = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function (x, y, w, h) {
        const imgData = getImageData_orig.call(this, x, y, w, h);
        noiseImageData(imgData, noiseAmt, s.canvasFingerprint);
        return imgData;
      };
    }

    // ==================== AUDIO CONTEXT NOISE ====================
    if (s.audioNoise) {
      const noiseAmt = parseFloat(s.audioNoiseLevel) || 0.0001;
      const getFloatFrequency_orig = AnalyserNode.prototype.getFloatFrequencyData;
      AnalyserNode.prototype.getFloatFrequencyData = function (arr) {
        getFloatFrequency_orig.call(this, arr);
        for (let i = 0; i < arr.length; i++) {
          arr[i] += (Math.random() * 2 - 1) * noiseAmt;
        }
      };
      const getByteFrequency_orig = AnalyserNode.prototype.getByteFrequencyData;
      AnalyserNode.prototype.getByteFrequencyData = function (arr) {
        getByteFrequency_orig.call(this, arr);
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.max(0, Math.min(255, arr[i] + Math.round((Math.random() * 2 - 1) * noiseAmt * 255)));
        }
      };
    }

    // ==================== TIMEZONE ====================
    if (s.timezone) {
      const origDateTimeFormat = Intl.DateTimeFormat;
      const tz = s.timezone;
      Intl.DateTimeFormat = function (locale, opts) {
        opts = opts || {};
        if (!opts.timeZone) opts.timeZone = tz;
        return new origDateTimeFormat(locale, opts);
      };
      Intl.DateTimeFormat.prototype = origDateTimeFormat.prototype;
      Object.defineProperty(Intl.DateTimeFormat, 'prototype', { writable: false });

      const origResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
      Intl.DateTimeFormat.prototype.resolvedOptions = function () {
        const opts = origResolvedOptions.call(this);
        opts.timeZone = tz;
        return opts;
      };
    }

    // ==================== NETWORK CONNECTION ====================
    if (s.connectionType || s.downlink || s.rtt || s.saveData !== undefined) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        if (s.connectionType) def(conn, 'effectiveType', s.connectionType);
        if (s.downlink)       def(conn, 'downlink', parseFloat(s.downlink));
        if (s.rtt)            def(conn, 'rtt', parseInt(s.rtt));
        if (s.saveData !== undefined && s.saveData !== '')
          def(conn, 'saveData', s.saveData === 'true' || s.saveData === true);
      }
    }

    // ==================== BATTERY API ====================
    if (s.spoofBattery) {
      const level       = parseFloat(s.batteryLevel) || 1.0;
      const charging    = s.batteryCharging !== 'false';
      const chargingT   = s.chargingTime === 'Infinity' || !s.chargingTime ? Infinity : parseFloat(s.chargingTime);
      const dischargingT = s.dischargingTime ? parseFloat(s.dischargingTime) : Infinity;
      const batteryObj = {
        level, charging, chargingTime: chargingT, dischargingTime: dischargingT,
        addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () {},
        onchargingchange: null, onchargingtimechange: null, ondischargingtimechange: null, onlevelchange: null,
      };
      if (navigator.getBattery) {
        navigator.getBattery = function () { return Promise.resolve(batteryObj); };
      }
    }

    // ==================== GEOLOCATION ====================
    if (s.spoofGeo && s.geoLat && s.geoLon) {
      const lat      = parseFloat(s.geoLat);
      const lon      = parseFloat(s.geoLon);
      const accuracy = parseFloat(s.geoAccuracy) || 10;
      const fakePosition = {
        coords: {
          latitude: lat, longitude: lon, accuracy,
          altitude: null, altitudeAccuracy: null, heading: null, speed: null,
        },
        timestamp: Date.now(),
      };
      navigator.geolocation.getCurrentPosition = function (success) { success(fakePosition); };
      navigator.geolocation.watchPosition = function (success) { success(fakePosition); return 0; };
    }

    // ==================== PLUGINS ====================
    if (s.plugins !== undefined && s.plugins !== '') {
      const pluginNames = s.plugins.split(',').map(p => p.trim()).filter(Boolean);
      const fakePlugins = pluginNames.map((name, i) => ({
        name, filename: name.toLowerCase().replace(/\s+/g, '_') + '.dll',
        description: name, version: '1.0.0', length: 1,
        item: function () { return null; },
        namedItem: function () { return null; },
        [Symbol.iterator]: function* () {},
      }));
      const pluginArray = Object.assign(fakePlugins, {
        length: fakePlugins.length, refresh: function () {},
        item: (i) => fakePlugins[i], namedItem: (n) => fakePlugins.find(p => p.name === n) || null,
        [Symbol.iterator]: function* () { yield* fakePlugins; },
      });
      def(navigator, 'plugins', pluginArray);
    }

    // ==================== MIME TYPES ====================
    if (s.mimeTypes !== undefined && s.mimeTypes !== '') {
      const mimes = s.mimeTypes.split(',').map(m => m.trim()).filter(Boolean);
      const mimeArray = Object.assign(mimes.map(type => ({
        type, suffixes: type.split('/')[1] || '', description: type,
        enabledPlugin: null,
      })), {
        length: mimes.length,
        item: (i) => mimeArray[i],
        namedItem: (n) => mimeArray.find(m => m.type === n) || null,
        [Symbol.iterator]: function* () { yield* mimeArray; },
      });
      def(navigator, 'mimeTypes', mimeArray);
    }
  }

  // ==================== CANVAS NOISE HELPERS ====================
  function seededRandom(seed) {
    let s = (seed || "0").split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 2147483647;
    return function () { return (s = s * 16807 % 2147483647) / 2147483647; };
  }

  function addCanvasNoise(canvas, amount, seed) {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      noiseImageData(imgData, amount, seed);
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {}
  }

  function noiseImageData(imgData, amount, seed) {
    const rand = seed ? seededRandom(seed) : Math.random;
    const data = imgData.data;
    const intensity = Math.floor(amount * 10) || 1;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.floor((rand() * 2 - 1) * intensity);
      data[i]     = Math.max(0, Math.min(255, data[i]     + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  // ==================== AUTOFILL ====================
  let _autofillProfile = null;
  const AUTOFILL_SELECTORS = {
    name: ['input[name*="name" i]','input[autocomplete*="name"]'],
    email: ['input[type="email"]','input[name*="email" i]','input[autocomplete="email"]'],
    username: ['input[name*="user" i]','input[autocomplete="username"]'],
    phone: ['input[type="tel"]','input[name*="phone" i]'],
    zip: ['input[name*="zip" i]','input[autocomplete="postal-code"]']
  };

  function fillField(el, value) {
    if (!el || !value) return;
    const nv = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (nv && nv.set) nv.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function tryAutofill(e) {
    if (!_autofillProfile) return;
    const target = e.target;
    for (const [key, selectors] of Object.entries(AUTOFILL_SELECTORS)) {
      if (selectors.some(sel => { try { return target.matches(sel); } catch { return false; } })) {
        fillField(target, _autofillProfile[key]);
        break;
      }
    }
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'applySettings') {
      applySettings(request.settings);
    } else if (request.action === 'setupAutofill') {
      _autofillProfile = request.profile;
      document.addEventListener('focus', tryAutofill, true);
    }
  });

  chrome.storage.sync.get(['savedSettings'], (result) => {
    if (result.savedSettings) applySettings(result.savedSettings);
  });
})();
