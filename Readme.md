## Routes

POST /crawler Initiate the crawler on a URL

Example: 
```
{
    url: "google.com",
    "ignoreQueryParams": true
}
```



GET /crawler  Lists all results

GET /results/:id get one result


### Running locally

Create a file `local.js` inside config or use the environment variables defined in `custom-environment-variables.json`

#### Unit Tests

Unit Tests can be run with `npm run test:unit`, reports will be available at `reports` folder