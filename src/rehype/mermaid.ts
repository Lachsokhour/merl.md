/* eslint-disable @typescript-eslint/no-explicit-any */
import { visit } from 'unist-util-visit'

export default function rehypeMermaid() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (node.tagName === 'code' && node.properties?.className?.includes('language-mermaid') && parent && index !== undefined) {
        node.tagName = 'div'
        node.properties.className = ['mermaid']
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['mermaid-wrap'] },
          children: [node],
        }
      }
    })
  }
}
