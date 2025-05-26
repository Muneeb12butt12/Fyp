export const logRequests = (req, res, next) => {
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    res.on('finish', () => {
      const duration = process.hrtime(res.locals.startTime);
      const durationMs = (duration[0] * 1e3 + duration[1] * 1e-6).toFixed(2);
      console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${durationMs} ms)`);
    });
    next();
  };
  
  export const logErrors = (err, req, res, next) => {
    console.error('❗ Error:', {
      error: err.stack || err,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body
      }
    });
    next(err);
  };