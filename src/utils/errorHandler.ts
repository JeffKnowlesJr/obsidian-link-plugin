import { Notice } from 'obsidian'

export class LinkPluginError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'LinkPluginError'
  }
}

export enum ErrorCode {
  FILE_CREATION_FAILED = 'FILE_CREATION_FAILED',
  INVALID_FILENAME = 'INVALID_FILENAME',
  FILE_EXISTS = 'FILE_EXISTS',
  LINK_INSERTION_FAILED = 'LINK_INSERTION_FAILED',
  INVALID_NOTE_NAME = 'INVALID_NOTE_NAME',
  FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',
  FILE_OPERATION_FAILED = 'FILE_OPERATION_FAILED'
}

export function handlePluginError(error: unknown, context: string): never {
  const pluginError = ensurePluginError(error, context)

  // Log error for debugging
  console.error(`[Link Plugin] ${context}:`, pluginError)

  // Show user-friendly notice
  new Notice(`Link Plugin: ${pluginError.message}`)

  throw pluginError
}

function ensurePluginError(error: unknown, context: string): LinkPluginError {
  if (error instanceof LinkPluginError) {
    return error
  }

  const message = error instanceof Error ? error.message : String(error)
  return new LinkPluginError(
    `${context}: ${message}`,
    ErrorCode.FILE_CREATION_FAILED,
    error instanceof Error ? error : undefined
  )
}
