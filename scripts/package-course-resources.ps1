param([string]$Map = 'content-map/mediahub.json')

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '..'))
$config = Get-Content -LiteralPath (Join-Path $projectRoot $Map) -Raw -Encoding UTF8 | ConvertFrom-Json
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot $config.sourceRoot))
$outputRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot "public/materials/$($config.courseId)/downloads"))

function Assert-Within([string]$Root, [string]$Target) {
  if (-not $Target.StartsWith($Root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Path outside expected directory: $Target"
  }
}
Assert-Within $workspaceRoot $sourceRoot
Assert-Within $projectRoot $outputRoot
$sha = [Security.Cryptography.SHA256]::Create()
try {
  foreach ($bundle in $config.resourceBundles) {
    $destination = [IO.Path]::GetFullPath((Join-Path $projectRoot $bundle.target))
    Assert-Within $outputRoot $destination
    if ([IO.Path]::GetExtension($destination) -ne '.zip') { throw 'ZIP target required' }
    $expected = @{}
    foreach ($name in $bundle.files) {
      $source = [IO.Path]::GetFullPath((Join-Path $sourceRoot $name))
      Assert-Within $sourceRoot $source
      $item = Get-Item -LiteralPath $source
      if ($item.PSIsContainer) { throw "Explicit files only: $name" }
      $current = $item
      while ($current.FullName -ne $workspaceRoot) {
        if ($current.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Reparse point: $name" }
        $current = Get-Item -LiteralPath ([IO.Path]::GetDirectoryName($current.FullName))
      }
      if ($expected.ContainsKey($name)) { throw "Duplicate file: $name" }
      $expected[$name] = [Convert]::ToBase64String($sha.ComputeHash([IO.File]::ReadAllBytes($source)))
    }
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination)) | Out-Null
    $temporary = $destination + '.tmp'
    $stream = [IO.File]::Open($temporary, [IO.FileMode]::Create, [IO.FileAccess]::ReadWrite)
    $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create, $false, [Text.Encoding]::UTF8)
    try {
      foreach ($name in $bundle.files) {
        $entry = $archive.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]::new(2000, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
        $entryStream = $entry.Open()
        try {
          $bytes = [IO.File]::ReadAllBytes((Join-Path $sourceRoot $name))
          $entryStream.Write($bytes, 0, $bytes.Length)
        } finally { $entryStream.Dispose() }
      }
    } finally { $archive.Dispose() }
    $archive = [IO.Compression.ZipFile]::OpenRead($temporary)
    try {
      if ($archive.Entries.Count -ne $expected.Count) { throw 'ZIP entry count mismatch' }
      foreach ($entry in $archive.Entries) {
        $entryStream = $entry.Open()
        try { $actual = [Convert]::ToBase64String($sha.ComputeHash($entryStream)) }
        finally { $entryStream.Dispose() }
        if ($actual -ne $expected[$entry.FullName]) { throw "ZIP hash mismatch: $($entry.FullName)" }
      }
    } finally { $archive.Dispose() }
    Move-Item -LiteralPath $temporary -Destination $destination -Force
    Write-Output "$($bundle.target): $($expected.Count) files, $((Get-Item -LiteralPath $destination).Length) bytes, SHA-256 verified"
  }
} finally { $sha.Dispose() }
