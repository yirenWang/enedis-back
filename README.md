## README

### BACKEND:
packages intalled:
- express (server)
- cors (allow cross origin requests)

for an easier and cleaner development:
- nodemon (hot reloading)
- prettier (clean code)
- babel (allows use of es6 syntax) : based on `https://github.com/babel/example-node-server`

#### Architecture 
`db/index.js` defines the connection to the database and the schema of the different models
`db/data.js` and `db/user.js` defines all the functions that are interacting directly with the database. (Update & Create & Delete)

`docker-compse.yml` is used to configure the docker setup of the dev environment. Run `docker-compose up` to use. 

`index.js` is the entry point of the application. It contains all the routes as well as the functions that implements the OAuth2 flow.

`data.js` formats the data recieved from the enedis API to data that can be used by the front-end application. 

`user.js` uses the enedis API to collect information on the client (contract, contact information, etc.)

