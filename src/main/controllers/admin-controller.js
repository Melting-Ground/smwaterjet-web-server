const AdminDTO = require('@dtos/admin-dto/admin-dto');
const AdminService = require('@services/admin-service');

const loginAdmin = async (req, res, next) => {
    try {
        const adminDto = new AdminDTO(req.body);
        const token = await AdminService.loginAdmin(adminDto);
        res.status(200).json(token);
    } catch (error) {
        next(error);
    }
};

module.exports = { loginAdmin };