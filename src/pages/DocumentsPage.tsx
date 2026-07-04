import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, Search, ListFilter as Filter, MoveHorizontal as MoreHorizontal, FileCheck, Clock, Tag, Download, Eye, Trash2, X, CloudUpload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatDate } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/skeletons'
import { ErrorState, UnauthorizedState, EmptyState } from '@/components/common/states'
import { useState, useCallback, useRef } from 'react'
import { useDocuments } from '@/hooks'
import type { Document } from '@/types'

const documentTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  policy: FileCheck,
  guideline: FileText,
  report: FileText,
  standard: FileCheck,
}

function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const { data: response, isLoading, error, isError, refetch } = useDocuments()
  const documents = response?.data as Document[] | undefined
  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || doc.document_type === selectedType
    return matchesSearch && matchesType
  })

  if (isLoading) return <TableSkeleton rows={8} />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const documentTypes = [...new Set(documents?.map((d) => d.document_type) ?? [])]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage governance documents and policies</p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="flex items-center gap-2">
                {documentTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredDocuments?.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Upload your first document to get started."
          icon={FileText}
          action={
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Document</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Category</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Created</th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments?.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            {(() => {
                              const Icon = documentTypeIcons[doc.document_type] || FileText
                              return <Icon className="h-5 w-5 text-primary" />
                            })()}
                          </div>
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">ID: {doc.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{doc.document_type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground">{doc.category || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={doc.is_approved ? 'success' : 'warning'}
                          className="gap-1"
                        >
                          {doc.is_approved ? (
                            <>
                              <FileCheck className="h-3 w-3" />
                              Approved
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        dragActive={dragActive}
        setDragActive={setDragActive}
      />
    </motion.div>
  )
}

function UploadModal({
  open,
  onClose,
  dragActive,
  setDragActive,
}: {
  open: boolean
  onClose: () => void
  dragActive: boolean
  setDragActive: (active: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [setDragActive])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }, [setDragActive])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setUploading(false)
    onClose()
    setSelectedFile(null)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Upload Document</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            className={cn(
              'relative rounded-xl border-2 border-dashed p-8 text-center transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFile}
              accept=".pdf,.doc,.docx,.md,.txt"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CloudUpload className="h-6 w-6 text-primary" />
              </div>
              {selectedFile ? (
                <>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Drop files here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </>
              )}
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX, MD, TXT
              </p>
            </div>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Document Title</label>
                  <Input placeholder={selectedFile.name.replace(/\.[^/.]+$/, '')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Type</label>
                    <select className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="policy">Policy</option>
                      <option value="guideline">Guideline</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Category</label>
                    <Input placeholder="e.g., Security" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tags</label>
                  <Input placeholder="security, compliance, authentication" />
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="h-4 w-4 border-2 border-background border-t-primary rounded-full mr-2"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DocumentsPage
