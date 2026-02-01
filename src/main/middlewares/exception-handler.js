const exceptionHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);

    if (err.name === 'AuthenticationException') {
        return res.status(401).json({ message: err.message });
    }

    if (err.name === 'ValueNotFoundException') {
        return res.status(404).json({ message: err.message });
    }

    if (err.name === 'BadRequestException') {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === 'ValueAlreadyExistsException') {
        return res.status(409).json({ message: err.message });
    }

    if (err.name === 'UnprocessableEntityException') {
        return res.status(422).json({ message: err.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = exceptionHandler;