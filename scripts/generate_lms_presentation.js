const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'LMS Rubric project';
pptx.subject = 'Bố cục thuyết trình đồ án LMS hỗ trợ Rubric và OBE';
pptx.title = 'LMS hỗ trợ đánh giá theo Rubric gắn với chuẩn đầu ra';
pptx.company = 'HCMUAF';
pptx.lang = 'vi-VN';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'vi-VN'
};
pptx.defineSlideMaster({
  title: 'CONTENT',
  background: { color: 'F7F9FC' },
  objects: [
    { rect: { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: '2856D6' }, line: { color: '2856D6' } } },
    { text: { text: 'LMS • RUBRIC • OBE', options: { x: 0.48, y: 7.15, w: 2.8, h: 0.18, fontFace: 'Aptos', fontSize: 8, bold: true, color: '7B8498', margin: 0 } } },
    { text: { text: 'ĐỒ ÁN TỐT NGHIỆP  |  2026', options: { x: 10.45, y: 7.15, w: 2.35, h: 0.18, fontFace: 'Aptos', fontSize: 8, color: '7B8498', align: 'right', margin: 0 } } }
  ],
  slideNumber: { x: 12.82, y: 7.12, color: '7B8498', fontSize: 8 }
});

const C = {
  navy: '101828', blue: '2856D6', cyan: '0EA5E9', teal: '0F9D8A',
  orange: 'F79009', red: 'D92D20', purple: '7F56D9', white: 'FFFFFF',
  bg: 'F7F9FC', light: 'EEF3FF', gray: '667085', line: 'D9E0EC', darkBg: '0B1220'
};
const S = pptx.ShapeType;

function addTitle(slide, kicker, title, subtitle) {
  slide.addText(kicker.toUpperCase(), { x: 0.62, y: 0.38, w: 4.0, h: 0.25, fontSize: 10, bold: true, color: C.blue, charSpacing: 1.5, margin: 0 });
  slide.addText(title, { x: 0.62, y: 0.72, w: 11.9, h: 0.58, fontSize: 28, bold: true, color: C.navy, margin: 0, breakLine: false, fit: 'shrink' });
  if (subtitle) slide.addText(subtitle, { x: 0.64, y: 1.37, w: 11.55, h: 0.42, fontSize: 13, color: C.gray, margin: 0, fit: 'shrink' });
}

function box(slide, x, y, w, h, fill, radius = 0.12, line = fill) {
  slide.addShape(S.roundRect, { x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, width: 1 } });
}

function pill(slide, text, x, y, w, color = C.blue, fill = C.light) {
  slide.addShape(S.roundRect, { x, y, w, h: 0.34, rectRadius: 0.17, fill: { color: fill }, line: { color: fill } });
  slide.addText(text, { x: x + 0.08, y: y + 0.07, w: w - 0.16, h: 0.14, fontSize: 9, bold: true, color, align: 'center', margin: 0, fit: 'shrink' });
}

function numCircle(slide, n, x, y, color = C.blue) {
  slide.addShape(S.ellipse, { x, y, w: 0.42, h: 0.42, fill: { color }, line: { color } });
  slide.addText(String(n), { x, y: y + 0.08, w: 0.42, h: 0.16, fontSize: 12, bold: true, color: C.white, align: 'center', margin: 0 });
}

function notes(slide, lines) {
  if (typeof slide.addNotes === 'function') slide.addNotes(Array.isArray(lines) ? lines.join('\n') : lines);
}

function footerSource(slide, text) {
  slide.addText(text, { x: 0.62, y: 6.87, w: 11.8, h: 0.18, fontSize: 8, italic: true, color: '8992A3', margin: 0, fit: 'shrink' });
}

// 1 — Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.darkBg };
  slide.addShape(S.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.darkBg }, line: { color: C.darkBg } });
  slide.addShape(S.arc, { x: 8.7, y: -1.2, w: 5.8, h: 5.8, adjustPoint: 0.2, rotate: 20, fill: { color: C.blue, transparency: 65 }, line: { color: C.blue, transparency: 100 } });
  slide.addShape(S.arc, { x: 9.4, y: 3.4, w: 4.4, h: 4.4, rotate: 200, fill: { color: C.teal, transparency: 70 }, line: { color: C.teal, transparency: 100 } });
  pill(slide, 'ĐỒ ÁN TỐT NGHIỆP • 2026', 0.78, 0.74, 2.45, C.cyan, '14233A');
  slide.addText('Từ một con điểm\nđến bằng chứng đạt chuẩn đầu ra', { x: 0.78, y: 1.48, w: 8.6, h: 1.75, fontSize: 34, bold: true, color: C.white, margin: 0, breakLine: false, fit: 'shrink' });
  slide.addText('Thiết kế LMS hỗ trợ đánh giá theo Rubric gắn với CLO/OBE', { x: 0.82, y: 3.55, w: 7.7, h: 0.54, fontSize: 18, color: 'B9C7DE', margin: 0 });
  slide.addShape(S.line, { x: 0.82, y: 4.43, w: 6.9, h: 0, line: { color: '31415D', width: 1 } });
  slide.addText('SINH VIÊN: [HỌ VÀ TÊN]     •     GVHD: [HỌ VÀ TÊN]', { x: 0.82, y: 4.68, w: 7.1, h: 0.3, fontSize: 11, color: '8FA2BF', margin: 0 });
  // visual evidence chain
  const labels = ['BÀI LÀM', 'TIÊU CHÍ', 'RUBRIC', 'CLO', 'OBE'];
  labels.forEach((t, i) => {
    const x = 8.65 + (i % 2) * 1.72;
    const y = 1.2 + i * 0.95;
    box(slide, x, y, 1.48, 0.63, i === 4 ? C.teal : '15243B');
    slide.addText(t, { x, y: y + 0.2, w: 1.48, h: 0.2, fontSize: 11, bold: true, color: C.white, align: 'center', margin: 0 });
    if (i < 4) slide.addShape(S.line, { x: x + 0.74, y: y + 0.65, w: (i % 2 === 0 ? 1.72 : -1.72), h: 0.3, line: { color: C.cyan, width: 2, beginArrowType: 'none', endArrowType: 'triangle' } });
  });
  notes(slide, 'Mở bằng câu hỏi: Một sinh viên đạt 8 điểm. Nhưng 8 điểm đó chứng minh em ấy đạt chuẩn đầu ra nào, ở mức nào, và dựa trên bằng chứng nào?');
}

