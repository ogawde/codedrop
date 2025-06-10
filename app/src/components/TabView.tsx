import { Code2, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => onTabChange('code')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeTab === 'code'
            ? 'text-gray-800'
            : 'text-gray-100 hover:text-gray-200 hover:bg-gray-800'
        }`}
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {activeTab === 'code' && (
          <motion.span
            layoutId="bubble"
            className="absolute inset-0 z-10 bg-white mix-blend-difference"
            style={{ borderRadius: 6 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Code2 className="w-4 h-4 relative z-20" />
        <span className="relative z-20">Code</span>
      </button>
      
      <button
        onClick={() => onTabChange('preview')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeTab === 'preview'
            ? 'text-gray-800'
            : 'text-gray-100 hover:text-gray-200 hover:bg-gray-800'
        }`}
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {activeTab === 'preview' && (
          <motion.span
            layoutId="bubble"
            className="absolute inset-0 z-10 bg-white mix-blend-difference"
            style={{ borderRadius: 6 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Eye className="w-4 h-4 relative z-20" />
        <span className="relative z-20">Preview</span>
      </button>
    </div>
  );
}