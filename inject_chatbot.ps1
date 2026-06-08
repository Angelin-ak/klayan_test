$files = Get-ChildItem -Path 'c:\kalyan_engineering_website' -Filter '*.html' | Where-Object { $_.Name -ne 'temp_index.html' }

$chatbotScript = '<script src="assets/js/kalyan-chatbot.js" defer></script>'

$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -notmatch 'kalyan-chatbot\.js') {
        $content = $content -replace '</body>', "$chatbotScript`n</body>"
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $count++
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "`nTotal updated: $count files"
