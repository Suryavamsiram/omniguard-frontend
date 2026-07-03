import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, Sparkles, ListFilter as Filter, History, FileText, ChevronDown, Clock, ArrowUpRight, CircleAlert as AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { SearchResultSkeleton } from '@/components/common/skeletons'
import { ErrorState, UnauthorizedState, EmptyState } from '@/components/common/states'
import type { SearchResult } from '@/types'

const searchHistory = [
  { query: 'password policy', time: '2h ago' },
  { query: 'security requirements', time: '1d ago' },
  { query: 'access control', time: '3d ago' },
  { query: 'encryption standards', time: '1w ago' },
]

function SearchPage() {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [searchParams, setSearchParams] = useState({
    top_k: 10,
    similarity_threshold: 0.6,
  })

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const { data } = await axios.get('/api/v1/search/semantic', {
        params: {
          organization_id: 1,
          query: searchQuery,
          top_k: searchParams.top_k,
          similarity_threshold: searchParams.similarity_threshold,
        },
      })
      return data
    },
    onSuccess: () => {
      setHasSearched(true)
    },
  })

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query)
    }
  }

  const results = searchMutation.data?.results as SearchResult[] | undefined
  const isLoading = searchMutation.isPending
  const error = searchMutation.error
  const isError = searchMutation.isError

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Semantic Search</h1>
          <p className="text-muted-foreground">Search documents by meaning, not just keywords</p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="flex items-center gap-2 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <Input
                placeholder="Search for policies, guidelines, security requirements..."
                className="pl-12 pr-4 h-12 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Results:</span>
                <select
                  className="text-sm bg-transparent border border-input rounded-md px-2 py-1"
                  value={searchParams.top_k}
                  onChange={(e) => setSearchParams({ ...searchParams, top_k: Number(e.target.value) })}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Threshold:</span>
                <input
                  type="range"
                  min={0.3}
                  max={0.9}
                  step={0.1}
                  value={searchParams.similarity_threshold}
                  onChange={(e) => setSearchParams({ ...searchParams, similarity_threshold: Number(e.target.value) })}
                  className="w-24"
                />
                <span className="text-sm font-medium">{searchParams.similarity_threshold}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && <SearchResultSkeleton />}

      {isError && !isLoading && (
        (error as any)?.response?.status === 401
          ? <UnauthorizedState />
          : <ErrorState onRetry={handleSearch} />
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          <div className="space-y-4">
            {results && results.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {results.length} results for "{searchMutation.variables}"
                </p>
                <Badge variant="secondary">{searchParams.similarity_threshold}+ similarity</Badge>
              </div>
            )}

            <AnimatePresence mode="wait">
              {results?.length === 0 && hasSearched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState
                    title="No results found"
                    description="Try a different search query or lower the similarity threshold."
                    icon={SearchIcon}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {results?.map((result, index) => (
                <motion.div
                  key={`${result.document_id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <SearchResultCard
                    result={result}
                    searchQuery={searchMutation.variables || ''}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {!hasSearched && !isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">Start searching</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Enter a natural language query to find relevant documents
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                    onClick={() => {
                      setQuery(item.query)
                      searchMutation.mutate(item.query)
                    }}
                  >
                    <span className="truncate">{item.query}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Use natural language for better results</p>
                <p>Be specific about your intent</p>
                <p>Include relevant keywords</p>
                <p>Adjust similarity threshold for precision</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function SearchResultCard({
  result,
  searchQuery,
}: {
  result: SearchResult
  searchQuery: string
}) {
  const similarityPercent = Math.round(result.similarity_score * 100)
  const similarityColor =
    result.similarity_score >= 0.8
      ? 'success'
      : result.similarity_score >= 0.6
      ? 'warning'
      : 'destructive'

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Document #{result.document_id}</p>
                <p className="text-xs text-muted-foreground">
                  Model: {result.embedding_model}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={similarityColor as any} className="font-mono">
                {similarityPercent}% match
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm leading-relaxed">
                <HighlightMatch
                  text={result.content_snippet}
                  query={searchQuery}
                />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Similarity Score</span>
                <span className="text-xs font-medium">{result.similarity_score.toFixed(3)}</span>
              </div>
              <Progress
                value={similarityPercent}
                className="h-1.5"
                indicatorClassName={cn(
                  similarityPercent >= 80
                    ? 'bg-success'
                    : similarityPercent >= 60
                    ? 'bg-warning'
                    : 'bg-destructive'
                )}
              />
            </div>
            <Button variant="outline" size="sm">
              View Document
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean)
  const parts = text.split(/(\s+)/)

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keywords.some((kw) => part.toLowerCase().includes(kw))
        return isMatch ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </>
  )
}

export default SearchPage
