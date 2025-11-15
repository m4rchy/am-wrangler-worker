/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    // Get user email from Cloudflare Access JWT
    const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'Unknown';
    
    // Get timestamp in ISO format
    const timestamp = new Date().toISOString();
    
    // Get country from Cloudflare request object
    const country = request.cf?.country || 'Unknown';
    
    // Create response body: "$Email authenticated at $timestamp from $country."
    const responseBody = `${email} authenticated at ${timestamp} from ${country}.`;
    
    // Return HTTP response
    return new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },
};
