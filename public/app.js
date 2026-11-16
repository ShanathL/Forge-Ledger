// public/app.js - ForgeLedger Complete Refined Application
// Reference: Lanka Shanath, "Integrated Manufacturing Workspace for Small Manufacturers"

const { useState, useEffect, useMemo, createElement: h } = React;

function formatCurrency(amount, currency = '₹') {
  const num = Number(amount) || 0;
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Icons (SVG Helpers with consistent strokes)
function Icon({ name, size = 17, className = "" }) {
  const icons = {
    overview: h('path', { d: 'M3 3h7v9H3zm11 0h7v5h-7zm0 9h7v9h-7zM3 16h7v5H3z' }),
    inventory: h('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' }),
    sales: h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6m-4 5H8m8 4H8m2-8H8' }),
    expenses: h('path', { d: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4z' }),
    rawMaterials: h('path', { d: 'M21 16.5A3.5 3.5 0 0 1 17.5 20h-11A3.5 3.5 0 0 1 3 16.5c0-1.57.99-2.9 2.4-3.34A5.5 5.5 0 0 1 16 9.5c.34 0 .68.03 1 .09A4.5 4.5 0 0 1 21 14c0 .85-.24 1.64-.66 2.31' }),
    production: h('path', { d: 'M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z' }),
    payroll: h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75' }),
    reports: h('path', { d: 'M18 20V10M12 20V4M6 20v-6' }),
    settings: h('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }),
    plus: h('path', { d: 'M12 5v14M5 12h14' }),
    search: h('path', { d: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.35-4.35' }),
    trash: h('path', { d: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
    arrowRight: h('path', { d: 'M5 12h14M12 5l7 7-7 7' }),
    logout: h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' }),
    edit: h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }),
    chevronLeft: h('path', { d: 'M15 18l-6-6 6-6' }),
    chevronRight: h('path', { d: 'M9 18l6-6-6-6' }),
    menu: h('path', { d: 'M3 12h18M3 6h18M3 18h18' }),
    sun: h('g', null,
      h('circle', { cx: '12', cy: '12', r: '5' }),
      h('line', { x1: '12', y1: '1', x2: '12', y2: '3' }),
      h('line', { x1: '12', y1: '21', x2: '12', y2: '23' }),
      h('line', { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' }),
      h('line', { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' }),
      h('line', { x1: '1', y1: '12', x2: '3', y2: '12' }),
      h('line', { x1: '21', y1: '12', x2: '23', y2: '12' }),
      h('line', { x1: '4.22', y1: '19.78', x2: '5.64', y2: '18.36' }),
      h('line', { x1: '18.36', y1: '5.64', x2: '19.78', y2: '4.22' })
    ),
    moon: h('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }),
    user: h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' }),
    download: h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' }),
    alertCircle: h('g', null,
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
      h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
    ),
    checkCircle: h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3' })
  };

  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className
  }, icons[name] || null);
}

// Client-Side CSV Export Utility
function exportToCsv(filename, rows, headerMap) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }
  const keys = Object.keys(headerMap);
  const labels = Object.values(headerMap);
  const lines = [labels.join(',')];
  rows.forEach(row => {
    const line = keys.map(k => {
      let val = row[k] ?? '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    lines.push(line);
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Enhanced, Highly Visible Inventory Pie / Donut Chart Component (Enlarged)
function InventoryPieChart({ inventory = [], rawMaterials = [], currency = '₹' }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const categoryMap = {};
  let totalVal = 0;

  (inventory || []).forEach(item => {
    const cat = item.category || 'Finished good';
    const val = (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
    totalVal += val;
    if (!categoryMap[cat]) categoryMap[cat] = { name: cat, value: 0, count: 0, lowStockCount: 0 };
    categoryMap[cat].value += val;
    categoryMap[cat].count += 1;
    if (Number(item.quantity) <= (Number(item.reorder_level) || 5)) {
      categoryMap[cat].lowStockCount += 1;
    }
  });

  (rawMaterials || []).forEach(rm => {
    const cat = 'Raw materials';
    const val = (Number(rm.quantity) || 0) * (Number(rm.unit_cost) || 0);
    totalVal += val;
    if (!categoryMap[cat]) categoryMap[cat] = { name: cat, value: 0, count: 0, lowStockCount: 0 };
    categoryMap[cat].value += val;
    categoryMap[cat].count += 1;
  });

  const categories = Object.values(categoryMap);
  if (totalVal === 0 && categories.length > 0) {
    categories.forEach(c => c.value = c.count * 100);
    totalVal = categories.reduce((sum, c) => sum + c.value, 0);
  }

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.655

  let accumulatedPercent = 0;
  const slices = categories.map((cat, idx) => {
    const percent = totalVal > 0 ? (cat.value / totalVal) : (1 / (categories.length || 1));
    const strokeDash = (percent * circumference);
    const strokeOffset = (accumulatedPercent * circumference);
    accumulatedPercent += percent;
    return {
      ...cat,
      percent: Math.round(percent * 100),
      color: colors[idx % colors.length],
      strokeDasharray: `${strokeDash} ${circumference}`,
      strokeDashoffset: -strokeOffset
    };
  });

  const activeSlice = hoveredSlice ? slices.find(s => s.name === hoveredSlice) : null;

  return h('div', { className: 'inventory-pie-widget enhanced-pie-widget' },
    h('div', { className: 'pie-chart-wrap' },
      h('svg', {
        viewBox: '0 0 240 240',
        width: 230,
        height: 230,
        className: 'pie-svg'
      },
        // Track Background
        h('circle', {
          cx: 120,
          cy: 120,
          r: radius,
          fill: 'none',
          stroke: 'rgba(148, 163, 184, 0.16)',
          strokeWidth: 28
        }),
        // Slices
        slices.map((slice, i) => {
          const isHovered = hoveredSlice === slice.name;
          return h('circle', {
            key: slice.name + i,
            cx: 120,
            cy: 120,
            r: radius,
            fill: 'none',
            stroke: slice.color,
            strokeWidth: isHovered ? 34 : 28,
            strokeDasharray: slice.strokeDasharray,
            strokeDashoffset: slice.strokeDashoffset,
            transform: 'rotate(-90 120 120)',
            style: {
              cursor: 'pointer',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : 'none',
              opacity: hoveredSlice && !isHovered ? 0.6 : 1
            },
            onMouseEnter: () => setHoveredSlice(slice.name),
            onMouseLeave: () => setHoveredSlice(null)
          });
        }),
        // Donut Center Text
        h('text', {
          x: 120,
          y: activeSlice ? 112 : 115,
          textAnchor: 'middle',
          fontSize: activeSlice ? '15px' : '16px',
          fontWeight: '800',
          fill: 'currentColor',
          fontFamily: 'var(--font-mono)'
        }, activeSlice ? formatCurrency(activeSlice.value, currency) : formatCurrency(totalVal, currency)),
        h('text', {
          x: 120,
          y: activeSlice ? 133 : 135,
          textAnchor: 'middle',
          fontSize: '10px',
          fontWeight: '700',
          fill: activeSlice ? activeSlice.color : 'var(--text-muted)',
          letterSpacing: '0.8px'
        }, activeSlice ? `${activeSlice.name.toUpperCase()} (${activeSlice.percent}%)` : 'TOTAL VALUATION')
      )
    ),
    h('div', { className: 'pie-legend' },
      slices.map(slice => {
        const isHovered = hoveredSlice === slice.name;
        return h('div', {
          key: slice.name,
          className: `pie-legend-row ${isHovered ? 'hovered' : ''}`,
          style: {
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 8,
            transition: 'all 0.15s ease',
            background: isHovered ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
            marginBottom: 6,
            border: isHovered ? `1px solid ${slice.color}` : '1px solid transparent'
          },
          onMouseEnter: () => setHoveredSlice(slice.name),
          onMouseLeave: () => setHoveredSlice(null)
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { className: 'pie-legend-dot', style: { backgroundColor: slice.color, width: 10, height: 10, borderRadius: '50%' } }),
            h('span', { className: 'pie-legend-name', style: { fontWeight: 600, fontSize: 13 } }, slice.name),
            slice.lowStockCount > 0 && h('span', { className: 'badge badge-warning', style: { fontSize: 10, padding: '1px 6px' } }, `${slice.lowStockCount} low stock`)
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
            h('span', { className: 'pie-legend-val', style: { fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13.5 } }, formatCurrency(slice.value, currency)),
            h('span', { className: 'pie-legend-pct', style: { fontWeight: 700, background: slice.color, color: '#fff', padding: '2px 7px', borderRadius: 12, fontSize: 11 } }, `${slice.percent}%`)
          )
        );
      })
    )
  );
}

// Raw Materials Stock & Valuation Pie / Donut Chart Component
function RawMaterialsPieChart({ rawMaterials = [], currency = '₹' }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  let totalVal = 0;
  const materialList = (rawMaterials || []).map(rm => {
    const qty = Number(rm.quantity) || 0;
    const cost = Number(rm.unit_cost) || 0;
    const val = qty * cost;
    totalVal += val;
    return {
      id: rm.id,
      name: rm.item_name || 'Material',
      sku: rm.sku || '',
      quantity: qty,
      unit: rm.unit || 'kg',
      unit_cost: cost,
      value: val
    };
  });

  if (totalVal === 0 && materialList.length > 0) {
    materialList.forEach(m => m.value = 100);
    totalVal = materialList.reduce((sum, m) => sum + m.value, 0);
  }

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'];
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.655

  let accumulatedPercent = 0;
  const slices = materialList.map((mat, idx) => {
    const percent = totalVal > 0 ? (mat.value / totalVal) : (1 / (materialList.length || 1));
    const strokeDash = (percent * circumference);
    const strokeOffset = (accumulatedPercent * circumference);
    accumulatedPercent += percent;
    return {
      ...mat,
      percent: Math.round(percent * 100),
      color: colors[idx % colors.length],
      strokeDasharray: `${strokeDash} ${circumference}`,
      strokeDashoffset: -strokeOffset
    };
  });

  const activeSlice = hoveredSlice ? slices.find(s => s.name === hoveredSlice) : null;

  return h('div', { className: 'card chart-card', style: { padding: '18px 22px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Raw materials valuation & share'),
        h('div', { className: 'card-subtitle' }, 'Visual inventory distribution across all raw materials and manufacturing inputs')
      ),
      h('span', { className: 'badge badge-neutral' }, `${materialList.length} Material Types`)
    ),
    materialList.length === 0 ?
      h('div', { style: { textAlign: 'center', padding: '30px 20px', color: '#64748b', fontSize: 13 } }, 'No raw materials available to chart. Add a material above to view stock valuation.') :
      h('div', { className: 'inventory-pie-widget enhanced-pie-widget' },
        h('div', { className: 'pie-chart-wrap' },
          h('svg', {
            viewBox: '0 0 240 240',
            width: 230,
            height: 230,
            className: 'pie-svg'
          },
            // Track Background
            h('circle', {
              cx: 120,
              cy: 120,
              r: radius,
              fill: 'none',
              stroke: 'rgba(148, 163, 184, 0.16)',
              strokeWidth: 28
            }),
            // Slices
            slices.map((slice, i) => {
              const isHovered = hoveredSlice === slice.name;
              return h('circle', {
                key: slice.name + i,
                cx: 120,
                cy: 120,
                r: radius,
                fill: 'none',
                stroke: slice.color,
                strokeWidth: isHovered ? 34 : 28,
                strokeDasharray: slice.strokeDasharray,
                strokeDashoffset: slice.strokeDashoffset,
                transform: 'rotate(-90 120 120)',
                style: {
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : 'none',
                  opacity: hoveredSlice && !isHovered ? 0.6 : 1
                },
                onMouseEnter: () => setHoveredSlice(slice.name),
                onMouseLeave: () => setHoveredSlice(null)
              });
            }),
            // Donut Center Text
            h('text', {
              x: 120,
              y: activeSlice ? 112 : 115,
              textAnchor: 'middle',
              fontSize: activeSlice ? '15px' : '16px',
              fontWeight: '800',
              fill: 'currentColor',
              fontFamily: 'var(--font-mono)'
            }, activeSlice ? formatCurrency(activeSlice.value, currency) : formatCurrency(totalVal, currency)),
            h('text', {
              x: 120,
              y: activeSlice ? 133 : 135,
              textAnchor: 'middle',
              fontSize: '10px',
              fontWeight: '700',
              fill: activeSlice ? activeSlice.color : 'var(--text-muted)',
              letterSpacing: '0.8px'
            }, activeSlice ? `${activeSlice.name.toUpperCase()} (${activeSlice.percent}%)` : 'TOTAL RM VALUATION')
          )
        ),
        h('div', { className: 'pie-legend' },
          slices.map(slice => {
            const isHovered = hoveredSlice === slice.name;
            return h('div', {
              key: slice.name,
              className: `pie-legend-row ${isHovered ? 'hovered' : ''}`,
              style: {
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 8,
                transition: 'all 0.15s ease',
                background: isHovered ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                marginBottom: 6,
                border: isHovered ? `1px solid ${slice.color}` : '1px solid transparent'
              },
              onMouseEnter: () => setHoveredSlice(slice.name),
              onMouseLeave: () => setHoveredSlice(null)
            },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
                h('span', { className: 'pie-legend-dot', style: { backgroundColor: slice.color, width: 10, height: 10, borderRadius: '50%' } }),
                h('div', null,
                  h('div', { className: 'pie-legend-name', style: { fontWeight: 600, fontSize: 13 } }, slice.name),
                  h('div', { style: { fontSize: 11, color: '#64748b' } }, `${slice.quantity} ${slice.unit} • ${slice.sku}`)
                )
              ),
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                h('span', { className: 'pie-legend-val', style: { fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13.5 } }, formatCurrency(slice.value, currency)),
                h('span', { className: 'pie-legend-pct', style: { fontWeight: 700, background: slice.color, color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11 } }, `${slice.percent}%`)
              )
            );
          })
        )
      )
  );
}

// Sales & Invoices Payment Status Chart Component
function SalesStatusChart({ sales = [], currency = '₹' }) {
  let paidSum = 0;
  let pendingSum = 0;
  let overdueSum = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  (sales || []).forEach(s => {
    const amt = Number(s.amount) || 0;
    if (s.status === 'Paid') {
      paidSum += amt;
      paidCount++;
    } else if (s.status === 'Overdue') {
      overdueSum += amt;
      overdueCount++;
    } else {
      pendingSum += amt;
      pendingCount++;
    }
  });

  const totalSum = paidSum + pendingSum + overdueSum;
  const totalInvoices = sales.length;
  const paidPct = totalSum > 0 ? Math.round((paidSum / totalSum) * 100) : 0;
  const pendingPct = totalSum > 0 ? Math.round((pendingSum / totalSum) * 100) : 0;
  const overduePct = totalSum > 0 ? Math.max(0, 100 - paidPct - pendingPct) : 0;

  return h('div', { className: 'card chart-card', style: { padding: '16px 20px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Invoice Payment Status & Cash Inflow'),
        h('div', { className: 'card-subtitle' }, 'Collection efficiency across all generated customer invoices')
      ),
      h('span', { className: 'badge badge-neutral' }, `${paidPct}% Collection Rate`)
    ),
    // Multi-segment horizontal status progress meter
    h('div', { className: 'status-meter-bar', style: { height: 14, borderRadius: 7, display: 'flex', overflow: 'hidden', background: 'rgba(148, 163, 184, 0.18)', marginBottom: 14 } },
      paidPct > 0 && h('div', { style: { width: `${paidPct}%`, background: '#10b981', transition: 'width 0.4s ease' }, title: `Paid: ${formatCurrency(paidSum, currency)} (${paidPct}%)` }),
      pendingPct > 0 && h('div', { style: { width: `${pendingPct}%`, background: '#f59e0b', transition: 'width 0.4s ease' }, title: `Pending: ${formatCurrency(pendingSum, currency)} (${pendingPct}%)` }),
      overduePct > 0 && h('div', { style: { width: `${overduePct}%`, background: '#ef4444', transition: 'width 0.4s ease' }, title: `Overdue: ${formatCurrency(overdueSum, currency)} (${overduePct}%)` })
    ),
    // 3 Status Cards Grid
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 } },
      h('div', { className: 'chart-stat-item', style: { borderLeft: '3px solid #10b981' } },
        h('div', { className: 'chart-stat-label' }, `● Paid Invoices (${paidCount})`),
        h('div', { className: 'chart-stat-val', style: { color: '#10b981' } }, formatCurrency(paidSum, currency)),
        h('div', { className: 'chart-stat-sub' }, `${paidPct}% of invoiced revenue`)
      ),
      h('div', { className: 'chart-stat-item', style: { borderLeft: '3px solid #f59e0b' } },
        h('div', { className: 'chart-stat-label' }, `● Pending Due (${pendingCount})`),
        h('div', { className: 'chart-stat-val', style: { color: '#f59e0b' } }, formatCurrency(pendingSum, currency)),
        h('div', { className: 'chart-stat-sub' }, `${pendingPct}% awaiting collection`)
      ),
      h('div', { className: 'chart-stat-item', style: { borderLeft: '3px solid #ef4444' } },
        h('div', { className: 'chart-stat-label' }, `● Overdue (${overdueCount})`),
        h('div', { className: 'chart-stat-val', style: { color: '#ef4444' } }, formatCurrency(overdueSum, currency)),
        h('div', { className: 'chart-stat-sub' }, `${overduePct}% past due date`)
      )
    )
  );
}

// Expenses by Category Chart Component
function ExpenseCategoryChart({ expenses = [], currency = '₹' }) {
  const catMap = {};
  let totalExpenses = 0;

  (expenses || []).forEach(e => {
    const cat = e.category || 'General';
    const amt = Number(e.amount) || 0;
    totalExpenses += amt;
    if (!catMap[cat]) catMap[cat] = { name: cat, amount: 0, count: 0 };
    catMap[cat].amount += amt;
    catMap[cat].count += 1;
  });

  const categories = Object.values(catMap).sort((a, b) => b.amount - a.amount);
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'];

  return h('div', { className: 'card chart-card', style: { padding: '16px 20px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Expenses by Category'),
        h('div', { className: 'card-subtitle' }, 'Operational spending breakdown and cost distribution')
      ),
      h('span', { className: 'badge badge-neutral' }, `${categories.length} Active Categories`)
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      categories.map((c, i) => {
        const pct = totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0;
        const color = colors[i % colors.length];
        return h('div', { key: c.name, style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600 } },
            h('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
              h('span', { style: { width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' } }),
              c.name,
              h('span', { style: { fontSize: 11, color: '#64748b', fontWeight: 400 } }, `(${c.count} records)`)
            ),
            h('span', { style: { fontFamily: 'var(--font-mono)' } },
              `${formatCurrency(c.amount, currency)} `,
              h('span', { style: { color: '#64748b', fontSize: 11, fontWeight: 400 } }, `(${pct}%)`)
            )
          ),
          h('div', { style: { height: 8, borderRadius: 4, background: 'rgba(148, 163, 184, 0.15)', overflow: 'hidden' } },
            h('div', { style: { width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 4, transition: 'width 0.3s ease' } })
          )
        );
      })
    )
  );
}

// Production Manufacturing Status Chart Component
function ProductionStatusChart({ productionRuns = [] }) {
  let completedCount = 0;
  let inProgressCount = 0;
  let plannedCount = 0;
  let completedUnits = 0;

  (productionRuns || []).forEach(r => {
    const qty = Number(r.quantity) || 0;
    if (r.status === 'Completed') {
      completedCount++;
      completedUnits += qty;
    } else if (r.status === 'In progress') {
      inProgressCount++;
    } else {
      plannedCount++;
    }
  });

  const totalRuns = productionRuns.length;
  const completionRate = totalRuns > 0 ? Math.round((completedCount / totalRuns) * 100) : 0;

  return h('div', { className: 'card chart-card', style: { padding: '16px 20px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Manufacturing Batch Health & Fulfillment'),
        h('div', { className: 'card-subtitle' }, 'Real-time output status across all scheduled production jobs')
      ),
      h('span', { className: 'badge badge-neutral' }, `${completionRate}% Completion Rate`)
    ),
    h('div', { className: 'status-meter-bar', style: { height: 12, borderRadius: 6, display: 'flex', overflow: 'hidden', background: 'rgba(148, 163, 184, 0.18)', marginBottom: 14 } },
      totalRuns > 0 && completedCount > 0 && h('div', { style: { width: `${(completedCount / totalRuns) * 100}%`, background: '#10b981', transition: 'width 0.3s ease' }, title: `Completed: ${completedCount}` }),
      totalRuns > 0 && inProgressCount > 0 && h('div', { style: { width: `${(inProgressCount / totalRuns) * 100}%`, background: '#3b82f6', transition: 'width 0.3s ease' }, title: `In Progress: ${inProgressCount}` }),
      totalRuns > 0 && plannedCount > 0 && h('div', { style: { width: `${(plannedCount / totalRuns) * 100}%`, background: '#f59e0b', transition: 'width 0.3s ease' }, title: `Planned: ${plannedCount}` })
    ),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 } },
      h('div', { className: 'chart-stat-item', style: { borderLeft: '3px solid #10b981' } },
        h('div', { className: 'chart-stat-label' }, '✓ Completed Batches'),
        h('div', { className: 'chart-stat-val', style: { color: '#10b981' } }, `${completedCount} runs`),
        h('div', { className: 'chart-stat-sub' }, `${completedUnits} units produced`)
      ),
      h('div', { className: 'chart-stat-item', style: { borderLeft: '3px solid #3b82f6' } },
        h('div', { className: 'chart-stat-label' }, '⚙ In Progress'),
        h('div', { className: 'chart-stat-val', style: { color: '#3b82f6' } }, `${inProgressCount} runs`),
        h('div', { className: 'chart-stat-sub' }, 'Active on shop floor')
      ),
      h('div', { className: 'chart-stat-item', style: { borderLeft: '3px solid #f59e0b' } },
        h('div', { className: 'chart-stat-label' }, '📅 Planned / Queued'),
        h('div', { className: 'chart-stat-val', style: { color: '#f59e0b' } }, `${plannedCount} runs`),
        h('div', { className: 'chart-stat-sub' }, 'Scheduled batches')
      )
    )
  );
}

