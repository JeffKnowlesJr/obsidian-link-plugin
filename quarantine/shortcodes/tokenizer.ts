import { Token } from '../types';

export class Tokenizer {
  /**
   * Tokenize an Emmet-like shortcode string
   */
  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let currentPos = 0;

    while (currentPos < input.length) {
      const char = input[currentPos];

      // Handle element names (h1, p, div, etc)
      if (this.isNameChar(char)) {
        const { token, newPos } = this.tokenizeElement(input, currentPos);
        tokens.push(token);
        currentPos = newPos;
        continue;
      }

      // Handle operators (>, +, *)
      if (this.isOperator(char)) {
        tokens.push({
          type: 'operator',
          value: char
        });
        currentPos++;
        continue;
      }

      // Handle content within curly braces {content}
      if (char === '{') {
        const { token, newPos } = this.tokenizeContent(input, currentPos);
        tokens.push(token);
        currentPos = newPos;
        continue;
      }

      // Handle attributes within square brackets [attr]
      if (char === '[') {
        const { token, newPos } = this.tokenizeAttribute(input, currentPos);
        tokens.push(token);
        currentPos = newPos;
        continue;
      }

      // Handle groups with parentheses (group)
      if (char === '(') {
        const { token, newPos } = this.tokenizeGroup(input, currentPos);
        tokens.push(token);
        currentPos = newPos;
        continue;
      }

      // Skip whitespace
      if (char === ' ' || char === '\t' || char === '\n') {
        currentPos++;
        continue;
      }

      // Unknown character
      throw new Error(`Unexpected character: ${char} at position ${currentPos}`);
    }

    return tokens;
  }

  private tokenizeElement(input: string, startPos: number): { token: Token, newPos: number } {
    let endPos = startPos;
    while (endPos < input.length && this.isNameChar(input[endPos])) {
      endPos++;
    }

    // Check for multiplier (*N)
    if (endPos < input.length && input[endPos] === '*') {
      const elementName = input.substring(startPos, endPos);
      endPos++; // Skip the *

      // Parse the number
      const numberStartPos = endPos;
      while (endPos < input.length && /\d/.test(input[endPos])) {
        endPos++;
      }

      const multiplier = parseInt(input.substring(numberStartPos, endPos), 10);

      return {
        token: {
          type: 'element',
          value: elementName,
          children: [{
            type: 'multiplier',
            value: multiplier.toString()
          }]
        },
        newPos: endPos
      };
    }

    return {
      token: {
        type: 'element',
        value: input.substring(startPos, endPos)
      },
      newPos: endPos
    };
  }

  private tokenizeContent(input: string, startPos: number): { token: Token, newPos: number } {
    let endPos = startPos + 1; // Skip opening {
    let depth = 1;

    while (endPos < input.length && depth > 0) {
      if (input[endPos] === '{') depth++;
      if (input[endPos] === '}') depth--;
      endPos++;
    }

    if (depth !== 0) {
      throw new Error('Unclosed content braces');
    }

    return {
      token: {
        type: 'content',
        value: input.substring(startPos + 1, endPos - 1)
      },
      newPos: endPos
    };
  }

  private tokenizeAttribute(input: string, startPos: number): { token: Token, newPos: number } {
    let endPos = startPos + 1; // Skip opening [
    let depth = 1;

    while (endPos < input.length && depth > 0) {
      if (input[endPos] === '[') depth++;
      if (input[endPos] === ']') depth--;
      endPos++;
    }

    if (depth !== 0) {
      throw new Error('Unclosed attribute brackets');
    }

    return {
      token: {
        type: 'attribute',
        value: input.substring(startPos + 1, endPos - 1)
      },
      newPos: endPos
    };
  }

  private tokenizeGroup(input: string, startPos: number): { token: Token, newPos: number } {
    let endPos = startPos + 1; // Skip opening (
    let depth = 1;

    while (endPos < input.length && depth > 0) {
      if (input[endPos] === '(') depth++;
      if (input[endPos] === ')') depth--;
      endPos++;
    }

    if (depth !== 0) {
      throw new Error('Unclosed group parentheses');
    }

    // Tokenize the contents of the group
    const groupContent = input.substring(startPos + 1, endPos - 1);
    const childTokens = new Tokenizer().tokenize(groupContent);

    return {
      token: {
        type: 'group',
        value: groupContent,
        children: childTokens
      },
      newPos: endPos
    };
  }

  private isNameChar(char: string): boolean {
    return /[a-zA-Z0-9_-]/.test(char);
  }

  private isOperator(char: string): boolean {
    return char === '>' || char === '+' || char === '*';
  }
} 