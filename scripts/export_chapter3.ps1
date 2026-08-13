param(
    [string]$InputMarkdown = "CHUONG_3_GIAI_PHAP_HIEU_CHINH.md",
    [string]$TemplateDocx = "CHUONG_3_GIAI_PHAP_BAM_SAT_DE_CUONG.docx",
    [string]$OutputDocx = "CHUONG_3_GIAI_PHAP_HIEU_CHINH.docx"
)

$ErrorActionPreference = "Stop"

function Escape-Xml([string]$Text) {
    if ($null -eq $Text) { return "" }
    return [System.Security.SecurityElement]::Escape($Text)
}

function Strip-Markdown([string]$Text) {
    $value = $Text
    $value = $value -replace '\*\*(.*?)\*\*', '$1'
    $value = $value -replace '\*(.*?)\*', '$1'
    $value = $value -replace '`([^`]*)`', '$1'
    $value = $value -replace '\\\((.*?)\\\)', '$1'
    return $value
}

function New-Run([string]$Text, [bool]$Bold = $false, [bool]$Italic = $false, [bool]$Code = $false) {
    $rPr = ""
    if ($Bold -or $Italic -or $Code) {
        $props = @()
        if ($Bold) { $props += "<w:b/><w:bCs/>" }
        if ($Italic) { $props += "<w:i/><w:iCs/>" }
        if ($Code) {
            $props += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
            $props += '<w:sz w:val="20"/><w:szCs w:val="20"/>'
        }
        $rPr = "<w:rPr>$($props -join '')</w:rPr>"
    }
    return "<w:r>$rPr<w:t xml:space=`"preserve`">$(Escape-Xml $Text)</w:t></w:r>"
}

function New-InlineRuns([string]$Text) {
    # Lightweight inline formatting for bold and code spans.
    $parts = [regex]::Split($Text, '(\*\*.*?\*\*|`.*?`)')
    $runs = foreach ($part in $parts) {
        if ($part -match '^\*\*(.*?)\*\*$') {
            New-Run $Matches[1] $true $false $false
        } elseif ($part -match '^`(.*?)`$') {
            New-Run $Matches[1] $false $false $true
        } elseif ($part.Length -gt 0) {
            New-Run (Strip-Markdown $part)
        }
    }
    return $runs -join ""
}

function New-Paragraph(
    [string]$Text,
    [string]$Style = "Normal",
    [string]$Align = "both",
    [int]$FirstLine = 720,
    [int]$Left = 0,
    [bool]$KeepNext = $false,
    [bool]$Code = $false,
    [bool]$Bold = $false
) {
    $keep = if ($KeepNext) { "<w:keepNext/>" } else { "" }
    $spacing = if ($Code) { '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>' } else { '<w:spacing w:before="0" w:after="120" w:line="360" w:lineRule="auto"/>' }
    $shade = if ($Code) { '<w:shd w:val="clear" w:fill="F2F2F2"/>' } else { "" }
    $pPr = "<w:pPr><w:pStyle w:val=`"$Style`"/>$keep<w:jc w:val=`"$Align`"/>$spacing<w:ind w:left=`"$Left`" w:firstLine=`"$FirstLine`"/>$shade</w:pPr>"
    if ($Code) {
        $runs = New-Run $Text $false $false $true
    } elseif ($Bold) {
        $runs = New-Run (Strip-Markdown $Text) $true
    } else {
        $runs = New-InlineRuns $Text
    }
    return "<w:p>$pPr$runs</w:p>"
}

