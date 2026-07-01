import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { LuMessageCircleMore } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";
import { PiTelegramLogo } from "react-icons/pi";

const API_BASE =
    import.meta.env.VITE_SERVER_URL || "https://chatbot-app-t7b7.onrender.com/api";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "https://chatbot-app-t7b7.onrender.com";

console.log("VITE_SERVER_URL:", import.meta.env.VITE_SERVER_URL);
console.log("VITE_SOCKET_URL:", import.meta.env.VITE_SOCKET_URL);
console.log("API_BASE:", API_BASE);
console.log("MODE:", import.meta.env.MODE);

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const socketRef = useRef(null);
    const scrollRef = useRef(null);
    const messageEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("userData"));

    const userId = user?.id;
    const roomId = userId ? `room_${userId}` : null;
    const userName = user?.name;
    const userEmail = user?.email;

    // Load old messages
    const loadMessages = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_BASE}/messages/${roomId}?limit=100`
            );
            setMessages(res.data.messages || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    // Open chat
    useEffect(() => {
        if (isOpen) {
            loadMessages();
        }
    }, [isOpen, roomId]);

    // Socket Connection
    useEffect(() => {
        if (!isOpen) return;

        const socket = io(SOCKET_URL, {
            query: {
                userId,
                userName,
                userEmail,
            },
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setConnected(true);
            setError(null);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        socket.on("connect_error", (err) => {
            setConnected(false);
            setError("Socket connection failed");
        });

        socket.on("history", (history) => {
            setMessages(history || []);
        });

        socket.on("message", (message) => {
            setMessages((prev) => [...prev, message]);
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        socket.on("bot_typing", (typing) => {
            setIsTyping(typing);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.off("history");
            socket.off("message");
            socket.off("bot_typing");
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isOpen, roomId, userId, userName, userEmail]);

    // Auto Scroll
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, isTyping]);

    // Send Message
    const sendMessage = () => {
        if (!input.trim()) return;
        if (!socketRef.current?.connected) {
            console.error("Socket not connected");
            return;
        }
        socketRef.current.emit("client_message", {
            text: input.trim(),
            roomId,
            userId,
            userName,
            userEmail
        });
        setInput("");
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="group flex items-center gap-1 px-4 py-3 bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] text-primary-foreground hover:bg-[#022938] rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative"
                >
                    <LuMessageCircleMore size={22} />
                    <span className="font-medium">Need help ?</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] rounded-2xl shadow-2xl w-[400px] h-[500px] flex flex-col overflow-hidden border border-gray-300 transition-all duration-300">

                    <header className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] text-primary-foreground flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                    <FaUserCircle className="text-5xl text-primary-foreground/80" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Assistant</h3>
                                <p className="text-xs text-primary-foreground/80">
                                    {connected ? '🟢 Online' : '🔴 Connecting...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 transition-colors flex items-center justify-center text-xl"
                                aria-label="Close chat"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 bg-background" ref={scrollRef}>
                        {loading && (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {!loading && messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="text-6xl mb-2">👋</div>
                                <p className="text-foreground font-medium">Welcome to Assist!</p>
                                <p className="text-muted-foreground text-sm mt-2 max-w-xs">
                                    Ask me anything about GST, TDS, Accounting, ROC filings, ITR, or Audit.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    <button
                                        onClick={() => setInput('How do I create a GST return filing task?')}
                                        className="px-3 py-1 text-xs bg-muted text-foreground border border-gray-300 rounded-full hover:bg-muted/80"
                                    >
                                        GST Filing
                                    </button>
                                    <button
                                        onClick={() => setInput('How do I create an ITR filing task?')}
                                        className="px-3 py-1 text-xs bg-muted text-foreground border border-gray-300 rounded-full hover:bg-muted/80"
                                    >
                                        ITR Filing
                                    </button>
                                    <button
                                        onClick={() => setInput('Can I track pending GST filings?')}
                                        className="px-3 py-1 text-xs bg-muted text-foreground border border-gray-300 rounded-full hover:bg-muted/80"
                                    >
                                        Track Filings
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg mb-2 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            {messages.map((msg, index) => {
                                const isUser = msg.sender === 'user';
                                const isBot = msg.sender === 'bot';
                                const isAgent = msg.sender === 'agent' || msg.sender === 'support';

                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'} ${msg.isTemp ? 'opacity-70' : ''}`}
                                    >
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${isUser
                                            ? 'bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] text-primary-foreground rounded-br-none'
                                            : isAgent
                                                ? 'bg-muted text-foreground rounded-bl-none border border-gray-300'
                                                : 'bg-muted text-foreground rounded-bl-none'
                                            }`}>
                                            {(isBot || isAgent) && (
                                                <span className="text-xs font-semibold uppercase tracking-wider opacity-70 flex items-center gap-1 mb-1">
                                                    {isAgent ? (
                                                        <>
                                                            <FaUserShield className="text-[#022938] text-xl" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RiRobot2Fill className="text-[#022938] text-xl" />
                                                        </>
                                                    )}
                                                </span>
                                            )}
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            {(msg.createdAt || msg.timestamp) && (
                                                <span className="text-[11px] opacity-50 mt-1 block">
                                                    {formatTime(msg.createdAt || msg.timestamp)}
                                                </span>
                                            )}
                                            {msg.metadata?.matched === false && (
                                                <span className="text-[10px] opacity-50 block mt-1">
                                                    Confidence: {(msg.metadata?.confidence * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {isTyping && (
                            <div className="flex justify-start mb-2">
                                <div className="bg-muted rounded-2xl rounded-bl-none px-3 py-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messageEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-background border-t border-gray-300 flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!connected}
                            className="flex-1 px-4 bg-input text-foreground border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all text-sm disabled:bg-muted disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || !connected}
                            className={`p-3 rounded-full transition-all duration-200 font-medium text-sm flex items-center gap-1
                                    ${input.trim() && connected
                                    ? 'bg-cyanDark hover:bg-[#022938] text-primary-foreground shadow-md hover:shadow-lg'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                        >
                            <PiTelegramLogo size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}