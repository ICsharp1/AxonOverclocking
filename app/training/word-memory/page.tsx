/**
 * Word Memory Training Module
 *
 * A comprehensive 4-phase neuroplasticity-based training module for working memory enhancement.
 *
 * Phase Pattern:
 * 1. Intro: Explain exercise and select difficulty
 * 2. Study: Display words for timed memorization
 * 3. Recall: User types remembered words
 * 4. Results: Show detailed performance breakdown and save to database
 *
 * Features:
 * - Adaptive difficulty (Easy/Medium/Hard)
 * - Smart content exclusion (never repeat words)
 * - Real-time timer with color-coded urgency
 * - Comprehensive scoring (score, accuracy, breakdown)
 * - Motivational feedback based on performance
 * - Database integration for progress tracking
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button, Input, Timer, ProgressBar, Badge } from '@/components/ui';
import { PageContainer } from '@/components/layout';

// Type definitions
type Phase = 'intro' | 'study' | 'recall' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

interface Word {
  word: string;
  category: string;
  length: number;
}

interface Results {
  score: number;
  accuracy: number;
  correct: string[];
  incorrect: string[];
  missed: Word[];
  totalWords: number;
  recalledWords: number;
}

interface DifficultyConfig {
  level: Difficulty;
  words: number;
  time: number;
  description: string;
}

// Difficulty configurations
const DIFFICULTIES: DifficultyConfig[] = [
  { level: 'easy', words: 15, time: 75, description: 'Beginner friendly' },
  { level: 'medium', words: 20, time: 60, description: 'Standard challenge' },
  { level: 'hard', words: 25, time: 45, description: 'Expert mode' },
];

export default function WordMemoryTraining() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  // Core state
  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [customWordCount, setCustomWordCount] = useState(20);
  const [customTimeLimit, setCustomTimeLimit] = useState(60);
  const [rouletteMode, setRouletteMode] = useState(false);
  const [rouletteAdvanceMode, setRouletteAdvanceMode] = useState<'timed' | 'manual'>('timed');
  const [rouletteTimePerWord, setRouletteTimePerWord] = useState(3);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [results, setResults] = useState<Results | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<number>(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Auto-focus input in recall phase
  useEffect(() => {
    if (phase === 'recall' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // Timer countdown for study phase (regular and roulette timed mode)
  useEffect(() => {
    if (phase === 'study') {
      // Regular mode
      if (!rouletteMode && timeRemaining > 0) {
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setPhase('recall');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }

      // Roulette timed mode
      if (rouletteMode && rouletteAdvanceMode === 'timed' && timeRemaining > 0) {
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              // Move to next word or finish
              if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex((idx) => idx + 1);
                return rouletteTimePerWord; // Reset timer for next word
              } else {
                clearInterval(timer);
                setPhase('recall');
                return 0;
              }
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [phase, timeRemaining, rouletteMode, rouletteAdvanceMode, currentWordIndex, words.length, rouletteTimePerWord]);

  // Keyboard handler for roulette manual mode
  useEffect(() => {
    if (phase === 'study' && rouletteMode && rouletteAdvanceMode === 'manual') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex((idx) => idx + 1);
          } else {
            setPhase('recall');
          }
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase, rouletteMode, rouletteAdvanceMode, currentWordIndex, words.length]);

  /**
   * Phase 1: Start Training
   * Fetches words from API and begins study phase
   */
  const startTraining = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get word count and time limit based on difficulty
      let wordCount: number;
      let timeLimit: number;
      let difficultyLevel: 'easy' | 'medium' | 'hard';

      if (difficulty === 'custom') {
        // Validate custom settings
        if (customWordCount < 5 || customWordCount > 50) {
          setError('Word count must be between 5 and 50');
          setIsLoading(false);
          return;
        }
        if (customTimeLimit < 10 || customTimeLimit > 300) {
          setError('Time limit must be between 10 and 300 seconds');
          setIsLoading(false);
          return;
        }
        wordCount = customWordCount;
        timeLimit = customTimeLimit;
        difficultyLevel = 'medium'; // Default for API
      } else {
        const config = DIFFICULTIES.find((d) => d.level === difficulty)!;
        wordCount = config.words;
        timeLimit = config.time;
        difficultyLevel = difficulty;
      }

      const response = await fetch('/api/content/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: wordCount,
          difficulty: difficultyLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }

      const data = await response.json();

      if (!data.words || data.words.length === 0) {
        throw new Error('No words available. Please try again.');
      }

      setWords(data.words);
      setPhase('study');
      setCurrentWordIndex(0); // Reset for roulette mode

      // Calculate time limit for roulette mode
      if (difficulty === 'custom' && rouletteMode) {
        if (rouletteAdvanceMode === 'timed') {
          setTimeRemaining(rouletteTimePerWord); // Start with first word timer
        } else {
          setTimeRemaining(0); // Manual mode doesn't use timer
        }
      } else {
        setTimeRemaining(timeLimit);
      }

      setStudyStartTime(Date.now());
    } catch (err: any) {
      setError(err.message || 'Failed to start training. Please try again.');
      console.error('Error starting training:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Phase 3: Handle recall word submission
   * Validates and adds word to recalled list
   */
  const handleRecallSubmit = () => {
    const trimmedInput = currentInput.trim().toLowerCase();

    // Validate input
    if (!trimmedInput) {
      return;
    }

    // Check for duplicates
    if (recalledWords.some((w) => w.toLowerCase() === trimmedInput)) {
      setError('You already entered that word!');
      setTimeout(() => setError(''), 2000);
      setCurrentInput('');
      return;
    }

    // Add word to recalled list
    setRecalledWords([...recalledWords, trimmedInput]);
    setCurrentInput('');
    setError('');
  };

  /**
   * Phase 3: Remove word from recalled list
   */
  const removeRecalledWord = (index: number) => {
    setRecalledWords(recalledWords.filter((_, i) => i !== index));
  };

  /**
   * Phase 4: Calculate results
   * Computes score, accuracy, and word breakdowns
   */
  const calculateResults = (): Results => {
    const originalWordsSet = new Set(words.map((w) => w.word.toLowerCase()));
    const recalledWordsSet = new Set(recalledWords.map((w) => w.toLowerCase()));

    // Calculate correct, incorrect, and missed words
    const correct = recalledWords.filter((w) => originalWordsSet.has(w.toLowerCase()));
    const incorrect = recalledWords.filter((w) => !originalWordsSet.has(w.toLowerCase()));
    const missed = words.filter((w) => !recalledWordsSet.has(w.word.toLowerCase()));

    // Calculate score and accuracy (handle edge cases)
    const score = words.length > 0 ? Math.round((correct.length / words.length) * 100) : 0;
    const accuracy =
      recalledWords.length > 0
        ? Math.round((correct.length / recalledWords.length) * 100)
        : 0;

    return {
      score,
      accuracy,
      correct,
      incorrect,
      missed,
      totalWords: words.length,
      recalledWords: recalledWords.length,
    };
  };

  /**
   * Phase 4: Finish recall and show results
   */
  const finishRecall = async () => {
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setPhase('results');

    // Save session to database
    await saveSession(calculatedResults);
  };

  /**
   * Save training session to database
   */
  const saveSession = async (sessionResults: Results) => {
    setIsSaving(true);

    try {
      const config = DIFFICULTIES.find((d) => d.level === difficulty)!;
      const totalTime = Math.round((Date.now() - studyStartTime) / 1000);

      const response = await fetch('/api/training/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingType: 'word-memory',
          configuration: {
            difficulty,
            wordCount: words.length,
            timeLimit: config.time,
          },
          results: {
            score: sessionResults.score,
            accuracy: sessionResults.accuracy,
            correctCount: sessionResults.correct.length,
            incorrectCount: sessionResults.incorrect.length,
            missedCount: sessionResults.missed.length,
            timeSpent: totalTime,
          },
          contentUsed: words.map((w) => ({
            word: w.word,
            category: w.category,
          })),
        }),
      });

      if (!response.ok) {
        console.error('Failed to save session');
      }
    } catch (err) {
      console.error('Error saving session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset training to intro phase
   */
  const resetTraining = () => {
    setPhase('intro');
    setWords([]);
    setRecalledWords([]);
    setCurrentInput('');
    setResults(null);
    setError('');
    setTimeRemaining(60);
  };

  /**
   * Get timer color variant based on time remaining
   */
  const getTimerVariant = (seconds: number): 'default' | 'warning' | 'danger' => {
    const config = DIFFICULTIES.find((d) => d.level === difficulty)!;
    const percentage = (seconds / config.time) * 100;

    if (percentage > 50) return 'default';
    if (percentage > 20) return 'warning';
    return 'danger';
  };

  /**
   * Get motivational message based on score
   */
  const getMotivationalMessage = (score: number): string => {
    if (score >= 90) return 'Outstanding! Your memory is razor-sharp!';
    if (score >= 75) return 'Excellent work! Keep pushing those limits!';
    if (score >= 60) return 'Good job! You\'re building stronger neural pathways!';
    if (score >= 40) return 'Nice effort! Every session makes you stronger!';
    return 'Keep practicing! Neuroplasticity takes time!';
  };

  /**
   * Get performance color variant
   */
  const getPerformanceVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  // Loading state
  if (status === 'loading') {
    return (
      <PageContainer maxWidth="lg">
        <Card blur="lg" className="p-8 text-center">
          <p className="text-white/80">Loading...</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      {/* Phase 1: Intro */}
      {phase === 'intro' && (
        <Card blur="lg" className="p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Word Memory Training
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Strengthen your working memory by memorizing and recalling lists of words.
              This exercise challenges your brain&apos;s ability to encode, store, and retrieve
              information under time pressure, driving neuroplastic adaptation.
            </p>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Select Difficulty</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DIFFICULTIES.map((config) => (
                  <button
                    key={config.level}
                    onClick={() => setDifficulty(config.level)}
                    className={`p-6 rounded-2xl transition-all duration-200 ${
                      difficulty === config.level
                        ? 'bg-purple-500/30 border-2 border-purple-400 scale-105'
                        : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                    }`}
                  >
                    <Badge
                      variant={
                        config.level === 'easy'
                          ? 'success'
                          : config.level === 'medium'
                          ? 'warning'
                          : 'error'
                      }
                      className="mb-3"
                    >
                      {config.level.toUpperCase()}
                    </Badge>
                    <p className="text-white font-semibold text-lg mb-1">
                      {config.words} words / {config.time}s
                    </p>
                    <p className="text-white/60 text-sm">{config.description}</p>
                  </button>
                ))}

                {/* Custom Difficulty Option */}
                <button
                  onClick={() => setDifficulty('custom')}
                  className={`p-6 rounded-2xl transition-all duration-200 ${
                    difficulty === 'custom'
                      ? 'bg-purple-500/30 border-2 border-purple-400 scale-105'
                      : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                  }`}
                >
                  <Badge variant="info" className="mb-3">
                    CUSTOM
                  </Badge>
                  <p className="text-white font-semibold text-lg mb-1">
                    Your choice
                  </p>
                  <p className="text-white/60 text-sm">Personalize settings</p>
                </button>
              </div>

              {/* Custom Settings Inputs */}
              {difficulty === 'custom' && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Custom Settings</h3>

                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Number of Words (5-50)
                      </label>
                      <Input
                        type="number"
                        min="5"
                        max="50"
                        value={customWordCount}
                        onChange={(e) => setCustomWordCount(parseInt(e.target.value) || 20)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        {rouletteMode ? 'Total Time Limit (10-300s)' : 'Time Limit (10-300 seconds)'}
                      </label>
                      <Input
                        type="number"
                        min="10"
                        max="300"
                        value={customTimeLimit}
                        onChange={(e) => setCustomTimeLimit(parseInt(e.target.value) || 60)}
                        className="w-full"
                        disabled={rouletteMode}
                      />
                    </div>
                  </div>

                  {/* Roulette Mode Toggle */}
                  <div className="border-t border-white/10 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rouletteMode}
                        onChange={(e) => setRouletteMode(e.target.checked)}
                        className="w-5 h-5 rounded bg-white/10 border-2 border-white/30 checked:bg-purple-500 checked:border-purple-500 cursor-pointer transition-colors"
                      />
                      <div>
                        <span className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                          🎰 Roulette Mode (Hardcore)
                        </span>
                        <p className="text-white/60 text-sm">
                          Words flash one at a time. No going back!
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Roulette Settings */}
                  {rouletteMode && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-4">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <span>⚡</span> Roulette Settings
                      </h4>

                      {/* Advance Mode */}
                      <div>
                        <label className="block text-white/80 text-sm mb-2">
                          Word Advance Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setRouletteAdvanceMode('timed')}
                            className={`p-3 rounded-lg transition-all ${
                              rouletteAdvanceMode === 'timed'
                                ? 'bg-purple-500/40 border-2 border-purple-400'
                                : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                            }`}
                          >
                            <div className="text-white font-semibold">⏱️ Timed</div>
                            <div className="text-white/60 text-xs">Auto-advance</div>
                          </button>
                          <button
                            onClick={() => setRouletteAdvanceMode('manual')}
                            className={`p-3 rounded-lg transition-all ${
                              rouletteAdvanceMode === 'manual'
                                ? 'bg-purple-500/40 border-2 border-purple-400'
                                : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                            }`}
                          >
                            <div className="text-white font-semibold">⏎ Manual</div>
                            <div className="text-white/60 text-xs">Press Enter</div>
                          </button>
                        </div>
                      </div>

                      {/* Time per word (only for timed mode) */}
                      {rouletteAdvanceMode === 'timed' && (
                        <div>
                          <label className="block text-white/80 text-sm mb-2">
                            Seconds per Word (1-10)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={rouletteTimePerWord}
                            onChange={(e) => setRouletteTimePerWord(parseInt(e.target.value) || 3)}
                            className="w-full"
                          />
                          <p className="text-white/50 text-xs mt-1">
                            Total time: {customWordCount * rouletteTimePerWord}s
                          </p>
                        </div>
                      )}

                      <p className="text-yellow-300 text-sm flex items-start gap-2">
                        <span>⚠️</span>
                        <span>Roulette mode is intense! You can't go back or skip words.</span>
                      </p>
                    </div>
                  )}

                  <p className="text-white/60 text-sm">
                    💡 Tip: {rouletteMode ? 'Roulette mode tests your rapid encoding ability!' : 'More words = harder challenge. Less time = more intense!'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-3">How It Works</h3>
              <ol className="space-y-2 text-white/80">
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-3">1.</span>
                  <span>Study the list of words displayed on screen</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-3">2.</span>
                  <span>Timer counts down - memorize as many as you can</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-3">3.</span>
                  <span>Recall and type the words you remember</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-purple-400 mr-3">4.</span>
                  <span>Get detailed performance feedback and track progress</span>
                </li>
              </ol>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={startTraining}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Loading Words...' : 'Start Training'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="flex-1 sm:flex-none"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Phase 2: Study */}
      {phase === 'study' && (
        <Card blur="lg" className="p-8">
          {/* Regular Mode - Show all words */}
          {!rouletteMode && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white">Study These Words</h2>
                <Timer
                  seconds={timeRemaining}
                  onComplete={() => setPhase('recall')}
                  variant={getTimerVariant(timeRemaining)}
                />
              </div>

              <p className="text-white/70 mb-6 text-lg">
                Memorize as many words as you can. The timer will automatically advance when it
                reaches zero.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
                {words.map((word, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl text-center hover:bg-white/20 transition-colors"
                  >
                    <p className="text-white text-base md:text-lg font-semibold">{word.word}</p>
                  </div>
                ))}
              </div>

              <Button variant="secondary" onClick={() => setPhase('recall')}>
                Skip to Recall
              </Button>
            </>
          )}

          {/* Roulette Mode - Show one word at a time */}
          {rouletteMode && (
            <div className="min-h-[500px] flex flex-col items-center justify-center">
              {/* Progress indicator */}
              <div className="mb-8 text-center">
                <div className="flex items-center gap-3 justify-center mb-4">
                  <span className="text-purple-300 font-bold text-lg">🎰 ROULETTE MODE</span>
                  {rouletteAdvanceMode === 'timed' && (
                    <Timer
                      seconds={timeRemaining}
                      onComplete={() => {}}
                      variant="danger"
                    />
                  )}
                </div>
                <p className="text-white/70 text-lg">
                  Word {currentWordIndex + 1} of {words.length}
                </p>
                <div className="mt-2 w-full max-w-md mx-auto bg-white/10 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current word - Large and centered */}
              <div className="bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border-4 border-purple-400/50 p-12 md:p-20 rounded-3xl mb-8 animate-[scaleIn_0.3s_ease-out]">
                <p className="text-white text-5xl md:text-7xl lg:text-8xl font-bold text-center">
                  {words[currentWordIndex]?.word}
                </p>
              </div>

              {/* Instructions */}
              <p className="text-white/60 text-center max-w-md">
                {rouletteAdvanceMode === 'timed'
                  ? 'Memorize it fast! Next word in ' + timeRemaining + 's...'
                  : 'Press Enter to see the next word'}
              </p>

              {/* Manual mode hint */}
              {rouletteAdvanceMode === 'manual' && (
                <div className="mt-6 bg-white/5 border border-white/20 rounded-xl px-6 py-3">
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <kbd className="bg-white/20 px-3 py-1 rounded font-mono text-white">Enter</kbd>
                    <span>to continue</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Phase 3: Recall */}
      {phase === 'recall' && (
        <Card blur="lg" className="p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Recall the Words
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Type as many words as you can remember. Press Enter or click Add after each
              word.
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-6">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRecallSubmit();
                  }
                }}
                placeholder="Type a word..."
                className="flex-1 text-lg"
              />
              <Button onClick={handleRecallSubmit} variant="primary" size="lg">
                Add Word
              </Button>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white/80 text-lg">
                  Words Recalled: <span className="font-bold text-white">{recalledWords.length}</span>
                </p>
                {recalledWords.length > 0 && (
                  <button
                    onClick={() => setRecalledWords([])}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {recalledWords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recalledWords.map((word, index) => (
                    <div
                      key={index}
                      className="bg-purple-500/30 border border-purple-400/50 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span className="text-white">{word}</span>
                      <button
                        onClick={() => removeRecalledWord(index)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 italic">No words recalled yet. Start typing!</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="success"
                size="lg"
                onClick={finishRecall}
                disabled={recalledWords.length === 0 || isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Finish & See Results'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Phase 4: Results */}
      {phase === 'results' && results && (
        <Card blur="lg" className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Training Complete!
              </h2>
              <p className="text-white/80 text-xl">{getMotivationalMessage(results.score)}</p>
            </div>

            {/* Score Display */}
            <div className="bg-white/5 rounded-2xl p-8 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/80 text-lg">Overall Score</span>
                <span className="text-5xl font-bold text-white">{results.score}%</span>
              </div>
              <ProgressBar
                value={results.score}
                max={100}
                variant={getPerformanceVariant(results.score)}
                animated
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center">
                <p className="text-green-200 text-sm mb-2">Correct</p>
                <p className="text-white text-4xl font-bold">{results.correct.length}</p>
              </div>
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
                <p className="text-red-200 text-sm mb-2">Incorrect</p>
                <p className="text-white text-4xl font-bold">{results.incorrect.length}</p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 text-center">
                <p className="text-yellow-200 text-sm mb-2">Missed</p>
                <p className="text-white text-4xl font-bold">{results.missed.length}</p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6 text-center">
                <p className="text-purple-200 text-sm mb-2">Accuracy</p>
                <p className="text-white text-4xl font-bold">{results.accuracy}%</p>
              </div>
            </div>

            {/* Word Breakdown */}
            <div className="space-y-6 mb-8">
              {/* Correct Words */}
              {results.correct.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Correct Words ({results.correct.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.correct.map((word, index) => (
                      <Badge key={index} variant="success">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Incorrect Words */}
              {results.incorrect.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✗</span> Incorrect Words ({results.incorrect.length})
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    These words were not in the original list
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.incorrect.map((word, index) => (
                      <Badge key={index} variant="error">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missed Words */}
              {results.missed.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⊘</span> Missed Words ({results.missed.length})
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    These words were in the list but not recalled
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.missed.map((word, index) => (
                      <Badge key={index} variant="warning">
                        {word.word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" onClick={resetTraining} className="flex-1">
                Train Again
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
