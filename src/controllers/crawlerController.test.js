const { StatusCodes } = require('http-status-codes');

describe('Crawler Controller', () => {
    let CrawlerController;
    let mockedParams;
    const mockError = new Error('mock-error');
    const mockedId = 'dummy-id';
    const mockedHtml = 'dummy-html';
    const mockResponseJson = { json: jest.fn() };

    const mockedImports = {
        htmlParser: { fetchHtml: jest.fn(), parseHtml: jest.fn() },
        dbService: {
            getOne: jest.fn(),
            getList: jest.fn(),
            createCrawlerEntry: jest.fn(),
        },
        deepCrawler: { run: jest.fn() },
        resolver: { setServers: () => ({}), resolve4: jest.fn() },
    };

    beforeEach(() => {
        CrawlerController = require('./crawlerController')(mockedImports);

        mockedParams = {
            request: {
                params: { id: mockedId },
                body: { url: 'www.google.com', webhook: { url: 'dummy-url', body: {} }, ignoreQueryParams: true, filterThirdPartyDomains: true, maxDepth: 100 },
            },
            response: { status: jest.fn() },
            next: jest.fn(),
        };

        mockedImports.dbService.getOne.mockResolvedValue({ id: mockedId });
        mockedImports.dbService.getList.mockResolvedValue([{ id: mockedId }]);
        mockedImports.dbService.createCrawlerEntry.mockResolvedValue({ id: mockedId });
        mockedImports.htmlParser.fetchHtml.mockResolvedValue(mockedHtml);
        mockedImports.htmlParser.parseHtml.mockResolvedValue([]);
        mockedParams.response.status.mockReturnValue(mockResponseJson);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test('read one', async () => {
        await CrawlerController.getOne(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.dbService.getOne).toHaveBeenCalledWith(mockedId);
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockResponseJson.json).toHaveBeenCalled();
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('read one - not found', async () => {
        mockedImports.dbService.getOne.mockImplementation(() => null);

        await CrawlerController.getOne(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    test('read one - internal error', async () => {
        mockedImports.dbService.getOne.mockImplementation(() => { throw mockError; });

        await CrawlerController.getOne(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    test.todo('read one - unknown error');

    test('read list', async () => {
        await CrawlerController.getList(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.dbService.getList).toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockResponseJson.json).toHaveBeenCalledWith([{ id: mockedId }]);
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('read list - unknown error', async () => {
        mockedImports.dbService.getList.mockRejectedValue(mockError);

        await CrawlerController.getList(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.dbService.getList).toHaveBeenCalled();
        expect(mockedParams.response.status).not.toHaveBeenCalledWith();
        expect(mockedParams.next).toHaveBeenCalledWith(mockError);
    });

    test.todo('read list - internal error');

    test('create crawler', async () => {
        const url = `https://${mockedParams.request.body.url}`;
        const crawOptions = { ignoreQueryParams: true, filterThirdPartyDomains: true };

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).toHaveBeenCalledWith(mockedParams.request.body.url);
        expect(mockedImports.htmlParser.fetchHtml).toHaveBeenCalledWith(url, false);
        expect(mockedImports.htmlParser.parseHtml).toHaveBeenCalledWith(mockedHtml, url, crawOptions);
        expect(mockedImports.dbService.createCrawlerEntry).toHaveBeenCalledWith(url, [], mockedParams.request.body.maxDepth);
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ id: mockedId, firstLevelUrls: [] });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - missing url', async () => {
        mockedParams.request.body.url = undefined;

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).not.toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: 'Missing url' });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - invalid url', async () => {
        mockedParams.request.body.url = 'httperror';

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).not.toHaveBeenCalled();
        expect(mockedImports.htmlParser.fetchHtml).not.toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: 'Invalid url' });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - missing webhook url', async () => {
        mockedParams.request.body.webhook.url = undefined;

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).toHaveBeenCalled();
        expect(mockedImports.htmlParser.fetchHtml).not.toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: 'Missing url on webhook' });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - missing webhook body', async () => {
        mockedParams.request.body.webhook.body = undefined;
        mockedParams.request.body.ignoreQueryParams = undefined;
        mockedParams.request.body.maxDepth = undefined;
        mockedParams.request.body.filterThirdPartyDomains = undefined;

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).toHaveBeenCalled();
        expect(mockedImports.htmlParser.fetchHtml).not.toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: 'Missing body on webhook' });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - invalid ignoreQueryParams', async () => {
        mockedParams.request.body.ignoreQueryParams = 2022;

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).toHaveBeenCalled();
        expect(mockedImports.htmlParser.fetchHtml).not.toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: 'ignoreQueryParams should be a boolean' });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - invalid filterThirdPartyDomains ', async () => {
        mockedParams.request.body.filterThirdPartyDomains = 2019;

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).toHaveBeenCalled();
        expect(mockedImports.htmlParser.fetchHtml).not.toHaveBeenCalled();
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: 'filterThirdPartyDomains should be a boolean' });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test('create crawler - initial fetch error', async () => {
        const url = `https://${mockedParams.request.body.url}`;
        mockedImports.htmlParser.fetchHtml.mockRejectedValue(mockError);

        await CrawlerController.createCrawler(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedImports.resolver.resolve4).toHaveBeenCalledWith(mockedParams.request.body.url);
        expect(mockedImports.htmlParser.fetchHtml).toHaveBeenCalledWith(url, false);
        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockResponseJson.json).toHaveBeenCalledWith({ message: `Failed to fetch ${url}. ${mockError}` });
        expect(mockedParams.next).not.toHaveBeenCalled();
    });

    test.todo('create crawler - unknown error');
});
