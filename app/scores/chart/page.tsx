'use client';

import React, { useState, useEffect, JSX } from 'react';
import { Trophy, Medal, ArrowLeft, Waves, Building2, Landmark } from 'lucide-react';
import Link from 'next/link';
import { useGame } from '../game-context';
import Celebration from '../celebration';
import { toast } from 'sonner';

export default function ChartPage() {
  const { games, teams, gameResults, totalScores, isAllGamesCompleted, winner } = useGame();
  const [animatedScores, setAnimatedScores] = useState<{ [teamId: number]: number }>(() => {
    return { ...totalScores };
  });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isAllGamesCompleted && winner) {
      const timer = setTimeout(() => {
        setShowCelebration(true);
        toast.success('🎊 Հաղթող է ճանաչվել!', {
          description: `${winner.name} թիմը հավաքել է ${totalScores[winner.id]} միավոր`,
          duration: 10000,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAllGamesCompleted, winner, totalScores]);

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

  const getTeamPosition = (teamId: number): number => {
    const sortedTeams = Object.entries(animatedScores)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => parseInt(id));
    
    return sortedTeams.indexOf(teamId) + 1;
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  const teamIcons: { [key: number]: JSX.Element } = {
    1: <Waves className="w-12 h-12" />,
    2: <Landmark className="w-12 h-12" />,
    3: <Building2 className="w-12 h-12" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 p-6 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-96 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 320">
          <path fill="#0891b2" fillOpacity="0.5" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="w-full max-w-7xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-7xl font-bold text-sky-900 mt-8 mb-10">
            Ընթացիկ հաշիվ
          </h1>
          
          {isAllGamesCompleted && winner && (
            <div className="mb-6 p-6 glass rounded-3xl shadow-2xl border-2 border-yellow-400/30 animate-pulse">
              <div className="text-3xl text-amber-600 font-bold mb-2">
                🎉 Բոլոր խաղերը ավարտված են! 🎉
              </div>
              <div className="text-2xl text-sky-900">
                Հաղթողը: <span className={`font-black text-3xl bg-clip-text text-transparent bg-gradient-to-r ${winner.color}`}>
                  {teamIcons[winner.id]} {winner.name}
                </span>
              </div>
            </div>
          )}
          
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
                      <div className="text-3xl text-sky-900 font-bold flex items-center justify-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
                        {isAllGamesCompleted ? 'Հաղթող:' : 'Հաղթում է:'} 
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${leaderTeam.color}`}>
                          {teamIcons[leaderTeam.id]} {leaderTeam.name}
                        </span>
                        ({leaderScore} միավոր)
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-10 shadow-2xl">
          <div className="flex items-end justify-center gap-8 lg:gap-12">
            {teams.map((team, index) => {
              const score = animatedScores[team.id] || 0;
              const height = maxScore > 0 ? (score / maxScore) * 100 : 0;
              const position = getTeamPosition(team.id);
              
              return (
                <div key={team.id} className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="relative w-full flex flex-col items-center">
                    {score > 0 && (
                      <div className="mb-2">
                        {position === 1 && <Trophy className="w-12 h-12 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />}
                        {position === 2 && <Medal className="w-10 h-10 text-gray-400 animate-pulse" />}
                        {position === 3 && <Medal className="w-10 h-10 text-orange-500 animate-pulse" />}
                      </div>
                    )}
                    
                    <div className="text-5xl lg:text-6xl font-black text-sky-900 mb-4" style={{ animationDelay: `${index * 0.2}s` }}>
                      {score}
                    </div>
                    
                    <div
                      className={`w-full rounded-t-3xl bg-gradient-to-t ${team.color} shadow-2xl transition-all duration-700 ease-out relative overflow-hidden`}
                      style={{ 
                        height: `${Math.max(height * 3.5, 30)}px`,
                        transform: score > 0 ? 'scale(1)' : 'scale(0.8)',
                      }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                      <div className="absolute -bottom-4 -left-4 -right-4 h-8 bg-white/40 rounded-full blur-2xl animate-pulse"></div>
                      
                      {height > 0 && (
                        <>
                          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 bg-white/40 animate-ping" style={{ height: '20px' }}></div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="text-sky-600 mb-2">{teamIcons[team.id]}</div>
                    <div className="text-2xl font-bold text-sky-900">{team.name}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-sky-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.map(game => {
                const result = gameResults[game.id];
                if (!result || (!result.first && !result.second && !result.third)) return null;
                
                const isGameCompleted = result.first && result.second && result.third;
                
                return (
                  <div key={game.id} className={`text-center rounded-xl p-4 transition-all duration-300 ${
                    isGameCompleted ? 'glass border-2 border-emerald-400/30' : 'glass-dark'
                  }`}>
                    <div className="text-sky-900 text-sm mb-2 font-bold flex items-center justify-center gap-1">
                      {game.name}
                      {isGameCompleted && <span className="text-emerald-500 text-xs">✓</span>}
                    </div>
                    <div className="flex gap-2 justify-center">
                      {result.first && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sky-900 text-lg">
                            {teams.find(t => t.id === result.first)?.icon}
                          </span>
                        </div>
                      )}
                      {result.second && (
                        <div className="flex items-center gap-1">
                          <Medal className="w-4 h-4 text-gray-400" />
                          <span className="text-sky-900 text-lg">
                            {teams.find(t => t.id === result.second)?.icon}
                          </span>
                        </div>
                      )}
                      {result.third && (
                        <div className="flex items-center gap-1">
                          <Medal className="w-4 h-4 text-orange-500" />
                          <span className="text-sky-900 text-lg">
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
            className="inline-flex text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" />
            Վերադառնալ աղյուսակին
          </Link>
          
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
  )}