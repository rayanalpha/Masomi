# Fix ALL remaining files with direct Prisma usage
Write-Host "Fixing ALL remaining files with Prisma usage..." -ForegroundColor Green

# Define all files that need to be fixed
$filesToFix = @{
    "src/app/admin/attributes/[id]/page.tsx" = @{
        oldImport = 'import prisma from "@/lib/prisma";'
        newImport = 'import { withDatabaseRetry } from "@/lib/db-serverless";'
        oldQuery = 'const attribute = await prisma.attribute.findUnique({ where: { id }, include: { values: true } });'
        newQuery = 'const attribute = await withDatabaseRetry(async (prisma) => {
    return await prisma.attribute.findUnique({ where: { id }, include: { values: true } });
  });'
    }
    "src/app/admin/coupons/[id]/page.tsx" = @{
        oldImport = 'import prisma from "@/lib/prisma";'
        newImport = 'import { withDatabaseRetry } from "@/lib/db-serverless";'
        oldQuery = 'const coupon = await prisma.coupon.findUnique({ where: { id } });'
        newQuery = 'const coupon = await withDatabaseRetry(async (prisma) => {
    return await prisma.coupon.findUnique({ where: { id } });
  });'
    }
    "src/app/admin/orders/[id]/page.tsx" = @{
        oldImport = 'import prisma from "@/lib/prisma";'
        newImport = 'import { withDatabaseRetry } from "@/lib/db-serverless";'
        oldQuery = 'const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });'
        newQuery = 'const order = await withDatabaseRetry(async (prisma) => {
    return await prisma.order.findUnique({ 
      where: { id }, 
      include: { items: { include: { product: true } } } 
    });
  });'
    }
    "src/app/admin/products/[id]/page.tsx" = @{
        oldImport = 'import prisma from "@/lib/prisma";'
        newImport = 'import { withDatabaseRetry } from "@/lib/db-serverless";'
        oldQuery = 'const product = await prisma.product.findUnique({ where: { id } });'
        newQuery = 'const product = await withDatabaseRetry(async (prisma) => {
    return await prisma.product.findUnique({ where: { id } });
  });'
    }
    "src/app/admin/products/[id]/ProductImagesPanel.tsx" = @{
        oldImport = 'import prisma from "@/lib/prisma";'
        newImport = 'import { withDatabaseRetry } from "@/lib/db-serverless";'
        oldQuery = 'const images = await prisma.productImage.findMany({ where: { productId }, orderBy: [{ sort: "asc" }, { id: "asc" }] });'
        newQuery = 'const images = await withDatabaseRetry(async (prisma) => {
    return await prisma.productImage.findMany({ 
      where: { productId }, 
      orderBy: [{ sort: "asc" }, { id: "asc" }] 
    });
  });'
    }
    "src/app/admin/products/[id]/variations/page.tsx" = @{
        oldImport = 'import prisma from "@/lib/prisma";'
        newImport = 'import { withDatabaseRetry } from "@/lib/db-serverless";'
    }
}

foreach ($file in $filesToFix.Keys) {
    $fullPath = Join-Path (Get-Location) $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing: $file" -ForegroundColor Cyan
    
    # Read file content
    $content = Get-Content $fullPath -Encoding UTF8 | Out-String
    $fileInfo = $filesToFix[$file]
    
    # Replace import
    if ($fileInfo.oldImport -and $fileInfo.newImport) {
        $content = $content -replace [regex]::Escape($fileInfo.oldImport), $fileInfo.newImport
    }
    
    # Add exports if not present
    if ($content -notmatch 'export const dynamic') {
        # Find position after imports
        $pattern = '(import[^;]+;\r?\n)+(\r?\n)?'
        $content = $content -replace $pattern, '$0' + "`nexport const dynamic = `"force-dynamic`";`nexport const revalidate = 0;`n`n"
    }
    
    # Replace specific query patterns if provided
    if ($fileInfo.oldQuery -and $fileInfo.newQuery) {
        $content = $content -replace [regex]::Escape($fileInfo.oldQuery), $fileInfo.newQuery
    }
    
    # Save the file
    $content | Set-Content $fullPath -Encoding UTF8 -NoNewline
    Write-Host "  Fixed!" -ForegroundColor Green
}

Write-Host "`nAll files have been processed!" -ForegroundColor Green
Write-Host "Please manually check complex queries in these files." -ForegroundColor Yellow