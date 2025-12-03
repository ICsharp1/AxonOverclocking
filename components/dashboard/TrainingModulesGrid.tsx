import { TrainingModuleCard } from './TrainingModuleCard';

interface TrainingModule {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

interface UserProgress {
  moduleId: string;
  bestScore: number;
  totalSessions: number;
  averageScore: number;
  lastPlayed: Date | string | null;
}

interface TrainingModulesGridProps {
  modules: TrainingModule[];
  userProgress: UserProgress[];
}

/**
 * Grid layout for training module cards
 * Responsive: 1 column on mobile, 2 on tablet, 3 on desktop
 */
export function TrainingModulesGrid({ modules, userProgress }: TrainingModulesGridProps) {
  // Show message if no modules available
  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Training Modules Available</h3>
        <p className="text-white/60">Training modules will be available soon!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Training Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          // Find user progress for this module
          const progress = userProgress.find((p) => p.moduleId === module.id);

          return (
            <TrainingModuleCard
              key={module.id}
              module={module}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
}
