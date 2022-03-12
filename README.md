# nodejs-website-framework# nodejs-website-framework
A simple web site framework built with nginx, mysql and javascript using SSL for expediation of project development. WIP  

__SETUP__
First, run:  
```
npm install
```
to install the required dependencies.  

Next, edit the `nodejs-website-framework.conf` file in the package root to reflect your information:  
Lines 5 & 19:  
Replace `MYDOMAIN` with your domain name (with `www` if you intend to use it)  

Line 20, 22 & 23: Edit to reflect the path of where you placed the package (eg.: `/var/www/nodejs-website-framework/logs/nginx_error.log`)  

Line 36: Replace `PORT` with the port on which you wish to run the framework (default setting is 3000)  

Upload the `nodejs-website-framework.conf` file (or whatever you rename it) to `/etc/nginx/sites-available`.  

Run
```
ln -s /etc/nginx/sites-available/nodejs-website-framework.conf /etc/nginx/sites-enabled/
```

Next, add your bundle.crt and private.key files to the ssl directory in the package root.  

Import the data from `nodejs-website-framework.sql` into your database.  

Edit the `.env` file in the framework's `html` directory to reflect the values used to connect to your mysql database.  

Reload nginx:  
`nginx -s reload`  

Change into the framework's `html` directory and start the framework with:  
`npm start .`
