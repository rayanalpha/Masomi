param(
  [string]$Output = $(Join-Path ([Environment]::GetFolderPath('Desktop')) 'lux-gold-catalog-src.zip')
)

# Determine project root = parent of this script's directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "Project root:" $ProjectRoot
Write-Host "Output zip:" $Output

if (Test-Path $Output) {
  Remove-Item -Force $Output
}

$excludeNames = @('node_modules', '.next', 'out', '.git')

$items = Get-ChildItem -LiteralPath $ProjectRoot -Force
$paths = @()
foreach ($item in $items) {
  if ($excludeNames -contains $item.Name) { continue }
  if ($item.Extension -eq '.zip') { continue }
  $paths += $item.FullName
}

Compress-Archive -Path $paths -DestinationPath $Output -Force
Write-Host "Created archive at" $Output
