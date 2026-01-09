'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    emoji?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, emoji?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, emoji?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, type, message, emoji };

        setToasts(prev => [...prev, newToast]);

        // 自动移除
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast容器 */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full px-4">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

interface ToastItemProps {
    toast: Toast;
    onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const getToastStyle = () => {
        switch (toast.type) {
            case 'success':
                return {
                    gradient: 'from-green-400 to-emerald-400',
                    icon: <CheckCircle className="w-6 h-6 text-white" />,
                    emoji: toast.emoji || '✅',
                    borderColor: 'border-green-300',
                };
            case 'error':
                return {
                    gradient: 'from-red-400 to-pink-400',
                    icon: <XCircle className="w-6 h-6 text-white" />,
                    emoji: toast.emoji || '❌',
                    borderColor: 'border-red-300',
                };
            case 'warning':
                return {
                    gradient: 'from-yellow-400 to-orange-400',
                    icon: <AlertCircle className="w-6 h-6 text-white" />,
                    emoji: toast.emoji || '⚠️',
                    borderColor: 'border-yellow-300',
                };
            case 'info':
                return {
                    gradient: 'from-blue-400 to-cyan-400',
                    icon: <Info className="w-6 h-6 text-white" />,
                    emoji: toast.emoji || 'ℹ️',
                    borderColor: 'border-blue-300',
                };
        }
    };

    const style = getToastStyle();

    return (
        <div className="animate-toast-in pointer-events-auto">
            <div className={`bg-white rounded-2xl shadow-2xl border-3 ${style.borderColor} overflow-hidden`}>
                <div className="flex items-center gap-3 p-4">
                    {/* 左侧图标 */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-full flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce-gentle`}>
                        <span className="text-2xl">{style.emoji}</span>
                    </div>

                    {/* 消息内容 */}
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-bold text-sm leading-snug break-words">
                            {toast.message}
                        </p>
                    </div>

                    {/* 关闭按钮 */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* 进度条 */}
                <div className="h-1 bg-gray-100 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${style.gradient} animate-progress`}></div>
                </div>
            </div>
        </div>
    );
}

