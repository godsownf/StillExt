/* Optimized content.js - High Verbosity / Original Logic Flow */
(function () {
  'use strict';

  function def(obj, prop, val) {
    try {
      Object.defineProperty(obj, prop, {
        get: () => val,
        configurable: true,
        enumerable: true
      });
    } catch (e) { }
  }

  function applySettings(s) {
    if (!s) return;

    // --- NAVIGATOR OVERRIDES ---
    if (s.userAgent) def(navigator, 'userAgent', s.userAgent);
    if (s.platform) def(navigator, 'platform', s.platform);
    if (s.appName) def(navigator, 'appName', s.appName);
    if (s.appVersion) def(navigator, 'appVersion', s.appVersion);
    if (s.product) def(navigator, 'product', s.product);
    if (s.productSub) def(navigator, 'productSub', s.productSub);
    if (s.vendor) def(navigator, 'vendor', s.vendor);

    if (s.languages) {
      const langs = s.languages.split(',').map(l => l.trim()).filter(Boolean);
      def(navigator, 'language', langs[0] || 'en-US');
      def(navigator, 'languages', Object.freeze(langs));
    }

    if (s.hardwareConcurrency) def(navigator, 'hardwareConcurrency', parseInt(s.hardwareConcurrency));
    if (s.deviceMemory) def(navigator, 'deviceMemory', parseFloat(s.deviceMemory));
    if (s.maxTouchPoints !== undefined && s.maxTouchPoints !== '') def(navigator, 'maxTouchPoints', parseInt(s.maxTouchPoints));

    // --- PRIVACY & AUTOMATION ---
    if (s.doNotTrack !== undefined) def(navigator, 'doNotTrack', s.doNotTrack ? '1' : null);
    if (s.cookieEnabled !== undefined) def(navigator, 'cookieEnabled', s.cookieEnabled === true || s.cookieEnabled === 'true');
    if (s.pdfViewerEnabled !== undefined) def(navigator, 'pdfViewerEnabled', s.pdfViewerEnabled === true || s.pdfViewerEnabled === 'true');

    if (s.hideWebdriver) {
      def(navigator, 'webdriver', false);
      try {
        if (navigator.__proto__) delete navigator.__proto__.webdriver;
      } catch (e) { }
    }

    if (s.hideAutomation) {
      const automationKeys = [
        'cdc_adoQpoasnfa76pfcZLmcfl_Array',
        'cdc_adoQpoasnfa76pfcZLmcfl_Promise',
        'cdc_adoQpoasnfa76pfcZLmcfl_Symbol'
      ];
      automationKeys.forEach(key => {
        try { delete window[key]; } catch (e) { }
      });
      if (!window.chrome) {
        window.chrome = {
          runtime: {},
          loadTimes: function () { },
          csi: function () { },
          app: {}
        };
      }
    }

    // --- SCREEN & WINDOW ---
    if (s.screenWidth) def(screen, 'width', parseInt(s.screenWidth));
    if (s.screenHeight) def(screen, 'height', parseInt(s.screenHeight));
    if (s.colorDepth) def(screen, 'colorDepth', parseInt(s.colorDepth));
    if (s.pixelDepth) def(screen, 'pixelDepth', parseInt(s.pixelDepth));
    if (s.availWidth) def(screen, 'availWidth', parseInt(s.availWidth));
    if (s.availHeight) def(screen, 'availHeight', parseInt(s.availHeight));
    if (s.pixelRatio) def(window, 'devicePixelRatio', parseFloat(s.pixelRatio));
    if (s.outerWidth) def(window, 'outerWidth', parseInt(s.outerWidth));
    if (s.outerHeight) def(window, 'outerHeight', parseInt(s.outerHeight));
    if (s.innerWidth) def(window, 'innerWidth', parseInt(s.innerWidth));
    if (s.innerHeight) def(window, 'innerHeight', parseInt(s.innerHeight));

    if (s.screenX !== undefined && s.screenX !== '') {
      def(window, 'screenX', parseInt(s.screenX));
      def(window, 'screenLeft', parseInt(s.screenX));
    }
    if (s.screenY !== undefined && s.screenY !== '') {
      def(window, 'screenY', parseInt(s.screenY));
      def(window, 'screenTop', parseInt(s.screenY));
    }

    // --- WEBGL ---
    if (s.webglVendor || s.webglRenderer || s.webglVersion || s.webglGlsl) {
      const glWrap = (proto) => {
        if (!proto) return;
        const orig = proto.getParameter;
        proto.getParameter = function (param) {
          if (s.webglVendor && param === 37446) return s.webglVendor;
          if (s.webglRenderer && param === 37445) return s.webglRenderer;
          if (s.webglVersion && param === 7938) return s.webglVersion;
          if (s.webglGlsl && param === 35724) return s.webglGlsl;
          return orig.call(this, param);
        };
      };
      if (typeof WebGLRenderingContext !== 'undefined') glWrap(WebGLRenderingContext.prototype);
      if (typeof WebGL2RenderingContext !== 'undefined') glWrap(WebGL2RenderingContext.prototype);
    }

    // --- CANVAS NOISE ---
    if (s.canvasNoise) {
      const amount = parseFloat(s.canvasNoiseLevel) || 0.1;

      const wrapCanvas = (proto, func) => {
        const orig = proto[func];
        proto[func] = function () {
          addCanvasNoise(this, amount, s.canvasFingerprint);
          return orig.apply(this, arguments);
        };
      };

      wrapCanvas(HTMLCanvasElement.prototype, 'toDataURL');
      wrapCanvas(HTMLCanvasElement.prototype, 'toBlob');

      const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function (x, y, w, h) {
        const imgData = origGetImageData.call(this, x, y, w, h);
        noiseImageData(imgData, amount, s.canvasFingerprint);
        return imgData;
      };
    }

    // --- AUDIO NOISE ---
    if (s.audioNoise) {
      const amount = parseFloat(s.audioNoiseLevel) || 0.0001;
      const audioFuncs = ['getFloatFrequencyData', 'getByteFrequencyData'];
      audioFuncs.forEach(func => {
        if (typeof AnalyserNode !== 'undefined') {
          const orig = AnalyserNode.prototype[func];
          AnalyserNode.prototype[func] = function (arr) {
            orig.call(this, arr);
            for (let i = 0; i < arr.length; i++) {
              const noise = (Math.random() * 2 - 1) * amount;
              if (func.includes('Byte')) {
                arr[i] = Math.max(0, Math.min(255, arr[i] + Math.round(noise * 255)));
              } else {
                arr[i] = arr[i] + noise;
              }
            }
          };
        }
      });
    }

    // --- PLUGINS & MIME TYPES ---
    if (s.plugins) {
      const names = s.plugins.split(',').map(p => p.trim()).filter(Boolean);
      const list = names.map(n => ({
        name: n,
        filename: n.toLowerCase().replace(/\s+/g, '_') + '.dll',
        description: n,
        length: 1
      }));
      def(navigator, 'plugins', Object.assign(list, {
        refresh: () => { },
        item: i => list[i],
        namedItem: n => list.find(p => p.name === n)
      }));
    }

    if (s.mimeTypes) {
      const types = s.mimeTypes.split(',').map(m => m.trim()).filter(Boolean);
      const list = types.map(t => ({
        type: t,
        suffixes: t.split('/')[1] || '',
        description: t,
        enabledPlugin: null
      }));
      def(navigator, 'mimeTypes', Object.assign(list, {
        item: i => list[i],
        namedItem: n => list.find(m => m.type === n)
      }));
    }

    // --- GEOLOCATION ---
    if (s.spoofGeo && s.geoLat && s.geoLon) {
      const pos = {
        coords: {
          latitude: parseFloat(s.geoLat),
          longitude: parseFloat(s.geoLon),
          accuracy: parseFloat(s.geoAccuracy) || 10
        },
        timestamp: Date.now()
      };
      navigator.geolocation.getCurrentPosition = (success) => success(pos);
      navigator.geolocation.watchPosition = (success) => { success(pos); return 0; };
    }
  }

  function seededRandom(seed) {
    let s = (seed || "").split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 2147483647;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
  }

  function addCanvasNoise(canvas, amount, seed) {
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        noiseImageData(data, amount, seed);
        ctx.putImageData(data, 0, 0);
      }
    } catch (e) { }
  }

  function noiseImageData(imgData, amount, seed) {
    const rand = seed ? seededRandom(seed) : Math.random;
    const data = imgData.data;
    const intensity = Math.floor(amount * 10) || 1;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.floor((rand() * 2 - 1) * intensity);
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  // Communications bridge
  window.addEventListener('applySettingsEvent', (e) => applySettings(e.detail));

  // Persistence Load
  chrome.storage.sync.get(['savedSettings'], (res) => {
    if (res.savedSettings) applySettings(res.savedSettings);
  });
})();