import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const AIChatBar = ({ onChatResponse }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/chat`, {
        messages: [{ role: 'user', content: query }]
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFE066] via-[#8B5CF6] to-[#33FFCC] rounded-full opacity-20 blur-xl animate-pulse" />
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Sparkles className="w-5 h-5 text-[#FFE066]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Orbit AI to analyze your portfolio or find yield..."
          className="w-full pl-12 pr-12 py-4 bg-[#141414]/80 backdrop-blur-xl border border-[#222] rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
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
      </form>
    </div>
  );
};

export default AIChatBar;
