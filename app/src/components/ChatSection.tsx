import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Loader } from './Loader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSectionProps {
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatSection({ messages, loading, onSendMessage }: ChatSectionProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
          <MessageSquare className="w-5 h-5" />
          Request History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No requests yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex justify-start">
              <div className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-lg p-3">
                <div className="text-xs font-semibold mb-1 text-purple-400">
                  Request #{index + 1}
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="w-full bg-gray-800 text-gray-100 border border-purple-500 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader />
                <span className="text-sm text-gray-400">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
