# scan-code.ps1
param(
    [string]$RootPath = "C:\Users\Lenovo\Desktop\Project\warehouse-app"
)

# Define which subfolders to scan
$folders = @("server","client")

foreach ($folder in $folders) {
    $folderPath = Join-Path $RootPath $folder
    if (-not (Test-Path $folderPath)) {
        Write-Warning "Folder '$folderPath' not found—skipping."
        continue
    }

    # Output file in root, e.g. server.txt or client.txt
    $outputFile = Join-Path $RootPath "$folder.txt"

    # Remove existing output file if present
    if (Test-Path $outputFile) {
        Remove-Item $outputFile -Force
    }

    # Recursively get all files, ignore node_modules
    Get-ChildItem -Path $folderPath -Recurse -File |
      Where-Object { $_.FullName -notmatch "\\node_modules\\" } |
      ForEach-Object {
        $filePath    = $_.FullName
        $fileContent = Get-Content -Raw -LiteralPath $filePath

        # Build the entry: PATH, newline, CODE, two newlines
        $entry = "$filePath`r`n$fileContent`r`n"

        # Append to the output file (UTF8)
        $entry | Out-File -FilePath $outputFile -Encoding utf8 -Append
      }

    Write-Output "=> Created $outputFile"
}
