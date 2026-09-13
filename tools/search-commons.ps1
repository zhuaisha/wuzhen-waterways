param([string]$Search = "Wuzhen", [int]$Limit = 30)

$api = "https://commons.wikimedia.org/w/api.php"
$params = @{
    action       = "query"
    generator    = "search"
    gsrsearch    = $Search
    gsrnamespace = "6"
    gsrlimit     = $Limit
    prop         = "imageinfo"
    iiprop       = "url|extmetadata|size"
    iiurlwidth   = "1920"
    format       = "json"
}
$enc = [System.Web.HttpUtility]::QueryStringEncode($params)
$uri = "$api?$enc"

$raw = curl -s --connect-timeout 15 $uri
if (-not $raw) { Write-Host "EMPTY RESPONSE"; exit 1 }

$j = $raw | ConvertFrom-Json
if (-not $j.query.pages) { Write-Host "NO PAGES"; exit 1 }

$items = @($j.query.pages.PSObject.Properties | ForEach-Object { $_.Value })
foreach ($p in $items) {
    if (-not $p.imageinfo) { continue }
    $ii = $p.imageinfo[0]
    $lic = if ($ii.Metadata.LicenseShortName) { $ii.Metadata.LicenseShortName } else { "UNKNOWN" }
    $artist = if ($ii.Metadata.Artist) { ($ii.Metadata.Artist -replace '\[.*?\]','').Trim() } else { "?" }
    $ok = ($lic -match "PD|CC|Public|GFDL") -and ($ii.width -ge 1200)
    $tag = if ($ok) { "OK  " } else { "SKIP" }
    Write-Host ("{0} {1} | {2} | {3}x{4} | {5}" -f $tag, $p.title, $lic, $ii.width, $ii.height, $ii.thumburl)
}
