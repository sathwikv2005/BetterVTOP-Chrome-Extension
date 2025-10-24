;(async () => {
	const { solveCaptcha } = await import(chrome.runtime.getURL('js/captcha/captchaSolver.js'))

	const captchaStr = document.getElementById('captchaStr')

	console.log(
		'%cBetterVTOP%c%c online',
		'color: #0a8dea; font-size: 18px; font-weight: bold;',
		'color: #FFFFFF; font-size: 14px;',
		'color: #1BE400FF; font-size: 14px; font-style: italic;'
	)

	async function getCaptchaBV() {
		return new Promise((resolve) => {
			const check = () => {
				const img = document.getElementsByClassName('form-control img-fluid')[0]
				if (img && img.src) resolve(img.src)
				else {
					const form = document.getElementById('stdForm')
					if (form) {
						form.submit()
					} else {
						const is404 = document.querySelector('h1')?.textContent.toLowerCase().includes('404')

						if (is404) {
							window.location.href = 'https://vtop.vitap.ac.in/vtop'
						} else {
							window.location.reload()
						}
					}
				}
			}
			check()
		})
	}

	const src = await getCaptchaBV()
	captchaStr.value = await solveCaptcha(src)
})()
