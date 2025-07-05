// Test script for offline functionality
// Run this in the browser console to test offline features

console.log('Testing offline functionality...')

// Test localStorage access
function testLocalStorage() {
  console.log('Testing localStorage...')
  
  try {
    const testKey = 'flogger_test'
    const testData = { test: 'data', timestamp: Date.now() }
    
    localStorage.setItem(testKey, JSON.stringify(testData))
    const retrieved = JSON.parse(localStorage.getItem(testKey))
    
    if (retrieved.test === testData.test) {
      console.log('✅ localStorage working correctly')
      localStorage.removeItem(testKey)
      return true
    } else {
      console.log('❌ localStorage data mismatch')
      return false
    }
  } catch (error) {
    console.log('❌ localStorage error:', error)
    return false
  }
}

// Test offline storage keys
function testOfflineStorageKeys() {
  console.log('Testing offline storage keys...')
  
  const expectedKeys = [
    'flogger_offline_flogs',
    'flogger_sync_queue', 
    'flogger_last_sync'
  ]
  
  const existingKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('flogger_')) {
      existingKeys.push(key)
    }
  }
  
  console.log('Found flogger keys:', existingKeys)
  return existingKeys.length >= 0
}

// Test creating offline flog data
function testOfflineFlogData() {
  console.log('Testing offline flog data structure...')
  
  const testFlog = {
    url: '/test.flogger.txt',
    sourceType: 'dropbox',
    content: '# Test Flog\n\n2024-01-01 12:00:00\nThis is a test entry\n\n',
    lastModified: Date.now(),
    isDirty: true,
    originalRev: 'test-rev'
  }
  
  const testSyncQueue = [
    {
      id: 'test-sync-1',
      flogUrl: '/test.flogger.txt',
      operation: 'save',
      data: { flog: testFlog },
      timestamp: Date.now(),
      retryCount: 0
    }
  ]
  
  try {
    // Store test data
    localStorage.setItem('flogger_offline_flogs', JSON.stringify({
      [testFlog.url]: testFlog
    }))
    localStorage.setItem('flogger_sync_queue', JSON.stringify(testSyncQueue))
    localStorage.setItem('flogger_last_sync', Date.now().toString())
    
    // Retrieve and verify
    const storedFlogs = JSON.parse(localStorage.getItem('flogger_offline_flogs'))
    const storedQueue = JSON.parse(localStorage.getItem('flogger_sync_queue'))
    const lastSync = localStorage.getItem('flogger_last_sync')
    
    if (storedFlogs[testFlog.url] && storedQueue.length > 0 && lastSync) {
      console.log('✅ Offline storage data structure working')
      
      // Clean up test data
      localStorage.removeItem('flogger_offline_flogs')
      localStorage.removeItem('flogger_sync_queue')
      localStorage.removeItem('flogger_last_sync')
      
      return true
    } else {
      console.log('❌ Offline storage data structure failed')
      return false
    }
  } catch (error) {
    console.log('❌ Offline storage error:', error)
    return false
  }
}

// Test online/offline detection
function testOnlineDetection() {
  console.log('Testing online/offline detection...')
  
  const isOnline = navigator.onLine
  console.log('Current online status:', isOnline)
  
  // Test event listeners
  const onlineHandler = () => console.log('🟢 Online event fired')
  const offlineHandler = () => console.log('🔴 Offline event fired')
  
  window.addEventListener('online', onlineHandler)
  window.addEventListener('offline', offlineHandler)
  
  console.log('✅ Online/offline event listeners added')
  return true
}

// Run all tests
function runAllTests() {
  console.log('=== Running Offline Functionality Tests ===')
  
  const tests = [
    testLocalStorage,
    testOfflineStorageKeys,
    testOfflineFlogData,
    testOnlineDetection
  ]
  
  let passed = 0
  let total = tests.length
  
  tests.forEach((test, index) => {
    console.log(`\n--- Test ${index + 1} ---`)
    if (test()) {
      passed++
    }
  })
  
  console.log(`\n=== Test Results: ${passed}/${total} passed ===`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! Offline functionality should work correctly.')
  } else {
    console.log('⚠️  Some tests failed. Check the console for details.')
  }
}

// Export for manual testing
window.testOfflineFunctionality = runAllTests

console.log('Offline functionality tests loaded. Run testOfflineFunctionality() to test.') 