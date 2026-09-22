import type { TodoItem } from '@/types'

export function buildTodoTree(items: TodoItem[]): TodoItem[] {
  const itemMap = new Map<string, TodoItem>()
  const roots: TodoItem[] = []

  items.forEach((item) => {
    itemMap.set(item.id, {
      ...item,
      children: [],
      collapsed: item.collapsed ?? false,
    })
  })

  items.forEach((item) => {
    const node = itemMap.get(item.id)!
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (nodes: TodoItem[]) => {
    nodes.sort((a, b) => a.order - b.order)
    nodes.forEach((n) => {
      if (n.children && n.children.length > 0) {
        sortNodes(n.children)
      }
    })
  }

  sortNodes(roots)
  return roots
}

export function flattenTodoTree(tree: TodoItem[]): TodoItem[] {
  const result: TodoItem[] = []
  function traverse(node: TodoItem, parentId: string | null, order: number) {
    const { children, ...rest } = node
    result.push({
      ...rest,
      parentId,
      order,
    })
    if (children && children.length > 0) {
      children.forEach((child, idx) => {
        traverse(child, node.id, idx)
      })
    }
  }
  tree.forEach((root, idx) => {
    traverse(root, null, idx)
  })
  return result
}

export function getAllDatedTodos(items: TodoItem[]): TodoItem[] {
  return items.filter((item) => !!item.dueDate || !!item.startDate)
}
