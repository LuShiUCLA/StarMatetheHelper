
import React, { useState, useEffect, useCallback } from 'react';
import { Message, Sender } from './types';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { sendMessageToBot } from './services/geminiService';
import TeaCupIcon from './components/icons/TeaCupIcon';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // The initial message is now the only thing set up on component mount.
    // API initialization is handled by the server.
    setMessages([
      {
        id: 'initial-message',
        text: "您好！我是StarMate星伴。請把我當作您一路同行的好友。我碰巧知道一些關於自閉症青少年如何順利進入成年階段的事情，可能對您有些用處。有說得不準確的地方還請您多多指教。另外，您儘管用您最喜歡的語言和我交流，只要不是那種太少見的語言我應該都能懂。\n\nHello! I'm StarMate (星伴). Please think of me as a friend for your journey. I happen to know a few things about how autistic youth smoothly transition into adulthood, which might be helpful for you. If I ever miss the mark, please let me know. Also, feel free to talk with me in whatever language you're most comfortable with. As long as it's not too uncommon, I should be able to understand.",
        sender: Sender.BOT,
        sources: [],
      },
    ]);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.USER,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
        const botResponse = await sendMessageToBot(text);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse.text,
          sender: Sender.BOT,
          sources: botResponse.sources,
        };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "I'm sorry, but I was unable to get a response. There might be a connection issue or the server is busy. Please try again later.",
            sender: Sender.BOT,
            sources: [],
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md p-4 flex items-center space-x-3 border-b border-gray-200">
        <div className="p-2 bg-teal-500 rounded-full">
          <TeaCupIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">StarMate 星伴</h1>
          <p className="text-sm text-gray-500">A companion for the journey ahead.</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <div className="mt-4">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;
