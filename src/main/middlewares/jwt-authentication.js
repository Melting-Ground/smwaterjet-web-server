const AuthorizationHeader = require('@jwt/authorization-header');
const tokenVerifier = require('@jwt/jwt-token-provider');
const Exception = require('@exceptions/exception');

const authenticate = async (req, res, next) => {
    try {
        const authHeaderValue = req.headers['authorization'];

        if (authHeaderValue == null) {
            throw new Exception('AuthenticationException', 'Authorization header is missing');
        }
        const authHeader = new AuthorizationHeader(authHeaderValue);
        const token = authHeader.getToken();

        await tokenVerifier.verifyToken(token);

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;