 Web-Crawler

Fetches all URLs from a address
## Routes

#### v1

POST `/crawler` Initiate the crawler on a URL

GET `/crawler`  Lists all results

GET `/crawler/:id` get one result

More information is available at `/v1/doc`

## Running locally

Start the Mongo Database and then create a file `local.js` inside config or use the environment variables defined in `custom-environment-variables.json`. Run the service with `npm run local`

A docker-compose file is provided: `docker-compose -f docker-compose.yaml up`. All environment variables are placeholders and **must be updated**

Alternatively, the Mongo DB can be run with only `docker run -d --name crawler-db -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=[user] -e MONGO_INITDB_ROOT_PASSWORD=[secret] mongo`

#### Unit Tests

Unit Tests can be run with `npm run test:unit`, reports will be available at `reports` folder

### Pending Points

- Improve webhook body
- Add a denylist
- Increase code coverage to 80%
- Add option to custom headers
- Add filters when fetching crawler lists
