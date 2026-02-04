window.ERIS_CONFIG = {
  region: "us-east-2",

  cognitoDomain: "https://YOUR_DOMAIN.auth.us-east-2.amazoncognito.com",
  clientId: "YOUR_APP_CLIENT_ID",
  redirectUri: "https://YOUR_CLOUDFRONT_DOMAIN/callback.html",
  logoutUri: "https://YOUR_CLOUDFRONT_DOMAIN/index.html",

  apiBaseUrl: "https://YOUR_API_ID.execute-api.us-east-2.amazonaws.com/prod",

  pollMs: 5000
};
