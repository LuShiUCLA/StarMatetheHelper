import React from 'react';
import { Message, Sender, GroundingSource } from '../types';
import TeaCupIcon from './icons/TeaCupIcon';
import UserIcon from './icons/UserIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  return (
    <ReactMarkdown
      children={text}
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-medium" />
        ),
        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
        ul: ({node, ...props}) => <ul {...props} className="list-disc list-outside ml-5 space-y-1" />,
        ol: ({node, ...props}) => <ol {...props} className="list-decimal list-outside ml-5 space-y-1" />,
        li: ({node, ...props}) => <li {...props} className="pl-1" />,
        strong: ({node, ...props}) => <strong {...props} className="font-semibold" />,
      }}
    />
  );
};

const SourceList: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Resources</h4>
            <ul className="list-disc list-inside space-y-1.5">
                {sources.map((source, index) => (
                    <li key={index} className="text-xs truncate">
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-teal-600 hover:underline"
                            title={source.title}
                        >
                           {source.title || source.uri}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <TeaCupIcon className="w-6 h-6 text-teal-500" />
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
          isBot
            ? 'bg-white text-gray-800 rounded-tl-none shadow-sm'
            : 'bg-teal-500 text-white rounded-br-none'
        }`}
      >
        {isBot ? <MarkdownRenderer text={message.text} /> : <p className="whitespace-pre-wrap">{message.text}</p>}
        {isBot && <SourceList sources={message.sources || []} />}
      </div>
      {!isBot && (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-6 h-6 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;