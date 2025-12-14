import React, { useState } from 'react';
import { Sparkles, ArrowRight, Globe, Database } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const AIChatBar = ({ onChatResponse }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [enableResearch, setEnableResearch] = useState(true);
  const { toast } = useToast();

  const apiBase = () => {
    const env = process.env.REACT_APP_BACKEND_URL;
    if (env) return env;
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    return isLocal ? 'http://localhost:4000/api' : 'https://orbit-api-614830362243.europe-west9.run.app/api';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${apiBase()}/dashboard/chat`, {
        messages: [{ role: 'user', content: query }],
        include_context: includeContext,
        enable_research: enableResearch,
        research_query: query
      });
      
      onChatResponse(query, response.data.response);
      setQuery('');
    } catch (error) {
      console.error("Chat error", error);
      toast({
        title: "Error",
        description: "Failed to connect to Orbit AI.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          className="w-full pl-12 pr-20 py-4 bg-[#141414]/80 backdrop-blur-xl border border-[#222] rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
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
      <div className="mt-6 flex items-center justify-end text-xs text-gray-400">
        {loading && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-2">Orbit is thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatBar;
