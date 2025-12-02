/**
 * Content Service Demo
 *
 * This script demonstrates the full capabilities of the content service.
 * It shows real-world usage patterns for training modules.
 *
 * Run with: npx tsx scripts/demo-content-service.ts
 */

import { contentService } from '../lib/content-service';
import { prisma } from '../lib/prisma';

async function demo() {
  console.log('='.repeat(60));
  console.log('         Content Service Demo - Real World Usage');
  console.log('='.repeat(60));

  const demoUserId = 'demo_user_' + Date.now();

  console.log('\n1. Basic Word Selection (Easy Difficulty)');
  console.log('-'.repeat(60));
  const easyWords = await contentService.getWords({
    count: 10,
    difficulty: 'easy',
    userId: demoUserId,
  });

  console.log(`Selected ${easyWords.length} easy words:`);
  easyWords.forEach((word, i) => {
    console.log(`  ${i + 1}. ${word.word} (${word.category}, ${word.length} letters)`);
  });

  console.log('\n2. Category-Filtered Selection (Food & Animals)');
  console.log('-'.repeat(60));
  const categoryWords = await contentService.getWords({
    count: 8,
    difficulty: 'medium',
    userId: demoUserId,
    categories: ['food', 'animals'],
  });

  console.log(`Selected ${categoryWords.length} words from food & animals:`);
  categoryWords.forEach((word, i) => {
    console.log(`  ${i + 1}. ${word.word} (${word.category})`);
  });

  console.log('\n3. Length-Constrained Selection (4-6 letters)');
  console.log('-'.repeat(60));
  const lengthWords = await contentService.getWords({
    count: 8,
    difficulty: 'easy',
    userId: demoUserId,
    minLength: 4,
    maxLength: 6,
  });

  console.log(`Selected ${lengthWords.length} words (4-6 letters):`);
  lengthWords.forEach((word, i) => {
    console.log(`  ${i + 1}. ${word.word} (${word.length} letters)`);
  });

  console.log('\n4. Advanced Selection with Metadata');
  console.log('-'.repeat(60));
  const result = await contentService.getWordsWithMetadata({
    count: 15,
    difficulty: 'hard',
    userId: demoUserId,
    categories: ['science', 'technology'],
    minLength: 8,
  });

  console.log('Selection Metadata:');
  console.log(`  Requested: ${result.metadata.requested} words`);
  console.log(`  Returned: ${result.metadata.returned} words`);
  console.log(`  Total Available: ${result.metadata.totalAvailable} words`);
  console.log(`  Excluded (from recent sessions): ${result.metadata.excluded} words`);
  console.log(`  Filters Relaxed: ${result.metadata.filtersRelaxed ? 'Yes' : 'No'}`);

  console.log(`\nSelected ${result.words.length} advanced words:`);
  result.words.slice(0, 5).forEach((word, i) => {
    console.log(`  ${i + 1}. ${word.word} (${word.category}, ${word.length} letters)`);
  });
  if (result.words.length > 5) {
    console.log(`  ... and ${result.words.length - 5} more`);
  }

  console.log('\n5. Simulating Training Session with Real User');
  console.log('-'.repeat(60));

  // First, create a real user for the demo
  try {
    const user = await prisma.user.create({
      data: {
        email: `${demoUserId}@example.com`,
        username: demoUserId,
        password: 'demo_password_hash', // In real app, this would be bcrypt hashed
      },
    });

    console.log(`Created demo user: ${user.username}`);

    // Session 1
    console.log('\nSession 1: First training session');
    const session1Words = await contentService.getWords({
      count: 20,
      difficulty: 'medium',
      userId: user.id,
    });
    console.log(`  Selected ${session1Words.length} words`);
    console.log(`  Sample: ${session1Words.slice(0, 5).map((w) => w.word).join(', ')}...`);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Session 2 - should exclude session 1 words
    console.log('\nSession 2: Second training session (excludes session 1)');
    const session2Words = await contentService.getWords({
      count: 20,
      difficulty: 'medium',
      userId: user.id,
    });
    console.log(`  Selected ${session2Words.length} words`);
    console.log(`  Sample: ${session2Words.slice(0, 5).map((w) => w.word).join(', ')}...`);

    // Check for duplicates
    const set1 = new Set(session1Words.map((w) => w.word));
    const set2 = new Set(session2Words.map((w) => w.word));
    const duplicates = [...set1].filter((w) => set2.has(w));

    console.log(`  Duplicates between sessions: ${duplicates.length}`);
    if (duplicates.length > 0) {
      console.log(`  WARNING: Found duplicates: ${duplicates.join(', ')}`);
    } else {
      console.log(`  ✓ Perfect exclusion - no repeated words!`);
    }

    // Check exclusion stats
    const stats = await contentService.getExclusionStats(user.id);
    console.log('\nExclusion Statistics:');
    console.log(`  Total sessions: ${stats.totalSessions}`);
    console.log(`  Recent sessions: ${stats.recentSessions}`);
    console.log(`  Currently excluding: ${stats.excludedCount} words`);

    // Cleanup
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log(`\nCleaned up demo user`);
  } catch (error) {
    console.log('Note: Skipping real user demo (user already exists or DB issue)');
  }

  console.log('\n6. Word Database Statistics');
  console.log('-'.repeat(60));

  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  let totalWords = 0;

  for (const difficulty of difficulties) {
    const result = await contentService.getWordsWithMetadata({
      count: 99999,
      difficulty,
      userId: demoUserId,
    });

    const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    console.log(`${difficultyName} difficulty: ${result.metadata.totalAvailable} words`);
    totalWords += result.metadata.totalAvailable;

    // Show category breakdown
    const categories = new Map<string, number>();
    result.words.forEach((word) => {
      categories.set(word.category, (categories.get(word.category) || 0) + 1);
    });

    const topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log('  Top categories:');
    topCategories.forEach(([category, count]) => {
      console.log(`    - ${category}: ${count} words`);
    });
  }

  console.log(`\nTotal words in database: ${totalWords}`);

  console.log('\n' + '='.repeat(60));
  console.log('              Demo Complete!');
  console.log('='.repeat(60));
  console.log('\nThe content service is ready for production use.');
  console.log('Next steps: Integrate with API routes and training modules.');

  await prisma.$disconnect();
}

// Run demo
demo().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
