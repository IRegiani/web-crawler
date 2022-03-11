# Web-Crawler

Fetches all URLs from a address
## Routes

#### v1

POST /crawler Initiate the crawler on a URL, returning the all URLs found at first level. Further levels are fetched asynchronously 

Body Example (only url is required): 
```
{
    url: "google.com",
    "ignoreQueryParams": true,
    "maxDepth": 10
    "webhook": {
        "url": "",
        body: {
            "message": ""
        }
    }
}
```

Response:
```
{
    "firstLevelUrls": [
        "https://www.google.com.br/imghp",
        "https://maps.google.com.br/maps",
        "https://play.google.com/"
    ]
    "id": "6227590fb530b931b08669f6"
}

```


GET /crawler  Lists all results

Response: 
```
[
    {
        "initialUrl": "https://www.google.com",
        "urls": [
            [
                "https://www.google.com.br/imghp?hl=pt-BR&tab=wi",
                "https://maps.google.com.br/maps?hl=pt-BR&tab=wl",
                "https://play.google.com/?hl=pt-BR&tab=w8",
            ],
            [
                "https://www.google.com.br/imghp?hl=pt-BR&tab=wi",
                "https://maps.google.com.br/maps?hl=pt-BR&tab=wl",
                "https://play.google.com/?hl=pt-BR&tab=w8",
            ]
        ],
        "status": "pending",
        "createdAt": "2022-03-07T11:16:54.250Z",
        "updatedAt": "2022-03-07T11:16:54.250Z",
        "id": "6225e9a618dc154db8534e2f",
        "duration": 2249.072
    }
]
```

GET /results/:id get one result

```
{
        "initialUrl": "https://www.google.com",
        "urls": [
            [
                "https://www.google.com.br/imghp?hl=pt-BR&tab=wi",
                "https://maps.google.com.br/maps?hl=pt-BR&tab=wl",
                "https://play.google.com/?hl=pt-BR&tab=w8",
            ],
            [
                "https://www.google.com.br/imghp?hl=pt-BR&tab=wi",
                "https://maps.google.com.br/maps?hl=pt-BR&tab=wl",
                "https://play.google.com/?hl=pt-BR&tab=w8",
            ]
        ],
        "status": "pending",
        "createdAt": "2022-03-07T11:16:54.250Z",
        "updatedAt": "2022-03-07T11:16:54.250Z",
        "id": "6225e9a618dc154db8534e2f",
        "duration": 2249.072
}
```


### Running locally

Start the Mongo Database and then create a file `local.js` inside config or use the environment variables defined in `custom-environment-variables.json`. Run the service with `npm run local`

A docker-compose file is provided: `docker-compose -f docker-compose.yaml up`. All environment variables are placeholders and **must be updated**

Alternatively, the Mongo DB can be run with only `docker run -d --name crawler-db -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=[user] -e MONGO_INITDB_ROOT_PASSWORD=[secret] mongo`

#### Unit Tests

Unit Tests can be run with `npm run test:unit`, reports will be available at `reports` folder

### Pending Points

- Add swagger
- Implement webhook
- Implement clustering
- Add a denylist or domain restriction
- Check if an URL has already been visited
- Implement a wait interval or a queue (p-queue) between requests and separate them in batches
- Handle errors when fetching. Save those in the DB to try again later and update crawler status to failed
- Increase code coverage to 80%
