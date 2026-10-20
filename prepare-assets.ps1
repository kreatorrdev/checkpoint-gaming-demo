$ErrorActionPreference = 'Stop'
$assetRoot = Join-Path $PSScriptRoot 'dist\assets'
$entries = @(
    @{ id = 1245620; slug = 'elden-ring' },
    @{ id = 1091500; slug = 'cyberpunk-2077' },
    @{ id = 1145360; slug = 'hades' },
    @{ id = 367520; slug = 'hollow-knight' },
    @{ id = 1086940; slug = 'baldurs-gate-3' },
    @{ id = 1551360; slug = 'forza-horizon-5' },
    @{ id = 413150; slug = 'stardew-valley' },
    @{ id = 504230; slug = 'celeste' }
)
$records = @()
foreach ($entry in $entries) {
    $response = Invoke-RestMethod -Uri "https://store.steampowered.com/api/appdetails?appids=$($entry.id)&l=english"
    $game = $response."$($entry.id)".data
    if (!$game) { throw "Missing metadata for $($entry.slug)" }
    $header = $game.header_image
    $cover = $header -replace 'header\.jpg.*$', 'library_600x900.jpg'
    try { Invoke-WebRequest -Uri $cover -OutFile (Join-Path $assetRoot "$($entry.slug)-cover.jpg") }
    catch {
        $cover = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/$($entry.id)/library_600x900.jpg"
        try { Invoke-WebRequest -Uri $cover -OutFile (Join-Path $assetRoot "$($entry.slug)-cover.jpg") }
        catch { $cover = $header; Invoke-WebRequest -Uri $header -OutFile (Join-Path $assetRoot "$($entry.slug)-cover.jpg") }
    }
    Invoke-WebRequest -Uri $header -OutFile (Join-Path $assetRoot "$($entry.slug)-wide.jpg")
    $shots = @()
    if ($entry.slug -eq 'elden-ring') {
        $index = 0
        foreach ($shot in ($game.screenshots | Select-Object -First 3)) {
            $index++
            Invoke-WebRequest -Uri $shot.path_full -OutFile (Join-Path $assetRoot "elden-ring-scene-$index.jpg")
            $shots += $shot.path_full
        }
    }
    $records += @{ slug = $entry.slug; title = $game.name; store_url = "https://store.steampowered.com/app/$($entry.id)/"; cover_source = $cover; wide_source = $header; screenshot_sources = $shots; developer = $game.developers; publisher = $game.publishers; fetched = '2026-10-19'; usage = 'Private design preview. Copyright remains with the respective owners. Redistribution/public-launch rights have not been established.' }
    Write-Output "Prepared $($entry.slug)"
}
$records | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'asset-sources.json') -Encoding utf8
