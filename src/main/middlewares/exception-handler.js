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
            return res.status(413).json({ message: '파일 크기는 최대 200MB입니다.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: '파일 필드명은 files 입니다.' });
        }
        return res.status(400).json({ message: `파일 업로드 오류: ${err.message}` });
    }

    res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = exceptionHandler;
