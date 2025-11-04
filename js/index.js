let API_ENDPOINT = null

document.addEventListener('DOMContentLoaded', init)

async function init() {
	const usernameInput = document.querySelector('.input-wrapper input[type="text"]')
	const passwordInput = document.querySelector('.input-wrapper input[type="password"]')

	const storedUsername = localStorage.getItem('username')
	const storedPwd = localStorage.getItem('pwd')

	if (storedUsername) usernameInput.value = storedUsername
	if (storedPwd) passwordInput.value = storedPwd

	const loginBtn = document.getElementById('loginBtn')
	loginBtn.addEventListener('click', handleLogin)
}

try {
	const config = await import('../config.js')
	if (config?.default?.API_ENDPOINT && typeof config.default.API_ENDPOINT === 'string') {
		API_ENDPOINT = config.default.API_ENDPOINT.trim()
	} else {
		throw new Error('Invalid config: API_ENDPOINT missing or not a string')
	}
} catch (err) {
	console.error('Config load error:', err)
	alert(
		`❌ Missing or invalid config.js file.\n\n` +
			`👉 NOTE: The API is only needed for login through the extension's popup.\n` +
			`Other features of this extension will still work normally.\n\n` +
			`If you wish to enable popup login, please create a file:\n` +
			`"config.js" with the following content:\n\n` +
			`export default {\n    API_ENDPOINT: "https://your-server-domain/api"\n};`
	)
}

async function handleLogin() {
	if (!API_ENDPOINT || !/^https?:\/\/.+/i.test(API_ENDPOINT)) {
		alert(
			`⚠️ Invalid API endpoint.\n\n` +
				`Please ensure "config.js" exists and contains:\n` +
				`export default {\n    API_ENDPOINT: "https://your-api-url"\n};`
		)
		return
	}

	const username = document.querySelector('.input-wrapper input[type="text"]').value
	const pwd = document.querySelector('.input-wrapper input[type="password"]').value

	if (!username || !pwd) {
		alert('Please enter username and password')
		return
	}

	const maxRetries = 5
	let attempts = 0

	while (attempts < maxRetries) {
		try {
			const response = await fetch(`${API_ENDPOINT}/login/autocaptcha`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, pwd }),
			})

			const data = await response.json()

			if (data.error) {
				if (data.error.toLowerCase().includes('invalid csrf')) {
					attempts++
					console.log(`Invalid CSRF token, retrying... (${attempts}/${maxRetries})`)
					continue
				} else {
					alert('Login failed: ' + data.error)
					return
				}
			}

			const newJsessId = data.cookies?.find((c) => c.key === 'JSESSIONID')?.value

			if (!newJsessId) {
				alert('Login failed: JSESSIONID not found')
				return
			}

			localStorage.setItem('username', username)
			localStorage.setItem('pwd', pwd)
			localStorage.setItem('JSESSIONID', newJsessId)
			console.log('login success')

			chrome.cookies.set(
				{
					url: 'https://vtop.vitap.ac.in',
					name: 'JSESSIONID',
					value: newJsessId,
					path: '/vtop',
					secure: true,
					httpOnly: true,
				},
				(cookie) => {
					if (chrome.runtime.lastError) {
						console.error('Cookie error:', chrome.runtime.lastError)
					} else {
						console.log('Cookie set successfully:', cookie)
						window.open('https://vtop.vitap.ac.in/vtop/content?')
					}
				}
			)
			return
		} catch (err) {
			console.error('Login error:', err)
			alert('An error occurred while logging in. Check console for details.')
			return
		}
	}

	alert('Login failed: Could not obtain a valid CSRF token after 5 attempts')
}
