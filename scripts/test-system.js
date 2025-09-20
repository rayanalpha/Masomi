#!/usr/bin/env node

/**
 * Complete System Test Script
 * Tests all major functionality including database, auth, and uploads
 */

const fs = require('fs');
const path = require('path');

async function testSystemHealth() {
  console.log('🏥 Testing system health...');
  
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    
    console.log('Health Status:', data.status);
    console.log('Database Health:', data.database.healthy);
    console.log('Environment Check:', Object.entries(data.environment_variables)
      .map(([key, value]) => `${key}: ${value ? '✓' : '✗'}`).join(', '));
    
    if (!data.database.healthy) {
      console.error('❌ Database is not healthy:', data.database.error);
      return false;
    }
    
    console.log('✅ System health check passed');
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAdminCreation() {
  console.log('👤 Testing admin user creation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Test Admin'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin user created/updated successfully');
      return true;
    } else {
      console.error('❌ Admin creation failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Admin creation test failed:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Authentication test passed');
      return true;
    } else {
      console.error('❌ Authentication failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function testCategoryCreation() {
  console.log('📂 Testing category creation...');
  
  try {
    // First login to get session cookies
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123',
        redirect: false
      })
    });
    
    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    const categoryResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        name: 'Test Category',
        slug: 'test-category-' + Date.now(),
        description: 'A test category'
      })
    });
    
    const data = await categoryResponse.json();
    
    if (categoryResponse.ok) {
      console.log('✅ Category creation test passed');
      return true;
    } else {
      console.error('❌ Category creation failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Category creation test failed:', error.message);
    return false;
  }
}

async function testImageUpload() {
  console.log('📸 Testing image upload...');
  
  try {
    // Create a small test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // Width: 1
      0x00, 0x00, 0x00, 0x01, // Height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB)
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, // IEND
      0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/png' }), 'test.png');
    formData.append('name', 'test-image');
    
    // First login to get session cookies
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123',
        redirect: false
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Cookie': cookies || '' },
      body: formData
    });
    
    const data = await uploadResponse.json();
    
    if (uploadResponse.ok && data.success) {
      console.log('✅ Image upload test passed');
      console.log('Upload details:', {
        url: data.url,
        thumbUrl: data.thumbUrl,
        duration: data.uploadInfo?.duration,
        size: data.uploadInfo?.size,
        requestId: data.requestId
      });
      return true;
    } else {
      console.error('❌ Image upload failed:', {
        status: uploadResponse.status,
        error: data.error,
        code: data.code,
        details: data.details,
        requestId: data.requestId
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Image upload test failed:', error.message);
    return false;
  }
}

async function testEnhancedMiddleware() {
  console.log('🔧 Testing enhanced API middleware...');
  
  try {
    // Test basic middleware functionality
    const testResponse = await fetch('http://localhost:3000/api/test-enhanced');
    const testData = await testResponse.json();
    
    if (!testResponse.ok || !testData.status) {
      console.error('❌ Basic middleware test failed');
      return false;
    }
    
    console.log('✅ Basic middleware test passed');
    
    // Check for middleware headers
    const requestId = testResponse.headers.get('X-Request-ID');
    const responseTime = testResponse.headers.get('X-Response-Time');
    
    if (!requestId || !responseTime) {
      console.warn('⚠️ Middleware headers missing');
      return false;
    }
    
    console.log('✅ Middleware headers present:', { requestId, responseTime });
    
    // Test error handling
    const errorResponse = await fetch('http://localhost:3000/api/test-enhanced?error=custom', {
      method: 'PUT',
      headers: { 'Cookie': 'invalid-cookie' }
    });
    
    if (errorResponse.status !== 401) {
      console.error('❌ Error handling test failed - expected 401 for unauthorized');
      return false;
    }
    
    console.log('✅ Error handling test passed');
    return true;
    
  } catch (error) {
    console.error('❌ Enhanced middleware test failed:', error.message);
    return false;
  }
}

async function testUploadValidation() {
  console.log('🛡️ Testing upload validation...');
  
  try {
    // First login to get session cookies
    const loginResponse = await fetch('http://localhost:3000/api/debug/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed for upload validation test');
      return false;
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test 1: Invalid file type
    const invalidFormData = new FormData();
    invalidFormData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
    
    const invalidResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Cookie': cookies || '' },
      body: invalidFormData
    });
    
    const invalidData = await invalidResponse.json();
    
    if (invalidResponse.status !== 400 || invalidData.code !== 'INVALID_FILE_TYPE') {
      console.error('❌ Invalid file type validation failed');
      return false;
    }
    
    console.log('✅ Invalid file type validation passed');
    
    // Test 2: No file provided
    const noFileFormData = new FormData();
    noFileFormData.append('name', 'test');
    
    const noFileResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Cookie': cookies || '' },
      body: noFileFormData
    });
    
    const noFileData = await noFileResponse.json();
    
    if (noFileResponse.status !== 400 || noFileData.code !== 'NO_FILE_PROVIDED') {
      console.error('❌ No file validation failed');
      return false;
    }
    
    console.log('✅ No file validation passed');
    
    // Test 3: Unauthorized upload
    const testImageBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // Minimal PNG
    const unauthorizedFormData = new FormData();
    unauthorizedFormData.append('file', new Blob([testImageBuffer], { type: 'image/png' }), 'test.png');
    
    const unauthorizedResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      // No cookies = unauthorized
      body: unauthorizedFormData
    });
    
    if (unauthorizedResponse.status !== 401) {
      console.error('❌ Unauthorized upload validation failed');
      return false;
    }
    
    console.log('✅ Unauthorized upload validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Upload validation test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive system tests...\n');
  
  const tests = [
    { name: 'System Health', fn: testSystemHealth },
    { name: 'Admin Creation', fn: testAdminCreation },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Category Creation', fn: testCategoryCreation },
    { name: 'Image Upload', fn: testImageUpload }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- Running ${test.name} Test ---`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! System is ready.');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };