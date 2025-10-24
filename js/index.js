import config from '../config.js' // default import
const API_ENDPOINT = config.API_ENDPOINT

document.addEventListener('DOMContentLoaded', () => {
	const usernameInput = document.querySelector('.input-wrapper input[type="text"]')
	const passwordInput = document.querySelector('.input-wrapper input[type="password"]')

	const storedUsername = localStorage.getItem('username')
	const storedPwd = localStorage.getItem('pwd')

	if (storedUsername) usernameInput.value = storedUsername
	if (storedPwd) passwordInput.value = storedPwd

	const loginBtn = document.getElementById('loginBtn')
	loginBtn.addEventListener('click', handleLogin)
})

async function handleLogin() {
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
					console.warn(`Invalid CSRF token, retrying... (${attempts}/${maxRetries})`)
					continue // retry
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
		} catch (err) {
			console.error('Login error:', err)
			alert('An error occurred while logging in. Check console for details.')
			return
		}
	}

	alert('Login failed: Could not obtain a valid CSRF token after 5 attempts')
}
