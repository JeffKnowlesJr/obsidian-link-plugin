import { ASTNode } from '../types';
export class Transformer {
  transform(ast: ASTNode[]): string {
    return ast.map(node => node.content || '').join('\n');
  }
} 