const SHEET_URLS = {
    certificates: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=511938877&single=true&output=csv",
    trainers: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=0&single=true&output=csv",
    academies: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=817462972&single=true&output=csv",
    excellence: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=1889661729&single=true&output=csv",
    quality: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=1749693546&single=true&output=csv",
    agents: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=1397519243&single=true&output=csv",
    advisors: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTEwUu3rrfQ2bSbLxmwkK3QRSJSO5tPiCUBFY_86ny30twlSAUr3biMbDzwVD20P24CK4Us5OLZn5iI/pub?gid=21410697&single=true&output=csv"
};

const TAB_CONFIG = {
    certificates: {
        title: "Verify Qualification Certificate",
        desc: "Enter certificate number or serial code below:",
        placeholder: "e.g., ICC-CERT-2026-001",
        btnText: "Open Certificate Portal →",
        pageUrl: "verification.html?type=certificates"
    },
    trainers: {
        title: "Verify Accredited Trainer Status",
        desc: "Enter trainer registration ID or name below:",
        placeholder: "e.g., ICC-TRN-2026-042",
        btnText: "Open Trainer Portal →",
        pageUrl: "verification.html?type=trainers"
    },
    academies: {
        title: "Academy Accreditation Lookup",
        desc: "Enter institution accreditation number below:",
        placeholder: "e.g., ICC-ACD-2026-015",
        btnText: "Open Academy Portal →",
        pageUrl: "verification.html?type=academies"
    },
    excellence: {
        title: "Excellence Award Registry",
        desc: "Enter award serial reference below:",
        placeholder: "e.g., ICC-EXC-2026-009",
        btnText: "Open Award Portal →",
        pageUrl: "verification.html?type=excellence"
    },
    quality: {
        title: "Quality Assurance Accreditation",
        desc: "Enter quality accreditation code or serial number below:",
        placeholder: "e.g., ICC-QA-2026-110",
        btnText: "Open Quality Portal →",
        pageUrl: "verification.html?type=quality"
    },
    agents: {
        title: "Verify Institutional Agent",
        desc: "Enter authorized agent registration code below:",
        placeholder: "e.g., ICC-AGT-2026-003",
        btnText: "Open Agents Portal →",
        pageUrl: "agents.html"
    },
    advisors: {
        title: "Verify Cambridge Advisor",
        desc: "Enter advisor appointment code below:",
        placeholder: "e.g., ICC-ADV-2026-007",
        btnText: "Open Advisor Portal →",
        pageUrl: "advisors.html"
    }
};

let currentTab = 'certificates';

function switchTab(tabKey, btnElement) {
    currentTab = tabKey;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const cfg = TAB_CONFIG[tabKey];
    document.getElementById('hubBoxTitle').innerText = cfg.title;
    document.getElementById('hubBoxDesc').innerText = cfg.desc;
    document.getElementById('serialInput').placeholder = cfg.placeholder;
    const linkEl = document.getElementById('directPortalLink');
    linkEl.innerText = cfg.btnText;
    linkEl.href = cfg.pageUrl;
    document.getElementById('verificationResult').innerHTML = '';
}

function switchTabByName(tabKey) {
    const buttons = document.querySelectorAll('.tab-btn');
    const keys = Object.keys(TAB_CONFIG);
    const idx = keys.indexOf(tabKey);
    if (idx !== -1) switchTab(tabKey, buttons[idx]);
}

function parseCSV(text) {
    const rows = [];
    let current = '', inQuotes = false, row = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i], next = text[i + 1];
        if (char === '"' && inQuotes && next === '"') { current += '"'; i++; }
        else if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { row.push(current.trim()); current = ''; }
        else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (current || row.length) { row.push(current.trim()); rows.push(row); row = []; current = ''; }
        } else { current += char; }
    }
    if (current || row.length) { row.push(current.trim()); rows.push(row); }
    return rows;
}

async function runVerification() {
    const query = document.getElementById('serialInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('verificationResult');

    if (!query) {
        resultDiv.innerHTML = `<div style="padding:14px; background:#fef2f2; border:1px solid #fecaca; color:#991b1b; border-radius:8px;">Please enter a valid serial code or reference number.</div>`;
        return;
    }

    const csvUrl = SHEET_URLS[currentTab];
    resultDiv.innerHTML = `<p style="text-align:center; color:#475569;">Querying official registry...</p>`;

    try {
        const res = await fetch(csvUrl);
        const text = await res.text();
        const rows = parseCSV(text);
        const headers = rows[0];
        
        // البحث الدقيق في العمود الأول (الرقم التسلسلي) أو التطابق التام في أي خلية تعريفية
        const match = rows.slice(1).find(r => r.some(cell => cell && cell.trim().toLowerCase() === query));

        if (match) {
            let detailsHtml = '';
            for (let i = 0; i < headers.length; i++) {
                if (headers[i] && match[i]) {
                    detailsHtml += `
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #dcfce7; font-size:14px;">
                            <strong style="color:#04152d;">${headers[i]}:</strong>
                            <span style="color:#1e293b; font-weight:600;">${match[i]}</span>
                        </div>`;
                }
            }
            resultDiv.innerHTML = `
                <div style="background:#f0fdf4; border:1px solid #86efac; border-left:5px solid #16a34a; padding:22px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                    <h4 style="color:#15803d; margin-bottom:12px; font-size:16px; display:flex; align-items:center; gap:8px;">
                        <span>&#10004;</span> VERIFIED OFFICIAL RECORD
                    </h4>
                    ${detailsHtml}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="background:#fef2f2; border:1px solid #fecaca; border-left:5px solid #dc2626; padding:18px; border-radius:8px; color:#991b1b;">
                    <strong>&#10008; NO RECORD FOUND:</strong> The serial number or reference entered does not match any active record in our registry.
                </div>
            `;
        }
    } catch (err) {
        resultDiv.innerHTML = `<div style="padding:14px; background:#fef2f2; color:#991b1b; border-radius:8px;">Connection error while accessing the registry. Please try again.</div>`;
    }
}

// دعم الضغط على زر Enter في مربع البحث
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById('serialInput');
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") runVerification();
        });
    }
});