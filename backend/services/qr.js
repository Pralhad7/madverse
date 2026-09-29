const QRCode = require('qrcode');

async function generateQRCode(url, options = {}) {
    const color = options.color || '#4285F4';
    const width = options.width || 400;
    
    return await QRCode.toDataURL(url, {
        width,
        margin: 2,
        color: {
            dark: color,
            light: '#ffffff'
        }
    });
}

async function generateQRBuffer(url, options = {}) {
    const color = options.color || '#4285F4';
    const width = options.width || 400;
    
    return await QRCode.toBuffer(url, {
        width,
        margin: 2,
        color: {
            dark: color,
            light: '#ffffff'
        }
    });
}

module.exports = { generateQRCode, generateQRBuffer };
