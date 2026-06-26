'use client'

import { useState, useEffect } from 'react'
import KnowledgeGraph from '@/components/graph/KnowledgeGraph'
import toast from 'react-hot-toast'

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

  const handleDeleteNode = async () => {
    if (!selectedNode) return

    const res = await fetch('/api/graph', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId: selectedNode.id }),
    })

    if (res.ok) {
      setNodes(nodes.filter((n) => n.id !== selectedNode.id))
      setEdges(edges.filter((e) => e.source_node_id !== selectedNode.id && e.target_node_id !== selectedNode.id))
      setSelectedNode(null)
      toast.success('Node deleted')
    } else {
      toast.error('Failed to delete node')
    }
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
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === type
                  ? 'bg-white text-black'
                  : 'bg-[#101012] text-[#a1a4a5] border border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.24)]'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 text-xs text-[#464a4d]">
          {nodes.length} nodes · {edges.length} edges
        </div>
      </div>

      {selectedNode && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSelectedNode(null)} />
          <div className="fixed bottom-0 left-0 right-0 md:static md:w-72 z-50 md:z-auto border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.06)] p-4 overflow-auto animate-slide-up md:animate-fade-in-left bg-[#000000] md:bg-transparent max-h-[60vh] md:max-h-none rounded-t-xl md:rounded-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{selectedNode.label}</h3>
              <button onClick={() => setSelectedNode(null)} className="text-[#464a4d] hover:text-[#fcfdff] transition-colors">x</button>
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
            <button onClick={handleDeleteNode} className="mt-6 w-full px-3 py-2 text-xs font-medium text-[#ff2047] bg-[rgba(255,32,71,0.08)] hover:bg-[rgba(255,32,71,0.15)] rounded-lg transition-all duration-200">
              Delete Node
            </button>
          </div>
        </>
      )}
    </div>
  )
}
