const db = require('@configs/knex');
const Exception = require('@exceptions/exception');
const jwtTokenProvider = require('@jwt/jwt-token-provider');
const argon2 = require('argon2');

const loginAdmin = async (adminDto) => {
    const admin = await db('admins')
        .where({ phone_number: adminDto.phoneNumber })
        .first();

    if (admin == null) {
        throw new Exception('AuthenticationException', 'Admin is not found');
    }

    const passwordValid = await argon2.verify(admin.password_hash, adminDto.password);
    if (passwordValid == false) {
        throw new Exception('AuthenticationException', 'Invalid password');
    }

    const token = jwtTokenProvider.generateToken(admin);
    return token;
};

module.exports = { loginAdmin };
