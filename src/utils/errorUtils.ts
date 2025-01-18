export enum ErrorCode {
  INVALID_NOTE_NAME = 'INVALID_NOTE_NAME',
  FOLDER_CREATION_FAILED = 'FOLDER_CREATION_FAILED',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_API_KEY = 'INVALID_API_KEY'
}

export class LinkPluginError extends Error {
  constructor(message: string, public code: ErrorCode) {
    super(message)
    this.name = 'LinkPluginError'
  }
}

export const createError = (
  message: string,
  code: ErrorCode
): LinkPluginError => {
  return new LinkPluginError(message, code)
}
