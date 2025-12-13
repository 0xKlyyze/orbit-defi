import React from 'react';
import * as Select from '@radix-ui/react-select';

const COLORS = {
  bg: '#050505',
  card: '#141414',
  border: '#222',
  highlight: '#1A1A1A',
  primary: '#FFE066',
  text: '#FFFFFF',
  muted: '#888888',
};

const OrbitSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  icon = null,
  className = '',
  contentClassName = '',
}) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={`h-12 px-6 rounded-full border flex items-center gap-2 transition-colors justify-between ${className}`}
        style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-2 truncate">
          {icon}
          <Select.Value placeholder={placeholder} />
        </div>
        <Select.Icon>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#444]">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={`rounded-xl border shadow-lg overflow-hidden ${contentClassName}`}
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
          position="popper"
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-6 text-[#666]">▲</Select.ScrollUpButton>
          <Select.Viewport className="p-2">
            {options.map((opt) => (
              <Select.Item
                key={opt}
                value={opt}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm"
                style={{ color: COLORS.text }}
              >
                <Select.ItemText>
                  {opt === 'all' ? placeholder : opt}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-6 text-[#666]">▼</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default OrbitSelect;