// Test-only SMTP inbox. It never forwards mail and only listens on loopback.
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const http = require('node:http');

if (process.env.LOCAL_SMTP_TEST_ONLY !== 'true') {
  throw new Error('This fixture requires LOCAL_SMTP_TEST_ONLY=true and must not be deployed.');
}

const codes = new Map();
const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ['AUTH', 'STARTTLS'],
  size: 1024 * 1024,
  onData(stream, session, callback) {
    simpleParser(stream).then((message) => {
      const match = (message.text || '').match(/注册验证码：(\d{6})/u);
      if (match) {
        for (const recipient of session.envelope.rcptTo) {
          codes.set(recipient.address.toLowerCase(), match[1]);
        }
        if (codes.size > 1000) codes.delete(codes.keys().next().value);
      }
      callback();
    }).catch(() => callback(new Error('Unable to parse test mail')));
  }
});

const api = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'GET' && url.pathname === '/health') {
    response.end(JSON.stringify({ status: 'UP' }));
  } else if (request.method === 'GET' && url.pathname === '/messages') {
    const code = codes.get((url.searchParams.get('email') || '').toLowerCase());
    response.statusCode = code ? 200 : 404;
    response.end(JSON.stringify(code ? { code } : { error: 'No test mail received' }));
  } else {
    response.statusCode = 404;
    response.end('{}');
  }
});

smtp.listen(Number(process.env.TEST_SMTP_PORT || 2526), '127.0.0.1');
api.listen(Number(process.env.TEST_MAIL_API_PORT || 8026), '127.0.0.1', () => {
  process.stdout.write('Loopback test SMTP inbox ready. No real mail will be sent.\n');
});
smtp.on('error', (error) => { process.stderr.write(error.message + '\n'); process.exitCode = 1; api.close(); });
