describe('RequestInterceptor [TODO]', () => {
    // eslint-disable-next-line no-unused-vars
    let RequestInterceptor;

    const mockedImports = {};

    beforeAll(() => {
        RequestInterceptor = require('./request')(mockedImports);
    });

    beforeEach(() => { });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test.todo('middleware is set successfully');
    test.todo('logger levels are set successfully');
});
