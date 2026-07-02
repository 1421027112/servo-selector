exports.handler = async (event) => {
  const clientId = 'Ov23liHXLgFXwJN2Jv8c';
  const redirectUri = 'https://jiangxiajiuxuanxingceshi.netlify.app/.netlify/functions/github-callback';
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
  
  return {
    statusCode: 302,
    headers: {
      Location: githubAuthUrl,
    },
  };
};