// 2 — Hook
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '01 • Vấn đề', 'Một con điểm chưa trả lời được câu hỏi quan trọng nhất', 'Điểm tổng cho biết kết quả cuối — nhưng có thể che khuất năng lực thành phần.');
  box(slide, 0.7, 2.05, 4.1, 3.85, C.navy);
  slide.addText('8.0', { x: 1.12, y: 2.46, w: 3.25, h: 1.45, fontSize: 78, bold: true, color: C.white, align: 'center', margin: 0 });
  slide.addText('ĐIỂM HỌC PHẦN', { x: 1.32, y: 4.22, w: 2.85, h: 0.28, fontSize: 13, bold: true, color: 'AFC2E4', align: 'center', margin: 0, charSpacing: 1.2 });
  slide.addText('Có vẻ rõ ràng…', { x: 1.32, y: 4.83, w: 2.85, h: 0.3, fontSize: 17, italic: true, color: C.cyan, align: 'center', margin: 0 });
  const qs = [
    ['Đạt CLO nào?', C.blue], ['Yếu ở tiêu chí nào?', C.orange],
    ['Ai đã duyệt thang đo?', C.purple], ['Có truy ngược được không?', C.teal]
  ];
  qs.forEach((q, i) => {
    const x = 5.35 + (i % 2) * 3.62, y = 2.18 + Math.floor(i / 2) * 1.72;
    box(slide, x, y, 3.2, 1.3, 'FFFFFF', 0.12, C.line);
    slide.addShape(S.ellipse, { x: x + 0.22, y: y + 0.3, w: 0.55, h: 0.55, fill: { color: q[1] }, line: { color: q[1] } });
    slide.addText('?', { x: x + 0.22, y: y + 0.4, w: 0.55, h: 0.2, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
    slide.addText(q[0], { x: x + 0.96, y: y + 0.39, w: 1.98, h: 0.42, fontSize: 15, bold: true, color: C.navy, margin: 0, fit: 'shrink' });
  });
  slide.addText('Khoảng trống của LMS không nằm ở việc “có điểm”, mà ở việc biến điểm thành bằng chứng có ý nghĩa.', { x: 5.38, y: 5.45, w: 6.78, h: 0.55, fontSize: 18, bold: true, color: C.red, margin: 0, fit: 'shrink' });
  footerSource(slide, 'Cơ sở: CHUONG_3_GIAI_PHAP_HIEU_CHINH.md — mục 3.2.2');
  notes(slide, 'Dừng 2 giây sau khi hiện “8.0”. Sau đó hỏi lần lượt bốn câu bên phải. Chốt: nếu không trả lời được, dữ liệu điểm chưa đủ phục vụ OBE.');
}

// 3 — Necessity
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '02 • Tính cấp thiết', 'Vì sao hệ thống này cần thiết ngay từ quy trình đánh giá?', 'Một LMS phục vụ OBE phải đồng thời tạo giá trị cho người học, giảng viên và đơn vị quản lý.');
  const cards = [
    { n: '01', t: 'Người học', d: 'Biết trước tiêu chuẩn chất lượng; nhận phản hồi cụ thể theo từng tiêu chí.', c: C.blue },
    { n: '02', t: 'Giảng viên', d: 'Chấm nhất quán hơn; giảm tổng hợp thủ công; thấy rõ điểm mạnh/yếu.', c: C.orange },
    { n: '03', t: 'Bộ môn / Khoa', d: 'Có dữ liệu trực tiếp về mức đạt CLO để theo dõi và cải tiến chương trình.', c: C.teal }
  ];
  cards.forEach((a, i) => {
    const x = 0.72 + i * 4.12;
    box(slide, x, 2.05, 3.72, 3.62, 'FFFFFF', 0.12, C.line);
    slide.addText(a.n, { x: x + 0.28, y: 2.33, w: 0.75, h: 0.48, fontSize: 26, bold: true, color: a.c, margin: 0 });
    slide.addShape(S.line, { x: x + 0.28, y: 2.92, w: 2.95, h: 0, line: { color: a.c, width: 3 } });
    slide.addText(a.t, { x: x + 0.28, y: 3.18, w: 2.95, h: 0.38, fontSize: 20, bold: true, color: C.navy, margin: 0 });
    slide.addText(a.d, { x: x + 0.28, y: 3.8, w: 3.05, h: 1.18, fontSize: 15, color: C.gray, breakLine: false, margin: 0.04, fit: 'shrink', valign: 'mid' });
  });
  box(slide, 1.44, 6.03, 10.35, 0.58, C.light);
  slide.addText('Nhu cầu cốt lõi: liên kết chuẩn đầu ra ↔ hoạt động đánh giá ↔ minh chứng, thay vì lưu chúng thành các mảnh rời.', { x: 1.72, y: 6.2, w: 9.8, h: 0.22, fontSize: 15, bold: true, color: C.blue, align: 'center', margin: 0, fit: 'shrink' });
  footerSource(slide, 'Cơ sở: constructive alignment và yêu cầu OBE trong tài liệu giải pháp của dự án.');
  notes(slide, 'Không dùng số liệu khảo sát nếu chưa có dữ liệu gốc. Trình bày nhu cầu dưới dạng yêu cầu nghiệp vụ và lợi ích cho ba nhóm người dùng.');
}

