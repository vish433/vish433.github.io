# Deployment Guide for artnhandicraft.com

This project includes a Node.js backend (`server.js`) and a static front-end. To launch it under your GoDaddy domain, you need a hosting environment that supports Node.js and DNS control for `artnhandicraft.com`.

## Option 1: Use GoDaddy Linux/VPS Hosting with Node.js

1. Purchase or configure GoDaddy hosting that supports Node.js (Linux Hosting or VPS).
2. Upload the full project folder to your hosting account. If using cPanel, place files in the application root (often `public_html` or your app folder).
3. Install dependencies on the server:
   ```bash
   cd /path/to/project
   npm install
   ```
4. Set environment variables for the email backend:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - Optional: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`
5. Start the app using Node or a process manager such as `pm2`:
   ```bash
   npm start
   ```
6. Confirm the app is running on your hosting URL or IP address.

## Option 2: Use External Node Hosting + Point GoDaddy Domain

If GoDaddy hosting does not support Node.js or you want simpler deployment, host the app elsewhere and point the domain to that host.

1. Deploy the app on a Node-capable hosting service such as:
   - Render
   - Fly.io
   - Railway
   - DigitalOcean App Platform
   - Heroku
   - Vercel (backend requires serverless or Node support)
2. Make sure the deployed app works at the public URL.
3. In GoDaddy DNS management for `artnhandicraft.com`:
   - Set `A` record for `@` pointing to your host's IP address.
   - Set `CNAME` record for `www` pointing to `@` or the hostname given by your provider.
   - Save changes and wait for propagation.

## Required DNS Settings
- `@` → `A` record → server IP address
- `www` → `CNAME` → `@`

## Example with GoDaddy Domain Only
If your Node app is running at `http://123.45.67.89`:
- `@` → `123.45.67.89`
- `www` → `@`

## Notes
- The currently built app is served by `server.js` on port `3000` locally.
- For production, the host must run the Node app continuously.
- The contact email backend only works when `EMAIL_USER` and `EMAIL_PASS` are configured correctly.

## Quick local commands
```bash
cd c:\AI\ArtnCraft
npm start
```

## If you want me to help further
Provide GoDaddy hosting or DNS details, or choose a hosting provider and I can tailor the deployment instructions for that service.
