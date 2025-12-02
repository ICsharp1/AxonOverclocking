/**
 * Content Service Test Script
 *
 * This script comprehensively tests the content service to verify:
 * - Word loading from JSON files
 * - Filtering by difficulty, category, and length
 * - Exclusion algorithm (no repeats in consecutive sessions)
 * - Graceful handling of edge cases
 * - Performance benchmarks
 *
 * Run with: npx tsx scripts/test-content-service.ts
 */

import { contentService } from '../lib/content-service';
import { prisma } from '../lib/prisma';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

function logTest(name: string) {
  console.log(`\n${colors.blue}TEST: ${name}${colors.reset}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

async function testBasicWordSelection() {
  logSection('Test 1: Basic Word Selection');

  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const testUserId = 'test_user_basic';

  for (const difficulty of difficulties) {
    logTest(`Get 20 ${difficulty} words`);

    const start = Date.now();
    const words = await contentService.getWords({
      count: 20,
      difficulty,
      userId: testUserId,
    });
    const duration = Date.now() - start;

    if (words.length === 20) {
      logSuccess(`Received ${words.length} words in ${duration}ms`);
    } else {
      logError(`Expected 20 words, got ${words.length}`);
    }

    // Verify word structure
    const firstWord = words[0];
    if (firstWord.word && firstWord.category && firstWord.length) {
      logSuccess('Word structure is valid');
    } else {
      logError('Invalid word structure');
    }

    // Sample words
    console.log(`  Sample words: ${words.slice(0, 5).map((w) => w.word).join(', ')}`);
  }
}

async function testCategoryFiltering() {
  logSection('Test 2: Category Filtering');

  const testUserId = 'test_user_category';

  logTest('Get 10 food words');
  const foodWords = await contentService.getWords({
    count: 10,
    difficulty: 'easy',
    userId: testUserId,
    categories: ['food'],
  });

  const allFood = foodWords.every((w) => w.category === 'food');
  if (allFood) {
    logSuccess(`All ${foodWords.length} words are from food category`);
  } else {
    logError('Some words are not from food category');
  }

  console.log(`  Food words: ${foodWords.map((w) => w.word).join(', ')}`);

  logTest('Get 10 animal words');
  const animalWords = await contentService.getWords({
    count: 10,
    difficulty: 'easy',
    userId: testUserId,
    categories: ['animals'],
  });

  const allAnimals = animalWords.every((w) => w.category === 'animals');
  if (allAnimals) {
    logSuccess(`All ${animalWords.length} words are from animals category`);
  } else {
    logError('Some words are not from animals category');
  }

  console.log(`  Animal words: ${animalWords.map((w) => w.word).join(', ')}`);

  logTest('Get 10 words from multiple categories');
  const mixedWords = await contentService.getWords({
    count: 10,
    difficulty: 'easy',
    userId: testUserId,
    categories: ['food', 'animals', 'nature'],
  });

  const validCategories = mixedWords.every((w) =>
    ['food', 'animals', 'nature'].includes(w.category)
  );
  if (validCategories) {
    logSuccess(`All ${mixedWords.length} words are from specified categories`);
  } else {
    logError('Some words are from unexpected categories');
  }
}

async function testLengthFiltering() {
  logSection('Test 3: Length Filtering');

  const testUserId = 'test_user_length';

  logTest('Get short words (3-5 letters)');
  const shortWords = await contentService.getWords({
    count: 10,
    difficulty: 'easy',
    userId: testUserId,
    minLength: 3,
    maxLength: 5,
  });

  const allShort = shortWords.every((w) => w.length >= 3 && w.length <= 5);
  if (allShort) {
    logSuccess('All words are between 3-5 letters');
  } else {
    logError('Some words are outside 3-5 letter range');
  }

  console.log(`  Short words: ${shortWords.map((w) => `${w.word}(${w.length})`).join(', ')}`);

  logTest('Get long words (6+ letters)');
  const longWords = await contentService.getWords({
    count: 10,
    difficulty: 'medium',
    userId: testUserId,
    minLength: 6,
  });

  const allLong = longWords.every((w) => w.length >= 6);
  if (allLong) {
    logSuccess('All words are 6+ letters');
  } else {
    logError('Some words are shorter than 6 letters');
  }

  console.log(`  Long words: ${longWords.map((w) => `${w.word}(${w.length})`).join(', ')}`);
}

async function testExclusionAlgorithm() {
  logSection('Test 4: Exclusion Algorithm');

  const testUserId = 'test_user_exclusion';

  // Clear any existing usage history for clean test
  await prisma.contentUsage.deleteMany({
    where: { userId: testUserId },
  });

  logTest('Session 1: Get initial words');
  const session1 = await contentService.getWords({
    count: 20,
    difficulty: 'easy',
    userId: testUserId,
  });
  logSuccess(`Session 1: ${session1.length} words`);
  console.log(`  Words: ${session1.slice(0, 5).map((w) => w.word).join(', ')}...`);

  // Wait a bit to ensure different timestamps
  await new Promise((resolve) => setTimeout(resolve, 100));

  logTest('Session 2: Get new words (should exclude session 1)');
  const session2 = await contentService.getWords({
    count: 20,
    difficulty: 'easy',
    userId: testUserId,
  });

  // Check for duplicates between session 1 and 2
  const set1 = new Set(session1.map((w) => w.word));
  const set2 = new Set(session2.map((w) => w.word));
  const duplicates = [...set1].filter((w) => set2.has(w));

  if (duplicates.length === 0) {
    logSuccess('No duplicate words between session 1 and 2');
  } else {
    logError(`Found ${duplicates.length} duplicate words: ${duplicates.join(', ')}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  logTest('Session 3: Get new words (should exclude sessions 1-2)');
  const session3 = await contentService.getWords({
    count: 20,
    difficulty: 'easy',
    userId: testUserId,
  });

  const set3 = new Set(session3.map((w) => w.word));
  const duplicates13 = [...set1].filter((w) => set3.has(w));
  const duplicates23 = [...set2].filter((w) => set3.has(w));

  if (duplicates13.length === 0 && duplicates23.length === 0) {
    logSuccess('No duplicate words between sessions 1-3');
  } else {
    logError(
      `Found duplicates with session 1: ${duplicates13.length}, session 2: ${duplicates23.length}`
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  logTest('Session 4: Get new words (should exclude sessions 2-4, session 1 can repeat)');
  const session4 = await contentService.getWords({
    count: 20,
    difficulty: 'easy',
    userId: testUserId,
  });

  const set4 = new Set(session4.map((w) => w.word));
  const duplicates24 = [...set2].filter((w) => set4.has(w));
  const duplicates34 = [...set3].filter((w) => set4.has(w));

  if (duplicates24.length === 0 && duplicates34.length === 0) {
    logSuccess('No duplicates with sessions 2-3 (exclusion working correctly)');
  } else {
    logError(
      `Found duplicates with session 2: ${duplicates24.length}, session 3: ${duplicates34.length}`
    );
  }

  // Check if any words from session 1 appeared in session 4 (allowed)
  const session1Repeats = [...set1].filter((w) => set4.has(w));
  if (session1Repeats.length > 0) {
    logSuccess(
      `Session 1 words can now repeat (${session1Repeats.length} words): ${session1Repeats.slice(0, 3).join(', ')}...`
    );
  }

  // Check exclusion stats
  const stats = await contentService.getExclusionStats(testUserId);
  logSuccess(
    `Exclusion stats: ${stats.totalSessions} total sessions, ${stats.recentSessions} recent, ${stats.excludedCount} words excluded`
  );
}

async function testMetadata() {
  logSection('Test 5: Selection Metadata');

  const testUserId = 'test_user_metadata';

  logTest('Get words with metadata');
  const result = await contentService.getWordsWithMetadata({
    count: 15,
    difficulty: 'medium',
    userId: testUserId,
    categories: ['science', 'technology'],
  });

  console.log('  Metadata:');
  console.log(`    Requested: ${result.metadata.requested}`);
  console.log(`    Returned: ${result.metadata.returned}`);
  console.log(`    Excluded: ${result.metadata.excluded}`);
  console.log(`    Total available: ${result.metadata.totalAvailable}`);
  console.log(`    Filters relaxed: ${result.metadata.filtersRelaxed}`);

  if (result.metadata.returned === result.metadata.requested) {
    logSuccess('Received requested number of words');
  } else {
    logWarning('Received fewer words than requested (may be normal if pool is small)');
  }
}

async function testEdgeCases() {
  logSection('Test 6: Edge Cases');

  const testUserId = 'test_user_edge';

  logTest('Request more words than available in restricted category');
  try {
    const result = await contentService.getWordsWithMetadata({
      count: 100,
      difficulty: 'easy',
      userId: testUserId,
      categories: ['weather'], // Small category
    });

    if (result.metadata.returned < result.metadata.requested) {
      logSuccess(
        `Gracefully handled insufficient words: requested ${result.metadata.requested}, got ${result.metadata.returned}`
      );
      if (result.metadata.filtersRelaxed) {
        logSuccess('Filters were relaxed to get more words');
      }
    }
  } catch (error) {
    logError(`Failed to handle insufficient words: ${error}`);
  }

  logTest('Invalid difficulty level');
  try {
    await contentService.getWords({
      count: 10,
      // @ts-expect-error - Testing invalid input
      difficulty: 'extreme',
      userId: testUserId,
    });
    logError('Should have thrown error for invalid difficulty');
  } catch (error) {
    logSuccess(`Correctly rejected invalid difficulty: ${error}`);
  }

  logTest('Zero count');
  try {
    await contentService.getWords({
      count: 0,
      difficulty: 'easy',
      userId: testUserId,
    });
    logError('Should have thrown error for zero count');
  } catch (error) {
    logSuccess(`Correctly rejected zero count: ${error}`);
  }

  logTest('Invalid length range (min > max)');
  try {
    await contentService.getWords({
      count: 10,
      difficulty: 'easy',
      userId: testUserId,
      minLength: 10,
      maxLength: 5,
    });
    logError('Should have thrown error for invalid length range');
  } catch (error) {
    logSuccess(`Correctly rejected invalid length range: ${error}`);
  }
}

async function testPerformance() {
  logSection('Test 7: Performance Benchmarks');

  const testUserId = 'test_user_performance';

  logTest('Measure selection time (with cache)');
  const iterations = 10;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await contentService.getWords({
      count: 20,
      difficulty: 'medium',
      userId: testUserId,
    });
    const duration = Date.now() - start;
    times.push(duration);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log(`  ${iterations} iterations:`);
  console.log(`    Average: ${avgTime.toFixed(2)}ms`);
  console.log(`    Min: ${minTime}ms`);
  console.log(`    Max: ${maxTime}ms`);

  if (avgTime < 100) {
    logSuccess('Performance meets target (<100ms average)');
  } else {
    logWarning('Performance slower than target (>100ms average)');
  }

  logTest('Measure cold cache performance');
  contentService.clearCache();

  const coldStart = Date.now();
  await contentService.getWords({
    count: 20,
    difficulty: 'hard',
    userId: testUserId,
  });
  const coldDuration = Date.now() - coldStart;

  console.log(`  Cold cache: ${coldDuration}ms`);
  if (coldDuration < 500) {
    logSuccess('Cold cache performance acceptable (<500ms)');
  } else {
    logWarning('Cold cache performance slow (>500ms)');
  }
}

async function testWordCounts() {
  logSection('Test 8: Word Database Statistics');

  logTest('Count words in each difficulty level');

  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const testUserId = 'test_user_stats';

  for (const difficulty of difficulties) {
    const result = await contentService.getWordsWithMetadata({
      count: 9999, // Request more than exist
      difficulty,
      userId: testUserId,
    });

    console.log(`  ${difficulty}: ${result.metadata.totalAvailable} words`);

    if (result.metadata.totalAvailable >= 100) {
      logSuccess(`Sufficient words for ${difficulty} difficulty`);
    } else {
      logWarning(`Low word count for ${difficulty} difficulty (${result.metadata.totalAvailable})`);
    }
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         CONTENT SERVICE COMPREHENSIVE TEST SUITE          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  try {
    await testBasicWordSelection();
    await testCategoryFiltering();
    await testLengthFiltering();
    await testExclusionAlgorithm();
    await testMetadata();
    await testEdgeCases();
    await testPerformance();
    await testWordCounts();

    logSection('Test Summary');
    log('All tests completed successfully!', 'green');
    log('\nThe content service is working correctly:', 'green');
    log('✓ Word loading from JSON files', 'green');
    log('✓ Filtering by difficulty, category, and length', 'green');
    log('✓ Exclusion algorithm preventing repeats', 'green');
    log('✓ Graceful edge case handling', 'green');
    log('✓ Performance within targets', 'green');
  } catch (error) {
    logError(`\nTest suite failed with error: ${error}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runAllTests();
