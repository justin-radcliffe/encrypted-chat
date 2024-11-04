# Setup Instructions
1. After cloning, run `npm install` to install dependencies.
2. If you do not have the http-server package, run `npm install --global http-server` (may need to run as admin so use `sudo` if necessary).
3. Open up two terminals, one for the backend server and one for the frontend. Run `npm start` in the backend terminal and run `npx http-server frontend -c-1` in the frontend terminal.
4. Go to `localhost:8080` in a browser (open several tabs/windows to simulate multiple users).

The port the server runs on can be changed by editing both config.js files (one in frontend and one in backend).

If anything goes wrong, just restart the server and refresh the tabs/windows.