// 4 — Difficulty
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '03 • Điểm khó', 'Bài toán khó không phải là vẽ một bảng Rubric', 'Khó ở việc giữ cho toàn bộ chuỗi dữ liệu đúng, nhất quán và truy nguyên được qua thời gian.');
  const items = [
    ['01', 'Chuẩn hóa thang đo', 'Tiêu chí có trọng số, mức điểm và mô tả khác nhau; tổng trọng số phải hợp lệ.', C.orange],
    ['02', 'Ánh xạ nhiều–nhiều', 'Một tiêu chí có thể đo nhiều CLO; nếu phân bổ sai sẽ tính lặp minh chứng.', C.purple],
    ['03', 'Bảo toàn lịch sử', 'Rubric đã dùng để chấm không thể sửa đè làm thay đổi kết quả quá khứ.', C.red],
    ['04', 'Dữ liệu phân tán', 'Bài nộp, Rubric, điểm và thông báo nằm ở các miền dịch vụ khác nhau.', C.cyan]
  ];
  items.forEach((it, i) => {
    const x = 0.78 + (i % 2) * 6.08, y = 1.98 + Math.floor(i / 2) * 2.05;
    box(slide, x, y, 5.67, 1.62, 'FFFFFF', 0.1, C.line);
    slide.addText(it[0], { x: x + 0.25, y: y + 0.28, w: 0.62, h: 0.38, fontSize: 22, bold: true, color: it[3], margin: 0 });
    slide.addText(it[1], { x: x + 1.02, y: y + 0.25, w: 4.25, h: 0.36, fontSize: 17, bold: true, color: C.navy, margin: 0 });
    slide.addText(it[2], { x: x + 1.02, y: y + 0.76, w: 4.22, h: 0.55, fontSize: 12.5, color: C.gray, margin: 0, fit: 'shrink' });
  });
  slide.addText('Nếu một mắt xích sai, báo cáo OBE phía cuối có thể “đẹp” nhưng không còn đáng tin.', { x: 1.13, y: 6.08, w: 11.0, h: 0.44, fontSize: 20, bold: true, color: C.red, align: 'center', margin: 0 });
  notes(slide, 'Nhấn mạnh đây là bài toán dữ liệu và kiểm soát vòng đời, không chỉ là bài toán giao diện.');
}

// 5 — Research/design question
{
  const slide = pptx.addSlide();
  slide.background = { color: C.blue };
  slide.addText('CÂU HỎI THIẾT KẾ TRUNG TÂM', { x: 0.75, y: 0.78, w: 4.5, h: 0.25, fontSize: 11, bold: true, color: 'BFD1FF', charSpacing: 1.6, margin: 0 });
  slide.addText('Làm thế nào để biến mỗi lần chấm bài thành một bằng chứng chuẩn đầu ra có thể kiểm tra lại?', { x: 0.75, y: 1.55, w: 11.4, h: 1.62, fontSize: 36, bold: true, color: C.white, margin: 0, fit: 'shrink' });
  const tags = ['ĐÚNG PHIÊN BẢN', 'ĐÚNG TIÊU CHÍ', 'ĐÚNG TRỌNG SỐ', 'TRUY NGƯỢC ĐƯỢC'];
  tags.forEach((t, i) => pill(slide, t, 0.78 + i * 3.02, 4.16, 2.63, C.white, i === 3 ? C.teal : '3C68DD'));
  slide.addText('Đây là điểm xoay từ “vấn đề” sang “giải pháp”.', { x: 0.8, y: 5.68, w: 6.4, h: 0.34, fontSize: 16, color: 'D6E1FF', italic: true, margin: 0 });
  notes(slide, 'Đây là slide chuyển đoạn. Có thể nói: Từ câu hỏi này, nhóm lựa chọn Rubric phân tích và thiết kế chuỗi bằng chứng số hóa.');
}

