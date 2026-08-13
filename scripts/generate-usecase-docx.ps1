param(
    [string]$InputPath = "docs/use-cases/CHUC_NANG_CHINH_HE_THONG.md",
    [string]$OutputPath = "docs/use-cases/DAC_TA_CHUC_NANG_CHINH_HE_THONG.docx"
)

$ErrorActionPreference = "Stop"

function ConvertTo-XmlText([string]$Text) {
    return [System.Security.SecurityElement]::Escape($Text)
}

function New-ParagraphXml {
    param(
        [string]$Text,
        [string]$Style = "Normal",
        [bool]$Bold = $false,
        [string]$Size = "22",
        [string]$Align = "both",
        [bool]$PageBreakBefore = $false
    )

    $escaped = ConvertTo-XmlText $Text
    $boldXml = if ($Bold) { "<w:b/>" } else { "" }
    $breakXml = if ($PageBreakBefore) { "<w:pageBreakBefore/>" } else { "" }
    return @"
<w:p>
  <w:pPr><w:pStyle w:val="$Style"/><w:jc w:val="$Align"/>$breakXml<w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
  <w:r><w:rPr>$boldXml<w:sz w:val="$Size"/><w:szCs w:val="$Size"/></w:rPr><w:t xml:space="preserve">$escaped</w:t></w:r>
</w:p>
"@
}

