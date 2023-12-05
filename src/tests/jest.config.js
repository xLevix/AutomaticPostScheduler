module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    //setupFilesAfterEnv: ['<rootDir>/testSetup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: '../tsconfig.json'
        }
    }
};
