$c = [System.IO.File]::ReadAllText('c:\kalyan_engineering_website\assets\js\main.js')
$idx = $c.IndexOf('rs-theme-settings')
Write-Host $c.Substring([Math]::Max(0, $idx - 50), 500)
