import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Sparkles, X, Fish, Trees, Bird } from 'lucide-react';
import { toast } from 'sonner';
import { Team, useGame } from './game-context';

interface CelebrationProps {
  winner: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
  isVisible: boolean;
  onClose: () => void;
  team: Team
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

// Маппинг строковых названий иконок к путям изображений
const iconMap = {
  Fish: '/icons/fish.png',
  Trees: '/icons/plant.png',
  Bird: '/icons/bird.png'
};

export default function Celebration({ winner, isVisible, onClose }: CelebrationProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const { teams } = useGame();

  // Получаем путь к изображению иконки
  const iconPath = iconMap[winner.icon as keyof typeof iconMap];

  useEffect(() => {
    if (isVisible) {
      setShowFireworks(true);

      const colors = ['#0891b2', '#3b82f6', '#10b981', '#fbbf24', '#f87171', '#a78bfa', '#34d399', '#60a5fa'];
      const newConfetti: Confetti[] = [];

      for (let i = 0; i < 200; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 10 + 5,
          velocityX: (Math.random() - 0.5) * 6,
          velocityY: Math.random() * 3 + 2,
          rotationSpeed: (Math.random() - 0.5) * 15
        });
      }

      setConfetti(newConfetti);

      const animateConfetti = () => {
        setConfetti(prev =>
          prev.map(piece => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + piece.rotationSpeed,
            velocityY: piece.velocityY + 0.15
          })).filter(piece => piece.y < window.innerHeight + 50)
        );
      };

      const interval = setInterval(animateConfetti, 16);

      toast.success('🏆 Շնորհավորում ենք հաղթողին!', {
        description: `${winner.name} թիմը դարձավ չեմպիոն!`,
        duration: 10000,
      });

      const timeout = setTimeout(() => {
        onClose();
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible, onClose, winner.name]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-sky-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-md flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 z-50"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Confetti */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            width: piece.size,
            height: piece.size * 0.6,
            boxShadow: `0 0 ${piece.size}px ${piece.color}`,
            opacity: 0.8
          }}
        />
      ))}

      {/* Fireworks Background */}
      {showFireworks && (
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-48 h-48 bg-yellow-400/20 rounded-full animate-ping" />
          <div className="absolute top-32 right-1/4 w-36 h-36 bg-cyan-400/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-emerald-400/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-1/3 w-32 h-32 bg-purple-400/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Crown Animation */}
        <div className="relative inline-block mb-8">
          <Crown className="w-32 h-32 text-yellow-400 animate-bounce" />
          <div className="absolute inset-0 animate-ping">
            <Crown className="w-32 h-32 text-yellow-400/30" />
          </div>
          <Sparkles className="absolute -top-6 -right-6 w-16 h-16 text-yellow-300 animate-spin" />
          <Star className="absolute -top-4 -left-8 w-12 h-12 text-yellow-300 animate-pulse" />
          <Star className="absolute -bottom-4 -right-4 w-10 h-10 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Star className="absolute -bottom-2 -left-6 w-8 h-8 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Congratulations Text */}
        <div className="mb-12 text-center">
          <h1 className="text-7xl font-black text-white mb-6 animate-pulse">
            Թիմ՝ <br /><span className='text-9xl'>{winner.name}</span>
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
          </h2>
        </div>

        {/* Winner Icon */}
        <div className="mb-12">
          <div className="mb-10 filter drop-shadow-2xl">
            {iconPath && (
              <div 
                className={`w-40 h-40 mx-auto animate-float bg-gradient-to-r ${winner.color} rounded-full flex items-center justify-center shadow-2xl`}
              >
                <img 
                  src={iconPath} 
                  alt={winner.name} 
                  className="w-32 h-32 object-contain"
                />
              </div>
            )}
          </div>
          <div className={`inline-flex items-center gap-4 bg-gradient-to-r ${winner.color} text-white font-bold py-6 px-12 rounded-full text-2xl shadow-2xl transform hover:scale-105 transition-all duration-300`}>
            {iconPath && (
              <img 
                src={iconPath} 
                alt={winner.name} 
                className="w-10 h-10 animate-spin object-contain" 
                style={{ animationDuration: '3s' }}
              />
            )}
            <span className="text-3xl font-black">ՉԵՄՊԻՈՆ</span>
            {iconPath && (
              <img 
                src={iconPath} 
                alt={winner.name} 
                className="w-10 h-10 animate-spin object-contain" 
                style={{ animationDirection: 'reverse', animationDuration: '3s' }}
              />
            )}
          </div>
        </div>

        {/* Additional Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-48 -right-32 w-48 h-48 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-32 -left-32 w-56 h-56 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-48 -right-32 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}