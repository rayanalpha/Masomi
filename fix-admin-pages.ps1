# PowerShell script to fix all admin pages with direct Prisma usage
Write-Host "Fixing remaining admin pages..." -ForegroundColor Green

# List of files that need to be fixed
$filesToFix = @(
    "src/app/admin/categories/page.tsx",
    "src/app/admin/categories/[id]/page.tsx",
    "src/app/admin/coupons/page.tsx",
    "src/app/admin/coupons/[id]/page.tsx",
    "src/app/admin/orders/page.tsx",
    "src/app/admin/orders/[id]/page.tsx",
    "src/app/admin/products/[id]/page.tsx",
    "src/app/admin/products/[id]/ProductImagesPanel.tsx",
    "src/app/admin/products/[id]/variations/page.tsx"
)

foreach ($filePath in $filesToFix) {
    if (-not (Test-Path $filePath)) {
        Write-Host "  File not found: $filePath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing: $filePath" -ForegroundColor Cyan
    
    # Read the file
    $content = Get-Content $filePath -Encoding UTF8 | Out-String
    
    # Check if it's already using withDatabaseRetry correctly
    if ($content -match 'withDatabaseRetry\(async \(prisma\)') {
        Write-Host "  Already using withDatabaseRetry correctly" -ForegroundColor Gray
        continue
    }
    
    # Check if it has import
    if ($content -notmatch 'import.*withDatabaseRetry.*from') {
        # Add the import if missing
        if ($content -match 'import prisma from') {
            $content = $content -replace 'import prisma from "@/lib/prisma";?', 'import { withDatabaseRetry } from "@/lib/db-serverless";'
        } else {
            # Add import at top after first import
            $content = $content -replace '(import[^;]+;\r?\n)', '$1import { withDatabaseRetry } from "@/lib/db-serverless";`n'
        }
    }
    
    # Add exports if missing
    if ($content -notmatch 'export const dynamic') {
        $content = $content -replace '(import[^;]+;\r?\n+)', '$1`nexport const dynamic = "force-dynamic";`nexport const revalidate = 0;`n'
    }
    
    # Fix Prisma usage patterns
    # Pattern 1: Simple findMany/findUnique
    $content = $content -replace '(\s+const\s+\w+\s+=\s+await\s+)prisma\.([\w]+)\.(find\w+)\(([^;]+)\);', '$1withDatabaseRetry(async (prisma) => await prisma.$2.$3($4));'
    
    # Pattern 2: Multiple database calls with Promise.all
    if ($content -match 'Promise\.all\s*\(\s*\[') {
        Write-Host "  Has Promise.all - manual fix needed" -ForegroundColor Yellow
    }
    
    # Save the modified content
    $content | Set-Content $filePath -Encoding UTF8 -NoNewline
    Write-Host "  Updated!" -ForegroundColor Green
}

Write-Host "`nAdmin pages fix completed!" -ForegroundColor Green
Write-Host "`nNote: Some files may need manual review if they have complex database operations." -ForegroundColor Yellow