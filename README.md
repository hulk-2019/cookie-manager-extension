English | [简体中文](/README_zh.md)

# 🎨 Cookie Manager Extension

<div align="center">
  <img src="/public/example.png" alt="Cookie Manager Extension" width="400"/>
  <br>
  <br>
</div>

---

A powerful browser extension for managing website cookies with support for adding, editing, deleting, clearing, and batch importing cookies.

## Features

- 🍪 **Cookie Management**: View, add, edit, and delete cookies for any website
- ⚡ **Batch Import**: Import multiple cookies at once via JSON format
- 🌍 **Internationalization**: Support English and Chinese (switchable)
- 🔍 **Search Functionality**: Quickly find cookies by name
- 🌐 **Domain Support**: Manage cookies across different domains and subdomains
- ⚡ **Batch Operations**: Clear all cookies at once with one click
- 🎨 **Modern UI**: Clean and intuitive popup interface with card style design
- 🔒 **Advanced Options**: Support for Secure, HttpOnly, and SameSite attributes
- 📅 **Expiration Control**: Set custom expiration dates for cookies
- 🔄 **Real-time Updates**: Refresh cookie list instantly

## Installation

### Chrome/Edge
1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your browser toolbar

### Firefox
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select the `manifest.json` file from the extension directory
5. The extension will be loaded temporarily

## Usage

1. **Open the Extension**: Click the cookie icon in your browser toolbar
2. **View Cookies**: The popup will show all cookies for the current website
3. **Switch Language**: Click "中文 / EN" in the header to switch language
4. **Search Cookies**: Use the search box to filter cookies by name
5. **Add New Cookie**: Click "+ Add Cookie" button and fill in the details
6. **Batch Import**: Click "Import Cookies" to import JSON data (Format: `[{"name":"c1","value":"v1"},...]`)
7. **Edit Cookie**: Click on any existing cookie to modify its properties
8. **Delete Cookie**: Click the delete button next to any cookie
9. **Clear All**: Use "Clear All" button to remove all cookies for the current site
10. **Refresh**: Click "Refresh" to update the cookie list

## Cookie Properties

When adding or editing cookies, you can configure:

- **Name**: Cookie identifier (required)
- **Value**: Cookie data (required)
- **Domain**: Cookie domain scope
- **Path**: URL path where cookie is valid
- **Expires**: Expiration date and time
- **Secure**: Only transmit over HTTPS
- **HttpOnly**: Prevent client-side access
- **SameSite**: CSRF protection level (None/Lax/Strict)
- **Session Cookie**: Create session-only cookie

## Permissions

The extension requires the following permissions:

- `cookies`: Access and modify browser cookies
- `activeTab`: Access current tab information
- `storage`: Store extension settings (like language preference)
- `*://*/*`: Access cookies across all websites

## Development

### File Structure
```
cookie-manager-extension/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── popup.html            # Popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── icon16.png            # 16x16 extension icon
├── icon48.png            # 48x48 extension icon
└── icon128.png           # 128x128 extension icon
```

### Technologies Used
- HTML5, CSS3, JavaScript (ES6+)
- Chrome Extension Manifest V3
- Browser Cookies API

## Browser Support

- ✅ Chrome (Manifest V3)
- ✅ Edge (Manifest V3)
- ⚠️ Firefox (Manifest V2/V3 - may require adjustments)

## Privacy & Security

- All cookie operations are performed locally in your browser
- No data is sent to external servers
- Extension only accesses cookies for websites you visit
- Follows browser extension security best practices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This extension is designed for developers and advanced users who need to manage cookies for testing and development purposes. Always be cautious when modifying cookies on production websites.
