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

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'File size exceeds the 200MB limit.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected file field. Use "files".' });
        }
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    }

    if (err.name === 'ConfigurationException') {
        return res.status(500).json({ message: err.message });
    }

    if (err.name === 'InternalServerException') {
        return res.status(500).json({ message: err.message });
    }

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: err.message });
    }

    if (err.message === 'CORS is not configured') {
        return res.status(500).json({ message: err.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = exceptionHandler;
