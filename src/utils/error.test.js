describe('Error [TODO]', () => {
    // eslint-disable-next-line no-unused-vars
    let error;

    const mockedImports = {};

    beforeAll(() => {
        error = require('./error')(mockedImports);
    });

    beforeEach(() => { });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test.todo('known error types');
    test.todo('fallback status code');
});
