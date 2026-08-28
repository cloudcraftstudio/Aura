/**
 * Bible Study API Tests
 */

const BASE_URL = 'http://localhost:3000/api/bible';

async function testGetCourses() {
  console.log('\n=== Testing GET /api/bible/courses ===');
  try {
    const response = await fetch(`${BASE_URL}/courses`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Courses:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data) && data.length === 3) {
      console.log('✓ PASS: 3 seeded courses found');
      return true;
    } else {
      console.log('✗ FAIL: Expected 3 courses, got', data.length);
      return false;
    }
  } catch (error) {
    console.error('✗ FAIL:', error.message);
    return false;
  }
}

async function testStudyBreakdown() {
  console.log('\n=== Testing GET /api/bible/study?book=James&chapter=2&verse=3 ===');
  try {
    const response = await fetch(`${BASE_URL}/study?book=James&chapter=2&verse=3`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Study Breakdown:', JSON.stringify(data, null, 2));
    
    if (data.passageText && data.bookSummary && data.historicalContext && data.dailyApplication) {
      console.log('✓ PASS: Full study breakdown structure returned');
      return true;
    } else {
      console.log('✗ FAIL: Missing expected fields in breakdown');
      return false;
    }
  } catch (error) {
    console.error('✗ FAIL:', error.message);
    return false;
  }
}

async function testOnboard() {
  console.log('\n=== Testing POST /api/bible/onboard ===');
  try {
    const response = await fetch(`${BASE_URL}/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userGoals: 'spiritual growth', userInterests: 'faith' })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Onboarding Response:', JSON.stringify(data, null, 2));
    
    if (data.welcome && Array.isArray(data.recommendedCourses) && data.recommendedCourses.length > 0) {
      console.log('✓ PASS: Onboarding response with course recommendations');
      return true;
    } else {
      console.log('✗ FAIL: Missing welcome or course recommendations');
      return false;
    }
  } catch (error) {
    console.error('✗ FAIL:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting Bible Study API Tests...');
  
  const results = [];
  results.push(await testGetCourses());
  results.push(await testStudyBreakdown());
  results.push(await testOnboard());
  
  console.log('\n=== Test Summary ===');
  const passed = results.filter(r => r).length;
  console.log(`Passed: ${passed}/${results.length}`);
  
  if (passed === results.length) {
    console.log('✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed');
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(runTests, 2000);