function New-TableXml {
    param([object[]]$Rows)

    $builder = [System.Text.StringBuilder]::new()
    [void]$builder.Append(@"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:color="808080"/>
      <w:left w:val="single" w:sz="8" w:color="808080"/>
      <w:bottom w:val="single" w:sz="8" w:color="808080"/>
      <w:right w:val="single" w:sz="8" w:color="808080"/>
      <w:insideH w:val="single" w:sz="6" w:color="B0B0B0"/>
      <w:insideV w:val="single" w:sz="6" w:color="B0B0B0"/>
    </w:tblBorders>
  </w:tblPr>
"@)

    for ($rowIndex = 0; $rowIndex -lt $Rows.Count; $rowIndex++) {
        [void]$builder.Append("<w:tr>")
        foreach ($cell in $Rows[$rowIndex]) {
            $cellText = ([string]$cell) -replace '<br\s*/?>', "`n"
            $cellText = $cellText -replace '\*\*', '' -replace '`', ''
            $escaped = ConvertTo-XmlText $cellText
            $shade = if ($rowIndex -eq 0) { '<w:shd w:val="clear" w:fill="D9EAF7"/>' } else { '' }
            $bold = if ($rowIndex -eq 0) { '<w:b/>' } else { '' }
            [void]$builder.Append(@"
<w:tc>
  <w:tcPr><w:tcW w:w="0" w:type="auto"/>$shade<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr>
  <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr>$bold<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">$escaped</w:t></w:r></w:p>
</w:tc>
"@)
        }
        [void]$builder.Append("</w:tr>")
    }
    [void]$builder.Append("</w:tbl>")
    return $builder.ToString()
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$lines = Get-Content -LiteralPath $resolvedInput -Encoding UTF8
$body = [System.Text.StringBuilder]::new()
$tableRows = [System.Collections.Generic.List[object]]::new()
$sectionCount = 0

function Flush-Table {
    if ($tableRows.Count -gt 0) {
        [void]$body.Append((New-TableXml -Rows $tableRows.ToArray()))
        $tableRows.Clear()
    }
}

foreach ($line in $lines) {
    if ($line -match '^\|(.+)\|$') {
        $cells = @($line.Trim('|').Split('|') | ForEach-Object { $_.Trim() })
        $isSeparator = $true
        foreach ($cell in $cells) {
            if ($cell -notmatch '^:?-{3,}:?$') { $isSeparator = $false; break }
        }
        if (-not $isSeparator) { $tableRows.Add($cells) }
        continue
    }

    Flush-Table

    if ($line -match '^- \[(Activity|Sequence) Diagram\]') { continue }
    if ($line -eq '---' -or [string]::IsNullOrWhiteSpace($line)) { continue }

    if ($line -match '^# (.+)$') {
        [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Title" -Bold $true -Size "32" -Align "center"))
    }
    elseif ($line -match '^## (.+)$') {
        $sectionCount++
        [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Heading1" -Bold $true -Size "28" -Align "left" -PageBreakBefore ($sectionCount -gt 1)))
    }
    elseif ($line -match '^### (.+)$') {
        [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Heading2" -Bold $true -Size "25" -Align "left"))
    }
    elseif ($line -match '^#### (.+)$') {
        [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Heading3" -Bold $true -Size "23" -Align "left"))
    }
    elseif ($line -match '^> (.+)$') {
        [void]$body.Append((New-ParagraphXml -Text ("Ghi chú: " + $Matches[1]) -Style "Normal" -Bold $false -Size "20" -Align "left"))
    }
    elseif ($line -match '^(\d+)\.\s+(.+)$') {
        $clean = $Matches[2] -replace '`', '' -replace '\*\*', ''
        [void]$body.Append((New-ParagraphXml -Text ($Matches[1] + ". " + $clean) -Style "Normal" -Size "22" -Align "both"))
    }
    else {
        $clean = $line -replace '`', '' -replace '\*\*', ''
        [void]$body.Append((New-ParagraphXml -Text $clean -Style "Normal" -Size "22" -Align "both"))
    }
}
Flush-Table

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    $($body.ToString())
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>
</w:styles>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"@

$rootRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

$documentRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"@

$workspace = (Resolve-Path -LiteralPath '.').Path
$tempRoot = Join-Path $workspace (".tmp-docx-" + [Guid]::NewGuid().ToString('N'))
$zipPath = [System.IO.Path]::ChangeExtension($resolvedOutput, '.zip')

try {
    New-Item -ItemType Directory -Path (Join-Path $tempRoot '_rels') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word\_rels') -Force | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $tempRoot '[Content_Types].xml'), $contentTypes, [Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText((Join-Path $tempRoot '_rels\.rels'), $rootRels, [Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'word\document.xml'), $documentXml, [Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'word\styles.xml'), $stylesXml, [Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText((Join-Path $tempRoot 'word\_rels\document.xml.rels'), $documentRels, [Text.UTF8Encoding]::new($false))

    if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath }
    if (Test-Path -LiteralPath $resolvedOutput) { Remove-Item -LiteralPath $resolvedOutput }
    Add-Type -AssemblyName System.IO.Compression
    $zipStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::CreateNew)
    try {
        $archive = [System.IO.Compression.ZipArchive]::new(
            $zipStream,
            [System.IO.Compression.ZipArchiveMode]::Create,
            $false
        )
        try {
            foreach ($sourceFile in Get-ChildItem -LiteralPath $tempRoot -Recurse -File) {
                $relativeName = $sourceFile.FullName.Substring($tempRoot.Length + 1).Replace('\', '/')
                $entry = $archive.CreateEntry($relativeName, [System.IO.Compression.CompressionLevel]::Optimal)
                $entryStream = $entry.Open()
                $sourceStream = [System.IO.File]::OpenRead($sourceFile.FullName)
                try { $sourceStream.CopyTo($entryStream) }
                finally {
                    $sourceStream.Dispose()
                    $entryStream.Dispose()
                }
            }
        }
        finally { $archive.Dispose() }
    }
    finally { $zipStream.Dispose() }
    Move-Item -LiteralPath $zipPath -Destination $resolvedOutput
}
finally {
    $resolvedTemp = [System.IO.Path]::GetFullPath($tempRoot)
    if ($resolvedTemp.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar) -and (Test-Path -LiteralPath $resolvedTemp)) {
        Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
    }
}

Get-Item -LiteralPath $resolvedOutput | Select-Object FullName, Length, LastWriteTime
