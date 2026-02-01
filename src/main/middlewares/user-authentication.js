const db = require('@configs/knex');
const argon2 = require('argon2');
const Exception = require('@exceptions/exception');

const userAuthenticate = async (req, res, next) => {
    try {
        const { inquiryId } = req.params;
        const password = req.headers['password'];
        if (password == null) {
            throw new Exception('BadRequestException', 'Password is required');
        }

        const inquiry = await db('inquiries').where({ id: inquiryId }).select('password').first();

        if (inquiry == null) {
            throw new Exception('ValueNotFoundException', 'Inquiry is not found');
        }

        const isPasswordValid = await argon2.verify(inquiry.password, password);
        
        if (isPasswordValid == false) {
            throw new Exception('AuthenticationException', 'Invalid password');
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = userAuthenticate;