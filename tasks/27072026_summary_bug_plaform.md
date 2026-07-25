final_project_ai/tasks/img/bug_analystic_01.png
chỗ này Row #0
ko biết được row) có giá trị là gì, column nào của row ) bị lỗi

Root cause của bug Row #0
Tôi đã fetch trực tiếp response /api/v1/analysis/8/results và so sánh Row #0 với Row #1. Bug bạn thấy không phải lỗi UI — nó là hệ quả trực tiếp của 3 điểm P0/P1 trong bảng của bạn kết hợp lại.
Dữ liệu thực tế của Row #0 (từ API):
{ "score": 0.762677, "is_anomaly": false,
  "reason": null, "top_fields": [], "deviations": {},
  "actual_values": {}, "expected_range": {}, "feature_contributions": [] }
So với Row #1: is_anomaly: true, top_fields có 3 field, deviations/actual_values đầy đủ.
Thống kê trên toàn bộ 340 dòng: 324/340 dòng có top_fields, deviations, actual_values đều rỗng và is_anomaly=false. Chỉ 16 dòng có nội dung thật — trùng khớp anomaly_count=16 và is_anomaly_true_count=16.
Ba vấn đề gộp lại tạo ra màn hình này
1. Panel hiển thị dòng không phải anomaly (đúng cái 16 vs 25 trong bảng của bạn). Row #0 có score=0.762677 (≥ 0.7) nên lọt vào đường InsightCard/heatmap (page.tsx:556), nhưng is_anomaly=false (page.tsx:415). Vì backend chỉ populate top_fields/deviations/actual_values cho 16 dòng is_anomaly=true, nên khi mở panel cho Row #0, code không có field nào để render → rơi vào nhánh fallback "No specific fields stood out — this row was flagged based on its overall pattern". Nhưng nó vẫn gắn "HIGH RISK / OPEN" vì risk level tính theo score, không theo is_anomaly. Người dùng thấy "HIGH RISK" mà không có gì để review → đúng như bạn nói: "không biết row có giá trị gì, column nào bị lỗi".

2. Ngay cả 16 dòng "có nội dung" cũng không show giá trị gốc. actual_values của Row #1 là 18.41 / -18.41 / 18.41 với expected_range.kind="numeric", mean=0, std=1 — đây là z-score, không phải giá trị gốc. Đó chính là bug ai_service.py:513-520: fallback trả kind:"numeric" nên z-score bị trình bày như dữ liệu gốc ("CURRENT 18.41 / EXPECTED −2…2"). "Currency Code" là cột categorical mà lại hiện ±18.41 — vô nghĩa với người không chuyên. Giá trị thật (vd. mã tiền tệ "USD") không bao giờ được đưa ra UI.
3. Màn analytic không có nguồn dữ liệu để hiển thị row gốc. Trang chỉ gọi đúng một endpoint /api/v1/analysis/8/results. Endpoint này hoàn toàn không chứa giá trị row gốc — chỉ có score + deviation. Các endpoint preview/summary, preview/row, preview/cell, profile (M8/M3) đều trả 404 ở đường tôi thử và không được gọi từ màn này. Đây chính là điểm #5 bảng của bạn: unified feed chưa được nối vào analytic screen, nên UI về mặt kiến trúc không có cách nào biết Row #0 chứa gì.
Vì sao Row #0 "trống" còn Row #1 "đầy"
Backend chỉ tính và gắn top_fields/actual_values/deviations cho các dòng vượt ngưỡng anomaly thật (16 dòng). 324 dòng còn lại — bao gồm Row #0 — vẫn được gửi kèm score và vẫn được frontend vẽ lên heatmap + mở được panel, nhưng payload rỗng. Panel không phân biệt "dòng bình thường bị click nhầm vào" với "anomaly thật thiếu field nổi bật", nên cả hai đều ra cùng một câu "flagged based on overall pattern".
Hướng sửa (theo đúng expectation của bạn)
Fix nên gồm ba lớp, không chỉ vá câu chữ:
Trước hết, thống nhất một định nghĩa "critical" là is_anomaly ở cả header và InsightCard/heatmap (bỏ nhánh score >= 0.7 ở page.tsx:556). Khi đó Row #0 (is_anomaly=false) sẽ không còn mở ra như một case "HIGH RISK / OPEN" cần review, loại bỏ toàn bộ tình huống panel-rỗng.
Thứ hai, để người dùng thấy được row gốc và cột nào lỗi, nối preview/summary + preview/cell + profile vào lib/api.ts và màn analytic (M8/M3 đã có ở backend nhưng nằm ở đường import grid). Drill-down cần hiển thị giá trị gốc của dòng (PlainLanguageSummary mặc định), z-score/feature contribution để sau toggle Advanced — đúng FR-D2 + review 18/07 §5.
Thứ ba, sửa fallback normalizer đánh dấu kind:"opaque" (ai_service.py:513-520) để categorical như "Currency Code" không hiện z-score giả dạng giá trị gốc; Expected-vs-actual chỉ hiện khi có giá trị gốc thật.


