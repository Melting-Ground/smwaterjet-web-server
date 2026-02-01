module.exports = {
    roots: ['<rootDir>/src'],
    moduleNameMapper: {
        '^@configs/(.*)$': '<rootDir>/src/main/configs/$1',
        '^@models/(.*)$': '<rootDir>/src/main/models/$1',
        '^@services/(.*)$': '<rootDir>/src/main/services/$1',
        '^@dtos/(.*)$': '<rootDir>/src/main/dtos/$1',
        '^@exceptions/(.*)$': '<rootDir>/src/main/exceptions/$1',
        '^@utils/(.*)$': '<rootDir>/src/main/utils/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/main/middlewares/$1',
        '^@routes/(.*)$': '<rootDir>/src/main/routes/$1',
        '^@controllers/(.*)$': '<rootDir>/src/main/controllers/$1',
        '^@jwt/(.*)$': '<rootDir>/src/main/jwt/$1'
    },
    testEnvironment: 'node', 
};