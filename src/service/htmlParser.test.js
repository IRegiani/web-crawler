const axios = require('axios');

jest.mock('axios');

describe('HtmlParser', () => {
    let htmlParser;
    const html = `
    <!DOCTYPE html>
    <html>
      <body title="hello">
        <a href="https://www.google.com">abc</a>
        <a href="https://www.google.com.br/imghp?hl=pt-BR&tab=wi">def</a>
        <a href="https://www.google.com.br/imghp?hl=US&tab=wi">def</a>
        <a href="https://www.mail.google.com/imghp?hl=pt-BR&tab=wi">def</a>
        <a>def</a>
      </body>
    </html>
    `;
    const baseUrl = 'https://www.google.com';
    const mockError = new Error('mock-error');

    beforeAll(() => { });

    beforeEach(() => {
        htmlParser = require('./htmlParser')();
        axios.mockResolvedValue({ data: 'dummy-data' });
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test('fetchHtml', async () => {
        const res = await htmlParser.fetchHtml(baseUrl);

        expect(res).toEqual('dummy-data');
        expect(axios).toHaveBeenCalledWith(baseUrl);
    });

    test('fetchHtml - error on fetch', async () => {
        let error;
        axios.mockRejectedValue(mockError);

        await htmlParser.fetchHtml(baseUrl, false).catch((err) => { error = err; });

        expect(error).toEqual(mockError);
        expect(axios).toHaveBeenCalledWith(baseUrl);
    });

    test('fetchHtml - ignore error on fetch', async () => {
        let error;
        axios.mockRejectedValue(mockError);

        const res = await htmlParser.fetchHtml(baseUrl).catch((err) => { error = err; });

        expect(res).toEqual(null);
        expect(error).toBeUndefined();
        expect(axios).toHaveBeenCalledWith(baseUrl);
    });

    test('parseHtml', async () => {
        const anchors = await htmlParser.parseHtml(html, baseUrl);

        expect(anchors.length).toBe(4);
        expect(anchors[0]).toBe(baseUrl);
        expect(anchors[1]).toBe('https://www.google.com.br/imghp?hl=pt-BR&tab=wi');
        expect(anchors[2]).toBe('https://www.google.com.br/imghp?hl=US&tab=wi');
        expect(anchors[3]).toBe('https://www.mail.google.com/imghp?hl=pt-BR&tab=wi');
    });

    test('parseHtml - ignoreQueryParams and filterThirdPartyDomains', async () => {
        const anchors = await htmlParser.parseHtml(html, baseUrl, { filterThirdPartyDomains: true, ignoreQueryParams: true });

        expect(anchors.length).toBe(2);
        expect(anchors[0]).toBe(baseUrl);
        expect(anchors[1]).toBe('https://www.google.com.br/imghp');
    });

    test.skip('parseHtml - error on DomHandler', async () => {
        let error;
        const html2 = `
        <html>
        <body title="hello">
        <a href="https://www.google.com">abc</a>`;

        await htmlParser.parseHtml(html + html2, baseUrl).catch((err) => { error = err; });

        expect(error).toBeDefined();
    });

    test('normalizeUrlToAbsolute - invalid anchors', () => {
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, 'mailto:someone')).toBe(null);
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, 'tel:+550000000000')).toBe(null);
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, 'whatsapp://...')).toBe(null);
    });

    test('normalizeUrlToAbsolute - valid absolute anchors', () => {
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, `${baseUrl}/search`)).toBe(`${baseUrl}/search`);
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, `${baseUrl}/search/`)).toBe(`${baseUrl}/search`);
    });

    test('normalizeUrlToAbsolute - valid relative anchors', () => {
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, '/search')).toBe(`${baseUrl}/search`);
        expect(htmlParser._normalizeUrlToAbsolute(`${baseUrl}/A/B`, '../search')).toBe(`${baseUrl}/search`);
        expect(htmlParser._normalizeUrlToAbsolute(`${baseUrl}/A/B`, 'search')).toBe(`${baseUrl}/A/search`);
    });

    test('normalizeUrlToAbsolute - fragment', () => {
        expect(htmlParser._normalizeUrlToAbsolute(baseUrl, '/search#fragment')).toBe(`${baseUrl}/search`);
    });

    test('normalizeUrlToAbsolute - invalid url', () => {
        expect(htmlParser._normalizeUrlToAbsolute('invalid url', '')).toBe(null);
    });
});
