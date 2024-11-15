export class LinkPluginError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'LinkPluginError'
  }
}

export enum ErrorCode {
  // File System Errors
  FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FOLDER_CREATION_FAILED = 'FOLDER_CREATION_FAILED',

  // Template Errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_INVALID = 'TEMPLATE_INVALID',

  // Settings Errors
  SETTINGS_INVALID = 'SETTINGS_INVALID',
  SETTINGS_LOAD_FAILED = 'SETTINGS_LOAD_FAILED',

  // Note Creation Errors
  NOTE_CREATION_FAILED = 'NOTE_CREATION_FAILED',
  INVALID_NOTE_NAME = 'INVALID_NOTE_NAME',

  // General Errors
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  INVALID_OPERATION = 'INVALID_OPERATION',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

export function handleError(error: unknown): LinkPluginError {
  console.debug('Handling error:', error)

  if (error instanceof LinkPluginError) {
    return error
  }

  if (error instanceof Error) {
    // Convert common error types to LinkPluginError
    if (error.message.includes('already exists')) {
      return new LinkPluginError(
        'A file with this name already exists',
        ErrorCode.FILE_ALREADY_EXISTS,
        error
      )
    }

    if (error.message.includes('not found')) {
      return new LinkPluginError(
        'The requested file or folder was not found',
        ErrorCode.FILE_NOT_FOUND,
        error
      )
    }
  }

  // Default case for unknown errors
  return new LinkPluginError(
    'An unexpected error occurred',
    ErrorCode.UNEXPECTED_ERROR,
    error
  )
}

export function getUserFriendlyMessage(error: LinkPluginError): string {
  switch (error.code) {
    case ErrorCode.FILE_ALREADY_EXISTS:
      return 'A note with this name already exists. Please choose a different name.'

    case ErrorCode.FILE_NOT_FOUND:
      return 'The specified file or folder could not be found.'

    case ErrorCode.FOLDER_CREATION_FAILED:
      return 'Failed to create the required folder structure.'

    case ErrorCode.TEMPLATE_NOT_FOUND:
      return 'The template file could not be found. Using default template instead.'

    case ErrorCode.TEMPLATE_INVALID:
      return 'The template file is invalid or corrupted.'

    case ErrorCode.SETTINGS_INVALID:
      return 'The plugin settings are invalid. Please check your configuration.'

    case ErrorCode.NOTE_CREATION_FAILED:
      return 'Failed to create the new note. Please try again.'

    case ErrorCode.INVALID_NOTE_NAME:
      return 'The note name contains invalid characters. Please use a different name.'

    default:
      return 'An unexpected error occurred. Please check the console for details.'
  }
}
