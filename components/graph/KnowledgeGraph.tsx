'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface GraphNode {
  id: string
  label: string
  type: string
  degree: number
}

interface GraphEdge {
  id: string
  source_node_id: string
  target_node_id: string
  relationship: string
  weight: number
}

interface KnowledgeGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick?: (node: GraphNode) => void
}

const typeColors: Record<string, string> = {
  concept: '#3b9eff',
  entity: '#a855f7',
  tag: '#11ff99',
}

export default function KnowledgeGraph({ nodes, edges, onNodeClick }: KnowledgeGraphProps) {
  const flowNodes: Node[] = useMemo(
    () =>
      nodes.map((n, i) => ({
        id: n.id,
        data: { label: n.label },
        position: {
          x: Math.cos((2 * Math.PI * i) / nodes.length) * 300 + 400,
          y: Math.sin((2 * Math.PI * i) / nodes.length) * 300 + 300,
        },
        style: {
          background: '#0a0a0c',
          border: `2px solid ${typeColors[n.type] ?? '#3b9eff'}`,
          borderRadius: '12px',
          padding: '8px 16px',
          fontSize: '13px',
          color: '#fcfdff',
          minWidth: 80,
          cursor: 'pointer',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        },
      })),
    [nodes]
  )

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.relationship,
        animated: true,
        style: {
          stroke: 'rgba(255,255,255,0.14)',
          strokeWidth: Math.max(1, e.weight),
          transition: 'stroke 0.2s ease',
        },
        labelStyle: {
          fill: '#a1a4a5',
          fontSize: 10,
        },
        type: 'smoothstep',
      })),
    [edges]
  )

  const [flowNodesState, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [flowEdgesState, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  useMemo(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges])

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = nodes.find((n) => n.id === node.id)
      if (graphNode && onNodeClick) {
        onNodeClick(graphNode)
      }
    },
    [nodes, onNodeClick]
  )

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#464a4d] text-sm">
        No graph data yet. Add notes to build your knowledge graph.
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={flowNodesState}
        edges={flowEdgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        style={{ background: '#000000' }}
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.06)" />
        <Controls style={{ background: '#0a0a0c', borderColor: 'rgba(255,255,255,0.14)' }} />
        <MiniMap
          style={{ background: '#0a0a0c', borderColor: 'rgba(255,255,255,0.14)' }}
          nodeColor={(n) => typeColors[(n as Node & { type?: string }).type ?? 'concept'] ?? '#3b9eff'}
        />
      </ReactFlow>
    </div>
  )
}
