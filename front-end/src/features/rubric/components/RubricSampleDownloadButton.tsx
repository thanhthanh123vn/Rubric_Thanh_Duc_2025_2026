import { Download } from "lucide-react";
import type { MatrixCriterionDraft, MatrixLevelDraft } from "@/features/rubric/components/RubricMatrixPreview.tsx";

type Props = {
    name: string;
    description: string;
    criteria: MatrixCriterionDraft[];
    totalWeight: number;
    sortLevels: (levels: MatrixLevelDraft[]) => MatrixLevelDraft[];
};

const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const normalized = (text || "").trim() || "-";
    const words = normalized.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (context.measureText(candidate).width <= maxWidth) {
            currentLine = candidate;
            return;
        }

        if (currentLine) {
            lines.push(currentLine);
        }
        currentLine = word;
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.length > 0 ? lines : ["-"];
};

const drawLines = (
    context: CanvasRenderingContext2D,
    lines: string[],
    x: number,
    startY: number,
    lineHeight: number,
    color: string,
    align: CanvasTextAlign = "left",
) => {
    context.fillStyle = color;
    context.textAlign = align;

    lines.forEach((line, index) => {
        context.fillText(line, x, startY + index * lineHeight);
    });
};

export default function RubricSampleDownloadButton({
    name,
    description,
    criteria,
    totalWeight,
    sortLevels,
}: Props) {
    const handleDownloadImage = async () => {
        const safeName = (name || "rubric-preview")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const exportCanvas = document.createElement("canvas");
        const measureCanvas = document.createElement("canvas");
        const measureContext = measureCanvas.getContext("2d");

        if (!measureContext) {
            return;
        }

        const outerPadding = 48;
        const sectionGap = 24;
        const criteriaColumnWidth = 260;
        const levelColumnWidth = 220;
        const summaryCardHeight = 96;
        const summaryGap = 16;
        const maxLevels = Math.max(1, ...criteria.map((criterion) => criterion.levels.length || 1));
        const tableWidth = criteriaColumnWidth + maxLevels * levelColumnWidth;
        const width = outerPadding * 2 + Math.max(tableWidth, 980);

        measureContext.font = "600 16px Arial";

        const rowHeights = criteria.map((criterion) => {
            const levels = sortLevels(criterion.levels);
            const criterionLines = wrapText(
                measureContext,
                criterion.name || "Tieu chi chua dat ten",
                criteriaColumnWidth - 40,
            );

            const levelHeights = levels.length === 0
                ? [120]
                : levels.map((level) => {
                    measureContext.font = "500 14px Arial";
                    const descriptionLines = wrapText(
                        measureContext,
                        level.description || "Chua co mo ta cho muc nay.",
                        levelColumnWidth - 32,
                    );
                    return 88 + descriptionLines.length * 22;
                });

            const leftHeight = 110 + criterionLines.length * 22;
            return Math.max(leftHeight, ...levelHeights);
        });

        const contentHeight =
            120 +
            summaryCardHeight +
            sectionGap +
            72 +
            56 +
            rowHeights.reduce((sum, item) => sum + item, 0);
        const height = outerPadding * 2 + contentHeight;

        const scale = 2;
        exportCanvas.width = width * scale;
        exportCanvas.height = height * scale;

        const context = exportCanvas.getContext("2d");
        if (!context) {
            return;
        }

        context.scale(scale, scale);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);

        let currentY = outerPadding;


        context.fillStyle = "#0f172a";
        context.font = "700 32px Arial";
        context.fillText(name || "Rubric chua dat ten", outerPadding, currentY);

        currentY += 30;
        context.fillStyle = "#475569";
        context.font = "400 16px Arial";
        const descriptionLines = wrapText(
            context,
            description || "Rubric nay chua co mo ta tong quan.",
            width - outerPadding * 2,
        );
        drawLines(context, descriptionLines, outerPadding, currentY, 24, "#475569");




        currentY += sectionGap;




        const tableX = outerPadding;
        const headerHeight = 56;

        context.fillStyle = "#f8fafc";
        context.strokeStyle = "#cbd5e1";
        context.lineWidth = 1;
        context.beginPath();
        context.rect(tableX, currentY, tableWidth, headerHeight);
        context.fill();
        context.stroke();

        context.beginPath();
        context.moveTo(tableX + criteriaColumnWidth, currentY);
        context.lineTo(tableX + criteriaColumnWidth, currentY + headerHeight);
        context.stroke();

        context.fillStyle = "#334155";
        context.font = "600 14px Arial";
        context.fillText("Tiêu chí", tableX + 16, currentY + 34);
        context.fillText("Mức đánh giá theo từng tiêu chí", tableX + criteriaColumnWidth + 16, currentY + 34);

        currentY += headerHeight;

        criteria.forEach((criterion, rowIndex) => {
            const levels = sortLevels(criterion.levels);
            const rowHeight = rowHeights[rowIndex];

            context.fillStyle = rowIndex % 2 === 0 ? "#ffffff" : "#fcfcfd";
            context.fillRect(tableX, currentY, tableWidth, rowHeight);
            context.strokeStyle = "#e2e8f0";
            context.strokeRect(tableX, currentY, tableWidth, rowHeight);

            context.beginPath();
            context.moveTo(tableX + criteriaColumnWidth, currentY);
            context.lineTo(tableX + criteriaColumnWidth, currentY + rowHeight);
            context.stroke();

            context.fillStyle = "#0f172a";
            context.font = "600 16px Arial";
            const criterionNameLines = wrapText(
                context,
                criterion.name || "Tiêu chí này chưa đặt tên",
                criteriaColumnWidth - 32,
            );
            drawLines(context, criterionNameLines, tableX + 16, currentY + 28, 22, "#0f172a");

            context.fillStyle = "#64748b";
            context.font = "400 14px Arial";
            context.fillText(`Tên CLO : ${criterion.cloId || "Chưa gắn CLO"}`, tableX + 16, currentY + 28 + criterionNameLines.length * 22 + 20);
            context.fillStyle = "#047857";
            context.font = "600 14px Arial";
            context.fillText(`Trọng số ${criterion.weight}%`, tableX + 16, currentY + 28 + criterionNameLines.length * 22 + 44);

            const renderLevels = levels.length > 0
                ? levels
                : [{ id: "empty", name: "Chưa có mức", score: 0, description: "Tiêu chí này chưa có mức đánh giá.", orderIndex: 0 }];

            const currentLevelWidth = (tableWidth - criteriaColumnWidth) / renderLevels.length;

            renderLevels.forEach((level, index) => {
                const cellX = tableX + criteriaColumnWidth + index * currentLevelWidth;

                if (index > 0) {
                    context.beginPath();
                    context.moveTo(cellX, currentY);
                    context.lineTo(cellX, currentY + rowHeight);
                    context.stroke();
                }

                context.fillStyle = "#f1f5f9";
                context.beginPath();
                context.roundRect(cellX + 12, currentY + 14, currentLevelWidth - 24, 52, 12);
                context.fill();

                context.fillStyle = "#0f172a";
                context.font = "600 14px Arial";
                const levelTitle = level.name || `Muc ${index + 1}`;
                const titleLines = wrapText(context, levelTitle, currentLevelWidth - 48);
                drawLines(
                    context,
                    titleLines.slice(0, 2),
                    cellX + currentLevelWidth / 2,
                    currentY + 34,
                    18,
                    "#0f172a",
                    "center",
                );

                context.fillStyle = "#64748b";
                context.font = "500 13px Arial";
                context.fillText(`${level.score} diem`, cellX + currentLevelWidth / 2, currentY + 58);

                context.fillStyle = "#475569";
                context.font = "400 14px Arial";
                const descriptionText = level.description || "Chưa có mô tả cho mức này.";
                const cellDescriptionLines = wrapText(context, descriptionText, currentLevelWidth - 32);
                drawLines(context, cellDescriptionLines, cellX + 16, currentY + 92, 20, "#475569");
            });

            currentY += rowHeight;
        });

        const link = document.createElement("a");
        link.href = exportCanvas.toDataURL("image/png");
        link.download = `${safeName || "rubric-preview"}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <button
            type="button"
            onClick={handleDownloadImage}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
            <Download className="h-4 w-4" />
            Tải hình ảnh
        </button>
    );
}
