import React from 'react'


 function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full">
      {children}
    </main>
  );
}
export default ChatLayout