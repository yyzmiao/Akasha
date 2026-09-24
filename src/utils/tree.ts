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

/**
 * Gather a todo ID and all of its recursive descendant child IDs
 */
export function getDescendantTodoIds(todos: TodoItem[], rootId: string): string[] {
  const result: string[] = [rootId]
  const childrenMap = new Map<string, string[]>()

  for (const t of todos) {
    if (t.parentId) {
      if (!childrenMap.has(t.parentId)) {
        childrenMap.set(t.parentId, [])
      }
      childrenMap.get(t.parentId)!.push(t.id)
    }
  }

  const visited = new Set<string>([rootId])
  function collect(id: string) {
    const childIds = childrenMap.get(id)
    if (childIds && childIds.length > 0) {
      for (const cid of childIds) {
        if (!visited.has(cid)) {
          visited.add(cid)
          result.push(cid)
          collect(cid)
        }
      }
    }
  }

  collect(rootId)
  return result
}

/**
 * Calculate parent-child completion linkage:
 * - When completing a parent: all descendants are marked completed
 * - When uncompleting a parent: only the parent itself is uncompleted (subtask progress preserved)
 * - When uncompleting a child: all ancestor parents are marked uncompleted
 * - When completing a child: if all sibling children of a parent are now completed, parent is marked completed (cascades upwards)
 */
export function calculateLinkedTodoCompletion(
  todos: TodoItem[],
  targetId: string,
  willBeCompleted: boolean
): { updatedTodos: TodoItem[]; changedTodos: TodoItem[] } {
  const itemMap = new Map<string, TodoItem>()
  for (const t of todos) {
    itemMap.set(t.id, { ...t })
  }

  const target = itemMap.get(targetId)
  if (!target) {
    return { updatedTodos: todos, changedTodos: [] }
  }

  target.completed = willBeCompleted

  if (willBeCompleted) {
    // 1. Downward cascade: Complete all descendants
    const descendantIds = getDescendantTodoIds(todos, targetId).slice(1)
    for (const dId of descendantIds) {
      const d = itemMap.get(dId)
      if (d) {
        d.completed = true
      }
    }

    // 2. Upward cascade: If all children of an ancestor are now completed, complete the ancestor
    const visitedAncestors = new Set<string>()
    let currentParentId = target.parentId
    while (currentParentId && !visitedAncestors.has(currentParentId)) {
      visitedAncestors.add(currentParentId)
      const parent = itemMap.get(currentParentId)
      if (!parent) break

      const siblings = Array.from(itemMap.values()).filter((it) => it.parentId === currentParentId)
      const allSiblingsCompleted = siblings.every((it) => it.completed)
      if (allSiblingsCompleted) {
        parent.completed = true
        currentParentId = parent.parentId
      } else {
        break
      }
    }
  } else {
    // Uncompleting:
    // 1. Downward: Only target itself is uncompleted, children remain as-is
    // 2. Upward: Any ancestor parent CANNOT be completed if a child is incomplete
    const visitedAncestors = new Set<string>()
    let currentParentId = target.parentId
    while (currentParentId && !visitedAncestors.has(currentParentId)) {
      visitedAncestors.add(currentParentId)
      const parent = itemMap.get(currentParentId)
      if (!parent) break
      parent.completed = false
      currentParentId = parent.parentId
    }
  }

  const updatedTodos = Array.from(itemMap.values())
  const originalMap = new Map(todos.map((t) => [t.id, t.completed]))
  const changedTodos = updatedTodos.filter((t) => t.completed !== originalMap.get(t.id))

  return { updatedTodos, changedTodos }
}
