module.exports = {
    // collectCoverage: true,
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    reporters: [
        'default',
        [
            './node_modules/jest-html-reporter',
            {
                pageTitle: 'Test Report Summary',
                outputPath: '<rootDir>/reports/test-report-summary.html',
            },
        ],
    ],
    collectCoverageFrom: ['<rootDir>/src/**/*.js'],
    coverageDirectory: '<rootDir>/reports/jest',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    coverageReporters: ['text', 'text-summary', 'html', 'jest-junit', 'lcov'],
    // moduleDirectories: ['<rootDir>/node_modules'],
};
