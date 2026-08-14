param(
    [string]$InputPath = "CHUONG_3_GIAI_PHAP.md",
    [string]$OutputPath = "CHUONG_3_GIAI_PHAP.docx"
)

$ErrorActionPreference = "Stop"

$workspace = [System.IO.Path]::GetFullPath((Get-Location).Path)
$inputFile = [System.IO.Path]::GetFullPath((Join-Path $workspace $InputPath))
$outputFile = [System.IO.Path]::GetFullPath((Join-Path $workspace $OutputPath))

if (-not $inputFile.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Input path must stay inside the workspace."
}
if (-not $outputFile.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Output path must stay inside the workspace."
}
if (-not (Test-Path -LiteralPath $inputFile)) {
    throw "Input file not found: $inputFile"
}

$buildRoot = Join-Path $workspace (".docx-build-ch3-" + [guid]::NewGuid().ToString("N"))
$buildRoot = [System.IO.Path]::GetFullPath($buildRoot)
if (-not $buildRoot.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Temporary build path must stay inside the workspace."
}

function Escape-Xml([string]$Text) {
    if ($null -eq $Text) { return "" }
    return [System.Security.SecurityElement]::Escape($Text)
}

function Clean-Markdown([string]$Text) {
    $value = $Text
    $value = $value -replace '\*\*([^*]+)\*\*', '$1'
    $value = $value -replace '(?<!\*)\*([^*]+)\*(?!\*)', '$1'
    $value = $value -replace '`([^`]+)`', '$1'
    $value = $value -replace '\[([^\]]+)\]\(([^)]+)\)', '$1 ($2)'
    return $value
}

function New-RunXml {
    param(
        [string]$Text,
        [string]$Font = "Times New Roman",
        [int]$Size = 26,
        [bool]$Bold = $false,
        [bool]$Italic = $false
    )
    $properties = '<w:rFonts w:ascii="{0}" w:hAnsi="{0}" w:eastAsia="{0}"/><w:sz w:val="{1}"/><w:szCs w:val="{1}"/>' -f $Font, $Size
    if ($Bold) { $properties += "<w:b/><w:bCs/>" }
    if ($Italic) { $properties += "<w:i/><w:iCs/>" }
    return ('<w:r><w:rPr>{0}</w:rPr><w:t xml:space="preserve">{1}</w:t></w:r>' -f $properties, (Escape-Xml $Text))
}

function New-ParagraphXml {
    param(
        [string]$Text,
        [string]$Style = "Normal",
        [string]$Align = "both",
        [int]$FirstLine = 720,
        [int]$Left = 0,
        [int]$SpaceBefore = 0,
        [int]$SpaceAfter = 120,
        [int]$Line = 360,
        [string]$Font = "Times New Roman",
        [int]$Size = 26,
        [bool]$Bold = $false,
        [bool]$Italic = $false,
        [string]$Shade = ""
    )
    $pPr = '<w:pStyle w:val="{0}"/><w:jc w:val="{1}"/><w:spacing w:before="{2}" w:after="{3}" w:line="{4}" w:lineRule="auto"/><w:ind w:left="{5}" w:firstLine="{6}"/>' -f $Style, $Align, $SpaceBefore, $SpaceAfter, $Line, $Left, $FirstLine
    if ($Shade) { $pPr += ('<w:shd w:val="clear" w:color="auto" w:fill="{0}"/>' -f $Shade) }
    $run = New-RunXml -Text (Clean-Markdown $Text) -Font $Font -Size $Size -Bold $Bold -Italic $Italic
    return "<w:p><w:pPr>$pPr</w:pPr>$run</w:p>"
}

function New-FieldTocXml {
    return @"
<w:p>
  <w:pPr><w:jc w:val="left"/><w:spacing w:after="120"/></w:pPr>
  <w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>
  <w:r><w:instrText xml:space="preserve"> TOC \o "1-3" \h \z \u </w:instrText></w:r>
  <w:r><w:fldChar w:fldCharType="separate"/></w:r>
  <w:r><w:t>Cập nhật mục lục trong Word bằng phím F9.</w:t></w:r>
  <w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p>
"@
}

try {
    New-Item -ItemType Directory -Path $buildRoot | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $buildRoot "_rels") | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $buildRoot "docProps") | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $buildRoot "word") | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $buildRoot "word\_rels") | Out-Null

    $contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

    $rootRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

    $documentRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

    $styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:jc w:val="both"/><w:spacing w:after="120" w:line="360" w:lineRule="auto"/><w:ind w:firstLine="720"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="0"/><w:spacing w:before="240" w:after="120"/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="1"/><w:spacing w:before="180" w:after="100"/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="2"/><w:spacing w:before="160" w:after="80"/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:b/><w:bCs/><w:i/><w:iCs/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
</w:styles>
'@

    $now = [DateTime]::UtcNow.ToString("s") + "Z"
    $core = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Chương 3 - Giải pháp cho bài toán</dc:title>
  <dc:subject>Khóa luận tốt nghiệp LMS Rubric</dc:subject>
  <dc:creator>Nhóm thực hiện đề tài</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$now</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$now</dcterms:modified>
</cp:coreProperties>
"@

    $app = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
  <AppVersion>16.0000</AppVersion>
