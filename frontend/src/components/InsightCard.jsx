import React from 'react';
import { ArrowUpRight, ShieldAlert, Zap, Info, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const InsightCard = ({ insight }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <ShieldAlert className="w-5 h-5 text-[#FF6633]" />;
      case 'opportunity': return <Zap className="w-5 h-5 text-[#FFE066]" />;
      default: return <Info className="w-5 h-5 text-[#8B5CF6]" />;
    }
  };

  const getGlowColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-[#FF6633]';
      case 'opportunity': return 'bg-[#FFE066]';
      default: return 'bg-[#8B5CF6]';
    }
  };

  const relativeTime = formatRelativeTime(insight.timestamp);

  return (
    <div className="group relative bg-[#141414] rounded-[24px] p-6 border border-[#222] hover:border-[#333] transition-all duration-300 hover:-translate-y-1">
      {/* Top Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] ${getGlowColor(insight.type)} opacity-50 blur-[2px] group-hover:w-3/4 transition-all duration-500`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${getGlowColor(insight.type)}/10 border border-${getGlowColor(insight.type)}/20`}>
          {getIcon(insight.type)}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${insight.type === 'opportunity' ? 'text-[#33FFCC] bg-[#33FFCC]/10' :
              insight.type === 'warning' ? 'text-[#FF6633] bg-[#FF6633]/10' :
                'text-gray-400 bg-[#222]'
            }`}>
            {insight.impact}
          </span>
          {relativeTime && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">{relativeTime}</span>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#FFE066] transition-colors">
        {insight.title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        {insight.message}
      </p>

      <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#8B5CF6] transition-colors group/btn">
        View Details
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </button>
    </div>
  );
};

export default InsightCard;

