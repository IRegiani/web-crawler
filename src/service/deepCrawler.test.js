const axios = require('axios');

jest.mock('axios');

describe('DeepCrawler', () => {
    let deepCrawler;
    let crawlerDBEntry;
    const baseUrl = 'https://www.google.com';
    const mockedId = 'dummy-id';
    const mockedHtml = 'dummy-html';

    const mockedImports = {
        htmlParser: { fetchHtml: jest.fn(), parseHtml: jest.fn() },
        dbService: {
            getOne: jest.fn(),
            updateStatus: jest.fn(),
            markAsCompleted: jest.fn(),
            updateLevelData: jest.fn(),
        },
    };

    beforeEach(() => {
        deepCrawler = require('./deepCrawler')(mockedImports);
        axios.mockResolvedValue({ data: 'dummy-data' });

        crawlerDBEntry = { id: mockedId, urls: [['a', 'b']], initialUrl: baseUrl, maxDepth: 2, createdAt: '2022-03-12T23:44:30.807Z' };
        mockedImports.dbService.getOne.mockResolvedValue(crawlerDBEntry);
        mockedImports.htmlParser.fetchHtml.mockResolvedValue(mockedHtml);
        mockedImports.htmlParser.parseHtml.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    // TODO: Improve tests
    test('run crawler - single level', async () => {
        const parserOptions = {};

        await deepCrawler.run(mockedId, null, parserOptions);

        expect(mockedImports.dbService.getOne).toHaveBeenCalledWith(mockedId);
        expect(mockedImports.dbService.updateStatus).toHaveBeenCalledWith(mockedId, 'ongoing-2');
        expect(mockedImports.dbService.markAsCompleted).toHaveBeenCalledWith(mockedId, crawlerDBEntry.createdAt);
        expect(axios).not.toHaveBeenCalled();
        expect(mockedImports.dbService.updateLevelData).not.toHaveBeenCalled();
    });

    test.todo('run crawler - multiple levels');
    test.todo('run crawler - skips already visited urls');
    test.todo('run crawler - calls webhook');
    test.todo('run crawler - calls webhook, returns error');
});
