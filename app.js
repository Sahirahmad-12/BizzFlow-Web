const STORAGE_KEY = "bizflow_leads_v1";
const LOGS_KEY = "bizflow_logs_v1";

// Initial sample data
const defaultLeads = [
  {
    id: 101,
    clientName: "Delhi Public School",
    clientEmail: "accounts@dps.edu.in",
    baseAmount: 50000,
    gstAmount: 0,
    totalAmount: 50000,
    status: "PENDING",
    invoiceNo: null
  },
  {
    id: 102,
    clientName: "Apex Logistics Pvt Ltd",
    clientEmail: "billing@apexlogistics.in",
    baseAmount: 80000,
    gstAmount: 14400,
    totalAmount: 94400,
    status: "INVOICED",
    invoiceNo: "INV-2026-102"
  }
];

let leads = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultLeads;
let syncLogs = JSON.parse(localStorage.getItem(LOGS_KEY)) || [];

// DOM Elements
const leadForm = document.getElementById("leadForm");
const formError = document.getElementById("formError");
const leadsTableBody = document.getElementById("leadsTableBody");
const syncLogList = document.getElementById("syncLogList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const simulateFailureToggle = document.getElementById("simulateFailureToggle");
const resetDemoBtn = document.getElementById("resetDemoBtn");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  localStorage.setItem(LOGS_KEY, JSON.stringify(syncLogs));
}

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// Step 1: Add New Lead
leadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.hidden = true;

  const clientName = document.getElementById("clientName").value.trim();
  const clientEmail = document.getElementById("clientEmail").value.trim();
  const baseAmount = Number(document.getElementById("dealAmount").value);

  if (!clientName || !clientEmail || baseAmount <= 0) {
    formError.textContent = "Please enter valid client details and a positive deal amount.";
    formError.hidden = false;
    return;
  }

  const newLead = {
    id: Date.now(),
    clientName,
    clientEmail,
    baseAmount,
    gstAmount: 0,
    totalAmount: baseAmount,
    status: "PENDING",
    invoiceNo: null
  };

  leads.unshift(newLead);
  saveState();
  leadForm.reset();
  renderAll();
});

// Step 2: Convert Lead to 18% GST Invoice
function convertToInvoice(id) {
  const lead = leads.find((item) => item.id === id);
  if (!lead) return;

  const gst = Math.round(lead.baseAmount * 0.18);
  lead.gstAmount = gst;
  lead.totalAmount = lead.baseAmount + gst;
  lead.status = "INVOICED";
  lead.invoiceNo = "INV-2026-" + String(id).slice(-4);

  addLog(
    "success",
    `Generated ${lead.invoiceNo} for ${lead.clientName} (Total: ${formatINR(lead.totalAmount)} incl. 18% GST).`
  );

  saveState();
  renderAll();
}

// Step 3: Sync Invoice to External CRM / Accounts API
function syncToAccounts(id) {
  const lead = leads.find((item) => item.id === id);
  if (!lead) return;

  const shouldFail = simulateFailureToggle.checked;

  // Simulated REST API payload & network response
  setTimeout(() => {
    if (shouldFail) {
      lead.status = "SYNC_FAILED";
      addLog(
        "failed",
        `[HTTP 503] Failed syncing ${lead.invoiceNo} (${lead.clientName}) to External Accounts API. Click Retry.`
      );
    } else {
      lead.status = "SYNCED";
      addLog(
        "success",
        `[HTTP 200 OK] Synced ${lead.invoiceNo} (${lead.clientName} - ${formatINR(lead.totalAmount)}) to External CRM/ERP.`
      );
    }
    saveState();
    renderAll();
  }, 300);
}

function addLog(type, message) {
  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  syncLogs.unshift({ type, message, time });
  if (syncLogs.length > 20) syncLogs.pop();
}

function getStatusBadge(status) {
  switch (status) {
    case "PENDING":
      return `<span class="badge badge-pending">Pending</span>`;
    case "INVOICED":
      return `<span class="badge badge-invoiced">Invoiced (18% GST)</span>`;
    case "SYNCED":
      return `<span class="badge badge-synced">Synced to Accounts</span>`;
    case "SYNC_FAILED":
      return `<span class="badge badge-failed">Sync Failed</span>`;
    default:
      return status;
  }
}

function getActionButtons(lead) {
  if (lead.status === "PENDING") {
    return `<button class="btn btn-convert" onclick="convertToInvoice(${lead.id})">Mark Deal Done (18% GST)</button>`;
  }
  if (lead.status === "INVOICED") {
    return `<button class="btn btn-sync" onclick="syncToAccounts(${lead.id})">Send to Accounts</button>`;
  }
  if (lead.status === "SYNC_FAILED") {
    return `<button class="btn btn-retry" onclick="syncToAccounts(${lead.id})">Retry Sync</button>`;
  }
  return `<span style="color:#16a34a;font-weight:600;">✓ Completed (${lead.invoiceNo})</span>`;
}

function renderAll() {
  // Update KPI Cards
  document.getElementById("totalLeadsCount").textContent = leads.length;

  const invoicedTotal = leads
    .filter((l) => l.status !== "PENDING")
    .reduce((sum, l) => sum + l.totalAmount, 0);
  document.getElementById("totalInvoiceAmount").textContent = formatINR(invoicedTotal);

  const syncedCount = leads.filter((l) => l.status === "SYNCED").length;
  document.getElementById("syncedCount").textContent = syncedCount;

  // Filter Table Rows
  const query = searchInput.value.toLowerCase();
  const statusVal = statusFilter.value;

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.clientName.toLowerCase().includes(query) ||
      l.clientEmail.toLowerCase().includes(query);
    const matchesStatus = statusVal === "ALL" || l.status === statusVal;
    return matchesSearch && matchesStatus;
  });

  leadsTableBody.innerHTML = filtered.length
    ? filtered
        .map(
          (lead) => `
      <tr>
        <td>
          <strong>${lead.clientName}</strong>
          <span class="client-email">${lead.clientEmail}</span>
        </td>
        <td>${formatINR(lead.baseAmount)}</td>
        <td>${lead.gstAmount ? formatINR(lead.gstAmount) : "—"}</td>
        <td><strong>${formatINR(lead.totalAmount)}</strong></td>
        <td>${getStatusBadge(lead.status)}</td>
        <td>${getActionButtons(lead)}</td>
      </tr>
    `
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;color:#64748b;">No matching records found.</td></tr>`;

  // Render Sync Logs
  syncLogList.innerHTML = syncLogs.length
    ? syncLogs
        .map(
          (log) => `
      <li class="log-item ${log.type}">
        <span>${log.message}</span>
        <strong style="white-space:nowrap;color:#64748b;">${log.time}</strong>
      </li>
    `
        )
        .join("")
    : `<li class="log-item">No sync events yet. Convert a deal and click "Send to Accounts".</li>`;
}

searchInput.addEventListener("input", renderAll);
statusFilter.addEventListener("change", renderAll);

resetDemoBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LOGS_KEY);
  leads = JSON.parse(JSON.stringify(defaultLeads));
  syncLogs = [];
  renderAll();
});

renderAll();