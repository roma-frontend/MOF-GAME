'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGame } from '../game-context';
import Celebration from '../celebration';

export default function ChartPage() {
  const { games, teams, gameResults, totalScores, isAllGamesCompleted, winner } = useGame();
  const [animatedScores, setAnimatedScores] = useState<{ [teamId: number]: number }>(() => {
    // Инициализируем анимированные очки текущими значениями
    return { ...totalScores };
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Показываем празднование когда все игры завершены
  useEffect(() => {
    if (isAllGamesCompleted && winner) {
      // Небольшая задержка для завершения анимации счетчиков
      const timer = setTimeout(() => {
        setShowCelebration(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAllGamesCompleted, winner]);

  // Анимация счетчиков
  useEffect(() => {
    const targetScores = { ...totalScores };
    let animationFrame: number;
    
    const animate = () => {
      setAnimatedScores(current => {
        const newScores = { ...current };
        let hasChanges = false;
        
        Object.entries(targetScores).forEach(([teamId, targetScore]) => {
          const id = parseInt(teamId);
          const currentScore = current[id] || 0;
          
          if (currentScore !== targetScore) {
            hasChanges = true;
            const diff = targetScore - currentScore;
            const step = Math.abs(diff) > 10 ? Math.ceil(Math.abs(diff) / 10) : 1;
            
            if (currentScore < targetScore) {
              newScores[id] = Math.min(currentScore + step, targetScore);
            } else {
              newScores[id] = Math.max(currentScore - step, targetScore);
            }
          } else {
            newScores[id] = targetScore;
          }
        });
        
        if (hasChanges) {
          animationFrame = requestAnimationFrame(animate);
        }
        
        return newScores;
      });
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [totalScores]);

  const maxScore = Math.max(...Object.values(animatedScores).filter(score => !isNaN(score)), 1);

  // Функция для определения позиции команды (1, 2 или 3 место)
  const getTeamPosition = (teamId: number): number => {
    const sortedTeams = Object.entries(animatedScores)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => parseInt(id));
    
    return sortedTeams.indexOf(teamId) + 1;
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-7xl font-bold text-white mt-8 mb-10 animate-pulse">
            Ընթացիկ հաշիվ
          </h1>
          
          {/* Показать статус завершения */}
          {isAllGamesCompleted && winner && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl border border-yellow-400/30">
              <div className="text-3xl text-yellow-400 font-bold mb-2">
                🎉 Բոլոր խաղերը ավարտված են! 🎉
              </div>
              <div className="text-2xl text-white">
                Հաղթողը: <span className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${winner.color}`}>
                  {winner.icon} {winner.name}
                </span>
              </div>
            </div>
          )}
          
          {/* Лидер */}
          {Object.entries(animatedScores).length > 0 && (
            <div className="mt-6">
              {(() => {
                const leader = Object.entries(animatedScores)
                  .sort(([, a], [, b]) => b - a)[0];
                if (leader) {
                  const [leaderId, leaderScore] = leader;
                  const leaderTeam = teams.find(t => t.id === parseInt(leaderId));
                  if (leaderTeam && leaderScore > 0) {
                    return (
                      <div className="text-3xl text-yellow-400 font-bold animate-bounce">
                        {isAllGamesCompleted ? 'Հաղթող:' : 'Հաղթում է:'} {leaderTeam.icon} {leaderTeam.name} ({leaderScore} միավոր)
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20">
          <div className="flex items-end justify-center gap-8 lg:gap-12">
            {teams.map((team, index) => {
              const score = animatedScores[team.id] || 0;
              const height = maxScore > 0 ? (score / maxScore) * 100 : 0;
              const position = getTeamPosition(team.id);
              
              return (
                <div key={team.id} className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="relative w-full flex flex-col items-center">
                    {/* Позиция команды */}
                    {score > 0 && (
                      <div className="mb-2">
                        {position === 1 && <Trophy className="w-10 h-10 text-yellow-400 animate-spin" />}
                        {position === 2 && <Medal className="w-8 h-8 text-gray-300" />}
                        {position === 3 && <Medal className="w-8 h-8 text-orange-600" />}
                      </div>
                    )}
                    
                    {/* Счет */}
                    <div className="text-5xl lg:text-6xl font-bold text-white mb-4 animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}>
                      {score}
                    </div>
                    
                    {/* Столбец диаграммы */}
                    <div
                      className={`w-full rounded-t-xl bg-gradient-to-t ${team.color} shadow-2xl transition-all duration-700 ease-out relative overflow-hidden`}
                      style={{ 
                        height: `${Math.max(height * 3.5, 20)}px`,
                        transform: score > 0 ? 'scale(1)' : 'scale(0.8)',
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 -right-2 h-4 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                      
                      {/* Эффект роста */}
                      {height > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white/40 animate-ping" style={{ height: '20px' }}></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Информация о команде */}
                  <div className="mt-4 text-center">
                    <div className="text-5xl mb-2">{team.icon}</div>
                    <div className="text-2xl font-bold text-white">{team.name}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Детали игр */}
          <div className="mt-10 pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.map(game => {
                const result = gameResults[game.id];
                if (!result || (!result.first && !result.second && !result.third)) return null;
                
                const isGameCompleted = result.first && result.second && result.third;
                
                return (
                  <div key={game.id} className={`text-center rounded-lg p-3 ${
                    isGameCompleted ? 'bg-green-400/10 border border-green-400/30' : 'bg-white/5'
                  }`}>
                    <div className="text-white/80 text-sm mb-2 font-semibold flex items-center justify-center gap-1">
                      {game.name}
                      {isGameCompleted && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                    <div className="flex gap-2 justify-center">
                      {result.first && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-lg">
                            {teams.find(t => t.id === result.first)?.icon}
                          </span>
                        </div>
                      )}
                      {result.second && (
                        <div className="flex items-center gap-1">
                          <Medal className="w-4 h-4 text-gray-300" />
                          <span className="text-white text-lg">
                            {teams.find(t => t.id === result.second)?.icon}
                          </span>
                        </div>
                      )}
                      {result.third && (
                        <div className="flex items-center gap-1">
                          <Medal className="w-4 h-4 text-orange-600" />
                          <span className="text-white text-lg">
                            {teams.find(t => t.id === result.third)?.icon}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10 text-center flex-wrap">
          <Link
            href="/scores"
            className="inline-flex text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" />
            Վերադառնալ աղյուսակին
          </Link>
          
          <Link
            href="/"
            className="inline-flex text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            Գլխավոր էջ
          </Link>

          {/* Кнопка для показа празднования (если все игры завершены) */}
          {isAllGamesCompleted && winner && (
            <button
              onClick={() => setShowCelebration(true)}
              className="inline-flex bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
            >
              🎉 Ցույց տալ հաղթանակը
            </button>
          )}
        </div>
      </div>

      {/* Компонент празднования */}
      {showCelebration && winner && (
        <Celebration 
          winner={winner} 
          isVisible={showCelebration} 
          onClose={handleCloseCelebration} 
        />
      )}
    </div>
  )}