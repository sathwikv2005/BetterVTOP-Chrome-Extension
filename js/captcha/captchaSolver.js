const WIDTH = 200
const HEIGHT = 40
const LABELS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

let weights, biases

export async function loadModel() {
	if (!weights || !biases) {
		const res = await fetch(chrome.runtime.getURL('js/captcha/weights.json'))
		const data = await res.json()

		weights = data.weights.map((row) => Float32Array.from(row))
		biases = Float32Array.from(data.biases)
	}
}

function flatten(img) {
	const out = new Float32Array(img.length * img[0].length)
	let index = 0
	for (let i = 0; i < img.length; i++) {
		for (let j = 0; j < img[0].length; j++) {
			out[index++] = img[i][j]
		}
	}
	return out
}

function softmax(arr) {
	const max = Math.max(...arr)
	const exps = arr.map((x) => Math.exp(x - max))
	const sum = exps.reduce((a, b) => a + b, 0)
	return exps.map((x) => x / sum)
}

function matMul1D(input, weights, biases) {
	const out = new Float32Array(biases.length)
	for (let j = 0; j < biases.length; j++) {
		let sum = biases[j]
		for (let i = 0; i < input.length; i++) {
			sum += input[i] * weights[i][j]
		}
		out[j] = sum
	}
	return out
}

function preProcess(block) {
	let sum = 0
	for (let i = 0; i < block.length; i++) {
		for (let j = 0; j < block[0].length; j++) {
			sum += block[i][j]
		}
	}
	const avg = sum / (block.length * block[0].length)
	return block.map((row) => row.map((val) => (val > avg ? 1 : 0)))
}

function getBlocks(satArr) {
	const blocks = []
	for (let i = 0; i < 6; i++) {
		const x1 = (i + 1) * 25 + 2
		const y1 = 7 + 5 * (i % 2) + 1
		const x2 = (i + 2) * 25 + 1
		const y2 = 35 - 5 * ((i + 1) % 2)
		const block = []
		for (let y = y1; y < y2; y++) {
			const row = satArr[y].slice(x1, x2)
			block.push(row)
		}
		blocks.push(block)
	}
	return blocks
}

function saturation(data) {
	const satArr = Array.from({ length: HEIGHT }, () => new Uint8Array(WIDTH))
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i],
			g = data[i + 1],
			b = data[i + 2]
		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		const sat = max === 0 ? 0 : Math.round(((max - min) * 255) / max)
		const idx = i / 4
		const x = idx % WIDTH
		const y = Math.floor(idx / WIDTH)
		satArr[y][x] = sat
	}
	return satArr
}

export async function solveCaptcha(base64) {
	await loadModel()

	const img = new Image()
	img.crossOrigin = 'anonymous'
	img.src = base64

	await img.decode()

	const canvas = document.createElement('canvas')
	canvas.width = WIDTH
	canvas.height = HEIGHT
	const ctx = canvas.getContext('2d')
	ctx.drawImage(img, 0, 0, WIDTH, HEIGHT)

	const data = ctx.getImageData(0, 0, WIDTH, HEIGHT).data
	const sat = saturation(data)
	const blocks = getBlocks(sat)

	let captcha = ''
	for (const block of blocks) {
		const bin = preProcess(block)
		const flat = flatten(bin)
		const logits = matMul1D(flat, weights, biases)
		const probs = softmax(logits)
		const maxIdx = probs.indexOf(Math.max(...probs))
		captcha += LABELS[maxIdx]
	}
	console.log(
		'%cBetterVTOP%c\n%ccaptcha solved: %c' + captcha,
		'color: #0a8dea; font-size: 18px; font-weight: bold;',
		'color: #FFFFFF; font-size: 14px;',
		'color: #00C8DEFF; font-size: 14px; font-style: italic;',
		'color: #FFFFFF; font-size: 14px;'
	)
	return captcha.toUpperCase()
}