// 6 — Thesis
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '04 • Giải pháp cốt lõi', 'Số hóa Rubric thành “xương sống” của chuỗi bằng chứng', 'Mỗi kết quả tổng hợp đều phải truy ngược về mức thể hiện đã chọn trên bài làm cụ thể.');
  const chain = [
    ['BÀI LÀM', 'Submission'], ['MỨC ĐẠT', 'Level'], ['TIÊU CHÍ', 'Criterion'],
    ['RUBRIC', 'Version'], ['CLO', 'Attainment'], ['BÁO CÁO', 'OBE']
  ];
  chain.forEach((a, i) => {
    const x = 0.62 + i * 2.06;
    const color = i === 5 ? C.teal : (i === 3 ? C.purple : C.blue);
    box(slide, x, 2.42, 1.68, 1.38, i === 5 ? 'E7F8F4' : 'FFFFFF', 0.1, i === 5 ? C.teal : C.line);
    slide.addText(a[0], { x: x + 0.12, y: 2.72, w: 1.44, h: 0.25, fontSize: 13, bold: true, color, align: 'center', margin: 0, fit: 'shrink' });
    slide.addText(a[1], { x: x + 0.12, y: 3.18, w: 1.44, h: 0.18, fontSize: 10, color: C.gray, align: 'center', margin: 0 });
    if (i < chain.length - 1) slide.addShape(S.line, { x: x + 1.7, y: 3.1, w: 0.37, h: 0, line: { color: C.blue, width: 2, endArrowType: 'triangle' } });
  });
  const principles = [
    ['Cấu trúc', 'Rubric = metadata + criteria + levels + mappings'],
    ['Vòng đời', 'Nháp → chờ duyệt → được duyệt → phiên bản mới'],
    ['Truy nguyên', 'Lưu rubricVersion và kết quả ở mức tiêu chí']
  ];
  principles.forEach((p, i) => {
    numCircle(slide, i + 1, 1.18 + i * 4.0, 4.75, [C.blue, C.purple, C.teal][i]);
    slide.addText(p[0], { x: 1.72 + i * 4.0, y: 4.72, w: 2.72, h: 0.3, fontSize: 15, bold: true, color: C.navy, margin: 0 });
    slide.addText(p[1], { x: 1.72 + i * 4.0, y: 5.18, w: 2.78, h: 0.62, fontSize: 11.5, color: C.gray, margin: 0, fit: 'shrink' });
  });
  footerSource(slide, 'Cơ sở: mô hình Rubric số và yêu cầu truy nguyên — Chương 3, mục 3.2.4.');
  notes(slide, 'Đây là câu trả lời ngắn gọn nhất của đề tài. Hãy mô tả từ trái sang phải, tránh đi sâu công nghệ ở slide này.');
}

// 7 — Scope
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '05 • Phạm vi hệ thống', 'LMS bao phủ vòng đời học tập, nhưng Rubric–OBE là trọng tâm', 'Các chức năng nền tạo ngữ cảnh; các chức năng đánh giá tạo khác biệt của đề tài.');
  box(slide, 0.76, 2.02, 3.1, 3.86, 'FFFFFF', 0.12, C.line);
  slide.addText('NỀN TẢNG LMS', { x: 1.12, y: 2.35, w: 2.35, h: 0.3, fontSize: 16, bold: true, color: C.gray, align: 'center', margin: 0 });
  ['Người dùng & phân quyền', 'Học phần & nội dung', 'Điểm danh QR/GPS', 'Bài tập & bài nộp', 'Thi & ngân hàng câu hỏi', 'Thông báo & trao đổi'].forEach((t, i) => {
    slide.addText('• ' + t, { x: 1.04, y: 2.95 + i * 0.44, w: 2.65, h: 0.22, fontSize: 12.5, color: C.gray, margin: 0 });
  });
  slide.addShape(S.chevron, { x: 4.22, y: 3.26, w: 0.8, h: 1.15, fill: { color: C.blue }, line: { color: C.blue } });
  box(slide, 5.38, 1.92, 6.78, 4.08, C.navy);
  slide.addText('TRỌNG TÂM ĐÁNH GIÁ', { x: 5.84, y: 2.28, w: 5.85, h: 0.34, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0 });
  const focus = [
    ['01', 'Quản lý CLO'], ['02', 'Thiết kế & duyệt Rubric'],
    ['03', 'Chấm theo tiêu chí'], ['04', 'Tổng hợp & xem OBE']
  ];
  focus.forEach((f, i) => {
    const x = 5.86 + (i % 2) * 2.92, y = 3.0 + Math.floor(i / 2) * 1.2;
    box(slide, x, y, 2.55, 0.88, i === 3 ? C.teal : '172A46');
    slide.addText(f[0], { x: x + 0.16, y: y + 0.24, w: 0.42, h: 0.2, fontSize: 12, bold: true, color: C.cyan, margin: 0 });
    slide.addText(f[1], { x: x + 0.64, y: y + 0.22, w: 1.7, h: 0.35, fontSize: 12.5, bold: true, color: C.white, margin: 0, fit: 'shrink' });
  });
  slide.addText('Thông điệp: không trình bày dàn đều mọi chức năng — ưu tiên chuỗi tạo bằng chứng.', { x: 1.1, y: 6.24, w: 11.25, h: 0.32, fontSize: 16, bold: true, color: C.blue, align: 'center', margin: 0 });
  footerSource(slide, 'Cơ sở: docs/use-cases/CHUC_NANG_CHINH_HE_THONG.md');
  notes(slide, 'Nếu thời gian ngắn, chỉ điểm qua khối bên trái trong 15–20 giây. Dành phần nói chính cho bốn chức năng bên phải.');
}