## Row1
Đối chiếu trực quan Row #0 vs Row #1
Row #1 (panel đầy đủ): 3 field — Currency Code, Address - City, Address - Country — mỗi field hiện CURRENT VALUE 18.41 / −18.41 / 18.41 với EXPECTED −2 — 2. Nhưng như đã phân tích, các con số này là z-score, không phải giá trị gốc (kind:"numeric", mean=0, std=1). "Currency Code" là cột chuỗi mà lại hiện ±18.41 — người không chuyên không hiểu nổi.
Row #0 (panel rỗng): gắn "HIGH RISK / OPEN" + "No specific fields stood out — this row was flagged based on its overall pattern". Mở luôn ADVANCED DETAILS cũng chỉ có: "No top fields available", "No contributions available", và "Internal score: 0.7627". Không có giá trị dòng, không có tên cột, không có gì để review — đúng như bạn mô tả: không biết row #0 có giá trị gì, cột nào lỗi.
Nguyên nhân đã confirm ở API: Row #0 có score=0.7627 (≥0.7 nên lọt vào heatmap/panel) nhưng is_anomaly=false, và backend chỉ populate top_fields/deviations/actual_values cho 16 dòng is_anomaly=true. 324/340 dòng còn lại rỗng nhưng vẫn mở panel được và vẫn dán nhãn HIGH RISK.
Route thật của preview/profile (đã test 200)
Các endpoint M8/M3 tồn tại và trả dữ liệu thật, nhưng nằm dưới prefix /api/v1/datasets/{dataset_id}/... chứ không phải /analysis/{id}/... — nên màn analytic (chỉ gọi /analysis/8/results) không chạm tới. Đây chính là "nằm ở đường import (grid), không nối vào màn analytic" trong bảng của bạn.
Các route liên quan (từ OpenAPI, 108 paths tổng cộng):
Mục đíchRoute thậtTest với dataset_id=9Headline tri-state cấp dòng (M8 §3.1)/api/v1/datasets/{id}/preview/summary200 → {total:340, ok:340, warning:0, error:0}Data health per column (M3 §3.5)/api/v1/datasets/{id}/profile200 → overall_health, columns, worst_columnsGiá trị dòng gốc/api/v1/datasets/{id}/raw-grid200 → rows có header thật + value thậtCell annotation (M8 §3.2)/api/v1/datasets/{id}/preview/cell , /cellcó routeValidate cells/api/v1/datasets/{id}/validate/cellscó routeIssues navigation (FR §3)/api/v1/datasets/{id}/issues/next , /issues/summarycó routeSmart grid/api/v1/datasets/{id}/gridcó route (cần param)
Bằng chứng dữ liệu gốc tồn tại: raw-grid của dataset 9 trả về header thật — "Transaction No", "Currency Code", "Address"… và toàn bộ 340 dòng value. Nghĩa là giá trị Row #0 hoàn toàn lấy được; nó chỉ đơn giản là không được nối vào panel.
Một lưu ý đáng chú ý: preview/summary báo ok:340, warning:0, error:0 (tri-state theo validation), trong khi header analytic báo 16 critical anomalies. Hai đường signal (TDM validation vs anomaly) đang chạy song song và cho hai con số khác nhau trên cùng một dataset — đúng điểm mâu thuẫn "hai đường review song song" ở mục 5 của bạn.
Ánh xạ sang fix
Với dataset_id đã có sẵn trong response /analysis/8/results (dataset_id: 9), việc nối là khả thi ngay: thêm getDatasetProfile, getPreviewSummary, getRawGrid, getPreviewCell vào lib/api.ts trỏ tới /api/v1/datasets/{dataset_id}/..., rồi trong drill-down panel:
Khi mở Row #N, gọi raw-grid (hoặc preview/cell) để hiển thị giá trị gốc của dòng và tên cột thay vì để trống. Với dòng is_anomaly=false như Row #0, không dán "HIGH RISK" nữa (thống nhất tiêu chí is_anomaly ở cả header lẫn heatmap/InsightCard). Và sửa ai_service.py gắn kind:"opaque" cho fallback để cột categorical không hiện z-score giả dạng giá trị gốc.
Bạn muốn tôi kiểm tra tiếp cấu trúc chi tiết của profile.columns (health_score, flags như HIGH_NULL/VARIANT_VALUES) và preview/cell để xác định đúng shape dữ liệu cần map vào panel không?

