export const notFound = (req, res, next) => {
    const error = new Error(
        `Rota não encontrada: ${req.originalUrl}`
    );

    error.status = 404;

    next(error);
};

export const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Erro interno do servidor"
    });
};
