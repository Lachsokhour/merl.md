/* eslint-disable @typescript-eslint/no-explicit-any */
import { visit } from 'unist-util-visit'

export default function rehypeAlert() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'blockquote') return
      const firstP = node.children?.find((c: any) => c.tagName === 'p')
      if (!firstP) return
      const firstText = firstP.children?.find((c: any) => c.type === 'text')
      if (!firstText) return
      const match = firstText.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i)
      if (!match) return
      const type = match[1].toUpperCase()
      node.properties = { ...node.properties, alertType: type }
      firstText.value = firstText.value.slice(match[0].length).trimStart()
      if (firstText.value === '' && firstP.children.length === 1) {
        const idx = node.children.indexOf(firstP)
        if (idx !== -1) node.children.splice(idx, 1)
      } else {
        firstP.properties = {
          ...firstP.properties,
          className: [...(firstP.properties?.className || []), 'alert-title'],
        }
      }
    })
  }
}
