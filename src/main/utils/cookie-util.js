function isCookieExists(req, res, id) {
	if (req.cookies[id] == undefined) {
		res.cookie(id, req.clientIP, {
			maxAge: 720000
		})
		return false;
	}
	return true;
}

module.exports = isCookieExists;