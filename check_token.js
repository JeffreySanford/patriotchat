// Paste your token from the logs here
const token = 'YOUR_TOKEN_HERE';
const parts = token.split('.');
if (parts.length !== 3) {
  console.log('Invalid token format');
} else {
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('Token Payload:', JSON.stringify(payload, null, 2));
  console.log('Exp time:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
  console.log('Is expired?', Date.now() > payload.exp * 1000);
}
