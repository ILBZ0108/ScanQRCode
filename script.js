const video = document.getElementById('video');
const scanBtn = document.getElementById('startScanBtn');
const overlay = document.getElementById('overlay');
const qrContent = document.getElementById('wifiInfo');

let stream = null;
let scanning = false;
let animationFrameId = null;

scanBtn.addEventListener('click', async () => {
  if (scanning) {
    stopScan();
  } else {
    await startScan();
  }
});

async function startScan() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    scanning = true;
    overlay.style.opacity = '0';
    scanBtn.textContent = "停止扫描";
    qrContent.style.display = 'none';

    detectQRCode();
  } catch (error) {
    alert("无法打开摄像头：" + error.message);
  }
}

function stopScan() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.srcObject = null;
  scanning = false;
  overlay.style.opacity = '1';
  scanBtn.textContent = "扫描二维码";
  cancelAnimationFrame(animationFrameId);
}

function detectQRCode() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scan = () => {
    if (!video.videoWidth) {
      animationFrameId = requestAnimationFrame(scan);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height, {
      inversionAttempts: "dontInvert"
    });

    if (code) {
      // 直接显示二维码原始内容
      qrContent.innerHTML = `<p><strong>扫码结果：</strong> ${code.data}</p>`;
      qrContent.style.display = 'block';
      stopScan();
    } else {
      animationFrameId = requestAnimationFrame(scan);
    }
  };

  scan();
}
