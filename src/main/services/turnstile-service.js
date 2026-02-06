const Exception = require('@exceptions/exception');
require('dotenv').config();

const handlePost = async (token) => {
	if (token == null) {
		throw new Exception('BadRequestException', 'TurnstileToken is missing');
	};
	if (process.env.CAPTCHA_SECRETKEY == null) {
		throw new Exception('ConfigurationException', 'CAPTCHA_SECRETKEY is not set in environment variables');
	}
	const secretKey = process.env.CAPTCHA_SECRETKEY;

	const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
	const body = new URLSearchParams({
		secret: secretKey,
		response: token,
	});
	const result = await fetch(url, {
		method: 'POST',
		body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const outcome = await result.json();
	if (outcome.success == false) {
		throw new Exception('UnprocessableEntityException', 'Verification is failed');
	};
	return outcome.success;
};

module.exports = { handlePost };
