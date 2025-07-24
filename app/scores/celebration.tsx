import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Sparkles } from 'lucide-react';

interface CelebrationProps {
  winner: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
  isVisible: boolean;
  onClose: () => void;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

export default function Celebration({ winner, isVisible, onClose }: CelebrationProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowFireworks(true);
      
      // Генерируем конфетти
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      const newConfetti: Confetti[] = [];
      
      for (let i = 0; i < 150; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 8 + 4,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: Math.random() * 3 + 2,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }
      
      setConfetti(newConfetti);

      // Анимация конфетти
      const animateConfetti = () => {
        setConfetti(prev => 
          prev.map(piece => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + piece.rotationSpeed,
            velocityY: piece.velocityY + 0.1 // гравитация
          })).filter(piece => piece.y < window.innerHeight + 50)
        );
      };

      const interval = setInterval(animateConfetti, 16);
      
      // Автоматическое закрытие через 10 секунд
      const timeout = setTimeout(() => {
        onClose();
      }, 100000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      {/* Конфетти */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg) scale(${piece.size / 6})`,
            boxShadow: `0 0 6px ${piece.color}`
          }}
        />
      ))}

      {/* Фейерверки */}
      {showFireworks && (
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-yellow-400/30 rounded-full animate-ping" />
          <div className="absolute top-32 right-1/4 w-24 h-24 bg-purple-400/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-green-400/30 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        </div>
      )}

      {/* Основной контент */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Корона */}
        <div className="relative inline-block mb-8">
          <Crown className="w-32 h-32 text-yellow-400 animate-bounce" />
          <div className="absolute inset-0 animate-ping">
            <Crown className="w-32 h-32 text-yellow-400/50" />
          </div>
          <Sparkles className="absolute -top-6 -right-6 w-16 h-16 text-yellow-300 animate-spin" />
          <Star className="absolute -top-4 -left-8 w-12 h-12 text-yellow-300 animate-pulse" />
          <Star className="absolute -bottom-4 -right-4 w-10 h-10 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Star className="absolute -bottom-2 -left-6 w-8 h-8 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Поздравительный текст */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 animate-pulse">
            ՇՆՈՐՀԱՎՈՐՈՒՄ ԵՆՔ!
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${winner.color} animate-pulse`}>
              Հաղթեց {winner.name} թիմը
            </span>
          </h2>
        </div>

        {/* Иконка победителя */}
        <div className="mb-8">
          <div className="text-[200px] animate-bounce mb-4">{winner.icon}</div>
          <div className={`inline-flex items-center gap-4 bg-gradient-to-r ${winner.color} text-white font-bold py-6 px-12 rounded-full text-3xl shadow-2xl`}>
            <Trophy className="w-12 h-12 animate-spin" />
            <span>ՉԵՄՊԻՈՆ</span>
            <Trophy className="w-12 h-12 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="bg-white/20 backdrop-blur-lg text-white font-bold py-4 px-8 rounded-full text-xl border border-white/30 hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
        >
          Փակել
        </button>

        {/* Дополнительные эффекты */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-32 -right-16 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 -left-16 w-36 h-36 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 -right-20 w-28 h-28 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}