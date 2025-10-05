const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log('Generating self-signed SSL certificates...');

try {
  // Generate private key
  execSync(`openssl genrsa -out ${path.join(certsDir, 'server.key')} 2048`, { stdio: 'inherit' });
  
  // Generate certificate
  execSync(`openssl req -new -x509 -key ${path.join(certsDir, 'server.key')} -out ${path.join(certsDir, 'server.crt')} -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ SSL certificates generated successfully!');
  console.log('📁 Certificates saved to:', certsDir);
  console.log('🔒 You can now run the server with HTTPS support');
} catch (error) {
  console.error('❌ Error generating certificates:', error.message);
  console.log('💡 Make sure OpenSSL is installed on your system');
  console.log('   Windows: Install Git for Windows or OpenSSL');
  console.log('   macOS: brew install openssl');
  console.log('   Linux: sudo apt-get install openssl');
}
