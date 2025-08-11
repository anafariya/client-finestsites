/***
*
*   DASHBOARD
*   Template dashboard example demonstrating various components inside a view.
*
**********/

import { useContext, useEffect, useState, useRef } from 'react';
import { ViewContext, Animate, useAPI } from 'components/lib';

export function Inbox({ t }){

  // context
  const viewContext = useContext(ViewContext);
  const [messages, setMessages] = useState([
    {
      sender: "user",
      name: "Sarah Thompson",
      time: "Today, 11:04 AM",
      content: "Hello, I'm having trouble accessing the employee data in the HR app. Can you assist me with that?",
    },
    {
      sender: "agent",
      content: "Of course! I’ll be happy to help you. Could you please provide me with some more details about the issue you’re facing?",
    },
    {
      sender: "user",
      content: `Whenever I try to log in to the app, it gives me an error message saying "Invalid username or password."\nI'm certain that I'm using the correct credentials.`,
    },
    {
      sender: "agent",
      content:
        "I apologize for the inconvenience. Let's troubleshoot this together. Firstly, please double-check that you are entering the correct username and password. It's possible that there might be a typo or an extra space causing the authentication failure.",
    },
    {
      sender: "user",
      content: "I've triple-checked my username and password, and they are definitely correct. Is there anything else that could be causing the issue?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });

  const emojiButtonRef = useRef(null);

  const toggleEmojiPicker = () => {
    if (!emojiButtonRef.current) return;
    const rect = emojiButtonRef.current.getBoundingClientRect();
    console.log(rect.top, 'rect.top');
    
    setEmojiPickerPosition({ top: rect.top - 440, left: rect.left });
    setShowEmojiPicker((prev) => !prev);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "agent", content: "You said: " + input },
      ]);
    }, 500);
  };
  return (
    <Animate type='pop' className="w-full flex-1 col-span-2 ">
      <div className="w-full col-span-2 mx-auto bg-white shadow flex flex-col h-[100vh] overflow-hidden p-4 lg:p-10">
      </div>
    </Animate>
  );
}
