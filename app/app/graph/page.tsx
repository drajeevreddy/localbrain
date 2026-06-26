'use client'

import { useState, useEffect } from 'react'
import KnowledgeGraph from '@/components/graph/KnowledgeGraph'

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

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [filter, setFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGraph()
  }, [filter])

  const fetchGraph = async () => {
    setLoading(true)
    const params = filter ? `?type=${filter}` : ''
    const res = await fetch(`/api/graph${params}`)
    if (res.ok) {
      const data = await res.json()
      setNodes(data.nodes)
      setEdges(data.edges)
    }
    setLoading(false)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#464a4d]">
            Loading graph...
          </div>
        ) : (
          <KnowledgeGraph
            nodes={nodes}
            edges={edges}
            onNodeClick={setSelectedNode}
          />
        )}

        <div className="absolute top-4 left-4 flex gap-2">
          {['', 'concept', 'entity', 'tag'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === type
                  ? 'bg-white text-black'
                  : 'bg-[#101012] text-[#a1a4a5] border border-[rgba(255,255,255,0.14)]'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div className="w-72 border-l border-[rgba(255,255,255,0.06)] p-4 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{selectedNode.label}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#464a4d] hover:text-[#fcfdff]"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-[#a1a4a5]">Type</span>
              <p className="text-sm capitalize">{selectedNode.type}</p>
            </div>
            <div>
              <span className="text-xs text-[#a1a4a5]">Connections</span>
              <p className="text-sm">{selectedNode.degree}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
