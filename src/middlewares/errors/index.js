import EErrors from '../../services/errors/enum.js';

export default (error, req, res, next) => {
    req.logger.error(`Error name: ${error.name} - Cause: ${error.cause}`);

    switch (error.code) {
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).send({ 
                status: "error", 
                error: error.name, 
                cause: error.cause 
            });
            break;
        case EErrors.ROUTING_ERROR:
            res.status(404).send({ 
                status: "error", 
                error: error.name 
            });
            break;
        case EErrors.DATABASE_ERROR:
            res.status(500).send({ 
                status: "error", 
                error: error.name 
            });
            break;
        case EErrors.AUTH_ERROR:
            res.status(401).send({ 
                status: "error", 
                error: error.name 
            });
            break;
        default:
            res.status(500).send({ 
                status: "error", 
                error: "Unhandled error" 
            });
    }
};