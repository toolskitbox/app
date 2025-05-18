// Detect environment and set appropriate API URL
(function() {
  const hostname = window.location.hostname;
  let apiUrl;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    apiUrl = 'http://localhost:8080/api';
  } else if (hostname === 'toolskitbox.com' || hostname === 'www.toolskitbox.com') {
    // Production
    apiUrl = 'https://api.toolskitbox.com';
  } else {
    // Default fallback
    apiUrl = 'https://api.toolskitbox.com';
  }
  
  window.env = {
    REACT_APP_API_URL: apiUrl
  };
})();