</Properties>
'@

    $body = [System.Text.StringBuilder]::new()
    $lines = Get-Content -LiteralPath $inputFile -Encoding UTF8
    $inCode = $false
    $codeLanguage = ""
    $addedToc = $false

    $fence = ([string][char]96) * 3

    foreach ($rawLine in $lines) {
        $line = $rawLine.TrimEnd()

        if ($line.StartsWith($fence)) {
            if (-not $inCode) {
                $inCode = $true
                $codeLanguage = $line.Substring($fence.Length).Trim()
                if ($codeLanguage -eq "mermaid") {
                    [void]$body.Append((New-ParagraphXml -Text "Sơ đồ mô tả (mã Mermaid để kết xuất hình):" -FirstLine 0 -Italic $true -SpaceBefore 80 -SpaceAfter 40))
                }
            } else {
                $inCode = $false
                $codeLanguage = ""
                [void]$body.Append((New-ParagraphXml -Text "" -FirstLine 0 -SpaceAfter 40 -Line 240))
            }
            continue
        }

        if ($inCode) {
            [void]$body.Append((New-ParagraphXml -Text $line -Align "left" -FirstLine 0 -Left 360 -SpaceAfter 0 -Line 240 -Font "Consolas" -Size 18 -Shade "F2F2F2"))
            continue
        }

        if ($line -match '^# (.+)$') {
            [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Title" -Align "center" -FirstLine 0 -SpaceBefore 240 -SpaceAfter 240 -Size 32 -Bold $true))
            if (-not $addedToc) {
                [void]$body.Append((New-ParagraphXml -Text "MỤC LỤC" -Style "Heading1" -Align "center" -FirstLine 0 -SpaceBefore 120 -SpaceAfter 80 -Size 28 -Bold $true))
                [void]$body.Append((New-FieldTocXml))
                [void]$body.Append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
                $addedToc = $true
            }
        } elseif ($line -match '^## (.+)$') {
            [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Heading1" -Align "left" -FirstLine 0 -SpaceBefore 240 -SpaceAfter 120 -Size 28 -Bold $true))
        } elseif ($line -match '^#### (.+)$') {
            [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Heading3" -Align "left" -FirstLine 0 -SpaceBefore 160 -SpaceAfter 80 -Size 26 -Bold $true -Italic $true))
        } elseif ($line -match '^### (.+)$') {
            [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Style "Heading2" -Align "left" -FirstLine 0 -SpaceBefore 180 -SpaceAfter 100 -Size 26 -Bold $true))
        } elseif ($line -match '^>\s*\*\*(.+?)\*\*(.*)$') {
            $quoteText = $Matches[1] + $Matches[2]
            [void]$body.Append((New-ParagraphXml -Text $quoteText -Align "both" -FirstLine 0 -Left 720 -SpaceBefore 80 -SpaceAfter 120 -Italic $true -Shade "FFF2CC"))
        } elseif ($line -match '^>\s*(.+)$') {
            [void]$body.Append((New-ParagraphXml -Text $Matches[1] -Align "both" -FirstLine 0 -Left 720 -SpaceBefore 80 -SpaceAfter 120 -Italic $true -Shade "EAF2F8"))
        } elseif ($line -match '^-\s+(.+)$') {
            [void]$body.Append((New-ParagraphXml -Text ("• " + $Matches[1]) -Align "both" -FirstLine -360 -Left 1080 -SpaceAfter 60))
        } elseif ($line -match '^\d+\.\s+(.+)$') {
            [void]$body.Append((New-ParagraphXml -Text $line -Align "both" -FirstLine -360 -Left 1080 -SpaceAfter 60))
        } elseif ($line -match '^\*\*Hình\s+(.+?)\*\*$') {
            [void]$body.Append((New-ParagraphXml -Text ("Hình " + $Matches[1]) -Align "center" -FirstLine 0 -SpaceBefore 60 -SpaceAfter 160 -Italic $true))
        } elseif ($line -eq '\[' -or $line -eq '\]') {
            continue
        } elseif ($line -match '^\\' -or $line -match '^\{?\\mathbf' -or $line -match '^R\s*=|^C_i\s*=|^w_i\s*|^a=|^d=|^S_|^N_|^A_|^P_') {
            [void]$body.Append((New-ParagraphXml -Text $line -Align "center" -FirstLine 0 -SpaceBefore 40 -SpaceAfter 40 -Font "Cambria Math" -Size 24 -Italic $true))
        } elseif ([string]::IsNullOrWhiteSpace($line)) {
            continue
        } else {
            [void]$body.Append((New-ParagraphXml -Text $line))
        }
    }

    $document = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    $($body.ToString())
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1984" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

    $utf8 = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "[Content_Types].xml"), $contentTypes, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "_rels\.rels"), $rootRels, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "word\_rels\document.xml.rels"), $documentRels, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "word\styles.xml"), $styles, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "word\document.xml"), $document, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "docProps\core.xml"), $core, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $buildRoot "docProps\app.xml"), $app, $utf8)

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipPath = [System.IO.Path]::ChangeExtension($outputFile, ".zip")
    if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
    if (Test-Path -LiteralPath $outputFile) { Remove-Item -LiteralPath $outputFile -Force }
    $archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $buildRoot -File -Recurse | ForEach-Object {
            $relativeName = $_.FullName.Substring($buildRoot.Length).TrimStart('\', '/') -replace '\\', '/'
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $_.FullName,
                $relativeName,
                [System.IO.Compression.CompressionLevel]::Optimal
            )
        }
    } finally {
        $archive.Dispose()
    }
    Move-Item -LiteralPath $zipPath -Destination $outputFile

    Write-Output "Created: $outputFile"
    Write-Output "Size: $((Get-Item -LiteralPath $outputFile).Length) bytes"
} finally {
    if (Test-Path -LiteralPath $buildRoot) {
        $resolvedBuildRoot = [System.IO.Path]::GetFullPath($buildRoot)
        if ($resolvedBuildRoot.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $resolvedBuildRoot -Recurse -Force
        }
    }
}
