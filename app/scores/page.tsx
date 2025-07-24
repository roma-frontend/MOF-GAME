'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, BarChart3, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useGame } from './game-context';
import Celebration from './celebration';

export default function ScoresPage() {
  const { games, teams, gameResults, totalScores, isAllGamesCompleted, winner, setTeamPlace, resetScores } = useGame();
  const [showCelebration, setShowCelebration] = useState(false);

  // Показываем празднование когда все игры завершены
  useEffect(() => {
    if (isAllGamesCompleted && winner) {
      setShowCelebration(true);
    }
  }, [isAllGamesCompleted, winner]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-white mt-8 mb-10 animate-pulse">
            Հաշիվների ցանկ
          </h1>
          
          {/* Показать статус завершения */}
          {isAllGamesCompleted && winner && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl border border-yellow-400/30">
              <div className="text-2xl text-yellow-400 font-bold mb-2">
                🎉 Բոլոր խաղերը ավարտված են! 🎉
              </div>
              <div className="text-xl text-white">
                Հաղթողը: <span className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${winner.color}`}>
                  {winner.icon} {winner.name}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-center gap-4 flex-wrap">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <span className="text-3xl">{team.icon}</span>
                <span className="text-xl font-semibold">{team.name}</span>
                <span className="text-2xl font-bold ml-2 text-yellow-400">
                  {totalScores[team.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {games.map(game => {
            const gameResult = gameResults[game.id];
            const isGameCompleted = gameResult && gameResult.first && gameResult.second && gameResult.third;
            
            return (
              <div key={game.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
                isGameCompleted ? 'border-green-400/50 bg-green-400/5' : 'border-white/20 hover:bg-white/15'
              }`}>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  {isGameCompleted ? (
                    <Star className="w-8 h-8 text-green-400" />
                  ) : (
                    <Star className="w-8 h-8 text-yellow-400" />
                  )}
                  {game.name}
                  {isGameCompleted && <span className="text-green-400 text-lg ml-2">✓ Завершено</span>}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['first', 'second', 'third'] as const).map((place, index) => (
                    <div key={place} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-400" />}
                          {index === 1 && <Medal className="w-6 h-6 text-gray-300" />}
                          {index === 2 && <Medal className="w-6 h-6 text-orange-600" />}
                          <span className="text-white font-semibold">
                            {index + 1} տեղ ({game.points[place]} միավոր)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {teams.map(team => {
                          const isSelected = gameResults[game.id]?.[place] === team.id;
                          return (
                            <button
                              key={team.id}
                              onClick={() => setTeamPlace(game.id, team.id, place)}
                              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                                isSelected
                                  ? `bg-gradient-to-r ${team.color} text-white shadow-lg`
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              <span className="mr-2">{team.icon}</span>
                              {team.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/scores/chart"
            className="inline-flex text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            <BarChart3 className="w-6 h-6" />
            Ցուցադրել դիագրամը
          </Link>
          
          <button
            onClick={() => {
              if (confirm('Վստա՞հ եք, որ ցանկանում եք զրոյացնել բոլոր միավորները:')) {
                resetScores();
                setShowCelebration(false);
              }
            }}
            className="inline-flex bg-white/10 backdrop-blur-lg text-white font-bold py-4 px-8 rounded-full text-xl border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            Վերագործարկել միավորները
          </button>
          
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
  );
}