describe('DB', () => {
    let db;
    const dummyId = 'dummy-id';
    const dummyResult = {};
    const mockedImports = { models: { Crawler: { findById: jest.fn(), find: jest.fn(), findByIdAndUpdate: jest.fn() } } };

    beforeEach(() => {
        db = require('./db')(mockedImports);

        mockedImports.models.Crawler.find.mockResolvedValue([]);
        mockedImports.models.Crawler.findByIdAndUpdate.mockResolvedValue({});
        mockedImports.models.Crawler.findById.mockReturnValue({ exec: async () => Promise.resolve(dummyResult) });
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    // TODO: Improve tests
    test('createCrawlerEntry', async () => {
        const mockedSave = jest.fn().mockResolvedValue();
        const crawlerInstance = { save: mockedSave, id: dummyId };
        db = require('./db')({ models: { Crawler: function Crawler() { return crawlerInstance; } } });

        const result = await db.createCrawlerEntry();

        expect(mockedSave).toHaveBeenCalledTimes(1);
        expect(result).toEqual(crawlerInstance);
    });

    test('getList', async () => {
        const result = await db.getList();

        expect(mockedImports.models.Crawler.find).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });

    test('getOne', async () => {
        const result = await db.getOne(dummyId);

        expect(mockedImports.models.Crawler.findById).toHaveBeenCalledWith(dummyId);
        expect(result).toEqual(dummyResult);
    });

    test('getOne - error', async () => {
        let error;
        mockedImports.models.Crawler.findById.mockReturnValue({ exec: async () => Promise.resolve() });

        await db.getOne(dummyId).catch((err) => { error = err; });

        expect(mockedImports.models.Crawler.findById).toHaveBeenCalledWith(dummyId);
        expect(error.message).toEqual(`Id ${dummyId} not found`);
        expect(error.responseCode).toEqual(404);
    });

    test('markAsCompleted', async () => {
        await db.markAsCompleted(dummyId, '2022-03-12T23:44:30.807Z');

        expect(mockedImports.models.Crawler.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(mockedImports.models.Crawler.findByIdAndUpdate).toHaveBeenCalledWith(dummyId, { status: 'completed', duration: expect.any(Number) });
    });

    test('updateStatus', async () => {
        const result = await db.updateStatus(dummyId, 'status');

        expect(mockedImports.models.Crawler.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(mockedImports.models.Crawler.findByIdAndUpdate).toHaveBeenCalledWith(dummyId, { status: 'status' });
        expect(result).toEqual(dummyResult);
    });

    test('updateLevelData', async () => {
        const dummyUrls = [];
        const result = await db.updateLevelData(dummyId, dummyUrls, 'status');

        expect(mockedImports.models.Crawler.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        expect(mockedImports.models.Crawler.findByIdAndUpdate).toHaveBeenCalledWith(dummyId, { status: 'status', $push: { urls: dummyUrls } });
        expect(result).toEqual(dummyResult);
    });
});
