"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, MessageCircle } from "lucide-react";
import styles from "./JobAIChat.module.scss";
import apiClient from "@/lib/apiClient";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

interface JobAIChatProps {
    companyName: string;
    jobId: number;
}

const JobAIChat: React.FC<JobAIChatProps> = ({ companyName, jobId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: `Xin chào! Tôi là trợ lý AI. Bạn muốn tìm hiểu thêm điều gì về công ty ${companyName}?`,
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);
    useEffect(() => {
        const getMessage = async () => {
            try {
                const res = await apiClient.get(`/history_chat`, { params: { job_id: jobId } });
                setMessages(res.data.data);
            } catch (error) {
                console.log(error);
            }
        };
        getMessage();
    }, []);
    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await apiClient.post("/chat", {
                message: userMessage.text,
                job_id: jobId,
            });

            const aiResponse: Message = {
                id: res.data.data.id,
                text: res.data.data.text,
                sender: res.data.data.sender as "ai",
                timestamp: new Date(res.data.data.timestamp),
            };

            setMessages((prev) => [...prev, aiResponse]);
        } catch (err) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Lỗi rồi, AI đang đi uống trà ^^",
                sender: "ai",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={styles.floatingWrapper}>
            <div className={`${styles.chatContainer} ${!isOpen ? styles.hidden : ""}`}>
                <div className={styles.header}>
                    <div className={styles.aiIcon}>
                        <Sparkles size={18} />
                    </div>
                    <div className={styles.titleInfo}>
                        <h3>Hỏi AI về công ty</h3>
                        <span>Trợ lý ảo thông minh</span>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsOpen(false)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.messageList} ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${msg.sender === "ai" ? styles.ai : styles.user
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    {isTyping && (
                        <div className={styles.typing}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}
                </div>

                <div className={styles.inputArea}>
                    <input
                        type="text"
                        placeholder="Nhập câu hỏi..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        className={styles.sendBtn}
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <button
                className={`${styles.toggleBtn} ${isOpen ? styles.active : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default JobAIChat;
