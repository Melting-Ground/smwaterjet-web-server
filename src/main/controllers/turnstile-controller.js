const captchaService = require('@services/turnstile-service');

const handlePost = async (req, res, next) => {
	try {
		const token = req.body['cf-turnstile-response'];
		const validationResult = await captchaService.handlePost(token);
		res.status(200).json({validationResult});
	} catch (error) {
		next(error);
	}
};

module.exports = { handlePost };