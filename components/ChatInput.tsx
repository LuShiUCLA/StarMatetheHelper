
import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const isDisabled = isLoading;

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-white p-2 rounded-full border border-gray-300 focus-within:ring-2 focus-within:ring-teal-400 transition-all duration-200 has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask about jobs, interviews, or support..."
        disabled={isDisabled}
        className="flex-1 p-2 bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-transparent"
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={isDisabled || !inputValue.trim()}
        className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
        aria-label="Send message"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;
