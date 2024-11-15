import {
  LinkPluginError,
  ErrorCode,
  handleError,
  getUserFriendlyMessage
} from '../errorUtils'

describe('Error Handling System', () => {
  describe('LinkPluginError', () => {
    it('should create error with correct properties', () => {
      const error = new LinkPluginError(
        'Test error message',
        ErrorCode.FILE_NOT_FOUND,
        { fileName: 'test.md' }
      )

      expect(error.message).toBe('Test error message')
      expect(error.code).toBe(ErrorCode.FILE_NOT_FOUND)
      expect(error.details).toEqual({ fileName: 'test.md' })
      expect(error.name).toBe('LinkPluginError')
    })
  })

  describe('handleError', () => {
    it('should return the same error if already LinkPluginError', () => {
      const originalError = new LinkPluginError(
        'Original error',
        ErrorCode.FILE_NOT_FOUND
      )
      const handledError = handleError(originalError)

      expect(handledError).toBe(originalError)
    })

    it('should convert "already exists" error', () => {
      const error = new Error('File already exists: test.md')
      const handledError = handleError(error)

      expect(handledError).toBeInstanceOf(LinkPluginError)
      expect(handledError.code).toBe(ErrorCode.FILE_ALREADY_EXISTS)
    })

    it('should convert "not found" error', () => {
      const error = new Error('File not found: test.md')
      const handledError = handleError(error)

      expect(handledError).toBeInstanceOf(LinkPluginError)
      expect(handledError.code).toBe(ErrorCode.FILE_NOT_FOUND)
    })

    it('should handle unknown errors', () => {
      const error = new Error('Some random error')
      const handledError = handleError(error)

      expect(handledError).toBeInstanceOf(LinkPluginError)
      expect(handledError.code).toBe(ErrorCode.UNEXPECTED_ERROR)
    })

    it('should handle non-Error objects', () => {
      const error = { message: 'Not an Error instance' }
      const handledError = handleError(error)

      expect(handledError).toBeInstanceOf(LinkPluginError)
      expect(handledError.code).toBe(ErrorCode.UNEXPECTED_ERROR)
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return appropriate message for FILE_ALREADY_EXISTS', () => {
      const error = new LinkPluginError('', ErrorCode.FILE_ALREADY_EXISTS)
      expect(getUserFriendlyMessage(error)).toContain('already exists')
    })

    it('should return appropriate message for FILE_NOT_FOUND', () => {
      const error = new LinkPluginError('', ErrorCode.FILE_NOT_FOUND)
      expect(getUserFriendlyMessage(error)).toContain('could not be found')
    })

    it('should return appropriate message for TEMPLATE_NOT_FOUND', () => {
      const error = new LinkPluginError('', ErrorCode.TEMPLATE_NOT_FOUND)
      expect(getUserFriendlyMessage(error)).toContain('template')
    })

    it('should return appropriate message for INVALID_NOTE_NAME', () => {
      const error = new LinkPluginError('', ErrorCode.INVALID_NOTE_NAME)
      expect(getUserFriendlyMessage(error)).toContain('invalid characters')
    })

    it('should return default message for unknown error codes', () => {
      const error = new LinkPluginError('', 'UNKNOWN_CODE' as ErrorCode)
      expect(getUserFriendlyMessage(error)).toContain('unexpected error')
    })
  })
})
