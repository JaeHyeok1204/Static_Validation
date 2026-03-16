# upload.ps1
# Git Auto Upload Script

Write-Host ">>> Starting Git Sync Process..." -ForegroundColor Cyan

# 1. Remote Check
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "No remote 'origin' found." -ForegroundColor Yellow
    $url = Read-Host "Please enter your GitHub repository URL"
    if (![string]::IsNullOrWhiteSpace($url)) {
        git remote add origin $url
        Write-Host "Remote origin set to $url" -ForegroundColor Green
    } else {
        Write-Host "Error: No URL provided. Aborting." -ForegroundColor Red
        exit
    }
}

# 2. Add files
Write-Host "Adding all changes..."
git add .

# 3. Commit
$msg = Read-Host "Enter commit message (Leave empty for default timestamp)"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "Update: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
}

git commit -m "$msg"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
}

# 4. Push
Write-Host "`nPushing to GitHub (main)..." -ForegroundColor White
$pushOutput = git push origin main 2>&1
$pushStatus = $LASTEXITCODE

if ($pushStatus -ne 0) {
    Write-Host "`n[! ] Push failed or rejected." -ForegroundColor Yellow
    Write-Host "1) Force Push (Overwrite remote)" -ForegroundColor Red
    Write-Host "2) Sync first (Pull/Rebase)" -ForegroundColor Green
    Write-Host "3) Cancel"
    
    $choice = Read-Host "Choice (1/2/3)"
    
    if ($choice -eq "1") {
        Write-Host "Force pushing..." -ForegroundColor Red
        git push -f origin main
    } elseif ($choice -eq "2") {
        Write-Host "Syncing (Rebase)..." -ForegroundColor Green
        git pull origin main --rebase
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Sync complete. Pushing again..."
            git push origin main
        } else {
            Write-Host "Conflicts detected. Please resolve manually." -ForegroundColor Red
        }
    } else {
        Write-Host "Cancelled."
    }
} else {
    Write-Host "`n>>> Successfully uploaded!" -ForegroundColor Green
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
