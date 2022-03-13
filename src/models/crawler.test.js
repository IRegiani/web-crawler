// TODO: Mock moogoose or mock Date better. Mogoose doesn't like Jest's mock timers

describe('Crawler Schema', () => {
    let CrawlerSchema;
    const dummyCrawlerEntry = {
        createdAt: '2022-03-12T23:44:30.807Z',
        urls: [['1', '2'], ['3']],
        otherField: 'dummy',
        duration: 1000,
    };

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date('2022-03-12T23:44:40.807Z').getTime());
        CrawlerSchema = require('./crawlerSchema')();
    });

    afterAll(() => jest.useRealTimers());

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test('toJson - duration exists', () => {
        const { transform } = CrawlerSchema.options.toJSON;
        expect(transform(null, dummyCrawlerEntry)).toEqual({ ...dummyCrawlerEntry, size: 3, _id: undefined });
    });

    test('toJson - duration is calculated successfully', () => {
        const { transform } = CrawlerSchema.options.toJSON;
        expect(transform(null, { ...dummyCrawlerEntry, duration: undefined })).toEqual({ ...dummyCrawlerEntry, size: 3, _id: undefined, duration: 10 });
    });
});