// 8 — Workflow
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '06 • Quy trình nghiệp vụ', 'Một vòng đánh giá khép kín từ thiết kế đến cải tiến', 'Vai trò được tách rõ: thiết kế — phê duyệt — thực hiện — phản hồi — theo dõi.');
  const steps = [
    ['1', 'Thiết lập\nCLO', C.blue], ['2', 'Tạo & ánh xạ\nRubric', C.purple],
    ['3', 'Phê duyệt\nphiên bản', C.orange], ['4', 'Nộp bài &\nchấm', C.cyan],
    ['5', 'Tính mức\nđạt CLO', C.teal], ['6', 'Báo cáo &\ncải tiến', C.red]
  ];
  steps.forEach((s, i) => {
    const x = 0.7 + i * 2.07;
    slide.addShape(S.ellipse, { x: x + 0.48, y: 2.28, w: 0.72, h: 0.72, fill: { color: s[2] }, line: { color: s[2] } });
    slide.addText(s[0], { x: x + 0.48, y: 2.5, w: 0.72, h: 0.2, fontSize: 16, bold: true, color: C.white, align: 'center', margin: 0 });
    slide.addText(s[1], { x, y: 3.28, w: 1.72, h: 0.72, fontSize: 14, bold: true, color: C.navy, align: 'center', margin: 0, breakLine: false, fit: 'shrink' });
    if (i < steps.length - 1) slide.addShape(S.line, { x: x + 1.22, y: 2.64, w: 0.87, h: 0, line: { color: C.line, width: 2.5, endArrowType: 'triangle' } });
  });
  const roles = [['GIẢNG VIÊN', 0.88, 4.64, 3.3, C.blue], ['TRƯỞNG BM / KHOA', 4.52, 4.64, 3.3, C.orange], ['SINH VIÊN', 8.16, 4.64, 3.3, C.teal]];
  roles.forEach(r => {
    box(slide, r[1], r[2], r[3], 1.05, 'FFFFFF', 0.1, C.line);
    slide.addShape(S.rect, { x: r[1], y: r[2], w: 0.1, h: 1.05, fill: { color: r[4] }, line: { color: r[4] } });
    slide.addText(r[0], { x: r[1] + 0.28, y: r[2] + 0.2, w: r[3] - 0.5, h: 0.24, fontSize: 12, bold: true, color: r[4], margin: 0 });
    slide.addText(r[0] === 'GIẢNG VIÊN' ? 'Thiết kế, giao bài, chấm và phản hồi' : r[0] === 'SINH VIÊN' ? 'Xem tiêu chuẩn, nộp bài, xem mức đạt' : 'Duyệt Rubric, theo dõi dữ liệu OBE', { x: r[1] + 0.28, y: r[2] + 0.56, w: r[3] - 0.5, h: 0.24, fontSize: 10.5, color: C.gray, margin: 0, fit: 'shrink' });
  });
  notes(slide, 'Dùng slide này làm bản đồ cho phần demo: đi từ bước 1 đến bước 6, mỗi màn hình demo phải gắn với một bước.');
}

// 9 — Versioned model
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '07 • Thiết kế dữ liệu', 'Rubric không còn là bảng tĩnh — mà là dữ liệu có phiên bản', 'Đây là cơ chế bảo toàn bằng chứng khi tiêu chí hoặc mức đánh giá thay đổi.');
  box(slide, 0.76, 2.0, 7.25, 3.95, 'FFFFFF', 0.12, C.line);
  const entities = [
    ['RUBRIC', 1.06, 2.45, C.blue], ['VERSION 1', 3.02, 2.05, C.purple], ['VERSION 2', 3.02, 3.15, C.teal],
    ['CRITERIA', 5.05, 2.05, C.orange], ['LEVELS', 5.05, 3.15, C.cyan], ['CLO MAPPING', 5.05, 4.25, C.red]
  ];
  entities.forEach(e => {
    box(slide, e[1], e[2], 1.55, 0.68, e[3]);
    slide.addText(e[0], { x: e[1] + 0.08, y: e[2] + 0.22, w: 1.39, h: 0.18, fontSize: 10.5, bold: true, color: C.white, align: 'center', margin: 0, fit: 'shrink' });
  });
  [[2.62,2.79,0.4,-0.4],[2.62,2.79,0.4,0.7],[4.58,2.39,0.47,0],[4.58,3.49,0.47,0],[4.58,3.49,0.47,1.1]].forEach(l => slide.addShape(S.line, { x:l[0], y:l[1], w:l[2], h:l[3], line:{ color:C.gray, width:1.6, endArrowType:'triangle' } }));
  box(slide, 8.45, 2.0, 3.85, 3.95, C.navy);
  slide.addText('QUY TẮC BẢO TOÀN', { x: 8.85, y: 2.36, w: 3.05, h: 0.28, fontSize: 15, bold: true, color: C.cyan, align: 'center', margin: 0 });
  const rules = [
    'Rubric đã dùng để chấm không sửa đè',
    'Thay đổi tạo phiên bản mới',
    'Kết quả lưu đúng rubricVersion',
    'Mức chọn phải thuộc đúng tiêu chí'
  ];
  rules.forEach((r, i) => {
    slide.addShape(S.ellipse, { x: 8.86, y: 3.05 + i * 0.62, w: 0.26, h: 0.26, fill: { color: C.teal }, line: { color: C.teal } });
    slide.addText('✓', { x: 8.86, y: 3.09 + i * 0.62, w: 0.26, h: 0.12, fontSize: 9, bold: true, color: C.white, align: 'center', margin: 0 });
    slide.addText(r, { x: 9.3, y: 3.02 + i * 0.62, w: 2.55, h: 0.31, fontSize: 11.5, color: C.white, margin: 0, fit: 'shrink' });
  });
  footerSource(slide, 'Cơ sở: RubricVersion, CriterionLOMapping, LOAttainmentEvidence trong thiết kế đề xuất.');
  notes(slide, 'Giải thích bằng ví dụ: tiêu chí thay đổi ở học kỳ sau thì kết quả học kỳ trước vẫn trỏ về phiên bản cũ.');
}

