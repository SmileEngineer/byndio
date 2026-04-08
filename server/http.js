export function parseBody(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.details = details;
    throw error;
  }

  return parsed.data;
}

export function sendError(res, error) {
  const status = error.statusCode || 500;
  return res.status(status).json({
    error: error.message || 'Unexpected server error.',
    details: error.details || undefined,
  });
}
