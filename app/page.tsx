'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Star, Zap, ArrowRight, Play, Medal, Target, Award, Sparkles, Flame, Shield, Swords } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Переключение команд
    const teamInterval = setInterval(() => {
      setCurrentTeam(prev => (prev + 1) % 3);
    }, 3000);

    // Генерация частиц
    const particleInterval = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: 100
      };
      setParticles(prev => [...prev.slice(-20), newParticle]);
    }, 200);

    return () => {
      clearInterval(teamInterval);
      clearInterval(particleInterval);
    };
  }, []);

  const teams = [
    { 
      name: 'Ջրում', 
      icon: '💧', 
      color: 'from-blue-400 to-cyan-600',
      bgColor: 'from-blue-900/50 to-cyan-900/50',
      description: 'Ջրի տիրակալները',
      power: 'Արագություն և ճկունություն'
    },
    { 
      name: 'Ցամաքում', 
      icon: '🏔️', 
      color: 'from-emerald-400 to-green-600',
      bgColor: 'from-emerald-900/50 to-green-900/50',
      description: 'Երկրի պաշտպանները',
      power: 'Ուժ և կայունություն'
    },
    { 
      name: 'Օդում', 
      icon: '☁️', 
      color: 'from-purple-400 to-pink-600',
      bgColor: 'from-purple-900/50 to-pink-900/50',
      description: 'Երկնքի տեսուչները',
      power: 'Իմաստություն և տեսլական'
    }
  ];

  const games = [
    { name: 'Ճանաչիր Սևանը', icon: '🏞️', points: '20/15/10', difficulty: 'Միջին' },
    { name: 'Քարհավաք', icon: '💎', points: '40/25/15', difficulty: 'Բարձր' },
    { name: 'Ճանաչիր ՖՆ', icon: '🏛️', points: '15/10/5', difficulty: 'Հեշտ' },
    { name: 'Ճանաչիր ԱԶԲ', icon: '🏦', points: '15/10/5', difficulty: 'Հեշտ' },
    { name: 'Թիմային խաղ', icon: '🤝', points: '35/20/10', difficulty: 'Բարձր' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${teams[currentTeam].bgColor} from-gray-900 via-purple-900 to-gray-900 overflow-hidden relative transition-all duration-3000`}>
      {/* Частицы */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-white/30 rounded-full animate-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: 'fall 5s linear forwards'
          }}
        />
      ))}

      {/* Анимированный градиент фона */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${teams[currentTeam].color} opacity-20 animate-pulse`} />
      </div>

      {/* Главный контент */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Эпический заголовок */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping">
              <Trophy className="w-24 h-24 text-yellow-400/50" />
            </div>
            <Trophy className="relative w-24 h-24 text-yellow-400 animate-bounce" />
            <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin" />
            <Star className="absolute -top-2 -left-4 w-8 h-8 text-yellow-300 animate-pulse" />
            <Star className="absolute -bottom-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 relative">
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 blur-lg">
              ՄԵԾ ԽԱՂ
            </span>
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
              ՄԵԾ ԽԱՂ
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl text-white/90">
            <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
            <span>Էպիկական մրցակցություն</span>
            <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
          </div>
        </div>

        {/* Команды с каруселью */}
        <div className={`mb-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-yellow-400" />
            Հզոր թիմեր
            <Swords className="w-10 h-10 text-yellow-400" />
          </h2>
          
          {/* Активная команда */}
          <div className="relative h-64 mb-8">
            {teams.map((team, index) => (
              <div
                key={team.name}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                  index === currentTeam ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
              >
                <div className="text-center">
                  <div className="text-[120px] mb-4 animate-bounce">{team.icon}</div>
                  <h3 className={`text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${team.color}`}>
                    {team.name}
                  </h3>
                  <p className="text-2xl text-white/80 mb-2">{team.description}</p>
                  <p className="text-xl text-yellow-400 font-semibold">{team.power}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Индикаторы команд */}
          <div className="flex justify-center gap-4">
            {teams.map((team, index) => (
              <button
                key={index}
                onClick={() => setCurrentTeam(index)}
                className={`w-16 h-2 rounded-full transition-all duration-300 ${
                  index === currentTeam ? `bg-gradient-to-r ${team.color} w-24` : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Игры в виде карт */}
        <div className={`mb-12 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
            <Target className="w-10 h-10 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
            Մարտահրավերներ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {games.map((game, index) => (
              <div 
                key={game.name}
                className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all duration-500 hover:scale-110 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-3 transform group-hover:rotate-12 transition-transform duration-300">{game.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Trophy className="w-4 h-4" />
                      <span>{game.points}</span>
                    </div>
                    <div className={`text-xs font-semibold ${
                      game.difficulty === 'Բարձր' ? 'text-red-400' : 
                      game.difficulty === 'Միջին' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {game.difficulty}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl group-hover:w-32 group-hover:h-32 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Эпические CTA кнопки */}
        <div className={`flex flex-col md:flex-row gap-6 justify-center items-center mb-12 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link
            href="/scores"
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black py-8 px-16 rounded-2xl text-2xl shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-110 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 animate-pulse bg-white/20" />
            
            <Play className="relative z-10 w-10 h-10 group-hover:animate-spin" />
            <span className="relative z-10">ՍԿՍԵԼ ԷՊԻԿԱԿԱՆ ԽԱՂԸ</span>
            <ArrowRight className="relative z-10 w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>

          <Link
            href="/scores/chart"
            className="group relative inline-flex items-center gap-4 bg-white/10 backdrop-blur-lg text-white font-black py-8 px-16 rounded-2xl text-2xl border-2 border-white/30 hover:border-yellow-400 hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-10 h-10 text-yellow-400 group-hover:animate-bounce" />
            <span>LIVE ԱՐԴՅՈՒՆՔՆԵՐ</span>
          </Link>
        </div>

        {/* Статистика */}
        <div className={`grid grid-cols-3 gap-6 max-w-3xl mx-auto transform transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <div className="text-5xl font-black text-yellow-400 mb-2">3</div>
            <div className="text-white/70">Թիմեր</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-yellow-400 mb-2">5</div>
            <div className="text-white/70">Մրցույթներ</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-yellow-400 mb-2">125</div>
            <div className="text-white/70">Մաքս միավոր</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}