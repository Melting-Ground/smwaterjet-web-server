const Exception = require("../exceptions/exception");

class AuthorizationHeader {
    constructor(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Exception('AuthenticationException', 'Invalid authorization header');
        }
        this.authHeader = authHeader;
    }
    getToken() {
        return this.authHeader.substring('Bearer '.length);
    }
}

module.exports = AuthorizationHeader;
