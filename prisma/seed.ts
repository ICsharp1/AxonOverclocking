/**
 * Axon Overclocking - Database Seed Script
 *
 * This script populates the database with realistic test data:
 * - 3 test users with varying progress levels
 * - Word Memory training module with full configuration
 * - Sample training sessions demonstrating different performance levels
 * - User progress records showing different stages of training
 * - Content usage records for testing the exclusion algorithm
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize Prisma Client for seeding
const prisma = new PrismaClient();

// Password for all test users (hashed)
const TEST_PASSWORD = 'password123';

/**
 * Word Memory training module configuration
 * This demonstrates the JSON extensibility pattern
 */
const WORD_MEMORY_CONFIG = {
  studyTime: 60, // seconds
  recallTime: 120, // seconds
  difficulties: {
    easy: {
      wordCount: 10,
      categories: ['common'],
      minLength: 3,
      maxLength: 6
    },
    medium: {
      wordCount: 20,
      categories: ['common', 'uncommon'],
      minLength: 4,
      maxLength: 8
    },
    hard: {
      wordCount: 30,
      categories: ['uncommon', 'rare'],
      minLength: 5,
      maxLength: 12
    }
  },
  scoring: {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 0
  }
};

/**
 * Sample words for content usage records
 */
const SAMPLE_WORDS = {
  session1: ['apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'garden', 'house', 'island', 'jungle'],
  session2: ['keyboard', 'laptop', 'mouse', 'network', 'ocean', 'planet', 'queen', 'river', 'sunset', 'tower'],
  session3: ['umbrella', 'village', 'window', 'xylophone', 'yellow', 'zebra', 'airport', 'bridge', 'castle', 'desert']
};

async function main() {
  console.log('Starting database seed...\n');

  // Hash the test password once
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  // ============================================================================
  // 1. Create Test Users
  // ============================================================================
  console.log('Creating test users...');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@test.com',
        username: 'alice',
        password: hashedPassword,
        name: 'Alice Johnson',
        emailVerified: new Date(),
        createdAt: new Date('2025-11-01T10:00:00Z')
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@test.com',
        username: 'bob',
        password: hashedPassword,
        name: 'Bob Smith',
        emailVerified: new Date(),
        createdAt: new Date('2025-11-15T14:30:00Z')
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie@test.com',
        username: 'charlie',
        password: hashedPassword,
        name: 'Charlie Davis',
        createdAt: new Date('2025-11-28T09:15:00Z')
      }
    })
  ]);

  console.log(`✓ Created ${users.length} users`);
  console.log(`  - alice@test.com (password: ${TEST_PASSWORD})`);
  console.log(`  - bob@test.com (password: ${TEST_PASSWORD})`);
  console.log(`  - charlie@test.com (password: ${TEST_PASSWORD})\n`);

  // ============================================================================
  // 2. Create Training Module
  // ============================================================================
  console.log('Creating training module...');

  const wordMemoryModule = await prisma.trainingModule.create({
    data: {
      name: 'Word Memory',
      slug: 'word-memory',
      description: 'Test your working memory by recalling as many words as possible from a list you studied for 60 seconds.',
      category: 'memory',
      configuration: WORD_MEMORY_CONFIG,
      isActive: true
    }
  });

  console.log(`✓ Created training module: ${wordMemoryModule.name}\n`);

  // ============================================================================
  // 3. Create Training Sessions for Alice (experienced user)
  // ============================================================================
  console.log('Creating training sessions for Alice (experienced user)...');

  const aliceSessions = await Promise.all([
    // Session 1 - Good performance
    prisma.trainingSession.create({
      data: {
        userId: users[0].id,
        trainingModuleId: wordMemoryModule.id,
        configuration: {
          difficulty: 'medium',
          wordCount: 20,
          studyTime: 60,
          recallTime: 120
        },
        results: {
          studiedWords: SAMPLE_WORDS.session1,
          recalledWords: ['apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'garden', 'house'],
          correctWords: ['apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest', 'garden', 'house'],
          incorrectWords: [],
          missedWords: ['island', 'jungle']
        },
        score: 80.0,
        accuracy: 100.0,
        duration: 115,
        performanceLevel: 'good',
        status: 'completed',
        createdAt: new Date('2025-11-25T10:00:00Z')
      }
    }),
    // Session 2 - Excellent performance
    prisma.trainingSession.create({
      data: {
        userId: users[0].id,
        trainingModuleId: wordMemoryModule.id,
        configuration: {
          difficulty: 'medium',
          wordCount: 20,
          studyTime: 60,
          recallTime: 120
        },
        results: {
          studiedWords: SAMPLE_WORDS.session2,
          recalledWords: ['keyboard', 'laptop', 'mouse', 'network', 'ocean', 'planet', 'queen', 'river', 'sunset'],
          correctWords: ['keyboard', 'laptop', 'mouse', 'network', 'ocean', 'planet', 'queen', 'river', 'sunset'],
          incorrectWords: [],
          missedWords: ['tower']
        },
        score: 90.0,
        accuracy: 100.0,
        duration: 98,
        performanceLevel: 'excellent',
        status: 'completed',
        createdAt: new Date('2025-11-26T15:30:00Z')
      }
    }),
    // Session 3 - Very good performance
    prisma.trainingSession.create({
      data: {
        userId: users[0].id,
        trainingModuleId: wordMemoryModule.id,
        configuration: {
          difficulty: 'medium',
          wordCount: 20,
          studyTime: 60,
          recallTime: 120
        },
        results: {
          studiedWords: SAMPLE_WORDS.session3,
          recalledWords: ['umbrella', 'village', 'window', 'yellow', 'zebra', 'airport', 'bridge', 'castle', 'desert'],
          correctWords: ['umbrella', 'village', 'window', 'yellow', 'zebra', 'airport', 'bridge', 'castle', 'desert'],
          incorrectWords: [],
          missedWords: ['xylophone']
        },
        score: 90.0,
        accuracy: 100.0,
        duration: 105,
        performanceLevel: 'excellent',
        status: 'completed',
        createdAt: new Date('2025-11-27T09:45:00Z')
      }
    })
  ]);

  console.log(`✓ Created ${aliceSessions.length} sessions for Alice\n`);

  // ============================================================================
  // 4. Create Training Session for Bob (intermediate user)
  // ============================================================================
  console.log('Creating training session for Bob (intermediate user)...');

  const bobSession = await prisma.trainingSession.create({
    data: {
      userId: users[1].id,
      trainingModuleId: wordMemoryModule.id,
      configuration: {
        difficulty: 'medium',
        wordCount: 20,
        studyTime: 60,
        recallTime: 120
      },
      results: {
        studiedWords: SAMPLE_WORDS.session1,
        recalledWords: ['apple', 'banana', 'cherry', 'dragon', 'elephant', 'zebra'],
        correctWords: ['apple', 'banana', 'cherry', 'dragon', 'elephant'],
        incorrectWords: ['zebra'],
        missedWords: ['forest', 'garden', 'house', 'island', 'jungle']
      },
      score: 50.0,
      accuracy: 83.33,
      duration: 120,
      performanceLevel: 'fair',
      status: 'completed',
      createdAt: new Date('2025-11-28T16:20:00Z')
    }
  });

  console.log(`✓ Created 1 session for Bob\n`);

  // ============================================================================
  // 5. Create User Progress Records
  // ============================================================================
  console.log('Creating user progress records...');

  const progressRecords = await Promise.all([
    // Alice - experienced user with good progress
    prisma.userProgress.create({
      data: {
        userId: users[0].id,
        trainingModuleId: wordMemoryModule.id,
        totalSessions: 3,
        averageScore: 86.67,
        bestScore: 90.0,
        currentStreak: 3,
        longestStreak: 3,
        currentDifficulty: {
          level: 'medium',
          adaptiveScore: 86.67,
          readyForHard: true
        },
        lastSessionAt: new Date('2025-11-27T09:45:00Z')
      }
    }),
    // Bob - intermediate user with room for improvement
    prisma.userProgress.create({
      data: {
        userId: users[1].id,
        trainingModuleId: wordMemoryModule.id,
        totalSessions: 1,
        averageScore: 50.0,
        bestScore: 50.0,
        currentStreak: 1,
        longestStreak: 1,
        currentDifficulty: {
          level: 'medium',
          adaptiveScore: 50.0,
          readyForHard: false
        },
        lastSessionAt: new Date('2025-11-28T16:20:00Z')
      }
    })
  ]);

  console.log(`✓ Created ${progressRecords.length} progress records\n`);

  // ============================================================================
  // 6. Create Content Usage Records (for exclusion testing)
  // ============================================================================
  console.log('Creating content usage records...');

  const contentUsageRecords = await Promise.all([
    // Alice's content usage - 3 sessions
    prisma.contentUsage.create({
      data: {
        userId: users[0].id,
        contentType: 'word',
        items: SAMPLE_WORDS.session1,
        usedAt: new Date('2025-11-25T10:00:00Z')
      }
    }),
    prisma.contentUsage.create({
      data: {
        userId: users[0].id,
        contentType: 'word',
        items: SAMPLE_WORDS.session2,
        usedAt: new Date('2025-11-26T15:30:00Z')
      }
    }),
    prisma.contentUsage.create({
      data: {
        userId: users[0].id,
        contentType: 'word',
        items: SAMPLE_WORDS.session3,
        usedAt: new Date('2025-11-27T09:45:00Z')
      }
    }),
    // Bob's content usage - 1 session
    prisma.contentUsage.create({
      data: {
        userId: users[1].id,
        contentType: 'word',
        items: SAMPLE_WORDS.session1,
        usedAt: new Date('2025-11-28T16:20:00Z')
      }
    })
  ]);

  console.log(`✓ Created ${contentUsageRecords.length} content usage records\n`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('=====================================');
  console.log('Database seeding completed! 🎉');
  console.log('=====================================\n');

  console.log('Summary:');
  console.log(`  Users: ${users.length}`);
  console.log(`  Training Modules: 1`);
  console.log(`  Training Sessions: ${aliceSessions.length + 1}`);
  console.log(`  Progress Records: ${progressRecords.length}`);
  console.log(`  Content Usage Records: ${contentUsageRecords.length}\n`);

  console.log('Test Users:');
  console.log('  1. alice@test.com - Experienced user (3 sessions, avg score: 86.67)');
  console.log('  2. bob@test.com - Intermediate user (1 session, score: 50.0)');
  console.log('  3. charlie@test.com - New user (no sessions yet)\n');

  console.log('Password for all users: password123\n');

  console.log('Next steps:');
  console.log('  - Run "npx prisma studio" to view the data');
  console.log('  - Start implementing authentication with NextAuth');
  console.log('  - Build the content service with exclusion algorithm\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
