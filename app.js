import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_ORG_SLUG = import.meta.env.VITE_SUPABASE_ORG_SLUG || "saebom";
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

const icons = {
  grid: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
  flow: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6h7M18 8.5v7M15.5 18H8a2 2 0 0 1-2-2V9"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  receipt: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"/><path d="M9 7h6M9 11h6M9 15h3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  alert: '<path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  split: '<path d="M6 3v5a4 4 0 0 0 4 4h8M18 7l5 5-5 5M6 21v-5a4 4 0 0 1 4-4"/>',
  sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'
};

document.querySelectorAll("[data-icon]").forEach((node) => {
  node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[node.dataset.icon] || ""}</svg>`;
});

const issues = [
  { id: 1, stage: "출하 예정", farmer: "김성호 농가", crop: "방울토마토", issue: "예정 수량이 입력되지 않았어요.", type: "누락", className: "missing", details: [["출하일", "6월 18일"], ["입고 방식", "자가입고"], ["예정 수량", "미입력"]] },
  { id: 2, stage: "입고", farmer: "박영자 농가", crop: "완숙토마토", issue: "예정 40박스, 실제 입고 28박스", type: "불일치", className: "mismatch", details: [["예정 수량", "40박스"], ["실제 입고", "28박스"], ["차이", "-12박스"]] },
  { id: 3, stage: "선별", farmer: "이재훈 농가", crop: "방울토마토", issue: "입고는 완료됐지만 선별 결과가 없어요.", type: "누락", className: "missing", details: [["실제 입고", "36박스"], ["입고 시간", "10:24"], ["선별 결과", "미입력"]] },
  { id: 4, stage: "선별", farmer: "정미숙 농가", crop: "대추방울", issue: "입고량 32박스, 선별 합계 30박스", type: "불일치", className: "mismatch", details: [["실제 입고", "32박스"], ["선별 합계", "30박스"], ["차이", "-2박스"]] },
  { id: 5, stage: "배분", farmer: "최은경 농가", crop: "완숙토마토", issue: "상 등급 12박스의 출하처가 없어요.", type: "미배분", className: "unassigned", details: [["등급", "상"], ["확정 수량", "12박스"], ["출하처", "미배분"]] }
];

const fallbackShipments = [
  { id: 101, farmer: "김성호 농가", date: "2026-06-18", crop: "방울토마토", total: 40, special: 10, high: 20, normal: 10, method: "자가입고", time: "오전 9시", phone: "010-2481-0324", status: "확인 완료", memo: "" },
  { id: 102, farmer: "박영자 농가", date: "2026-06-18", crop: "완숙토마토", total: 28, special: 8, high: 12, normal: 8, method: "수거 요청", time: "오전 9시", phone: "010-3842-1107", status: "확인 필요", memo: "수거 위치 확인" },
  { id: 103, farmer: "이재훈 농가", date: "2026-06-18", crop: "방울토마토", total: 36, special: 8, high: 20, normal: 8, method: "자가입고", time: "오전 10시", phone: "010-9071-2420", status: "확인 완료", memo: "" },
  { id: 104, farmer: "최은경 농가", date: "2026-06-18", crop: "대추방울", total: 24, special: 4, high: 12, normal: 8, method: "수거 요청", time: "오전 11시", phone: "010-6628-1049", status: "미확인", memo: "" },
  { id: 105, farmer: "정미숙 농가", date: "2026-06-18", crop: "대추방울", total: 32, special: 7, high: 15, normal: 10, method: "자가입고", time: "오후 1시", phone: "010-4410-8325", status: "확인 필요", memo: "등급 수량 재확인" },
  { id: 106, farmer: "오세진 농가", date: "2026-06-18", crop: "완숙토마토", total: 30, special: 6, high: 14, normal: 10, method: "자가입고", time: "오후 1시", phone: "010-2194-5578", status: "확인 완료", memo: "" },
  { id: 107, farmer: "한정희 농가", date: "2026-06-18", crop: "방울토마토", total: 42, special: 12, high: 20, normal: 10, method: "수거 요청", time: "오후 2시", phone: "010-7832-6021", status: "미확인", memo: "" }
];

let shipments = [...fallbackShipments];
let farmOptions = [
  { id: "김성호 농가", name: "김성호 농가", phone: "010-2481-0324" },
  { id: "박영자 농가", name: "박영자 농가", phone: "010-3842-1107" },
  { id: "이재훈 농가", name: "이재훈 농가", phone: "010-9071-2420" },
  { id: "최은경 농가", name: "최은경 농가", phone: "010-6628-1049" },
  { id: "정미숙 농가", name: "정미숙 농가", phone: "010-4410-8325" }
];
let cropOptions = [
  { id: "방울토마토", name: "방울토마토" },
  { id: "완숙토마토", name: "완숙토마토" },
  { id: "대추방울", name: "대추방울" }
];

let activeFilter = "all";
let activeIssueId = null;
let sheetSearchTerm = "";
let sheetStatus = "all";
let newestShipmentId = null;

const issueTableBody = document.querySelector("#issueTableBody");
const issueCount = document.querySelector("#issueCount");
const headingIssueCount = document.querySelector("#headingIssueCount");

function renderIssues() {
  const searchTerm = document.querySelector("#globalSearch").value.trim().toLowerCase();
  const counts = {
    all: issues.length,
    누락: issues.filter((item) => item.type === "누락").length,
    불일치: issues.filter((item) => item.type === "불일치").length,
    미배분: issues.filter((item) => item.type === "미배분").length
  };
  const filtered = issues.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesSearch = !searchTerm || `${item.farmer} ${item.crop}`.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  issueTableBody.innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr data-id="${item.id}">
        <td class="stage-cell">${item.stage}</td>
        <td class="farmer-cell">${item.farmer}</td>
        <td>${item.crop}</td>
        <td class="issue-text">${highlightNumber(item.issue)}</td>
        <td><span class="issue-status ${item.className}">${item.type}</span></td>
        <td class="row-arrow">›</td>
      </tr>`).join("")
    : '<tr><td colspan="6" style="text-align:center;color:#8b948f;height:90px">조건에 맞는 데이터가 없습니다.</td></tr>';

  issueCount.textContent = issues.length;
  headingIssueCount.textContent = `${issues.length}건`;
  document.querySelector("#issueSummary").textContent = `누락 ${counts.누락} · 불일치 ${counts.불일치} · 미배분 ${counts.미배분}`;
  document.querySelectorAll("[data-filter-count]").forEach((node) => {
    node.textContent = counts[node.dataset.filterCount];
  });
  document.querySelectorAll("#issueTableBody tr[data-id]").forEach((row) => {
    row.addEventListener("click", () => openIssue(Number(row.dataset.id)));
  });
}

