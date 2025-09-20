# PowerShell script to fix Prisma imports and add serverless-safe data fetching
Write-Host "Starting to fix Prisma imports..." -ForegroundColor Green

# Get all files with prisma imports
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | 
    Where-Object { (Get-Content $_.FullName -Raw) -match 'import.*prisma.*from.*@/lib/prisma' }

Write-Host "Found $($files.Count) files with direct Prisma imports" -ForegroundColor Yellow

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "Processing: $relativePath" -ForegroundColor Cyan
    
    # Read file content
    $content = Get-Content $file.FullName -Raw
    
    # Check if it's already using withDatabaseRetry
    if ($content -match 'withDatabaseRetry') {
        Write-Host "  Already using withDatabaseRetry, skipping..." -ForegroundColor Gray
        continue
    }
    
    # Replace the import
    $newContent = $content -replace 'import\s+prisma\s+from\s+"@/lib/prisma";?', 'import { withDatabaseRetry } from "@/lib/db-serverless";'
    
    # Add revalidate export if not present and has dynamic export
    if ($newContent -match 'export\s+const\s+dynamic\s*=\s*"force-dynamic"' -and $newContent -notmatch 'export\s+const\s+revalidate') {
        $newContent = $newContent -replace '(export\s+const\s+dynamic\s*=\s*"force-dynamic";?)', '$1`nexport const revalidate = 0;'
    }
    
    # Save if changed
    if ($content -ne $newContent) {
        $newContent | Set-Content $file.FullName -NoNewline
        Write-Host "  Updated!" -ForegroundColor Green
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nPrisma import fixes completed!" -ForegroundColor Green
Write-Host "`nIMPORTANT: You still need to manually update the actual database queries" -ForegroundColor Yellow
Write-Host "to use withDatabaseRetry() wrapper for serverless compatibility." -ForegroundColor Yellow
Write-Host "`nExample transformation:" -ForegroundColor Cyan
Write-Host "FROM:  const data = await prisma.product.findMany();" -ForegroundColor Red
Write-Host "TO:    const data = await withDatabaseRetry(async (prisma) => {" -ForegroundColor Green
Write-Host "         return await prisma.product.findMany();" -ForegroundColor Green
Write-Host "       });" -ForegroundColor Green