// 10 — Calculation
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '08 • Xử lý nghiệp vụ', 'Từ mức Rubric đến phần trăm đạt CLO', 'Chuẩn hóa điểm tiêu chí, áp dụng trọng số và hệ số ánh xạ; không suy ra CLO chỉ từ điểm tổng.');
  const flow = [
    ['Mức được chọn', '3 / 4 điểm'], ['Chuẩn hóa', '75%'], ['× trọng số', '30%'], ['× ánh xạ CLO', 'CLO2: 0,6'], ['Tổng hợp', 'Mức đạt CLO']
  ];
  flow.forEach((f, i) => {
    const x = 0.68 + i * 2.47;
    box(slide, x, 2.28, 2.03, 1.38, i === 4 ? 'E7F8F4' : 'FFFFFF', 0.1, i === 4 ? C.teal : C.line);
    slide.addText(f[0], { x: x + 0.12, y: 2.55, w: 1.79, h: 0.3, fontSize: 12.5, bold: true, color: i === 4 ? C.teal : C.navy, align: 'center', margin: 0, fit: 'shrink' });
    slide.addText(f[1], { x: x + 0.12, y: 3.08, w: 1.79, h: 0.24, fontSize: 11, color: C.gray, align: 'center', margin: 0 });
    if (i < 4) slide.addShape(S.chevron, { x: x + 2.08, y: 2.74, w: 0.36, h: 0.46, fill: { color: C.blue }, line: { color: C.blue } });
  });
  box(slide, 1.08, 4.4, 11.08, 1.18, C.navy);
  slide.addText('A(CLO) =  Σ [trọng số tiêu chí × hệ số ánh xạ × % đạt tiêu chí]  /  Σ [trọng số × hệ số]', { x: 1.5, y: 4.74, w: 10.25, h: 0.36, fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0, fit: 'shrink' });
  slide.addText('Ba nguyên tắc: xác định • không tính lặp • truy nguyên được', { x: 2.3, y: 6.03, w: 8.75, h: 0.3, fontSize: 15, bold: true, color: C.blue, align: 'center', margin: 0 });
  footerSource(slide, 'Cơ sở: công thức 3.2–3.5 trong CHUONG_3_GIAI_PHAP_HIEU_CHINH.md.');
  notes(slide, 'Không cần chứng minh công thức dài trên slide. Chỉ giải thích luồng biến đổi và ba nguyên tắc. Nếu hội đồng hỏi sâu, mở phụ lục công thức.');
}

// 11 — Architecture
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '09 • Kiến trúc', 'Tách theo miền nghiệp vụ để mỗi loại dữ liệu có chủ sở hữu rõ ràng', 'API Gateway là điểm vào thống nhất; các service trao đổi bằng API và giữ dữ liệu của mình.');
  box(slide, 0.78, 2.0, 1.7, 3.85, C.navy);
  slide.addText('WEB\nREACT', { x: 1.02, y: 3.03, w: 1.2, h: 0.68, fontSize: 19, bold: true, color: C.white, align: 'center', margin: 0 });
  slide.addShape(S.chevron, { x: 2.73, y: 3.25, w: 0.65, h: 0.75, fill: { color: C.blue }, line: { color: C.blue } });
  box(slide, 3.65, 2.0, 1.72, 3.85, C.blue);
  slide.addText('API\nGATEWAY', { x: 3.95, y: 3.03, w: 1.12, h: 0.68, fontSize: 17, bold: true, color: C.white, align: 'center', margin: 0 });
  const services = [
    ['USER', C.blue], ['COURSE', C.cyan], ['RUBRIC', C.purple], ['GRADING', C.orange], ['NOTIFY', C.teal]
  ];
  services.forEach((s, i) => {
    const x = 6.02 + (i % 2) * 2.5, y = 1.92 + Math.floor(i / 2) * 1.44;
    box(slide, x, y, 2.1, 0.86, 'FFFFFF', 0.1, s[1]);
    slide.addText(s[0] + ' SERVICE', { x: x + 0.12, y: y + 0.18, w: 1.86, h: 0.22, fontSize: 11.5, bold: true, color: s[1], align: 'center', margin: 0 });
    slide.addText('DB sở hữu riêng', { x: x + 0.12, y: y + 0.5, w: 1.86, h: 0.15, fontSize: 8.5, color: C.gray, align: 'center', margin: 0 });
    slide.addShape(S.line, { x: 5.38, y: 3.92, w: x - 5.38, h: y + 0.43 - 3.92, line: { color: C.line, width: 1.2, endArrowType: 'triangle' } });
  });
  box(slide, 11.03, 2.65, 1.47, 2.2, 'EEF3FF', 0.1, C.blue);
  slide.addText('EUREKA\n\nJWT\n\nLOG', { x: 11.18, y: 2.96, w: 1.17, h: 1.52, fontSize: 11, bold: true, color: C.blue, align: 'center', margin: 0 });
  slide.addText('Lợi ích trực tiếp cho bài toán: tách Rubric khỏi điểm, nhưng vẫn liên kết bằng ID và API để bảo toàn chuỗi bằng chứng.', { x: 1.15, y: 6.18, w: 11.0, h: 0.37, fontSize: 14.5, bold: true, color: C.blue, align: 'center', margin: 0, fit: 'shrink' });
  footerSource(slide, 'Cơ sở: kiến trúc 5 service trong compose và tài liệu kiến trúc mục tiêu.');
  notes(slide, 'Không kể tên công nghệ như danh sách. Mỗi thành phần phải gắn với một lý do: Gateway cho điểm vào chung; service ownership cho ranh giới dữ liệu; Eureka cho định vị dịch vụ.');
}

