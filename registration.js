;(async () => {
	const { solveCaptcha } = await import(chrome.runtime.getURL('js/captcha/captchaSolver.js'))

	const captchaStr =
		document.getElementById('captchaString') || document.getElementById('captchaStringProgInfo')
	if (!captchaStr) return
	console.log(
		'%cBetterVTOP%c%c online',
		'color: #0a8dea; font-size: 18px; font-weight: bold;',
		'color: #FFFFFF; font-size: 14px;',
		'color: #1BE400FF; font-size: 14px; font-style: italic;'
	)

	async function getCaptchaBV() {
		return new Promise((resolve) => {
			const check = () => {
				const img = document.getElementById('captcha_id')
				if (img && img.src) resolve(img.src)
				else resolve(null)
			}
			check()
		})
	}

	const src = await getCaptchaBV()
	if (!src) return
	captchaStr.value = await solveCaptcha(src)
})()