function highlightNumber(text) {
  return text.replace(/(\d+박스|-?\d+박스)/g, "<strong>$1</strong>");
}

document.querySelectorAll(".issue-filters button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".issue-filters button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderIssues();
  });
});

document.querySelector("#globalSearch").addEventListener("input", renderIssues);

const drawer = document.querySelector("#issueDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
function openIssue(id) {
  const issue = issues.find((item) => item.id === id);
  if (!issue) return;
  activeIssueId = id;
  document.querySelector("#drawerTitle").textContent = `${issue.stage} 데이터 확인`;
  document.querySelector("#drawerFarmer").textContent = issue.farmer;
  document.querySelector("#drawerCrop").textContent = issue.crop;
  document.querySelector("#drawerAvatar").textContent = issue.farmer.charAt(0);
  document.querySelector("#drawerStatus").innerHTML = `<span class="issue-status ${issue.className}">${issue.type}</span><p style="font-size:12px;margin:10px 0 0;line-height:1.6">${issue.issue}</p>`;
  document.querySelector("#drawerDetails").innerHTML = issue.details.map(([key, value]) => `<div class="detail-row"><span>${key}</span><strong>${value}</strong></div>`).join("");
  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeIssue() {
  drawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

document.querySelector("#drawerClose").addEventListener("click", closeIssue);
drawerBackdrop.addEventListener("click", closeIssue);
document.querySelector("#resolveButton").addEventListener("click", () => {
  const index = issues.findIndex((item) => item.id === activeIssueId);
  if (index >= 0) {
    const [resolved] = issues.splice(index, 1);
    closeIssue();
    renderIssues();
    showToast(`${resolved.farmer}의 확인 항목을 완료 처리했습니다.`);
  }
});

const genericCopy = {
  flow: ["출하 흐름", "예정부터 정산 준비까지 단계별 데이터 연결 상태를 확인합니다."],
  farmers: ["농가 관리", "참여 농가와 품목별 출하 이력을 관리합니다."],
  settlement: ["정산 자료", "정산 가능 여부와 누락된 단가·비용 데이터를 확인합니다."],
  api: ["API 연동", "농협, ERP, 엑셀 자동화 도구와의 데이터 연결 상태를 관리합니다."]
};

function changeView(view) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  const isFarmer = view === "farmer";
  document.body.classList.toggle("farmer-mode", isFarmer);
  document.querySelector("#farmerView").classList.toggle("hidden", !isFarmer);
  const isDashboard = view === "dashboard";
  const isSheet = view === "sheet";
  document.querySelector("#dashboardView").classList.toggle("hidden", !isDashboard);
  document.querySelector("#sheetView").classList.toggle("hidden", !isSheet);
  document.querySelector("#genericView").classList.toggle("hidden", isDashboard || isSheet || isFarmer);
  if (!isDashboard && !isSheet && !isFarmer) {
    const [title, description] = genericCopy[view];
    document.querySelector("#genericTitle").textContent = title;
    document.querySelector("#genericDescription").textContent = description;
  }
  if (isSheet) renderSheet();
  document.querySelector(".sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => changeView(button.dataset.view)));
document.querySelectorAll("[data-view-link]").forEach((button) => button.addEventListener("click", () => changeView(button.dataset.viewLink)));
document.querySelector(".mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));

const entryModal = document.querySelector("#entryModal");
const entryBackdrop = document.querySelector("#entryBackdrop");
function openEntry() {
  entryModal.classList.add("open");
  entryBackdrop.classList.add("open");
  entryModal.setAttribute("aria-hidden", "false");
}
function closeEntry() {
  entryModal.classList.remove("open");
  entryBackdrop.classList.remove("open");
  entryModal.setAttribute("aria-hidden", "true");
}
document.querySelector("#newEntryButton").addEventListener("click", openEntry);
document.querySelector("#entryClose").addEventListener("click", closeEntry);
document.querySelector("#entryCancel").addEventListener("click", closeEntry);
entryBackdrop.addEventListener("click", closeEntry);

document.querySelectorAll(".mode-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-tabs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const sorting = button.dataset.mode === "sorting";
    document.querySelector("#arrivalFields").classList.toggle("hidden", sorting);
    document.querySelector("#sortingFields").classList.toggle("hidden", !sorting);
  });
});

document.querySelectorAll(".grade-grid input").forEach((input) => {
  input.addEventListener("input", () => {
    const sum = [...document.querySelectorAll(".grade-grid input")].reduce((total, item) => total + Number(item.value || 0), 0);
    document.querySelector("#sortingSum").textContent = `${sum} 박스`;
  });
});

document.querySelector("#entryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  closeEntry();
  showToast("새 데이터가 저장되고 다음 단계에 연결되었습니다.");
});

document.querySelector("#downloadButton").addEventListener("click", () => {
  const rows = [
    ["단계", "농가", "품목", "확인할 내용", "상태"],
    ...issues.map((item) => [item.stage, item.farmer, item.crop, item.issue, item.type])
  ];
  const csv = "\ufeff" + rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "이어봄_확인필요데이터_2026-06-18.csv";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("오늘의 확인 필요 데이터를 내려받았습니다.");
});

const sheetFields = [
  ["farmer", "농가명"],
  ["date", "출하일"],
  ["crop", "품목"],
  ["total", "총수량"],
  ["special", "특"],
  ["high", "상"],
  ["normal", "보통"],
  ["method", "입고방식"],
  ["time", "희망시간"],
  ["phone", "연락처"],
  ["status", "상태"],
  ["memo", "메모"]
];

function statusToLabel(status) {
  const labels = {
    submitted: "미확인",
    needs_check: "확인 필요",
    confirmed: "확인 완료",
    arrived: "확인 완료",
    sorted: "확인 완료",
    allocated: "확인 완료",
    settlement_ready: "확인 완료",
    settled: "확인 완료",
    held: "확인 필요"
  };
  return labels[status] || status || "미확인";
}

function labelToStatus(label) {
  const statuses = {
    "미확인": "submitted",
    "확인 필요": "needs_check",
    "확인 완료": "confirmed"
  };
  return statuses[label] || "submitted";
}

function methodToLabel(method) {
  if (method === "self_delivery") return "자가입고";
  if (method === "pickup_request") return "수거 요청";
  return method || "";
}

function labelToMethod(label) {
  return label === "수거 요청" ? "pickup_request" : "self_delivery";
}

function timeToLabel(time) {
  if (!time) return "";
  const [hourText] = String(time).split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return time;
  return `${hour < 12 ? "오전" : "오후"} ${hour > 12 ? hour - 12 : hour}시`;
}

function labelToTime(label) {
  const match = String(label || "").match(/(오전|오후)\s*(\d+)시/);
  if (!match) return label || null;
  let hour = Number(match[2]);
  if (match[1] === "오후" && hour < 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:00`;
}

function mapSheetRow(row) {
  return {
    id: row.id,
    farmer: row.farm_name,
    date: row.shipment_date,
    crop: row.crop_name,
    total: Number(row.total_boxes || 0),
    special: Number(row.special_boxes || 0),
    high: Number(row.high_boxes || 0),
    normal: Number(row.normal_boxes || 0),
    method: methodToLabel(row.arrival_method),
    time: timeToLabel(row.requested_arrival_time),
    phone: row.contact_phone || row.farm_phone || "",
    status: statusToLabel(row.status),
    memo: row.farmer_memo || row.manager_memo || ""
  };
}

function populateSubmissionOptions() {
  const farmerSelect = document.querySelector("#farmerName");
  const cropSelect = document.querySelector("#shipmentCrop");
  const farmerMarkup = '<option value="">농가를 선택해주세요</option>' +
    farmOptions.map((farm) => `<option value="${farm.id}" data-phone="${farm.phone || ""}">${farm.name}</option>`).join("");
  const cropMarkup = '<option value="">품목을 선택해주세요</option>' +
    cropOptions.map((crop) => `<option value="${crop.id}">${crop.name}</option>`).join("");
  farmerSelect.innerHTML = farmerMarkup;
  cropSelect.innerHTML = cropMarkup;
}

function getSelectedOptionText(select) {
  return select.options[select.selectedIndex]?.textContent || "";
}

async function loadSupabaseData() {
  if (!supabase) {
    populateSubmissionOptions();
    return;
  }

  const [{ data: farms, error: farmsError }, { data: crops, error: cropsError }, { data: rows, error: rowsError }] = await Promise.all([
    supabase.from("farms").select("id,name,phone").eq("is_active", true).order("name"),
    supabase.from("crops").select("id,name").eq("is_active", true).order("name"),
    supabase.from("v_shipment_sheet").select("*").order("created_at", { ascending: false })
  ]);

  if (farmsError || cropsError) {
    showToast("Supabase 농가/품목을 불러오지 못해 목업 데이터를 사용합니다.");
    populateSubmissionOptions();
    return;
  }

  farmOptions = farms.map((farm) => ({ id: farm.id, name: farm.name, phone: farm.phone || "" }));
  cropOptions = crops.map((crop) => ({ id: crop.id, name: crop.name }));
  populateSubmissionOptions();

  if (rowsError) {
    showToast("관리자 데이터는 로그인 후 Supabase에서 불러올 수 있습니다.");
    return;
  }

  shipments = rows.map(mapSheetRow);
  if (document.querySelector("#sheetView") && !document.querySelector("#sheetView").classList.contains("hidden")) {
    renderSheet();
  }
}

function filteredShipments() {
  return shipments.filter((item) => {
    const matchesText = !sheetSearchTerm || `${item.farmer} ${item.crop}`.toLowerCase().includes(sheetSearchTerm);
    const matchesStatus = sheetStatus === "all" || item.status === sheetStatus;
    return matchesText && matchesStatus;
  });
}

function statusClass(status) {
  if (status === "확인 완료") return "done";
  if (status === "확인 필요") return "check";
  return "wait";
}

function renderSheet() {
  const rows = filteredShipments();
  const body = document.querySelector("#sheetBody");
  body.innerHTML = rows.map((item, index) => `
    <tr data-shipment-id="${item.id}" class="${item.id === newestShipmentId ? "new-row" : ""}">
      <td class="row-number">${index + 2}</td>
      ${sheetFields.map(([field]) => {
        if (field === "status") {
          return `<td class="status-cell" data-field="${field}" tabindex="0"><span class="sheet-status ${statusClass(item.status)}">${item.status}</span></td>`;
        }
        return `<td contenteditable="true" spellcheck="false" data-field="${field}">${item[field] ?? ""}</td>`;
      }).join("")}
    </tr>`).join("");

  const totals = rows.reduce((sum, item) => ({
    total: sum.total + Number(item.total || 0),
    special: sum.special + Number(item.special || 0),
    high: sum.high + Number(item.high || 0),
    normal: sum.normal + Number(item.normal || 0)
  }), { total: 0, special: 0, high: 0, normal: 0 });
  document.querySelector("#sheetFoot").innerHTML = `
    <tr><td class="row-number">Σ</td><td colspan="3">표시된 ${rows.length}건 합계</td><td>${totals.total}</td><td>${totals.special}</td><td>${totals.high}</td><td>${totals.normal}</td><td colspan="5"></td></tr>`;

  document.querySelector("#sheetFarmCount").textContent = new Set(shipments.map((item) => item.farmer)).size;
  document.querySelector("#sheetTotalCount").textContent = shipments.reduce((sum, item) => sum + Number(item.total || 0), 0);
  document.querySelector("#sheetCheckCount").textContent = shipments.filter((item) => item.status !== "확인 완료").length;
  document.querySelector("#sheetLastTime").textContent = newestShipmentId ? "방금 전" : "10:42";

  body.querySelectorAll("td[data-field]").forEach((cell) => {
    cell.addEventListener("click", () => selectSheetCell(cell));
    cell.addEventListener("focus", () => selectSheetCell(cell));
    cell.addEventListener("blur", () => updateSheetCell(cell));
    if (cell.dataset.field === "status") {
      cell.addEventListener("click", () => cycleSheetStatus(cell));
      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cycleSheetStatus(cell);
        }
      });
    }
  });
}

function selectSheetCell(cell) {
  document.querySelectorAll(".sheet-table td.selected").forEach((item) => item.classList.remove("selected"));
  cell.classList.add("selected");
  const row = cell.closest("tr");
  const rowIndex = [...row.parentElement.children].indexOf(row) + 2;
  const columnIndex = sheetFields.findIndex(([field]) => field === cell.dataset.field);
  document.querySelector("#selectedCellName").textContent = `${String.fromCharCode(65 + columnIndex)}${rowIndex}`;
  document.querySelector("#formulaInput").value = cell.innerText.trim();
}

async function updateSheetCell(cell) {
  const shipment = shipments.find((item) => item.id === Number(cell.closest("tr").dataset.shipmentId));
  const rawId = cell.closest("tr").dataset.shipmentId;
  const localShipment = shipments.find((item) => String(item.id) === rawId);
  const target = localShipment || shipment;
  if (!target || cell.dataset.field === "status") return;
  const numericFields = ["total", "special", "high", "normal"];
  target[cell.dataset.field] = numericFields.includes(cell.dataset.field)
    ? Number(cell.innerText.replace(/[^\d.-]/g, "") || 0)
    : cell.innerText.trim();
  renderSheet();
  const saved = await syncSheetCellToSupabase(target, cell.dataset.field);
  showToast(saved ? "셀 수정 내용이 Supabase에 저장됐습니다." : "셀 수정 내용이 화면에 저장됐습니다.");
}

async function cycleSheetStatus(cell) {
  const shipment = shipments.find((item) => String(item.id) === cell.closest("tr").dataset.shipmentId);
  if (!shipment) return;
  const statuses = ["미확인", "확인 필요", "확인 완료"];
  shipment.status = statuses[(statuses.indexOf(shipment.status) + 1) % statuses.length];
  renderSheet();
  await syncSheetCellToSupabase(shipment, "status");
}

async function syncSheetCellToSupabase(shipment, field) {
  if (!supabase) return false;

  const shipmentUpdates = {
    date: { shipment_date: shipment.date },
    total: { total_boxes: Number(shipment.total || 0) },
    method: { arrival_method: labelToMethod(shipment.method) },
    time: { requested_arrival_time: labelToTime(shipment.time) },
    phone: { contact_phone: shipment.phone },
    memo: { farmer_memo: shipment.memo },
    status: { status: labelToStatus(shipment.status) }
  };

  if (field === "farmer") {
    const farm = farmOptions.find((item) => item.name === shipment.farmer);
    if (farm) shipmentUpdates.farmer = { farm_id: farm.id };
  }

  if (field === "crop") {
    const crop = cropOptions.find((item) => item.name === shipment.crop);
    if (crop) shipmentUpdates.crop = { crop_id: crop.id };
  }

  if (["special", "high", "normal"].includes(field)) {
    const gradeCode = { special: "special", high: "high", normal: "normal" }[field];
    const { error } = await supabase
      .from("shipment_grade_estimates")
      .upsert({
        shipment_id: shipment.id,
        grade_code: gradeCode,
        boxes: Number(shipment[field] || 0)
      }, { onConflict: "shipment_id,grade_code" });
    if (error) {
      showToast(`Supabase 저장 실패: ${error.message}`);
      return false;
    }
    return true;
  }

  const payload = shipmentUpdates[field];
  if (!payload) return false;

  const { error } = await supabase
    .from("shipments")
    .update(payload)
    .eq("id", shipment.id);

  if (error) {
    showToast(`Supabase 저장 실패: ${error.message}`);
    return false;
  }

  return true;
}

document.querySelector("#sheetSearch").addEventListener("input", (event) => {
  sheetSearchTerm = event.target.value.trim().toLowerCase();
  renderSheet();
});
document.querySelector("#sheetStatusFilter").addEventListener("change", (event) => {
  sheetStatus = event.target.value;
  renderSheet();
});
document.querySelector("#addSheetRowButton").addEventListener("click", () => {
  const newRow = {
    id: Date.now(), farmer: "새 농가", date: "2026-06-18", crop: "", total: 0,
    special: 0, high: 0, normal: 0, method: "", time: "", phone: "", status: "미확인", memo: ""
  };
  shipments.unshift(newRow);
  newestShipmentId = newRow.id;
  renderSheet();
  showToast("빈 행을 추가했습니다. 셀을 눌러 수정하세요.");
});

function downloadShipments() {
  const rows = [
    sheetFields.map(([, label]) => label),
    ...filteredShipments().map((item) => sheetFields.map(([field]) => item[field] ?? ""))
  ];
  const csv = "\ufeff" + rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "이어봄_출하예정데이터_2026-06-18.csv";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("관리자 데이터표를 CSV로 내려받았습니다.");
}
document.querySelector("#sheetDownloadButton").addEventListener("click", downloadShipments);

const farmerForm = document.querySelector("#farmerShipmentForm");
const totalQuantity = document.querySelector("#totalQuantity");
const gradeInputs = ["#gradeSpecial", "#gradeHigh", "#gradeNormal"].map((selector) => document.querySelector(selector));

document.querySelector("#farmerName").addEventListener("change", (event) => {
  const phone = event.target.options[event.target.selectedIndex]?.dataset.phone;
  if (phone) document.querySelector("#farmerPhone").value = phone;
});

function checkGradeTotal() {
  const gradeTotal = gradeInputs.reduce((sum, input) => sum + Number(input.value || 0), 0);
  const total = Number(totalQuantity.value || 0);
  const message = document.querySelector("#gradeCheck");
  const matches = gradeTotal === total;
  message.className = `grade-check ${matches ? "ok" : "error"}`;
  message.textContent = matches
    ? "✓ 등급별 합계가 총 예정 수량과 같아요."
    : `! 등급별 합계 ${gradeTotal}박스와 총 수량 ${total}박스가 달라요.`;
  return matches;
}

document.querySelectorAll("[data-quantity]").forEach((button) => {
  button.addEventListener("click", () => {
    totalQuantity.value = Math.max(1, Number(totalQuantity.value || 1) + Number(button.dataset.quantity));
    checkGradeTotal();
  });
});
totalQuantity.addEventListener("input", checkGradeTotal);
gradeInputs.forEach((input) => input.addEventListener("input", checkGradeTotal));

farmerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const farmerSelect = document.querySelector("#farmerName");
  const cropSelect = document.querySelector("#shipmentCrop");
  const farmer = getSelectedOptionText(farmerSelect);
  const crop = getSelectedOptionText(cropSelect);
  const total = Number(totalQuantity.value);
  const gradeMatches = checkGradeTotal();
  const gradeBoxes = {
    special: Number(document.querySelector("#gradeSpecial").value || 0),
    high: Number(document.querySelector("#gradeHigh").value || 0),
    normal: Number(document.querySelector("#gradeNormal").value || 0)
  };
  let savedShipmentId = Date.now();

  if (supabase) {
    const { data, error } = await supabase.rpc("submit_farmer_shipment", {
      p_org_slug: SUPABASE_ORG_SLUG,
      p_farm_id: farmerSelect.value,
      p_crop_id: cropSelect.value,
      p_shipment_date: document.querySelector("#shipmentDate").value,
      p_total_boxes: total,
      p_grade_boxes: gradeBoxes,
      p_arrival_method: labelToMethod(document.querySelector('input[name="arrivalMethod"]:checked').value),
      p_requested_arrival_time: labelToTime(document.querySelector("#arrivalTime").value),
      p_contact_phone: document.querySelector("#farmerPhone").value,
      p_farmer_memo: document.querySelector("#farmerMemo").value
    });

    if (error) {
      showToast(`Supabase 제출 실패: ${error.message}`);
      return;
    }

    savedShipmentId = data;
  }

  const newShipment = {
    id: savedShipmentId,
    farmer,
    date: document.querySelector("#shipmentDate").value,
    crop,
    total,
    special: gradeBoxes.special,
    high: gradeBoxes.high,
    normal: gradeBoxes.normal,
    method: document.querySelector('input[name="arrivalMethod"]:checked').value,
    time: document.querySelector("#arrivalTime").value,
    phone: document.querySelector("#farmerPhone").value,
    status: gradeMatches ? "미확인" : "확인 필요",
    memo: document.querySelector("#farmerMemo").value
  };
  shipments.unshift(newShipment);
  newestShipmentId = newShipment.id;
  document.querySelector("#successSummary").textContent = `${farmer} · ${crop} ${total}박스 · ${newShipment.time}`;
  document.querySelector("#submissionSuccess").classList.remove("hidden");
  if (supabase) loadSupabaseData();
});

document.querySelector("#checkAdminSheet").addEventListener("click", () => {
  document.querySelector("#submissionSuccess").classList.add("hidden");
  changeView("sheet");
});
document.querySelector("#submitAnother").addEventListener("click", () => {
  document.querySelector("#submissionSuccess").classList.add("hidden");
  farmerForm.reset();
  totalQuantity.value = 40;
  document.querySelector("#gradeSpecial").value = 10;
  document.querySelector("#gradeHigh").value = 20;
  document.querySelector("#gradeNormal").value = 10;
  checkGradeTotal();
});

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#globalSearch").focus();
  }
  if (event.key === "Escape") {
    closeIssue();
    closeEntry();
  }
});

renderIssues();
loadSupabaseData();
