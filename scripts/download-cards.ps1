# Download all 78 Rider-Waite-Smith tarot card images from Wikimedia Commons
# Run from the project root: powershell -ExecutionPolicy Bypass -File scripts/download-cards.ps1

$outDir = "public\cards"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Accept"     = "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
  "Referer"    = "https://commons.wikimedia.org/"
}

function Get-Card($filename, $hash, $localName, $width = 960) {
  $url  = "https://upload.wikimedia.org/wikipedia/commons/thumb/$hash/$filename/${width}px-$filename"
  $dest = "$outDir\$localName"
  if (Test-Path $dest) {
    $sz = (Get-Item $dest).Length
    if ($sz -gt 10000) { Write-Host "  SKIP $localName (exists, ${sz}b)"; return }
    Remove-Item $dest  # remove corrupt file
  }
  try {
    Invoke-WebRequest -Uri $url -Headers $headers -OutFile $dest -TimeoutSec 20 -UseBasicParsing
    $sz = (Get-Item $dest).Length
    if ($sz -lt 5000) { Remove-Item $dest; Write-Host "  FAIL $localName (too small: ${sz}b)" }
    else { Write-Host "  OK   $localName (${sz}b)" }
  } catch {
    Write-Host "  FAIL $localName : $($_.Exception.Message)"
  }
}

# ── Major Arcana ──────────────────────────────────────────────────────────────
$major = @(
  @("RWS_Tarot_00_Fool.jpg",            "9/90",  "m00.jpg"),
  @("RWS_Tarot_01_Magician.jpg",        "d/de",  "m01.jpg"),
  @("RWS_Tarot_02_High_Priestess.jpg",  "8/88",  "m02.jpg"),
  @("RWS_Tarot_03_Empress.jpg",         "d/d2",  "m03.jpg"),
  @("RWS_Tarot_04_Emperor.jpg",         "c/c3",  "m04.jpg"),
  @("RWS_Tarot_05_Hierophant.jpg",      "8/8d",  "m05.jpg"),
  @("RWS_Tarot_06_Lovers.jpg",          "d/db",  "m06.jpg"),
  @("RWS_Tarot_07_Chariot.jpg",         "9/9b",  "m07.jpg"),
  @("RWS_Tarot_08_Strength.jpg",        "f/f5",  "m08.jpg"),
  @("RWS_Tarot_09_Hermit.jpg",          "4/4d",  "m09.jpg"),
  @("RWS_Tarot_10_Wheel_of_Fortune.jpg","3/3c",  "m10.jpg"),
  @("RWS_Tarot_11_Justice.jpg",         "e/e0",  "m11.jpg"),
  @("RWS_Tarot_12_Hanged_Man.jpg",      "2/2b",  "m12.jpg"),
  @("RWS_Tarot_13_Death.jpg",           "d/d7",  "m13.jpg"),
  @("RWS_Tarot_14_Temperance.jpg",      "f/f8",  "m14.jpg"),
  @("RWS_Tarot_15_Devil.jpg",           "5/55",  "m15.jpg"),
  @("RWS_Tarot_16_Tower.jpg",           "5/53",  "m16.jpg"),
  @("RWS_Tarot_17_Star.jpg",            "d/db",  "m17.jpg"),
  @("RWS_Tarot_18_Moon.jpg",            "7/7f",  "m18.jpg"),
  @("RWS_Tarot_19_Sun.jpg",             "1/17",  "m19.jpg"),
  @("RWS_Tarot_20_Judgement.jpg",       "d/dd",  "m20.jpg"),
  @("RWS_Tarot_21_World.jpg",           "f/ff",  "m21.jpg")
)

Write-Host "=== Major Arcana ==="
foreach ($c in $major) { Get-Card $c[0] $c[1] $c[2] }

