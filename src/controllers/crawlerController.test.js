const { StatusCodes } = require('http-status-codes');

describe('CrawlerController [WIP]', () => {
    let CrawlerController;
    const mockError = new Error('mock-error');
    const mockedId = 'dummy-id';
    const mockResponseJson = { json: jest.fn() };

    const mockedParams = {
        request: { params: { id: mockedId } },
        response: { status: jest.fn() },
        next: jest.fn(),
    };

    const mockedImports = {
        htmlParser: jest.fn(),
        dbService: {
            getOne: jest.fn(),
            getList: jest.fn(),
        },
        deepCrawler: jest.fn(),
        resolver: { setServers: () => ({}) },
    };

    beforeAll(() => {
        CrawlerController = require('./crawlerController')(mockedImports);
    });

    beforeEach(() => {
        mockedImports.dbService.getOne.mockResolvedValue({ id: mockedId });
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

    test('read one -  not found', async () => {
        // This would be a mongoose not found error
        mockedImports.dbService.getOne.mockImplementation(() => { throw mockError; });

        await CrawlerController.getOne(mockedParams.request, mockedParams.response, mockedParams.next);

        expect(mockedParams.response.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    });

    test.todo('read one - internal error');
    test.todo('read one - unknown error');

    test.todo('read list');
    test.todo('read list - unknown error');
    test.todo('read list - internal error');

    test.todo('create crawler');
    test.todo('create crawler - unknown error');
    test.todo('create crawler - internal error');
    test.todo('create crawler - invalid url');
    test.todo('create crawler - invalid ignoreQueryParams');
    test.todo('create crawler - invalid webhook');
});
