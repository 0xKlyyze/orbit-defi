import React, { useState } from 'react';
import { Sparkles, ArrowRight, Globe, Database, AlertCircle, RotateCcw, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const AIChatBar = ({ onChatResponse }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [enableResearch, setEnableResearch] = useState(true);
  const [error, setError] = useState(null);
  const [lastFailedQuery, setLastFailedQuery] = useState('');
  const { toast } = useToast();

  const apiBase = () => {
    const env = process.env.REACT_APP_BACKEND_URL;
    if (env) return env;
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    return isLocal ? 'http://localhost:4000/api' : 'https://orbit-api-614830362243.europe-west9.run.app/api';
  };

  /**
   * Get user-friendly error message based on error type
   */
  const getErrorMessage = (error) => {
    // Network error (no response)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          title: 'Request Timeout',
          description: 'The AI is taking too long to respond. Please try again.',
          type: 'timeout'
        };
      }
      return {
        title: 'Connection Failed',
        description: 'Unable to reach Orbit AI. Check your internet connection.',
        type: 'network'
      };
    }

    const status = error.response.status;

    switch (status) {
      case 401:
        return {
          title: 'Session Expired',
          description: 'Please sign in again to continue using Orbit AI.',
          type: 'auth'
        };
      case 403:
        return {
          title: 'Access Denied',
          description: 'You don\'t have permission to use this feature.',
          type: 'forbidden'
        };
      case 429:
        return {
          title: 'Too Many Requests',
          description: 'You\'ve reached the rate limit. Please wait a moment.',
          type: 'ratelimit'
        };
      case 500:
      case 502:
      case 503:
        return {
          title: 'Service Unavailable',
          description: 'Orbit AI is temporarily down. Please try again later.',
          type: 'server'
        };
      default:
        return {
          title: 'Something Went Wrong',
          description: error.response.data?.error || 'An unexpected error occurred.',
          type: 'unknown'
        };
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const searchQuery = query.trim() || lastFailedQuery;
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiBase()}/dashboard/chat`, {
        messages: [{ role: 'user', content: searchQuery }],
        include_context: includeContext,
        enable_research: enableResearch,
        research_query: searchQuery
      }, {
        timeout: 60000 // 60 second timeout
      });

      onChatResponse(searchQuery, response.data.response);
      setQuery('');
      setLastFailedQuery('');
    } catch (err) {
      console.error("Chat error", err);
      const errorInfo = getErrorMessage(err);

      setError(errorInfo);
      setLastFailedQuery(searchQuery);

      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSearch();
    }
  };

  const dismissError = () => {
    setError(null);
    setLastFailedQuery('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 z-20">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFE066] via-[#8B5CF6] to-[#33FFCC] rounded-full opacity-20 blur-xl animate-pulse pointer-events-none" />
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Sparkles className="w-5 h-5 text-[#FFE066]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Orbit AI to analyze your portfolio or find yield..."
          className={`w-full pl-12 pr-20 py-4 bg-[#141414]/80 backdrop-blur-xl border rounded-full text-white placeholder-gray-500 focus:outline-none transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] ${error
              ? 'border-[#FF6633]/50 focus:border-[#FF6633]/70 focus:ring-1 focus:ring-[#FF6633]/50'
              : 'border-[#222] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50'
            }`}
          disabled={loading}
        />
        <div className="absolute inset-y-0 right-4 flex items-center gap-3">
          <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded border border-[#333] bg-[#222] px-2 font-mono text-[10px] font-medium text-gray-400">
            <span className="text-xs">⌘</span>K
          </kbd>
          <button
            type="submit"
            disabled={loading}
            className="p-1.5 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] transition-colors disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {/* Overlapping toggles anchored to the input, clickable */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIncludeContext(v => !v)}
            title={includeContext ? 'Including portfolio context' : 'Context disabled'}
            aria-label="Toggle portfolio context"
            aria-pressed={includeContext}
            className={`flex items-center justify-center h-9 w-9 rounded-full border transition-all ${includeContext ? 'bg-[#1A1A1A] border-[#8B5CF6]/50 text-white' : 'bg-[#111] border-[#333] text-gray-400'}`}
          >
            <Database className={`w-4 h-4 ${includeContext ? 'text-[#8B5CF6]' : 'text-gray-500'}`} />
          </button>
          <button
            type="button"
            onClick={() => setEnableResearch(v => !v)}
            title={enableResearch ? 'Web research enabled' : 'Web research disabled'}
            aria-label="Toggle web research"
            aria-pressed={enableResearch}
            className={`flex items-center justify-center h-9 w-9 rounded-full border transition-all ${enableResearch ? 'bg-[#1A1A1A] border-[#33FFCC]/50 text-white' : 'bg-[#111] border-[#333] text-gray-400'}`}
          >
            <Globe className={`w-4 h-4 ${enableResearch ? 'text-[#33FFCC]' : 'text-gray-500'}`} />
          </button>
        </div>
      </form>

      {/* Status Area - Loading or Error */}
      <div className="mt-6 flex items-center justify-center min-h-[24px]">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-2">Orbit is thinking…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 px-4 py-2 bg-[#FF6633]/10 border border-[#FF6633]/30 rounded-full animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-[#FF6633]" />
            <span className="text-xs text-[#FF6633] font-medium">{error.title}</span>

            {/* Retry button */}
            {lastFailedQuery && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#FF6633]/20 hover:bg-[#FF6633]/30 rounded-full transition-colors"
                title="Retry last query"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}

            {/* Dismiss button */}
            <button
              onClick={dismissError}
              className="p-1 text-[#FF6633]/70 hover:text-[#FF6633] transition-colors"
              title="Dismiss error"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatBar;
