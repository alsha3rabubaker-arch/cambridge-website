module.exports = async (req, res) => {
  const { code } = req.query;
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });
  const data = await response.json();
  const postMsg = JSON.stringify({ token: data.access_token, provider: 'github' });
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html><html><body><script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage('authorization:github:success:${postMsg}', e.origin);
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })()
  </script></body></html>`);
};