// 12 — Demo script
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '10 • Kịch bản trình diễn', 'Demo theo một câu chuyện xuyên suốt, không nhảy màn hình', 'Tình huống: đánh giá bài báo cáo kỹ thuật và xác định mức đạt CLO2 của sinh viên.');
  const demo = [
    ['01', 'Tạo CLO2', 'Đặt mô tả và ngưỡng đạt'],
    ['02', 'Thiết kế Rubric', 'Tiêu chí, mức, trọng số'],
    ['03', 'Ánh xạ & duyệt', 'Gắn tiêu chí với CLO2'],
    ['04', 'Chấm bài', 'Chọn mức và nhập phản hồi'],
    ['05', 'Xem kết quả', 'Điểm bài + mức đạt CLO2']
  ];
  demo.forEach((d, i) => {
    const y = 1.98 + i * 0.9;
    numCircle(slide, i + 1, 0.95, y + 0.08, i === 4 ? C.teal : C.blue);
    slide.addText(d[1], { x: 1.58, y: y, w: 2.45, h: 0.28, fontSize: 15, bold: true, color: C.navy, margin: 0 });
    slide.addText(d[2], { x: 1.58, y: y + 0.4, w: 3.0, h: 0.22, fontSize: 11.5, color: C.gray, margin: 0 });
    if (i < 4) slide.addShape(S.line, { x: 1.16, y: y + 0.52, w: 0, h: 0.5, line: { color: C.line, width: 2 } });
  });
  box(slide, 5.05, 2.0, 7.1, 4.2, C.navy);
  slide.addText('QUY TẮC DEMO 3–5 PHÚT', { x: 5.52, y: 2.4, w: 6.15, h: 0.32, fontSize: 16, bold: true, color: C.cyan, align: 'center', margin: 0 });
  const tips = [
    'Chuẩn bị sẵn học phần, sinh viên và bài nộp mẫu.',
    'Chỉ nhập trực tiếp một thay đổi có ý nghĩa.',
    'Luôn chỉ ra dữ liệu vừa tạo xuất hiện ở bước sau.',
    'Kết thúc bằng màn hình OBE — quay lại câu hỏi mở đầu.'
  ];
  tips.forEach((t, i) => {
    slide.addText(String(i + 1).padStart(2, '0'), { x: 5.65, y: 3.18 + i * 0.62, w: 0.45, h: 0.22, fontSize: 11, bold: true, color: C.teal, margin: 0 });
    slide.addText(t, { x: 6.24, y: 3.13 + i * 0.62, w: 5.25, h: 0.35, fontSize: 12.5, color: C.white, margin: 0, fit: 'shrink' });
  });
  notes(slide, 'Đây là slide dẫn vào demo thật. Nếu demo lỗi, dùng chính slide này để kể lại luồng và vẫn giữ được mạch lập luận.');
}

// 13 — Current status
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '11 • Kết quả & giới hạn', 'Phân biệt rõ phần đã có và phần cần hoàn thiện', 'Trình bày trung thực giúp giá trị của đóng góp kỹ thuật rõ hơn.');
  box(slide, 0.8, 2.0, 5.65, 3.95, 'EAF8F4', 0.12, 'B9E5D9');
  slide.addText('ĐÃ CÓ NỀN TẢNG', { x: 1.18, y: 2.38, w: 4.9, h: 0.32, fontSize: 17, bold: true, color: C.teal, align: 'center', margin: 0 });
  ['Microservice cho Rubric', 'CRUD Rubric–criteria–level–CLO', 'Đồng bộ ma trận theo transaction', 'Giao tiếp Rubric ↔ Grading', 'Giao diện CLO / Rubric / OBE'].forEach((t, i) => {
    slide.addText('✓', { x: 1.28, y: 3.02 + i * 0.48, w: 0.28, h: 0.2, fontSize: 13, bold: true, color: C.teal, margin: 0 });
    slide.addText(t, { x: 1.7, y: 3.0 + i * 0.48, w: 3.95, h: 0.25, fontSize: 12.5, color: C.navy, margin: 0 });
  });
  box(slide, 6.87, 2.0, 5.65, 3.95, 'FFF5E8', 0.12, 'F8D6A2');
  slide.addText('CẦN HOÀN THIỆN / KIỂM CHỨNG', { x: 7.22, y: 2.38, w: 4.95, h: 0.32, fontSize: 17, bold: true, color: C.orange, align: 'center', margin: 0, fit: 'shrink' });
  ['Thuật toán tính điểm Rubric end-to-end', 'Phiên bản hóa đầy đủ trong mọi luồng', 'Dữ liệu kiểm thử OBE thực tế', 'Kiểm thử tải và lỗi liên service', 'Đo tác động với người dùng'].forEach((t, i) => {
    slide.addText('→', { x: 7.34, y: 3.02 + i * 0.48, w: 0.3, h: 0.2, fontSize: 13, bold: true, color: C.orange, margin: 0 });
    slide.addText(t, { x: 7.78, y: 3.0 + i * 0.48, w: 3.98, h: 0.25, fontSize: 12.5, color: C.navy, margin: 0, fit: 'shrink' });
  });
  slide.addText('Không đánh đồng “thiết kế đề xuất” với “đã triển khai hoàn chỉnh”.', { x: 1.65, y: 6.28, w: 10.1, h: 0.32, fontSize: 16, bold: true, color: C.red, align: 'center', margin: 0 });
  footerSource(slide, 'Đối chiếu: RUBRIC_TECHNOLOGY_AND_ALGORITHMS.md và tài liệu giải pháp hiệu chỉnh.');
  notes(slide, 'Điểm cộng ở slide này là sự trung thực. Nếu một chức năng đã được nhóm hoàn thiện sau tài liệu, cập nhật cột tương ứng trước khi bảo vệ.');
}

