## Development
To run locally use ``npm start`` then you can access at http://localhost:3033

## How to deploy

The server is using PM2 to run the service. Login to PM2 dashboard after pushing release to update the app with commit.
https://id.keymetrics.io/api/oauth/login 

To update:
1. SSH into server
2. run ``pm2 update``
3. If it doesn't work, install pm2 ``npm install pm2@latest -g``

PM2 commands
```bash
pm2 ls
pm2 restart app_name
pm2 reload app_name
pm2 stop app_name
pm2 delete app_name
```