/**
 * Student test attempt history (localStorage).
 * Stores name, student ID, section (XI B / XI E), marks, percentage, date.
 * Clear history requires admin password.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "fazaia_quiz_history";
  const MAX_RECORDS = 200;
  // Admin-only clear password (client-side gate for teachers on this device)
  const ADMIN_CLEAR_PASSWORD = "Fazaia@804!";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECORDS)));
    } catch (_) {
      /* storage full or blocked */
    }
  }

  /**
   * @param {{ studentName: string, studentId: string, section: string, correct: number, total: number, percent: number, filterLabel?: string, badge?: string }} record
   */
  function addAttempt(record) {
    const list = load();
    list.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      studentName: String(record.studentName || "Student").trim(),
      studentId: String(record.studentId || "").trim(),
      section: String(record.section || "").trim(),
      correct: Number(record.correct) || 0,
      total: Number(record.total) || 0,
      percent: Number(record.percent) || 0,
      marks: `${Number(record.correct) || 0} / ${Number(record.total) || 0}`,
      filterLabel: record.filterLabel || "",
      badge: record.badge || "",
      date: new Date().toISOString(),
    });
    save(list);
    return list;
  }

  function clearAll() {
    save([]);
  }

  function requestAdminClear() {
    const password = window.prompt("Admin password required to clear history:");
    if (password === null) return false; // cancelled
    if (password !== ADMIN_CLEAR_PASSWORD) {
      alert("Incorrect password. History was not cleared.");
      return false;
    }
    if (!confirm("Clear all student test history from this device?")) {
      return false;
    }
    clearAll();
    return true;
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return iso;
    }
  }

  function renderHistory() {
    const root = document.getElementById("history-root");
    if (!root) return;

    const list = load();
    if (!list.length) {
      root.innerHTML = `
        <div class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p class="font-display text-xl text-navy">No attempts yet</p>
          <p class="mt-2 text-sm text-slate-600">When students finish a test, their name, ID, section, and marks will appear here.</p>
        </div>
      `;
      return;
    }

    const xiB = list.filter((r) => r.section === "XI B").length;
    const xiE = list.filter((r) => r.section === "XI E").length;

    root.innerHTML = `
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm text-slate-600">${list.length} attempt(s) saved on this device</p>
          <p class="mt-1 text-xs text-slate-500">XI B: ${xiB} &nbsp;|&nbsp; XI E: ${xiE}</p>
        </div>
        <button type="button" id="history-clear" class="rounded-md border-2 border-flame/30 px-4 py-2 text-sm font-semibold text-flame hover:bg-flame/5" title="Admin only">
          Clear history (Admin)
        </button>
      </div>
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-navy text-white">
            <tr>
              <th class="px-4 py-3 font-semibold">#</th>
              <th class="px-4 py-3 font-semibold">Student name</th>
              <th class="px-4 py-3 font-semibold">Student ID</th>
              <th class="px-4 py-3 font-semibold">Section</th>
              <th class="px-4 py-3 font-semibold">Marks</th>
              <th class="px-4 py-3 font-semibold">%</th>
              <th class="px-4 py-3 font-semibold">Badge</th>
              <th class="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${list
              .map(
                (r, i) => `
              <tr class="hover:bg-mist/80">
                <td class="px-4 py-3 text-slate-500">${i + 1}</td>
                <td class="px-4 py-3 font-semibold text-navy">${escapeHtml(r.studentName)}</td>
                <td class="px-4 py-3 font-mono text-navy">${escapeHtml(r.studentId || "-")}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
                    r.section === "XI B" ? "bg-sky/15 text-sky-deep" : "bg-gold/20 text-navy"
                  }">${escapeHtml(r.section || "-")}</span>
                </td>
                <td class="px-4 py-3 font-semibold text-navy">${escapeHtml(r.marks)}</td>
                <td class="px-4 py-3 ${r.percent >= 75 ? "text-emerald-700" : r.percent >= 50 ? "text-sky-deep" : "text-flame"} font-semibold">${r.percent}%</td>
                <td class="px-4 py-3 text-slate-600">${escapeHtml(r.badge || "-")}</td>
                <td class="px-4 py-3 text-slate-500 whitespace-nowrap">${escapeHtml(formatDate(r.date))}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-slate-500">Clear history is admin-only and requires a password.</p>
    `;

    document.getElementById("history-clear")?.addEventListener("click", () => {
      if (requestAdminClear()) {
        renderHistory();
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.FazaiaHistory = {
    load,
    addAttempt,
    clearAll,
    requestAdminClear,
    renderHistory,
    formatDate,
  };
})();
