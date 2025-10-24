# Better VTOP

Better VTOP is a Chrome extension designed to enhance the VTOP experience for VIT-AP students. It simplifies login, handles captchas automatically, and provides a sleek user interface for a smoother workflow.

---

## Features

- Auto-fill VTOP credentials
- Automatic captcha solving
- Stylish, modern UI for login

---

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/sathwikv2005/BetterVTOP.git
   ```

2. Navigate to `chrome://extensions/` in Chrome.

3. Enable **Developer mode**.

4. Click **Load unpacked** and select the `BetterVTOP` folder.

---

## Configuration

The extension requires an API endpoint for handling login and captcha.

1. Create a `config.js` file in the project root.
2. Add your API endpoint as follows:

```javascript
export default {
	API_ENDPOINT: 'https://your-api-endpoint-here',
}
```

> You can use the open-source API provided:
> [BetterVTOP API](https://github.com/sathwikv2005/BetterVTOP-VITAP)

---

## Usage

1. Open the extension popup.
2. Enter your VTOP username and password.
3. Click **Login to VTOP**.
4. Credentials will be saved locally.
5. After successful login, you can access VTOP pages directly.

---

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve Better VTOP.

---

## License

This project is open-source and available under the MIT License.

---

## Check Out the Android App

You can also check out the BetterVTOP Android app here:
[BetterVTOP Android](https://github.com/sathwikv2005/BetterVTOP-VITAP/releases)
