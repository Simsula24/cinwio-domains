if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed or not running. Please install Docker Desktop (https://www.docker.com/products/docker-desktop) and ensure it is running before executing this script." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Building Docker image for Synology NAS..."
docker build -t cinwio-domains:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed." -ForegroundColor Red
    pause
    exit $LASTEXITCODE
}

Write-Host "Exporting image to cinwio-domains.tar..."
docker save -o cinwio-domains.tar cinwio-domains:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to export the image." -ForegroundColor Red
    pause
    exit $LASTEXITCODE
}

Write-Host "Success! The file 'cinwio-domains.tar' is ready." -ForegroundColor Green
Write-Host "You can now upload this file to your Synology NAS using Container Manager -> Image -> Action -> Import."
pause
