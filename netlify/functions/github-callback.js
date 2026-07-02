const https = require('https');

function httpsRequest(url, options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
  
  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No code provided' }) };
  }

  const clientId = 'Ov23liHXLgFXwJN2Jv8c';
  const clientSecret = '076392590265427eb4f0d064a5ef701ac1620244';

  try {
    // Exchange code for access token
    const tokenData = await httpsRequest({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }, null, JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }));

    const token = JSON.parse(tokenData);
    if (token.error) {
      return { statusCode: 400, body: JSON.stringify({ error: token.error_description }) };
    }

    // Get user info
    const userData = await httpsRequest({
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: { 'Authorization': `token ${token.access_token}`, 'User-Agent': 'ServoSelector' }
    });

    const user = JSON.parse(userData);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html><html><head><title>登录成功</title></head><body>
        <script>
          var userData = {id:${user.id},login:'${user.login}',name:'${user.name||user.login}',avatar:'${user.avatar_url}',token:'${token.access_token}'};
          if(window.opener){window.opener.postMessage({type:'github-login',user:userData},'*');window.close();}
          else{localStorage.setItem('github_user',JSON.stringify(userData));window.location.href='/';}
        </script>
        <p>登录成功，正在跳转...</p>
      </body></html>`
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
