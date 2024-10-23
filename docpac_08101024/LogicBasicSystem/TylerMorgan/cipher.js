const crypto = require('crypto');

// Encryption function
function encrypt(text, secretKey) {
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv('aes-128-cbc', secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Prepend IV to the ciphertext
}

// Decryption function
function decrypt(encryptedText, secretKey) {
    const parts = encryptedText.split(':'); // Split IV and ciphertext
    const iv = Buffer.from(parts.shift(), 'hex'); // Extract IV
    const encryptedTextWithoutIV = parts.join(':'); // Get the ciphertext
    const decipher = crypto.createDecipheriv('aes-128-cbc', secretKey, iv);
    let decrypted = decipher.update(encryptedTextWithoutIV, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}