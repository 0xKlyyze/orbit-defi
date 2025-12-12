import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownMessage = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({node, ...props}) => (
            <a
              className="text-[#33FFCC] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: ({node, inline, className, children, ...props}) => (
            <code className={`rounded px-1.5 py-0.5 bg-[#111] border border-[#222] ${className || ''}`}{...props}>{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;