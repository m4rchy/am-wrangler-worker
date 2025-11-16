import styles from './styles.css';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Checks /secure/country route
    if (path === '/secure/country') {
      return handleCountryPage(request, env);
    }
    
    // Checks /secure route
    if (path === '/secure') {
      return handleSecurePage(request);
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

async function handleSecurePage(request) {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'Unknown';
  const timestamp = new Date().toLocaleString();
  const country = request.cf?.country || 'XX';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Endpoint</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="card">
        <p>${email} authenticated at ${timestamp} from <a href="/secure/country">${country}</a>.</p>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

async function handleCountryPage(request, env) {
  const countryCode = (request.cf?.country || 'XX').toUpperCase();
  
  // Get flag from R2 bucket
  const flagKey = `${countryCode.toLowerCase()}.png`;
  const flagObject = await env.FLAGS.get(flagKey);
  
  let flagHTML;
  
  if (flagObject) {
    // Show flag if found
    const flagData = await flagObject.arrayBuffer();
    const base64Flag = btoa(String.fromCharCode(...new Uint8Array(flagData)));
    flagHTML = `<div class="flag-png"><img src="data:image/png;base64,${base64Flag}" alt="${countryCode} flag" /></div>`;
  } else {
    // Show message if flag not found
    flagHTML = `<div class="flag-not-found"><p>Your country flag is not found</p></div>`;
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${countryCode} Flag</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="card">
        <h1>${getCountryName(countryCode)}</h1>
        ${flagHTML}
        <p>Country Code: ${countryCode}</p>
        <p><a href="/secure">Back to secure endpoint</a></p>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function getCountryEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getCountryName(code) {
  const countries = {
    'GB': 'United Kingdom',
    'US': 'United States',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CA': 'Canada',
    'AU': 'Australia',
    'IN': 'India',
    'ES': 'Spain',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'CN': 'China',
    'KR': 'South Korea',
    'SG': 'Singapore',
    'NZ': 'New Zealand',
    'IE': 'Ireland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RU': 'Russia',
    'ZA': 'South Africa',
  };
  return countries[code] || code;
}