# ── Minor Arcana ──────────────────────────────────────────────────────────────
$minor = @(
  # Wands (w01-w14)
  @("Wands01.jpg","1/11","w01.jpg"), @("Wands02.jpg","0/0f","w02.jpg"),
  @("Wands03.jpg","f/ff","w03.jpg"), @("Wands04.jpg","a/a4","w04.jpg"),
  @("Wands05.jpg","9/9d","w05.jpg"), @("Wands06.jpg","3/3b","w06.jpg"),
  @("Wands07.jpg","e/e4","w07.jpg"), @("Wands08.jpg","6/6b","w08.jpg"),
  @("Wands09.jpg","e/e7","w09.jpg"), @("Wands10.jpg","0/0b","w10.jpg"),
  @("Wands11.jpg","6/6a","w11.jpg"), @("Wands12.jpg","1/16","w12.jpg"),
  @("Wands13.jpg","0/0d","w13.jpg"), @("Wands14.jpg","c/ce","w14.jpg"),
  # Cups (c01-c14)
  @("Cups01.jpg","3/36","c01.jpg"), @("Cups02.jpg","f/f8","c02.jpg"),
  @("Cups03.jpg","7/7a","c03.jpg"), @("Cups04.jpg","3/35","c04.jpg"),
  @("Cups05.jpg","d/d7","c05.jpg"), @("Cups06.jpg","1/17","c06.jpg"),
  @("Cups07.jpg","a/ae","c07.jpg"), @("Cups08.jpg","6/60","c08.jpg"),
  @("Cups09.jpg","2/24","c09.jpg"), @("Cups10.jpg","8/84","c10.jpg"),
  @("Cups11.jpg","a/ad","c11.jpg"), @("Cups12.jpg","f/fa","c12.jpg"),
  @("Cups13.jpg","6/62","c13.jpg"), @("Cups14.jpg","0/04","c14.jpg"),
  # Swords (s01-s14)
  @("Swords01.jpg","1/1a","s01.jpg"), @("Swords02.jpg","9/9e","s02.jpg"),
  @("Swords03.jpg","0/02","s03.jpg"), @("Swords04.jpg","b/bf","s04.jpg"),
  @("Swords05.jpg","2/23","s05.jpg"), @("Swords06.jpg","2/29","s06.jpg"),
  @("Swords07.jpg","3/34","s07.jpg"), @("Swords08.jpg","a/a7","s08.jpg"),
  @("Swords09.jpg","2/2f","s09.jpg"), @("Swords10.jpg","d/d4","s10.jpg"),
  @("Swords11.jpg","4/4c","s11.jpg"), @("Swords12.jpg","b/b0","s12.jpg"),
  @("Swords13.jpg","d/d4","s13.jpg"), @("Swords14.jpg","3/33","s14.jpg"),
  # Pentacles (p01-p14)
  @("Pents01.jpg","f/fd","p01.jpg"), @("Pents02.jpg","9/9f","p02.jpg"),
  @("Pents03.jpg","4/42","p03.jpg"), @("Pents04.jpg","3/35","p04.jpg"),
  @("Pents05.jpg","9/96","p05.jpg"), @("Pents06.jpg","a/a6","p06.jpg"),
  @("Pents07.jpg","6/6a","p07.jpg"), @("Pents08.jpg","4/49","p08.jpg"),
  @("Pents09.jpg","f/f0","p09.jpg"), @("Pents10.jpg","4/42","p10.jpg"),
  @("Pents11.jpg","e/ec","p11.jpg"), @("Pents12.jpg","d/d5","p12.jpg"),
  @("Pents13.jpg","8/88","p13.jpg"), @("Pents14.jpg","1/1c","p14.jpg")
)

Write-Host "=== Minor Arcana ==="
foreach ($c in $minor) { Get-Card $c[0] $c[1] $c[2] }

$count = (Get-ChildItem $outDir -Filter "*.jpg").Count
Write-Host ""
Write-Host "Done! $count / 78 card images downloaded to $outDir"