##
Dữ liệu thật vừa lấy được cho một ví dụ hoàn hảo để định hình UI/UX. Với Row #1, cột "Currency Code" thực tế là giá trị "THB", trong khi 28/29 dòng là "SGD" — đây là rare value của một cột categorical. Nhưng panel hiện tại lại hiện "18.41 / expected −2 — 2". Còn Row #0 thì currency là "SGD" (giá trị bình thường) mà vẫn bị dán HIGH RISK. Đó là kim chỉ nam cho toàn bộ thiết kế dưới đây.
Nguyên tắc gốc
Panel drill-down phải trả lời đúng 3 câu, theo thứ tự người không chuyên ML đọc được (NFR5 / FR-D2):
Đầu tiên: "Dòng này chứa gì?" — hiện snapshot giá trị gốc của dòng (từ raw-grid), đây là thứ đang thiếu hoàn toàn. Tiếp theo: "Cột nào bất thường và bất thường thế nào?" — bằng ngôn ngữ giá trị thật ("Currency Code = THB, hiếm — chỉ 1/29 dòng"), không phải z-score. Cuối cùng mới đến: "Vì sao máy flag / độ tin cậy / hành động" — z-score, feature contribution nằm sau toggle Advanced.
Ba trạng thái panel phải phân biệt rõ
## Bug hiện tại gộp cả ba làm một câu "flagged based on overall pattern". Cần tách:
Trạng thái A — Anomaly có field cụ thể (Row #1, is_anomaly=true + top_fields không rỗng). Đây là case giá trị nhất. Layout đề xuất: header risk badge → danh sách field lỗi, mỗi field một card gồm tên cột · giá trị gốc thật · vì sao bất thường (diễn giải) · gợi ý sửa. Với categorical thì hiện "THB (hiếm — 1/29 dòng, 96% là SGD)" thay vì z-score; với numeric thật mới hiện range. Advanced Details chứa z-score/contribution.
Trạng thái B — Anomaly nhưng không field nào nổi bật (is_anomaly=true, top_fields rỗng). Vẫn hợp lệ hiển thị "flagged based on overall pattern" — nhưng kèm snapshot giá trị dòng để người review tự soi. Đừng để trống. Có thể hiện 5–8 cột "kém khỏe nhất" (từ profile.worst_columns) của chính dòng đó để định hướng.
Trạng thái C — KHÔNG phải anomaly (Row #0, is_anomaly=false). Đây là gốc bug UX: không được dán "HIGH RISK". Nếu người dùng vẫn click vào ô heatmap có score cao nhưng dưới ngưỡng, panel nên nói thẳng: "Dòng này KHÔNG được đánh dấu bất thường (score 0.76, dưới ngưỡng 0.48… thực ra trên — cần thống nhất tiêu chí is_anomaly)". Thống nhất: risk badge tính theo is_anomaly, không theo score >= 0.7. Khi đó Row #0 hết bị mở ra như case cần điều tra.
Cấu trúc thông tin đề xuất (từ trên xuống)
Header giữ nguyên: Row #N + badge trạng thái + risk (theo is_anomaly). Ngay dưới đó thêm một khối mới — "Row snapshot": bảng gọn 5–10 cột quan trọng của dòng với giá trị gốc, cột nào lỗi thì tô đỏ/vàng inline. Đây là thứ giải quyết trực tiếp câu "không biết row có giá trị gì". Nguồn: raw-grid (đã trả 200, có header + value thật).
"Possible Issue Found" giữ lại nhưng đổi cách diễn đạt sang giá trị thật. Thay "Currency Code is much higher than usual" (sai, vì categorical) bằng "Currency Code = THB — giá trị hiếm (1/29 dòng)". Điều này khớp luật FR-D7→D10 đã chốt: categorical dùng Unseen/Rare/Uncommon, không z-score.
Card từng field: hiện CURRENT VALUE = giá trị gốc ("THB", "SGD"), không phải 18.41. EXPECTED chỉ hiện range số khi cột thật sự numeric (kind khác opaque); với categorical thì hiện "phổ biến: SGD (96%)". Đây cần fix kind:"opaque" ở backend để UI biết khi nào KHÔNG render range.
Data health ở header cột: tận dụng profile.columns (đã có health_score, null_pct, unique_pct, flags, distribution) để tô xanh/vàng/đỏ — đúng M3 §3.5.
Advanced Details (toggle): z-score, feature contribution, internal score — giữ như hiện tại nhưng chỉ là tầng phụ.
Hai điểm UX cần chốt (liên quan mục 5 của bạn)
preview/summary trả ok:340, warning:0, error:0 trong khi header analytic báo 16 critical anomalies — hai đường validation (TDM) và anomaly đang cho hai con số trên cùng dataset. Nếu hợp nhất thành một smart table duy nhất (kiểu Ingestro), panel drill-down nên là một view thống nhất: mỗi dòng/cell mang annotation với source = validation | duplicate | suggestion | profile, badge màu theo source. Chừng nào chưa chốt hợp nhất, mọi thiết kế lại panel sẽ bị treo — nên đây là quyết định kiến trúc cần ra trước khi code UI.
Về "HIGH RISK" trên dòng không anomaly: đây gần như chắc chắn là bug, không phải chủ ý — nên fix bằng cách thống nhất một định nghĩa is_anomaly.

Phát hiện then chốt: hai path không cùng schema
preview/cell, grid, validate/cells đều trả lỗi "Dataset has no confirmed TDM mapping". Nghĩa là toàn bộ nhánh smart table (M8/M3) yêu cầu dataset phải qua bước TDM mapping trước, còn nhánh anomaly (/analysis/8/results) thì chạy độc lập, không cần mapping. Dataset 9 có anomaly result nhưng chưa có TDM mapping → nên nửa smart table "chết".
Bằng chứng rõ hơn: issues/next trả column_key: "invoice_amount" — một cột không tồn tại trong dataset này (dataset thật có "Currency Code", "Price", "Transaction No"…). Còn issues/summary trả total_issues: 0. Nghĩa là validation feed đang trỏ vào một schema chuẩn hóa (TDM canonical như invoice_amount) khác hoàn toàn với tên cột gốc mà anomaly dùng ("Currency Code"). Đây chính là lý do "hai đường song song" ở mục 5 của bạn không thể ghép đơn giản ở tầng UI — chúng khác cả khóa định danh cột lẫn điều kiện tồn tại dữ liệu.
Ba schema annotation hiện tại (không tương thích)
NguồnĐịnh danhShape annotationĐiều kiệnAnomaly (/analysis/results)row_id (int) + tên cột gốc "Currency Code"deviations{z, pct_from_mean}, expected_range{low,high,kind,mean,std}, top_fields[], actual_values{}Không cần TDMValidation/Issues (/issues/*, /grid)row + column_key canonical ("invoice_amount")by_column{}, by_issue_type{} (severity, issue_type)Cần TDM mappingProfile (/profile)column.name gốchealth_score, null_pct, unique_pct, flags[], distribution[]Không cần TDM
Ba nguồn dùng ba khóa cột khác nhau (tên gốc vs canonical), ba shape khác nhau. Anomaly còn để expected_range.kind:"numeric" cho cả categorical (bug z-score). Không có trường source/severity chung nào.
Đề xuất: Unified Cell Annotation schema
Để có smart table duy nhất, cần một adapter layer chuẩn hóa cả ba (bốn) nguồn về một annotation shape. Đề xuất tối thiểu:
CellAnnotation {
  row_id: int                       // khóa dòng thống nhất
  column: string                    // TÊN CỘT GỐC là canonical chung
                                    //   (anomaly & profile đã dùng; validation cần map ngược invoice_amount→"Price")
  source: "validation" | "duplicate" | "suggestion" | "profile" | "anomaly"
  severity: "ok" | "info" | "warning" | "error"   // tri-state thống nhất
  raw_value: any                    // GIÁ TRỊ GỐC thật (từ raw-grid) — thứ đang thiếu
  message: string                   // diễn giải ngôn ngữ thường
  detail?: {                        // payload riêng theo source, KHÔNG ép chung
     kind?: "numeric" | "categorical" | "opaque"   // fix bug z-score
     expected?: {...} | frequency?: {...}          // range CHỈ khi numeric thật
     suggestion?: string, confidence?: number      // cho suggestion source
     cluster_id?: string                           // cho duplicate source
     health_score?: number, flags?: []             // cho profile source (ở header cột)
  }
}
Nguyên tắc merge: rollup cấp dòng = severity xấu nhất trong các annotation của dòng đó (đúng M8 §3.1). Mỗi cell có thể mang nhiều annotation từ nhiều source cùng lúc (vd. vừa anomaly vừa profile:HIGH_NULL) → UI hiện badge xếp chồng theo source. raw_value luôn có mặt (lấy từ raw-grid) để panel không bao giờ trống như Row #0.
Điểm phải quyết trước khi code
Câu hỏi kiến trúc thật sự không phải "shape annotation nào" mà là: chọn khóa cột canonical nào — tên gốc hay TDM canonical? Anomaly + profile dùng tên gốc và luôn có dữ liệu; validation/grid dùng canonical và cần TDM mapping. Hai lựa chọn:
Nếu muốn smart table hợp nhất thật sự (kiểu Ingestro), phải bắt buộc TDM mapping cho mọi dataset rồi map anomaly/profile sang canonical — nhưng như vậy anomaly sẽ bị chặn khi chưa mapping (giống 409 gate). Ngược lại, nếu giữ tên cột gốc làm canonical, phải map ngược column_key của validation (invoice_amount→"Price") và làm cho /grid, /preview/cell chạy được không cần TDM — nhẹ hơn nhưng mất chuẩn hóa TDM.
Đây đúng là điểm "chưa ai chốt" khiến thiết kế panel bị treo. Trước khi bàn giao FE, cần một quyết định: canonical column key = tên gốc, và làm nhánh smart table hoạt động ở chế độ pre-TDM (fallback dùng raw-grid). Đó là con đường ít phá vỡ nhất vì anomaly + profile đã sẵn dữ liệu thật ngay bây giờ.