function New-Heading([string]$Text, [int]$Level) {
    if ($Level -eq 1) {
        return "<w:p><w:pPr><w:pStyle w:val=`"Title`"/><w:keepNext/><w:jc w:val=`"center`"/><w:spacing w:before=`"240`" w:after=`"240`" w:line=`"360`" w:lineRule=`"auto`"/><w:ind w:firstLine=`"0`"/></w:pPr>$(New-Run (Strip-Markdown $Text) $true)</w:p>"
    }
    $style = "Heading$($Level - 1)"
    return "<w:p><w:pPr><w:pStyle w:val=`"$style`"/><w:keepNext/><w:jc w:val=`"left`"/><w:spacing w:before=`"200`" w:after=`"100`" w:line=`"360`" w:lineRule=`"auto`"/><w:ind w:firstLine=`"0`"/></w:pPr>$(New-Run (Strip-Markdown $Text) $true)</w:p>"
}

function New-Table([object[]]$Rows) {
    if ($Rows.Count -eq 0) { return "" }
    $columnCount = $Rows[0].Count
    $width = [math]::Floor(9020 / $columnCount)
    $grid = (1..$columnCount | ForEach-Object { "<w:gridCol w:w=`"$width`"/>" }) -join ""
    $rowXml = for ($r = 0; $r -lt $Rows.Count; $r++) {
        $header = if ($r -eq 0) { '<w:tblHeader/>' } else { "" }
        $cells = for ($c = 0; $c -lt $columnCount; $c++) {
            $cellText = if ($c -lt $Rows[$r].Count) { [string]$Rows[$r][$c] } else { "" }
            $fill = if ($r -eq 0) { '<w:shd w:val="clear" w:fill="D9EAF7"/>' } else { "" }
            $runs = if ($r -eq 0) { New-Run (Strip-Markdown $cellText) $true } else { New-InlineRuns $cellText }
            "<w:tc><w:tcPr><w:tcW w:w=`"$width`" w:type=`"dxa`"/>$fill<w:vAlign w:val=`"center`"/></w:tcPr><w:p><w:pPr><w:jc w:val=`"left`"/><w:spacing w:after=`"40`" w:line=`"276`" w:lineRule=`"auto`"/><w:ind w:firstLine=`"0`"/></w:pPr>$runs</w:p></w:tc>"
        }
        "<w:tr><w:trPr>$header<w:cantSplit/></w:trPr>$($cells -join '')</w:tr>"
    }
    $borders = '<w:tblBorders><w:top w:val="single" w:sz="6" w:color="000000"/><w:left w:val="single" w:sz="6" w:color="000000"/><w:bottom w:val="single" w:sz="6" w:color="000000"/><w:right w:val="single" w:sz="6" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:color="808080"/><w:insideV w:val="single" w:sz="4" w:color="808080"/></w:tblBorders>'
    return "<w:tbl><w:tblPr><w:tblW w:w=`"9020`" w:type=`"dxa`"/><w:jc w:val=`"center`"/><w:tblLayout w:type=`"fixed`"/>$borders<w:tblCellMar><w:top w:w=`"80`" w:type=`"dxa`"/><w:left w:w=`"100`" w:type=`"dxa`"/><w:bottom w:w=`"80`" w:type=`"dxa`"/><w:right w:w=`"100`" w:type=`"dxa`"/></w:tblCellMar></w:tblPr><w:tblGrid>$grid</w:tblGrid>$($rowXml -join '')</w:tbl>"
}

function Parse-TableRow([string]$Line) {
    $trimmed = $Line.Trim().Trim('|')
    return @($trimmed.Split('|') | ForEach-Object { $_.Trim() })
}

$root = (Resolve-Path ".").Path
$inputPath = (Resolve-Path $InputMarkdown).Path
$templatePath = (Resolve-Path $TemplateDocx).Path
$outputPath = Join-Path $root $OutputDocx

$lines = Get-Content -Encoding UTF8 $inputPath
$body = New-Object System.Collections.Generic.List[string]
$paragraphBuffer = New-Object System.Collections.Generic.List[string]

function Flush-Paragraph {
    if ($paragraphBuffer.Count -gt 0) {
        $text = ($paragraphBuffer -join " ").Trim()
        if ($text.Length -gt 0) {
            $body.Add((New-Paragraph $text))
        }
        $paragraphBuffer.Clear()
    }
}

$i = 0
while ($i -lt $lines.Count) {
    $line = $lines[$i]

    if ($line -match '^```(.*)$') {
        Flush-Paragraph
        $language = $Matches[1].Trim()
        $i++
        $codeLines = New-Object System.Collections.Generic.List[string]
        while ($i -lt $lines.Count -and $lines[$i] -notmatch '^```') {
            $codeLines.Add($lines[$i])
            $i++
        }
        $label = if ($language -eq "mermaid") { "Ma nguon so do Mermaid (co the ket xuat thanh hinh):" } else { "Ma gia/thuat toan:" }
        $body.Add((New-Paragraph $label "Normal" "left" 0 0 $true $false $true))
        foreach ($codeLine in $codeLines) {
            $body.Add((New-Paragraph $codeLine "Normal" "left" 0 240 $false $true))
        }
        $i++
        continue
    }

    if ($line -match '^(\#{1,4})\s+(.+)$') {
        Flush-Paragraph
        $body.Add((New-Heading $Matches[2] $Matches[1].Length))
        $i++
        continue
    }

    if ($line -match '^\*\*(Bảng\s+3\.\d+\..+)\*\*$') {
        Flush-Paragraph
        $body.Add((New-Paragraph $Matches[1] "Normal" "center" 0 0 $true $false $true))
        $i++
        continue
    }

    if ($line -match '^\*\*(Hình\s+3\.\d+\..+)\*\*$') {
        Flush-Paragraph
        $body.Add((New-Paragraph $Matches[1] "Normal" "center" 0 0 $false $false $true))
        $i++
        continue
    }

    if ($line.TrimStart().StartsWith("|")) {
        Flush-Paragraph
        $rows = New-Object System.Collections.Generic.List[object]
        while ($i -lt $lines.Count -and $lines[$i].TrimStart().StartsWith("|")) {
            $row = Parse-TableRow $lines[$i]
            $isSeparator = ($row | Where-Object { $_ -notmatch '^:?-{3,}:?$' }).Count -eq 0
            if (-not $isSeparator) { $rows.Add($row) }
            $i++
        }
        $body.Add((New-Table $rows))
        $body.Add("<w:p><w:pPr><w:spacing w:after=`"80`"/></w:pPr></w:p>")
        continue
    }

    if ($line -match '^\s*[-]\s+(.+)$') {
        Flush-Paragraph
        $body.Add((New-Paragraph ("• " + $Matches[1]) "Normal" "both" -360 720))
        $i++
        continue
    }

    if ($line -match '^\s*(\d+)\.\s+(.+)$') {
        Flush-Paragraph
        $body.Add((New-Paragraph ($Matches[1] + ". " + $Matches[2]) "Normal" "both" -360 720))
        $i++
        continue
    }

    if ($line -match '^>\s*(.+)$') {
        Flush-Paragraph
        $body.Add((New-Paragraph $Matches[1] "Normal" "both" 0 720 $false $false))
        $i++
        continue
    }

    if ($line.Trim() -eq '\[') {
        Flush-Paragraph
        $i++
        $formulaLines = New-Object System.Collections.Generic.List[string]
        while ($i -lt $lines.Count -and $lines[$i].Trim() -ne '\]') {
            $formulaLines.Add($lines[$i].Trim())
            $i++
        }
        $formula = ($formulaLines -join " ") -replace '\\tag\{([^}]+)\}', '    ($1)'
        $formula = $formula -replace '\\dfrac', '' -replace '\\frac', '' -replace '\\times', 'x' -replace '\\sum', 'SUM' -replace '\\ge', '>=' -replace '\\le', '<=' -replace '\\varnothing', 'empty' -replace '\\begin\{cases\}', '' -replace '\\end\{cases\}', '' -replace '\\text\{([^}]*)\}', '$1' -replace '\\', ''
        $body.Add((New-Paragraph $formula "Normal" "center" 0 0))
        $i++
        continue
    }

    if ([string]::IsNullOrWhiteSpace($line)) {
        Flush-Paragraph
        $i++
        continue
    }

    $paragraphBuffer.Add($line.Trim())
    $i++
}
Flush-Paragraph

$sectPr = @'
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838"/>
  <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1984" w:header="720" w:footer="720" w:gutter="0"/>
  <w:cols w:space="720"/>
  <w:docGrid w:linePitch="360"/>
</w:sectPr>
'@

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 mc:Ignorable="w14">
<w:body>
$($body -join "`r`n")
$sectPr
</w:body>
</w:document>
"@

Add-Type -AssemblyName System.IO.Compression.FileSystem
$tempRoot = [System.IO.Path]::GetTempPath()
$tempDir = Join-Path $tempRoot ("chapter3_docx_" + [Guid]::NewGuid().ToString("N"))
[System.IO.Directory]::CreateDirectory($tempDir) | Out-Null

try {
    [System.IO.Compression.ZipFile]::ExtractToDirectory($templatePath, $tempDir)
    $documentPart = Join-Path $tempDir "word\document.xml"
    [System.IO.File]::WriteAllText($documentPart, $documentXml, (New-Object System.Text.UTF8Encoding($false)))

    if (Test-Path -LiteralPath $outputPath) {
        Remove-Item -LiteralPath $outputPath -Force
    }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $outputPath)
} finally {
    $resolvedTemp = [System.IO.Path]::GetFullPath($tempDir)
    if ($resolvedTemp.StartsWith([System.IO.Path]::GetFullPath($tempRoot), [System.StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
    }
}

Write-Output "Created: $outputPath"
