Routes

POST /crawler Initiate the crawler on a ULR

Example: 
```
{
    url: "google.com",
    "ignoreQueryParams": true
}
```

GET /results

GET /results/:uid

GET /results/:url


Running locally

Create a file `local.js` inside config or use the environment variables defined in `custom-environment-variables.json`