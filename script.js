// 获取video元素
const video = document.getElementById('video');
const qrResult = document.getElementById('qrResult');
const wifiInfo = document.getElementById('wifiInfo');
const wifiSSID = document.getElementById('wifiSSID');
const wifiPassword = document.getElementById('wifiPassword');
const wifiEncryption = document.getElementById('wifiEncryption');

// 使用getUserMedia访问摄像头
navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' } // 使用后置摄像头
}).then(function(stream) {
    video.srcObject = stream;
    video.play();
    scanQRCode(stream);
}).catch(function(error) {
    console.error('无法访问摄像头:', error);
});

// 扫描二维码
function scanQRCode(stream) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    function detectQRCode() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // 设置canvas大小与视频大小一致
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;

            // 将视频帧绘制到canvas上
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 获取canvas图像数据
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert"
            });

            if (code) {
                // 如果识别到二维码，显示结果并解析WiFi信息
                qrResult.textContent = code.data;
                parseWiFiData(code.data);
            } else {
                // 如果未识别到二维码，继续扫描
                requestAnimationFrame(detectQRCode);
            }
        } else {
            requestAnimationFrame(detectQRCode);
        }
    }

    detectQRCode();
}

// 解析二维码中的WiFi信息
function parseWiFiData(data) {
    // 判断是不是以 WIFI: 开头
    if (!data.startsWith("WIFI:")) {
        qrResult.textContent = "二维码内容不是有效的 WiFi 信息";
        wifiInfo.style.display = 'none';
        return;
    }

    // 移除开头的 WIFI: 和结尾的两个分号
    const content = data.substring(5).replace(/;;$/, '');

    // 拆分字段
    const fields = {};
    content.split(';').forEach(part => {
        const [key, ...rest] = part.split(':');
        if (key && rest.length > 0) {
            fields[key] = rest.join(':'); // 防止SSID或密码中包含冒号
        }
    });

    // 读取字段
    const ssid = fields['S'] || '(未识别)';
    const password = fields['P'] || '(无密码)';
    const encryption = fields['T'] || '(未知加密方式)';

    // 显示结果
    wifiSSID.textContent = ssid;
    wifiPassword.textContent = password;
    wifiEncryption.textContent = encryption;
    wifiInfo.style.display = 'block';
}
