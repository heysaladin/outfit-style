import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
}

export interface TreeViewProps {
  data: TreeNode[]
  defaultExpanded?: string[]
  selected?: string
  onSelect?: (node: TreeNode) => void
  className?: string
}

function TreeView({
  data,
  defaultExpanded = [],
  selected,
  onSelect,
  className,
}: TreeViewProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <ul role="tree" className={cn("space-y-0.5 text-sm", className)}>
      {data.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          expanded={expanded}
          selected={selected}
          onToggle={toggle}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </ul>
  )
}

interface TreeNodeItemProps {
  node: TreeNode
  expanded: Set<string>
  selected?: string
  onToggle: (id: string) => void
  onSelect?: (node: TreeNode) => void
  depth: number
}

function TreeNodeItem({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
  depth,
}: TreeNodeItemProps) {
  const hasChildren = !!node.children?.length
  const isExpanded = expanded.has(node.id)
  const isSelected = selected === node.id

  const DefaultIcon = hasChildren
    ? isExpanded
      ? FolderOpen
      : Folder
    : File

  return (
    <li
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1.5 text-left transition-colors",
          isSelected
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent/50"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: "8px" }}
        onClick={() => {
          if (hasChildren) onToggle(node.id)
          onSelect?.(node)
        }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        ) : (
          <span className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="shrink-0 text-muted-foreground">
          {node.icon ?? <DefaultIcon className="h-4 w-4" />}
        </span>
        <span className="truncate">{node.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <ul role="group">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export { TreeView }
