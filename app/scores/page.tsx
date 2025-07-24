'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, BarChart3, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useGame } from './game-context';
import Celebration from './celebration';
import { toast } from 'sonner';

export default function ScoresPage() {
  const { games, teams, gameResults, totalScores, isAllGamesCompleted, winner, setTeamPlace, resetScores } = useGame();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isAllGamesCompleted && winner) {
      setShowCelebration(true);
      toast.success('🎉 Բոլոր խաղերը ավարտված են!', {
        description: `Հաղթողը՝ ${winner.name} թիմը`,
        duration: 10000,
      });
    }
  }, [isAllGamesCompleted, winner]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  const handleResetScores = () => {
    toast.custom((t) => (
      <div className="glass rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-sky-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Վերագործարկել միավորները
        </h3>
        <p className="text-sky-700 mb-4">Վստա՞հ եք, որ ցանկանում եք զրոյացնել բոլոր միավորները:</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetScores();
              setShowCelebration(false);
              toast.dismiss(t);
              toast.success('Միավորները զրոյացված են');
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Այո, զրոյացնել
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 glass text-sky-900 font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Չեղարկել
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
    });
  };

  const handleTeamSelect = (gameId: number, teamId: number, place: 'first' | 'second' | 'third') => {
    const game = games.find(g => g.id === gameId);
    const team = teams.find(t => t.id === teamId);
    
    if (game && team) {
      setTeamPlace(gameId, teamId, place);
      
      const placeText = place === 'first' ? '1-ին' : place === 'second' ? '2-րդ' : '3-րդ';
      toast.success(`${team.name} թիմը զբաղեցրել է ${placeText} տեղը`, {
        description: `${game.name} խաղում`,
        icon: team.icon,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-sky-900 mt-8 mb-10">
            Հաշիվների ցանկ
          </h1>
          
          {isAllGamesCompleted && winner && (
            <div className="mb-6 p-6 glass rounded-3xl shadow-2xl border-2 border-yellow-400/30">
              <div className="text-2xl text-amber-600 font-bold mb-2">
                🎉 Բոլոր խաղերը ավարտված են! 🎉
              </div>
              <div className="text-xl text-sky-900">
                Հաղթողը: <span className={`font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r ${winner.color}`}>
                  {winner.icon} {winner.name}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-center gap-4 flex-wrap">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-3 glass rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-3xl">{team.icon}</span>
                <span className="text-xl font-bold text-sky-900">{team.name}</span>
                <span className={`text-3xl font-black ml-3 bg-clip-text text-transparent bg-gradient-to-r ${team.color}`}>
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
              <div key={game.id} className={`glass rounded-3xl p-8 shadow-xl transition-all duration-300 ${
                isGameCompleted ? 'border-2 border-emerald-400/50' : 'hover:shadow-2xl'
              }`}>
                <h3 className="text-2xl font-bold text-sky-900 mb-6 flex items-center gap-3">
                  {isGameCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <Star className="w-8 h-8 text-amber-500" />
                  )}
                  {game.name}
                  {isGameCompleted && <span className="text-emerald-600 text-lg ml-2">✓ Ավարտված</span>}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(['first', 'second', 'third'] as const).map((place, index) => (
                    <div key={place} className="glass-dark rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {index === 0 && <Trophy className="w-7 h-7 text-yellow-500" />}
                          {index === 1 && <Medal className="w-7 h-7 text-gray-400" />}
                          {index === 2 && <Medal className="w-7 h-7 text-orange-500" />}
                          <span className="text-sky-900 font-bold text-lg">
                            {index + 1} տեղ ({game.points[place]} միավոր)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {teams.map(team => {
                          const isSelected = gameResults[game.id]?.[place] === team.id;
                          return (
                            <button
                              key={team.id}
                              onClick={() => handleTeamSelect(game.id, team.id, place)}
                              className={`w-full py-4 px-6 rounded-[8px] font-bold transition-all duration-300 transform hover:scale-105 ${
                                isSelected
                                  ? `bg-gradient-to-r ${team.color} text-white shadow-lg`
                                  : 'glass hover:shadow-lg text-sky-900'
                              }`}
                            >
                              <span className="mr-2 text-xl">{team.icon}</span>
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

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/scores/chart"
            className="inline-flex text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            <BarChart3 className="w-6 h-6" />
            Ցուցադրել դիագրամը
          </Link>
          
          <button
            onClick={handleResetScores}
            className="inline-flex glass text-sky-900 font-bold py-5 px-10 rounded-full text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            Վերագործարկել միավորները
          </button>
          
          <Link
            href="/"
            className="inline-flex text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            Գլխավոր էջ
          </Link>

          {isAllGamesCompleted && winner && (
            <button
              onClick={() => setShowCelebration(true)}
              className="inline-flex bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3 animate-pulse"
            >
              🎉 Ցույց տալ հաղթանակը
            </button>
          )}
        </div>
      </div>

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