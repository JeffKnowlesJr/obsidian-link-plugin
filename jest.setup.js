// Mock console methods
global.console = {
  ...console,
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}

// Mock Notice class from Obsidian
global.Notice = jest.fn()
