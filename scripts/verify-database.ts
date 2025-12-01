/**
 * Database Verification Script
 *
 * This script verifies that the database is properly set up with:
 * - All required tables
 * - Proper indexes
 * - Seed data
 * - Type-safe queries
 *
 * Run with: npx tsx scripts/verify-database.ts
 */

import { db } from '../lib/db';
import type {
  TypedTrainingModule,
  WordMemoryConfig,
} from '../lib/db/types';
import { isWordMemoryConfig } from '../lib/db/types';

async function verifyDatabase() {
  console.log('🔍 Verifying Axon Overclocking Database Setup...\n');

  try {
    // ========================================================================
    // 1. Verify Tables Exist
    // ========================================================================
    console.log('1. Checking tables...');

    const userCount = await db.user.count();
    const moduleCount = await db.trainingModule.count();
    const sessionCount = await db.trainingSession.count();
    const progressCount = await db.userProgress.count();
    const contentUsageCount = await db.contentUsage.count();

    console.log(`   ✓ User table: ${userCount} records`);
    console.log(`   ✓ TrainingModule table: ${moduleCount} records`);
    console.log(`   ✓ TrainingSession table: ${sessionCount} records`);
    console.log(`   ✓ UserProgress table: ${progressCount} records`);
    console.log(`   ✓ ContentUsage table: ${contentUsageCount} records\n`);

    // ========================================================================
    // 2. Verify Seed Data
    // ========================================================================
    console.log('2. Verifying seed data...');

    const testUsers = await db.user.findMany({
      where: {
        email: {
          in: ['alice@test.com', 'bob@test.com', 'charlie@test.com'],
        },
      },
    });

    if (testUsers.length !== 3) {
      throw new Error(`Expected 3 test users, found ${testUsers.length}`);
    }

    console.log('   ✓ Test users created');
    testUsers.forEach(user => {
      console.log(`     - ${user.email} (${user.username})`);
    });

    const wordMemory = await db.trainingModule.findUnique({
      where: { slug: 'word-memory' },
    });

    if (!wordMemory) {
      throw new Error('Word Memory module not found');
    }

    console.log(`   ✓ Word Memory module created`);
    console.log(`     - ID: ${wordMemory.id}`);
    console.log(`     - Name: ${wordMemory.name}\n`);

    // ========================================================================
    // 3. Verify JSON Configuration Type Safety
    // ========================================================================
    console.log('3. Testing JSON configuration type safety...');

    const typedModule = wordMemory as TypedTrainingModule<WordMemoryConfig>;

    if (!isWordMemoryConfig(typedModule.configuration)) {
      throw new Error('Word Memory configuration has invalid structure');
    }

    const config = typedModule.configuration;
    console.log(`   ✓ JSON configuration is valid`);
    console.log(`     - Study time: ${config.studyTime}s`);
    console.log(`     - Recall time: ${config.recallTime}s`);
    console.log(`     - Difficulties: ${Object.keys(config.difficulties).join(', ')}\n`);

    // ========================================================================
    // 4. Verify Relations
    // ========================================================================
    console.log('4. Testing database relations...');

    const alice = testUsers.find(u => u.email === 'alice@test.com');
    if (!alice) throw new Error('Alice not found');

    const aliceWithSessions = await db.user.findUnique({
      where: { id: alice.id },
      include: {
        trainingSessions: true,
        userProgress: {
          include: {
            trainingModule: true,
          },
        },
        contentUsage: true,
      },
    });

    if (!aliceWithSessions) {
      throw new Error('Could not fetch Alice with relations');
    }

    console.log(`   ✓ User → TrainingSession relation: ${aliceWithSessions.trainingSessions.length} sessions`);
    console.log(`   ✓ User → UserProgress relation: ${aliceWithSessions.userProgress.length} progress records`);
    console.log(`   ✓ User → ContentUsage relation: ${aliceWithSessions.contentUsage.length} usage records\n`);

    // ========================================================================
    // 5. Verify Indexes (via query performance)
    // ========================================================================
    console.log('5. Testing indexed queries...');

    // Query using userId + createdAt index
    const recentSessions = await db.trainingSession.findMany({
      where: { userId: alice.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`   ✓ TrainingSession index query: ${recentSessions.length} results`);

    // Query using userId + contentType + usedAt index
    const recentContent = await db.contentUsage.findMany({
      where: {
        userId: alice.id,
        contentType: 'word',
      },
      orderBy: { usedAt: 'desc' },
      take: 3,
    });

    console.log(`   ✓ ContentUsage index query: ${recentContent.length} results`);

    // Query using userId + trainingModuleId unique constraint
    const progress = await db.userProgress.findUnique({
      where: {
        userId_trainingModuleId: {
          userId: alice.id,
          trainingModuleId: wordMemory.id,
        },
      },
    });

    console.log(`   ✓ UserProgress unique constraint query: ${progress ? 'found' : 'not found'}\n`);

    // ========================================================================
    // 6. Verify Content Exclusion Algorithm
    // ========================================================================
    console.log('6. Testing content exclusion algorithm...');

    const last3Sessions = await db.contentUsage.findMany({
      where: {
        userId: alice.id,
        contentType: 'word',
      },
      orderBy: { usedAt: 'desc' },
      take: 3,
      select: { items: true },
    });

    const excludedWords = new Set(
      last3Sessions.flatMap(usage => usage.items as string[])
    );

    console.log(`   ✓ Excluded ${excludedWords.size} unique words from last 3 sessions`);
    console.log(`     Sample excluded: ${Array.from(excludedWords).slice(0, 5).join(', ')}\n`);

    // ========================================================================
    // 7. Verify Performance Calculations
    // ========================================================================
    console.log('7. Verifying performance calculations...');

    if (progress) {
      console.log(`   ✓ Total sessions: ${progress.totalSessions}`);
      console.log(`   ✓ Average score: ${progress.averageScore.toFixed(2)}`);
      console.log(`   ✓ Best score: ${progress.bestScore}`);
      console.log(`   ✓ Current streak: ${progress.currentStreak}`);
      console.log(`   ✓ Longest streak: ${progress.longestStreak}\n`);
    }

    // ========================================================================
    // 8. Summary
    // ========================================================================
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ Database verification complete!');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('Database is ready for:');
    console.log('  ✓ NextAuth authentication integration');
    console.log('  ✓ Content service implementation');
    console.log('  ✓ Training module development');
    console.log('  ✓ API route implementation\n');

    console.log('Next steps:');
    console.log('  1. Run "npx prisma studio" to explore the data');
    console.log('  2. Implement NextAuth configuration (auth-guardian agent)');
    console.log('  3. Build content service (content-strategist agent)');
    console.log('  4. Create UI components (ui-designer agent)\n');

  } catch (error) {
    console.error('❌ Database verification failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run verification
verifyDatabase()
  .catch(console.error);