// 14 — Contributions
{
  const slide = pptx.addSlide('CONTENT');
  addTitle(slide, '12 • Đóng góp', 'Giá trị của đề tài nằm ở chuỗi liên kết, không ở từng màn hình riêng lẻ', 'Bốn đóng góp nên được trình bày như một hệ thống thống nhất.');
  const contrib = [
    ['01', 'Mô hình Rubric số', 'Tiêu chí, mức, trọng số, ánh xạ, phiên bản và trạng thái.', C.blue],
    ['02', 'Chuỗi bằng chứng', 'Bài làm → kết quả tiêu chí → mức đạt CLO có thể truy nguyên.', C.teal],
    ['03', 'Quy trình có kiểm soát', 'Thiết kế, phê duyệt, công bố, chấm và phản hồi theo vai trò.', C.orange],
    ['04', 'Kiến trúc mở rộng', 'Tách miền người dùng, học phần, Rubric, chấm điểm và thông báo.', C.purple]
  ];
  contrib.forEach((c, i) => {
    const x = 0.78 + (i % 2) * 6.05, y = 2.02 + Math.floor(i / 2) * 2.0;
    box(slide, x, y, 5.62, 1.55, 'FFFFFF', 0.12, C.line);
    slide.addText(c[0], { x: x + 0.25, y: y + 0.3, w: 0.65, h: 0.4, fontSize: 24, bold: true, color: c[3], margin: 0 });
    slide.addText(c[1], { x: x + 1.15, y: y + 0.26, w: 4.0, h: 0.32, fontSize: 16, bold: true, color: C.navy, margin: 0 });
    slide.addText(c[2], { x: x + 1.15, y: y + 0.78, w: 4.0, h: 0.45, fontSize: 11.5, color: C.gray, margin: 0, fit: 'shrink' });
  });
  box(slide, 1.6, 6.12, 10.05, 0.5, C.navy);
  slide.addText('Từ quản lý học tập → quản lý bằng chứng học tập', { x: 1.85, y: 6.27, w: 9.55, h: 0.2, fontSize: 16, bold: true, color: C.white, align: 'center', margin: 0 });
  notes(slide, 'Đây là slide trả lời câu hỏi “đề tài của em mới/đáng giá ở đâu?”. Chốt bằng chuyển dịch từ quản lý hoạt động sang quản lý bằng chứng.');
}

// 15 — Conclusion
{
  const slide = pptx.addSlide();
  slide.background = { color: C.darkBg };
  pill(slide, 'KẾT LUẬN', 0.78, 0.72, 1.35, C.cyan, '14233A');
  slide.addText('Hệ thống không chỉ trả lời\n“sinh viên được bao nhiêu điểm?”', { x: 0.78, y: 1.5, w: 7.15, h: 1.2, fontSize: 30, bold: true, color: C.white, margin: 0, fit: 'shrink' });
  slide.addText('Mà còn trả lời:', { x: 0.8, y: 3.1, w: 2.6, h: 0.34, fontSize: 16, color: 'AFC2E4', margin: 0 });
  const lines = ['Đạt chuẩn đầu ra nào?', 'Ở mức nào?', 'Dựa trên tiêu chí và bằng chứng nào?'];
  lines.forEach((t, i) => {
    slide.addShape(S.line, { x: 0.84, y: 3.82 + i * 0.62, w: 0.44, h: 0, line: { color: C.teal, width: 4 } });
    slide.addText(t, { x: 1.48, y: 3.68 + i * 0.62, w: 5.55, h: 0.33, fontSize: 18, bold: true, color: C.white, margin: 0 });
  });
  box(slide, 8.35, 1.4, 3.85, 4.55, '14233A');
  slide.addText('Q&A', { x: 8.7, y: 2.35, w: 3.15, h: 1.05, fontSize: 54, bold: true, color: C.cyan, align: 'center', margin: 0 });
  slide.addText('Xin cảm ơn Hội đồng', { x: 8.78, y: 4.18, w: 3.0, h: 0.35, fontSize: 16, color: C.white, align: 'center', margin: 0 });
  slide.addText('[email / mã QR demo nếu cần]', { x: 8.78, y: 4.78, w: 3.0, h: 0.25, fontSize: 10, color: '8FA2BF', align: 'center', margin: 0 });
  slide.addText('Thông điệp chốt: Rubric là cầu nối giữa hoạt động đánh giá và dữ liệu OBE.', { x: 0.8, y: 6.62, w: 7.1, h: 0.3, fontSize: 13, color: '8FA2BF', italic: true, margin: 0 });
  notes(slide, 'Quay lại đúng câu hỏi ở slide 2. Kết thúc trong một câu, sau đó dừng và mời Hội đồng đặt câu hỏi.');
}

const outDir = path.join(__dirname, '..', 'docs', 'presentation');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'LMS_Rubric_OBE_MoDauTrongTam.pptx');
pptx.writeFile({ fileName: outFile });
console.log(outFile);
