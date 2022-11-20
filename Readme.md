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

A docker-compose file is provided: `docker-compose -f docker-compose.yaml up --detach`. All environment variables are placeholders and **must be updated**

Alternatively, the Mongo DB can be run with only `docker run -d --name crawler-db -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=[user] -e MONGO_INITDB_ROOT_PASSWORD=[secret] mongo`

#### Unit Tests

Unit Tests can be run with `npm run test`, reports will be available at `reports` folder

### Pending Points

- Improve webhook body: allow a summary of the crawler finished
- Add an option to abort a running crawler operation: PATCH /crawler/{id}
- Add an option to continue an existing crawler operation after has been completed. Eg.: Depth is updated
- Add a denylist
- Improve domain and subdomain filter
- Handle 302 and 307 codes
- Add option to custom headers
- Add filters when fetching crawler lists
- Refactor to TypeScript and ES2022

## Note

Using a big maxDepth will consume lots of memory (>2GB). This will crash node js, run it as `npm run serve-big-memory`. This still needs improvement
