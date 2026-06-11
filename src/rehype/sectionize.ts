/* eslint-disable @typescript-eslint/no-explicit-any */
export default function rehypeSectionize() {
  return (tree: any) => {
    const stack: any[] = [{ level: 0, children: [] }]
    for (const child of (tree.children || [])) {
      const tag = child.tagName
      const match = tag && tag.match(/^h([1-6])$/)
      if (match) {
        const level = parseInt(match[1])
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
          const section = stack.pop()!
          stack[stack.length - 1].children.push(section.element)
        }
        const sectionChildren = [child]
        stack.push({ level, element: { type: 'element', tagName: 'section', properties: {}, children: sectionChildren }, children: sectionChildren })
      } else {
        stack[stack.length - 1].children.push(child)
      }
    }
    while (stack.length > 1) {
      const section = stack.pop()!
      stack[stack.length - 1].children.push(section.element)
    }
    tree.children = stack[0].children
  }
}
