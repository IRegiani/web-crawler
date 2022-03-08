describe('HtmlParser [TODO]', () => {
    // eslint-disable-next-line no-unused-vars
    let db;

    const mockedImports = {};

    beforeAll(() => {
        db = require('./htmlParser')(mockedImports);
    });

    beforeEach(() => { });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test.todo('fetchHtml');
    test.todo('fetchHtml - error on fetch');
    test.todo('fetchHtml - response is not Ok');
    // Should also remove links #
    test.todo('parseHtml');
    test.todo('parseHtml - ignoreQueryParams');
    test.todo('parseHtml - converts relative links');
    test.todo('parseHtml - error on DomHandler');
});
