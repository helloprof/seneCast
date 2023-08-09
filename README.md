## Requirements
- Git 
- NodeJS
- nodemon (optional)
- Cloudinary Account
- ElephantSQL Account
- MongoDB Atlas Account

## Local Setup
1. Clone the repository: `git clone https://github.com/helloprof/seneCast.git`
2. Copy the `sample.env` into `.env` and replace with your own keys: `cp sample.env .env` OR rename the file and add keys
3. Install npm packages: `npm install`
4. Run the local node/express server via nodemon (for live changes): `nodemon server.js` OR `node server.js`

## Bugs and Potential Fixes?
- loginHistory array in the session becomes too large after 15 logins - maybe consider removing loginHistory tracking entirely or save smaller sized data into the document (i.e. don't use User-Agent...)
- dropdown still not working even after adding popper.js (could be a Bootstrap 5, no jquery thing) - maybe consider finding a different way to show the same data via a modal or tabs or something
- east coast servers not functional on campus so choose west coast for the free servers (PG and Mongo)