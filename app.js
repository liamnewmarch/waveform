// Audio
const audio = new AudioContext();
const analyser = new AnalyserNode(audio, {
	fftSize: 4096,
	smoothingTimeConstant: 0,
});

// Canvas
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Initialise audio graph and start
async function start() {
	const mediaStream = await navigator.mediaDevices.getUserMedia({
		audio: true,
	});
	const mediaStreamAudioSource = new MediaStreamAudioSourceNode(audio, {
		mediaStream,
	});
	mediaStreamAudioSource.connect(analyser);
	requestIdleCallback(frame);
}

// Request the next frame and call draw methods
function frame() {
	requestAnimationFrame(frame);
	shiftCanvas();
	drawFrequencyData();
}

// Shift the canvas left one pixel
function shiftCanvas() {
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context.putImageData(imageData, -1, 0);
}

// Get frequency data and draw it to the canvas
function drawFrequencyData() {
	const buffer = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(buffer);
	const imageData = new ImageData(1, buffer.length);
	for (let i = 0; i < imageData.data.length; i += 4) {
		imageData.data[i + 0] = 0xff;
		imageData.data[i + 1] = 0xff;
		imageData.data[i + 2] = 0xff;
		imageData.data[i + 3] = Math.abs(buffer[i / 4]);
	}
	context.putImageData(imageData, canvas.width - 1, 0);
}

// Handle initial click
document.body.addEventListener('click', () => {
	if (audio.state === 'suspended') audio.resume();
	document.body.querySelector('p').remove();
	document.body.appendChild(canvas);
	start();
}, { once: true });
