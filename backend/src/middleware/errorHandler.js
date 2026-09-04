export function errorHandler(error, request, reply) {
  request.log.error(error)
  if (reply.sent) return

  if (error?.validation) {
    return reply.code(400).send({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '请求参数不合法' },
    })
  }

  if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.code(error.statusCode).send({
      success: false,
      error: {
        code: error.code ?? 'BAD_REQUEST',
        message: error.message ?? '请求无法处理',
      },
    })
  }

  return reply.code(500).send({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
  })
}
