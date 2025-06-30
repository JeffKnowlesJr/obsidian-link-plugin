import { Token, ASTNode } from '../types';

export class Parser {
  /**
   * Parse tokens into an Abstract Syntax Tree
   */
  parse(tokens: Token[]): ASTNode[] {
    const ast: ASTNode[] = [];
    let currentNode: ASTNode | null = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      switch (token.type) {
        case 'element':
          // Create a new element node
          currentNode = {
            type: 'element',
            name: token.value,
            children: []
          };

          // Check for multiplier
          if (token.children && token.children.length > 0) {
            const multiplier = token.children.find(child => child.type === 'multiplier');
            if (multiplier) {
              currentNode.repeat = parseInt(multiplier.value, 10);
            }
          }

          ast.push(currentNode);
          break;

        case 'content':
          // Add content to the current node
          if (currentNode) {
            currentNode.content = token.value;
          }
          break;

        case 'attribute':
          // Parse attributes and add to current node
          if (currentNode) {
            currentNode.attributes = this.parseAttributes(token.value);
          }
          break;

        case 'operator':
          // Handle operators
          if (token.value === '>' && i + 1 < tokens.length) {
            // Child operator - process the next token as a child of current
            const childTokens = [tokens[++i]];
            const childNodes = this.parse(childTokens);

            if (currentNode && childNodes.length > 0) {
              currentNode.children = currentNode.children || [];
              currentNode.children.push(...childNodes);
              // Set parent reference
              childNodes.forEach(child => child.parent = currentNode!.name);
            }
          } else if (token.value === '+') {
            // Sibling operator - just continue to next token
            continue;
          }
          break;

        case 'group':
          // Process group as a collection of elements
          if (token.children) {
            const groupNodes = this.parse(token.children);
            ast.push(...groupNodes);
          }
          break;
      }
    }

    return ast;
  }

  private parseAttributes(attrString: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    // Simple attribute parsing - can be enhanced for more complex cases
    if (attrString.includes('=')) {
      // Format: attr1=value1 attr2=value2
      const pairs = attrString.split(/\s+/);
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          attributes[key] = value.replace(/["']/g, ''); // Remove quotes
        }
      }
    } else {
      // Single value attribute
      attributes.value = attrString;
    }

    return attributes;
  }

  /**
   * Validate the AST structure
   */
  validate(ast: ASTNode[]): boolean {
    for (const node of ast) {
      if (!node.name && node.type === 'element') {
        return false;
      }

      if (node.children && node.children.length > 0) {
        if (!this.validate(node.children)) {
          return false;
        }
      }
    }

    return true;
  }
}