// Reports Comparison Bar Chart Component
function ReportsComparisonChart({ reportsData = null, currency = '₹' }) {
  const rows = reportsData?.monthly || [
    { month: '2026-09', sales: 129200, expenses: 59950, net: 69250 }
  ];

  const maxVal = Math.max(1, ...rows.map(r => Math.max(Number(r.sales) || 0, Number(r.expenses) || 0)));

  return h('div', { className: 'card chart-card', style: { padding: '18px 20px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Monthly Revenue vs Expenses Comparison'),
        h('div', { className: 'card-subtitle' }, 'Visual comparison of monthly sales inflow vs operating expenses')
      ),
      h('div', { style: { display: 'flex', gap: 14, fontSize: 12 } },
        h('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          h('span', { style: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#2563eb' } }), 'Sales Revenue'
        ),
        h('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          h('span', { style: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#ef4444' } }), 'Operating Expenses'
        ),
        h('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          h('span', { style: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#10b981' } }), 'Net Profit'
        )
      )
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      rows.map(row => {
        const salesPct = Math.round(((Number(row.sales) || 0) / maxVal) * 100);
        const expPct = Math.round(((Number(row.expenses) || 0) / maxVal) * 100);
        const net = Number(row.net) || ((Number(row.sales) || 0) - (Number(row.expenses) || 0));

        return h('div', { key: row.month, style: { display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 8, background: 'var(--bg-secondary)' } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, fontWeight: 700 } },
            h('span', { style: { fontFamily: 'var(--font-mono)' } }, `Month: ${row.month}`),
            h('span', { style: { color: net >= 0 ? '#10b981' : '#ef4444', fontFamily: 'var(--font-mono)' } },
              `Net: ${formatCurrency(net, currency)}`
            )
          ),
          // Sales Bar
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { style: { width: 65, fontSize: 11, color: '#64748b' } }, 'Sales'),
            h('div', { style: { flex: 1, height: 14, borderRadius: 4, background: 'rgba(148, 163, 184, 0.15)', overflow: 'hidden' } },
              h('div', { style: { width: `${salesPct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: 4, transition: 'width 0.4s ease' } })
            ),
            h('span', { style: { width: 95, textAlign: 'right', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 } }, formatCurrency(row.sales, currency))
          ),
          // Expense Bar
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { style: { width: 65, fontSize: 11, color: '#64748b' } }, 'Expenses'),
            h('div', { style: { flex: 1, height: 14, borderRadius: 4, background: 'rgba(148, 163, 184, 0.15)', overflow: 'hidden' } },
              h('div', { style: { width: `${expPct}%`, height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', borderRadius: 4, transition: 'width 0.4s ease' } })
            ),
            h('span', { style: { width: 95, textAlign: 'right', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#64748b' } }, formatCurrency(row.expenses, currency))
          )
        );
      })
    )
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('forgeledger_sidebar_collapsed') === 'true'; } catch (_) { return false; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('forgeledger_theme') === 'dark'; } catch (_) { return false; }
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('forgeledger_theme', next ? 'dark' : 'light'); } catch (_) {}
      return next;
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('forgeledger_sidebar_collapsed', String(next)); } catch (_) {}
      return next;
    });
  };

  // Core Data Stores
  const [dashboard, setDashboard] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [productionRuns, setProductionRuns] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [userCompanies, setUserCompanies] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({ name: '', legal_name: '', gst_no: '', address: '' });
  const [companyActionLoading, setCompanyActionLoading] = useState(false);
  const [companyError, setCompanyError] = useState('');

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all'); // 'all', 'finished', 'raw', 'low_stock'

  // Modal States
  const [modalType, setModalType] = useState(null); // 'item', 'sale', 'expense', 'employee', 'production'
  const [formData, setFormData] = useState({});

  // Inline Raw Material Form State (Fig. 7)
  const [rawMaterialForm, setRawMaterialForm] = useState({ name: '', unit: 'kg', quantity: 0, unit_cost: 0 });

  // Auth Form State
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: 'demo@forgeledger.local', password: 'password123', companyName: 'Riverton Works' });
  const [authError, setAuthError] = useState('');

  // Filtered Inventory (Finished products / goods & category filtering)
  const filteredInventory = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (inventory || []).filter(item => {
      if (!item) return false;
      const cat = (item.category || '').toLowerCase();
      if (inventoryCategoryFilter === 'finished' && !cat.includes('finish')) return false;
      if (inventoryCategoryFilter === 'raw' && !cat.includes('raw')) return false;
      if (inventoryCategoryFilter === 'low_stock' && Number(item.quantity) > (Number(item.reorder_level) || 5)) return false;
      if (!q) return true;
      const name = (item.item_name || '').toLowerCase();
      const sku = (item.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q) || cat.includes(q);
    });
  }, [inventory, searchQuery, inventoryCategoryFilter]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (sales || []).filter(s => {
      if (!s) return false;
      if (!q) return true;
      const customer = (s.customer || '').toLowerCase();
      const invoice = (s.invoice_no || '').toLowerCase();
      return customer.includes(q) || invoice.includes(q);
    });
  }, [sales, searchQuery]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (expenses || []).filter(e => {
      if (!e) return false;
      if (!q) return true;
      const desc = (e.description || '').toLowerCase();
      const cat = (e.category || '').toLowerCase();
      return desc.includes(q) || cat.includes(q);
    });
  }, [expenses, searchQuery]);

  const distinctExpenseCategories = useMemo(() => {
    return new Set((expenses || []).map(e => e?.category || 'General')).size;
  }, [expenses]);

  // Initial Load: Check session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
          loadAllData();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  function loadAllData() {
    setLoading(true);
    Promise.all([
      fetch('/api/dashboard/summary').then(r => r.json()),
      fetch('/api/inventory').then(r => r.json()),
      fetch('/api/raw-materials').then(r => r.json()),
      fetch('/api/sales').then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
      fetch('/api/production').then(r => r.json()),
      fetch('/api/reports/monthly').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/companies').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json())
    ]).then(([d, i, rm, s, e, emp, p, rep, set, comp, me]) => {
      if (d.success) setDashboard(d.data);
      if (i.success) setInventory(i.data);
      if (rm.success) setRawMaterials(rm.data);
      if (s.success) setSales(s.data);
      if (e.success) setExpenses(e.data);
      if (emp.success) setEmployees(emp.data);
      if (p.success) setProductionRuns(p.data);
      if (rep.success) setReportsData(rep.data);
      if (set.success) setCompanySettings(set.data);
      if (comp.success && comp.data) setUserCompanies(comp.data);
      if (me.success && me.user) setCurrentUser(me.user);
      setLoading(false);
    }).catch(err => {
      console.error('Data load error:', err);
      setLoading(false);
    });
  }

  // Handle Login / Signup
  function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setCurrentUser(res.user);
          loadAllData();
        } else {
          setAuthError(res.error || 'Authentication failed');
        }
      })
      .catch(err => setAuthError(err.message));
  }

  function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      setCurrentUser(null);
      setDashboard(null);
    });
  }

  // Modal Submissions
  function handleCreateItem(e) {
    e.preventDefault();
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleCreateSale(e) {
    e.preventDefault();
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleCreateExpense(e) {
    e.preventDefault();
    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleCreateProduction(e) {
    e.preventDefault();
    fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleCreateEmployee(e) {
    e.preventDefault();
    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleAddRawMaterial(e) {
    e.preventDefault();
    fetch('/api/raw-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawMaterialForm)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setRawMaterialForm({ name: '', unit: 'kg', quantity: 0, unit_cost: 0 });
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleDelete(type, id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    fetch(`/api/${type}/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(res => {
        if (res.success) loadAllData();
        else alert(res.error);
      });
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companySettings)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          alert('Company settings updated successfully!');
          loadAllData();
        } else alert(res.error);
      });
  }

  function handleSwitchCompany(companyId) {
    setCompanyActionLoading(true);
    setCompanyError('');
    fetch('/api/companies/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId })
    })
      .then(r => r.json())
      .then(res => {
        setCompanyActionLoading(false);
        if (res.success) {
          setShowCompanyModal(false);
          setShowNewCompanyForm(false);
          loadAllData();
        } else {
          setCompanyError(res.error || 'Failed to switch company');
        }
      })
      .catch(err => {
        setCompanyActionLoading(false);
        setCompanyError(err.message);
      });
  }

  function handleCreateCompany(e) {
    e.preventDefault();
    if (!newCompanyForm.name || !newCompanyForm.name.trim()) {
      setCompanyError('Company name is required.');
      return;
    }
    setCompanyActionLoading(true);
    setCompanyError('');
    fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompanyForm)
    })
      .then(r => r.json())
      .then(res => {
        setCompanyActionLoading(false);
        if (res.success) {
          setNewCompanyForm({ name: '', legal_name: '', gst_no: '', address: '' });
          setShowNewCompanyForm(false);
          setShowCompanyModal(false);
          loadAllData();
        } else {
          setCompanyError(res.error || 'Failed to create company');
        }
      })
      .catch(err => {
        setCompanyActionLoading(false);
        setCompanyError(err.message);
      });
  }

  // Loading screen while checking session
  if (loading) {
    return h('div', { style: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b1329', color: '#fff', fontFamily: 'var(--font-sans)' } },
      h('div', { style: { textAlign: 'center' } },
        h('img', { src: '/logo.png', alt: 'ForgeLedger Logo', style: { width: 56, height: 56, borderRadius: 12, margin: '0 auto 16px', display: 'block', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' } }),
        h('div', { style: { fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#3b82f6' } }, 'ForgeLedger'),
        h('div', { style: { fontSize: 13, color: '#94a3b8' } }, 'Connecting to workspace...')
      )
    );
  }

  // Unauthenticated screen
  if (!currentUser) {
    return h('div', { className: 'modal-overlay', style: { background: '#0b1329' } },
      h('div', { className: 'modal-card', style: { maxWidth: 410 } },
        h('div', { style: { padding: '28px 24px 18px', textAlign: 'center' } },
          h('img', { src: '/logo.png', alt: 'ForgeLedger Logo', style: { width: 54, height: 54, borderRadius: 12, margin: '0 auto 14px', display: 'block', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' } }),
          h('h2', { style: { fontSize: 21, fontWeight: 800, color: '#0f172a' } }, 'ForgeLedger'),
          h('p', { style: { fontSize: 13, color: '#64748b', marginTop: 3 } }, 'Integrated Manufacturing Workspace')
        ),
        h('form', { onSubmit: handleAuthSubmit, style: { padding: '0 24px 24px' } },
          authError && h('div', { style: { background: '#fef2f2', color: '#b91c1c', padding: '9px 12px', borderRadius: 7, fontSize: 12.5, marginBottom: 14 } }, authError),
          authMode === 'signup' && h('div', { className: 'form-group', style: { marginBottom: 11 } },
            h('label', null, 'Full Name'),
            h('input', { className: 'form-input', value: authForm.name, onChange: e => setAuthForm({ ...authForm, name: e.target.value }), required: true })
          ),
          authMode === 'signup' && h('div', { className: 'form-group', style: { marginBottom: 11 } },
            h('label', null, 'Company / Factory Name'),
            h('input', { className: 'form-input', value: authForm.companyName, onChange: e => setAuthForm({ ...authForm, companyName: e.target.value }), required: true })
          ),
          h('div', { className: 'form-group', style: { marginBottom: 11 } },
            h('label', null, 'Email Address'),
            h('input', { className: 'form-input', type: 'email', value: authForm.email, onChange: e => setAuthForm({ ...authForm, email: e.target.value }), required: true })
          ),
          h('div', { className: 'form-group', style: { marginBottom: 18 } },
            h('label', null, 'Password'),
            h('input', { className: 'form-input', type: 'password', value: authForm.password, onChange: e => setAuthForm({ ...authForm, password: e.target.value }), required: true })
          ),
          h('button', { type: 'submit', className: 'btn btn-primary', style: { width: '100%', justifyContent: 'center', padding: '10px' } },
            authMode === 'login' ? 'Sign in to Workspace' : 'Create Free Workspace'
          ),
          h('div', { style: { textAlign: 'center', marginTop: 14, fontSize: 12.5, color: '#64748b' } },
            authMode === 'login' ? "Don't have a workspace? " : "Already have an account? ",
            h('a', {
              href: '#',
              onClick: (e) => { e.preventDefault(); setAuthMode(authMode === 'login' ? 'signup' : 'login'); },
              style: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' }
            }, authMode === 'login' ? 'Sign up' : 'Sign in')
          )
        )
      )
    );
  }

  return h('div', { className: `app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}` },
    // SIDEBAR
    h('aside', { className: `sidebar ${sidebarCollapsed ? 'collapsed' : ''}` },
      // Sidebar Header (Merged collapse toggle directly inside sidebar)
      h('div', { className: 'sidebar-header' },
        !sidebarCollapsed && h('div', { className: 'sidebar-title' }, 'NAVIGATION'),
        h('button', {
          className: 'sidebar-toggle-btn',
          onClick: toggleSidebar,
          title: sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
          'aria-label': sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
        },
          h(Icon, { name: sidebarCollapsed ? 'chevronRight' : 'chevronLeft', size: 14 })
        )
      ),

      // Navigation Items (Starts immediately below header; Settings removed as Profile handles account)
      h('nav', { className: 'sidebar-nav' },
        !sidebarCollapsed && h('div', { className: 'nav-section-title' }, 'WORKSPACE'),
        [
          { id: 'overview', label: 'Overview', icon: 'overview' },
          { id: 'inventory', label: 'Inventory', icon: 'inventory' },
          { id: 'sales', label: 'Sales & invoices', icon: 'sales' },
          { id: 'expenses', label: 'Expenses', icon: 'expenses' },
          { id: 'rawMaterials', label: 'Raw materials', icon: 'rawMaterials' },
          { id: 'production', label: 'Production', icon: 'production' },
          { id: 'payroll', label: 'Payroll', icon: 'payroll' },
          { id: 'reports', label: 'Reports', icon: 'reports' }
        ].map(item =>
          h('a', {
            key: item.id,
            className: `nav-item ${activeTab === item.id ? 'active' : ''}`,
            title: item.label,
            onClick: () => { setActiveTab(item.id); setSearchQuery(''); }
          },
            h(Icon, { name: item.icon }),
            !sidebarCollapsed && h('span', { className: 'nav-label' }, item.label)
          )
        )
      ),

      // Sidebar Footer (Company above profile, clicking profile opens Settings & Account)
      h('div', { className: 'sidebar-footer' },
        // 1. Company / Workspace Selector (Click to switch company, max 3)
        h('div', {
          className: 'workspace-selector',
          title: `Current workspace: ${currentUser?.company?.name || 'Company Workspace'} (Click to switch company)`,
          onClick: () => { setShowCompanyModal(true); setCompanyError(''); }
        },
          h('div', { className: 'workspace-avatar' }, currentUser?.company?.name?.charAt(0) || 'C'),
          !sidebarCollapsed && h('div', { className: 'workspace-info' },
            h('div', { className: 'workspace-name' }, currentUser?.company?.name || 'Company Workspace'),
            h('div', { className: 'workspace-sub' }, 'Click to switch company')
          ),
          !sidebarCollapsed && h('div', { className: 'company-count-pill', title: `${userCompanies.length || 1} of 3 companies managed` }, `${userCompanies.length || 1}/3`)
        ),

        // 2. Separate Profile & Account Option (Navigates to Settings)
        h('div', {
          className: `sidebar-account-btn ${activeTab === 'settings' ? 'active' : ''}`,
          title: `Account: ${currentUser?.name || 'Demo User'} (${currentUser?.email || 'demo@forgeledger.local'})`,
          onClick: () => { setActiveTab('settings'); }
        },
          h('div', { className: 'user-avatar' }, currentUser?.name?.charAt(0) || 'D'),
          !sidebarCollapsed && h('div', { className: 'account-info' },
            h('div', { className: 'account-name' }, currentUser?.name || 'Demo User'),
            h('div', { className: 'account-role' }, 'Account & company settings')
          )
        )
      )
    ),

    // MAIN CONTENT AREA
    h('div', { className: 'main-wrapper' },
      // Top Bar (Logo at top left, Logout button at top right)
      h('header', { className: 'top-header' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
          // Logo moved to top left
          h('div', { className: 'top-nav-brand' },
            h('img', { src: '/logo.png', alt: 'ForgeLedger Logo', className: 'brand-logo-img' }),
            h('div', { className: 'brand-text' },
              h('h1', null, 'forgeledger'),
              h('span', null, 'BUSINESS WORKSPACE')
            )
          ),
          h('div', { className: 'header-divider' }),
          h('div', { className: 'breadcrumb' },
            'Workspace / ',
            h('span', { className: 'current' },
              activeTab === 'overview' ? 'Business overview' :
              activeTab === 'inventory' ? 'Inventory' :
              activeTab === 'sales' ? 'Sales & invoices' :
              activeTab === 'expenses' ? 'Expenses' :
              activeTab === 'rawMaterials' ? 'Raw materials' :
              activeTab === 'production' ? 'Production' :
              activeTab === 'payroll' ? 'Payroll' :
              activeTab === 'reports' ? 'Reports' : 'Settings & Profile'
            )
          )
        ),
        h('div', { className: 'top-header-right' },
          h('div', { className: 'status-indicator' },
            h('div', { className: 'status-dot' }),
            'All systems normal'
          ),
          h('button', {
            className: 'theme-toggle-btn',
            onClick: toggleDarkMode,
            title: darkMode ? 'Switch to light mode' : 'Switch to dark mode',
            'aria-label': darkMode ? 'Switch to light mode' : 'Switch to dark mode'
          },
            h(Icon, { name: darkMode ? 'sun' : 'moon', size: 16 })
          ),
          // Logout button moved to top right
          h('button', {
            className: 'header-logout-btn',
            onClick: handleLogout,
            title: 'Sign out of ForgeLedger',
            'aria-label': 'Sign out'
          },
            h(Icon, { name: 'logout', size: 14 }),
            h('span', null, 'Sign out')
          )
        )
      ),

      // Content Body
      h('main', { className: 'content-body' },

        // ================= TAB: OVERVIEW (Fig. 8) =================
        activeTab === 'overview' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'YOUR BUSINESS AT A GLANCE'),
              h('h1', { className: 'page-title' }, 'Business overview'),
              h('p', { className: 'page-desc' }, "Here's what's happening in your workspace.")
            ),
            // Header Action: Single Primary Button (NO duplicate on this screen)
            h('div', { className: 'header-actions' },
              h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('sale'); } },
                h(Icon, { name: 'plus' }), 'New sale'
              )
            )
          ),

          // 4 Metric KPI Cards (Fig. 8)
          h('div', { className: 'metrics-grid' },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Sales this month'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'sales' }))
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.paidSales || 48600)),
              h('div', { className: 'metric-footer success' }, '↗ Current period')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Expenses this month'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'expenses' }))
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.totalExpenses || 59950)),
              h('div', { className: 'metric-footer' }, 'Recorded expenses')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Inventory items'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'inventory' }))
              ),
              h('div', { className: 'metric-value' }, dashboard?.inventoryCount || inventory.length),
              h('div', { className: 'metric-footer' }, `${dashboard?.lowStockCount || 0} items at low stock`)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Inventory value'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'inventory' }))
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.inventoryValue || 126760)),
              h('div', { className: 'metric-footer' }, 'Based on purchase price')
            )
          ),

          // Analytical Section: Inventory Breakdown Pie Chart + Operations / Stock Health
          h('div', { className: 'dashboard-analytics-grid' },
            // Inventory Category Valuation Pie Chart
            h('div', { className: 'card analytics-card' },
              h('div', { className: 'card-header' },
                h('div', null,
                  h('h3', { className: 'card-title' }, 'Inventory valuation & breakdown'),
                  h('div', { className: 'card-subtitle' }, 'Asset distribution by manufacturing category')
                ),
                h('button', {
                  className: 'btn btn-outline',
                  style: { padding: '4px 9px', fontSize: 11.5 },
                  onClick: () => setActiveTab('inventory')
                }, 'Manage stock →')
              ),
              h('div', { style: { padding: '18px 20px' } },
                h(InventoryPieChart, { inventory, rawMaterials, currency: '₹' })
              )
            ),

            // Stock Health & Production Status Card
            h('div', { className: 'card analytics-card' },
              h('div', { className: 'card-header' },
                h('div', null,
                  h('h3', { className: 'card-title' }, 'Manufacturing & stock health'),
                  h('div', { className: 'card-subtitle' }, 'Real-time inventory levels and active jobs')
                ),
                h('button', {
                  className: 'btn btn-outline',
                  style: { padding: '4px 9px', fontSize: 11.5 },
                  onClick: () => setActiveTab('production')
                }, 'Production →')
              ),
              h('div', { style: { padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 } },
                // Stock Health Breakdown
                h('div', null,
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, fontWeight: 600 } },
                    h('span', null, 'Stock Status Levels'),
                    h('span', { style: { color: inventory.some(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)) ? '#d97706' : '#10b981' } },
                      inventory.some(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)) ? '⚠️ Attention needed' : '✓ All items healthy'
                    )
                  ),
                  // Progress meter
                  h('div', { className: 'stock-health-bar' },
                    h('div', {
                      className: 'health-segment healthy',
                      style: { width: `${Math.max(10, ((inventory.filter(i => Number(i.quantity) > (Number(i.reorder_level) || 5)).length) / (inventory.length || 1)) * 100)}%` },
                      title: 'Adequate stock'
                    }),
                    h('div', {
                      className: 'health-segment warning',
                      style: { width: `${((inventory.filter(i => Number(i.quantity) <= (Number(i.reorder_level) || 5) && Number(i.quantity) > 0).length) / (inventory.length || 1)) * 100}%` },
                      title: 'Low stock'
                    })
                  ),
                  h('div', { className: 'stock-health-legend' },
                    h('span', { className: 'sh-pill healthy' }, `● ${inventory.filter(i => Number(i.quantity) > (Number(i.reorder_level) || 5)).length} In Stock`),
                    h('span', { className: 'sh-pill warning' }, `● ${inventory.filter(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)).length} Low Stock Alert`),
                    h('span', { className: 'sh-pill info' }, `● ${rawMaterials.length} Raw Material types`)
                  )
                ),

                // Active Production Runs
                h('div', { style: { borderTop: '1px solid var(--border-light)', paddingTop: 12 } },
                  h('div', { style: { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 } }, 'ACTIVE PRODUCTION RUNS'),
                  productionRuns.slice(0, 2).map((pr, idx) =>
                    h('div', { key: pr.id || idx, className: 'prod-run-item' },
                      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5 } },
                        h('strong', null, pr.product),
                        h('span', { className: `badge ${pr.status === 'Completed' ? 'badge-success' : pr.status === 'In progress' ? 'badge-info' : 'badge-neutral'}` }, pr.status)
                      ),
                      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 } },
                        h('span', null, `Batch: ${pr.run_date}`),
                        h('span', null, `${pr.quantity} units`)
                      )
                    )
                  )
                )
              )
            )
          ),

          // Split View: Recent Sales + Quick Actions
          h('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 22 } },
            // Recent Sales Table
            h('div', { className: 'card' },
              h('div', { className: 'card-header' },
                h('h3', { className: 'card-title' }, 'Recent sales'),
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                  h('button', {
                    className: 'btn btn-outline',
                    style: { padding: '4px 9px', fontSize: 11.5 },
                    onClick: () => exportToCsv('forgeledger_recent_sales', sales, {
                      invoice_no: 'Invoice No',
                      customer: 'Customer',
                      issued_date: 'Issued Date',
                      due_date: 'Due Date',
                      amount: 'Amount (INR)',
                      status: 'Payment Status'
                    })
                  }, h(Icon, { name: 'download', size: 13 }), 'Export CSV'),
                  h('a', {
                    href: '#',
                    onClick: (e) => { e.preventDefault(); setActiveTab('sales'); },
                    style: { fontSize: 12.5, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }
                  }, 'View all →')
                )
              ),
              h('div', { className: 'table-responsive' },
                h('table', { className: 'custom-table' },
                  h('thead', null,
                    h('tr', null,
                      h('th', null, 'Invoice'),
                      h('th', null, 'Customer'),
                      h('th', null, 'Date'),
                      h('th', null, 'Status'),
                      h('th', { style: { textAlign: 'right' } }, 'Amount')
                    )
                  ),
                  h('tbody', null,
                    sales.slice(0, 5).map(sale =>
                      h('tr', { key: sale.id },
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, sale.invoice_no),
                        h('td', null, sale.customer),
                        h('td', { style: { color: '#64748b' } }, sale.issued_date),
                        h('td', null,
                          h('span', {
                            className: `badge ${sale.status === 'Paid' ? 'badge-success' : sale.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`
                          }, sale.status)
                        ),
                        h('td', { style: { textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' } }, formatCurrency(sale.amount))
                      )
                    )
                  )
                )
              )
            ),

            // Quick Actions List (Distinct operational actions, no duplicates)
            h('div', { className: 'card quick-actions-card' },
              h('h3', { className: 'card-title', style: { marginBottom: 14 } }, 'Quick actions'),
              [
                { title: 'Add inventory', desc: 'Create or update a product', icon: 'inventory', action: () => { setFormData({}); setModalType('item'); } },
                { title: 'Record expense', desc: 'Track a business expense', icon: 'expenses', action: () => { setFormData({}); setModalType('expense'); } },
                { title: 'Raw materials', desc: 'Manage factory ingredients and stock', icon: 'rawMaterials', action: () => setActiveTab('rawMaterials') },
                { title: 'View reports', desc: 'Review sales and expenses analytics', icon: 'reports', action: () => setActiveTab('reports') }
              ].map(item =>
                h('div', {
                  key: item.title,
                  className: 'quick-action-item',
                  onClick: item.action
                },
                  h('div', { className: 'qa-left' },
                    h('div', { className: 'qa-icon' }, h(Icon, { name: item.icon })),
                    h('div', null,
                      h('div', { className: 'qa-title' }, item.title),
                      h('div', { className: 'qa-desc' }, item.desc)
                    )
                  ),
                  h(Icon, { name: 'arrowRight', size: 15, className: 'qa-arrow' })
                )
              ),
              h('div', { className: 'tip-banner' },
                h(Icon, { name: 'overview', size: 16, style: { color: '#64748b', marginTop: 1, flexShrink: 0 } }),
                h('p', null, 'Keep your records current. Regular updates help make management reports more useful.')
              )
            )
          )
        ),

        // ================= TAB: INVENTORY (Fig. 4) =================
        activeTab === 'inventory' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'PRODUCTS & STOCK'),
              h('h1', { className: 'page-title' }, 'Inventory'),
              h('p', { className: 'page-desc' }, 'Manage products, stock levels, pricing and GST rates.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_inventory', inventory, {
                  item_name: 'Item Name',
                  sku: 'SKU',
                  category: 'Category',
                  quantity: 'Quantity',
                  unit: 'Unit',
                  unit_cost: 'Purchase Price (INR)',
                  reorder_level: 'Reorder Level'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export CSV'),
              h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('item'); } },
                h(Icon, { name: 'plus' }), 'Add item'
              )
            )
          ),

          // 3 Metric Cards (Fig. 4)
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total items')
              ),
              h('div', { className: 'metric-value' }, inventory.length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Low stock (≤ 5)')
              ),
              h('div', { className: 'metric-value' }, inventory.filter(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)).length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Stock purchase value')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.inventoryValue || 126760))
            )
          ),

          // Inventory Valuation Pie Chart
          h('div', { className: 'card', style: { padding: '16px 20px', marginBottom: 20 } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
              h('div', null,
                h('h3', { className: 'card-title' }, 'Inventory breakdown by category'),
                h('div', { className: 'card-subtitle' }, 'Visual valuation of materials and finished products')
              ),
              h('span', { className: 'badge badge-neutral' }, `${inventory.length + rawMaterials.length} total item types`)
            ),
            h(InventoryPieChart, { inventory, rawMaterials, currency: '₹' })
          ),

          // Category Filter Pills
          h('div', { className: 'filter-pills-row' },
            [
              { id: 'all', label: `All items (${inventory.length})` },
              { id: 'finished', label: `Finished goods (${inventory.filter(i => (i.category || '').toLowerCase().includes('finish')).length})` },
              { id: 'raw', label: `Raw materials (${inventory.filter(i => (i.category || '').toLowerCase().includes('raw')).length})` },
              { id: 'low_stock', label: `⚠️ Low stock alert (${inventory.filter(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)).length})` }
            ].map(pill =>
              h('button', {
                key: pill.id,
                className: `filter-pill ${inventoryCategoryFilter === pill.id ? 'active' : ''}`,
                onClick: () => setInventoryCategoryFilter(pill.id)
              }, pill.label)
            )
          ),

          // Clean Search Bar Row (Fig. 4)
          h('div', { className: 'search-bar-row' },
            h('div', { className: 'search-wrapper' },
              h(Icon, { name: 'search', size: 15, className: 'search-icon' }),
              h('input', {
                className: 'search-input',
                placeholder: 'Search item name, SKU, or category...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              })
            ),
            h('div', { className: 'item-count-label' }, `${filteredInventory.length} items`)
          ),

          // Inventory Table (Fig. 4)
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'ITEM / SKU'),
                    h('th', null, 'STOCK'),
                    h('th', null, 'UNIT'),
                    h('th', null, 'PURCHASE PRICE'),
                    h('th', null, 'SELLING PRICE'),
                    h('th', null, 'GST'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                  )
                ),
                h('tbody', null,
                  filteredInventory.length === 0 ?
                    h('tr', null, h('td', { colSpan: 7, className: 'empty-state' }, 'No inventory items found')) :
                    filteredInventory.map(item =>
                      h('tr', { key: item.id },
                        h('td', null,
                          h('div', { style: { fontWeight: 700 } }, item.item_name),
                          h('div', { style: { fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)' } }, item.sku)
                        ),
                        h('td', null,
                          h('span', {
                            className: `badge ${Number(item.quantity) <= 5 ? 'badge-danger' : 'badge-success'}`
                          }, item.quantity)
                        ),
                        h('td', { style: { color: '#64748b' } }, item.unit || 'pcs'),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(item.unit_cost)),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(Number(item.unit_cost) * 1.3)),
                        h('td', null, '5%'),
                        h('td', { style: { textAlign: 'right' } },
                          h('div', { style: { display: 'inline-flex', gap: 6 } },
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5 },
                              onClick: () => { setFormData(item); setModalType('item'); }
                            }, 'Edit'),
                            h('button', {
                              className: 'btn btn-danger-outline',
                              style: { padding: '4px 8px' },
                              onClick: () => handleDelete('inventory', item.id)
                            }, h(Icon, { name: 'trash', size: 13 }))
                          )
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: SALES & INVOICES (Fig. 5) =================
        activeTab === 'sales' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'REVENUE & INVOICES'),
              h('h1', { className: 'page-title' }, 'Sales & invoices'),
              h('p', { className: 'page-desc' }, 'Create sales with multiple inventory items and track invoice totals.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_all_sales', sales, {
                  invoice_no: 'Invoice No',
                  customer: 'Customer',
                  issued_date: 'Issued Date',
                  due_date: 'Due Date',
                  amount: 'Amount (INR)',
                  status: 'Payment Status'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export CSV'),
              h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('sale'); } },
                h(Icon, { name: 'plus' }), 'New sale'
              )
            )
          ),

          // 3 Metric Cards (Fig. 5)
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total invoices')
              ),
              h('div', { className: 'metric-value' }, sales.length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Recorded revenue')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.paidSales || 48600))
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Pending payments')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.pendingSales || 32400))
            )
          ),

          // Sales Invoice Payment Status Chart
          h(SalesStatusChart, { sales, currency: '₹' }),

          // Search Bar Row (Fig. 5)
          h('div', { className: 'search-bar-row' },
            h('div', { className: 'search-wrapper' },
              h(Icon, { name: 'search', size: 15, className: 'search-icon' }),
              h('input', {
                className: 'search-input',
                placeholder: 'Search invoice or customer...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              })
            ),
            h('div', { className: 'item-count-label' }, `${filteredSales.length} invoices`)
          ),

          // Sales Table (Fig. 5)
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'INVOICE'),
                    h('th', null, 'CUSTOMER'),
                    h('th', null, 'DATE'),
                    h('th', null, 'SUBTOTAL'),
                    h('th', null, 'GST'),
                    h('th', null, 'STATUS'),
                    h('th', { style: { textAlign: 'right' } }, 'TOTAL'),
                    h('th', { style: { width: 60 } }, '')
                  )
                ),
                h('tbody', null,
                  filteredSales.length === 0 ?
                    h('tr', null, h('td', { colSpan: 8, className: 'empty-state' }, 'No sales invoices recorded')) :
                    filteredSales.map(sale =>
                      h('tr', { key: sale.id },
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700 } }, sale.invoice_no),
                        h('td', null,
                          h('div', { style: { fontWeight: 600 } }, sale.customer),
                          h('div', { style: { fontSize: 11, color: '#64748b' } }, '9999999999')
                        ),
                        h('td', { style: { color: '#64748b' } }, sale.issued_date),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(Number(sale.amount) / 1.05)),
                        h('td', { style: { fontFamily: 'var(--font-mono)', color: '#64748b' } }, formatCurrency(Number(sale.amount) - (Number(sale.amount) / 1.05))),
                        h('td', null,
                          h('span', {
                            className: `badge ${sale.status === 'Paid' ? 'badge-success' : sale.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`
                          }, sale.status)
                        ),
                        h('td', { style: { textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' } }, formatCurrency(sale.amount)),
                        h('td', { style: { textAlign: 'right' } },
                          h('button', {
                            className: 'btn btn-danger-outline',
                            style: { padding: '4px 8px' },
                            onClick: () => handleDelete('sales', sale.id)
                          }, h(Icon, { name: 'trash', size: 13 }))
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: EXPENSES (Fig. 6) =================
        activeTab === 'expenses' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'COSTS & OUTGOINGS'),
              h('h1', { className: 'page-title' }, 'Expenses'),
              h('p', { className: 'page-desc' }, 'Record and review your business spending.')
            ),
            h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('expense'); } },
              h(Icon, { name: 'plus' }), 'Add expense'
            )
          ),

          // 3 Metric Cards (Fig. 6)
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total records')
              ),
              h('div', { className: 'metric-value' }, expenses.length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total expenses')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.totalExpenses || 59950))
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Categories')
              ),
              h('div', { className: 'metric-value' }, distinctExpenseCategories || 3)
            )
          ),

          // Expenses Outflow by Category Chart
          h(ExpenseCategoryChart, { expenses, currency: '₹' }),

          // Search Row (Fig. 6)
          h('div', { className: 'search-bar-row' },
            h('div', { className: 'search-wrapper' },
              h(Icon, { name: 'search', size: 15, className: 'search-icon' }),
              h('input', {
                className: 'search-input',
                placeholder: 'Search expenses or categories...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              })
            ),
            h('div', { className: 'item-count-label' }, `${filteredExpenses.length} records`)
          ),

          // Expenses Table (Fig. 6)
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'EXPENSE'),
                    h('th', null, 'CATEGORY'),
                    h('th', null, 'DATE'),
                    h('th', null, 'PAYMENT METHOD'),
                    h('th', null, 'AMOUNT'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTION')
                  )
                ),
                h('tbody', null,
                  filteredExpenses.length === 0 ?
                    h('tr', null, h('td', { colSpan: 6, className: 'empty-state' }, 'No expenses found')) :
                    filteredExpenses.map(exp =>
                      h('tr', { key: exp.id },
                        h('td', { style: { fontWeight: 600 } }, exp.description),
                        h('td', null, h('span', { className: 'badge badge-neutral' }, exp.category)),
                        h('td', { style: { color: '#64748b' } }, exp.expense_date),
                        h('td', { style: { color: '#64748b' } }, exp.payment_method),
                        h('td', { style: { fontWeight: 700, fontFamily: 'var(--font-mono)' } }, formatCurrency(exp.amount)),
                        h('td', { style: { textAlign: 'right' } },
                          h('button', {
                            className: 'btn btn-danger-outline',
                            style: { padding: '4px 8px' },
                            onClick: () => handleDelete('expenses', exp.id)
                          }, h(Icon, { name: 'trash', size: 13 }))
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: RAW MATERIALS (Fig. 7) =================
        activeTab === 'rawMaterials' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'MATERIALS & STOCK'),
              h('h1', { className: 'page-title' }, 'Raw materials'),
              h('p', { className: 'page-desc' }, 'Track ingredients and manufacturing inputs separately from finished goods.')
            )
          ),

          // Add Raw Material Inline Form (Fig. 7)
          h('div', { className: 'inline-form-card' },
            h('h3', { style: { fontSize: 14, fontWeight: 700, color: '#0f172a' } }, 'Add raw material'),
            h('form', { onSubmit: handleAddRawMaterial, className: 'inline-form-grid' },
              h('div', { className: 'form-group' },
                h('label', null, 'Name'),
                h('input', {
                  className: 'form-input',
                  placeholder: 'Enter material name',
                  value: rawMaterialForm.name,
                  onChange: e => setRawMaterialForm({ ...rawMaterialForm, name: e.target.value }),
                  required: true
                })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'SKU'),
                h('input', { className: 'form-input', value: 'Auto-generated', disabled: true, style: { background: '#f8fafc', color: '#94a3b8' } })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Unit'),
                h('input', {
                  className: 'form-input',
                  placeholder: 'kg',
                  value: rawMaterialForm.unit,
                  onChange: e => setRawMaterialForm({ ...rawMaterialForm, unit: e.target.value })
                })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Quantity'),
                h('input', {
                  className: 'form-input',
                  type: 'number',
                  step: '0.01',
                  placeholder: '0',
                  value: rawMaterialForm.quantity,
                  onChange: e => setRawMaterialForm({ ...rawMaterialForm, quantity: e.target.value })
                })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Unit cost (₹)'),
                h('input', {
                  className: 'form-input',
                  type: 'number',
                  step: '0.01',
                  placeholder: '0',
                  value: rawMaterialForm.unit_cost,
                  onChange: e => setRawMaterialForm({ ...rawMaterialForm, unit_cost: e.target.value })
                })
              ),
              h('button', { type: 'submit', className: 'btn btn-primary', style: { height: 38 } }, 'Add material')
            )
          ),

          // Raw Materials Stock & Valuation Pie Chart
          h(RawMaterialsPieChart, { rawMaterials, currency: '₹' }),

          // Raw Material Table (Fig. 7)
          h('div', { className: 'card' },
            h('div', { className: 'card-header' },
              h('div', null,
                h('h3', { className: 'card-title' }, 'Material stock'),
                h('div', { className: 'card-subtitle' }, 'Review available manufacturing inputs.')
              ),
              h('div', { className: 'item-count-label' }, `${rawMaterials.length} items`)
            ),
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'SKU'),
                    h('th', null, 'MATERIAL'),
                    h('th', null, 'STOCK'),
                    h('th', null, 'UNIT COST'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTION')
                  )
                ),
                h('tbody', null,
                  rawMaterials.length === 0 ?
                    h('tr', null, h('td', { colSpan: 5, className: 'empty-state' }, 'No raw materials yet. Add a raw material using the form above.')) :
                    rawMaterials.map(mat =>
                      h('tr', { key: mat.id },
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, mat.sku),
                        h('td', { style: { fontWeight: 700 } }, mat.item_name),
                        h('td', { style: { fontWeight: 700, color: '#059669' } }, `${mat.quantity} ${mat.unit}`),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(mat.unit_cost)),
                        h('td', { style: { textAlign: 'right' } },
                          h('button', {
                            className: 'btn btn-danger-outline',
                            style: { padding: '4px 8px' },
                            onClick: () => handleDelete('raw-materials', mat.id)
                          }, h(Icon, { name: 'trash', size: 13 }))
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: PRODUCTION =================
        activeTab === 'production' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'MANUFACTURING & RUNS'),
              h('h1', { className: 'page-title' }, 'Production'),
              h('p', { className: 'page-desc' }, 'Track manufacturing batches, planned dates, and finished output.')
            ),
            h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('production'); } },
              h(Icon, { name: 'plus' }), 'New production run'
            )
          ),

          // 3 Metric Cards for Production
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total Batches')
              ),
              h('div', { className: 'metric-value' }, productionRuns.length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'In-Progress Jobs')
              ),
              h('div', { className: 'metric-value' }, productionRuns.filter(r => r.status === 'In progress').length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Completed Batches')
              ),
              h('div', { className: 'metric-value' }, productionRuns.filter(r => r.status === 'Completed').length)
            )
          ),

          // Production Batch Health & Status Chart
          h(ProductionStatusChart, { productionRuns }),

          // Production Table
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'RUN DATE'),
                    h('th', null, 'PRODUCT'),
                    h('th', null, 'QUANTITY'),
                    h('th', null, 'STATUS'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTION')
                  )
                ),
                h('tbody', null,
                  productionRuns.length === 0 ?
                    h('tr', null, h('td', { colSpan: 5, className: 'empty-state' }, 'No production runs recorded')) :
                    productionRuns.map(run =>
                      h('tr', { key: run.id },
                        h('td', { style: { color: '#64748b' } }, run.run_date),
                        h('td', { style: { fontWeight: 700 } }, run.product),
                        h('td', { style: { fontWeight: 800, fontFamily: 'var(--font-mono)' } }, `${run.quantity} units`),
                        h('td', null,
                          h('span', {
                            className: `badge ${run.status === 'Completed' ? 'badge-success' : run.status === 'In progress' ? 'badge-warning' : 'badge-info'}`
                          }, run.status)
                        ),
                        h('td', { style: { textAlign: 'right' } },
                          run.status !== 'Completed' && h('button', {
                            className: 'btn btn-outline',
                            style: { padding: '4px 8px', fontSize: 11.5 },
                            onClick: () => {
                              fetch(`/api/production/${run.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Completed' })
                              }).then(() => loadAllData());
                            }
                          }, 'Mark Completed')
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: PAYROLL =================
        activeTab === 'payroll' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'HUMAN RESOURCES'),
              h('h1', { className: 'page-title' }, 'Payroll'),
              h('p', { className: 'page-desc' }, 'Manage employee compensation, roles and monthly salaries.')
            ),
            h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('employee'); } },
              h(Icon, { name: 'plus' }), 'Add employee'
            )
          ),

          // 3 Metric Cards
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total staff')
              ),
              h('div', { className: 'metric-value' }, employees.length)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Monthly payroll')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.monthlyPayroll || 28000))
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Active employees')
              ),
              h('div', { className: 'metric-value' }, employees.filter(e => e.status === 'Active').length)
            )
          ),

          // Employees Table
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'EMPLOYEE'),
                    h('th', null, 'ROLE'),
                    h('th', null, 'MONTHLY SALARY'),
                    h('th', null, 'STATUS'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTION')
                  )
                ),
                h('tbody', null,
                  employees.length === 0 ?
                    h('tr', null, h('td', { colSpan: 5, className: 'empty-state' }, 'No employees recorded')) :
                    employees.map(emp =>
                      h('tr', { key: emp.id },
                        h('td', { style: { fontWeight: 700 } }, emp.name),
                        h('td', null, emp.role),
                        h('td', { style: { fontWeight: 800, fontFamily: 'var(--font-mono)' } }, formatCurrency(emp.monthly_salary)),
                        h('td', null,
                          h('span', { className: `badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}` }, emp.status)
                        ),
                        h('td', { style: { textAlign: 'right' } },
                          h('button', {
                            className: 'btn btn-danger-outline',
                            style: { padding: '4px 8px' },
                            onClick: () => handleDelete('employees', emp.id)
                          }, h(Icon, { name: 'trash', size: 13 }))
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: REPORTS =================
        activeTab === 'reports' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'BUSINESS ANALYTICS'),
              h('h1', { className: 'page-title' }, 'Reports'),
              h('p', { className: 'page-desc' }, 'Operational sales, expenses and net monthly performance summaries.')
            )
          ),

          // 3 Summary Cards
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total Sales')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(reportsData?.totalSales || 129200))
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total Expenses')
              ),
              h('div', { className: 'metric-value' }, formatCurrency(reportsData?.totalExpenses || 59950))
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Net Operational Margin')
              ),
              h('div', { className: 'metric-value', style: { color: (reportsData?.netMargin || 69250) >= 0 ? '#059669' : '#dc2626' } },
                formatCurrency(reportsData?.netMargin || 69250)
              )
            )
          ),

          // Monthly Revenue vs Expenses Comparison Chart
          h(ReportsComparisonChart, { reportsData, currency: '₹' }),

          // Monthly Summary Table
          h('div', { className: 'card' },
            h('div', { className: 'card-header' },
              h('h3', { className: 'card-title' }, 'Monthly Performance Summary'),
              h('div', { className: 'item-count-label' }, 'Aggregated by issue and expense dates')
            ),
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'MONTH'),
                    h('th', null, 'SALES'),
                    h('th', null, 'EXPENSES'),
                    h('th', { style: { textAlign: 'right' } }, 'NET MARGIN')
                  )
                ),
                h('tbody', null,
                  (reportsData?.monthly || [
                    { month: '2026-09', sales: 129200, expenses: 59950, net: 69250 }
                  ]).map(row =>
                    h('tr', { key: row.month },
                      h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, row.month),
                      h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, formatCurrency(row.sales)),
                      h('td', { style: { fontFamily: 'var(--font-mono)', color: '#64748b' } }, formatCurrency(row.expenses)),
                      h('td', {
                        style: {
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: row.net >= 0 ? '#059669' : '#dc2626'
                        }
                      }, formatCurrency(row.net))
                    )
                  )
                )
              )
            )
          )
        ),

        // ================= TAB: SETTINGS =================
        activeTab === 'settings' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'CONFIGURATION & PROFILE'),
              h('h1', { className: 'page-title' }, 'Company Settings'),
              h('p', { className: 'page-desc' }, 'Update legal identity, tax registration, and factory address for the currently active company.')
            )
          ),

          // Active Company Indicator (Requirement: Profile only shows the company you are currently on)
          h('div', { className: 'active-company-banner' },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
              h('div', { className: 'workspace-avatar', style: { width: 42, height: 42, fontSize: 17, background: '#2563eb', color: '#fff' } }, currentUser?.company?.name?.charAt(0) || 'C'),
              h('div', null,
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                  h('strong', { style: { fontSize: 15, color: 'var(--text-primary)' } }, currentUser?.company?.name || 'Active Workspace'),
                  h('span', { className: 'badge badge-success', style: { fontSize: 11, padding: '2px 8px' } }, '✓ Active Workspace')
                ),
                h('div', { style: { fontSize: 12.5, color: '#64748b', marginTop: 2 } },
                  `Company ID #${currentUser?.company_id || ''} • Managing ${userCompanies.length}/3 companies • Settings changes apply strictly to this workspace only`
                )
              )
            ),
            h('button', {
              className: 'btn btn-outline',
              style: { fontSize: 12, padding: '6px 12px' },
              onClick: () => { setShowCompanyModal(true); setCompanyError(''); }
            }, 'Switch Company')
          ),

          h('div', { className: 'card', style: { maxWidth: 620, padding: 22 } },
            h('form', { onSubmit: handleSaveSettings },
              h('div', { className: 'form-group', style: { marginBottom: 12 } },
                h('label', null, 'Company Display Name'),
                h('input', {
                  className: 'form-input',
                  value: companySettings?.name || '',
                  onChange: e => setCompanySettings({ ...companySettings, name: e.target.value })
                })
              ),
              h('div', { className: 'form-group', style: { marginBottom: 12 } },
                h('label', null, 'Legal Registered Name'),
                h('input', {
                  className: 'form-input',
                  value: companySettings?.legal_name || '',
                  onChange: e => setCompanySettings({ ...companySettings, legal_name: e.target.value })
                })
              ),
              h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } },
                h('div', { className: 'form-group' },
                  h('label', null, 'GST Number'),
                  h('input', {
                    className: 'form-input',
                    value: companySettings?.gst_no || '',
                    onChange: e => setCompanySettings({ ...companySettings, gst_no: e.target.value })
                  })
                ),
                h('div', { className: 'form-group' },
                  h('label', null, 'Registration No'),
                  h('input', {
                    className: 'form-input',
                    value: companySettings?.registration_no || '',
                    onChange: e => setCompanySettings({ ...companySettings, registration_no: e.target.value })
                  })
                )
              ),
              h('div', { className: 'form-group', style: { marginBottom: 16 } },
                h('label', null, 'Factory / Office Address'),
                h('textarea', {
                  className: 'form-textarea',
                  rows: 3,
                  value: companySettings?.address || '',
                  onChange: e => setCompanySettings({ ...companySettings, address: e.target.value })
                })
              ),
              h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Changes')
            )
          )
        )
      )
    ),

    // ================= MODALS =================
    modalType === 'item' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('h3', null, formData.id ? 'Edit Inventory Item' : 'Add Inventory Item'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateItem },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Item Name'),
              h('input', { className: 'form-input', defaultValue: formData.item_name || '', placeholder: 'e.g. Steel sheets, 2mm', required: true, onChange: e => setFormData({ ...formData, item_name: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'SKU (Stock Keeping Unit)'),
              h('input', { className: 'form-input', defaultValue: formData.sku || '', placeholder: 'e.g. RM-ST-002', onChange: e => setFormData({ ...formData, sku: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Category'),
              h('select', { className: 'form-select', defaultValue: formData.category || 'Finished good', onChange: e => setFormData({ ...formData, category: e.target.value }) },
                h('option', { value: 'Finished good' }, 'Finished good'),
                h('option', { value: 'Raw material' }, 'Raw material'),
                h('option', { value: 'General' }, 'General')
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Quantity'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', defaultValue: formData.quantity || '', placeholder: '0.00', required: true, onChange: e => setFormData({ ...formData, quantity: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Unit'),
                h('input', { className: 'form-input', defaultValue: formData.unit || 'units', placeholder: 'e.g. units, sheets, kg', onChange: e => setFormData({ ...formData, unit: e.target.value }) })
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Unit Cost (₹)'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', defaultValue: formData.unit_cost || '', placeholder: '0.00', onChange: e => setFormData({ ...formData, unit_cost: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Reorder Level'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', defaultValue: formData.reorder_level || '30', placeholder: '30.00', onChange: e => setFormData({ ...formData, reorder_level: e.target.value }) })
              )
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Item')
          )
        )
      )
    ),

    modalType === 'sale' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('h3', null, 'New Sales Invoice'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateSale },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Customer Name'),
              h('input', { className: 'form-input', placeholder: 'e.g. Northstar Retail', required: true, onChange: e => setFormData({ ...formData, customer: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Invoice Number'),
              h('input', { className: 'form-input', placeholder: 'e.g. INV-1049', onChange: e => setFormData({ ...formData, invoice_no: e.target.value }) })
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Issued Date'),
                h('input', { className: 'form-input', type: 'date', defaultValue: new Date().toISOString().split('T')[0], onChange: e => setFormData({ ...formData, issued_date: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Due Date'),
                h('input', { className: 'form-input', type: 'date', onChange: e => setFormData({ ...formData, due_date: e.target.value }) })
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Total Amount (₹)'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', placeholder: '0.00', required: true, onChange: e => setFormData({ ...formData, amount: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Payment Status'),
                h('select', { className: 'form-select', onChange: e => setFormData({ ...formData, status: e.target.value }) },
                  h('option', { value: 'Paid' }, 'Paid'),
                  h('option', { value: 'Pending' }, 'Pending'),
                  h('option', { value: 'Overdue' }, 'Overdue')
                )
              )
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Invoice')
          )
        )
      )
    ),

    modalType === 'expense' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('h3', null, 'Record Business Expense'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateExpense },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Expense Description'),
              h('input', { className: 'form-input', placeholder: 'e.g. Factory electricity bill', required: true, onChange: e => setFormData({ ...formData, description: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Category'),
              h('select', { className: 'form-select', onChange: e => setFormData({ ...formData, category: e.target.value }) },
                h('option', { value: 'Utilities' }, 'Utilities'),
                h('option', { value: 'Materials' }, 'Materials'),
                h('option', { value: 'Maintenance' }, 'Maintenance'),
                h('option', { value: 'General' }, 'General')
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Amount (₹)'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', placeholder: '0.00', required: true, onChange: e => setFormData({ ...formData, amount: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Payment Method'),
                h('select', { className: 'form-select', onChange: e => setFormData({ ...formData, payment_method: e.target.value }) },
                  h('option', { value: 'Bank transfer' }, 'Bank transfer'),
                  h('option', { value: 'UPI' }, 'UPI'),
                  h('option', { value: 'Cash' }, 'Cash'),
                  h('option', { value: 'Cheque' }, 'Cheque')
                )
              )
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Expense Date'),
              h('input', { className: 'form-input', type: 'date', defaultValue: new Date().toISOString().split('T')[0], onChange: e => setFormData({ ...formData, expense_date: e.target.value }) })
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Expense')
          )
        )
      )
    ),

    modalType === 'production' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('h3', null, 'New Production Run'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateProduction },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Target Product'),
              h('input', { className: 'form-input', placeholder: 'e.g. Assembly bracket', required: true, onChange: e => setFormData({ ...formData, product: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Planned Output Quantity'),
              h('input', { className: 'form-input', type: 'number', step: '0.01', placeholder: '0.00', required: true, onChange: e => setFormData({ ...formData, quantity: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Run Date'),
              h('input', { className: 'form-input', type: 'date', defaultValue: new Date().toISOString().split('T')[0], onChange: e => setFormData({ ...formData, run_date: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Status'),
              h('select', { className: 'form-select', onChange: e => setFormData({ ...formData, status: e.target.value }) },
                h('option', { value: 'Planned' }, 'Planned'),
                h('option', { value: 'In progress' }, 'In progress'),
                h('option', { value: 'Completed' }, 'Completed')
              )
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Run')
          )
        )
      )
    ),

    modalType === 'employee' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('h3', null, 'Add Employee'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateEmployee },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Employee Name'),
              h('input', { className: 'form-input', placeholder: 'e.g. Suresh K', required: true, onChange: e => setFormData({ ...formData, name: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Role / Position'),
              h('input', { className: 'form-input', placeholder: 'e.g. Production Operator', required: true, onChange: e => setFormData({ ...formData, role: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Monthly Salary (₹)'),
              h('input', { className: 'form-input', type: 'number', step: '0.01', placeholder: '0.00', required: true, onChange: e => setFormData({ ...formData, monthly_salary: e.target.value }) })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Status'),
              h('select', { className: 'form-select', onChange: e => setFormData({ ...formData, status: e.target.value }) },
                h('option', { value: 'Active' }, 'Active'),
                h('option', { value: 'Inactive' }, 'Inactive')
              )
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Employee')
          )
        )
      )
    ),

    // Modal for Company Switching and Multi-Company Management (Max 3 companies)
    showCompanyModal && h('div', {
      className: 'modal-overlay',
      onClick: (e) => { if (e.target === e.currentTarget) setShowCompanyModal(false); }
    },
      h('div', { className: 'modal-card', style: { maxWidth: 540 } },
        h('div', { className: 'modal-header' },
          h('div', null,
            h('h3', { style: { margin: 0, fontSize: 16 } }, 'Switch Company Workspace'),
            h('div', { style: { fontSize: 12, color: '#64748b', marginTop: 2 } },
              `Managing ${userCompanies.length} of 3 allowed companies`
            )
          ),
          h('button', { className: 'modal-close', onClick: () => setShowCompanyModal(false) }, '✕')
        ),
        h('div', { className: 'modal-body', style: { padding: '18px 22px' } },
          companyError && h('div', { style: { background: '#fef2f2', color: '#b91c1c', padding: '9px 12px', borderRadius: 7, fontSize: 12.5, marginBottom: 14 } }, companyError),

          h('div', { style: { fontSize: 12.5, color: '#64748b', marginBottom: 14 } },
            'Select a company workspace below. Each company maintains complete and strictly isolated data for inventory, sales, expenses, and records.'
          ),

          // Company List
          h('div', { className: 'company-list', style: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 } },
            userCompanies.map(c => {
              const isActive = c.id === currentUser?.company_id;
              return h('div', {
                key: c.id,
                className: `company-card-item ${isActive ? 'active-company-card' : ''}`,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 9,
                  border: isActive ? '2px solid #2563eb' : '1px solid var(--border)',
                  background: isActive ? (darkMode ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.05)') : 'var(--bg-secondary)',
                  transition: 'all 0.15s ease'
                }
              },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
                  h('div', {
                    className: 'workspace-avatar',
                    style: {
                      background: isActive ? '#2563eb' : '#64748b',
                      color: '#fff',
                      width: 38,
                      height: 38,
                      fontSize: 15,
                      fontWeight: 700
                    }
                  }, c.name ? c.name.charAt(0) : 'C'),
                  h('div', null,
                    h('div', { style: { fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' } }, c.name),
                    h('div', { style: { fontSize: 11.5, color: '#64748b', marginTop: 1 } },
                      c.legal_name && c.legal_name !== c.name ? `${c.legal_name} • ` : '',
                      c.gst_no ? `GST: ${c.gst_no}` : (c.city ? `${c.city}, ${c.state || ''}` : 'Independent workspace')
                    )
                  )
                ),
                isActive
                  ? h('span', { className: 'badge badge-success', style: { fontSize: 11.5, padding: '4px 10px' } }, '✓ Active Workspace')
                  : h('button', {
                      className: 'btn btn-sm btn-outline',
                      disabled: companyActionLoading,
                      onClick: () => handleSwitchCompany(c.id)
                    }, companyActionLoading ? 'Switching...' : 'Switch Workspace')
              );
            })
          ),

          // Add Company Section (Allowed when < 3)
          userCompanies.length < 3 ? (
            !showNewCompanyForm ? (
              h('div', { style: { textAlign: 'center', marginTop: 10 } },
                h('button', {
                  className: 'btn btn-outline',
                  style: { width: '100%', justifyContent: 'center', borderStyle: 'dashed' },
                  onClick: () => setShowNewCompanyForm(true)
                }, h(Icon, { name: 'plus', size: 14 }), `Add Company (${userCompanies.length}/3)`)
              )
            ) : (
              h('form', {
                onSubmit: handleCreateCompany,
                style: {
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: darkMode ? '#1e293b' : '#f8fafc'
                }
              },
                h('div', { style: { fontWeight: 600, fontSize: 13, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                  h('span', null, `Create New Company Workspace (${userCompanies.length + 1} of 3)`),
                  h('button', {
                    type: 'button',
                    style: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12 },
                    onClick: () => setShowNewCompanyForm(false)
                  }, 'Cancel')
                ),
                h('div', { className: 'form-group', style: { marginBottom: 10 } },
                  h('label', { style: { fontSize: 12 } }, 'Company / Factory Name *'),
                  h('input', {
                    className: 'form-input',
                    placeholder: 'e.g. Acme Precision Tools',
                    required: true,
                    value: newCompanyForm.name,
                    onChange: e => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })
                  })
                ),
                h('div', { className: 'form-group', style: { marginBottom: 10 } },
                  h('label', { style: { fontSize: 12 } }, 'GST Number (Optional)'),
                  h('input', {
                    className: 'form-input',
                    placeholder: 'e.g. 29AAAAA0000A1Z5',
                    value: newCompanyForm.gst_no,
                    onChange: e => setNewCompanyForm({ ...newCompanyForm, gst_no: e.target.value })
                  })
                ),
                h('div', { className: 'form-group', style: { marginBottom: 14 } },
                  h('label', { style: { fontSize: 12 } }, 'Factory / Office Address (Optional)'),
                  h('input', {
                    className: 'form-input',
                    placeholder: 'e.g. Plot 14, Industrial Area, Peenya',
                    value: newCompanyForm.address,
                    onChange: e => setNewCompanyForm({ ...newCompanyForm, address: e.target.value })
                  })
                ),
                h('button', {
                  type: 'submit',
                  className: 'btn btn-primary',
                  disabled: companyActionLoading,
                  style: { width: '100%', justifyContent: 'center' }
                }, companyActionLoading ? 'Creating Workspace...' : 'Create & Switch to Company')
              )
            )
          ) : (
            h('div', {
              style: {
                padding: '9px 12px',
                borderRadius: 7,
                background: darkMode ? '#1e293b' : '#f1f5f9',
                border: '1px solid var(--border)',
                fontSize: 12,
                color: '#64748b',
                textAlign: 'center'
              }
            }, '✓ You have reached the maximum allowed limit of 3 companies.')
          ),

          // Informational Notice: Settings can only be edited in Settings/Profile
          h('div', {
            style: {
              marginTop: 16,
              padding: '10px 12px',
              borderRadius: 7,
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              fontSize: 11.5,
              color: darkMode ? '#fde047' : '#854d0e',
              lineHeight: 1.45
            }
          },
            'ℹ️ Company settings, tax details, and legal address can only be changed in ',
            h('a', {
              href: '#',
              onClick: (e) => { e.preventDefault(); setShowCompanyModal(false); setActiveTab('settings'); },
              style: { fontWeight: 700, textDecoration: 'underline', color: 'inherit' }
            }, 'Profile / Settings'),
            '. Data for each company is kept strictly isolated.'
          )
        ),
        h('div', { className: 'modal-footer' },
          h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setShowCompanyModal(false) }, 'Close')
        )
      )
    )
  );
}

// Error Boundary to prevent any blank white screen crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ForgeLedger UI runtime error caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return h('div', { style: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b1329', color: '#fff', fontFamily: 'var(--font-sans)', padding: 20 } },
        h('div', { style: { textAlign: 'center', maxWidth: 440, padding: 30, background: '#1e293b', borderRadius: 12, border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' } },
          h('div', { className: 'brand-icon', style: { width: 44, height: 44, margin: '0 auto 16px', background: '#ef4444' } }, '!'),
          h('div', { style: { fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 } }, 'Session Refresh Required'),
          h('div', { style: { fontSize: 13, color: '#94a3b8', marginBottom: 20, lineHeight: 1.5 } }, this.state.error?.message || 'The application encountered an unexpected state.'),
          h('button', {
            style: { padding: '10px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, cursor: 'pointer', fontSize: 13 },
            onClick: () => { window.location.reload(); }
          }, 'Reload Workspace')
        )
      );
    }
    return this.props.children;
  }
}

// Mount React App with ErrorBoundary
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(ErrorBoundary, null, h(App)));
