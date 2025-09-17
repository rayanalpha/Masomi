Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Wait for server to start (Usually shows 'Ready on http://localhost:3000')"
Write-Host "2. Open your browser to: http://localhost:3000/login"  
Write-Host "3. Login with your admin credentials"
Write-Host "4. Navigate to: http://localhost:3000/admin/products/new"
Write-Host "5. Use the debug buttons at the bottom of the form to test:"
Write-Host "   - تست شبکه: Tests API connectivity"
Write-Host "   - بررسی Session: Tests authentication"
Write-Host "6. Try adding a product with and without image upload"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done"
Write-Host ""

npm run dev