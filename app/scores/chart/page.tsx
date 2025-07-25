'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Fish, ArrowLeft, TrendingUp, Clock, Target, Star, AlertTriangle, ChevronUp, ChevronDown, Timer, GamepadIcon, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useGame } from '../game-context';
import Celebration from '../celebration';

export default function ChartPage() {
  const { games, teams, gameResults, totalScores, detailedScores, isAllGamesCompleted, winner } = useGame();

  // Initialize animated scores with 0 to avoid hydration mismatch
  const [animatedScores, setAnimatedScores] = useState<{ [teamId: number]: number }>(() => {
    const initial: { [teamId: number]: number } = {};
    teams.forEach(team => {
      initial[team.id] = 0;
    });
    return initial;
  });

  const iconMap = {
    Fish: '/icons/fish.png',
    Trees: '/icons/plant.png',
    Bird: '/icons/bird.png'
  };


  // Анимированные детальные очки по играм
  const [animatedDetailedScores, setAnimatedDetailedScores] = useState<{ [teamId: number]: { [gameId: number]: number } }>(() => {
    const initial: { [teamId: number]: { [gameId: number]: number } } = {};
    teams.forEach(team => {
      initial[team.id] = {};
      games.forEach(game => {
        initial[team.id][game.id] = 0;
      });
    });
    return initial;
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTeamHistory, setSelectedTeamHistory] = useState<number | null>(null);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [showGameBreakdown, setShowGameBreakdown] = useState(true); // Показывать разбивку по играм по умолчанию
  const [animationComplete, setAnimationComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate scores only after mount
  useEffect(() => {
    if (!mounted) return;

    const delay = setTimeout(() => {
      const targetScores = { ...totalScores };
      const targetDetailedScores = { ...detailedScores };
      let animationFrame: number;
      let startTime: number | null = null;
      const duration = 2000;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        setAnimatedScores(current => {
          const newScores = { ...current };

          Object.entries(targetScores).forEach(([teamId, targetScore]) => {
            const id = parseInt(teamId);
            const startScore = current[id] || 0;
            const diff = targetScore - startScore;
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            newScores[id] = Math.round(startScore + diff * easeOutCubic);
          });

          return newScores;
        });

        // Анимируем детальные очки
        setAnimatedDetailedScores(current => {
          const newDetailedScores = { ...current };

          Object.entries(targetDetailedScores).forEach(([teamId, gameScores]) => {
            const teamIdNum = parseInt(teamId);
            if (!newDetailedScores[teamIdNum]) {
              newDetailedScores[teamIdNum] = {};
            }

            Object.entries(gameScores).forEach(([gameId, targetScore]) => {
              const gameIdNum = parseInt(gameId);
              const startScore = current[teamIdNum]?.[gameIdNum] || 0;
              const diff = targetScore - startScore;
              const easeOutCubic = 1 - Math.pow(1 - progress, 3);
              newDetailedScores[teamIdNum][gameIdNum] = Math.round(startScore + diff * easeOutCubic);
            });
          });

          return newDetailedScores;
        });

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setAnimationComplete(true);
          if (isAllGamesCompleted && winner) {
            setTimeout(() => {
              setShowCelebration(true);
              toast.success('🎊 Հաղթող է ճանաչվել!', {
                description: `${winner.name} թիմը հավաքել է ${totalScores[winner.id]} միավոր`,
                duration: 10000,
              });
            }, 500);
          }
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, 500);

    return () => clearTimeout(delay);
  }, [mounted, totalScores, detailedScores, isAllGamesCompleted, winner]);

  // Используем максимально возможное количество очков как базу для высоты
  const maxPossibleScore = games.reduce((sum, game) => sum + game.points.first, 0); // 125 очков
  const maxScore = Math.max(...Object.values(animatedScores).filter(score => !isNaN(score)), 1);
  // Используем либо текущий максимум, либо 80% от максимально возможного (для лучшей визуализации)
  const chartMaxScore = maxPossibleScore;

  const getTeamPosition = (teamId: number): number => {
    const sortedTeams = Object.entries(animatedScores)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => parseInt(id));

    return sortedTeams.indexOf(teamId) + 1;
  };

  const getLeaderInfo = () => {
    const scoreEntries = Object.entries(animatedScores)
      .map(([id, score]) => ({ teamId: parseInt(id), score }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoreEntries.length === 0) return null;

    const topScore = scoreEntries[0].score;
    const leadingTeams = scoreEntries.filter(entry => entry.score === topScore);

    if (leadingTeams.length === 1) {
      const leaderTeam = teams.find(t => t.id === leadingTeams[0].teamId);
      return {
        type: 'single' as const,
        teams: [leaderTeam].filter(Boolean),
        score: topScore
      };
    } else {
      const tiedTeams = leadingTeams.map(entry =>
        teams.find(t => t.id === entry.teamId)
      ).filter(Boolean);

      return {
        type: 'tie' as const,
        teams: tiedTeams,
        score: topScore
      };
    }
  };

  const getTeamHistory = (teamId: number) => {
    const history: Array<{
      game: string,
      place: number,
      points: number,
      percentage: number,
      gameColor: string,
      opponents: { place: number, teamId: number, teamName: string }[]
    }> = [];

    Object.entries(gameResults).forEach(([gameIdStr, result]) => {
      const gameId = parseInt(gameIdStr);
      const game = games.find(g => g.id === gameId);
      if (!game || !result) return;

      let place = 0;
      let points = 0;
      const opponents: { place: number, teamId: number, teamName: string }[] = [];

      if (result.first === teamId) {
        place = 1;
        points = game.points.first;
      } else if (result.second === teamId) {
        place = 2;
        points = game.points.second;
      } else if (result.third === teamId) {
        place = 3;
        points = game.points.third;
      }

      // Add opponents info
      if (result.first && result.first !== teamId) {
        const team = teams.find(t => t.id === result.first);
        if (team) opponents.push({ place: 1, teamId: result.first, teamName: team.name });
      }
      if (result.second && result.second !== teamId) {
        const team = teams.find(t => t.id === result.second);
        if (team) opponents.push({ place: 2, teamId: result.second, teamName: team.name });
      }
      if (result.third && result.third !== teamId) {
        const team = teams.find(t => t.id === result.third);
        if (team) opponents.push({ place: 3, teamId: result.third, teamName: team.name });
      }

      if (place > 0) {
        const maxPoints = game.points.first;
        const percentage = Math.round((points / maxPoints) * 100);
        history.push({
          game: game.name,
          place,
          points,
          percentage,
          gameColor: game.color,
          opponents
        });
      }
    });

    return history;
  };

  const getTeamTrend = (teamId: number) => {
    const history = getTeamHistory(teamId);
    if (history.length < 2) return { trend: 'stable', change: 0 };

    const recentGames = history.slice(-3);
    const olderGames = history.slice(0, -3);

    if (olderGames.length === 0) return { trend: 'stable', change: 0 };

    const avgRecentPosition = recentGames.reduce((sum, game) => sum + game.place, 0) / recentGames.length;
    const avgOlderPosition = olderGames.reduce((sum, game) => sum + game.place, 0) / olderGames.length;

    const change = avgOlderPosition - avgRecentPosition;

    if (change > 0.5) return { trend: 'rising', change: Math.round(change * 10) / 10 };
    if (change < -0.5) return { trend: 'falling', change: Math.round(change * 10) / 10 };
    return { trend: 'stable', change: 0 };
  };

  const getGameStats = () => {
    const completedGames = Object.entries(gameResults).filter(([_, result]) =>
      result && result.first && result.second && result.third
    ).length;
    const totalGames = games.length;
    const progress = (completedGames / totalGames) * 100;

    const totalPointsAwarded = Object.entries(gameResults).reduce((sum, [gameIdStr, result]) => {
      const gameId = parseInt(gameIdStr);
      const game = games.find(g => g.id === gameId);
      if (!game || !result) return sum;
      let gamePoints = 0;
      if (result.first) gamePoints += game.points.first;
      if (result.second) gamePoints += game.points.second;
      if (result.third) gamePoints += game.points.third;
      return sum + gamePoints;
    }, 0);

    const maxPossiblePoints = games.reduce((sum, game) =>
      sum + game.points.first + game.points.second + game.points.third, 0
    );

    return { completedGames, totalGames, progress, totalPointsAwarded, maxPossiblePoints };
  };

  const createGameStack = (teamId: number) => {
    const teamScores = animatedDetailedScores[teamId] || {};
    const stack: Array<{ gameId: number, points: number, percentage: number, color: string, name: string }> = [];

    // Собираем все игры с очками для этой команды
    games.forEach(game => {
      const points = teamScores[game.id] || 0;
      if (points > 0) {
        stack.push({
          gameId: game.id,
          points,
          percentage: 0, // Временно устанавливаем 0, рассчитаем позже
          color: game.color,
          name: game.name
        });
      }
    });

    // Рассчитываем процентное соотношение для каждого сегмента
    const totalTeamScore = stack.reduce((sum, segment) => sum + segment.points, 0);

    if (totalTeamScore > 0) {
      stack.forEach(segment => {
        segment.percentage = (segment.points / totalTeamScore) * 100;
      });
    }

    return stack;
  };

  const teamIcons: { [key: number]: string } = {
    1: '/icons/fish.png',
    2: '/icons/plant.png',
    3: '/icons/bird.png'
  };

  const leaderInfo = getLeaderInfo();
  const gameStats = getGameStats();

  // Don't render dynamic content until mounted
  if (!mounted) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-sky-900">Բեռնվում է...</div>
        </div>
      </div>
    );
  }

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  // Find multiple winners if there's a tie
  const winners = isAllGamesCompleted ? (() => {
    const maxScore = Math.max(...Object.values(totalScores));
    return teams.filter(team => totalScores[team.id] === maxScore);
  })() : [];

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 p-6 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute bottom-0 left-0 right-0 h-96 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 320">
          <path
            fill="#0891b2"
            fillOpacity="0.5"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      <div className="w-full max-w-[1440px] relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-7xl font-bold text-sky-900 mt-8 mb-6">
            Ընթացիկ հաշիվ
          </h1>

          {/* Progress Bar */}
          <div className="mb-6 glass rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <span className="text-sky-900 font-semibold">Ընթացք</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sky-700 text-sm font-medium">
                  {gameStats.completedGames} / {gameStats.totalGames} խաղեր
                </span>
                <span className="text-sky-600 text-xs">
                  ({gameStats.totalPointsAwarded} / {gameStats.maxPossiblePoints} միավոր)
                </span>
              </div>
            </div>
            <div className="w-full bg-sky-200 rounded-full h-3 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${gameStats.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-sky-600">
              Մաքսիմալ հնարավոր միավորներ՝ {maxPossibleScore}
            </div>
          </div>

          {/* Game Breakdown Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowGameBreakdown(!showGameBreakdown)}
              className="inline-flex items-center gap-2 glass text-sky-900 font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <BarChart3 className="w-5 h-5" />
              <span>{showGameBreakdown ? 'Ցույց տալ ընդհանուր' : 'Ցույց տալ ըստ խաղերի'}</span>
            </button>
          </div>

          {/* Winner announcement */}
          {isAllGamesCompleted && winners.length > 0 && animationComplete && (
            <div className="mb-6 p-6 glass rounded-3xl shadow-2xl border-2 border-yellow-400/30">
              <div className="text-3xl text-amber-600 font-bold mb-10 flex items-center justify-center gap-2">
                🎉 Բոլոր խաղերը ավարտված են 🎉
              </div>
              {winners.length === 1 ? (
                <div className="text-2xl text-sky-900 flex items-center justify-center gap-3">
                  Հաղթողը`
                  <span className={`font-black text-3xl bg-clip-text text-transparent bg-gradient-to-r ${winners[0].color} flex items-center gap-2`}>
                    <img
                      src={teamIcons[winners[0].id]}
                      alt={winners[0].name}
                      className="w-8 h-8"
                    />
                    Թիմ {winners[0].name}
                  </span>
                </div>
              ) : (
                <div className="text-2xl text-sky-900 flex items-center justify-center gap-2 flex-wrap">
                  <AlertTriangle className="inline w-6 h-6 text-amber-500" />
                  Հավասար հաշիվ: {winners.map((w, i) => (
                    <span key={w.id} className="flex items-center gap-2">
                      <span className={`font-black text-3xl bg-clip-text text-transparent bg-gradient-to-r ${w.color} flex items-center gap-2`}>
                        <img
                          src={teamIcons[w.id]}
                          alt={w.name}
                          className="w-8 h-8"
                        />
                        {w.name}
                      </span>
                      {i < winners.length - 1 && <span className="text-sky-700">և</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leader Display */}
          {leaderInfo && !isAllGamesCompleted && (
            <div className="mt-6">
              <div className="text-2xl md:text-3xl text-sky-900 font-bold flex items-center justify-center gap-3 flex-wrap">
                {leaderInfo.type === 'tie' ? (
                  <>
                    <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
                    <span className="text-amber-600">Հավասար միավորներ!</span>
                  </>
                ) : (
                  <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
                )}

                {leaderInfo.type === 'tie' ? 'Առաջատարներ:' : 'Առաջատարն է:'}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                {leaderInfo.teams.map((team, index) => team && (
                  <div key={team.id} className="flex items-center gap-2">
                    <div className="glass rounded-2xl px-6 py-3 shadow-lg hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${team.color}`}>
                          {team.name} թիմը
                        </span>
                        <span className="text-xl text-sky-700 font-bold">
                          ({leaderInfo.score} միավոր)
                        </span>
                      </div>
                    </div>
                    {index < leaderInfo.teams.length - 1 && (
                      <span className="text-sky-700 text-xl font-bold">և</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Chart */}
        <div className="glass rounded-3xl p-10 shadow-2xl mb-8">
          <div className="flex items-end justify-center gap-8 lg:gap-12">
            {teams.map((team, index) => {
              const score = animatedScores[team.id] || 0;
              const height = chartMaxScore > 0 ? (score / chartMaxScore) * 100 : 0;
              const position = getTeamPosition(team.id);
              const trendInfo = getTeamTrend(team.id);
              const gameStack = createGameStack(team.id);

              return (
                <div key={team.id} className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="relative w-full flex flex-col items-center">
                    {/* Position medals */}
                    {score > 0 && (
                      <div className="mb-2 relative">
                        {position === 1 && (
                          <div className="relative">
                            <Trophy className="w-14 h-14 text-yellow-400 animate-pulse" style={{ animationDuration: '3s' }} />
                          </div>
                        )}
                        {position === 2 && <Medal className="w-10 h-10 text-gray-400 animate-pulse" />}
                        {position === 3 && <Medal className="w-10 h-10 text-orange-500 animate-pulse" />}

                        {/* Trend indicator */}
                        <div className="absolute -top-2 -right-2">
                          {trendInfo.trend === 'rising' && (
                            <div className="flex items-center gap-1 bg-green-100 rounded-full px-2 py-1">
                              <ChevronUp className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-bold">+{trendInfo.change}</span>
                            </div>
                          )}
                          {trendInfo.trend === 'falling' && (
                            <div className="flex items-center gap-1 bg-red-100 rounded-full px-2 py-1">
                              <ChevronDown className="w-3 h-3 text-red-600" />
                              <span className="text-xs text-red-600 font-bold">{trendInfo.change}</span>
                            </div>
                          )}
                          {trendInfo.trend === 'stable' && (
                            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Score Display */}
                    <div
                      className="text-5xl lg:text-6xl font-black text-sky-900 mb-4 cursor-pointer hover:scale-110 transition-transform relative"
                      onClick={() => {
                        setSelectedTeamHistory(team.id);
                        setShowHistory(true);
                        toast.info(`${team.name} թիմի պատմություն`, {
                          description: `Ընդհանուր միավորներ: ${score}`,
                          icon: team.icon,
                          duration: 3000
                        });
                      }}
                    >
                      {score}
                    </div>

                    {/* Bar Chart with Game Breakdown */}
                    <div
                      className="w-full rounded-[1.5rem] shadow-2xl transition-all duration-700 ease-out relative overflow-hidden cursor-pointer hover:scale-105 group"
                      style={{
                        height: `${Math.max(height * 5, score > 0 ? 100 : 50)}px`,
                        minHeight: '120px', // Минимальная высота
                        maxHeight: '500px', // Максимальная высота
                        transform: score > 0 ? 'scale(1)' : 'scale(0.8)',
                      }}
                    >
                      {/* Game breakdown or solid color */}
                      {showGameBreakdown && gameStack.length > 0 ? (
                        // Показываем разбивку по играм (снизу вверх)
                        <>
                          {gameStack.map((gameSegment, segmentIndex) => {
                            // Высота сегмента относительно общей высоты столбца команды
                            const segmentHeight = gameSegment.percentage;

                            // Вычисляем положение снизу (накопительно)
                            const bottomPosition = gameStack
                              .slice(0, segmentIndex)
                              .reduce((sum, seg) => sum + seg.percentage, 0);

                            const isFirst = segmentIndex === 0;
                            const isLast = segmentIndex === gameStack.length - 1;

                            return (
                              <div
                                key={gameSegment.gameId}
                                className={`absolute left-0 right-0 bg-gradient-to-t ${gameSegment.color} transition-all duration-700 ease-out group-hover:brightness-110`}
                                style={{
                                  height: `${segmentHeight}%`,
                                  bottom: `${bottomPosition}%`,
                                  borderTopLeftRadius: isLast ? '1.5rem' : '0',
                                  borderTopRightRadius: isLast ? '1.5rem' : '0',
                                  borderBottomLeftRadius: isFirst ? '1.5rem' : '0',
                                  borderBottomRightRadius: isFirst ? '1.5rem' : '0',
                                }}
                                title={`${gameSegment.name}: ${gameSegment.points} միավոր`}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>

                                {/* Показываем название и очки для всех сегментов */}
                                <div className="absolute inset-0 flex items-center justify-center p-1">
                                  {/* Для больших сегментов - название и очки рядом */}
                                  {segmentHeight > 15 && (
                                    <div className="text-white font-bold text-xs opacity-90 text-center bg-black/20 rounded px-2 py-1 flex items-center gap-1">
                                      <span className="truncate max-w-[100%]">{gameSegment.name}</span>
                                      <span className="font-black">({gameSegment.points})</span>
                                    </div>
                                  )}

                                  {/* Для средних сегментов - только очки */}
                                  {segmentHeight <= 15 && segmentHeight > 8 && (
                                    <div className="text-white font-black text-sm opacity-95 bg-black/30 rounded px-2 py-1">
                                      {gameSegment.points}
                                    </div>
                                  )}

                                  {/* Для маленьких сегментов - только очки без фона */}
                                  {segmentHeight <= 8 && segmentHeight > 4 && (
                                    <div className="text-white font-bold text-xs opacity-90">
                                      {gameSegment.points}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        // Обычный градиент команды без разбивки
                        <div className={`w-full h-full rounded-t-3xl bg-gradient-to-t ${team.color} relative`}>
                          <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                          <div className="absolute -bottom-4 -left-4 -right-4 h-8 bg-white/40 rounded-full blur-2xl animate-pulse"></div>

                          {height > 0 && (
                            <>
                              <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                              <div className="absolute bottom-0 left-0 right-0 bg-white/40 animate-ping" style={{ height: '20px' }}></div>
                              <div className="absolute bottom-2 left-2 right-2 text-white/80 text-xs font-bold text-center">
                                {Math.round((score / maxPossibleScore) * 100)}%
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="mt-6 flex flex-col items-center text-center">
                    <div className="text-sky-600 mb-2">
                      <img
                        src={teamIcons[team.id]}
                        alt={team.name}
                        className="w-12 h-12 mx-auto"
                      />
                    </div>
                    <div className="text-2xl font-bold text-sky-900">{team.name}</div>

                    {/* Progress indicator */}
                    <div className="mt-2 w-full max-w-[150px]">
                      <div className="flex justify-between text-xs text-sky-600 mb-1">
                        <span>Առաջընթաց</span>
                        <span>{Math.round((score / maxPossibleScore) * 100)}%</span>
                      </div>
                      <div className="w-full bg-sky-200/50 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${team.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${(score / maxPossibleScore) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-sm text-sky-600 mt-1 flex items-center justify-center gap-2">
                      {trendInfo.trend === 'rising' && (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Բարելավում</span>
                        </>
                      )}
                      {trendInfo.trend === 'falling' && (
                        <>
                          <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                          <span className="text-red-600">Անկում</span>
                        </>
                      )}
                      {trendInfo.trend === 'stable' && (
                        <>
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-600">Կայուն</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-sky-500">
                      {getTeamHistory(team.id).length} խաղ խաղացած
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Game Legend */}
          {showGameBreakdown && (
            <div className="mt-8 pt-6 border-t border-sky-200">
              <h4 className="text-lg font-bold text-sky-900 mb-4 text-center">Խաղերի լեգենդ</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {games.map(game => (
                  <div key={game.id} className="flex items-center gap-2 glass rounded-lg px-3 py-2 hover:scale-105 transition-transform">
                    <div className={`w-4 h-4 rounded bg-gradient-to-r ${game.color}`}></div>
                    <span className="text-sm font-medium text-sky-900">{game.name}</span>
                    <span className="text-xs text-sky-600">({game.points.first})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Results */}
          <div className="mt-10 pt-6 border-t border-sky-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-sky-900 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Մանրամասն արդյունքներ
              </h3>
              <button
                onClick={() => setShowDetailedStats(!showDetailedStats)}
                className="flex items-center gap-2 text-sky-600 hover:text-sky-800 transition-colors"
              >
                <GamepadIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {showDetailedStats ? 'Թաքցնել' : 'Ցույց տալ'} վիճակագրություն
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.map(game => {
                const result = gameResults[game.id];
                const isGameCompleted = result && result.first && result.second && result.third;
                const hasPartialResults = result && (result.first || result.second || result.third);

                return (
                  <div
                    key={game.id}
                    className={`text-center rounded-xl p-4 transition-all duration-300 cursor-pointer hover:scale-105 relative border-2 ${isGameCompleted ? `glass border-emerald-400/50 ${game.bgColor}` :
                      hasPartialResults ? `glass border-amber-400/50 ${game.bgColor}` :
                        'glass-dark opacity-50'
                      }`}
                    onClick={() => {
                      if (isGameCompleted) {
                        toast.success(`${game.name} - Ավարտված`, {
                          description: 'Բոլոր տեղերը բաշխված են'
                        });
                      } else if (hasPartialResults) {
                        toast.info(`${game.name} - Ընթացքում`, {
                          description: 'Դեռ կան ազատ տեղեր'
                        });
                      } else {
                        toast(`${game.name} - Չի սկսվել`, {
                          description: 'Սպասում է մասնակիցներին'
                        });
                      }
                    }}
                  >
                    <div className="absolute -top-2 -right-2">
                      {isGameCompleted && (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {hasPartialResults && !isGameCompleted && (
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                          <Timer className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Game color indicator */}
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${game.color} mb-2 opacity-80`}></div>

                    <div className="text-sky-900 text-sm mb-2 font-bold">
                      {game.name}
                    </div>

                    <div className="flex gap-2 justify-center flex-wrap mb-2">
                      {result?.first && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sky-900 text-lg">
                            <img
                              src={iconMap[teams.find(t => t.id === result.first)?.icon as keyof typeof iconMap]}
                              alt={teams.find(t => t.id === result.first)?.name}
                              className="w-6 h-6"
                            />
                          </span>
                        </div>
                      )}

                      {result?.second && (
                        <div className="flex items-center gap-1">
                          <Medal className="w-4 h-4 text-gray-400" />
                          <span className="text-sky-900 text-lg">
                            <img
                              src={iconMap[teams.find(t => t.id === result.second)?.icon as keyof typeof iconMap]}
                              alt={teams.find(t => t.id === result.second)?.name}
                              className="w-6 h-6"
                            />
                          </span>
                        </div>
                      )}

                      {result?.third && (
                        <div className="flex items-center gap-1">
                          <Medal className="w-4 h-4 text-orange-500" />
                          <span className="text-sky-900 text-lg">
                            <img
                              src={iconMap[teams.find(t => t.id === result.third)?.icon as keyof typeof iconMap]}
                              alt={teams.find(t => t.id === result.third)?.name}
                              className="w-6 h-6"
                            />
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-sky-600">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="w-3 h-3" />
                        <span>{game.points.first}</span>
                        <span className="text-sky-400">|</span>
                        <span>{game.points.second}</span>
                        <span className="text-sky-400">|</span>
                        <span>{game.points.third}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Statistics */}
            {showDetailedStats && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {teams.map(team => {
                  const history = getTeamHistory(team.id);
                  const avgPlace = history.length > 0
                    ? history.reduce((sum, h) => sum + h.place, 0) / history.length
                    : 0;
                  const totalPoints = totalScores[team.id] || 0;
                  const efficiency = history.length > 0
                    ? Math.round((totalPoints / (history.length * 40)) * 100)
                    : 0;

                  return (
                    <div key={team.id} className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-10 h-10 animate-float bg-gradient-to-r rounded-full flex items-center justify-center shadow-2xl`}>
                          <img
                            src={iconMap[team.icon as keyof typeof iconMap]}
                            alt={team.name}
                            className="w-6 h-6"
                          />
                        </div>
                        <h4 className="font-bold text-sky-900">{team.name}</h4>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sky-600">Միջին տեղ:</span>
                          <span className="font-bold text-sky-900">
                            {avgPlace > 0 ? avgPlace.toFixed(1) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-600">Արդյունավետություն:</span>
                          <span className="font-bold text-sky-900">
                            {efficiency}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-600">1-ին տեղեր:</span>
                          <span className="font-bold text-sky-900">
                            {history.filter(h => h.place === 1).length}
                          </span>
                        </div>

                        {/* Game breakdown for this team */}
                        <div className="mt-3 pt-2 border-t border-sky-200">
                          <div className="text-xs text-sky-600 mb-2">Ըստ խաղերի:</div>
                          {games.map(game => {
                            const gameScore = animatedDetailedScores[team.id]?.[game.id] || 0;
                            if (gameScore === 0) return null;

                            return (
                              <div key={game.id} className="flex items-center justify-between text-xs mb-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded bg-gradient-to-r ${game.color}`}></div>
                                  <span>{game.name}</span>
                                </div>
                                <span className="font-bold">{gameScore}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Team History Modal */}
        {showHistory && selectedTeamHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-sky-900 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  {teams.find(t => t.id === selectedTeamHistory)?.name} պատմություն
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sky-600 hover:text-sky-900 text-2xl font-bold hover:scale-110 transition-transform"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {getTeamHistory(selectedTeamHistory).length === 0 ? (
                  <div className="text-center text-sky-600 py-8">
                    Դեռ չկան արդյունքներ այս թիմի համար
                  </div>
                ) : (
                  getTeamHistory(selectedTeamHistory).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 glass rounded-xl hover:scale-[1.02] transition-transform border-l-4" style={{ borderLeftColor: `rgb(${record.gameColor.includes('cyan') ? '6, 182, 212' : record.gameColor.includes('purple') ? '168, 85, 247' : record.gameColor.includes('blue') ? '59, 130, 246' : record.gameColor.includes('emerald') ? '16, 185, 129' : '251, 146, 60'})` }}>
                      <div className="flex items-center gap-3">
                        {record.place === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {record.place === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                        {record.place === 3 && <Medal className="w-5 h-5 text-orange-500" />}
                        <div>
                          <span className="text-sky-900 font-medium text-sm">{record.game}</span>
                          <div className="text-xs text-sky-600 mt-1">
                            {record.opponents.map((opp, i) => (
                              <span key={i}>
                                {opp.place}. {opp.teamName}
                                {i < record.opponents.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sky-700 font-bold">+{record.points}</div>
                        <div className="text-xs text-sky-500">{record.percentage}%</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-black text-sky-900">
                    {animatedScores[selectedTeamHistory] || 0}
                  </div>
                  <div className="text-sky-600">Ընդհանուր միավորներ</div>
                  {getTeamHistory(selectedTeamHistory).length > 0 && (
                    <div className="mt-2 text-sm text-sky-700">
                      Արդյունավետություն: {
                        Math.round((animatedScores[selectedTeamHistory] || 0) /
                          (getTeamHistory(selectedTeamHistory).length * 40) * 100)
                      }%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 mt-10 text-center flex-wrap">
          <Link
            href="/scores"
            className="inline-flex text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 items-center gap-3 group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
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
              🎉 Հաղթող թիմ
            </button>
          )}
        </div>
      </div>

      {showCelebration && winner && (
        <Celebration
          winner={winner}
          team={winner}
          isVisible={showCelebration}
          onClose={handleCloseCelebration}
        />
      )}

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
        
        .glass-dark {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}