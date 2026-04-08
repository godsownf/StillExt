# 🛡️ StillExt — Advanced Browser Fingerprint & Storage Controller

StillExt is a powerful browser extension for managing and spoofing browser identity, controlling storage, and editing cookies — all in one place.

🔗 Repository: https://github.com/godsownf/StillExt

---

## ⚙️ Core Functionality

StillExt gives you deep control over how websites see and store your data.

### 🧬 Fingerprint & Profile Spoofing
- Modify browser fingerprint data
- Spoof user agent, platform, and device details
- Reduce trackability across websites
- Simulate different browser environments

---

### 🍪 Cookies Management
- View and edit cookies in real time  
- Add, delete, or modify cookie values  
- Control session and persistent cookies  
- Useful for testing, debugging, and privacy control  

---

### 💾 Storage Control
- Inspect and edit:
  - Local Storage  
  - Session Storage  
- Modify key-value pairs directly  
- Clear or override stored data per site  

---

### 🔄 Settings Import / Export
- Export your configuration as a file  
- Import settings instantly across browsers or sessions  
- Maintain consistent spoofing profiles  

---

## 🚀 Use Cases

- 🕵️ Privacy enhancement and anti-tracking  
- 🧪 Web testing and debugging  
- 🔐 Session and authentication testing  
- 🌍 Simulating different users/environments  
- ⚙️ Development and QA workflows  

---

## 🧩 Installation

1. Clone the repository:
   git clone https://github.com/godsownf/StillExt.git  

2. Open your browser:
   chrome://extensions/  

3. Enable Developer Mode  

4. Click Load unpacked  

5. Select the project folder  

---

## 🛠️ How It Works

- Uses browser extension APIs to intercept and modify requests  
- Overrides fingerprint-related properties in the browser environment  
- Provides direct access to cookies and storage APIs  
- Applies changes locally without external servers  

---

## 📁 Key Components

- manifest.json → Extension configuration and permissions  
- scripts/ → Fingerprint spoofing and logic injection  
- storage handlers → Local/session storage manipulation  
- cookie manager → Cookie read/write/edit logic  
- popup/settings → UI for controlling behavior  

---

## 🔒 Privacy

- Runs locally in your browser  
- No external data transmission (unless explicitly added)  
- Full control stays with the user  

---

## ⚠️ Disclaimer

This extension modifies browser identity and storage behavior.

- Some websites may break or behave unexpectedly  
- Use responsibly and only where permitted  
- Not intended for bypassing security or violating terms of service  

---

## 🧪 Future Improvements

- Per-site spoofing profiles  
- One-click profile switching  
- Advanced fingerprint randomization  
- Backup encryption for exported settings  

---

## 🐞 Issues

If you encounter bugs or unexpected behavior:

- Open an issue  
- Include:
  - Website URL  
  - What was modified (cookies/storage/fingerprint)  
  - Expected vs actual behavior  

---

## 📄 License

Not specified yet (MIT recommended)
