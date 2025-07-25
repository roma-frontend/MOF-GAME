'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, ArrowRight, Eye, RotateCcw, Save, ChevronRight, Sparkles, Users, Award, Target, X, Check, Fish, Trees, Bird } from 'lucide-react';
import Link from 'next/link';
import { useGame } from './game-context';
import { toast } from 'sonner';

// Маппинг строковых названий иконок к React компонентам
const iconMap = {
  Fish: Fish,
  Trees: Trees,
  Bird: Bird
};

export default function ScoresPage() {
  const { games, teams, gameResults, totalScores, setTeamPlace, resetScores } = useGame();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
  }, []);

  // Prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-sky-900">Բեռնվում է...</div>
        </div>
      </div>
    );
  }

  const handlePlaceClick = (gameId: number, teamId: number, place: 'first' | 'second' | 'third') => {
    setTeamPlace(gameId, teamId, place);
    
    const placeName = place === 'first' ? '1-ին' : place === 'second' ? '2-րդ' : '3-րդ';
    const team = teams.find(t => t.id === teamId);
    const game = games.find(g => g.id === gameId);
    
    const TeamIcon = iconMap[team?.icon as keyof typeof iconMap];
    
    toast.success(`${team?.name} թիմը զբաղեցրեց ${placeName} տեղը`, {
      description: `${game?.name} խաղում`,
      icon: TeamIcon ? <TeamIcon className="w-4 h-4" /> : '🏆',
      duration: 3000
    });
  };

  const handleReset = () => {
    toast.custom((t) => (
      <div className="bg-gradient-to-br from-white/95 via-white/90 to-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <RotateCcw className="w-8 h-8 text-white animate-pulse" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-red-800">
            Զրոյացնել արդյունքները
          </h3>
          
          {/* Description */}
          <div className="text-red-700 space-y-2">
            <p className="font-medium">Վստա՞հ եք, որ ցանկանում եք զրոյացնել բոլոր արդյունքները:</p>
            <p className="text-sm text-red-600">⚠️ Այս գործողությունը չի կարող հետ շրջվել</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                toast.info('Գործողությունը չեղարկված է', {
                  icon: '❌',
                  duration: 2000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                  }
                });
              }}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
            >
              <X className="w-4 h-4" />
              Չեղարկել
            </button>
            
            <button
              onClick={() => {
                toast.dismiss(t);
                resetScores();
                toast.success('Բոլոր արդյունքները զրոյացված են', {
                  description: 'Կարող եք սկսել նոր խաղ',
                  icon: '🔄',
                  duration: 5000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }
                });
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 shadow-lg"
            >
              <Check className="w-4 h-4" />
              Հաստատել
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  const handleSave = () => {
    toast.success('Արդյունքները պահպանված են', {
      description: 'Տվյալները ավտոմատ պահպանվում են',
      icon: '💾',
      duration: 3000
    });
  };

  const getTeamIcon = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.icon || '';
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || '';
  };

  const isPlaceOccupied = (gameId: number, place: 'first' | 'second' | 'third') => {
    const result = gameResults[gameId];
    return result && result[place];
  };

  const getCompletedGamesCount = () => {
    return Object.entries(gameResults).filter(([_, result]) => 
      result && result.first && result.second && result.third
    ).length;
  };

  const completedGames = getCompletedGamesCount();
  const totalGames = games.length;
  const progress = (completedGames / totalGames) * 100;

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 px-6 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-[1440px] mx-auto relative">
        {/* Header */}
        <div className={`text-center mb-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-3 mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
            <h1 className="text-5xl md:text-6xl font-black text-sky-900">
              Արդյունքների աղյուսակ
            </h1>
            <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="glass rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-900 font-semibold">Ընթացք</span>
                <span className="text-sky-700 text-sm">
                  {completedGames} / {totalGames} խաղեր ավարտված
                </span>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Current scores summary */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            {teams.map((team, index) => {
              const TeamIcon = iconMap[team.icon as keyof typeof iconMap];
              return (
                <div
                  key={team.id}
                  className={`glass rounded-xl p-4 shadow-lg transform transition-all duration-700 hover:scale-105`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl mb-2">
                    {TeamIcon && <TeamIcon className="w-12 h-12 mx-auto text-sky-700" />}
                  </div>
                  <h3 className="text-lg font-bold text-sky-900">{team.name}</h3>
                  <div className="text-3xl font-black text-sky-800 mt-2">
                    {totalScores[team.id] || 0}
                    <span className="text-sm font-normal text-sky-600 ml-1">միավոր</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Games Table */}
        <div className={`glass rounded-3xl p-6 shadow-2xl transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-sky-200">
                  <th className="text-left py-4 px-4 text-sky-900 font-bold text-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Խաղ
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sky-900 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      1-ին տեղ
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sky-900 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Medal className="w-5 h-5 text-gray-400" />
                      2-րդ տեղ
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sky-900 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Medal className="w-5 h-5 text-orange-500" />
                      3-րդ տեղ
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, gameIndex) => {
                  const result = gameResults[game.id] || {};
                  const isGameComplete = result.first && result.second && result.third;
                  
                  return (
                    <tr 
                      key={game.id} 
                      className={`border-b border-sky-100 transition-all duration-500 hover:bg-sky-50/50 ${
                        isGameComplete ? 'bg-emerald-50/30' : ''
                      }`}
                      style={{ animationDelay: `${gameIndex * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {/* Game color indicator */}
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center shadow-lg`}>
                              <Sparkles className={`w-4 h-4 text-white ${isGameComplete ? 'animate-spin' : ''}`} 
                                style={{ animationDuration: '3s' }} />
                            </div>
                            {isGameComplete && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sky-900 flex items-center gap-2">
                              {game.name}
                              {/* Small color stripe */}
                              <div className={`w-16 h-1 rounded-full bg-gradient-to-r ${game.color} opacity-60`}></div>
                            </div>
                            <div className="text-xs text-sky-600">
                              {game.points.first}/{game.points.second}/{game.points.third} միավոր
                            </div>
                          </div>
                        </div>
                      </td>
                      {(['first', 'second', 'third'] as const).map((place, placeIndex) => (
                        <td key={place} className="py-4 px-4">
                          <div className="flex justify-center gap-4">
                            {teams.map((team) => {
                              const isSelected = result[place] === team.id;
                              const isOtherPlace = Object.values(result).includes(team.id) && !isSelected;
                              const TeamIcon = iconMap[team.icon as keyof typeof iconMap];
                              
                              return (
                                <button
                                  key={team.id}
                                  onClick={() => handlePlaceClick(game.id, team.id, place)}
                                  disabled={isOtherPlace}
                                  className={`
                                    relative w-24 h-14 rounded-[8px] flex items-center justify-center text-2xl
                                    transition-all duration-300 transform hover:scale-110
                                    ${isSelected 
                                      ? `bg-gradient-to-br ${team.color} shadow-lg scale-110 ring-2 ring-white` 
                                      : isOtherPlace
                                      ? 'bg-gray-200 opacity-30 cursor-not-allowed'
                                      : 'bg-white/70 hover:bg-white shadow-md hover:shadow-lg'
                                    }
                                  `}
                                  title={`${team.name}${isOtherPlace ? ' (արդեն ընտրված է)' : ''}`}
                                >
                                  <span className={isSelected ? 'animate-bounce' : ''}>
                                    {TeamIcon && (
                                      <TeamIcon 
                                        className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-sky-700'}`} 
                                      />
                                    )}
                                  </span>
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1">
                                      {place === 'first' && <Trophy className="w-4 h-4 text-yellow-500" />}
                                      {place === 'second' && <Medal className="w-4 h-4 text-gray-400" />}
                                      {place === 'third' && <Medal className="w-4 h-4 text-orange-500" />}
                                    </div>
                                  )}
                                  {/* Game color accent for selected */}
                                  {isSelected && (
                                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full bg-gradient-to-r ${game.color} opacity-80`}></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Game Legend */}
          <div className="mt-6 pt-4 border-t border-sky-200">
            <h4 className="text-lg font-bold text-sky-900 mb-4 text-center">Խաղերի լեգենդ</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {games.map(game => (
                <div key={game.id} className="flex items-center gap-2 glass rounded-lg px-3 py-2 hover:scale-105 transition-transform">
                  <div className={`w-4 h-4 rounded bg-gradient-to-r ${game.color} shadow-sm`}></div>
                  <span className="text-sm font-medium text-sky-900">{game.name}</span>
                  <span className="text-xs text-sky-600">
                    ({game.points.first}/{game.points.second}/{game.points.third})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-sky-200">
            <p className="text-sm text-sky-700 text-center flex items-center justify-center gap-2">
              💡 <span>Սեղմեք թիմի պատկերակին վրա՝ տեղը նշանակելու համար:</span>
              <span className="text-sky-500">Յուրաքանչյուր թիմ կարող է զբաղեցնել միայն մեկ տեղ յուրաքանչյուր խաղում:</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap justify-center gap-4 mt-10 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link
            href="/scores/chart"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 group"
          >
            <Eye className="w-6 h-6" />
            Դիտել գրաֆիկը
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300"
          >
            <Save className="w-6 h-6" />
            Պահպանել
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-3 glass text-red-600 font-bold py-4 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-red-50"
          >
            <RotateCcw className="w-6 h-6" />
            Զրոյացնել
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-3 glass text-sky-900 font-bold py-4 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Գլխավոր էջ
          </Link>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}