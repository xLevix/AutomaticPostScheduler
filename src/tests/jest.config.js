module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: '../../tsconfig.json'
        }]
    },
    // Uncomment and use the line below if you have specific Jest setup files
    // setupFilesAfterEnv: ['<rootDir>/testSetup.ts'],
};
