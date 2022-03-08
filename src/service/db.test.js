describe('DB [TODO]', () => {
    // eslint-disable-next-line no-unused-vars
    let db;

    const mockedImports = { Crawler: {} };

    beforeAll(() => {
        db = require('./db')(mockedImports);
    });

    beforeEach(() => { });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test.todo('createCrawlerEntry');
    test.todo('getList');
    test.todo('getOne');
    test.todo('addMoreUrlsToCrawler');
    test.todo('checkIfAnyUrlHasBeenVisited');
});
