"use client";

import { useState, useRef, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Send, Bot, User, Database, Lightbulb, FileText, Cpu, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { analyzeDataWithAI } from "@/lib/gemini";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

export default function AiChatPage() {
    const currentUser = useStore((state) => state.currentUser);
    const userNameDisplay = currentUser ? `${currentUser.name} ${currentUser.position}` : '연구원 (사용자)';

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fetchStarted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Fetch existing messages from Supabase on mount
    useEffect(() => {
        if (!currentUser || fetchStarted.current) return;
        fetchStarted.current = true;

        const fetchMessages = async () => {
            try {
                const { supabase } = await import('@/lib/supabase');
                const { data, error } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (error) {
                    console.error("Error fetching chat logs:", error);
                } else if (data && data.length > 0) {
                    const mappedMessages: Message[] = data.map(m => ({
                        id: m.id,
                        role: m.role as "user" | "ai",
                        content: m.content,
                        timestamp: new Date(m.created_at)
                    }));
                    setMessages(mappedMessages);
                } else {
                    // Initial welcome message if no history
                    setMessages([
                        {
                            id: "1",
                            role: "ai",
                            content: "안녕하세요! 모델 정적검증 운영 포탈을 위한 Gemini AI 어시스턴트입니다.\n어떤 작업을 도와드릴까요? 데이터를 학습시키거나, 검증 로직에 대한 피드백을 받을 수 있습니다.",
                            timestamp: new Date()
                        }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load chat history:", err);
            } finally {
                setIsLoadingLogs(false);
            }
        };

        fetchMessages();
    }, [currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (manualInput?: string) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || !currentUser) return;

        const userQuery = textToSend.trim();
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userQuery,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        if (!manualInput) setInput("");
        setIsTyping(true);

        try {
            const { supabase } = await import('@/lib/supabase');
            
            // Save User message to DB
            await supabase.from('chat_messages').insert([{
                user_id: currentUser.id,
                role: 'user',
                content: userQuery
            }]);

            const state = useStore.getState();
            const currentData = state.versionedData[state.currentVersionIndex];
            
            // Include recent history for better context (last 5 messages)
            const historyText = messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');

            const contextPrompt = `
                너는 '정적검증 업무 관리 시스템'의 전문 AI 어시스턴트야.
                사용자가 질문을 하거나 업무 지시를 내리면, 아래의 현재 프로젝트 데이터와 대화 흐름을 참고해서 전문적이고 친절하게 답변해줘.
                
                [현재 프로젝트 정보]
                - 현재 버전: ${state.versions[state.currentVersionIndex]}
                - 전체 진척도: ${currentData?.dashboardData.overallProgress}
                - 일정 상태: ${currentData?.dashboardData.expectedSchedule}
                - 검출된 이슈: ${currentData?.issuesList.length}개

                [최근 대화 맥락]
                ${historyText}
                
                사용자 질문: "${userQuery}"
            `;

            const aiResponse = await analyzeDataWithAI(contextPrompt, state.geminiApiKey);

            if (aiResponse === "ERROR_MISSING_KEY") {
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "ai",
                    content: "AI API 키가 설정되지 않았습니다. 상단의 'AI 설정' 버튼을 눌러 키를 입력해 주세요.",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMsg]);
                return;
            }

            // Save AI response to DB
            const { data: savedMsg, error: saveError } = await supabase.from('chat_messages').insert([{
                user_id: currentUser.id,
                role: 'ai',
                content: aiResponse
            }]).select().single();

            const newAiMsg: Message = {
                id: savedMsg?.id || (Date.now() + 1).toString(),
                role: "ai",
                content: aiResponse,
                timestamp: savedMsg ? new Date(savedMsg.created_at) : new Date()
            };

            setMessages(prev => [...prev, newAiMsg]);
        } catch (error) {
            console.error("Chat AI Error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleActionClick = (actionName: string) => {
        setInput(actionName);
        setTimeout(() => {
            // Wait for input to render before sending (simulate user typing and pressing send)
            // But actually we can just manually trigger the send with the string value
        }, 100);
    };

    const quickActions = [
        { icon: <Database className="w-5 h-5 text-blue-500" />, title: "데이터 수집 및 학습", desc: "최신 검증 결과를 AI 모델에 학습", query: "최근 프로젝트 결과를 바탕으로 AI 학습 데이터를 수집해줘" },
        { icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, title: "업무 피드백 요청", desc: "검출 위배 패턴 분석 및 개선 방향", query: "나의 진행 상황과 서브시스템 위배 로그를 분석해서 개선 피드백을 알려줘" },
        { icon: <FileText className="w-5 h-5 text-purple-500" />, title: "자동 요약", desc: "대규모 코드베이스 변경점 요약", query: "전체 모델 정적 검증 상태 요약 텍스트를 만들어줘" },
    ];

    return (
        <div className="h-full flex flex-col relative">
            <PageHeader
                title="Gemini AI 업무 대화"
                description="포털 내 검증 데이터에 기반하여 AI의 학습을 지시하고, 업무에 대한 피드백을 인터랙티브하게 요청할 수 있습니다."
                showVersionSelector={false}
            />

            <div className="flex-1 overflow-hidden flex flex-col pt-2 bg-[var(--bg-color)] rounded-2xl shadow-sm border border-[var(--border-color)]">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 1 && (
                        <div className="mb-10 animate-fade-in">
                            <h3 className="text-xl font-bold text-[var(--text-main)] mb-6 text-center">어떤 작업을 위한 학습이 필요하신가요?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {quickActions.map((action, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => { 
                                            setInput(action.query);
                                            handleSend(action.query);
                                        }}
                                        className="text-left bg-[var(--bg-color)] hover:bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                    >
                                        <div className="mb-3 bg-[var(--badge-bg)] w-10 h-10 rounded-lg flex items-center justify-center">
                                            {action.icon}
                                        </div>
                                        <h4 className="font-bold text-[var(--text-main)] mb-1">{action.title}</h4>
                                        <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{action.desc}</p>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                            <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`flex max-w-[80%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100/50 dark:bg-blue-900text-blue-600 border border-blue-200 dark:border-blue-800'}`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Cpu className="w-5 h-5 text-blue-600" />}
                                </div>
                                
                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs font-semibold text-[var(--text-muted)]">
                                            {msg.role === 'user' ? userNameDisplay : 'Gemini ✨'}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)] opacity-70">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                            : 'bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-sm'
                                    }`}>
                                        {msg.content.split('\n').map((line, i) => (
                                            <span key={i}>{line}<br/></span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="flex max-w-[80%] gap-4 flex-row">
                                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-blue-100/50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
                                    <Cpu className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex flex-col items-start justify-center">
                                    <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--bg-color)] border-t border-[var(--border-color)]">
                    <div className="relative flex items-center max-w-4xl mx-auto">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="명령어나 질문을 입력하세요 (예: 피드백 요청, 데이터 수집)"
                            className="w-full bg-[var(--hover-bg)] border border-[var(--border-color)] text-[var(--text-main)] rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none min-h-[56px] shadow-inner"
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className={`absolute right-2 p-2.5 rounded-xl flex items-center justify-center transition-all ${
                                input.trim() && !isTyping 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                                    : 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                    <div className="text-center mt-3 text-xs text-[var(--text-muted)] font-medium">
                        Gemini AI는 분석 중 실수를 할 수 있으므로 맹신하지 말고 참고 자료로 활용해주세요.
                    </div>
                </div>
            </div>
        </div>
    );
}
