// public/app.js - ForgeLedger Complete Refined Application
// Reference: Lanka Shanath, "Integrated Manufacturing Workspace for Small Manufacturers"

const { useState, useEffect, useMemo, useCallback, useRef, createElement: h } = React;

function formatCurrency(amount, currency = null) {
  const num = Number(amount) || 0;
  const sym = currency !== null ? currency : (typeof window !== 'undefined' && window.__forgeledgerCurrency ? window.__forgeledgerCurrency : '₹');
  return `${sym}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).split('T')[0];
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
    checkCircle: h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3' }),
    x: h('path', { d: 'M18 6L6 18M6 6l12 12' }),
    helpCircle: h('g', null, h('circle', { cx: '12', cy: '12', r: '10' }), h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }), h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })),
    zap: h('path', { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }),
    refresh: h('path', { d: 'M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15' }),
    command: h('path', { d: 'M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z' })
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
    if (typeof window !== 'undefined' && window.__showToast) {
      window.__showToast('No data available to export.', 'warning');
    } else {
      alert('No data available to export.');
    }
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
  if (typeof window !== 'undefined' && window.__showToast) {
    window.__showToast(`${filename}.csv exported successfully!`, 'success');
  }
}

// Date Range Filtering Utility for Invoices, Expenses & Production
function matchesDateFilter(dateStr, filterPreset = 'all', customStart = '', customEnd = '') {
  if (!filterPreset || filterPreset === 'all') return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  const now = new Date();

  if (filterPreset === 'this_month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (filterPreset === 'last_30_days') {
    const diffTime = now.getTime() - d.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 30;
  }
  if (filterPreset === 'this_quarter') {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const itemQuarter = Math.floor(d.getMonth() / 3);
    return d.getFullYear() === now.getFullYear() && itemQuarter === currentQuarter;
  }
  if (filterPreset === 'custom') {
    const itemTime = d.getTime();
    if (customStart) {
      const s = new Date(customStart + 'T00:00:00');
      if (!isNaN(s.getTime()) && itemTime < s.getTime()) return false;
    }
    if (customEnd) {
      const e = new Date(customEnd + 'T23:59:59.999');
      if (!isNaN(e.getTime()) && itemTime > e.getTime()) return false;
    }
    return true;
  }
  return true;
}

// Reusable Date Range Filter Bar Component
function DateRangeFilterBar({
  activeFilter = 'all',
  onChangeFilter,
  customStart = '',
  onChangeCustomStart,
  customEnd = '',
  onChangeCustomEnd
}) {
  const presets = [
    { id: 'all', label: 'All Time' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'custom', label: 'Custom Range' }
  ];

  return h('div', {
    className: 'date-range-filter-bar',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      margin: '6px 0 14px 0',
      padding: '8px 12px',
      background: 'var(--bg-secondary)',
      borderRadius: 10,
      border: '1px solid var(--border-light)'
    }
  },
    h('span', {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, '📅 Filter Period:'),
    h('div', { style: { display: 'inline-flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
      presets.map(p => h('button', {
        key: p.id,
        type: 'button',
        className: `btn ${activeFilter === p.id ? 'btn-primary' : 'btn-outline'}`,
        style: {
          padding: '4px 11px',
          fontSize: 11.5,
          borderRadius: 20,
          fontWeight: activeFilter === p.id ? 700 : 500,
          transition: 'all 0.15s ease'
        },
        onClick: () => onChangeFilter(p.id)
      }, p.label))
    ),
    activeFilter === 'custom' && h('div', {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginLeft: 4,
        background: 'var(--bg-card)',
        padding: '3px 8px',
        borderRadius: 8,
        border: '1px solid var(--border-light)'
      }
    },
      h('input', {
        type: 'date',
        className: 'form-input',
        style: { fontSize: 11.5, padding: '3px 6px', height: 28, width: 130 },
        value: customStart,
        onChange: e => onChangeCustomStart && onChangeCustomStart(e.target.value)
      }),
      h('span', { style: { fontSize: 11.5, color: 'var(--text-muted)' } }, 'to'),
      h('input', {
        type: 'date',
        className: 'form-input',
        style: { fontSize: 11.5, padding: '3px 6px', height: 28, width: 130 },
        value: customEnd,
        onChange: e => onChangeCustomEnd && onChangeCustomEnd(e.target.value)
      })
    )
  );
}

// Public Landing Showcase Component (Brought over from Home.jsx for visitor product preview)
function PublicLandingPage({ onLogin, onSignup }) {
  const landingFeatures = [
    { icon: 'inventory', title: 'Inventory management', text: 'Keep stock, SKU codes, units and GST rates organized.', tone: 'blue' },
    { icon: 'sales', title: 'Sales & GST invoices', text: 'Record multi-item sales and calculate taxes consistently.', tone: 'violet' },
    { icon: 'expenses', title: 'Expense tracking', text: 'Understand where money goes with clear expense records.', tone: 'coral' },
    { icon: 'reports', title: 'Business reports', text: 'See trends and make decisions with sales summaries.', tone: 'mint' },
    { icon: 'production', title: 'Production', text: 'Bring production activity and material usage into view.', tone: 'amber' },
    { icon: 'payroll', title: 'Team & payroll', text: 'Build a foundation for employee and payroll workflows.', tone: 'cyan' },
  ];

  const landingSales = [
    { id: 'INV-1058', name: 'ABC Engineering', amount: '₹24,800', date: 'Today', tone: 'blue' },
    { id: 'INV-1057', name: 'Sunrise Traders', amount: '₹12,450', date: 'Yesterday', tone: 'mint' },
    { id: 'INV-1056', name: 'Mehta Enterprises', amount: '₹18,900', date: '12 Oct', tone: 'violet' }
  ];

  return h('div', { className: 'home-page' },
    // Header Navigation
    h('header', { className: 'home-nav' },
      h('div', { className: 'home-brand', style: { cursor: 'pointer' }, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        h('img', { src: '/logo.png', alt: 'ForgeLedger Logo', style: { width: 34, height: 34, borderRadius: 8, objectFit: 'contain' } }),
        h('span', null, 'Forge', h('span', null, 'Ledger'))
      ),
      h('nav', null,
        h('a', { className: 'selected', href: '#home' }, 'Home'),
        h('a', { href: '#features' }, 'Features'),
        h('a', { href: '#how-it-works' }, 'How it works')
      ),
      h('div', { className: 'home-nav-actions' },
        h('button', { type: 'button', className: 'nav-signin', onClick: onLogin, style: { background: 'none', border: 'none', cursor: 'pointer' } }, 'Sign in'),
        h('button', { type: 'button', className: 'nav-create', onClick: onSignup, style: { border: 'none', cursor: 'pointer' } },
          'Create account ',
          h(Icon, { name: 'arrowRight', size: 14 })
        )
      )
    ),

    // Main Content
    h('main', { id: 'home' },
      // Hero Section
      h('section', { className: 'home-hero' },
        h('div', { className: 'hero-orb orb-one' }),
        h('div', { className: 'hero-orb orb-two' }),
        h('div', { className: 'hero-copy' },
          h('div', { className: 'hero-kicker' },
            h(Icon, { name: 'zap', size: 14 }),
            ' SIMPLE, POWERFUL BUSINESS MANAGEMENT'
          ),
          h('h1', null,
            'Run your business.',
            h('br', null),
            h('span', null, 'Know your numbers.')
          ),
          h('p', { className: 'hero-description' },
            'Manage inventory, multi-item sales, GST invoices and expenses in one clear workspace—so you can spend less time chasing numbers and more time growing.'
          ),
          h('div', { className: 'hero-actions' },
            h('button', { type: 'button', className: 'hero-primary', onClick: onSignup, style: { border: 'none', cursor: 'pointer' } },
              'Get started free ',
              h(Icon, { name: 'arrowRight', size: 16 })
            ),
            h('a', { className: 'hero-secondary', href: '#features' },
              'Explore features'
            )
          ),
          h('div', { className: 'hero-proof' },
            h('span', null, h(Icon, { name: 'checkCircle', size: 15 }), ' Easy to get started'),
            h('span', null, h(Icon, { name: 'checkCircle', size: 15 }), ' Multi-company data isolation'),
            h('span', null, h(Icon, { name: 'checkCircle', size: 15 }), ' Built for growing teams')
          ),
          h('div', { className: 'hero-trust' },
            h('div', { className: 'trust-icon' }, h(Icon, { name: 'checkCircle', size: 18 })),
            h('div', null,
              h('b', null, 'Your business data stays organized'),
              h('small', null, 'Workspace-based access and a focused workflow')
            )
          )
        ),

        // Hero Visual Showcase Dashboard
        h('div', { className: 'hero-visual' },
          h('div', { className: 'visual-glow' }),
          h('div', { className: 'mock-dashboard' },
            // Mock Sidebar
            h('div', { className: 'mock-sidebar' },
              h('div', { className: 'mock-brand' },
                h('span', { className: 'mini-logo' }, h('img', { src: '/logo.png', style: { width: 18, height: 18, borderRadius: 4, objectFit: 'contain' } })),
                ' ForgeLedger'
              ),
              h('div', { className: 'mock-nav active' }, h(Icon, { name: 'overview', size: 14 }), ' Overview'),
              h('div', { className: 'mock-nav' }, h(Icon, { name: 'inventory', size: 14 }), ' Inventory'),
              h('div', { className: 'mock-nav' }, h(Icon, { name: 'sales', size: 14 }), ' Sales'),
              h('div', { className: 'mock-nav' }, h(Icon, { name: 'expenses', size: 14 }), ' Expenses'),
              h('div', { className: 'mock-nav' }, h(Icon, { name: 'reports', size: 14 }), ' Reports'),
              h('div', { className: 'mock-side-bottom' },
                h('div', { className: 'mock-avatar' }, 'A'),
                h('span', null, 'ABC Manufacturing', h('small', null, 'Workspace owner'))
              )
            ),
            // Mock Main Area
            h('div', { className: 'mock-main' },
              h('div', { className: 'mock-top' },
                h('span', null, 'Business overview'),
                h('span', { className: 'mock-date' }, 'This month >')
              ),
              h('div', { className: 'mock-heading' },
                h('div', null,
                  h('small', null, 'ACTIVE SESSION'),
                  h('h3', null, 'Your business at a glance')
                ),
                h('span', { className: 'mock-status' }, h('i', null), ' Live overview')
              ),
              h('div', { className: 'mock-stats' },
                h('div', { className: 'mock-stat stat-blue' },
                  h('span', { className: 'stat-icon' }, h(Icon, { name: 'sales', size: 14 })),
                  h('small', null, 'Total sales'),
                  h('b', null, '₹2,48,500'),
                  h('em', null, '↗ 12.8% this month')
                ),
                h('div', { className: 'mock-stat stat-violet' },
                  h('span', { className: 'stat-icon' }, h(Icon, { name: 'expenses', size: 14 })),
                  h('small', null, 'Expenses'),
                  h('b', null, '₹53,200'),
                  h('em', null, '↘ 4.2% this month')
                ),
                h('div', { className: 'mock-stat stat-mint' },
                  h('span', { className: 'stat-icon' }, h(Icon, { name: 'inventory', size: 14 })),
                  h('small', null, 'Inventory value'),
                  h('b', null, '₹4,12,300'),
                  h('em', null, '126 active items')
                )
              ),
              h('div', { className: 'mock-bottom' },
                h('div', { className: 'mock-chart-card' },
                  h('div', { className: 'mock-card-title' }, 'Sales performance ', h('span', null, 'Last 6 months')),
                  h('div', { className: 'mock-chart' },
                    h('div', { className: 'chart-y' }, h('span', null, '₹2L'), h('span', null, '₹1L'), h('span', null, '₹0')),
                    h('div', { className: 'chart-bars' },
                      [38, 53, 47, 70, 62, 88].map((val, idx) =>
                        h('div', { className: 'chart-bar-wrap', key: idx },
                          h('div', { className: `chart-bar bar-${idx}`, style: { height: `${val}%` } }),
                          h('small', null, ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][idx])
                        )
                      )
                    )
                  )
                ),
                h('div', { className: 'mock-sales-card' },
                  h('div', { className: 'mock-card-title' }, 'Recent sales ', h('span', null, 'View all ↗')),
                  landingSales.map(s =>
                    h('div', { className: 'mock-sale', key: s.id },
                      h('div', { className: `sale-avatar ${s.tone}` }, h(Icon, { name: 'sales', size: 12 })),
                      h('div', { className: 'sale-name' },
                        h('b', null, s.name),
                        h('small', null, `${s.id} · ${s.date}`)
                      ),
                      h('strong', null, s.amount)
                    )
                  )
                )
              ),
              h('div', { className: 'mock-footer' },
                h('span', null, h('i', null), ' Inventory synced'),
                h('span', null, 'Updated just now')
              )
            )
          ),
          // Float Chips
          h('div', { className: 'float-chip chip-top' },
            h('span', { className: 'float-icon purple' }, h(Icon, { name: 'reports', size: 16 })),
            h('span', null, h('b', null, 'Sales are growing'), h('small', null, '12.8% this month')),
            h('span', { className: 'float-up' }, '↗')
          ),
          h('div', { className: 'float-chip chip-bottom' },
            h('span', { className: 'float-icon green' }, h(Icon, { name: 'checkCircle', size: 16 })),
            h('span', null, h('b', null, 'Stock status'), h('small', null, 'Inventory overview ready'))
          )
        )
      ),

      // Features Section
      h('section', { className: 'home-features', id: 'features' },
        h('div', { className: 'section-heading' },
          h('span', { className: 'section-kicker' }, 'ONE WORKSPACE, LESS BUSYWORK'),
          h('h2', null, 'Everything you need to ', h('span', null, 'stay in control.')),
          h('p', null, 'From the first stock entry to your latest sale, keep the essentials connected.')
        ),
        h('div', { className: 'feature-grid' },
          landingFeatures.map(f =>
            h('article', { className: 'feature-card', key: f.title },
              h('div', { className: `feature-icon ${f.tone}` }, h(Icon, { name: f.icon, size: 22 })),
              h('h3', null, f.title),
              h('p', null, f.text),
              h('button', {
                type: 'button',
                onClick: onSignup,
                style: { background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }
              }, 'Explore ', h(Icon, { name: 'arrowRight', size: 13 }))
            )
          )
        )
      ),

      // CTA Section
      h('section', { className: 'home-cta', id: 'how-it-works' },
        h('div', { className: 'cta-spark spark-a' }),
        h('div', { className: 'cta-spark spark-b' }),
        h('div', { className: 'cta-content' },
          h('span', { className: 'cta-label' }, h(Icon, { name: 'zap', size: 14 }), ' A clearer view starts here'),
          h('h2', null, 'Make room for the work', h('br', null), 'that moves you forward.'),
          h('p', null, 'Set up your workspace and bring your business essentials together.'),
          h('button', {
            type: 'button',
            className: 'cta-button',
            onClick: onSignup,
            style: { border: 'none', cursor: 'pointer' }
          }, 'Create your free account ', h(Icon, { name: 'arrowRight', size: 16 })),
          h('small', null, 'No complicated setup. Start with the essentials.')
        ),
        h('div', { className: 'cta-art' },
          h('div', { className: 'cta-ring ring-one' }),
          h('div', { className: 'cta-ring ring-two' }),
          h('div', { className: 'cta-tile tile-one' }, h(Icon, { name: 'inventory', size: 24 })),
          h('div', { className: 'cta-tile tile-two' }, h(Icon, { name: 'expenses', size: 24 })),
          h('div', { className: 'cta-tile tile-three' }, h(Icon, { name: 'reports', size: 26 })),
          h('div', { className: 'cta-tile tile-four' }, h(Icon, { name: 'sales', size: 22 }))
        )
      )
    ),

    // Footer
    h('footer', { className: 'home-footer' },
      h('div', { className: 'home-brand' },
        h('img', { src: '/logo.png', alt: 'ForgeLedger', style: { width: 28, height: 28, borderRadius: 6, objectFit: 'contain' } }),
        h('span', null, 'Forge', h('span', null, 'Ledger'))
      ),
      h('span', null, 'Clear numbers. Better decisions.'),
      h('div', null,
        h('button', { type: 'button', onClick: onLogin, style: { background: 'none', border: 'none', color: '#5e6d84', fontWeight: 700, cursor: 'pointer' } }, 'Sign in'),
        h('button', { type: 'button', onClick: onSignup, style: { background: 'none', border: 'none', color: '#5e6d84', fontWeight: 700, cursor: 'pointer' } }, 'Create account')
      ),
      h('small', null, `© ${new Date().getFullYear()} ForgeLedger. All rights reserved.`)
    )
  );
}

// Enhanced Asset Valuation Donut Chart (Finished Goods vs Raw Materials)
function InventoryPieChart({ inventory = [], currency = '₹', onSelectCategory, canViewFinancials = true }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  let finishedVal = 0;
  let finishedUnits = 0;
  let finishedCount = 0;
  let finishedLowStock = 0;

  let rawVal = 0;
  let rawCount = 0;
  let rawLowStock = 0;

  (inventory || []).forEach(item => {
    const isRaw = (item.category || '').toLowerCase().includes('raw');
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.unit_cost) || 0;
    const val = qty * cost;
    const isLow = qty <= (Number(item.reorder_level) || 5);

    if (isRaw) {
      rawVal += val;
      rawCount += 1;
      if (isLow) rawLowStock += 1;
    } else {
      finishedVal += val;
      finishedUnits += qty;
      finishedCount += 1;
      if (isLow) finishedLowStock += 1;
    }
  });

  const totalVal = finishedVal + rawVal;
  const fgPct = totalVal > 0 ? Math.round((finishedVal / totalVal) * 100) : 50;
  const rmPct = totalVal > 0 ? Math.max(0, 100 - fgPct) : 50;

  const categories = [
    {
      name: 'Finished Goods',
      role: 'Ready to sell',
      countText: `${finishedCount} product line(s) · ${finishedUnits} units in stock`,
      value: finishedVal,
      percent: fgPct,
      color: '#2563eb', // Royal Blue
      lowStockCount: finishedLowStock
    },
    {
      name: 'Raw Materials',
      role: 'Factory inputs',
      countText: `${rawCount} material type(s) in warehouse`,
      value: rawVal,
      percent: rmPct,
      color: '#10b981', // Emerald Green
      lowStockCount: rawLowStock
    }
  ];

  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.655

  let accumulatedPercent = 0;
  const slices = categories.map((cat) => {
    const percent = totalVal > 0 ? (cat.value / totalVal) : 0.5;
    const strokeDash = (percent * circumference);
    const strokeOffset = (accumulatedPercent * circumference);
    accumulatedPercent += percent;
    return {
      ...cat,
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
            onClick: () => onSelectCategory && onSelectCategory(slice.name.includes('Raw') ? 'rawMaterials' : 'inventory'),
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
          className: 'pie-center-val',
          fontFamily: 'var(--font-mono)'
        }, canViewFinancials ? (activeSlice ? formatCurrency(activeSlice.value, currency) : formatCurrency(totalVal, currency)) : (activeSlice ? (activeSlice.percent + '%') : (finishedUnits + ' units'))),
        h('text', {
          x: 120,
          y: activeSlice ? 133 : 135,
          textAnchor: 'middle',
          fontSize: '10px',
          fontWeight: '700',
          className: activeSlice ? '' : 'pie-center-label',
          style: activeSlice ? { fill: activeSlice.color } : undefined,
          letterSpacing: '0.8px'
        }, canViewFinancials ? (activeSlice ? (activeSlice.name.toUpperCase() + ' (' + activeSlice.percent + '%)') : 'FACTORY WEALTH') : (activeSlice ? activeSlice.name.toUpperCase() : 'WAREHOUSE STOCK'))
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
            padding: '10px 14px',
            borderRadius: 9,
            transition: 'all 0.15s ease',
            background: isHovered ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
            marginBottom: 8,
            border: isHovered ? `1px solid ${slice.color}` : '1px solid transparent'
          },
          title: `Click to view ${slice.name} details →`,
          onClick: () => onSelectCategory && onSelectCategory(slice.name.includes('Raw') ? 'rawMaterials' : 'inventory'),
          onMouseEnter: () => setHoveredSlice(slice.name),
          onMouseLeave: () => setHoveredSlice(null)
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { className: 'pie-legend-dot', style: { backgroundColor: slice.color, width: 11, height: 11, borderRadius: '50%' } }),
            h('div', null,
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                h('span', { className: 'pie-legend-name', style: { fontWeight: 700, fontSize: 13.5 } }, slice.name),
                h('span', { style: { fontSize: 10.5, color: '#64748b', background: 'rgba(148,163,184,0.15)', padding: '1px 6px', borderRadius: 4 } }, slice.role),
                slice.lowStockCount > 0 && h('span', { className: 'badge badge-warning', style: { fontSize: 9.5, padding: '1px 5px' } }, `${slice.lowStockCount} low stock`)
              ),
              h('div', { style: { fontSize: 11, color: '#64748b', marginTop: 2 } }, slice.countText)
            )
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { className: 'pie-legend-val', style: { fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 } }, canViewFinancials ? formatCurrency(slice.value, currency) : '₹ ••••'),
            h('span', { className: 'pie-legend-pct', style: { fontWeight: 700, background: slice.color, color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11.5 } }, `${slice.percent}%`)
          )
        );
      })
    )
  );
}

// Finished Goods Product Line & Profit Margin Chart Component
function FinishedGoodsChart({ finishedGoods = [], currency = '₹', canViewFinancials = true }) {
  const totalVal = (finishedGoods || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0), 0);
  const totalUnits = (finishedGoods || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return h('div', { className: 'card chart-card', style: { padding: '18px 22px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('div', null,
        h('h3', { className: 'card-title' }, canViewFinancials ? 'Finished Goods Stock & Profit Margins' : 'Finished Goods Stock Distribution'),
        h('div', { className: 'card-subtitle' }, canViewFinancials ? 'Unit cost, retail selling value, and ready inventory across product lines' : 'Physical ready inventory across finished product lines')
      ),
      h('span', { className: 'badge badge-neutral' }, `${finishedGoods.length} Product Line(s) · ${totalUnits} Units Total`)
    ),
    finishedGoods.length === 0 ?
      h('div', { style: { textAlign: 'center', padding: '24px', color: '#64748b' } }, 'No finished products found. Click "+ Add product" above.') :
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        finishedGoods.map(item => {
          const cost = Number(item.unit_cost) || 0;
          const sellPrice = cost * 1.3; // Standard 30% manufacturing margin
          const qty = Number(item.quantity) || 0;
          const lineVal = qty * cost;
          const lineSellVal = qty * sellPrice;
          const pctOfStock = totalVal > 0 ? Math.round((lineVal / totalVal) * 100) : 100;

          return h('div', {
            key: item.id,
            style: {
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }
          },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
              h('div', null,
                h('span', { style: { fontWeight: 700, fontSize: 13.5 } }, item.item_name),
                h('span', { style: { marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' } }, item.sku),
                h('span', { className: 'badge badge-success', style: { marginLeft: 8, fontSize: 10 } }, `${qty} ${item.unit || 'units'} in stock`)
              ),
              h('div', { style: { textAlign: 'right' } },
                h('div', { style: { fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 } }, canViewFinancials ? formatCurrency(lineVal, currency) : '₹ ••••'),
                h('div', { style: { fontSize: 11, color: '#64748b' } }, canViewFinancials ? ('Selling Value: ' + formatCurrency(lineSellVal, currency) + ' (+30% markup)') : (pctOfStock + '% of finished inventory'))
              )
            ),
            h('div', { style: { height: 7, borderRadius: 3.5, background: 'rgba(148, 163, 184, 0.16)', overflow: 'hidden' } },
              h('div', { style: { width: `${pctOfStock}%`, height: '100%', background: '#2563eb', borderRadius: 3.5 } })
            )
          );
        })
      )
  );
}

// Raw Materials Stock & Valuation Pie / Donut Chart Component
function RawMaterialsPieChart({ rawMaterials = [], currency = '₹', canViewFinancials = true }) {
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
        h('h3', { className: 'card-title' }, canViewFinancials ? 'Raw materials valuation & share' : 'Raw materials stock distribution'),
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
            width: 195,
            height: 195,
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
                title: `${slice.name} (Click to view ${slice.name} →)`,
                onClick: () => onSelectCategory && onSelectCategory(slice.name.includes('Raw') ? 'rawMaterials' : 'inventory'),
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
            }, canViewFinancials ? (activeSlice ? formatCurrency(activeSlice.value, currency) : formatCurrency(totalVal, currency)) : (activeSlice ? (activeSlice.quantity + ' ' + activeSlice.unit) : (materialList.reduce((sum, m) => sum + m.quantity, 0) + ' units'))),
            h('text', {
              x: 120,
              y: activeSlice ? 133 : 135,
              textAnchor: 'middle',
              fontSize: '10px',
              fontWeight: '700',
              fill: activeSlice ? activeSlice.color : 'var(--text-muted)',
              letterSpacing: '0.8px'
            }, activeSlice ? `${activeSlice.name.toUpperCase()} (${activeSlice.percent}%)` : 'RAW MATERIALS')
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
                h('span', { className: 'pie-legend-val', style: { fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13.5 } }, canViewFinancials ? formatCurrency(slice.value, currency) : '₹ ••••'),
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
        h('h3', { className: 'card-title' }, 'Customer Invoices & Payment Pipeline'),
        h('div', { className: 'card-subtitle' }, 'Cash collected vs pending payments vs overdue receivables')
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
        h('h3', { className: 'card-title' }, 'Operating Expenses by Category'),
        h('div', { className: 'card-subtitle' }, 'Cost breakdown across manufacturing inputs, payroll, and facility costs')
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
        h('h3', { className: 'card-title' }, 'Shop Floor Batch Status & Manufacturing Output'),
        h('div', { className: 'card-subtitle' }, 'Progress of jobs transforming raw materials into finished products')
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

// Payroll Compensation & Department Chart Component
function PayrollCompensationChart({ employees = [], currency = '₹' }) {
  const roleMap = {};
  let totalPayroll = 0;

  (employees || []).forEach(emp => {
    const role = emp.role || 'Staff';
    const sal = Number(emp.monthly_salary) || 0;
    totalPayroll += sal;
    if (!roleMap[role]) roleMap[role] = { role, total: 0, count: 0 };
    roleMap[role].total += sal;
    roleMap[role].count += 1;
  });

  const roles = Object.values(roleMap).sort((a, b) => b.total - a.total);
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return h('div', { className: 'card chart-card', style: { padding: '16px 20px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Payroll Compensation by Role'),
        h('div', { className: 'card-subtitle' }, 'Monthly compensation allocation across factory staff and operations')
      ),
      h('span', { className: 'badge badge-neutral' }, `${roles.length} Role(s) · ${formatCurrency(totalPayroll, currency)} / mo`)
    ),
    roles.length === 0 ?
      h('div', { style: { textAlign: 'center', padding: '24px', color: '#64748b' } }, 'No employees recorded. Click "+ Add employee" above.') :
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        roles.map((r, i) => {
          const pct = totalPayroll > 0 ? Math.round((r.total / totalPayroll) * 100) : 0;
          const color = colors[i % colors.length];
          return h('div', { key: r.role, style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600 } },
              h('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                h('span', { style: { width: 8, height: 8, borderRadius: '50%', backgroundColor: color } }),
                r.role,
                h('span', { style: { fontSize: 11, color: '#64748b', fontWeight: 400 } }, `(${r.count} staff)`)
              ),
              h('span', { style: { fontFamily: 'var(--font-mono)' } },
                `${formatCurrency(r.total, currency)} `,
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

// Reports Comparison Bar Chart Component
function ReportsComparisonChart({ reportsData = null, currency = '₹' }) {
  const rows = reportsData?.monthly || [
    { month: '2026-09', sales: 129200, expenses: 59950, net: 69250 }
  ];

  const maxVal = Math.max(1, ...rows.map(r => Math.max(Number(r.sales) || 0, Number(r.expenses) || 0)));

  return h('div', { className: 'card chart-card', style: { padding: '18px 20px', marginBottom: 20 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      h('div', null,
        h('h3', { className: 'card-title' }, 'Monthly Financial Performance (Revenue vs Expenses vs Profit)'),
        h('div', { className: 'card-subtitle' }, 'Month-by-month cash flow and net profitability')
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

// Interactive Toast Notification Component
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return h('div', { className: 'toast-container', 'aria-live': 'polite' },
    toasts.map(toast => {
      const iconName = toast.type === 'error' ? 'alertCircle' :
                       toast.type === 'warning' ? 'alertCircle' :
                       toast.type === 'info' ? 'alertCircle' : 'checkCircle';
      return h('div', {
        key: toast.id,
        className: `toast-item toast-${toast.type || 'info'}`,
        onClick: () => onDismiss(toast.id)
      },
        h('div', { className: 'toast-icon-wrap' },
          h(Icon, { name: iconName, size: 15 })
        ),
        h('div', { className: 'toast-message' }, toast.message),
        h('button', {
          className: 'toast-close-btn',
          onClick: (e) => { e.stopPropagation(); onDismiss(toast.id); },
          'aria-label': 'Dismiss'
        }, '✕')
      );
    })
  );
}


// ================= COMPONENT: GLOBAL COMMAND PALETTE (Ctrl+K) =================
function CommandPalette({
  isOpen,
  onClose,
  finishedGoods,
  rawMaterials,
  sales,
  employees,
  onNavigate,
  onAction
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const items = useMemo(() => {
    const q = (query || '').toLowerCase().trim();

    const navItems = [
      { id: 'nav-overview', type: 'Nav', title: 'Go to Business Overview', tab: 'overview', icon: 'overview' },
      { id: 'nav-inventory', type: 'Nav', title: 'Go to Finished Goods Inventory', tab: 'inventory', icon: 'inventory' },
      { id: 'nav-raw', type: 'Nav', title: 'Go to Raw Materials Warehouse', tab: 'rawMaterials', icon: 'rawMaterials' },
      { id: 'nav-prod', type: 'Nav', title: 'Go to Production & Manufacturing', tab: 'production', icon: 'production' },
      { id: 'nav-sales', type: 'Nav', title: 'Go to Sales & Invoices', tab: 'sales', icon: 'sales' },
      { id: 'nav-expenses', type: 'Nav', title: 'Go to Operating Expenses', tab: 'expenses', icon: 'expenses' },
      { id: 'nav-payroll', type: 'Nav', title: 'Go to Payroll & Employee Staff', tab: 'payroll', icon: 'payroll' },
      { id: 'nav-reports', type: 'Nav', title: 'Go to Financial Reports', tab: 'reports', icon: 'reports' },
      { id: 'nav-settings', type: 'Nav', title: 'Go to Company Settings & Profile', tab: 'settings', icon: 'settings' }
    ];

    const quickActions = [
      { id: 'act-scan', type: 'Scanner', title: '📷 Scan Barcode / QR Code (Camera & Mobile)', action: 'barcodeScanner', icon: 'zap' },
      { id: 'act-label', type: 'Studio', title: '🏷️ Barcode & QR Label Studio (Thermal & A4 Print)', action: 'labelStudio', icon: 'zap' },
      { id: 'act-team', type: 'RBAC', title: '👥 Manage Workshop Team & Role Permissions', action: 'team', icon: 'settings' },
      { id: 'act-ai-analyst', type: 'AI Action', title: '✦ Ask ForgeAI Business Analyst (Margins, Costs & Risks)', action: 'aiAnalyst', icon: 'zap' },
      { id: 'act-ai-ocr', type: 'AI Action', title: '⚡ Scan Vendor Bill with AI OCR (Auto-Expense)', action: 'ocr', icon: 'zap' },
      { id: 'act-ai-forecast', type: 'AI Action', title: '📊 View AI Demand Forecast & Raw Material Runway', action: 'forecast', icon: 'production' },
      { id: 'act-sale', type: 'Action', title: '⚡ Create New Sales Invoice', action: 'sale', icon: 'sales' },
      { id: 'act-prod', type: 'Action', title: '⚙️ Start New Production Batch Run', action: 'production', icon: 'production' },
      { id: 'act-exp', type: 'Action', title: '💳 Record Operating Business Expense', action: 'expense', icon: 'expenses' },
      { id: 'act-mat', type: 'Action', title: '🧱 Add Raw Material Stock', action: 'rawMaterial', icon: 'rawMaterials' },
      { id: 'act-emp', type: 'Action', title: '👤 Add Employee to Payroll', action: 'employee', icon: 'payroll' },
      { id: 'act-company', type: 'Action', title: '🏢 Switch Company Workspace (Max 3)', action: 'switchCompany', icon: 'overview' },
      { id: 'act-shortcuts', type: 'Action', title: '⌨️ View Keyboard Shortcuts (?)', action: 'shortcuts', icon: 'helpCircle' }
    ];

    if (!q) {
      return [...quickActions, ...navItems];
    }

    const matchedActions = quickActions.filter(a => a.title.toLowerCase().includes(q));
    const matchedNav = navItems.filter(n => n.title.toLowerCase().includes(q));

    const matchedGoods = (finishedGoods || [])
      .filter(g => (g.item_name || g.name || '').toLowerCase().includes(q) || (g.sku || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map(g => ({
        id: `good-${g.id}`,
        type: 'Finished Good',
        title: `${g.item_name || g.name} (SKU: ${g.sku || 'N/A'})`,
        sub: `Stock: ${g.quantity || 0} units · ₹${g.unit_price || g.unit_cost || 0}`,
        tab: 'inventory',
        searchVal: g.item_name || g.name,
        icon: 'inventory'
      }));

    const matchedMaterials = (rawMaterials || [])
      .filter(m => (m.name || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(m => ({
        id: `mat-${m.id}`,
        type: 'Raw Material',
        title: `${m.name} (${m.quantity || 0} ${m.unit || 'kg'} in stock)`,
        sub: `Cost: ₹${m.unit_cost || 0} / ${m.unit || 'kg'}`,
        tab: 'rawMaterials',
        searchVal: m.name,
        icon: 'rawMaterials'
      }));

    const matchedSales = (sales || [])
      .filter(s => (s.customer || '').toLowerCase().includes(q) || (s.invoice_no || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map(s => ({
        id: `sale-${s.id}`,
        type: 'Invoice',
        title: `${s.invoice_no || 'INV'} - ${s.customer || 'Customer'}`,
        sub: `₹${Number(s.amount).toLocaleString()} · ${s.status}`,
        tab: 'sales',
        searchVal: s.invoice_no || s.customer,
        icon: 'sales'
      }));

    const matchedEmployees = (employees || [])
      .filter(e => (e.name || '').toLowerCase().includes(q) || (e.role || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(e => ({
        id: `emp-${e.id}`,
        type: 'Employee',
        title: `${e.name} (${e.role})`,
        sub: `Salary: ₹${Number(e.monthly_salary).toLocaleString()} · ${e.status}`,
        tab: 'payroll',
        searchVal: e.name,
        icon: 'payroll'
      }));

    return [
      ...matchedActions,
      ...matchedNav,
      ...matchedGoods,
      ...matchedMaterials,
      ...matchedSales,
      ...matchedEmployees
    ];
  }, [query, finishedGoods, rawMaterials, sales, employees]);

  const executeItem = (item) => {
    if (item.action) {
      onAction(item.action);
    } else if (item.tab) {
      onNavigate(item.tab, item.searchVal);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (items.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % (items.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) executeItem(items[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return h('div', {
    className: 'command-palette-overlay',
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); }
  },
    h('div', { className: 'command-palette-card' },
      h('div', { className: 'command-palette-input-wrap' },
        h(Icon, { name: 'search', size: 16 }),
        h('input', {
          ref: inputRef,
          className: 'command-palette-input',
          placeholder: 'Search commands, products, invoices, staff (Press ↑↓ to navigate)...',
          value: query,
          onChange: (e) => { setQuery(e.target.value); setSelectedIndex(0); },
          onKeyDown: handleKeyDown
        }),
        h('span', { className: 'command-palette-esc', onClick: onClose }, 'ESC')
      ),
      h('div', { className: 'command-palette-results' },
        items.length === 0 ?
          h('div', { className: 'command-palette-empty' },
            h('div', { style: { fontSize: 22, marginBottom: 6 } }, '🔍'),
            h('div', { style: { fontWeight: 700 } }, `No results found for "${query}"`),
            h('div', { style: { fontSize: 12, color: '#94a3b8', marginTop: 2 } }, 'Try searching for an invoice #, customer name, material, or action')
          ) :
          items.map((item, idx) =>
            h('div', {
              key: item.id,
              className: `command-palette-item ${selectedIndex === idx ? 'selected' : ''}`,
              onClick: () => executeItem(item),
              onMouseEnter: () => setSelectedIndex(idx)
            },
              h('div', { className: 'command-item-icon' }, h(Icon, { name: item.icon, size: 15 })),
              h('div', { className: 'command-item-content' },
                h('div', { className: 'command-item-title' }, item.title),
                item.sub && h('div', { className: 'command-item-sub' }, item.sub)
              ),
              h('span', { className: 'command-item-badge' }, item.type),
              selectedIndex === idx && h('span', { className: 'command-item-enter' }, '↵')
            )
          )
      ),
      h('div', { className: 'command-palette-footer' },
        h('span', null, h('kbd', null, '↑'), ' ', h('kbd', null, '↓'), ' Navigate'),
        h('span', null, h('kbd', null, '↵'), ' Select'),
        h('span', null, h('kbd', null, 'Esc'), ' Close')
      )
    )
  );
}

// ================= COMPONENT: KEYBOARD SHORTCUTS MODAL =================
function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  const shortcuts = [
    { key: 'Ctrl + K / ⌘K', desc: 'Open Command Palette & Global Search' },
    { key: 'Alt + 1..8', desc: 'Instantly jump between tabs (Overview to Reports)' },
    { key: 'Alt + D', desc: 'Toggle Dark / Light Mode' },
    { key: '?', desc: 'Show this Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any active modal, drawer, or search dialog' },
    { key: 'Ctrl + P', desc: 'Print or Save Tax Invoice / Payslip as PDF' }
  ];

  return h('div', {
    className: 'modal-overlay',
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); }
  },
    h('div', { className: 'modal-card', style: { maxWidth: 520 } },
      h('div', { className: 'modal-header' },
        h('div', null,
          h('h3', { style: { margin: 0, fontSize: 16 } }, 'Keyboard Shortcuts'),
          h('div', { style: { fontSize: 12, color: '#64748b', marginTop: 2 } }, 'Power-user productivity shortcuts for PC')
        ),
        h('button', { className: 'modal-close', onClick: onClose }, '✕')
      ),
      h('div', { className: 'modal-body', style: { padding: '16px 20px' } },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          shortcuts.map(s =>
            h('div', {
              key: s.key,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                fontSize: 12.5
              }
            },
              h('span', { style: { color: 'var(--text-primary)', fontWeight: 500 } }, s.desc),
              h('kbd', {
                style: {
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-light)',
                  padding: '3px 8px',
                  borderRadius: 5,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--primary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                }
              }, s.key)
            )
          )
        )
      ),
      h('div', { className: 'modal-footer' },
        h('button', { className: 'btn btn-primary', onClick: onClose }, 'Got it')
      )
    )
  );
}

// ================= COMPONENT: MOBILE FLOATING ACTION BUTTON (FAB) =================
function MobileFloatingActions({ isOpen, onToggle, onAction }) {
  return h('div', { className: 'mobile-fab-container' },
    isOpen && h('div', { className: 'mobile-fab-backdrop', onClick: () => onToggle(false) }),
    isOpen && h('div', { className: 'mobile-speed-dial-menu' },
      h('button', {
        className: 'speed-dial-item',
        onClick: () => { onAction('sale'); onToggle(false); }
      },
        h('span', { className: 'speed-dial-label' }, 'New Invoice'),
        h('div', { className: 'speed-dial-icon' }, h(Icon, { name: 'sales', size: 16 }))
      ),
      h('button', {
        className: 'speed-dial-item',
        onClick: () => { onAction('production'); onToggle(false); }
      },
        h('span', { className: 'speed-dial-label' }, 'New Batch Run'),
        h('div', { className: 'speed-dial-icon' }, h(Icon, { name: 'production', size: 16 }))
      ),
      h('button', {
        className: 'speed-dial-item',
        onClick: () => { onAction('expense'); onToggle(false); }
      },
        h('span', { className: 'speed-dial-label' }, 'Record Expense'),
        h('div', { className: 'speed-dial-icon' }, h(Icon, { name: 'expenses', size: 16 }))
      ),
      h('button', {
        className: 'speed-dial-item',
        onClick: () => { onAction('rawMaterial'); onToggle(false); }
      },
        h('span', { className: 'speed-dial-label' }, 'Add Material'),
        h('div', { className: 'speed-dial-icon' }, h(Icon, { name: 'rawMaterials', size: 16 }))
      )
    ),
    h('button', {
      className: `mobile-fab-btn ${isOpen ? 'open' : ''}`,
      onClick: () => onToggle(!isOpen),
      title: isOpen ? 'Close actions' : 'Quick create action',
      'aria-label': isOpen ? 'Close actions' : 'Quick create action'
    },
      h(Icon, { name: isOpen ? 'x' : 'plus', size: 20 })
    )
  );
}

// Available Workspace Primary Accent Colors
const ACCENT_COLORS = {
  blue: { id: 'blue', name: 'Cobalt Blue', primary: '#2563eb', hover: '#1d4ed8', light: 'rgba(37, 99, 235, 0.1)' },
  emerald: { id: 'emerald', name: 'Emerald Forest', primary: '#059669', hover: '#047857', light: 'rgba(5, 150, 105, 0.1)' },
  violet: { id: 'violet', name: 'Royal Violet', primary: '#7c3aed', hover: '#6d28d9', light: 'rgba(124, 58, 237, 0.1)' },
  amber: { id: 'amber', name: 'Industrial Bronze', primary: '#d97706', hover: '#b45309', light: 'rgba(217, 119, 6, 0.1)' },
  rose: { id: 'rose', name: 'Crimson Forge', primary: '#e11d48', hover: '#be123c', light: 'rgba(225, 29, 72, 0.1)' },
  teal: { id: 'teal', name: 'Steel Cyan', primary: '#0d9488', hover: '#0f766e', light: 'rgba(13, 148, 136, 0.1)' }
};

// ================= COMPONENT: AI PREDICTIVE DEMAND FORECAST & RUNWAY =================
function AiForecastWidget({ rawMaterials = [], finishedGoods = [], sales = [], onRestock, currency = '₹' }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadForecast = () => {
    setLoading(true);
    fetch('/api/ai/forecast')
      .then(res => res.json())
      .then(res => {
        setLoading(false);
        if (res.success) {
          setForecastData(res.data);
        } else {
          setError(res.error || 'Failed to load forecast');
        }
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Network error');
      });
  };

  useEffect(() => {
    loadForecast();
  }, [rawMaterials.length, sales.length]);

  if (loading && !forecastData) {
    return h('div', { className: 'forecast-panel', style: { padding: '24px', textAlign: 'center' } },
      h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' } },
        h('div', { className: 'ai-typing-dot' }),
        h('span', null, 'AI analyzing sales velocity and calculating raw material runway...')
      )
    );
  }

  const summary = forecastData?.summary || {};
  const materials = forecastData?.rawMaterialForecast || [];
  const insights = forecastData?.insights || [];

  return h('div', { className: 'forecast-panel' },
    h('div', { className: 'forecast-header' },
      h('div', { className: 'forecast-title-wrap' },
        h('div', { className: 'forecast-sparkle-badge' }, '⚡'),
        h('div', null,
          h('h3', { style: { fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' } }, 'Predictive Demand Forecasting & Replenishment'),
          h('div', { style: { fontSize: 12, color: 'var(--text-muted)' } }, 'Using past 30-day sales run rates to project raw material depletion and stockout risks.')
        )
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('button', {
          className: 'btn btn-outline',
          style: { padding: '4px 9px', fontSize: 11.5 },
          onClick: loadForecast
        }, h(Icon, { name: 'refresh', size: 13 }), 'Recalculate Runways')
      )
    ),

    // KPI Summary row
    h('div', { className: 'forecast-kpis' },
      h('div', { className: 'forecast-kpi-card' },
        h('div', { className: 'forecast-kpi-label' }, 'Critical Stockout Hazards'),
        h('div', { className: 'forecast-kpi-val', style: { color: summary.criticalCount > 0 ? '#ef4444' : '#10b981' } },
          `${summary.criticalCount || 0} Material(s)`
        ),
        h('div', { className: 'forecast-kpi-sub' }, summary.criticalCount > 0 ? 'Runway under 7 days' : 'All runways above 7 days')
      ),
      h('div', { className: 'forecast-kpi-card' },
        h('div', { className: 'forecast-kpi-label' }, '30-Day Replenishment Capital'),
        h('div', { className: 'forecast-kpi-val', style: { color: 'var(--primary)' } },
          formatCurrency(summary.totalProcurementBudget || 0, currency)
        ),
        h('div', { className: 'forecast-kpi-sub' }, 'Capital needed for 30-day target buffers')
      ),
      h('div', { className: 'forecast-kpi-card' },
        h('div', { className: 'forecast-kpi-label' }, 'Highest Urgency Item'),
        h('div', { className: 'forecast-kpi-val', style: { fontSize: 14, color: '#f59e0b' } },
          summary.highestRiskMaterial ? `${summary.highestRiskMaterial.name} (${summary.highestRiskMaterial.runwayDays}d left)` : 'None'
        ),
        h('div', { className: 'forecast-kpi-sub' }, 'Projected earliest stockout')
      )
    ),

    // Strategic Insights Alert
    insights.length > 0 && h('div', { className: 'forecast-insights-alert' },
      insights.map((ins, idx) => h('div', { key: idx, style: { marginBottom: idx < insights.length - 1 ? 4 : 0 } }, ins))
    ),

    // Replenishment & Runway Table
    h('div', { className: 'custom-table-container' },
      h('table', { className: 'custom-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'RAW MATERIAL'),
            h('th', null, 'ON HAND'),
            h('th', null, 'DAILY SALES BURN'),
            h('th', null, 'EST. RUNWAY'),
            h('th', null, 'PROJECTED STOCKOUT'),
            h('th', null, 'RISK LEVEL'),
            h('th', null, 'AI RECOMMENDED ORDER'),
            h('th', null, 'EST. COST'),
            h('th', { style: { textAlign: 'right' } }, 'ACTION')
          )
        ),
        h('tbody', null,
          materials.map(m => {
            const pct = Math.min(100, Math.max(5, (m.runwayDays / 30) * 100));
            const fillClass = m.riskLevel === 'CRITICAL' ? 'critical' : m.riskLevel === 'WARNING' ? 'warning' : 'healthy';

            return h('tr', { key: m.id },
              h('td', { style: { fontWeight: 600, color: 'var(--text-primary)' } }, m.name),
              h('td', null, `${m.currentStock} ${m.unit}`),
              h('td', { style: { fontFamily: 'var(--font-mono)' } }, `${m.dailyBurnRate} ${m.unit}/day`),
              h('td', null,
                h('div', { style: { fontWeight: 700, color: m.riskLevel === 'CRITICAL' ? '#ef4444' : m.riskLevel === 'WARNING' ? '#f59e0b' : '#10b981' } }, `${m.runwayDays} days`),
                h('div', { className: 'runway-bar-container' },
                  h('div', { className: `runway-bar-fill ${fillClass}`, style: { width: `${pct}%` } })
                )
              ),
              h('td', { style: { fontSize: 11.5, color: 'var(--text-secondary)' } }, formatDate(m.runoutDate)),
              h('td', null,
                h('span', { className: `badge ${m.riskBadgeClass}` }, m.riskLevel)
              ),
              h('td', { style: { fontWeight: 700 } }, `${m.recommendedOrderQty} ${m.unit}`),
              h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, formatCurrency(m.estimatedProcurementCost, currency)),
              h('td', { style: { textAlign: 'right' } },
                m.recommendedOrderQty > 0 && h('button', {
                  className: 'btn btn-outline',
                  style: { padding: '3px 8px', fontSize: 11, borderColor: 'var(--primary)', color: 'var(--primary)' },
                  onClick: () => onRestock && onRestock(m)
                }, '+ Reorder')
              )
            );
          })
        )
      )
    )
  );
}

// ================= COMPONENT: SMART DOCUMENT / INVOICE OCR SCANNER =================
function SmartInvoiceOcrModal({ isOpen, onClose, onSuccess, currency = '₹' }) {
  if (!isOpen) return null;

  const [scanning, setScanning] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [scanStep, setScanStep] = useState('');
  const [formValues, setFormValues] = useState({
    description: '',
    category: 'Materials',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    amount: ''
  });

  const handleScanSample = (sampleId) => {
    setSelectedSample(sampleId);
    setScanning(true);
    setScanStep('Initializing neural optical recognition...');

    setTimeout(() => setScanStep('Detecting vendor letterhead & GSTIN...'), 400);
    setTimeout(() => setScanStep('Extracting line items, unit rates & CGST/SGST...'), 800);

    fetch('/api/ai/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId })
    })
      .then(res => res.json())
      .then(res => {
        setTimeout(() => {
          setScanning(false);
          if (res.success && res.data) {
            setOcrResult(res.data);
            setFormValues({
              description: res.data.description || `${res.data.category} from ${res.data.vendor}`,
              category: res.data.category || 'Materials',
              expense_date: res.data.date || new Date().toISOString().split('T')[0],
              payment_method: res.data.paymentMethod || 'Bank Transfer',
              amount: String(res.data.totalAmount || '')
            });
          }
        }, 1100);
      })
      .catch(err => {
        setScanning(false);
        alert(err.message || 'OCR processing failed');
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setScanning(true);
    setScanStep(`Reading document: ${file.name}...`);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setTimeout(() => setScanStep('Extracting invoice table & amount figures...'), 500);

      fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileBase64: base64 })
      })
        .then(res => res.json())
        .then(res => {
          setTimeout(() => {
            setScanning(false);
            if (res.success && res.data) {
              setOcrResult(res.data);
              setFormValues({
                description: res.data.description || `${res.data.category} from ${res.data.vendor}`,
                category: res.data.category || 'Materials',
                expense_date: res.data.date || new Date().toISOString().split('T')[0],
                payment_method: res.data.paymentMethod || 'Bank Transfer',
                amount: String(res.data.totalAmount || '')
              });
            }
          }, 900);
        })
        .catch(err => {
          setScanning(false);
          alert(err.message || 'OCR processing failed');
        });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExtractedExpense = (e) => {
    e.preventDefault();
    if (!formValues.amount || Number(formValues.amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: formValues.description,
        category: formValues.category,
        expense_date: formValues.expense_date,
        payment_method: formValues.payment_method,
        amount: Number(formValues.amount)
      })
    })
      .then(res => res.json())
        .then(res => {
          if (res.success) {
            onSuccess && onSuccess(res.data);
            onClose();
          } else {
            alert(res.error || 'Failed to save expense');
          }
        })
        .catch(err => alert(err.message || 'Network error'));
  };

  return h('div', { className: 'modal-overlay' },
    h('div', { className: 'modal-card ocr-modal-card' },
      h('div', { className: 'modal-header' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          h('span', { style: { fontSize: 20 } }, '⚡'),
          h('div', null,
            h('h3', null, 'Smart Document / Invoice OCR Scanner'),
            h('div', { style: { fontSize: 12, color: 'var(--text-muted)' } }, 'Extract vendor names, line items, and tax totals directly into your expenses.')
          )
        ),
        h('button', { className: 'modal-close', onClick: onClose }, '✕')
      ),
      h('div', { className: 'modal-body', style: { padding: '18px 24px' } },
        // Sample Bills Quick Test Pills
        h('div', null,
          h('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.5px' } },
            'TRY SAMPLE PHYSICAL VENDOR BILLS (1-CLICK TEST):'
          ),
          h('div', { className: 'ocr-sample-pills' },
            h('button', {
              type: 'button',
              className: `ocr-sample-pill ${selectedSample === 'sample-steel' ? 'active' : ''}`,
              onClick: () => handleScanSample('sample-steel')
            }, '📄 Precision Metals Corp (Steel Sheets · ₹29,146)'),
            h('button', {
              type: 'button',
              className: `ocr-sample-pill ${selectedSample === 'sample-power' ? 'active' : ''}`,
              onClick: () => handleScanSample('sample-power')
            }, '⚡ Industrial Power Bill (HT Electricity · ₹18,748)'),
            h('button', {
              type: 'button',
              className: `ocr-sample-pill ${selectedSample === 'sample-machinery' ? 'active' : ''}`,
              onClick: () => handleScanSample('sample-machinery')
            }, '🔧 Apex CNC Maintenance (Hydraulic Spares · ₹14,042)')
          )
        ),

        // File dropzone
        h('div', { style: { margin: '10px 0 16px 0', border: '2px dashed var(--border-light)', borderRadius: 10, padding: '16px', textAlign: 'center', background: 'var(--bg-secondary)', position: 'relative' } },
          h('input', {
            type: 'file',
            accept: 'image/*,.pdf,.txt',
            onChange: handleFileUpload,
            style: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }
          }),
          h('div', { style: { pointerEvents: 'none' } },
            h('span', { style: { fontSize: 22, display: 'block', marginBottom: 4 } }, '📁'),
            h('div', { style: { fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' } }, 'Click to upload a physical vendor bill or drag and drop'),
            h('div', { style: { fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 } }, 'PNG, JPG, or PDF invoices supported')
          )
        ),

        // Two-column Split: Document View on Left, Extracted Fields on Right
        h('div', { className: 'ocr-scanner-grid' },
          // Left Column: Document Scanner Box
          h('div', { className: 'ocr-preview-box' },
            scanning && h('div', { className: 'ocr-laser-line' }),
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
              h('span', { style: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.4px' } }, 'DOCUMENT PREVIEW'),
              ocrResult && h('span', { className: 'badge badge-success', style: { fontSize: 10 } }, `${Math.round((ocrResult.confidenceScore || 0.95) * 100)}% Confidence`)
            ),
            scanning ?
              h('div', { style: { margin: 'auto', textAlign: 'center', padding: '30px 10px' } },
                h('div', { className: 'ai-typing-indicator', style: { marginBottom: 12 } },
                  h('div', { className: 'ai-typing-dot' }),
                  h('div', { className: 'ai-typing-dot' }),
                  h('div', { className: 'ai-typing-dot' })
                ),
                h('div', { style: { fontWeight: 700, fontSize: 13, color: '#8b5cf6' } }, 'AI OCR Scanning in Progress...'),
                h('div', { style: { fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 } }, scanStep)
              ) :
              ocrResult ?
                h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
                  h('pre', {
                    style: {
                      background: 'rgba(0,0,0,0.2)',
                      padding: '12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text-secondary)',
                      flex: 1,
                      overflowY: 'auto',
                      maxHeight: 220
                    }
                  }, ocrResult.rawText || 'Document text extracted.'),
                  ocrResult.lineItems && ocrResult.lineItems.length > 0 && h('div', { style: { marginTop: 10 } },
                    h('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 } }, 'DETECTED LINE ITEMS:'),
                    ocrResult.lineItems.map((it, idx) =>
                      h('div', { key: idx, style: { display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '3px 0', borderBottom: '1px dashed var(--border-light)' } },
                        h('span', null, it.description),
                        h('span', { style: { fontWeight: 600, fontFamily: 'var(--font-mono)' } }, formatCurrency(it.total, currency))
                      )
                    )
                  )
                ) :
                h('div', { style: { margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 } },
                  'Select a sample bill above or upload a document to view OCR extraction.'
                )
          ),

          // Right Column: Editable Expense Fields
          h('form', { onSubmit: handleSaveExtractedExpense, style: { display: 'flex', flexDirection: 'column', gap: 12 } },
            h('div', { className: 'form-group' },
              h('label', null, 'Extracted Description / Title'),
              h('input', {
                className: 'form-input',
                value: formValues.description,
                required: true,
                onChange: e => setFormValues({ ...formValues, description: e.target.value })
              })
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Expense Category'),
                h('select', {
                  className: 'form-input',
                  value: formValues.category,
                  onChange: e => setFormValues({ ...formValues, category: e.target.value })
                },
                  h('option', { value: 'Materials' }, 'Materials'),
                  h('option', { value: 'Utilities' }, 'Utilities'),
                  h('option', { value: 'Maintenance' }, 'Maintenance'),
                  h('option', { value: 'Logistics' }, 'Logistics'),
                  h('option', { value: 'General' }, 'General')
                )
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Invoice / Bill Date'),
                h('input', {
                  type: 'date',
                  className: 'form-input',
                  value: formValues.expense_date,
                  required: true,
                  onChange: e => setFormValues({ ...formValues, expense_date: e.target.value })
                })
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Payment Method'),
                h('select', {
                  className: 'form-input',
                  value: formValues.payment_method,
                  onChange: e => setFormValues({ ...formValues, payment_method: e.target.value })
                },
                  h('option', { value: 'Bank Transfer' }, 'Bank Transfer (NEFT/RTGS)'),
                  h('option', { value: 'Online Banking' }, 'Online Banking'),
                  h('option', { value: 'UPI' }, 'UPI'),
                  h('option', { value: 'Cash' }, 'Cash'),
                  h('option', { value: 'Cheque' }, 'Cheque')
                )
              ),
              h('div', { className: 'form-group' },
                h('label', null, `Total Amount (${currency})`),
                h('input', {
                  type: 'number',
                  step: '0.01',
                  className: 'form-input',
                  placeholder: '0.00',
                  value: formValues.amount,
                  required: true,
                  style: { fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-mono)' },
                  onChange: e => setFormValues({ ...formValues, amount: e.target.value })
                })
              )
            ),
            h('div', { style: { marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10 } },
              h('button', { type: 'button', className: 'btn btn-outline', onClick: onClose }, 'Cancel'),
              h('button', {
                type: 'submit',
                className: 'btn btn-primary',
                style: { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none' },
                disabled: scanning || !formValues.amount
              }, '✓ Save Extracted Expense')
            )
          )
        )
      )
    )
  );
}

// ================= COMPONENT: NATURAL LANGUAGE BUSINESS ANALYST COPILOT =================
function AiAnalystDrawer({ isOpen, onClose, initialQuery = '', currency = '₹' }) {
  if (!isOpen) return null;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **ForgeAI Business Analyst**. Ask me anything about your product profit margins, operating expense distributions, raw material stockout hazards, or financial profitability.',
      suggestions: [
        'What was our highest-margin product last month?',
        'How much did we spend on utilities vs raw materials?',
        'Which raw materials have a high risk of stockout?',
        'What is our net operating profit and margin?'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q || !q.trim() || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    fetch('/api/ai/analyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, history: messages.slice(-4) })
    })
      .then(res => res.json())
      .then(res => {
        setLoading(false);
        if (res.success && res.data) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: res.data.answer,
            metrics: res.data.metrics,
            table: res.data.table,
            suggestions: res.data.suggestions
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I encountered an issue analyzing the ledger: ${res.error || 'Unknown error'}. Please try rephrasing your question.`
          }]);
        }
      })
      .catch(err => {
        setLoading(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Network error: ${err.message}. Please verify your connection.`
        }]);
      });
  };

  return h('div', { className: 'ai-drawer-overlay', onClick: onClose },
    h('div', { className: 'ai-drawer-card', onClick: e => e.stopPropagation() },
      // Header
      h('div', { className: 'ai-drawer-header' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          h('div', { className: 'forecast-sparkle-badge' }, '✦'),
          h('div', null,
            h('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' } }, 'ForgeAI Business Analyst'),
            h('div', { style: { fontSize: 11.5, color: 'var(--text-muted)' } }, 'Real-time conversational financial & operations copilot')
          )
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('button', {
            className: 'btn btn-outline',
            style: { padding: '3px 8px', fontSize: 11 },
            onClick: () => setMessages([
              {
                role: 'assistant',
                content: 'Chat cleared. Ask me another question about margins, expenses, or inventory!',
                suggestions: [
                  'What was our highest-margin product last month?',
                  'How much did we spend on utilities vs raw materials?',
                  'What is our net operating profit and margin?'
                ]
              }
            ])
          }, 'Clear'),
          h('button', { className: 'modal-close', style: { position: 'static' }, onClick: onClose }, '✕')
        )
      ),

      // Message Area
      h('div', { className: 'ai-drawer-messages', ref: messagesEndRef },
        messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return h('div', { key: idx, className: `ai-msg-bubble ${isUser ? 'ai-msg-user' : 'ai-msg-bot'}` },
            // Bubble Content
            h('div', {
              style: { whiteSpace: 'pre-wrap' },
              dangerouslySetInnerHTML: {
                __html: (m.content || '')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/• (.*?)(?:\n|$)/g, '<div style="margin-left: 12px; margin-bottom: 3px;">• $1</div>')
              }
            }),

            // Optional KPI Metrics Callouts
            m.metrics && m.metrics.length > 0 && h('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(3, m.metrics.length)}, 1fr)`,
                gap: 8,
                marginTop: 12,
                padding: '10px',
                background: 'rgba(0,0,0,0.06)',
                borderRadius: 8
              }
            },
              m.metrics.map((met, mi) => h('div', { key: mi, style: { textAlign: 'center' } },
                h('div', { style: { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' } }, met.label),
                h('div', { style: { fontSize: 16, fontWeight: 800, color: met.badge === 'success' ? '#10b981' : met.badge === 'danger' ? '#ef4444' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' } }, met.value),
                met.subtext && h('div', { style: { fontSize: 10, color: 'var(--text-secondary)' } }, met.subtext)
              ))
            ),

            // Optional Structured Table
            m.table && h('div', { style: { marginTop: 12, overflowX: 'auto' } },
              m.table.title && h('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5 } }, m.table.title.toUpperCase()),
              h('table', { style: { width: '100%', fontSize: 11, borderCollapse: 'collapse', textAlign: 'left' } },
                h('thead', null,
                  h('tr', { style: { borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' } },
                    m.table.headers.map((th, thi) => h('th', { key: thi, style: { padding: '5px 6px' } }, th))
                  )
                ),
                h('tbody', null,
                  m.table.rows.map((row, ri) => h('tr', { key: ri, style: { borderBottom: '1px solid rgba(148, 163, 184, 0.15)' } },
                    row.map((cell, ci) => h('td', { key: ci, style: { padding: '5px 6px', fontFamily: ci > 0 ? 'var(--font-mono)' : 'inherit' } }, cell))
                  ))
                )
              )
            ),

            // Optional Suggestion Chips
            m.suggestions && m.suggestions.length > 0 && h('div', { className: 'ai-chip-suggestions' },
              m.suggestions.map((sug, si) => h('button', {
                key: si,
                type: 'button',
                className: 'ai-chip-pill',
                onClick: () => handleSend(sug)
              }, sug))
            )
          );
        }),

        loading && h('div', { className: 'ai-typing-indicator' },
          h('div', { className: 'ai-typing-dot' }),
          h('div', { className: 'ai-typing-dot' }),
          h('div', { className: 'ai-typing-dot' }),
          h('span', null, 'ForgeAI analyzing plant data...')
        )
      ),

      // Input Row
      h('form', {
        className: 'ai-drawer-input-row',
        onSubmit: e => { e.preventDefault(); handleSend(); }
      },
        h('input', {
          className: 'form-input',
          style: { flex: 1, borderRadius: 20, padding: '9px 16px', fontSize: 13 },
          placeholder: 'Ask about margins, expenses, raw materials...',
          value: inputQuery,
          disabled: loading,
          onChange: e => setInputQuery(e.target.value)
        }),
        h('button', {
          type: 'submit',
          className: 'btn btn-primary',
          style: {
            borderRadius: 20,
            padding: '9px 16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          },
          disabled: loading || !inputQuery.trim()
        }, 'Send', h(Icon, { name: 'arrowRight', size: 14 }))
      )
    )
  );
}

// ============================================================
// BARCODE (CODE 128) & 2D QR CODE VECTOR SVG ENGINES
// ============================================================
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

function generateCode128SVG(text, options = {}) {
  const height = options.height || 48;
  const barWidth = options.barWidth || 2;
  const quietZone = 8;
  const str = String(text || '').trim();
  if (!str) return '';

  const codes = [104]; // START B
  let checksum = 104;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      codes.push(code);
      checksum += code * (i + 1);
    }
  }
  codes.push(checksum % 103);
  codes.push(106); // STOP

  const rects = [];
  let currentX = quietZone;
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || '111111';
    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const w = parseInt(pattern[j], 10) * barWidth;
      if (isBar) {
        rects.push(`<rect x="${currentX}" y="0" width="${w}" height="${height}" fill="currentColor" />`);
      }
      currentX += w;
      isBar = !isBar;
    }
  }
  const totalWidth = currentX + quietZone;
  return `<svg viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:${height}px;">${rects.join('')}</svg>`;
}

function generateQRCodeSVG(text) {
  const str = String(text || '').trim();
  if (!str) return '';
  try {
    if (typeof window !== 'undefined' && window.qrcode) {
      const qr = window.qrcode(0, 'M');
      qr.addData(str);
      qr.make();
      return qr.createSvgTag({ scalable: true, margin: 1 });
    }
  } catch (err) {
    console.warn('QR code generator note:', err.message);
  }
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><rect width="40" height="40" fill="#000"/><rect x="4" y="4" width="32" height="32" fill="#fff"/><rect x="8" y="8" width="8" height="8" fill="#000"/><rect x="24" y="8" width="8" height="8" fill="#000"/><rect x="8" y="24" width="8" height="8" fill="#000"/></svg>`;
}

function playScanChime(success = true) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(success ? 880 : 300, ctx.currentTime);
    if (success) {
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.09);
    }
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (_) {}
}

// ============================================================
// RBAC ROLES CONFIGURATION & ACCESS CONTROL GUARDS
// ============================================================
const ROLE_CONFIGS = {
  owner: {
    key: 'owner',
    name: 'Plant Owner / Admin',
    badgeClass: 'role-badge-owner',
    icon: '👑',
    color: '#f59e0b',
    tag: 'SUPERADMIN',
    chips: ['All 9 Modules', 'Full Ledger & P&L', 'Team Security RBAC'],
    workspaceTitle: 'Plant Owner Command Center',
    allowedTabs: ['overview', 'inventory', 'sales', 'expenses', 'rawMaterials', 'production', 'payroll', 'reports', 'settings'],
    canViewFinancials: true,
    canEditInventory: true,
    canEditProduction: true,
    canDisbursePayroll: true,
    canManageTeam: true,
    summary: 'Full superadmin control over all company financials, production machinery, shop floor inventory, and user privileges.'
  },
  operator: {
    key: 'operator',
    name: 'Shop Floor Operator',
    badgeClass: 'role-badge-operator',
    icon: '⚙️',
    color: '#f97316',
    tag: 'SHOP FLOOR',
    chips: ['Production Runs', 'Masked Unit Costs', 'Material Ingredients'],
    workspaceTitle: 'Shop Floor & Machining Station',
    allowedTabs: ['overview', 'production', 'rawMaterials', 'inventory'],
    canViewFinancials: false,
    canEditInventory: false,
    canEditProduction: true,
    canDisbursePayroll: false,
    canManageTeam: false,
    summary: 'Dedicated to machine shop floor queues, batch logging, and material availability. Financial totals and margins are strictly masked.'
  },
  clerk: {
    key: 'clerk',
    name: 'Warehouse & Stock Clerk',
    badgeClass: 'role-badge-clerk',
    icon: '📦',
    color: '#10b981',
    tag: 'WAREHOUSE',
    chips: ['Goods Inventory', 'Barcode & QR Studio', 'Stock Reconcile'],
    workspaceTitle: 'Warehouse Intake & Dispatch Depot',
    allowedTabs: ['overview', 'inventory', 'rawMaterials', 'production'],
    canViewFinancials: false,
    canEditInventory: true,
    canEditProduction: false,
    canDisbursePayroll: false,
    canManageTeam: false,
    summary: 'Focused on physical warehouse intake, barcode & QR scanning, label printing, and stock count increments/decrements.'
  },
  accountant: {
    key: 'accountant',
    name: 'Accountant & Compliance',
    badgeClass: 'role-badge-accountant',
    icon: '📊',
    color: '#8b5cf6',
    tag: 'FINANCE',
    chips: ['Sales Invoices', 'Vendor Bills OCR', 'Staff Payroll'],
    workspaceTitle: 'Finance & Tax Compliance Office',
    allowedTabs: ['overview', 'sales', 'expenses', 'payroll', 'reports', 'settings'],
    canViewFinancials: true,
    canEditInventory: false,
    canEditProduction: false,
    canDisbursePayroll: true,
    canManageTeam: false,
    summary: 'Authorized for sales invoices, operating expenses, vendor OCR receipts, tax/GST compliance schedules, and payroll disbursements.'
  }
};

function normalizeRole(roleStr) {
  if (!roleStr) return 'owner';
  const r = String(roleStr).toLowerCase();
  if (r.includes('operat') || r.includes('machin') || r.includes('technician')) return 'operator';
  if (r.includes('clerk') || r.includes('wareh') || r.includes('stock') || r.includes('logist')) return 'clerk';
  if (r.includes('account') || r.includes('financ') || r.includes('cpa') || r.includes('tax') || r.includes('bookkeep')) return 'accountant';
  return 'owner';
}

function AccessRestrictedCard({ role, allowedRoles = ['Owner', 'Accountant'], onReset }) {
  const currentCfg = ROLE_CONFIGS[role] || ROLE_CONFIGS.owner;
  return h('div', { className: 'access-restricted-card' },
    h('div', { className: 'restricted-lock-icon' }, '🔒'),
    h('h2', { className: 'restricted-title' }, 'Access Restricted to Financial & Management Staff'),
    h('p', { className: 'restricted-desc' },
      'This ledger view is restricted to ',
      allowedRoles.join(' and '),
      ' permissions. Your workspace view is currently active as ',
      h('span', { className: `role-badge ${currentCfg.badgeClass}`, style: { margin: '0 4px' } }, `${currentCfg.icon} ${currentCfg.name}`),
      '.'
    ),
    h('p', { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 8 } },
      'Operators and Clerks have shop-floor and inventory focus without exposure to sensitive business margins or payroll distributions.'
    ),
    h('div', { style: { marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' } },
      h('button', {
        className: 'btn btn-primary',
        onClick: onReset
      }, '👑 Return to Owner View')
    )
  );
}

// ============================================================
// BARCODE & QR CODE LABEL STUDIO MODAL
// ============================================================
function BarcodeLabelModal({
  isOpen,
  onClose,
  initialItem,
  finishedGoods = [],
  rawMaterials = [],
  company,
  onOpenScanner
}) {
  if (!isOpen) return null;

  const allItems = useMemo(() => {
    const list = [];
    finishedGoods.forEach(g => list.push({
      id: g.id,
      name: g.item_name || g.name,
      sku: g.sku || `FG-${g.id}`,
      type: 'Finished good',
      price: (Number(g.unit_cost) || 0) * 1.3,
      unit: g.unit || 'units',
      raw: g
    }));
    rawMaterials.forEach(m => list.push({
      id: m.id,
      name: m.item_name || m.name,
      sku: m.sku || `RM-${m.id}`,
      type: 'Raw material',
      price: Number(m.unit_cost) || 0,
      unit: m.unit || 'kg',
      raw: m
    }));
    return list;
  }, [finishedGoods, rawMaterials]);

  const [selectedSku, setSelectedSku] = useState(() => {
    if (initialItem && initialItem.sku) return initialItem.sku;
    if (allItems.length > 0) return allItems[0].sku;
    return 'FG-AB-204';
  });

  const [format, setFormat] = useState('single');
  const [showBarcode, setShowBarcode] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCompany, setShowCompany] = useState(true);
  const [copies, setCopies] = useState(24);

  const currentItem = useMemo(() => {
    return allItems.find(it => it.sku === selectedSku) || allItems[0] || {
      id: 1,
      name: 'Assembly bracket',
      sku: 'FG-AB-204',
      type: 'Finished good',
      price: 370.5,
      unit: 'units'
    };
  }, [allItems, selectedSku]);

  const barcodeSvgHtml = useMemo(() => {
    return generateCode128SVG(currentItem.sku, { height: format === 'compact' ? 36 : 46, barWidth: 2 });
  }, [currentItem.sku, format]);

  const qrSvgHtml = useMemo(() => {
    return generateQRCodeSVG(`SKU:${currentItem.sku}|ITEM:${currentItem.name}|COMPANY:${company?.name || 'Riverton Works'}`);
  }, [currentItem, company]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="360" height="220" viewBox="0 0 360 220">
        <rect width="360" height="220" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">${(company?.name || 'Riverton Works').toUpperCase()}</text>
        <text x="344" y="28" text-anchor="end" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b">${currentItem.type.toUpperCase()}</text>
        <line x1="16" y1="36" x2="344" y2="36" stroke="#0f172a" stroke-width="1.5"/>
        <text x="16" y="60" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${currentItem.name}</text>
        <text x="16" y="80" font-family="monospace" font-size="13" font-weight="bold" fill="#2563eb">${currentItem.sku}</text>
        <g transform="translate(16, 92)">${barcodeSvgHtml}</g>
        <text x="120" y="152" font-family="monospace" font-size="10" letter-spacing="2" fill="#000">${currentItem.sku}</text>
        <g transform="translate(268, 86) scale(1.4)">${qrSvgHtml}</g>
        <line x1="16" y1="184" x2="344" y2="184" stroke="#e2e8f0" stroke-width="1"/>
        <text x="16" y="202" font-family="sans-serif" font-size="11" fill="#475569">ForgeLedger Verified</text>
        <text x="344" y="202" text-anchor="end" font-family="monospace" font-size="13" font-weight="bold" fill="#0f172a">₹${Number(currentItem.price).toFixed(2)} / ${currentItem.unit}</text>
      </svg>
    `;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `label-${currentItem.sku.toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSingleSticker = (key = 'single') => {
    return h('div', {
      key,
      className: `sticker-label-card ${format === 'compact' ? 'sticker-single-compact' : 'sticker-single-50x30'}`
    },
      showCompany && h('div', { className: 'sticker-header' },
        h('span', { className: 'sticker-brand' }, company?.name || 'Riverton Works'),
        h('span', { className: 'sticker-category-tag' }, currentItem.type)
      ),
      h('div', null,
        h('div', { className: 'sticker-title' }, currentItem.name),
        h('div', { className: 'sticker-sku-badge' }, currentItem.sku)
      ),
      h('div', { className: 'sticker-codes-row' },
        showBarcode && h('div', { className: 'sticker-barcode-wrap' },
          h('div', { dangerouslySetInnerHTML: { __html: barcodeSvgHtml } }),
          h('div', { className: 'sticker-barcode-text' }, currentItem.sku)
        ),
        showQr && h('div', {
          className: 'sticker-qr-wrap',
          dangerouslySetInnerHTML: { __html: qrSvgHtml }
        })
      ),
      h('div', { className: 'sticker-footer' },
        h('span', null, 'ForgeLedger Tag'),
        showPrice && h('span', { className: 'sticker-price-tag' }, `₹${Number(currentItem.price).toFixed(2)} / ${currentItem.unit}`)
      )
    );
  };

  return h('div', { className: 'modal-overlay', onClick: onClose },
    h('div', {
      className: 'modal-card label-studio-modal',
      onClick: e => e.stopPropagation()
    },
      // Header
      h('div', { className: 'modal-header' },
        h('div', null,
          h('h2', { className: 'modal-title' }, '🏷️ Barcode & QR Code Label Studio'),
          h('div', { className: 'modal-subtitle' }, 'Design and print physical vector sticker labels for thermal rolls and standard A4 sheets.')
        ),
        h('div', { style: { display: 'flex', gap: 8 } },
          onOpenScanner && h('button', {
            className: 'btn btn-outline',
            onClick: () => { onClose(); onOpenScanner(); }
          }, '📷 Camera Scanner'),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        )
      ),

      // Studio Grid Body
      h('div', { className: 'label-studio-grid' },
        // Left Column: Configuration Controls
        h('div', { className: 'label-config-card' },
          h('label', { className: 'form-label' }, 'Select Inventory SKU / Material'),
          h('select', {
            className: 'form-input',
            value: selectedSku,
            onChange: e => setSelectedSku(e.target.value)
          },
            allItems.map(it => h('option', { key: it.sku, value: it.sku }, `${it.sku} - ${it.name} (${it.type})`))
          ),

          h('div', { style: { marginTop: 14 } },
            h('label', { className: 'form-label' }, 'Print Format / Layout'),
            h('div', { style: { display: 'flex', gap: 6, marginTop: 4 } },
              [
                { id: 'single', label: 'Single 50×30mm' },
                { id: 'sheet', label: 'A4 Sheet (3×8)' },
                { id: 'compact', label: 'Bin 40×25mm' }
              ].map(f =>
                h('button', {
                  key: f.id,
                  type: 'button',
                  className: `btn ${format === f.id ? 'btn-primary' : 'btn-outline'}`,
                  style: { flex: 1, padding: '6px 8px', fontSize: 11.5 },
                  onClick: () => setFormat(f.id)
                }, f.label)
              )
            )
          ),

          h('div', { style: { marginTop: 16 } },
            h('label', { className: 'form-label' }, 'Label Elements'),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 } },
              h('label', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' } },
                h('input', { type: 'checkbox', checked: showBarcode, onChange: e => setShowBarcode(e.target.checked) }),
                'Code 128 1D Barcode'
              ),
              h('label', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' } },
                h('input', { type: 'checkbox', checked: showQr, onChange: e => setShowQr(e.target.checked) }),
                '2D Vector QR Code'
              ),
              h('label', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' } },
                h('input', { type: 'checkbox', checked: showPrice, onChange: e => setShowPrice(e.target.checked) }),
                'Unit Price / Cost'
              ),
              h('label', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' } },
                h('input', { type: 'checkbox', checked: showCompany, onChange: e => setShowCompany(e.target.checked) }),
                'Company Brand Header'
              )
            )
          ),

          format === 'sheet' && h('div', { style: { marginTop: 14 } },
            h('label', { className: 'form-label' }, 'Labels per Sheet Grid'),
            h('input', {
              type: 'number',
              className: 'form-input',
              min: 1,
              max: 48,
              value: copies,
              onChange: e => setCopies(Math.max(1, parseInt(e.target.value) || 1))
            })
          ),

          h('div', { style: { marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 } },
            h('button', {
              className: 'btn btn-primary',
              style: { padding: '10px 16px', fontWeight: 700 },
              onClick: handlePrint
            }, '🖨️ Print Labels / Save PDF'),
            h('button', {
              className: 'btn btn-outline',
              style: { padding: '8px 14px' },
              onClick: handleDownloadSvg
            }, '📥 Download Vector SVG')
          )
        ),

        // Right Column: Live Printable Preview
        h('div', { className: 'label-preview-panel' },
          h('div', { style: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 } },
            format === 'sheet' ? `A4 Sticker Sheet Preview (${copies} Labels · 3 Columns)` : 'Single Label Preview (Actual Physical Scale)'
          ),

          format === 'sheet' ?
            h('div', { className: 'sticker-sheet-preview-grid' },
              Array.from({ length: copies }).map((_, idx) => renderSingleSticker(`sheet-item-${idx}`))
            ) :
            renderSingleSticker('single-preview')
        )
      ),

      // Hidden Container for Print CSS Output
      h('div', { className: 'printable-labels-container' },
        format === 'sheet' ?
          h('div', { className: 'sticker-sheet-preview-grid', style: { boxShadow: 'none', border: 'none', padding: 0 } },
            Array.from({ length: copies }).map((_, idx) => renderSingleSticker(`print-${idx}`))
          ) :
          renderSingleSticker('print-single')
      )
    )
  );
}

// ============================================================
// MOBILE & CAMERA BARCODE SCANNER MODAL
// ============================================================
function BarcodeScannerModal({
  isOpen,
  onClose,
  finishedGoods = [],
  rawMaterials = [],
  onUpdateStock,
  onAddToInvoice,
  onOpenLabelStudio
}) {
  if (!isOpen) return null;

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [manualInput, setManualInput] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [adjustMessage, setAdjustMessage] = useState('');

  const allItems = useMemo(() => {
    const list = [];
    finishedGoods.forEach(g => list.push({
      id: g.id,
      name: g.item_name || g.name,
      sku: g.sku || `FG-${g.id}`,
      type: 'Finished good',
      category: g.category || 'Finished good',
      quantity: Number(g.quantity) || 0,
      unit: g.unit || 'units',
      unit_cost: Number(g.unit_cost) || 0,
      price: (Number(g.unit_cost) || 0) * 1.3,
      isRaw: false
    }));
    rawMaterials.forEach(m => list.push({
      id: m.id,
      name: m.item_name || m.name,
      sku: m.sku || `RM-${m.id}`,
      type: 'Raw material',
      category: 'Raw material',
      quantity: Number(m.quantity) || 0,
      unit: m.unit || 'kg',
      unit_cost: Number(m.unit_cost) || 0,
      price: Number(m.unit_cost) || 0,
      isRaw: true
    }));
    return list;
  }, [finishedGoods, rawMaterials]);

  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode }, width: { ideal: 640 }, height: { ideal: 480 } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
            setStream(activeStream);
            setCameraActive(true);
          }
        }
      } catch (err) {
        console.warn('Camera access unavailable or declined:', err.message);
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  useEffect(() => {
    let animId;
    let detector = null;
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new window.BarcodeDetector({ formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'upc_a'] });
      } catch (_) {}
    }

    const checkFrame = async () => {
      if (detector && videoRef.current && videoRef.current.readyState === 4) {
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const rawVal = codes[0].rawValue;
            handleMatchCode(rawVal);
          }
        } catch (_) {}
      }
      animId = requestAnimationFrame(checkFrame);
    };

    if (cameraActive) {
      animId = requestAnimationFrame(checkFrame);
    }

    return () => cancelAnimationFrame(animId);
  }, [cameraActive, allItems]);

  const handleMatchCode = (code) => {
    const clean = String(code || '').trim().toLowerCase();
    if (!clean) return;

    let targetSku = clean;
    if (clean.includes('sku:')) {
      const match = clean.match(/sku:([^|]+)/i);
      if (match) targetSku = match[1].toLowerCase().trim();
    }

    const matched = allItems.find(it =>
      it.sku.toLowerCase() === targetSku ||
      it.name.toLowerCase() === targetSku ||
      it.sku.toLowerCase().includes(targetSku)
    );

    if (matched) {
      playScanChime(true);
      setScannedItem(matched);
      setAdjustMessage('');
    } else {
      playScanChime(false);
      setAdjustMessage(`No inventory item matches code "${code}"`);
    }
  };

  const handleQuickAdjust = async (delta) => {
    if (!scannedItem) return;
    const newQty = Math.max(0, scannedItem.quantity + delta);
    try {
      await onUpdateStock(scannedItem.id, newQty, scannedItem.isRaw);
      setScannedItem(prev => ({ ...prev, quantity: newQty }));
      setAdjustMessage(`✓ Stock adjusted by ${delta > 0 ? `+${delta}` : delta} (New: ${newQty} ${scannedItem.unit})`);
      playScanChime(true);
    } catch (err) {
      setAdjustMessage(`Adjustment failed: ${err.message}`);
    }
  };

  return h('div', { className: 'modal-overlay', onClick: onClose },
    h('div', {
      className: 'modal-card scanner-modal',
      onClick: e => e.stopPropagation()
    },
      // Header
      h('div', { className: 'modal-header' },
        h('div', null,
          h('h2', { className: 'modal-title' }, '📷 Mobile & Camera Barcode Scanner'),
          h('div', { className: 'modal-subtitle' }, 'Point camera at physical labels or use instant SKU keyboard lookup.')
        ),
        h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
      ),

      // Camera Viewfinder Box
      h('div', { className: 'scanner-viewport-box' },
        h('video', {
          ref: videoRef,
          className: 'scanner-video-feed',
          autoPlay: true,
          playsInline: true,
          muted: true
        }),

        // Reticle HUD Overlay
        h('div', { className: 'scanner-reticle-overlay' },
          h('div', { className: 'scanner-target-frame' },
            h('div', { className: 'scanner-target-corner scanner-corner-tl' }),
            h('div', { className: 'scanner-target-corner scanner-corner-tr' }),
            h('div', { className: 'scanner-target-corner scanner-corner-bl' }),
            h('div', { className: 'scanner-target-corner scanner-corner-br' }),
            h('div', { className: 'scanner-laser-line' })
          )
        ),

        // Status Pill
        h('div', { className: 'scanner-status-pill' },
          h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: cameraActive ? '#10b981' : '#f59e0b', display: 'inline-block' } }),
          cameraActive ? `Live Camera (${facingMode === 'environment' ? 'Rear' : 'Front'})` : 'Camera Ready (Click simulation or enter SKU)'
        ),

        // Flip Camera Button
        cameraActive && h('button', {
          type: 'button',
          style: {
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(15, 23, 42, 0.75)',
            border: 'none',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 11,
            cursor: 'pointer'
          },
          onClick: () => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
        }, '🔄 Flip Camera')
      ),

      // Manual Search & Quick 1-Click Test Simulation
      h('div', { style: { marginTop: 14 } },
        h('form', {
          style: { display: 'flex', gap: 8 },
          onSubmit: e => { e.preventDefault(); handleMatchCode(manualInput); }
        },
          h('input', {
            className: 'form-input',
            style: { flex: 1 },
            placeholder: 'Type or scan SKU code (e.g. FG-AB-204, RM-ST-002)...',
            value: manualInput,
            onChange: e => setManualInput(e.target.value)
          }),
          h('button', {
            type: 'submit',
            className: 'btn btn-primary',
            style: { padding: '8px 14px' }
          }, 'Find SKU')
        ),

        // 1-Click Simulation Buttons for immediate testing
        h('div', { style: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' } },
          h('span', { style: { fontSize: 11, color: 'var(--text-muted)' } }, '1-Click Scan Test:'),
          allItems.slice(0, 3).map(it =>
            h('button', {
              key: it.sku,
              type: 'button',
              className: 'header-action-pill-btn',
              style: { padding: '3px 8px', fontSize: 11 },
              onClick: () => handleMatchCode(it.sku)
            }, `⚡ ${it.sku}`)
          )
        )
      ),

      // Scanned Matched Item Card
      scannedItem && h('div', { className: 'scanner-matched-card' },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' } },
          h('div', null,
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              h('h3', { style: { fontSize: 16, fontWeight: 800, margin: 0 } }, scannedItem.name),
              h('span', { className: 'role-badge role-badge-clerk' }, scannedItem.type)
            ),
            h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#2563eb', fontWeight: 700, marginTop: 2 } }, scannedItem.sku)
          ),
          h('div', { style: { textAlign: 'right' } },
            h('div', { style: { fontSize: 20, fontWeight: 800, color: '#10b981' } }, `${scannedItem.quantity} ${scannedItem.unit}`),
            h('div', { style: { fontSize: 11, color: 'var(--text-muted)' } }, 'Live in stock')
          )
        ),

        // Quick Stock Increments
        h('div', { style: { marginTop: 14 } },
          h('div', { style: { fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 } }, 'QUICK STOCK ADJUSTMENT (SHOP FLOOR INTAKE / DISPATCH)'),
          h('div', { className: 'quick-stock-btn-group' },
            [
              { label: '-10', val: -10 },
              { label: '-1', val: -1 },
              { label: '+1', val: 1 },
              { label: '+10', val: 10 }
            ].map(btn =>
              h('button', {
                key: btn.label,
                type: 'button',
                className: 'quick-stock-btn',
                onClick: () => handleQuickAdjust(btn.val)
              }, btn.label)
            )
          )
        ),

        adjustMessage && h('div', { style: { marginTop: 8, fontSize: 12, color: '#10b981', fontWeight: 600 } }, adjustMessage),

        // Quick Action Buttons
        h('div', { style: { display: 'flex', gap: 8, marginTop: 14 } },
          onAddToInvoice && !scannedItem.isRaw && h('button', {
            className: 'btn btn-primary',
            style: { flex: 1, padding: '7px 10px', fontSize: 12 },
            onClick: () => { onClose(); onAddToInvoice(scannedItem); }
          }, '🧾 Add to Invoice'),
          onOpenLabelStudio && h('button', {
            className: 'btn btn-outline',
            style: { flex: 1, padding: '7px 10px', fontSize: 12 },
            onClick: () => { onClose(); onOpenLabelStudio(scannedItem); }
          }, '🏷️ Print Labels'),
          h('button', {
            className: 'btn btn-outline',
            style: { padding: '7px 10px', fontSize: 12 },
            onClick: () => { setScannedItem(null); setAdjustMessage(''); }
          }, '🔄 Scan Next')
        )
      )
    )
  );
}

// ============================================================
// INVITE TEAM MEMBER MODAL
// ============================================================
function InviteTeamModal({ isOpen, onClose, onInvite }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('operator');
  const [department, setDepartment] = useState('Shop Floor & Machining');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Member full name is required'); return; }
    if (!email.includes('@')) { setError('A valid email address is required'); return; }

    setSubmitting(true);
    setError('');
    try {
      await onInvite({ name, email, role, department, phone });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to invite team member');
    } finally {
      setSubmitting(false);
    }
  };

  return h('div', { className: 'modal-overlay', onClick: onClose },
    h('div', {
      className: 'modal-card',
      style: { maxWidth: 520 },
      onClick: e => e.stopPropagation()
    },
      h('div', { className: 'modal-header' },
        h('div', null,
          h('h2', { className: 'modal-title' }, '👥 Invite Team Colleague'),
          h('div', { className: 'modal-subtitle' }, 'Add a coworker to your company workspace with role-based permissions.')
        ),
        h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
      ),

      h('form', { onSubmit: handleSubmit },
        h('div', { className: 'modal-body' },
          error && h('div', { className: 'alert alert-danger', style: { marginBottom: 14 } }, error),

          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Full Name *'),
            h('input', {
              className: 'form-input',
              required: true,
              placeholder: 'e.g. Ramesh Kumar',
              value: name,
              onChange: e => setName(e.target.value)
            })
          ),

          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Email Address *'),
            h('input', {
              type: 'email',
              className: 'form-input',
              required: true,
              placeholder: 'colleague@rivertonworks.local',
              value: email,
              onChange: e => setEmail(e.target.value)
            })
          ),

          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Assigned Role & Access Level *'),
            h('select', {
              className: 'form-input',
              value: role,
              onChange: e => {
                setRole(e.target.value);
                if (e.target.value === 'operator') setDepartment('Shop Floor & Machining');
                else if (e.target.value === 'clerk') setDepartment('Warehouse & Logistics');
                else if (e.target.value === 'accountant') setDepartment('Accounts & Tax Compliance');
                else if (e.target.value === 'owner') setDepartment('Plant Executive Office');
              }
            },
              Object.values(ROLE_CONFIGS).map(rc =>
                h('option', { key: rc.key, value: rc.key }, `${rc.icon} ${rc.name}`)
              )
            ),
            h('div', { style: { fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 } },
              ROLE_CONFIGS[role]?.summary
            )
          ),

          h('div', { className: 'form-row' },
            h('div', { className: 'form-group', style: { flex: 1 } },
              h('label', { className: 'form-label' }, 'Department'),
              h('input', {
                className: 'form-input',
                placeholder: 'e.g. Assembly Line A',
                value: department,
                onChange: e => setDepartment(e.target.value)
              })
            ),
            h('div', { className: 'form-group', style: { flex: 1 } },
              h('label', { className: 'form-label' }, 'Phone Number'),
              h('input', {
                className: 'form-input',
                placeholder: '+91 98765 00000',
                value: phone,
                onChange: e => setPhone(e.target.value)
              })
            )
          )
        ),

        h('div', { className: 'modal-footer' },
          h('button', {
            type: 'button',
            className: 'btn btn-outline',
            onClick: onClose
          }, 'Cancel'),
          h('button', {
            type: 'submit',
            className: 'btn btn-primary',
            disabled: submitting
          }, submitting ? 'Adding...' : 'Send Workspace Invite')
        )
      )
    )
  );
}

// ============================================================
// ASSIGN & MANAGE ROLES MODAL (ADMIN ONLY)
// ============================================================
function AssignRoleModal({ isOpen, onClose, teamMembers, onUpdateRole, onInviteMember }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('existing'); // 'existing' or 'new'
  const [selectedMemberId, setSelectedMemberId] = useState(() => teamMembers[0]?.id || '');
  const [selectedRole, setSelectedRole] = useState('operator');
  const [department, setDepartment] = useState('Shop Floor & Machining');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // When member changes, sync role & department
  useEffect(() => {
    if (mode === 'existing' && selectedMemberId) {
      const m = teamMembers.find(item => String(item.id) === String(selectedMemberId));
      if (m) {
        setSelectedRole(normalizeRole(m.role));
        if (m.department) setDepartment(m.department);
      }
    }
  }, [selectedMemberId, mode, teamMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (mode === 'existing') {
        if (!selectedMemberId) throw new Error('Please select a team member');
        await onUpdateRole(selectedMemberId, selectedRole, department);
      } else {
        if (!newName.trim()) throw new Error('Colleague full name is required');
        if (!newEmail.includes('@')) throw new Error('A valid email address is required');
        await onInviteMember({ name: newName, email: newEmail, role: selectedRole, department });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign role');
    } finally {
      setSaving(false);
    }
  };

  const roleCfg = ROLE_CONFIGS[selectedRole] || ROLE_CONFIGS.operator;

  return h('div', { className: 'modal-overlay', onClick: onClose },
    h('div', { className: 'modal-card', style: { maxWidth: 540 }, onClick: e => e.stopPropagation() },
      h('div', { className: 'modal-header' },
        h('div', null,
          h('h3', { style: { margin: 0, fontSize: 16 } }, '🛡️ Assign & Add Roles'),
          h('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 } },
            'Admin Governance: Assign operational roles and module permissions to coworkers'
          )
        ),
        h('button', { className: 'modal-close', onClick: onClose }, '✕')
      ),
      h('div', { style: { display: 'flex', gap: 6, padding: '12px 20px', borderBottom: '1px solid var(--border-light)' } },
        h('button', {
          type: 'button',
          className: `btn btn-sm ${mode === 'existing' ? 'btn-primary' : 'btn-outline'}`,
          onClick: () => setMode('existing')
        }, '👤 Assign to Existing Member'),
        h('button', {
          type: 'button',
          className: `btn btn-sm ${mode === 'new' ? 'btn-primary' : 'btn-outline'}`,
          onClick: () => setMode('new')
        }, '➕ Add & Assign New Member')
      ),
      h('form', { onSubmit: handleSubmit },
        h('div', { className: 'modal-body', style: { padding: '18px 20px' } },
          error && h('div', { className: 'alert alert-danger', style: { marginBottom: 14 } }, error),

          mode === 'existing' ? h('div', { className: 'form-group' },
            h('label', null, 'Select Team Member'),
            h('select', {
              className: 'form-input',
              value: selectedMemberId,
              onChange: e => setSelectedMemberId(e.target.value)
            },
              teamMembers.map(m =>
                h('option', { key: m.id, value: m.id }, `${m.name} (${m.role}) — ${m.email}`)
              )
            )
          ) : [
            h('div', { key: 'name', className: 'form-group' },
              h('label', null, 'Colleague Full Name'),
              h('input', {
                className: 'form-input',
                value: newName,
                placeholder: 'e.g. Ramesh Patel',
                required: true,
                onChange: e => setNewName(e.target.value)
              })
            ),
            h('div', { key: 'email', className: 'form-group' },
              h('label', null, 'Work Email Address'),
              h('input', {
                type: 'email',
                className: 'form-input',
                value: newEmail,
                placeholder: 'e.g. ramesh@rivertonworks.local',
                required: true,
                onChange: e => setNewEmail(e.target.value)
              })
            )
          ],

          h('div', { className: 'form-group' },
            h('label', null, 'Assigned Role & Access Level'),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 } },
              Object.values(ROLE_CONFIGS).map(rc => {
                const isSelected = selectedRole === rc.key;
                return h('div', {
                  key: rc.key,
                  style: {
                    border: `1.5px solid ${isSelected ? rc.color : 'var(--border-light)'}`,
                    borderRadius: 8,
                    padding: '9px 12px',
                    cursor: 'pointer',
                    background: isSelected ? `${rc.color}15` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease'
                  },
                  onClick: () => setSelectedRole(rc.key)
                },
                  h('span', { style: { fontSize: 18 } }, rc.icon),
                  h('div', { style: { flex: 1, minWidth: 0 } },
                    h('div', { style: { fontWeight: 700, fontSize: 12, color: 'var(--text-main)' } }, rc.name.split(' ')[0]),
                    h('div', { style: { fontSize: 10, color: 'var(--text-muted)' } }, rc.key)
                  ),
                  isSelected && h('span', { style: { color: rc.color, fontWeight: 800 } }, '✓')
                );
              })
            )
          ),

          // Role Permission Summary Card
          h('div', {
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: 10,
              fontSize: 11,
              marginTop: 10
            }
          },
            h('div', { style: { fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 } },
              `${roleCfg.icon} ${roleCfg.name} Permissions:`
            ),
            h('div', { style: { color: 'var(--text-muted)', lineHeight: 1.4 } }, roleCfg.summary),
            h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 } },
              roleCfg.canViewFinancials ? h('span', { className: 'badge badge-success' }, '✓ View Financials') : h('span', { className: 'badge' }, '✕ Financials Masked'),
              roleCfg.canEditInventory ? h('span', { className: 'badge badge-success' }, '✓ Stock Inventory') : null,
              roleCfg.canEditProduction ? h('span', { className: 'badge badge-success' }, '✓ Shop Floor Batches') : null,
              roleCfg.canDisbursePayroll ? h('span', { className: 'badge badge-success' }, '✓ Payroll Access') : null
            )
          ),

          h('div', { className: 'form-group', style: { marginTop: 14 } },
            h('label', null, 'Department / Machine Line'),
            h('select', {
              className: 'form-input',
              value: department,
              onChange: e => setDepartment(e.target.value)
            },
              ['Shop Floor & Machining', 'Warehouse & Logistics', 'Accounts & Tax Compliance', 'Quality Control & Metrology', 'Plant Operations & Admin'].map(d =>
                h('option', { key: d, value: d }, d)
              )
            )
          )
        ),
        h('div', { className: 'modal-footer' },
          h('button', { type: 'button', className: 'btn btn-outline', onClick: onClose }, 'Cancel'),
          h('button', { type: 'submit', className: 'btn btn-primary', disabled: saving },
            saving ? 'Saving...' : (mode === 'existing' ? 'Save Role Assignment' : 'Invite & Assign Role')
          )
        )
      )
    )
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('forgeledger_sidebar_collapsed') === 'true'; } catch (_) { return false; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('forgeledger_theme') === 'dark'; } catch (_) { return false; }
  });

  // Theme Switching Animation State
  const [themeSwitching, setThemeSwitching] = useState(false);

  // Simulated Role Switcher state (null means using current user's actual role)
  const [simulatedRole, setSimulatedRole] = useState(() => {
    try { return localStorage.getItem('forgeledger_simulated_role') || null; } catch (_) { return null; }
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);

  // Policy: Admin-Assigned Roles (true = locked to admin assignments; false = open simulation)
  const [adminOnlyRoles, setAdminOnlyRoles] = useState(() => {
    try {
      const stored = localStorage.getItem('forgeledger_admin_only_roles');
      return stored !== null ? stored === 'true' : true;
    } catch (_) { return true; }
  });

  // Label Studio & Scanner Modals state
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelModalItem, setLabelModalItem] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Team & RBAC state
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Settings Sub-Tabs: 'profile' (Personal Details), 'company' (Workspace Details), 'customization' (UI & Operational Preferences)
  const [settingsTab, setSettingsTab] = useState('profile');

  // Workspace Customizations State (Stored in localStorage and synced to user profile preferences)
  const [customizations, setCustomizations] = useState(() => {
    const defaults = {
      accentColor: 'blue',
      density: 'comfortable',
      currency: '₹',
      tableStriped: false,
      toastDuration: 3800,
      defaultGst: 18,
      defaultDueDays: 7,
      lowStockThreshold: 5,
      invoicePrefix: 'INV-'
    };
    try {
      const saved = localStorage.getItem('forgeledger_customizations');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (_) {}
    return defaults;
  });

  // Personal Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Plant Manager',
    department: 'Operations',
    bio: '',
    emergency_contact: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCustomizations, setSavingCustomizations] = useState(false);

  // Security & Password Form State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [avatarIcon, setAvatarIcon] = useState('');
  const [avatarGradient, setAvatarGradient] = useState('linear-gradient(135deg, #2563eb, #4f46e5)');

  // Animated Theme Switcher (Smooth 0.42s transition curve across the workspace)
  const toggleDarkMode = useCallback(() => {
    setThemeSwitching(true);
    document.body.classList.add('theme-switching');
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('forgeledger_theme', next ? 'dark' : 'light'); } catch (_) {}
      return next;
    });
    setTimeout(() => {
      setThemeSwitching(false);
      document.body.classList.remove('theme-switching');
    }, 450);
  }, []);

  // Dynamic Customizations Application Effect
  useEffect(() => {
    const accent = ACCENT_COLORS[customizations.accentColor] || ACCENT_COLORS.blue;
    document.documentElement.style.setProperty('--primary', accent.primary);
    document.documentElement.style.setProperty('--primary-hover', accent.hover);
    document.documentElement.style.setProperty('--primary-light', accent.light);

    if (customizations.density === 'compact') {
      document.body.classList.add('density-compact');
    } else {
      document.body.classList.remove('density-compact');
    }

    if (customizations.tableStriped) {
      document.body.classList.add('table-striped');
    } else {
      document.body.classList.remove('table-striped');
    }

    window.__forgeledgerCurrency = customizations.currency;
  }, [customizations]);

  // Synchronize Personal Profile & Preferences when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        role: currentUser.role || 'Plant Manager',
        department: currentUser.department || 'Operations',
        bio: currentUser.bio || '',
        emergency_contact: currentUser.emergency_contact || ''
      });
      if (currentUser.preferences && typeof currentUser.preferences === 'object') {
        setCustomizations(prev => ({ ...prev, ...currentUser.preferences }));
      }
      if (currentUser.picture) {
        if (currentUser.picture.startsWith('gradient:')) {
          setAvatarGradient(currentUser.picture.replace('gradient:', ''));
        } else if (currentUser.picture.startsWith('icon:')) {
          const parts = currentUser.picture.split('|');
          setAvatarIcon(parts[0].replace('icon:', ''));
          if (parts[1]) setAvatarGradient(parts[1]);
        }
      }
    }
  }, [currentUser]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('forgeledger_sidebar_collapsed', String(next)); } catch (_) {}
      return next;
    });
  }, []);

  // Modern In-App Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, customizations.toastDuration || 3800);
  }, [customizations.toastDuration]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    window.__showToast = addToast;
    return () => {
      delete window.__showToast;
    };
  }, [addToast]);

  // Online / Offline Network Status Detection
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); addToast('Connection restored. Operating online.', 'info'); };
    const handleOffline = () => { setIsOnline(false); addToast('Connection lost. Operating in offline mode.', 'warning'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Global Keyboard Shortcuts (Ctrl+K, ?, Alt+D, Alt+1..8, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowShortcutsModal(false);
        setModalType(null);
        setShowCompanyModal(false);
        setMobileMenuOpen(false);
        setFabOpen(false);
        setShowRoleDropdown(false);
        setShowScannerModal(false);
        setShowLabelModal(false);
        setShowAssignRoleModal(false);
        return;
      }

      if (isInput) return;

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const tabList = ['overview', 'rawMaterials', 'production', 'inventory', 'sales', 'expenses', 'payroll', 'reports'];
        const targetTab = tabList[parseInt(e.key, 10) - 1];
        if (targetTab) {
          setActiveTab(targetTab);
          setMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDarkMode]);

  // Click-outside listener to automatically close role selector dropdown
  useEffect(() => {
    if (!showRoleDropdown) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.role-selector-dropdown-wrap')) {
        setShowRoleDropdown(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showRoleDropdown]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);



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
  const [salesFilter, setSalesFilter] = useState('all'); // 'all', 'paid', 'pending', 'overdue'
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all'); // 'all', 'utilities', 'materials', 'maintenance', 'general'
  const [productionStatusFilter, setProductionStatusFilter] = useState('all'); // 'all', 'in_progress', 'planned', 'completed'
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Preset Date Range Filter States (This Month, Last 30 Days, This Quarter, Custom)
  const [salesDateFilter, setSalesDateFilter] = useState('all');
  const [salesCustomStart, setSalesCustomStart] = useState('');
  const [salesCustomEnd, setSalesCustomEnd] = useState('');

  const [expenseDateFilter, setExpenseDateFilter] = useState('all');
  const [expenseCustomStart, setExpenseCustomStart] = useState('');
  const [expenseCustomEnd, setExpenseCustomEnd] = useState('');

  const [prodDateFilter, setProdDateFilter] = useState('all');
  const [prodCustomStart, setProdCustomStart] = useState('');
  const [prodCustomEnd, setProdCustomEnd] = useState('');

  // Public Landing Showcase Toggle (Controls modal visibility)
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Modal States
  const [modalType, setModalType] = useState(null); // 'item', 'sale', 'expense', 'employee', 'production'
  const [formData, setFormData] = useState({});

  // AI Feature States (Predictive Demand Forecasting, Smart Invoice OCR, Natural Language Business Analyst)
  const [showForecastView, setShowForecastView] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [showAiAnalyst, setShowAiAnalyst] = useState(false);
  const [aiAnalystInitialQuery, setAiAnalystInitialQuery] = useState('');

  // Inline Raw Material Form State (Fig. 7)
  const [rawMaterialForm, setRawMaterialForm] = useState({ name: '', unit: 'kg', quantity: 0, unit_cost: 0 });

  // Auth Form State
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: 'demo@forgeledger.local', password: 'password123', companyName: 'Riverton Works' });
  const [authError, setAuthError] = useState('');

  // Clean Separation of Finished Goods and Raw Materials (Option A)
  const finishedGoods = useMemo(() => {
    return (inventory || []).filter(i => !(i.category || '').toLowerCase().includes('raw'));
  }, [inventory]);

  const rawMaterialsList = useMemo(() => {
    return (inventory || []).filter(i => (i.category || '').toLowerCase().includes('raw'));
  }, [inventory]);

  const finishedGoodsVal = useMemo(() => {
    return finishedGoods.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_cost) || 0), 0);
  }, [finishedGoods]);

  const finishedGoodsUnits = useMemo(() => {
    return finishedGoods.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }, [finishedGoods]);

  const rawMaterialsVal = useMemo(() => {
    const list = (rawMaterials && rawMaterials.length > 0) ? rawMaterials : rawMaterialsList;
    return list.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_cost) || 0), 0);
  }, [rawMaterials, rawMaterialsList]);

  // Production batch status breakdown for clear dashboard display
  const inProgressRuns = useMemo(() => (productionRuns || []).filter(r => r.status === 'In progress'), [productionRuns]);
  const plannedRuns = useMemo(() => (productionRuns || []).filter(r => r.status === 'Planned'), [productionRuns]);
  const completedRuns = useMemo(() => (productionRuns || []).filter(r => r.status === 'Completed'), [productionRuns]);
  const activeRuns = useMemo(() => (productionRuns || []).filter(r => r.status === 'In progress' || r.status === 'Planned'), [productionRuns]);
  const inProgressUnits = useMemo(() => inProgressRuns.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0), [inProgressRuns]);
  const completedUnits = useMemo(() => completedRuns.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0), [completedRuns]);
  const lowStockMaterials = useMemo(() => (rawMaterials || []).filter(m => Number(m.quantity) <= (Number(m.reorder_level) || 15)), [rawMaterials]);

  // Filtered Finished Goods (Exclusively sellable completed products)
  const filteredInventory = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return finishedGoods.filter(item => {
      if (!item) return false;
      const qty = Number(item.quantity) || 0;
      const reorder = Number(item.reorder_level) || 5;
      if (inventoryCategoryFilter === 'in_stock' && qty <= reorder) return false;
      if (inventoryCategoryFilter === 'low_stock' && qty > reorder) return false;
      if (!q) return true;
      const name = (item.item_name || '').toLowerCase();
      const sku = (item.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [finishedGoods, searchQuery, inventoryCategoryFilter]);

  // Filtered Sales (Supports Status Filter Pills, Date Range Presets & Search)
  const filteredSales = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (sales || []).filter(s => {
      if (!s) return false;
      if (salesFilter === 'paid' && s.status !== 'Paid') return false;
      if (salesFilter === 'pending' && s.status !== 'Pending') return false;
      if (salesFilter === 'overdue' && s.status !== 'Overdue') return false;
      if (!matchesDateFilter(s.issued_date || s.created_at, salesDateFilter, salesCustomStart, salesCustomEnd)) return false;
      if (!q) return true;
      const customer = (s.customer || '').toLowerCase();
      const invoice = (s.invoice_no || '').toLowerCase();
      return customer.includes(q) || invoice.includes(q);
    });
  }, [sales, searchQuery, salesFilter, salesDateFilter, salesCustomStart, salesCustomEnd]);

  // Filtered Expenses (Supports Category Filter Pills, Date Range Presets & Search)
  const filteredExpenses = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (expenses || []).filter(e => {
      if (!e) return false;
      if (expenseCategoryFilter !== 'all' && (e.category || '').toLowerCase() !== expenseCategoryFilter.toLowerCase()) return false;
      if (!matchesDateFilter(e.expense_date || e.created_at, expenseDateFilter, expenseCustomStart, expenseCustomEnd)) return false;
      if (!q) return true;
      const desc = (e.description || '').toLowerCase();
      const cat = (e.category || '').toLowerCase();
      return desc.includes(q) || cat.includes(q);
    });
  }, [expenses, searchQuery, expenseCategoryFilter, expenseDateFilter, expenseCustomStart, expenseCustomEnd]);

  // Filtered Production Runs (Supports Status Filter Pills, Date Range Presets & Search)
  const filteredProductionRuns = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (productionRuns || []).filter(r => {
      if (!r) return false;
      if (productionStatusFilter === 'in_progress' && r.status !== 'In progress') return false;
      if (productionStatusFilter === 'planned' && r.status !== 'Planned') return false;
      if (productionStatusFilter === 'completed' && r.status !== 'Completed') return false;
      if (!matchesDateFilter(r.run_date || r.created_at, prodDateFilter, prodCustomStart, prodCustomEnd)) return false;
      if (!q) return true;
      const prod = (r.product || '').toLowerCase();
      const date = (r.run_date || '').toLowerCase();
      return prod.includes(q) || date.includes(q);
    });
  }, [productionRuns, searchQuery, productionStatusFilter, prodDateFilter, prodCustomStart, prodCustomEnd]);

  // Filtered Employees (Supports Active/Inactive Filter Pills & Search)
  const filteredEmployees = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (employees || []).filter(emp => {
      if (!emp) return false;
      if (payrollStatusFilter === 'active' && emp.status !== 'Active') return false;
      if (payrollStatusFilter === 'inactive' && emp.status !== 'Inactive') return false;
      if (!q) return true;
      const name = (emp.name || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [employees, searchQuery, payrollStatusFilter]);

  const distinctExpenseCategories = useMemo(() => {
    return new Set((expenses || []).map(e => e?.category || 'General')).size;
  }, [expenses]);

  // Universal Table Sorting (Field + Asc/Desc)
  const toggleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField]);

  const renderSortTh = useCallback((field, label, align = 'left') => {
    const isSorted = sortField === field;
    const arrow = isSorted ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕';
    return h('th', {
      style: {
        textAlign: align,
        cursor: 'pointer',
        userSelect: 'none',
        color: isSorted ? 'var(--primary)' : undefined,
        fontWeight: isSorted ? 700 : undefined
      },
      onClick: () => toggleSort(field),
      title: `Sort by ${label}`
    },
      label,
      h('span', {
        style: {
          fontSize: 10,
          opacity: isSorted ? 1 : 0.35,
          marginLeft: 4,
          display: 'inline-block'
        }
      }, arrow)
    );
  }, [sortField, sortOrder, toggleSort]);

  // Filtered Raw Materials
  const filteredRawMaterials = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (rawMaterials || []).filter(m => {
      if (!m) return false;
      if (!q) return true;
      const name = (m.name || '').toLowerCase();
      const unit = (m.unit || '').toLowerCase();
      return name.includes(q) || unit.includes(q);
    });
  }, [rawMaterials, searchQuery]);

  // Sorted Lists for Interactive Column Header Sorting
  const sortedInventory = useMemo(() => {
    if (!sortField) return filteredInventory;
    return [...filteredInventory].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' || !isNaN(Number(valA))) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInventory, sortField, sortOrder]);

  const sortedRawMaterials = useMemo(() => {
    if (!sortField) return filteredRawMaterials;
    return [...filteredRawMaterials].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' || !isNaN(Number(valA))) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRawMaterials, sortField, sortOrder]);

  const sortedSales = useMemo(() => {
    if (!sortField) return filteredSales;
    return [...filteredSales].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' || !isNaN(Number(valA))) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSales, sortField, sortOrder]);

  const sortedExpenses = useMemo(() => {
    if (!sortField) return filteredExpenses;
    return [...filteredExpenses].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' || !isNaN(Number(valA))) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredExpenses, sortField, sortOrder]);

  const sortedProductionRuns = useMemo(() => {
    if (!sortField) return filteredProductionRuns;
    return [...filteredProductionRuns].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' || !isNaN(Number(valA))) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProductionRuns, sortField, sortOrder]);

  const sortedEmployees = useMemo(() => {
    if (!sortField) return filteredEmployees;
    return [...filteredEmployees].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' || !isNaN(Number(valA))) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortOrder]);



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

  // Role Computation and Switching
  const isActualAdmin = !currentUser ||
    ['owner', 'admin', 'plant manager', 'manager'].some(r => String(currentUser.role || '').toLowerCase().includes(r));
  const canChangeRole = !adminOnlyRoles || isActualAdmin;

  const effectiveRole = (canChangeRole ? simulatedRole : null) || (currentUser?.role ? normalizeRole(currentUser.role) : 'owner');
  const roleConfig = ROLE_CONFIGS[effectiveRole] || ROLE_CONFIGS.owner;

  const handleToggleAdminOnlyRoles = (val) => {
    setAdminOnlyRoles(val);
    try {
      localStorage.setItem('forgeledger_admin_only_roles', String(val));
    } catch (_) {}
    addToast(val ? '🛡️ Policy active: Only Admins can assign roles' : '🔓 Policy updated: Open simulation mode enabled', 'info');
  };

  const handleSwitchSimulatedRole = (r) => {
    if (!canChangeRole) {
      addToast('Role changes are locked by your Workspace Admin.', 'warning');
      return;
    }
    const target = (r === 'owner' || !r) ? null : r;
    setSimulatedRole(target);
    try {
      if (target) localStorage.setItem('forgeledger_simulated_role', target);
      else localStorage.removeItem('forgeledger_simulated_role');
    } catch (_) {}
    const cfg = ROLE_CONFIGS[target || 'owner'] || ROLE_CONFIGS.owner;
    addToast(`Role view switched to ${cfg.icon} ${cfg.name}`, 'info');
    if (cfg.allowedTabs && !cfg.allowedTabs.includes(activeTab)) {
      setActiveTab(cfg.allowedTabs[0]);
    }
  };

  const loadTeamMembers = useCallback(async () => {
    setTeamLoading(true);
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success && data.data) {
        setTeamMembers(data.data);
      }
    } catch (err) {
      console.warn('Failed to load team:', err.message);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((activeTab === 'settings' && settingsTab === 'team') || showAssignRoleModal) {
      loadTeamMembers();
    }
  }, [activeTab, settingsTab, showAssignRoleModal, loadTeamMembers]);

  const handleUpdateStockFromScanner = async (itemId, newQuantity, isRaw) => {
    const res = await fetch(`/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Update failed');
    await loadAllData();
    return json.data;
  };

  const handleInviteTeamMember = async (memberData) => {
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Invite failed');
    addToast(json.message || 'Colleague invited successfully', 'success');
    await loadTeamMembers();
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    const res = await fetch(`/api/team/${memberId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    const json = await res.json();
    if (!json.success) {
      addToast(json.error || 'Failed to update role', 'danger');
      return;
    }
    addToast(json.message || 'Role updated', 'success');
    await loadTeamMembers();
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this colleague from the workspace roster?')) return;
    const res = await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) {
      addToast(json.error || 'Failed to remove member', 'danger');
      return;
    }
    addToast('Colleague removed from roster', 'info');
    await loadTeamMembers();
  };

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

  // Modal Submissions & Actions with Toast Feedback
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
          addToast('Inventory item saved successfully!', 'success');
        } else {
          addToast(res.error || 'Failed to save inventory item', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error saving item', 'error'));
  }

  function handleCreateSale(e) {
    e.preventDefault();
    const endpoint = formData.id ? `/api/sales/${formData.id}` : '/api/sales';
    const method = formData.id ? 'PUT' : 'POST';
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
          addToast(formData.id ? 'Sales invoice updated!' : 'Sales invoice created successfully!', 'success');
        } else {
          addToast(res.error || 'Failed to save sales invoice', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error saving invoice', 'error'));
  }

  function handleCreateExpense(e) {
    e.preventDefault();
    const endpoint = formData.id ? `/api/expenses/${formData.id}` : '/api/expenses';
    const method = formData.id ? 'PUT' : 'POST';
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
          addToast(formData.id ? 'Expense updated successfully!' : 'Expense recorded successfully!', 'success');
        } else {
          addToast(res.error || 'Failed to save expense', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error saving expense', 'error'));
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
          addToast('Production batch logged successfully!', 'success');
        } else {
          addToast(res.error || 'Failed to log production batch', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error logging batch', 'error'));
  }

  function handleCreateEmployee(e) {
    e.preventDefault();
    const endpoint = formData.id ? `/api/employees/${formData.id}` : '/api/employees';
    const method = formData.id ? 'PUT' : 'POST';
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setModalType(null);
          setFormData({});
          loadAllData();
          addToast(formData.id ? 'Employee profile updated!' : 'Employee profile added successfully!', 'success');
        } else {
          addToast(res.error || 'Failed to save employee profile', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error saving employee', 'error'));
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
          addToast('Raw material batch added to inventory!', 'success');
        } else {
          addToast(res.error || 'Failed to add raw material', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error adding raw material', 'error'));
  }

  function handleDelete(type, id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    fetch(`/api/${type}/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          loadAllData();
          addToast('Record deleted successfully.', 'info');
        } else {
          addToast(res.error || 'Failed to delete record', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error deleting record', 'error'));
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
          addToast('Company settings updated successfully!', 'success');
          loadAllData();
        } else {
          addToast(res.error || 'Failed to update settings', 'error');
        }
      })
      .catch(err => addToast(err.message || 'Network error updating settings', 'error'));
  }

  function handleSaveProfile(e) {
    if (e && e.preventDefault) e.preventDefault();
    setSavingProfile(true);
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm)
    })
      .then(r => r.json())
      .then(res => {
        setSavingProfile(false);
        if (res.success && res.user) {
          setCurrentUser(prev => ({ ...prev, ...res.user }));
          addToast('Personal profile details updated successfully!', 'success');
        } else {
          addToast(res.error || 'Failed to update personal profile', 'error');
        }
      })
      .catch(err => {
        setSavingProfile(false);
        addToast(err.message || 'Network error updating profile', 'error');
      });
  }

  function handleSaveCustomizations(updated = {}) {
    const next = { ...customizations, ...updated };
    setCustomizations(next);
    try {
      localStorage.setItem('forgeledger_customizations', JSON.stringify(next));
    } catch (_) {}

    setSavingCustomizations(true);
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: next })
    })
      .then(r => r.json())
      .then(res => {
        setSavingCustomizations(false);
        if (res.success && res.user) {
          setCurrentUser(prev => ({ ...prev, ...res.user }));
          addToast('Customization preferences saved!', 'success');
        }
      })
      .catch(() => {
        setSavingCustomizations(false);
        addToast('Preferences saved locally in browser.', 'info');
      });
  }

  function handleSelectAvatar(newIcon, newGradient) {
    const icon = newIcon !== undefined ? newIcon : avatarIcon;
    const grad = newGradient !== undefined ? newGradient : avatarGradient;
    setAvatarIcon(icon);
    setAvatarGradient(grad);
    const picStr = `icon:${icon}|${grad}`;
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ picture: picStr })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.user) {
          setCurrentUser(prev => ({ ...prev, ...res.user }));
          addToast('Avatar style updated!', 'success');
        }
      })
      .catch(() => {});
  }

  function getPasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: 'Enter a strong password', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak (min 6 characters required)', color: '#ef4444' };
    if (score <= 3) return { score: 60, label: 'Fair (add numbers & symbols for higher security)', color: '#f59e0b' };
    if (score === 4) return { score: 85, label: 'Good (strong protection)', color: '#10b981' };
    return { score: 100, label: 'Excellent (enterprise grade protection)', color: '#059669' };
  }

  function handleChangePassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!passwordForm.currentPassword) {
      addToast('Please enter your current password.', 'warning');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }

    setChangingPassword(true);
    fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordForm)
    })
      .then(r => r.json())
      .then(res => {
        setChangingPassword(false);
        if (res.success) {
          addToast('Password updated successfully! Keep your credentials secure.', 'success');
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          addToast(res.error || 'Failed to update password', 'error');
        }
      })
      .catch(err => {
        setChangingPassword(false);
        addToast(err.message || 'Error updating password', 'error');
      });
  }

  function handleExportBackup() {
    setExportingBackup(true);
    addToast('Generating full workspace backup archive...', 'info');
    fetch('/api/auth/export-backup')
      .then(r => {
        if (!r.ok) throw new Error('Backup failed');
        return r.blob();
      })
      .then(blob => {
        setExportingBackup(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const compSlug = (currentUser?.company?.name || 'workspace').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `forgeledger-backup-${compSlug}-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        addToast('Full workspace backup archive downloaded successfully!', 'success');
      })
      .catch(err => {
        setExportingBackup(false);
        addToast(err.message || 'Failed to export backup', 'error');
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
          addToast('Switched company workspace successfully!', 'success');
        } else {
          setCompanyError(res.error || 'Failed to switch company');
          addToast(res.error || 'Failed to switch company', 'error');
        }
      })
      .catch(err => {
        setCompanyActionLoading(false);
        setCompanyError(err.message);
        addToast(err.message, 'error');
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
          addToast('New company registered successfully!', 'success');
        } else {
          setCompanyError(res.error || 'Failed to create company');
          addToast(res.error || 'Failed to create company', 'error');
        }
      })
      .catch(err => {
        setCompanyActionLoading(false);
        setCompanyError(err.message);
        addToast(err.message, 'error');
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

  // Unauthenticated screen: Public landing showcase + Auth modal
  if (!currentUser) {
    return h('div', { style: { position: 'relative' } },
      h(PublicLandingPage, {
        onLogin: () => { setAuthMode('login'); setShowAuthModal(true); },
        onSignup: () => { setAuthMode('signup'); setShowAuthModal(true); }
      }),
      showAuthModal && h('div', {
        className: 'modal-overlay',
        style: { background: 'rgba(11, 19, 41, 0.85)', backdropFilter: 'blur(6px)', zIndex: 1000 },
        onClick: (e) => { if (e.target === e.currentTarget) setShowAuthModal(false); }
      },
        h('div', { className: 'modal-card', style: { maxWidth: 410, position: 'relative' } },
          h('button', {
            className: 'modal-close',
            style: { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b' },
            onClick: () => setShowAuthModal(false)
          }, '✕'),
          h('div', { style: { padding: '28px 24px 18px', textAlign: 'center' } },
            h('img', { src: '/logo.png', alt: 'ForgeLedger Logo', style: { width: 54, height: 54, borderRadius: 12, margin: '0 auto 14px', display: 'block', boxShadow: '0 4px 16px rgba(37,99,235,0.35)', objectFit: 'contain' } }),
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
      ),
      h(ToastContainer, { toasts, onDismiss: removeToast })
    );
  }

  return h('div', { className: `app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}` },
    // Mobile Drawer Backdrop
    mobileMenuOpen && h('div', {
      className: 'mobile-sidebar-backdrop',
      onClick: () => setMobileMenuOpen(false)
    }),

    // SIDEBAR
    h('aside', { className: `sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}` },
      // Sidebar Header (Merged collapse toggle directly inside sidebar)
      h('div', { className: 'sidebar-header' },
        !sidebarCollapsed && h('div', { className: 'sidebar-title' }, 'NAVIGATION'),
        h('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
          h('button', {
            className: 'sidebar-toggle-btn',
            onClick: toggleSidebar,
            title: sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
            'aria-label': sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          },
            h(Icon, { name: sidebarCollapsed ? 'chevronRight' : 'chevronLeft', size: 14 })
          ),
          h('button', {
            className: 'mobile-sidebar-close-btn',
            onClick: () => setMobileMenuOpen(false),
            'aria-label': 'Close menu'
          },
            h(Icon, { name: 'x', size: 14 })
          )
        )
      ),

      // Navigation Items (Filtered dynamically by Role-Based Access Control)
      h('nav', { className: 'sidebar-nav' },
        !sidebarCollapsed && h('div', {
          className: 'nav-section-title',
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 6 }
        },
          h('span', null, effectiveRole === 'owner' ? 'ENTERPRISE ERP' : `${(roleConfig.tag || effectiveRole).toUpperCase()} WORKSPACE`),
          effectiveRole !== 'owner' && h('span', {
            className: `role-badge ${roleConfig.badgeClass}`,
            style: { fontSize: 9.5, padding: '1px 5px', fontWeight: 800 }
          }, `${roleConfig.icon} Active`)
        ),
        [
          { id: 'overview', label: 'Overview', icon: 'overview' },
          { id: 'rawMaterials', label: 'Raw materials', icon: 'rawMaterials' },
          { id: 'production', label: 'Production', icon: 'production' },
          { id: 'inventory', label: 'Finished goods', icon: 'inventory' },
          { id: 'sales', label: 'Sales & invoices', icon: 'sales' },
          { id: 'expenses', label: 'Expenses', icon: 'expenses' },
          { id: 'payroll', label: 'Payroll', icon: 'payroll' },
          { id: 'reports', label: 'Reports', icon: 'reports' }
        ]
        .filter(item => !roleConfig.allowedTabs || roleConfig.allowedTabs.includes(item.id))
        .map(item =>
          h('a', {
            key: item.id,
            className: `nav-item ${activeTab === item.id ? 'active' : ''}`,
            title: item.label,
            onClick: () => { setActiveTab(item.id); setSearchQuery(''); setMobileMenuOpen(false); }
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
          h('div', {
            className: 'user-avatar',
            style: { background: avatarGradient }
          }, avatarIcon || (currentUser?.name?.charAt(0) || 'D')),
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
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          // Mobile Hamburger Button
          h('button', {
            className: 'mobile-menu-toggle-btn',
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            'aria-label': mobileMenuOpen ? 'Close menu' : 'Open menu'
          },
            h(Icon, { name: mobileMenuOpen ? 'x' : 'menu', size: 18 })
          ),
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
              activeTab === 'inventory' ? 'Finished goods' :
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
          // Header Tools Group: Scan Barcode & Label Studio
          h('div', { className: 'header-tools-group' },
            h('button', {
              className: 'header-tool-btn',
              onClick: () => setShowScannerModal(true),
              title: 'Scan Barcodes & QR Codes with Camera / Mobile'
            },
              h('span', null, '📷'),
              h('span', { className: 'tool-btn-text' }, 'Scan')
            ),
            h('button', {
              className: 'header-tool-btn',
              onClick: () => { setLabelModalItem(null); setShowLabelModal(true); },
              title: 'Design & Print Barcode & QR Labels (Thermal & A4)'
            },
              h('span', null, '🏷️'),
              h('span', { className: 'tool-btn-text' }, 'Labels')
            )
          ),

          // Role Switcher / Simulator Dropdown Pill or Locked Staff Badge
          canChangeRole ?
            h('div', { className: 'role-selector-dropdown-wrap' },
              h('button', {
                type: 'button',
                className: `role-selector-trigger ${simulatedRole ? 'is-simulated' : ''}`,
                onClick: (e) => { e.stopPropagation(); setShowRoleDropdown(prev => !prev); },
                title: 'Admin Governance: Simulate Views & Assign Member Roles'
              },
                h('span', { style: { fontSize: 13 } }, roleConfig.icon),
                h('span', { className: 'role-trigger-label' }, effectiveRole === 'owner' ? 'Owner' : effectiveRole === 'operator' ? 'Operator' : effectiveRole === 'clerk' ? 'Clerk' : 'Accountant'),
                simulatedRole && h('span', { className: 'role-sim-tag' }, 'SIM'),
                h('span', { style: { fontSize: 9, opacity: 0.7, marginLeft: 2 } }, '▼')
              ),
              showRoleDropdown && h('div', {
                className: 'role-dropdown-menu',
                onClick: e => e.stopPropagation()
              },
                // Current User Identity Card
                h('div', { className: 'role-dropdown-user-card' },
                  h('div', { className: 'role-dropdown-avatar' }, (currentUser?.name || 'D').charAt(0).toUpperCase()),
                  h('div', { style: { flex: 1, minWidth: 0 } },
                    h('div', { className: 'role-dropdown-user-name' }, currentUser?.name || 'Demo User'),
                    h('div', { className: 'role-dropdown-user-email' }, currentUser?.email || 'demo@rivertonworks.local')
                  ),
                  h('span', { className: `role-badge ${ROLE_CONFIGS[normalizeRole(currentUser?.role)].badgeClass}`, style: { fontSize: 10, fontWeight: 700 } },
                    `${ROLE_CONFIGS[normalizeRole(currentUser?.role)].icon} ${ROLE_CONFIGS[normalizeRole(currentUser?.role)].name.split(' ')[0]}`
                  )
                ),

                // Perspective Switcher Section
                h('div', { className: 'role-dropdown-section-header' },
                  h('span', null, 'WORKSPACE PERSPECTIVE'),
                  simulatedRole && h('button', {
                    type: 'button',
                    className: 'role-reset-link',
                    onClick: () => handleSwitchSimulatedRole(null)
                  }, '👑 Reset View')
                ),
                h('div', { className: 'role-dropdown-section-desc' },
                  'Switch roles to experience tailored navigation, permissions, and financial masking:'
                ),

                // Rich Role Cards
                h('div', { className: 'role-cards-list' },
                  Object.values(ROLE_CONFIGS).map(r => {
                    const isActive = effectiveRole === r.key;
                    return h('div', {
                      key: r.key,
                      className: `role-dropdown-card ${isActive ? 'active' : ''}`,
                      onClick: () => {
                        handleSwitchSimulatedRole(r.key === 'owner' ? null : r.key);
                        setShowRoleDropdown(false);
                      }
                    },
                      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 } },
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } },
                          h('span', { style: { fontSize: 17 } }, r.icon),
                          h('strong', { style: { fontSize: 12.5, color: 'var(--text-main)' } }, r.name)
                        ),
                        isActive ?
                          h('span', { className: 'role-card-active-tag' }, '✓ Active') :
                          h('span', { className: 'role-card-tag' }, r.tag || r.key.toUpperCase())
                      ),
                      h('div', { style: { fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35, marginBottom: 6 } }, r.summary),
                      h('div', { className: 'role-card-chips' },
                        r.chips ? r.chips.map(chip => h('span', { key: chip, className: 'role-mini-chip' }, chip)) : null
                      )
                    );
                  })
                ),

                // Admin Role Management Controls
                h('div', { className: 'role-dropdown-admin-section' },
                  h('div', { className: 'role-dropdown-section-header', style: { marginTop: 4 } },
                    h('span', null, 'ROLE GOVERNANCE'),
                    h('span', { className: `badge ${adminOnlyRoles ? 'badge-success' : 'badge-warning'}`, style: { fontSize: 9.5 } },
                      adminOnlyRoles ? 'Enforced' : 'Open'
                    )
                  ),
                  h('div', {
                    className: 'role-policy-toggle-row',
                    onClick: () => handleToggleAdminOnlyRoles(!adminOnlyRoles),
                    title: 'Toggle whether only Admins can assign roles or allow open simulation'
                  },
                    h('div', { style: { flex: 1 } },
                      h('div', { style: { fontSize: 11.5, fontWeight: 700, color: 'var(--text-main)' } }, '🛡️ Enforce Admin-Only Roles'),
                      h('div', { style: { fontSize: 10, color: 'var(--text-muted)' } },
                        adminOnlyRoles ? 'Employees cannot switch roles' : 'Open simulation active for all'
                      )
                    ),
                    h('span', { style: { fontSize: 12, fontWeight: 800, color: adminOnlyRoles ? '#10b981' : '#f59e0b' } },
                      adminOnlyRoles ? '🔒' : '🔓'
                    )
                  ),
                  h('button', {
                    type: 'button',
                    className: 'role-dropdown-action-btn',
                    onClick: () => { setShowRoleDropdown(false); setShowAssignRoleModal(true); }
                  }, '➕ Assign / Add Member Role'),
                  h('button', {
                    type: 'button',
                    className: 'role-dropdown-action-btn secondary',
                    onClick: () => { setShowRoleDropdown(false); setActiveTab('settings'); setSettingsTab('team'); }
                  }, '👥 Team Roster & Roles →')
                )
              )
            ) :
            // Locked Role Badge for Staff Members
            h('div', {
              className: 'role-selector-locked-badge',
              title: `Assigned Role: ${roleConfig.name} · Role assigned by Workspace Admin. Contact your admin to request permission changes.`
            },
              h('span', { style: { fontSize: 13 } }, roleConfig.icon),
              h('span', { className: 'role-trigger-label' }, effectiveRole === 'owner' ? 'Owner' : effectiveRole === 'operator' ? 'Operator' : effectiveRole === 'clerk' ? 'Clerk' : 'Accountant'),
              h('span', { style: { fontSize: 10, opacity: 0.75, marginLeft: 2 } }, '🔒')
            ),

          // Universal Search & Command Palette Trigger Button (Ctrl+K)
          h('button', {
            className: 'header-search-palette-btn',
            onClick: () => setShowCommandPalette(true),
            title: 'Global Search & Command Palette (Ctrl+K)',
            'aria-label': 'Search or run command'
          },
            h(Icon, { name: 'search', size: 14 }),
            h('span', { className: 'palette-btn-text' }, 'Search & Actions...'),
            h('kbd', { className: 'palette-kbd-hint' }, 'Ctrl K')
          ),

          // Online / Realtime Status Indicator (Click to reload)
          h('div', {
            className: 'status-indicator',
            title: isOnline ? 'System online · Realtime connected (Click to sync)' : 'Operating offline',
            style: { cursor: 'pointer' },
            onClick: () => { loadAllData(); addToast('Refreshed factory data', 'info'); }
          },
            h('div', { className: `status-dot ${isOnline ? '' : 'offline'}` }),
            h('span', null, isOnline ? 'Online' : 'Offline')
          ),

          // Keyboard Shortcuts Dialog Button (PC)
          h('button', {
            className: 'theme-toggle-btn header-shortcuts-btn',
            onClick: () => setShowShortcutsModal(true),
            title: 'Keyboard Shortcuts (?)',
            'aria-label': 'Keyboard shortcuts'
          },
            h(Icon, { name: 'helpCircle', size: 15 })
          ),

          // Theme Toggle
          h('button', {
            className: `theme-toggle-btn ${themeSwitching ? 'switching' : ''}`,
            onClick: toggleDarkMode,
            title: darkMode ? 'Switch to light mode' : 'Switch to dark mode',
            'aria-label': darkMode ? 'Switch to light mode' : 'Switch to dark mode'
          },
            h(Icon, { name: darkMode ? 'sun' : 'moon', size: 16 })
          ),

          // Sign Out Button
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

      // Active Role Simulation Notice Banner (Only for Admins)
      simulatedRole && isActualAdmin && h('div', { className: 'role-sim-banner' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('span', null, '👁️'),
          h('span', null,
            h('strong', null, `Role Simulation Active: ${roleConfig.name} (${roleConfig.icon})`),
            ' — Financial balances and restricted controls are adapted for this staff level.'
          )
        ),
        h('button', {
          className: 'reset-btn',
          onClick: () => handleSwitchSimulatedRole(null)
        }, '👑 Reset to Owner View')
      ),

      // Content Body
      h('main', { className: 'content-body' },
        h('div', { className: 'tab-pane-animate', key: activeTab },

        // ================= TAB: OVERVIEW (Fig. 8) =================
        activeTab === 'overview' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'YOUR BUSINESS AT A GLANCE'),
              h('h1', { className: 'page-title' }, 'Business overview'),
              h('p', { className: 'page-desc' }, "Here's what's happening in your workspace.")
            ),
            // Header Action: Contextual by role
            h('div', { className: 'header-actions' },
              roleConfig.canViewFinancials ?
                h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('sale'); } },
                  h(Icon, { name: 'plus' }), 'New sale'
                ) :
                h('button', { className: 'btn btn-primary', onClick: () => setShowScannerModal(true) },
                  h('span', null, '📷'), ' Scan Barcode / SKU'
                )
            )
          ),

          // Role-specific Active Workspace Hero Card (shows tailored role mission)
          effectiveRole !== 'owner' && h('div', {
            className: `role-workspace-hero-card ${effectiveRole}`,
            style: {
              background: effectiveRole === 'operator' ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(234, 88, 12, 0.05))' :
                          effectiveRole === 'clerk' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(5, 150, 105, 0.05))' :
                          'linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(124, 58, 237, 0.05))',
              border: `1.5px solid ${roleConfig.color}45`,
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap'
            }
          },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
              h('div', {
                style: {
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${roleConfig.color}25`,
                  border: `1px solid ${roleConfig.color}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22
                }
              }, roleConfig.icon),
              h('div', null,
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                  h('strong', { style: { fontSize: 14.5, color: 'var(--text-main)' } }, roleConfig.workspaceTitle || `${roleConfig.name} Workspace`),
                  h('span', { className: `role-badge ${roleConfig.badgeClass}`, style: { fontSize: 10, padding: '2px 7px' } }, `${roleConfig.tag} MODE`)
                ),
                h('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 } },
                  roleConfig.summary
                )
              )
            ),
            h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
              roleConfig.canEditProduction && h('button', {
                className: 'btn btn-sm btn-primary',
                onClick: () => { setFormData({}); setModalType('production'); }
              }, '⚡ New Batch'),
              roleConfig.canEditInventory && h('button', {
                className: 'btn btn-sm btn-outline',
                onClick: () => setShowScannerModal(true)
              }, '📷 Scan Barcode'),
              roleConfig.canViewFinancials && h('button', {
                className: 'btn btn-sm btn-primary',
                onClick: () => { setFormData({}); setModalType('sale'); }
              }, '+ Create Invoice'),
              canChangeRole && h('button', {
                className: 'btn btn-sm btn-outline',
                style: { fontSize: 11 },
                onClick: () => handleSwitchSimulatedRole(null)
              }, '👑 Exit View')
            )
          ),

          // 4 Metric KPI Cards (Adaptive for Role-Based Access)
          h('div', { className: 'metrics-grid' },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Sales this month'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'sales' }))
              ),
              h('div', { className: 'metric-value' }, roleConfig.canViewFinancials ? formatCurrency(dashboard?.paidSales || 48600) : '₹ ••••••'),
              h('div', { className: `metric-footer ${roleConfig.canViewFinancials ? 'success' : ''}` }, roleConfig.canViewFinancials ? '↗ Current period' : '🔒 Masked for Shop Floor Role')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Expenses this month'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'expenses' }))
              ),
              h('div', { className: 'metric-value' }, roleConfig.canViewFinancials ? formatCurrency(dashboard?.totalExpenses || 59950) : '₹ ••••••'),
              h('div', { className: 'metric-footer' }, roleConfig.canViewFinancials ? 'Recorded expenses' : '🔒 Masked for Shop Floor Role')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, roleConfig.canViewFinancials ? 'Finished goods value' : 'Finished goods inventory'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'inventory' }))
              ),
              h('div', { className: 'metric-value' }, roleConfig.canViewFinancials ? formatCurrency(finishedGoodsVal) : `${finishedGoodsUnits} units`),
              h('div', { className: 'metric-footer' }, `${finishedGoods.length} product line(s) · ${finishedGoodsUnits} units ready to sell`)
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, roleConfig.canViewFinancials ? 'Raw materials value' : 'Raw materials in warehouse'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'rawMaterials' }))
              ),
              h('div', { className: 'metric-value' }, roleConfig.canViewFinancials ? formatCurrency(rawMaterialsVal) : ` units`),
              h('div', { className: 'metric-footer' }, `${rawMaterials.length || rawMaterialsList.length} material type(s) in warehouse`)
            )
          ),

          // ForgeAI Quick Copilot & Business Analyst Bar
          h('div', {
            style: {
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: 12,
              padding: '12px 18px',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }
          },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
              h('div', { className: 'forecast-sparkle-badge' }, '✦'),
              h('div', null,
                h('div', { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' } }, 'ForgeAI Copilot & Business Analyst'),
                h('div', { style: { fontSize: 11.5, color: 'var(--text-muted)' } }, 'Instant answers on product margins, utilities vs raw materials, and stockout hazards.')
              )
            ),
            h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
              [
                'What was our highest-margin product last month?',
                'How much did we spend on utilities vs raw materials?',
                'Which raw materials are at risk of running out?'
              ].map((prompt, pi) =>
                h('button', {
                  key: pi,
                  type: 'button',
                  className: 'ai-chip-pill',
                  onClick: () => { setAiAnalystInitialQuery(prompt); setShowAiAnalyst(true); }
                }, prompt)
              )
            )
          ),

          // Analytical Section: Inventory Breakdown Pie Chart + Operations / Stock Health
          h('div', { className: 'dashboard-analytics-grid' },
            // Inventory Category Valuation Pie Chart
            h('div', { className: 'card analytics-card' },
              h('div', { className: 'card-header' },
                h('div', null,
                  h('h3', { className: 'card-title' }, roleConfig.canViewFinancials ? 'Total factory wealth breakdown' : 'Warehouse Inventory Balance'),
                  h('div', { className: 'card-subtitle' }, roleConfig.canViewFinancials ? 'Clear split between Finished Goods inventory and Raw Material stock' : 'Stock volume ratio between Finished Goods and Raw Materials')
                ),
                h('button', {
                  className: 'btn btn-outline',
                  style: { padding: '4px 9px', fontSize: 11.5 },
                  onClick: () => setActiveTab('inventory')
                }, 'Manage goods →')
              ),
              h('div', { style: { padding: '18px 20px' } },
                h(InventoryPieChart, { inventory, currency: '₹', canViewFinancials: roleConfig.canViewFinancials, onSelectCategory: (tab) => setActiveTab(tab) })
              )
            ),

            // Shop Floor & Production Status Card (Clean, Unambiguous & Actionable)
            h('div', { className: 'card analytics-card' },
              h('div', { className: 'card-header' },
                h('div', null,
                  h('h3', { className: 'card-title' }, 'Shop Floor & Production Queue'),
                  h('div', { className: 'card-subtitle' }, 'Active batch jobs transforming raw materials into finished goods')
                ),
                h('button', {
                  className: 'btn btn-outline',
                  style: { padding: '4px 9px', fontSize: 11.5 },
                  onClick: () => setActiveTab('production')
                }, 'Production →')
              ),
              h('div', { style: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 } },
                // 1. Batch Status Pipeline Meter
                h('div', null,
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 } },
                    h('span', { style: { fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.4px' } }, 'BATCH PIPELINE STATUS'),
                    h('span', { style: { color: inProgressRuns.length > 0 ? '#2563eb' : '#10b981', fontWeight: 600 } },
                      inProgressRuns.length > 0 ? `⚙ ${inProgressRuns.length} batch active on floor` : '✓ All scheduled runs complete'
                    )
                  ),
                  h('div', { style: { height: 8, borderRadius: 4, background: 'rgba(148, 163, 184, 0.16)', display: 'flex', overflow: 'hidden' } },
                    productionRuns.length > 0 && completedRuns.length > 0 && h('div', { style: { width: `${(completedRuns.length / productionRuns.length) * 100}%`, background: '#10b981' }, title: `Completed: ${completedRuns.length}` }),
                    productionRuns.length > 0 && inProgressRuns.length > 0 && h('div', { style: { width: `${(inProgressRuns.length / productionRuns.length) * 100}%`, background: '#3b82f6' }, title: `In progress: ${inProgressRuns.length}` }),
                    productionRuns.length > 0 && plannedRuns.length > 0 && h('div', { style: { width: `${(plannedRuns.length / productionRuns.length) * 100}%`, background: '#f59e0b' }, title: `Planned: ${plannedRuns.length}` })
                  ),
                  h('div', { style: { display: 'flex', gap: 14, marginTop: 7, fontSize: 11.5, flexWrap: 'wrap' } },
                    h('span', { style: { color: '#10b981', fontWeight: 600 } }, `● ${completedRuns.length} Completed (${completedUnits} units)`),
                    h('span', { style: { color: '#3b82f6', fontWeight: 600 } }, `● ${inProgressRuns.length} In progress (${inProgressUnits} units)`),
                    plannedRuns.length > 0 && h('span', { style: { color: '#f59e0b', fontWeight: 600 } }, `● ${plannedRuns.length} Planned`)
                  )
                ),

                // 2. Active Batches on the Floor (Strictly active jobs)
                h('div', { style: { borderTop: '1px solid var(--border-light)', paddingTop: 12 } },
                  h('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 8 } }, 'ACTIVE SHOP FLOOR JOBS'),
                  activeRuns.length === 0 ?
                    h('div', { style: { padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 7, fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                      h('span', null, 'No active batches right now.'),
                      h('button', {
                        className: 'btn btn-outline',
                        style: { padding: '2px 8px', fontSize: 11 },
                        onClick: () => { setFormData({}); setModalType('production'); }
                      }, '+ New Run')
                    ) :
                    activeRuns.map(run =>
                      h('div', {
                        key: run.id,
                        style: {
                          padding: '10px 12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 8,
                          marginBottom: 6,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }
                      },
                        h('div', null,
                          h('div', { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' } }, run.product),
                          h('div', { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 } }, `Batch started: ${formatDate(run.run_date)} · Target: ${run.quantity} units`)
                        ),
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                          h('span', { className: `badge ${run.status === 'In progress' ? 'badge-info' : 'badge-warning'}` }, run.status),
                          run.status === 'In progress' && roleConfig.canEditProduction && h('button', {
                            className: 'btn-done-action',
                            title: 'Complete batch',
                            onClick: () => {
                              fetch(`/api/production/${run.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Completed' })
                              }).then(() => {
                                loadAllData();
                                addToast('Batch completed and output added to finished stock!', 'success');
                              });
                            }
                          }, 'Done ✓')
                        )
                      )
                    )
                ),

                // 3. Clear Restock Alert or Health Banner (Explicit, no mystery numbers)
                lowStockMaterials.length > 0 ?
                  h('div', {
                    style: {
                      padding: '8px 12px',
                      borderRadius: 7,
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      marginTop: 2
                    }
                  },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: 7, color: '#b45309' } },
                      h(Icon, { name: 'alertCircle', size: 14 }),
                      h('span', null,
                        `Reorder Alert: `,
                        h('strong', null, lowStockMaterials[0].item_name),
                        ` (${lowStockMaterials[0].quantity} ${lowStockMaterials[0].unit} left)`
                      )
                    ),
                    h('a', {
                      href: '#',
                      onClick: (e) => { e.preventDefault(); setActiveTab('rawMaterials'); },
                      style: { fontSize: 11.5, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }
                    }, 'Restock →')
                  ) :
                  h('div', {
                    style: {
                      padding: '8px 12px',
                      borderRadius: 7,
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      fontSize: 11.5,
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }
                  },
                    h(Icon, { name: 'checkCircle', size: 13 }),
                    h('span', null, 'All raw material inputs & finished goods are at healthy stock levels.')
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
                        h('td', { style: { color: '#64748b' } }, formatDate(sale.issued_date)),
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

            // Quick Actions List (Adaptive by Role)
            h('div', { className: 'card quick-actions-card' },
              h('h3', { className: 'card-title', style: { marginBottom: 14 } },
                effectiveRole === 'owner' ? 'Enterprise Quick Actions' : `${roleConfig.name.split(' ')[0]} Launchpad`
              ),
              (
                effectiveRole === 'operator' ? [
                  { title: 'New production batch', desc: 'Schedule batch & log machine materials', icon: 'production', action: () => { setFormData({}); setModalType('production'); } },
                  { title: 'Check raw materials', desc: 'Inspect metals & shop floor machine stock', icon: 'rawMaterials', action: () => setActiveTab('rawMaterials') },
                  { title: 'Scan barcode / SKU', desc: 'Scan lot numbers or parts with camera HUD', icon: 'camera', action: () => setShowScannerModal(true) },
                  { title: 'View production table', desc: 'Monitor active and completed manufacturing runs', icon: 'checkCircle', action: () => setActiveTab('production') }
                ] :
                effectiveRole === 'clerk' ? [
                  { title: 'Barcode & QR Label Studio', desc: 'Design & print thermal and A4 product labels', icon: 'tag', action: () => { setLabelModalItem(null); setShowLabelModal(true); } },
                  { title: 'Scan inventory count', desc: 'Scan barcodes to increment or decrement stock', icon: 'camera', action: () => setShowScannerModal(true) },
                  { title: 'Finished goods stock', desc: 'Review manufactured inventory ready for dispatch', icon: 'inventory', action: () => setActiveTab('inventory') },
                  { title: 'Raw materials intake', desc: 'Check warehouse metals and minimum reorder alerts', icon: 'rawMaterials', action: () => setActiveTab('rawMaterials') }
                ] :
                effectiveRole === 'accountant' ? [
                  { title: 'Create sales invoice', desc: 'Generate customer invoice with GST and PDF print', icon: 'sales', action: () => { setFormData({}); setModalType('sale'); } },
                  { title: 'Log operating expense', desc: 'Record bills or extract with smart invoice OCR', icon: 'expenses', action: () => { setFormData({}); setModalType('expense'); } },
                  { title: 'Staff payroll disbursement', desc: 'Review monthly salaries and process payroll', icon: 'payroll', action: () => setActiveTab('payroll') },
                  { title: 'Financial analytics', desc: 'Inspect monthly revenue, margins, and expense reports', icon: 'reports', action: () => setActiveTab('reports') }
                ] :
                [
                  { title: 'Add finished product', desc: 'Register a sellable manufactured product', icon: 'inventory', action: () => { setFormData({ category: 'Finished good' }); setModalType('item'); } },
                  { title: 'Log raw materials', desc: 'Manage factory ingredients and warehouse stock', icon: 'rawMaterials', action: () => setActiveTab('rawMaterials') },
                  { title: 'New production batch', desc: 'Transform raw materials into finished goods', icon: 'production', action: () => { setFormData({}); setModalType('production'); } },
                  { title: 'View reports', desc: 'Review sales, expenses, and profit analytics', icon: 'reports', action: () => setActiveTab('reports') }
                ]
              ).map(item =>
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

        // ================= TAB: FINISHED GOODS (Option A) =================
        activeTab === 'inventory' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'MANUFACTURED PRODUCTS'),
              h('h1', { className: 'page-title' }, 'Finished goods'),
              h('p', { className: 'page-desc' }, 'Completed manufacturing products ready for sale, inventory valuation, and dispatch.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_finished_goods', finishedGoods, {
                  item_name: 'Product Name',
                  sku: 'SKU',
                  quantity: 'Units In Stock',
                  unit: 'Unit',
                  unit_cost: 'Production Cost (INR)',
                  reorder_level: 'Reorder Level'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export CSV'),
              h('button', {
                className: 'btn btn-outline',
                onClick: () => { setLabelModalItem(null); setShowLabelModal(true); }
              }, '🏷️ Label Studio'),
              roleConfig.canEditInventory && h('button', {
                className: 'btn btn-primary',
                onClick: () => { setFormData({ category: 'Finished good' }); setModalType('item'); }
              },
                h(Icon, { name: 'plus' }), 'Add product'
              )
            )
          ),

          // 3 Metric Cards for Finished Goods
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Product lines'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'inventory' }))
              ),
              h('div', { className: 'metric-value' }, `${finishedGoods.length} products`),
              h('div', { className: 'metric-footer' }, 'Cataloged SKU variants')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Stock availability'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'checkCircle' }))
              ),
              h('div', { className: 'metric-value' }, `${finishedGoodsUnits} units`),
              h('div', { className: 'metric-footer success' }, 'Ready for customer orders')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, roleConfig.canViewFinancials ? 'Finished goods valuation' : 'Stock status'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'sales' }))
              ),
              h('div', { className: 'metric-value' }, roleConfig.canViewFinancials ? formatCurrency(finishedGoodsVal) : `${finishedGoodsUnits} units`),
              h('div', { className: 'metric-footer' }, roleConfig.canViewFinancials ? 'Production cost asset value' : '🔒 Valuation masked for floor role')
            )
          ),

          // Finished Goods Stock & Profit Margins Chart
          h(FinishedGoodsChart, { finishedGoods, currency: '₹', canViewFinancials: roleConfig.canViewFinancials }),

          // Filter Pills for Finished Goods Stock State
          h('div', { className: 'filter-pills-row' },
            [
              { id: 'all', label: `All products (${finishedGoods.length})` },
              { id: 'in_stock', label: `In stock (${finishedGoods.filter(i => Number(i.quantity) > (Number(i.reorder_level) || 5)).length})` },
              { id: 'low_stock', label: `⚠️ Low stock alert (${finishedGoods.filter(i => Number(i.quantity) <= (Number(i.reorder_level) || 5)).length})` }
            ].map(pill =>
              h('button', {
                key: pill.id,
                className: `filter-pill ${inventoryCategoryFilter === pill.id ? 'active' : ''}`,
                onClick: () => setInventoryCategoryFilter(pill.id)
              }, pill.label)
            )
          ),

          // Clean Search Bar Row
          h('div', { className: 'search-bar-row' },
            h('div', { className: 'search-wrapper' },
              h(Icon, { name: 'search', size: 15, className: 'search-icon' }),
              h('input', {
                className: 'search-input',
                placeholder: 'Search finished product name or SKU...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              })
            ),
            h('div', { className: 'item-count-label' }, `${filteredInventory.length} products`)
          ),

          // Finished Goods Table
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    renderSortTh('item_name', 'PRODUCT / SKU'),
                    renderSortTh('quantity', 'STOCK STATUS'),
                    renderSortTh('unit', 'UNIT'),
                    renderSortTh('unit_cost', 'PRODUCTION COST'),
                    renderSortTh('unit_cost', 'SELLING PRICE (+30%)'),
                    renderSortTh('unit_cost', 'LINE VALUATION'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                  )
                ),
                h('tbody', null,
                  sortedInventory.length === 0 ?
                    h('tr', null, h('td', { colSpan: 7, className: 'empty-state' }, 'No finished products found. Click "+ Add product" above.')) :
                    sortedInventory.map(item => {
                      const qty = Number(item.quantity) || 0;
                      const cost = Number(item.unit_cost) || 0;
                      const sell = cost * 1.3;
                      const lineVal = qty * cost;
                      const isLow = qty <= (Number(item.reorder_level) || 5);
                      return h('tr', { key: item.id },
                        h('td', null,
                          h('div', { style: { fontWeight: 700 } }, item.item_name),
                          h('div', { style: { fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)' } }, item.sku)
                        ),
                        h('td', null,
                          h('span', {
                            className: `badge ${isLow ? 'badge-danger' : 'badge-success'}`
                          }, `${qty} ${item.unit || 'units'} ${isLow ? '⚠️ Low' : '✓ Good'}`)
                        ),
                        h('td', { style: { color: '#64748b' } }, item.unit || 'units'),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, roleConfig.canViewFinancials ? formatCurrency(cost) : '₹ ••••'),
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563eb' } }, roleConfig.canViewFinancials ? formatCurrency(sell) : '₹ ••••'),
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700 } }, roleConfig.canViewFinancials ? formatCurrency(lineVal) : '₹ ••••'),
                        h('td', { style: { textAlign: 'right' } },
                          h('div', { style: { display: 'inline-flex', gap: 6 } },
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5 },
                              title: 'Print Barcode & QR Label',
                              onClick: () => { setLabelModalItem(item); setShowLabelModal(true); }
                            }, '🏷️ Label'),
                            roleConfig.canEditInventory && h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5 },
                              onClick: () => { setFormData(item); setModalType('item'); }
                            }, 'Edit'),
                            roleConfig.canEditInventory && h('button', {
                              className: 'btn btn-danger-outline',
                              style: { padding: '4px 8px' },
                              onClick: () => handleDelete('inventory', item.id)
                            }, h(Icon, { name: 'trash', size: 13 }))
                          )
                        )
                      );
                    })
                )
              )
            )
          )
        ),

        // ================= TAB: SALES & INVOICES (Fig. 5) =================
        activeTab === 'sales' && (!roleConfig.canViewFinancials ?
          h(AccessRestrictedCard, { role: effectiveRole, allowedRoles: ['Owner', 'Accountant'], onReset: () => handleSwitchSimulatedRole(null) }) :
          h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'REVENUE & INVOICES'),
              h('h1', { className: 'page-title' }, 'Sales & invoices'),
              h('p', { className: 'page-desc' }, 'Manage customer orders, track payments, and print GST tax invoices.')
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

          // 3 Metric Cards for Sales
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total invoices'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'sales' }))
              ),
              h('div', { className: 'metric-value' }, sales.length),
              h('div', { className: 'metric-footer' }, 'Generated invoices')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Collected revenue'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'checkCircle' }))
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.paidSales || 48600)),
              h('div', { className: 'metric-footer success' }, 'Paid & cleared')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Pending receivables'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'alertCircle' }))
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.pendingSales || 32400)),
              h('div', { className: 'metric-footer warning' }, 'Awaiting payment')
            )
          ),

          // Sales Invoice Payment Status Chart
          h(SalesStatusChart, { sales, currency: '₹' }),

          // Status Filter Pills
          h('div', { className: 'filter-pills-row' },
            [
              { id: 'all', label: `All invoices (${sales.length})` },
              { id: 'paid', label: `Paid (${sales.filter(s => s.status === 'Paid').length})` },
              { id: 'pending', label: `Pending (${sales.filter(s => s.status === 'Pending').length})` },
              { id: 'overdue', label: `Overdue (${sales.filter(s => s.status === 'Overdue').length})` }
            ].map(pill =>
              h('button', {
                key: pill.id,
                className: `filter-pill ${salesFilter === pill.id ? 'active' : ''}`,
                onClick: () => setSalesFilter(pill.id)
              }, pill.label)
            )
          ),

          // Date Range Presets Filter Bar (This Month, Last 30 Days, This Quarter, Custom)
          h(DateRangeFilterBar, {
            activeFilter: salesDateFilter,
            onChangeFilter: setSalesDateFilter,
            customStart: salesCustomStart,
            onChangeCustomStart: setSalesCustomStart,
            customEnd: salesCustomEnd,
            onChangeCustomEnd: setSalesCustomEnd
          }),

          // Search Bar Row
          h('div', { className: 'search-bar-row' },
            h('div', { className: 'search-wrapper' },
              h(Icon, { name: 'search', size: 15, className: 'search-icon' }),
              h('input', {
                className: 'search-input',
                placeholder: 'Search invoice number or customer name...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              })
            ),
            h('div', { className: 'item-count-label' }, `${filteredSales.length} invoices`)
          ),

          // Sales Table
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    renderSortTh('invoice_no', 'INVOICE'),
                    renderSortTh('customer', 'CUSTOMER'),
                    renderSortTh('issued_date', 'DATE'),
                    renderSortTh('amount', 'SUBTOTAL'),
                    h('th', null, 'GST (5%)'),
                    renderSortTh('status', 'STATUS'),
                    renderSortTh('amount', 'TOTAL', 'right'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                  )
                ),
                h('tbody', null,
                  sortedSales.length === 0 ?
                    h('tr', null, h('td', { colSpan: 8, className: 'empty-state' }, 'No sales invoices match your filters.')) :
                    sortedSales.map(sale =>
                      h('tr', { key: sale.id },
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700 } }, sale.invoice_no),
                        h('td', null,
                          h('div', { style: { fontWeight: 600 } }, sale.customer),
                          h('div', { style: { fontSize: 11, color: '#64748b' } }, 'Customer Order')
                        ),
                        h('td', { style: { color: '#64748b' } }, formatDate(sale.issued_date)),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(Number(sale.amount) / 1.05)),
                        h('td', { style: { fontFamily: 'var(--font-mono)', color: '#64748b' } }, formatCurrency(Number(sale.amount) - (Number(sale.amount) / 1.05))),
                        h('td', null,
                          h('span', {
                            className: `badge ${sale.status === 'Paid' ? 'badge-success' : sale.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`
                          }, sale.status)
                        ),
                        h('td', { style: { textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' } }, formatCurrency(sale.amount)),
                        h('td', { style: { textAlign: 'right' } },
                          h('div', { style: { display: 'inline-flex', gap: 6, alignItems: 'center' } },
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5 },
                              title: 'View & Download PDF / Print Tax Invoice',
                              onClick: () => { setSelectedInvoice(sale); setModalType('invoicePreview'); }
                            }, '🖨️ Download PDF / Print'),
                            sale.status !== 'Paid' && h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5, color: '#059669', borderColor: '#10b981' },
                              title: 'Mark as Paid',
                              onClick: () => {
                                fetch(`/api/sales/${sale.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...sale, status: 'Paid' })
                                }).then(() => {
                                  loadAllData();
                                  addToast(`Invoice ${sale.invoice_no} marked as Paid!`, 'success');
                                });
                              }
                            }, 'Paid ✓'),
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
          )
        )),

        // ================= TAB: EXPENSES (Fig. 6) =================
        activeTab === 'expenses' && (!roleConfig.canViewFinancials ?
          h(AccessRestrictedCard, { role: effectiveRole, allowedRoles: ['Owner', 'Accountant'], onReset: () => handleSwitchSimulatedRole(null) }) :
          h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'COSTS & OUTGOINGS'),
              h('h1', { className: 'page-title' }, 'Expenses'),
              h('p', { className: 'page-desc' }, 'Record, categorize and review all factory operating expenses.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_expenses', expenses, {
                  description: 'Description',
                  category: 'Category',
                  expense_date: 'Date',
                  payment_method: 'Payment Method',
                  amount: 'Amount (INR)'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export CSV'),
              h('button', {
                className: 'btn-ai-scan',
                onClick: () => setShowOcrModal(true)
              }, '⚡ Scan Vendor Bill (AI OCR)'),
              h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('expense'); } },
                h(Icon, { name: 'plus' }), 'Add expense'
              )
            )
          ),

          // 3 Metric Cards for Expenses
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total records'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'expenses' }))
              ),
              h('div', { className: 'metric-value' }, expenses.length),
              h('div', { className: 'metric-footer' }, 'Recorded expenditures')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total expenses'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'expenses' }))
              ),
              h('div', { className: 'metric-value' }, formatCurrency(dashboard?.totalExpenses || 59950)),
              h('div', { className: 'metric-footer' }, 'Operational outflow')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Active categories'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'overview' }))
              ),
              h('div', { className: 'metric-value' }, distinctExpenseCategories || 3),
              h('div', { className: 'metric-footer' }, 'Expense heads')
            )
          ),

          // Expenses Outflow by Category Chart
          h(ExpenseCategoryChart, { expenses, currency: '₹' }),

          // Category Filter Pills
          h('div', { className: 'filter-pills-row' },
            [
              { id: 'all', label: `All expenses (${expenses.length})` },
              { id: 'Utilities', label: `Utilities (${expenses.filter(e => (e.category || '').toLowerCase() === 'utilities').length})` },
              { id: 'Materials', label: `Materials (${expenses.filter(e => (e.category || '').toLowerCase() === 'materials').length})` },
              { id: 'Maintenance', label: `Maintenance (${expenses.filter(e => (e.category || '').toLowerCase() === 'maintenance').length})` },
              { id: 'General', label: `General (${expenses.filter(e => (e.category || '').toLowerCase() === 'general').length})` }
            ].map(pill =>
              h('button', {
                key: pill.id,
                className: `filter-pill ${expenseCategoryFilter === pill.id ? 'active' : ''}`,
                onClick: () => setExpenseCategoryFilter(pill.id)
              }, pill.label)
            )
          ),

          // Date Range Presets Filter Bar (This Month, Last 30 Days, This Quarter, Custom)
          h(DateRangeFilterBar, {
            activeFilter: expenseDateFilter,
            onChangeFilter: setExpenseDateFilter,
            customStart: expenseCustomStart,
            onChangeCustomStart: setExpenseCustomStart,
            customEnd: expenseCustomEnd,
            onChangeCustomEnd: setExpenseCustomEnd
          }),

          // Search Row
          h('div', { className: 'search-bar-row' },
            h('div', { className: 'search-wrapper' },
              h(Icon, { name: 'search', size: 15, className: 'search-icon' }),
              h('input', {
                className: 'search-input',
                placeholder: 'Search expense description or category...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              })
            ),
            h('div', { className: 'item-count-label' }, `${filteredExpenses.length} records`)
          ),

          // Expenses Table
          h('div', { className: 'card' },
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    renderSortTh('description', 'EXPENSE'),
                    renderSortTh('category', 'CATEGORY'),
                    renderSortTh('expense_date', 'DATE'),
                    renderSortTh('payment_method', 'PAYMENT METHOD'),
                    renderSortTh('amount', 'AMOUNT'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                  )
                ),
                h('tbody', null,
                  sortedExpenses.length === 0 ?
                    h('tr', null, h('td', { colSpan: 6, className: 'empty-state' }, 'No expense records found')) :
                    sortedExpenses.map(exp =>
                      h('tr', { key: exp.id },
                        h('td', { style: { fontWeight: 600 } }, exp.description),
                        h('td', null, h('span', { className: 'badge badge-neutral' }, exp.category)),
                        h('td', { style: { color: '#64748b' } }, formatDate(exp.expense_date)),
                        h('td', { style: { color: '#64748b' } }, exp.payment_method),
                        h('td', { style: { fontWeight: 700, fontFamily: 'var(--font-mono)' } }, formatCurrency(exp.amount)),
                        h('td', { style: { textAlign: 'right' } },
                          h('div', { style: { display: 'inline-flex', gap: 6 } },
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5 },
                              onClick: () => { setFormData(exp); setModalType('expense'); }
                            }, 'Edit'),
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
          )
        )),

        // ================= TAB: RAW MATERIALS (Fig. 7) =================
        activeTab === 'rawMaterials' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'FACTORY INPUTS & INGREDIENTS'),
              h('h1', { className: 'page-title' }, 'Raw materials'),
              h('p', { className: 'page-desc' }, 'Warehouse stock of metals, sheets, rods, and components for manufacturing.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: `btn ${showForecastView ? 'btn-primary' : 'btn-outline'}`,
                style: showForecastView ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none' } : {},
                onClick: () => setShowForecastView(!showForecastView)
              }, '⚡ ' + (showForecastView ? 'Hide AI Forecast' : 'AI Demand Forecast & Runway'))
            )
          ),

          // 3 Metric Cards for Raw Materials
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Material types'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'rawMaterials' }))
              ),
              h('div', { className: 'metric-value' }, `${rawMaterials.length} materials`),
              h('div', { className: 'metric-footer' }, 'Factory inputs & supplies')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Low stock alerts'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'alertCircle' }))
              ),
              h('div', { className: 'metric-value' }, `${rawMaterials.filter(m => Number(m.quantity) <= (Number(m.reorder_level) || 15)).length} alert(s)`),
              h('div', { className: 'metric-footer warning' }, 'Needs reordering')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, roleConfig.canViewFinancials ? 'Raw materials valuation' : 'Stock inventory count'),
                h('div', { className: 'metric-icon-wrap' }, h(Icon, { name: 'inventory' }))
              ),
              h('div', { className: 'metric-value' }, roleConfig.canViewFinancials ? formatCurrency(rawMaterialsVal) : (rawMaterials.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0) + ' units')),
              h('div', { className: 'metric-footer' }, roleConfig.canViewFinancials ? 'Capital in raw warehouse stock' : '🔒 Valuation masked for floor role')
            )
          ),

          // AI Predictive Demand Forecasting Panel
          showForecastView && h(AiForecastWidget, {
            rawMaterials,
            finishedGoods,
            sales,
            onRestock: (mat) => {
              setFormData({
                category: 'Materials',
                description: `Restock purchase of ${mat.name} (${mat.recommendedOrderQty} ${mat.unit})`,
                amount: mat.estimatedProcurementCost
              });
              setModalType('expense');
            },
            currency: '₹'
          }),

          // Add Raw Material Inline Form (Fig. 7)
          !roleConfig.canEditInventory ?
            h('div', {
              className: 'card',
              style: { padding: '14px 18px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-light)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }
            }, '🔒 Raw material cataloging & intake is restricted to Warehouse Clerks and Admins. Operators consume inventory via active batch runs.') :
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
          h(RawMaterialsPieChart, { rawMaterials, currency: '₹', canViewFinancials: roleConfig.canViewFinancials }),

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
                    renderSortTh('sku', 'SKU'),
                    renderSortTh('item_name', 'MATERIAL'),
                    renderSortTh('quantity', 'STOCK'),
                    renderSortTh('unit_cost', 'UNIT COST'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTION')
                  )
                ),
                h('tbody', null,
                  sortedRawMaterials.length === 0 ?
                    h('tr', null, h('td', { colSpan: 5, className: 'empty-state' }, 'No raw materials yet. Add a raw material using the form above.')) :
                    sortedRawMaterials.map(mat =>
                      h('tr', { key: mat.id },
                        h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, mat.sku),
                        h('td', { style: { fontWeight: 700 } }, mat.item_name),
                        h('td', { style: { fontWeight: 700, color: '#059669' } }, `${mat.quantity} ${mat.unit}`),
                        h('td', { style: { fontFamily: 'var(--font-mono)' } }, roleConfig.canViewFinancials ? formatCurrency(mat.unit_cost) : '₹ ••••'),
                        h('td', { style: { textAlign: 'right' } },
                          h('div', { style: { display: 'inline-flex', gap: 6 } },
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px', fontSize: 11.5 },
                              title: 'Print Raw Material Barcode & QR Label',
                              onClick: () => { setLabelModalItem(mat); setShowLabelModal(true); }
                            }, '🏷️ Label'),
                            roleConfig.canEditInventory && h('button', {
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
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_production_runs', productionRuns, {
                  run_date: 'Run Date',
                  product: 'Target Product',
                  quantity: 'Planned Quantity',
                  status: 'Status'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export CSV'),
              roleConfig.canEditProduction && h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('production'); } },
                h(Icon, { name: 'plus' }), 'New production run'
              )
            )
          ),

          // 3 Metric Cards for Production
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total Batches'),
                h('div', { className: 'metric-icon-wrap primary' }, h(Icon, { name: 'production' }))
              ),
              h('div', { className: 'metric-value' }, productionRuns.length),
              h('div', { className: 'metric-footer' }, 'Batches scheduled or completed')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'In-Progress Jobs'),
                h('div', { className: 'metric-icon-wrap warning' }, h(Icon, { name: 'refresh' }))
              ),
              h('div', { className: 'metric-value', style: { color: '#2563eb' } }, productionRuns.filter(r => r.status === 'In progress').length),
              h('div', { className: 'metric-footer' }, 'Active manufacturing runs')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Completed Batches'),
                h('div', { className: 'metric-icon-wrap success' }, h(Icon, { name: 'checkCircle' }))
              ),
              h('div', { className: 'metric-value', style: { color: '#059669' } }, productionRuns.filter(r => r.status === 'Completed').length),
              h('div', { className: 'metric-footer' }, 'Delivered to finished inventory')
            )
          ),

          // Production Batch Health & Status Chart
          h(ProductionStatusChart, { productionRuns }),

          // Date Range Presets Filter Bar (This Month, Last 30 Days, This Quarter, Custom)
          h(DateRangeFilterBar, {
            activeFilter: prodDateFilter,
            onChangeFilter: setProdDateFilter,
            customStart: prodCustomStart,
            onChangeCustomStart: setProdCustomStart,
            customEnd: prodCustomEnd,
            onChangeCustomEnd: setProdCustomEnd
          }),

          // Filter Pills Bar (All, In progress, Planned, Completed) + Search Bar
          h('div', { className: 'table-controls' },
            h('div', { className: 'filter-pills' },
              h('button', {
                className: `filter-pill ${productionStatusFilter === 'all' ? 'active' : ''}`,
                onClick: () => setProductionStatusFilter('all')
              }, 'All Batches', h('span', { className: 'pill-count' }, productionRuns.length)),
              h('button', {
                className: `filter-pill ${productionStatusFilter === 'in_progress' ? 'active' : ''}`,
                onClick: () => setProductionStatusFilter('in_progress')
              }, 'In Progress', h('span', { className: 'pill-count' }, productionRuns.filter(r => r.status === 'In progress').length)),
              h('button', {
                className: `filter-pill ${productionStatusFilter === 'planned' ? 'active' : ''}`,
                onClick: () => setProductionStatusFilter('planned')
              }, 'Planned', h('span', { className: 'pill-count' }, productionRuns.filter(r => r.status === 'Planned').length)),
              h('button', {
                className: `filter-pill ${productionStatusFilter === 'completed' ? 'active' : ''}`,
                onClick: () => setProductionStatusFilter('completed')
              }, 'Completed', h('span', { className: 'pill-count' }, productionRuns.filter(r => r.status === 'Completed').length))
            ),
            h('div', { className: 'search-wrapper' },
              h('span', { className: 'search-icon' }, h(Icon, { name: 'search', size: 14 })),
              h('input', {
                type: 'text',
                className: 'search-input',
                placeholder: 'Search product or date...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              }),
              searchQuery && h('button', { className: 'search-clear', onClick: () => setSearchQuery('') }, '✕')
            )
          ),

          // Production Table
          h('div', { className: 'card' },
            h('div', { className: 'card-header' },
              h('h3', { className: 'card-title' }, 'Manufacturing Queue & Completed Batches'),
              h('div', { className: 'item-count-label' }, `Showing ${filteredProductionRuns.length} of ${productionRuns.length} batches`)
            ),
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    renderSortTh('run_date', 'RUN DATE'),
                    renderSortTh('product', 'PRODUCT'),
                    renderSortTh('quantity', 'QUANTITY'),
                    renderSortTh('status', 'STATUS'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                  )
                ),
                h('tbody', null,
                  sortedProductionRuns.length === 0 ?
                    h('tr', null, h('td', { colSpan: 5, className: 'empty-state' }, 'No production runs match the filter')) :
                    sortedProductionRuns.map(run =>
                      h('tr', { key: run.id },
                        h('td', { style: { color: '#64748b', fontFamily: 'var(--font-mono)' } }, formatDate(run.run_date)),
                        h('td', { style: { fontWeight: 700 } }, run.product),
                        h('td', { style: { fontWeight: 800, fontFamily: 'var(--font-mono)' } }, `${Number(run.quantity).toLocaleString()} units`),
                        h('td', null,
                          h('span', {
                            className: `badge ${run.status === 'Completed' ? 'badge-success' : run.status === 'In progress' ? 'badge-warning' : 'badge-info'}`
                          }, run.status)
                        ),
                        h('td', { style: { textAlign: 'right' } },
                          roleConfig.canEditProduction ?
                          h('div', { style: { display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' } },
                            run.status !== 'Completed' && h('button', {
                              className: 'btn btn-done-action',
                              style: { padding: '4px 9px', fontSize: 11.5 },
                              title: 'Mark batch as completed',
                              onClick: () => {
                                fetch(`/api/production/${run.id}/status`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'Completed' })
                                }).then(() => {
                                  if (window.__showToast) window.__showToast(`Batch for ${run.product} marked as completed!`, 'success');
                                  loadAllData();
                                });
                              }
                            }, '✓ Complete'),
                            h('button', {
                              className: 'btn btn-danger-outline',
                              style: { padding: '4px 8px' },
                              title: 'Delete run',
                              onClick: () => {
                                if (confirm(`Delete production run for "${run.product}"?`)) {
                                  fetch(`/api/production/${run.id}`, { method: 'DELETE' })
                                    .then(() => {
                                      if (window.__showToast) window.__showToast('Production run deleted', 'info');
                                      loadAllData();
                                    });
                                }
                              }
                            }, h(Icon, { name: 'trash', size: 13 }))
                            ) :
                            h('span', { className: 'badge', style: { fontSize: 10.5 } }, 'View Only')
                        )
                      )
                    )
                )
              )
            )
          )
        ),

        // ================= TAB: PAYROLL =================
        activeTab === 'payroll' && (!roleConfig.canDisbursePayroll ?
          h(AccessRestrictedCard, { role: effectiveRole, allowedRoles: ['Owner', 'Accountant'], onReset: () => handleSwitchSimulatedRole(null) }) :
          h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'HUMAN RESOURCES & COMPENSATION'),
              h('h1', { className: 'page-title' }, 'Payroll'),
              h('p', { className: 'page-desc' }, 'Manage employee compensation, role allocations, monthly salary disbursements and printable payslips.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_employees_payroll', employees, {
                  name: 'Employee Name',
                  role: 'Role / Designation',
                  monthly_salary: 'Monthly Salary (INR)',
                  status: 'Status'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export CSV'),
              h('button', { className: 'btn btn-primary', onClick: () => { setFormData({}); setModalType('employee'); } },
                h(Icon, { name: 'plus' }), 'Add employee'
              )
            )
          ),

          // 3 Metric Cards for Payroll
          h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Total Staff'),
                h('div', { className: 'metric-icon-wrap primary' }, h(Icon, { name: 'payroll' }))
              ),
              h('div', { className: 'metric-value' }, employees.length),
              h('div', { className: 'metric-footer' }, 'Registered employees on company payroll')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Monthly Payroll Outflow'),
                h('div', { className: 'metric-icon-wrap warning' }, h(Icon, { name: 'expenses' }))
              ),
              h('div', { className: 'metric-value', style: { color: '#0284c7' } },
                formatCurrency(employees.filter(e => e.status === 'Active').reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || dashboard?.monthlyPayroll || 28000)
              ),
              h('div', { className: 'metric-footer' }, 'Estimated active monthly compensation')
            ),
            h('div', { className: 'metric-card' },
              h('div', { className: 'metric-top' },
                h('span', { className: 'metric-label' }, 'Active Workforce'),
                h('div', { className: 'metric-icon-wrap success' }, h(Icon, { name: 'user' }))
              ),
              h('div', { className: 'metric-value', style: { color: '#059669' } }, employees.filter(e => e.status === 'Active').length),
              h('div', { className: 'metric-footer' }, `${employees.filter(e => e.status !== 'Active').length} inactive / on-leave`)
            )
          ),

          // Payroll Compensation by Role Chart
          h(PayrollCompensationChart, { employees, currency: '₹' }),

          // Filter Pills Bar (All, Active, Inactive) + Search Bar
          h('div', { className: 'table-controls' },
            h('div', { className: 'filter-pills' },
              h('button', {
                className: `filter-pill ${payrollStatusFilter === 'all' ? 'active' : ''}`,
                onClick: () => setPayrollStatusFilter('all')
              }, 'All Staff', h('span', { className: 'pill-count' }, employees.length)),
              h('button', {
                className: `filter-pill ${payrollStatusFilter === 'active' ? 'active' : ''}`,
                onClick: () => setPayrollStatusFilter('active')
              }, 'Active', h('span', { className: 'pill-count' }, employees.filter(e => e.status === 'Active').length)),
              h('button', {
                className: `filter-pill ${payrollStatusFilter === 'inactive' ? 'active' : ''}`,
                onClick: () => setPayrollStatusFilter('inactive')
              }, 'Inactive', h('span', { className: 'pill-count' }, employees.filter(e => e.status !== 'Active').length))
            ),
            h('div', { className: 'search-wrapper' },
              h('span', { className: 'search-icon' }, h(Icon, { name: 'search', size: 14 })),
              h('input', {
                type: 'text',
                className: 'search-input',
                placeholder: 'Search employee name or role...',
                value: searchQuery,
                onChange: e => setSearchQuery(e.target.value)
              }),
              searchQuery && h('button', { className: 'search-clear', onClick: () => setSearchQuery('') }, '✕')
            )
          ),

          // Employees Table
          h('div', { className: 'card' },
            h('div', { className: 'card-header' },
              h('h3', { className: 'card-title' }, 'Employee Directory & Salary Registry'),
              h('div', { className: 'item-count-label' }, `Showing ${filteredEmployees.length} of ${employees.length} employees`)
            ),
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    renderSortTh('name', 'EMPLOYEE'),
                    renderSortTh('role', 'ROLE'),
                    renderSortTh('monthly_salary', 'MONTHLY SALARY'),
                    renderSortTh('status', 'STATUS'),
                    h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                  )
                ),
                h('tbody', null,
                  sortedEmployees.length === 0 ?
                    h('tr', null, h('td', { colSpan: 5, className: 'empty-state' }, 'No employees match the filter criteria')) :
                    sortedEmployees.map(emp =>
                      h('tr', { key: emp.id },
                        h('td', null,
                          h('div', { style: { fontWeight: 700 } }, emp.name),
                          h('div', { style: { fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)' } }, `EMP-${String(emp.id).padStart(4, '0')}`)
                        ),
                        h('td', null,
                          h('span', { style: { fontWeight: 500 } }, emp.role)
                        ),
                        h('td', { style: { fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' } }, formatCurrency(emp.monthly_salary)),
                        h('td', null,
                          h('span', { className: `badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}` }, emp.status)
                        ),
                        h('td', { style: { textAlign: 'right' } },
                          h('div', { style: { display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' } },
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 9px', fontSize: 11.5, borderColor: '#3b82f6', color: '#2563eb' },
                              title: 'View & Print Salary Payslip',
                              onClick: () => {
                                setSelectedEmployee(emp);
                                setModalType('payslipPreview');
                              }
                            }, '📄 Payslip'),
                            h('button', {
                              className: 'btn btn-outline',
                              style: { padding: '4px 8px' },
                              title: 'Edit employee',
                              onClick: () => {
                                setFormData({ ...emp });
                                setModalType('employee');
                              }
                            }, h(Icon, { name: 'edit', size: 13 })),
                            h('button', {
                              className: 'btn btn-danger-outline',
                              style: { padding: '4px 8px' },
                              title: 'Delete employee',
                              onClick: () => handleDelete('employees', emp.id)
                            }, h(Icon, { name: 'trash', size: 13 }))
                          )
                        )
                      )
                    )
                )
              )
            )
          )
        )),

        // ================= TAB: REPORTS =================
        activeTab === 'reports' && (!roleConfig.canViewFinancials ?
          h(AccessRestrictedCard, { role: effectiveRole, allowedRoles: ['Owner', 'Accountant'], onReset: () => handleSwitchSimulatedRole(null) }) :
          h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'FINANCIAL & BUSINESS ANALYTICS'),
              h('h1', { className: 'page-title' }, 'Reports'),
              h('p', { className: 'page-desc' }, 'Operational sales, expenses, and net profit margins across active financial months.')
            ),
            h('div', { className: 'header-actions' },
              h('button', {
                className: 'btn btn-outline',
                onClick: () => exportToCsv('forgeledger_monthly_financial_report', reportsData?.monthly || [
                  { month: '2026-09', sales: reportsData?.totalSales || 129200, expenses: reportsData?.totalExpenses || 59950, net: reportsData?.netMargin || 69250 }
                ], {
                  month: 'Month Period',
                  sales: 'Total Invoiced Sales (INR)',
                  expenses: 'Total Incurred Expenses (INR)',
                  net: 'Net Operating Profit (INR)'
                })
              }, h(Icon, { name: 'download', size: 14 }), 'Export Financial CSV')
            )
          ),

          // 3 Summary Cards with Net Margin Ratio
          (() => {
            const totSales = reportsData?.totalSales || 129200;
            const totExp = reportsData?.totalExpenses || 59950;
            const netMgn = reportsData?.netMargin !== undefined ? reportsData.netMargin : (totSales - totExp);
            const mgnPct = totSales > 0 ? ((netMgn / totSales) * 100).toFixed(1) : 0;
            return h('div', { className: 'metrics-grid', style: { gridTemplateColumns: 'repeat(3, 1fr)' } },
              h('div', { className: 'metric-card' },
                h('div', { className: 'metric-top' },
                  h('span', { className: 'metric-label' }, 'Total Invoiced Sales'),
                  h('span', { className: 'metric-badge metric-success' }, 'Revenue')
                ),
                h('div', { className: 'metric-value' }, formatCurrency(totSales)),
                h('div', { className: 'metric-footer' }, 'Gross sales across all customer invoices')
              ),
              h('div', { className: 'metric-card' },
                h('div', { className: 'metric-top' },
                  h('span', { className: 'metric-label' }, 'Total Operating Expenses'),
                  h('span', { className: 'metric-badge metric-danger' }, 'Outflows')
                ),
                h('div', { className: 'metric-value', style: { color: '#dc2626' } }, formatCurrency(totExp)),
                h('div', { className: 'metric-footer' }, 'Utilities, raw materials, payroll & maintenance')
              ),
              h('div', { className: 'metric-card' },
                h('div', { className: 'metric-top' },
                  h('span', { className: 'metric-label' }, 'Net Operating Margin'),
                  h('span', { className: `metric-badge ${netMgn >= 0 ? 'metric-success' : 'metric-danger'}` }, `${mgnPct}% margin`)
                ),
                h('div', { className: 'metric-value', style: { color: netMgn >= 0 ? '#059669' : '#dc2626' } }, formatCurrency(netMgn)),
                h('div', { className: 'metric-footer' }, `${netMgn >= 0 ? 'Profitable operational health' : 'Operating at a loss'}`)
              )
            );
          })(),

          // Monthly Revenue vs Expenses Comparison Chart
          h(ReportsComparisonChart, { reportsData, currency: '₹' }),

          // Monthly Summary Table
          h('div', { className: 'card' },
            h('div', { className: 'card-header' },
              h('h3', { className: 'card-title' }, 'Monthly Performance Summary'),
              h('div', { className: 'item-count-label' }, 'Aggregated revenue, expenses & profit margin ratios')
            ),
            h('div', { className: 'table-responsive' },
              h('table', { className: 'custom-table' },
                h('thead', null,
                  h('tr', null,
                    h('th', null, 'MONTH PERIOD'),
                    h('th', null, 'INVOICED SALES'),
                    h('th', null, 'EXPENSES'),
                    h('th', null, 'PROFIT MARGIN %'),
                    h('th', { style: { textAlign: 'right' } }, 'NET MARGIN')
                  )
                ),
                h('tbody', null,
                  (reportsData?.monthly && reportsData.monthly.length > 0 ? reportsData.monthly : [
                    { month: '2026-09', sales: 129200, expenses: 59950, net: 69250 }
                  ]).map(row => {
                    const rowSales = Number(row.sales) || 0;
                    const rowNet = Number(row.net) || (rowSales - (Number(row.expenses) || 0));
                    const rowPct = rowSales > 0 ? ((rowNet / rowSales) * 100).toFixed(1) : '0.0';
                    return h('tr', { key: row.month },
                      h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, row.month),
                      h('td', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, formatCurrency(row.sales)),
                      h('td', { style: { fontFamily: 'var(--font-mono)', color: '#64748b' } }, formatCurrency(row.expenses)),
                      h('td', null,
                        h('span', {
                          className: `badge ${rowNet >= 0 ? 'badge-success' : 'badge-danger'}`,
                          style: { fontFamily: 'var(--font-mono)', fontSize: 11 }
                        }, `${rowPct}%`)
                      ),
                      h('td', {
                        style: {
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: rowNet >= 0 ? '#059669' : '#dc2626'
                        }
                      }, formatCurrency(rowNet))
                    );
                  })
                )
              )
            )
          )
        )),

        // ================= TAB: ACCOUNT & SETTINGS =================
        activeTab === 'settings' && h('div', null,
          h('div', { className: 'page-header' },
            h('div', null,
              h('div', { className: 'page-subtitle' }, 'ACCOUNT, SECURITY & WORKSPACE CONTROL'),
              h('h1', { className: 'page-title' }, 'Account & Workspace Center'),
              h('p', { className: 'page-desc' }, 'Manage your personal operator identity, credentials & security, active workspaces, customizations, and offline data backups.')
            )
          ),

          // Sub-tabs navigation
          h('div', { className: 'settings-tabs-nav' },
            [
              { id: 'profile', icon: '👤', label: 'Profile & Identity' },
              { id: 'team', icon: '👥', label: 'Team & Staff Roles' },
              { id: 'security', icon: '🔒', label: 'Security & Access' },
              { id: 'company', icon: '🏢', label: 'Company Workspace' },
              { id: 'customization', icon: '🎨', label: 'Workspace Customization' },
              { id: 'backup', icon: '💾', label: 'Data & Backup' }
            ].map(tab =>
              h('button', {
                key: tab.id,
                className: `settings-tab-btn ${settingsTab === tab.id ? 'active' : ''}`,
                onClick: () => setSettingsTab(tab.id)
              },
                h('span', null, tab.icon),
                h('span', null, tab.label)
              )
            )
          ),

          // ----- SUB-TAB 1: PERSONAL PROFILE & IDENTITY -----
          settingsTab === 'profile' && h('div', null,
            // Profile Hero Card with Avatar & Studio Toggle
            h('div', { className: 'profile-hero-card' },
              h('div', {
                className: 'profile-avatar-large',
                style: { background: avatarGradient }
              },
                avatarIcon || (profileForm.name || currentUser?.name || 'U').charAt(0).toUpperCase()
              ),
              h('div', { style: { flex: 1, minWidth: 200 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 } },
                  h('h2', { style: { margin: 0, fontSize: 19, color: 'var(--text-primary)' } }, profileForm.name || currentUser?.name || 'Operator Profile'),
                  h('span', { className: 'badge badge-primary', style: { fontSize: 11, padding: '2px 8px' } }, profileForm.role || 'Plant Manager'),
                  h('span', { className: 'badge badge-info', style: { fontSize: 11, padding: '2px 8px' } }, profileForm.department || 'Operations'),
                  h('span', { className: 'badge badge-success', style: { fontSize: 11, padding: '2px 8px' } }, '🟢 Active Operator')
                ),
                h('div', { style: { fontSize: 13, color: 'var(--text-secondary)' } },
                  currentUser?.email || 'Logged in operator',
                  currentUser?.company?.name ? ` • Workspace: ${currentUser.company.name}` : ''
                )
              ),
              h('button', {
                type: 'button',
                className: 'btn btn-outline',
                style: { fontSize: 12, padding: '7px 14px', whiteSpace: 'nowrap' },
                onClick: () => setShowAvatarCustomizer(!showAvatarCustomizer)
              }, showAvatarCustomizer ? '✕ Close Avatar Studio' : '🎨 Customize Avatar')
            ),

            // Expandable Avatar Customizer Studio
            showAvatarCustomizer && h('div', { className: 'avatar-customizer-wrap' },
              h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
                h('div', null,
                  h('strong', { style: { fontSize: 14, color: 'var(--text-primary)' } }, 'Operator Avatar Studio'),
                  h('div', { style: { fontSize: 12, color: 'var(--text-secondary)' } }, 'Pick an industrial badge icon or customize your operator gradient color')
                ),
                h('button', {
                  className: 'btn btn-outline',
                  style: { fontSize: 11, padding: '4px 10px' },
                  onClick: () => handleSelectAvatar('', 'linear-gradient(135deg, #2563eb, #4f46e5)')
                }, 'Reset to Default')
              ),

              h('div', { style: { marginBottom: 12 } },
                h('label', { style: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' } }, '1. SELECT AVATAR BADGE / ICON:'),
                h('div', { className: 'avatar-preset-row' },
                  [
                    { id: '', label: 'Default Initials', icon: '🔤' },
                    { id: '🏭', label: 'Factory Plant', icon: '🏭' },
                    { id: '⚙️', label: 'Manufacturing & CNC', icon: '⚙️' },
                    { id: '🛡️', label: 'Quality & Safety', icon: '🛡️' },
                    { id: '⚡', label: 'Electrical & Power', icon: '⚡' },
                    { id: '📊', label: 'Operations & ERP', icon: '📊' },
                    { id: '📦', label: 'Warehouse & Store', icon: '📦' },
                    { id: '💼', label: 'Executive & Owner', icon: '💼' },
                    { id: '🔬', label: 'Metallurgy & Testing', icon: '🔬' }
                  ].map(item =>
                    h('button', {
                      key: item.id || 'initials',
                      type: 'button',
                      className: `avatar-preset-btn ${avatarIcon === item.id ? 'active' : ''}`,
                      title: item.label,
                      onClick: () => handleSelectAvatar(item.id, undefined)
                    }, item.icon)
                  )
                )
              ),

              h('div', null,
                h('label', { style: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' } }, '2. SELECT AVATAR GRADIENT THEME:'),
                h('div', { className: 'avatar-gradient-row' },
                  [
                    { name: 'Cobalt Indigo', grad: 'linear-gradient(135deg, #2563eb, #4f46e5)' },
                    { name: 'Emerald Plant', grad: 'linear-gradient(135deg, #059669, #10b981)' },
                    { name: 'Royal Violet', grad: 'linear-gradient(135deg, #7c3aed, #9333ea)' },
                    { name: 'Crimson Forge', grad: 'linear-gradient(135deg, #e11d48, #f43f5e)' },
                    { name: 'Amber Foundry', grad: 'linear-gradient(135deg, #d97706, #f59e0b)' },
                    { name: 'Steel Cyan', grad: 'linear-gradient(135deg, #0d9488, #14b8a6)' },
                    { name: 'Midnight Titanium', grad: 'linear-gradient(135deg, #334155, #0f172a)' }
                  ].map(g =>
                    h('div', {
                      key: g.name,
                      className: `avatar-gradient-swatch ${avatarGradient === g.grad ? 'active' : ''}`,
                      style: { background: g.grad },
                      title: g.name,
                      onClick: () => handleSelectAvatar(undefined, g.grad)
                    })
                  )
                )
              )
            ),

            // Operator Activity & Workspace Footprint Metrics
            h('div', { className: 'account-stats-grid' },
              h('div', { className: 'account-stat-pill' },
                h('div', { className: 'stat-label' }, 'Managed Workspaces'),
                h('div', { className: 'stat-value' }, `${userCompanies.length || 1} / 3`),
                h('div', { style: { fontSize: 11, color: 'var(--text-secondary)' } }, 'Active multi-tenancy')
              ),
              h('div', { className: 'account-stat-pill' },
                h('div', { className: 'stat-label' }, 'Catalog Products'),
                h('div', { className: 'stat-value' }, `${(inventory || []).filter(i => i.category !== 'Raw material').length}`),
                h('div', { style: { fontSize: 11, color: 'var(--text-secondary)' } }, 'Finished goods SKU')
              ),
              h('div', { className: 'account-stat-pill' },
                h('div', { className: 'stat-label' }, 'Raw Materials'),
                h('div', { className: 'stat-value' }, `${(inventory || []).filter(i => i.category === 'Raw material').length}`),
                h('div', { style: { fontSize: 11, color: 'var(--text-secondary)' } }, 'Inventory items')
              ),
              h('div', { className: 'account-stat-pill' },
                h('div', { className: 'stat-label' }, 'Production Batches'),
                h('div', { className: 'stat-value' }, `${(productionRuns || []).length}`),
                h('div', { style: { fontSize: 11, color: 'var(--text-secondary)' } }, 'Completed & in-progress')
              ),
              h('div', { className: 'account-stat-pill' },
                h('div', { className: 'stat-label' }, 'Invoices Issued'),
                h('div', { className: 'stat-value' }, `${(sales || []).length}`),
                h('div', { style: { fontSize: 11, color: 'var(--text-secondary)' } }, 'Sales ledger entries')
              )
            ),

            // Profile Form Card
            h('div', { className: 'card', style: { maxWidth: 780, padding: 24 } },
              h('div', { style: { marginBottom: 18, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 } },
                h('h3', { style: { margin: 0, fontSize: 15, color: 'var(--text-primary)' } }, 'Personal & Operator Details'),
                h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                  'Your profile details are stored securely and associated with your account across factory logs, invoices, and reports.'
                )
              ),
              h('form', { onSubmit: handleSaveProfile },
                h('div', { className: 'profile-details-grid', style: { marginBottom: 14 } },
                  h('div', { className: 'form-group' },
                    h('label', null, 'Full Name'),
                    h('input', {
                      className: 'form-input',
                      value: profileForm.name,
                      placeholder: 'Your full name',
                      onChange: e => setProfileForm({ ...profileForm, name: e.target.value })
                    })
                  ),
                  h('div', { className: 'form-group' },
                    h('label', null, 'Email Address (Registered)'),
                    h('input', {
                      className: 'form-input',
                      value: profileForm.email,
                      disabled: true,
                      style: { background: 'var(--bg-secondary)', cursor: 'not-allowed', opacity: 0.8 }
                    })
                  )
                ),

                h('div', { className: 'profile-details-grid', style: { marginBottom: 14 } },
                  h('div', { className: 'form-group' },
                    h('label', null, 'Phone / Mobile Number'),
                    h('input', {
                      className: 'form-input',
                      type: 'tel',
                      placeholder: '+91 98765 43210',
                      value: profileForm.phone,
                      onChange: e => setProfileForm({ ...profileForm, phone: e.target.value })
                    })
                  ),
                  h('div', { className: 'form-group' },
                    h('label', null, 'Job Designation / Role'),
                    h('select', {
                      className: 'form-input',
                      value: profileForm.role,
                      onChange: e => setProfileForm({ ...profileForm, role: e.target.value })
                    },
                      h('option', { value: 'Plant Manager' }, 'Plant Manager'),
                      h('option', { value: 'Production Supervisor' }, 'Production Supervisor'),
                      h('option', { value: 'Quality Auditor' }, 'Quality Auditor'),
                      h('option', { value: 'Inventory & Store Controller' }, 'Inventory & Store Controller'),
                      h('option', { value: 'Finance & Accounts Head' }, 'Finance & Accounts Head'),
                      h('option', { value: 'Managing Director / Owner' }, 'Managing Director / Owner'),
                      h('option', { value: 'Factory Technician' }, 'Factory Technician')
                    )
                  )
                ),

                h('div', { className: 'profile-details-grid', style: { marginBottom: 14 } },
                  h('div', { className: 'form-group' },
                    h('label', null, 'Department / Bay'),
                    h('select', {
                      className: 'form-input',
                      value: profileForm.department,
                      onChange: e => setProfileForm({ ...profileForm, department: e.target.value })
                    },
                      h('option', { value: 'Operations' }, 'Operations'),
                      h('option', { value: 'Production & Manufacturing' }, 'Production & Manufacturing'),
                      h('option', { value: 'Warehouse & Logistics' }, 'Warehouse & Logistics'),
                      h('option', { value: 'Quality Control' }, 'Quality Control'),
                      h('option', { value: 'Sales & Billing' }, 'Sales & Billing'),
                      h('option', { value: 'Management' }, 'Management')
                    )
                  ),
                  h('div', { className: 'form-group' },
                    h('label', null, 'Emergency Contact (Phone or Name)'),
                    h('input', {
                      className: 'form-input',
                      placeholder: 'e.g. +91 91234 56789 (Spouse / Family)',
                      value: profileForm.emergency_contact,
                      onChange: e => setProfileForm({ ...profileForm, emergency_contact: e.target.value })
                    })
                  )
                ),

                h('div', { className: 'form-group', style: { marginBottom: 20 } },
                  h('label', null, 'Professional Bio & Shift Notes'),
                  h('textarea', {
                    className: 'form-textarea',
                    rows: 3,
                    placeholder: 'Operational duties, shift timings (e.g. Day Shift 08:00 - 17:00), or special machine certifications...',
                    value: profileForm.bio,
                    onChange: e => setProfileForm({ ...profileForm, bio: e.target.value })
                  })
                ),

                h('button', {
                  type: 'submit',
                  className: 'btn btn-primary',
                  disabled: savingProfile,
                  style: { display: 'inline-flex', alignItems: 'center', gap: 8 }
                },
                  savingProfile ? 'Saving Details...' : '💾 Save Personal Profile'
                )
              )
            )
          ),

          // ----- SUB-TAB 2: SECURITY & ACCESS -----
          settingsTab === 'security' && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 } },
            // Active Session & Authentication Card
            h('div', { className: 'security-session-card' },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
                h('div', {
                  style: {
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22
                  }
                }, '💻'),
                h('div', null,
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                    h('strong', { style: { fontSize: 14.5, color: 'var(--text-primary)' } }, 'Current Browser Session'),
                    h('span', { className: 'badge badge-success', style: { fontSize: 11, padding: '2px 8px' } }, '🟢 Active Now')
                  ),
                  h('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 } },
                    `Authenticated as ${currentUser?.email || 'operator'} • HTTPS TLS 1.3 Encryption • Bearer Token Active`
                  )
                )
              ),
              h('button', {
                type: 'button',
                className: 'btn btn-outline',
                style: { fontSize: 12, padding: '6px 14px' },
                onClick: handleLogout
              }, 'Sign Out')
            ),

            // Change Password Card
            h('div', { className: 'card', style: { padding: 24 } },
              h('div', { style: { marginBottom: 18, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 } },
                h('h3', { style: { margin: 0, fontSize: 15, color: 'var(--text-primary)' } }, 'Update Account Password'),
                h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                  'Protect your manufacturing operations with a strong password of at least 6 characters.'
                )
              ),
              h('form', { onSubmit: handleChangePassword },
                h('div', { className: 'form-group', style: { marginBottom: 14 } },
                  h('label', null, 'Current Password'),
                  h('input', {
                    className: 'form-input',
                    type: 'password',
                    placeholder: 'Enter your current password',
                    value: passwordForm.currentPassword,
                    onChange: e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  })
                ),

                h('div', { className: 'form-group', style: { marginBottom: 14 } },
                  h('label', null, 'New Password'),
                  h('input', {
                    className: 'form-input',
                    type: 'password',
                    placeholder: 'Enter new password (min. 6 characters)',
                    value: passwordForm.newPassword,
                    onChange: e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }),
                  // Live Strength Indicator
                  (() => {
                    const str = getPasswordStrength(passwordForm.newPassword);
                    return passwordForm.newPassword ? h('div', { className: 'password-strength-container' },
                      h('div', { className: 'password-strength-bar' },
                        h('div', { className: 'password-strength-fill', style: { width: `${str.score}%`, backgroundColor: str.color } })
                      ),
                      h('div', { className: 'password-strength-label', style: { color: str.color } }, str.label)
                    ) : null;
                  })()
                ),

                h('div', { className: 'form-group', style: { marginBottom: 20 } },
                  h('label', null, 'Confirm New Password'),
                  h('input', {
                    className: 'form-input',
                    type: 'password',
                    placeholder: 'Confirm new password',
                    value: passwordForm.confirmPassword,
                    onChange: e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }),
                  passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && h(
                    'div',
                    { style: { fontSize: 11.5, color: '#ef4444', marginTop: 4 } },
                    '⚠️ Passwords do not match'
                  )
                ),

                h('button', {
                  type: 'submit',
                  className: 'btn btn-primary',
                  disabled: changingPassword,
                  style: { display: 'inline-flex', alignItems: 'center', gap: 8 }
                },
                  changingPassword ? 'Updating Password...' : '🔒 Update Password'
                )
              )
            ),

            // Tenant Isolation & Security Assurance
            h('div', { className: 'card', style: { padding: 20, background: 'var(--bg-secondary)' } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
                h('span', { style: { fontSize: 18 } }, '🛡️'),
                h('strong', { style: { fontSize: 14, color: 'var(--text-primary)' } }, 'Multi-Tenant Data Segregation Guarantee')
              ),
              h('div', { style: { fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 } },
                'ForgeLedger enforces strict workspace-level isolation on every database query. Your cost prices, raw material bills, customer invoices, and employee wages are partitioned by Company ID and protected against cross-tenant data leaks.'
              )
            )
          ),

          // ----- SUB-TAB 3: COMPANY WORKSPACE -----
          settingsTab === 'company' && h('div', null,
            // Active Company Banner
            h('div', { className: 'active-company-banner' },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
                h('div', { className: 'workspace-avatar', style: { width: 42, height: 42, fontSize: 17, background: 'var(--primary)', color: '#fff' } }, currentUser?.company?.name?.charAt(0) || 'C'),
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

            // Multi-Company Workspaces Roster
            h('div', { style: { marginBottom: 22 } },
              h('h3', { style: { fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 } }, 'Your Managed Workspaces (Max 3):'),
              h('div', { className: 'company-roster-grid' },
                userCompanies.map(c => {
                  const isActive = c.id === currentUser?.company_id;
                  return h('div', {
                    key: c.id,
                    className: `company-roster-card ${isActive ? 'active' : ''}`
                  },
                    h('div', null,
                      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
                        h('strong', { style: { fontSize: 14, color: 'var(--text-primary)' } }, c.name),
                        isActive
                          ? h('span', { className: 'badge badge-success', style: { fontSize: 10 } }, '✓ Active')
                          : h('span', { className: 'badge badge-outline', style: { fontSize: 10 } }, `ID #${c.id}`)
                      ),
                      h('div', { style: { fontSize: 12, color: 'var(--text-secondary)' } }, c.legal_name || c.name),
                      c.gst_no && h('div', { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4 } }, `GSTIN: ${c.gst_no}`)
                    ),
                    !isActive && h('button', {
                      type: 'button',
                      className: 'btn btn-outline',
                      style: { fontSize: 11, padding: '6px 10px', width: '100%' },
                      disabled: companyActionLoading,
                      onClick: () => handleSwitchCompany(c.id)
                    }, companyActionLoading ? 'Switching...' : 'Switch to this Workspace')
                  );
                }),
                userCompanies.length < 3 && h('div', {
                  className: 'company-roster-card add-card',
                  onClick: () => { setShowCompanyModal(true); setShowNewCompanyForm(true); setCompanyError(''); }
                },
                  h('div', { style: { fontSize: 24, marginBottom: 4 } }, '➕'),
                  h('strong', { style: { fontSize: 13, color: 'var(--primary)' } }, 'Register New Company'),
                  h('div', { style: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 } }, `${3 - userCompanies.length} workspace slot(s) available`)
                )
              )
            ),

            // Company Metadata Card
            h('div', { className: 'card', style: { maxWidth: 680, padding: 22 } },
              h('div', { style: { marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 } },
                h('h3', { style: { margin: 0, fontSize: 15, color: 'var(--text-primary)' } }, 'Active Workspace Legal & Tax Identity'),
                h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                  'Legal name, tax identification (GSTIN) and physical manufacturing address appearing on issued invoices.'
                )
              ),
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
                h('button', { type: 'submit', className: 'btn btn-primary' }, 'Save Company Settings')
              )
            )
          ),

          // ----- SUB-TAB 4: WORKSPACE CUSTOMIZATION -----
          settingsTab === 'customization' && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 840 } },
            // Card 1: Theme & Visual Appearance
            h('div', { className: 'card', style: { padding: 22 } },
              h('div', { style: { marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 } },
                h('h3', { style: { margin: 0, fontSize: 15, color: 'var(--text-primary)' } }, 'Visual Theme & Switching Animation'),
                h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                  'Toggle dark mode with physics-based spring animations, or personalize your workshop brand accent color.'
                )
              ),

              // Theme Mode Toggle
              h('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 12,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                  gap: 14
                }
              },
                h('div', { style: { minWidth: 220, flex: 1 } },
                  h('div', { style: { fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 } },
                    h('span', { style: { fontSize: 16 } }, darkMode ? '🌙' : '☀️'),
                    darkMode ? 'Dark Industrial Mode' : 'Light Shopfloor Mode'
                  ),
                  h('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 } },
                    'Silky smooth 450ms color-wave animation and rotating spring icon transition.'
                  )
                ),
                h('button', {
                  type: 'button',
                  className: `btn btn-primary theme-toggle-pill-btn ${themeSwitching ? 'switching' : ''}`,
                  onClick: toggleDarkMode
                },
                  h('span', { className: 'theme-icon', style: { fontSize: 15 } }, darkMode ? '☀️' : '🌙'),
                  h('span', null, darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')
                )
              ),

              // Brand Accent Color Swatches
              h('div', null,
                h('label', { style: { fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' } }, 'Brand Accent Palette'),
                h('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 } },
                  'Sets the primary color applied across buttons, active tab indicators, chart highlights, and focus rings.'
                ),
                h('div', { className: 'accent-palette-grid' },
                  Object.values(ACCENT_COLORS).map(accent => {
                    const isSelected = (customizations.accentColor || 'blue') === accent.id;
                    return h('div', {
                      key: accent.id,
                      className: `accent-swatch-card ${isSelected ? 'active' : ''}`,
                      onClick: () => handleSaveCustomizations({ accentColor: accent.id })
                    },
                      h('div', { className: 'accent-color-circle', style: { background: accent.primary } }),
                      h('div', { style: { flex: 1, minWidth: 0 } },
                        h('div', { style: { fontSize: 13, fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' } }, accent.name),
                        isSelected && h('div', { style: { fontSize: 11, color: accent.primary, fontWeight: 700, marginTop: 2 } }, '✓ Active')
                      )
                    );
                  })
                )
              )
            ),

            // Card 2: Density & Formatting Preferences
            h('div', { className: 'card', style: { padding: 22 } },
              h('div', { style: { marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 } },
                h('h3', { style: { margin: 0, fontSize: 15, color: 'var(--text-primary)' } }, 'Display Density & Number Formatting'),
                h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                  'Adjust layout spacing for dense shop-floor data tables and select your regional currency symbol.'
                )
              ),

              // Interface Density
              h('div', { style: { marginBottom: 18 } },
                h('label', { style: { fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' } }, 'Interface Display Density'),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 8 } },
                  [
                    { id: 'comfortable', label: 'Comfortable', desc: 'Standard balanced spacing for desktop and mobile' },
                    { id: 'compact', label: 'Compact Shop Floor', desc: 'Tighter padding and margins for maximum data visibility' }
                  ].map(d => {
                    const isSelected = (customizations.density || 'comfortable') === d.id;
                    return h('div', {
                      key: d.id,
                      className: `accent-swatch-card ${isSelected ? 'active' : ''}`,
                      style: { flexDirection: 'column', alignItems: 'flex-start', padding: 12 },
                      onClick: () => handleSaveCustomizations({ density: d.id })
                    },
                      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4 } },
                        h('strong', { style: { fontSize: 13, color: 'var(--text-primary)' } }, d.label),
                        isSelected ? h('span', { className: 'badge badge-primary', style: { fontSize: 10 } }, '✓ Active') : null
                      ),
                      h('div', { style: { fontSize: 11.5, color: 'var(--text-secondary)' } }, d.desc)
                    );
                  })
                )
              ),

              // Currency Symbol Selector & Table Striping
              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 16 } },
                h('div', { className: 'form-group' },
                  h('label', { style: { fontWeight: 600, fontSize: 13 } }, 'Global Currency Symbol'),
                  h('select', {
                    className: 'form-input',
                    value: customizations.currency || '₹',
                    onChange: e => handleSaveCustomizations({ currency: e.target.value })
                  },
                    h('option', { value: '₹' }, '₹ (INR - Indian Rupee)'),
                    h('option', { value: '$' }, '$ (USD - US Dollar)'),
                    h('option', { value: '€' }, '€ (EUR - Euro)'),
                    h('option', { value: '£' }, '£ (GBP - British Pound)'),
                    h('option', { value: 'د.إ' }, 'د.إ (AED - UAE Dirham)')
                  ),
                  h('div', { style: { fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 } },
                    `Example: ${formatCurrency(125000)}`
                  )
                ),

                h('div', { className: 'form-group' },
                  h('label', { style: { fontWeight: 600, fontSize: 13 } }, 'Table Row Zebra Striping'),
                  h('label', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' } },
                    h('input', {
                      type: 'checkbox',
                      checked: !!customizations.tableStriped,
                      onChange: e => handleSaveCustomizations({ tableStriped: e.target.checked }),
                      style: { width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }
                    }),
                    h('span', null, 'Enable alternating zebra striped rows on inventory and invoice tables')
                  )
                )
              )
            ),

            // Card 3: Manufacturing & Invoicing Defaults
            h('div', { className: 'card', style: { padding: 22 } },
              h('div', { style: { marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 } },
                h('h3', { style: { margin: 0, fontSize: 15, color: 'var(--text-primary)' } }, 'Factory Operations & Invoicing Defaults'),
                h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                  'Pre-fill operational parameters to save time when generating invoices and monitoring inventory stock.'
                )
              ),

              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 } },
                h('div', { className: 'form-group' },
                  h('label', null, 'Default GST Tax Rate'),
                  h('select', {
                    className: 'form-input',
                    value: customizations.defaultGst !== undefined ? customizations.defaultGst : 18,
                    onChange: e => handleSaveCustomizations({ defaultGst: Number(e.target.value) })
                  },
                    h('option', { value: 0 }, '0% (Exempt)'),
                    h('option', { value: 5 }, '5% (Essential Goods)'),
                    h('option', { value: 12 }, '12% (Standard Lower)'),
                    h('option', { value: 18 }, '18% (Standard Manufacturing)'),
                    h('option', { value: 28 }, '28% (Special / High Tier)')
                  )
                ),

                h('div', { className: 'form-group' },
                  h('label', null, 'Default Invoice Payment Due Terms'),
                  h('select', {
                    className: 'form-input',
                    value: customizations.defaultDueDays !== undefined ? customizations.defaultDueDays : 7,
                    onChange: e => handleSaveCustomizations({ defaultDueDays: Number(e.target.value) })
                  },
                    h('option', { value: 0 }, 'Due on Receipt (Immediate)'),
                    h('option', { value: 7 }, 'Net 7 Days'),
                    h('option', { value: 15 }, 'Net 15 Days'),
                    h('option', { value: 30 }, 'Net 30 Days'),
                    h('option', { value: 60 }, 'Net 60 Days')
                  )
                )
              ),

              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 } },
                h('div', { className: 'form-group' },
                  h('label', null, 'Low Stock Warning Threshold (Units)'),
                  h('input', {
                    className: 'form-input',
                    type: 'number',
                    min: 1,
                    max: 1000,
                    value: customizations.lowStockThreshold !== undefined ? customizations.lowStockThreshold : 5,
                    onChange: e => handleSaveCustomizations({ lowStockThreshold: Number(e.target.value) })
                  }),
                  h('div', { style: { fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 } },
                    'Items below this quantity trigger red warning badges in inventory.'
                  )
                ),

                h('div', { className: 'form-group' },
                  h('label', null, 'Sales Invoice Number Prefix'),
                  h('input', {
                    className: 'form-input',
                    value: customizations.invoicePrefix || 'INV-',
                    placeholder: 'INV-',
                    onChange: e => handleSaveCustomizations({ invoicePrefix: e.target.value })
                  }),
                  h('div', { style: { fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 } },
                    'e.g. INV-1001 or FL-1001'
                  )
                )
              ),

              h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border-light)', paddingTop: 14, flexWrap: 'wrap' } },
                h('button', {
                  type: 'button',
                  className: 'btn btn-primary',
                  disabled: savingCustomizations,
                  onClick: () => handleSaveCustomizations()
                }, savingCustomizations ? 'Saving...' : '💾 Save Customizations'),
                h('button', {
                  type: 'button',
                  className: 'btn btn-outline',
                  onClick: () => {
                    const defaults = {
                      accentColor: 'blue',
                      density: 'comfortable',
                      currency: '₹',
                      tableStriped: false,
                      defaultGst: 18,
                      defaultDueDays: 7,
                      lowStockThreshold: 5,
                      invoicePrefix: 'INV-'
                    };
                    handleSaveCustomizations(defaults);
                    addToast('Reset to factory default customizations', 'info');
                  }
                }, '↺ Reset to Defaults')
              )
            )
          ),

          // ----- SUB-TAB 5: DATA & BACKUP -----
          settingsTab === 'backup' && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 840 } },
            // Backup Export Card
            h('div', { className: 'card', style: { padding: 24 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 } },
                h('div', {
                  style: {
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }
                }, '💾'),
                h('div', null,
                  h('h3', { style: { margin: 0, fontSize: 16, color: 'var(--text-primary)' } }, 'Full Factory & Financial Data Archive (JSON)'),
                  h('p', { style: { margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' } },
                    'Download an unencrypted, portable snapshot of all products, stock levels, production history, sales, and expenses.'
                  )
                )
              ),

              // Dataset Breakdown Cards
              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 } },
                h('div', { style: { padding: 12, background: 'var(--bg-secondary)', borderRadius: 9, border: '1px solid var(--border-light)' } },
                  h('div', { style: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 } }, 'FINISHED GOODS'),
                  h('strong', { style: { fontSize: 16, color: 'var(--text-primary)' } }, `${(inventory || []).filter(i => i.category !== 'Raw material').length} items`)
                ),
                h('div', { style: { padding: 12, background: 'var(--bg-secondary)', borderRadius: 9, border: '1px solid var(--border-light)' } },
                  h('div', { style: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 } }, 'RAW MATERIALS'),
                  h('strong', { style: { fontSize: 16, color: 'var(--text-primary)' } }, `${(inventory || []).filter(i => i.category === 'Raw material').length} items`)
                ),
                h('div', { style: { padding: 12, background: 'var(--bg-secondary)', borderRadius: 9, border: '1px solid var(--border-light)' } },
                  h('div', { style: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 } }, 'PRODUCTION BATCHES'),
                  h('strong', { style: { fontSize: 16, color: 'var(--text-primary)' } }, `${(productionRuns || []).length} runs`)
                ),
                h('div', { style: { padding: 12, background: 'var(--bg-secondary)', borderRadius: 9, border: '1px solid var(--border-light)' } },
                  h('div', { style: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 } }, 'SALES INVOICES'),
                  h('strong', { style: { fontSize: 16, color: 'var(--text-primary)' } }, `${(sales || []).length} invoices`)
                ),
                h('div', { style: { padding: 12, background: 'var(--bg-secondary)', borderRadius: 9, border: '1px solid var(--border-light)' } },
                  h('div', { style: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 } }, 'EXPENSES & EMPLOYEES'),
                  h('strong', { style: { fontSize: 16, color: 'var(--text-primary)' } }, `${(expenses || []).length + (employees || []).length} entries`)
                )
              ),

              h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' } },
                h('button', {
                  type: 'button',
                  className: 'btn btn-primary',
                  disabled: exportingBackup,
                  style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13.5 },
                  onClick: handleExportBackup
                },
                  h('span', null, '📥'),
                  h('span', null, exportingBackup ? 'Generating Archive...' : 'Download JSON Workspace Backup')
                ),
                h('div', { style: { fontSize: 12, color: 'var(--text-secondary)' } },
                  'Generated on-the-fly directly from production MySQL storage.'
                )
              )
            ),

            // Data Sovereignty & Portability Note
            h('div', { className: 'card', style: { padding: 20, background: 'var(--bg-secondary)' } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
                h('span', { style: { fontSize: 18 } }, '🔒'),
                h('strong', { style: { fontSize: 14, color: 'var(--text-primary)' } }, '100% Data Sovereignty & Open Format')
              ),
              h('div', { style: { fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 } },
                'You maintain total ownership of all business transactions, stock valuation, and operator data. Backups conform to standard JSON schema and can be archived for audit compliance or imported into external ERP systems with zero platform lock-in.'
              )
            )
          ),

          // ----- SUB-TAB 6: TEAM COLLABORATION & RBAC ROLES -----
          settingsTab === 'team' && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980 } },
            // Role Governance & Assignment Policy Card
            h('div', { className: 'card', style: { padding: 22 } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } },
                h('div', null,
                  h('h3', { className: 'card-title', style: { margin: 0, display: 'flex', alignItems: 'center', gap: 8 } },
                    h('span', null, '🛡️'),
                    'Role Governance & Assignment Policy'
                  ),
                  h('p', { className: 'card-subtitle', style: { margin: 0, marginTop: 4 } },
                    'Control whether roles are strictly assigned by Workspace Admins or open for staff testing.'
                  )
                ),
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                  h('button', {
                    type: 'button',
                    className: 'btn btn-primary',
                    style: { fontSize: 12, padding: '7px 14px' },
                    onClick: () => setShowAssignRoleModal(true)
                  }, '➕ Add / Assign Role'),
                  h('label', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      background: adminOnlyRoles ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      border: `1px solid ${adminOnlyRoles ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: adminOnlyRoles ? '#10b981' : '#f59e0b'
                    }
                  },
                    h('input', {
                      type: 'checkbox',
                      checked: adminOnlyRoles,
                      onChange: e => handleToggleAdminOnlyRoles(e.target.checked),
                      style: { cursor: 'pointer' }
                    }),
                    adminOnlyRoles ? '🛡️ Admin-Only Role Assignment (Enforced)' : '🔓 Open Role Simulation (Demo Mode)'
                  )
                )
              ),
              h('div', { style: { marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 } },
                adminOnlyRoles ?
                  '✓ Role changes are locked to Workspace Admins. Non-admin staff and factory personnel cannot switch or escalate roles; they only execute the permissions assigned in the roster.' :
                  '⚠️ Open Demonstration Mode: Any logged-in coworker can switch roles using the topbar dropdown to preview the user interface for different job titles.'
              )
            ),

            // Interactive Role Simulator Card
            h('div', { className: 'card', style: { padding: 22 } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
                h('div', null,
                  h('h3', { className: 'card-title', style: { margin: 0 } }, '🎭 Interactive Role Simulator (Admin Preview)'),
                  h('p', { className: 'card-subtitle', style: { margin: 0, marginTop: 4 } },
                    canChangeRole ?
                      'Experience ForgeLedger through the perspective of different plant personnel. Switch views instantly to test access restrictions.' :
                      'Role simulation is locked to Workspace Admins. Your active role is managed by your organization administrator.'
                  )
                ),
                simulatedRole && canChangeRole && h('button', {
                  className: 'btn btn-outline',
                  style: { fontSize: 11.5, padding: '4px 10px' },
                  onClick: () => handleSwitchSimulatedRole(null)
                }, '👑 Reset to Owner View')
              ),

              canChangeRole ?
                h('div', { className: 'team-roles-sim-grid' },
                  Object.values(ROLE_CONFIGS).map(rc => {
                    const isActive = effectiveRole === rc.key;
                    return h('div', {
                      key: rc.key,
                      className: `role-card-item ${isActive ? 'active-sim' : ''}`
                    },
                      h('div', null,
                        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
                          h('span', { style: { fontSize: 24 } }, rc.icon),
                          h('span', { className: `role-badge ${rc.badgeClass}` }, rc.key)
                        ),
                        h('h4', { style: { fontSize: 14, fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' } }, rc.name),
                        h('p', { style: { fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45, margin: 0, minHeight: 48 } }, rc.summary)
                      ),
                      h('div', { style: { marginTop: 14 } },
                        h('button', {
                          type: 'button',
                          className: `btn ${isActive ? 'btn-primary' : 'btn-outline'}`,
                          style: { width: '100%', padding: '6px 10px', fontSize: 11.5, fontWeight: 700 },
                          onClick: () => handleSwitchSimulatedRole(rc.key)
                        }, isActive ? '✓ Active View' : `Simulate ${rc.name.split(' ')[0]}`)
                      )
                    );
                  })
                ) :
                h('div', { className: 'alert alert-info', style: { margin: 0 } },
                  `🔒 Role simulation is restricted. Your account is currently assigned to ${roleConfig.icon} ${roleConfig.name} by your Workspace Admin.`
                )
            ),

            // Team Roster Table
            h('div', { className: 'card', style: { padding: 22 } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 } },
                h('div', null,
                  h('h3', { className: 'card-title', style: { margin: 0 } }, '👥 Workshop Team Roster'),
                  h('p', { className: 'card-subtitle', style: { margin: 0, marginTop: 4 } },
                    'Manage authorized coworkers, factory operators, and assign role-based permissions.'
                  )
                ),
                h('div', { style: { display: 'flex', gap: 8 } },
                  h('button', {
                    type: 'button',
                    className: 'btn btn-outline',
                    onClick: () => setShowAssignRoleModal(true)
                  }, '➕ Add / Assign Role'),
                  h('button', {
                    className: 'btn btn-primary',
                    onClick: () => setShowInviteModal(true)
                  }, '+ Invite Team Member')
                )
              ),

              teamLoading ?
                h('div', { style: { padding: 24, textAlign: 'center', color: 'var(--text-muted)' } }, 'Loading workshop roster...') :
                h('div', { className: 'table-responsive' },
                  h('table', { className: 'custom-table' },
                    h('thead', null,
                      h('tr', null,
                        h('th', null, 'TEAM MEMBER'),
                        h('th', null, 'DEPARTMENT'),
                        h('th', null, 'ASSIGNED ROLE'),
                        h('th', null, 'STATUS'),
                        h('th', { style: { textAlign: 'right' } }, 'ACTIONS')
                      )
                    ),
                    h('tbody', null,
                      teamMembers.map(m => {
                        const mRoleKey = normalizeRole(m.role);
                        const mRoleCfg = ROLE_CONFIGS[mRoleKey] || ROLE_CONFIGS.operator;
                        const initial = (m.name || 'U').charAt(0).toUpperCase();

                        return h('tr', { key: m.id },
                          h('td', null,
                            h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                              h('div', {
                                style: {
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  background: m.picture?.startsWith('gradient:') ?
                                    'linear-gradient(135deg, #3b82f6, #8b5cf6)' :
                                    'linear-gradient(135deg, #2563eb, #38bdf8)',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: 13
                                }
                              }, initial),
                              h('div', null,
                                h('div', { style: { fontWeight: 700 } },
                                  m.name,
                                  m.is_owner && h('span', { style: { fontSize: 10, color: '#f59e0b', marginLeft: 6, fontWeight: 700 } }, '👑 PRIMARY OWNER')
                                ),
                                h('div', { style: { fontSize: 11, color: 'var(--text-muted)' } }, m.email)
                              )
                            )
                          ),
                          h('td', { style: { color: 'var(--text-muted)' } }, m.department || 'Operations'),
                          h('td', null,
                            m.is_owner ?
                              h('span', { className: `role-badge ${mRoleCfg.badgeClass}` }, `${mRoleCfg.icon} ${mRoleCfg.name}`) :
                              h('select', {
                                className: 'form-input',
                                style: { padding: '3px 8px', fontSize: 11.5, height: 'auto', width: 'auto' },
                                value: mRoleKey,
                                onChange: e => handleUpdateMemberRole(m.id, e.target.value)
                              },
                                Object.values(ROLE_CONFIGS).map(rc =>
                                  h('option', { key: rc.key, value: rc.key }, `${rc.icon} ${rc.name}`)
                                )
                              )
                          ),
                          h('td', null,
                            h('span', { className: 'badge badge-success' }, m.status || 'Active')
                          ),
                          h('td', { style: { textAlign: 'right' } },
                            !m.is_owner && h('button', {
                              className: 'btn btn-danger-outline',
                              style: { padding: '4px 8px' },
                              onClick: () => handleRemoveMember(m.id),
                              title: 'Remove colleague from workspace'
                            }, h(Icon, { name: 'trash', size: 13 }))
                          )
                        );
                      })
                    )
                  )
                )
            )
          )
        )
      )
    )
  ),

    // ================= MODALS =================
    modalType === 'item' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('div', null,
            h('h3', { style: { margin: 0, fontSize: 16 } }, formData.id ? 'Edit Finished Product' : 'Add Finished Product'),
            h('div', { style: { fontSize: 12, color: '#64748b', marginTop: 2 } }, 'Completed product manufactured for sale & order fulfillment')
          ),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateItem },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Product Name'),
              h('input', { className: 'form-input', defaultValue: formData.item_name || '', placeholder: 'e.g. Assembly bracket', required: true, onChange: e => setFormData({ ...formData, item_name: e.target.value }) })
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'SKU (Stock Keeping Unit)'),
                h('input', { className: 'form-input', defaultValue: formData.sku || '', placeholder: 'e.g. FG-BRK-001', onChange: e => setFormData({ ...formData, sku: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Category'),
                h('select', { className: 'form-select', defaultValue: formData.category || 'Finished good', onChange: e => setFormData({ ...formData, category: e.target.value }) },
                  h('option', { value: 'Finished good' }, 'Finished good (Sellable product)'),
                  h('option', { value: 'Raw material' }, 'Raw material (Factory input)'),
                  h('option', { value: 'General' }, 'General')
                )
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Units In Stock'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', defaultValue: formData.quantity || '', placeholder: '0.00', required: true, onChange: e => setFormData({ ...formData, quantity: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Unit of Measure'),
                h('input', { className: 'form-input', defaultValue: formData.unit || 'units', placeholder: 'e.g. units, pcs, sets', onChange: e => setFormData({ ...formData, unit: e.target.value }) })
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Production Cost per Unit (₹)'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', defaultValue: formData.unit_cost || '', placeholder: '0.00', onChange: e => setFormData({ ...formData, unit_cost: e.target.value }) })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Low Stock Alert Level'),
                h('input', { className: 'form-input', type: 'number', step: '0.01', defaultValue: formData.reorder_level || '10', placeholder: '10.00', onChange: e => setFormData({ ...formData, reorder_level: e.target.value }) })
              )
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, formData.id ? 'Update Product' : 'Save Finished Product')
          )
        )
      )
    ),

    modalType === 'sale' && (() => {
      const items = (formData.items && Array.isArray(formData.items) && formData.items.length > 0) ?
        formData.items :
        [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, line_total: 0 }];

      const updateLine = (idx, key, val) => {
        const next = [...items];
        const line = { ...next[idx], [key]: val };
        if (key === 'product_id') {
          const sel = finishedGoods.find(g => String(g.id) === String(val));
          if (sel) {
            line.product_name = sel.item_name || sel.name;
            const price = Number(sel.unit_price) || Number(sel.unit_cost) * 1.3 || 1000;
            line.unit_price = price;
            line.line_total = Math.round((Number(line.quantity) || 1) * price * 100) / 100;
          }
        } else if (key === 'quantity' || key === 'unit_price') {
          const q = key === 'quantity' ? (Number(val) || 0) : (Number(line.quantity) || 0);
          const p = key === 'unit_price' ? (Number(val) || 0) : (Number(line.unit_price) || 0);
          line.line_total = Math.round(q * p * 100) / 100;
        }
        next[idx] = line;
        const sub = next.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0);
        const gst = Math.round(sub * 0.18 * 100) / 100;
        const grand = Math.round((sub + gst) * 100) / 100;
        setFormData({ ...formData, items: next, amount: grand.toFixed(2) });
      };

      const addLine = () => {
        const next = [...items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, line_total: 0 }];
        setFormData({ ...formData, items: next });
      };

      const removeLine = (idx) => {
        if (items.length <= 1) {
          addToast('Sale invoice must contain at least one product line', 'warning');
          return;
        }
        const next = items.filter((_, i) => i !== idx);
        const sub = next.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0);
        const gst = Math.round(sub * 0.18 * 100) / 100;
        const grand = Math.round((sub + gst) * 100) / 100;
        setFormData({ ...formData, items: next, amount: grand.toFixed(2) });
      };

      const subtotal = items.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0);
      const cgst = Math.round(subtotal * 0.09 * 100) / 100;
      const sgst = Math.round(subtotal * 0.09 * 100) / 100;
      const totalGst = Math.round((cgst + sgst) * 100) / 100;
      const grandTotal = Math.round((subtotal + totalGst) * 100) / 100;

      return h('div', { className: 'modal-overlay' },
        h('div', { className: 'modal-card', style: { maxWidth: 740, width: '95%', maxHeight: '92vh', overflowY: 'auto' } },
          h('div', { className: 'modal-header' },
            h('div', null,
              h('h3', { style: { margin: 0 } }, formData.id ? 'Edit Sales Invoice' : 'New Multi-Item Sales Invoice'),
              h('div', { style: { fontSize: 12, color: '#64748b' } }, 'Build itemized invoices with GST calculation & automatic stock decrement')
            ),
            h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
          ),
          h('form', { onSubmit: handleCreateSale },
            h('div', { className: 'modal-body', style: { padding: '18px 22px' } },
              // Customer & Invoice Details
              h('div', { style: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 14 } },
                h('div', { className: 'form-group' },
                  h('label', null, 'Customer / Buyer Name'),
                  h('input', {
                    className: 'form-input',
                    placeholder: 'e.g. Apex Industrial Corp',
                    required: true,
                    value: formData.customer || '',
                    onChange: e => setFormData({ ...formData, customer: e.target.value })
                  })
                ),
                h('div', { className: 'form-group' },
                  h('label', null, 'Invoice Number'),
                  h('input', {
                    className: 'form-input',
                    placeholder: 'e.g. INV-1049',
                    value: formData.invoice_no || '',
                    onChange: e => setFormData({ ...formData, invoice_no: e.target.value })
                  })
                )
              ),
              h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 } },
                h('div', { className: 'form-group' },
                  h('label', null, 'Issued Date'),
                  h('input', {
                    className: 'form-input',
                    type: 'date',
                    value: formData.issued_date || new Date().toISOString().split('T')[0],
                    onChange: e => setFormData({ ...formData, issued_date: e.target.value })
                  })
                ),
                h('div', { className: 'form-group' },
                  h('label', null, 'Due Date'),
                  h('input', {
                    className: 'form-input',
                    type: 'date',
                    value: formData.due_date || '',
                    onChange: e => setFormData({ ...formData, due_date: e.target.value })
                  })
                ),
                h('div', { className: 'form-group' },
                  h('label', null, 'Payment Status'),
                  h('select', {
                    className: 'form-select',
                    value: formData.status || 'Pending',
                    onChange: e => setFormData({ ...formData, status: e.target.value })
                  },
                    h('option', { value: 'Pending' }, 'Pending'),
                    h('option', { value: 'Paid' }, 'Paid (Auto-decrements stock)'),
                    h('option', { value: 'Overdue' }, 'Overdue')
                  )
                )
              ),

              // Multi-Item Invoice Table
              h('div', { style: { border: '1px solid var(--border-light)', borderRadius: 8, padding: 12, background: 'var(--bg-secondary)', marginBottom: 14 } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
                  h('span', { style: { fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' } }, 'Line Items (Finished Goods)'),
                  h('button', {
                    type: 'button',
                    className: 'btn btn-outline',
                    style: { padding: '4px 10px', fontSize: 11.5 },
                    onClick: addLine
                  }, '+ Add Line Item')
                ),
                h('div', { className: 'table-responsive' },
                  h('table', { style: { width: '100%', fontSize: 12, borderCollapse: 'collapse' } },
                    h('thead', null,
                      h('tr', { style: { borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' } },
                        h('th', { style: { padding: '6px 8px' } }, 'Product / Finished Good'),
                        h('th', { style: { padding: '6px 8px', width: 85 } }, 'Qty'),
                        h('th', { style: { padding: '6px 8px', width: 115 } }, 'Unit Rate (₹)'),
                        h('th', { style: { padding: '6px 8px', width: 115, textAlign: 'right' } }, 'Total (₹)'),
                        h('th', { style: { padding: '6px 8px', width: 36, textAlign: 'center' } }, '')
                      )
                    ),
                    h('tbody', null,
                      items.map((line, idx) =>
                        h('tr', { key: idx, style: { borderBottom: '1px solid var(--border-light)' } },
                          h('td', { style: { padding: '6px 8px' } },
                            h('select', {
                              className: 'form-select',
                              style: { fontSize: 12, padding: '4px 8px' },
                              value: line.product_id || '',
                              onChange: e => updateLine(idx, 'product_id', e.target.value)
                            },
                              h('option', { value: '' }, '-- Select finished good --'),
                              finishedGoods.map(g =>
                                h('option', { key: g.id, value: g.id }, `${g.item_name || g.name} (Stock: ${g.quantity || 0}, ₹${g.unit_price || g.unit_cost || 0})`)
                              )
                            )
                          ),
                          h('td', { style: { padding: '6px 8px' } },
                            h('input', {
                              type: 'number',
                              min: '1',
                              className: 'form-input',
                              style: { fontSize: 12, padding: '4px 8px' },
                              value: line.quantity || 1,
                              onChange: e => updateLine(idx, 'quantity', e.target.value)
                            })
                          ),
                          h('td', { style: { padding: '6px 8px' } },
                            h('input', {
                              type: 'number',
                              step: '0.01',
                              className: 'form-input',
                              style: { fontSize: 12, padding: '4px 8px' },
                              value: line.unit_price || '',
                              onChange: e => updateLine(idx, 'unit_price', e.target.value)
                            })
                          ),
                          h('td', { style: { padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' } },
                            formatCurrency(line.line_total || 0)
                          ),
                          h('td', { style: { padding: '6px 8px', textAlign: 'center' } },
                            items.length > 1 && h('button', {
                              type: 'button',
                              style: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 },
                              onClick: () => removeLine(idx),
                              title: 'Remove item'
                            }, '✕')
                          )
                        )
                      )
                    )
                  )
                )
              ),

              // Tax & Grand Total Breakdown
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-light)' } },
                h('div', { style: { maxWidth: '50%' } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 12, fontWeight: 600 } },
                    h(Icon, { name: 'checkCircle', size: 14 }),
                    'Stock Decrement on Payment'
                  ),
                  h('div', { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4 } },
                    'When status is set to "Paid", ForgeLedger automatically decrements finished goods stock for each product line in this sale.'
                  )
                ),
                h('div', { style: { width: '42%', textAlign: 'right', fontSize: 12 } },
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
                    h('span', { style: { color: 'var(--text-muted)' } }, 'Subtotal:'),
                    h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 600 } }, formatCurrency(subtotal))
                  ),
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
                    h('span', { style: { color: 'var(--text-muted)' } }, 'CGST (9%):'),
                    h('span', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(cgst))
                  ),
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
                    h('span', { style: { color: 'var(--text-muted)' } }, 'SGST (9%):'),
                    h('span', { style: { fontFamily: 'var(--font-mono)' } }, formatCurrency(sgst))
                  ),
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, borderBottom: '1px solid var(--border-light)', paddingBottom: 4 } },
                    h('span', { style: { color: 'var(--text-muted)' } }, 'Total GST (18%):'),
                    h('span', { style: { fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' } }, formatCurrency(totalGst))
                  ),
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 } },
                    h('span', null, 'Grand Total:'),
                    h('span', { style: { color: '#2563eb', fontFamily: 'var(--font-mono)' } }, formatCurrency(grandTotal))
                  )
                )
              )
            ),
            h('div', { className: 'modal-footer' },
              h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
              h('button', { type: 'submit', className: 'btn btn-primary' }, formData.id ? 'Update Invoice' : 'Save Multi-Item Invoice')
            )
          )
        )
      );
    })(),

    modalType === 'expense' && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-card' },
        h('div', { className: 'modal-header' },
          h('h3', null, formData.id ? 'Edit Business Expense' : 'Record Business Expense'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateExpense },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Expense Description'),
              h('input', {
                className: 'form-input',
                placeholder: 'e.g. Factory electricity bill',
                required: true,
                value: formData.description || '',
                onChange: e => setFormData({ ...formData, description: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Category'),
              h('select', {
                className: 'form-select',
                value: formData.category || 'Utilities',
                onChange: e => setFormData({ ...formData, category: e.target.value })
              },
                h('option', { value: 'Utilities' }, 'Utilities'),
                h('option', { value: 'Materials' }, 'Materials'),
                h('option', { value: 'Maintenance' }, 'Maintenance'),
                h('option', { value: 'General' }, 'General')
              )
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              h('div', { className: 'form-group' },
                h('label', null, 'Amount (₹)'),
                h('input', {
                  className: 'form-input',
                  type: 'number',
                  step: '0.01',
                  placeholder: '0.00',
                  required: true,
                  value: formData.amount || '',
                  onChange: e => setFormData({ ...formData, amount: e.target.value })
                })
              ),
              h('div', { className: 'form-group' },
                h('label', null, 'Payment Method'),
                h('select', {
                  className: 'form-select',
                  value: formData.payment_method || 'Bank transfer',
                  onChange: e => setFormData({ ...formData, payment_method: e.target.value })
                },
                  h('option', { value: 'Bank transfer' }, 'Bank transfer'),
                  h('option', { value: 'UPI' }, 'UPI'),
                  h('option', { value: 'Cash' }, 'Cash'),
                  h('option', { value: 'Cheque' }, 'Cheque')
                )
              )
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Expense Date'),
              h('input', {
                className: 'form-input',
                type: 'date',
                value: formData.expense_date || new Date().toISOString().split('T')[0],
                onChange: e => setFormData({ ...formData, expense_date: e.target.value })
              })
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, formData.id ? 'Update Expense' : 'Save Expense')
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
              h('input', {
                className: 'form-input',
                placeholder: 'e.g. Precision Assembly bracket',
                required: true,
                value: formData.product || '',
                onChange: e => setFormData({ ...formData, product: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Planned Output Quantity (Units)'),
              h('input', {
                className: 'form-input',
                type: 'number',
                step: '1',
                placeholder: '100',
                required: true,
                value: formData.quantity || '',
                onChange: e => setFormData({ ...formData, quantity: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Run Date'),
              h('input', {
                className: 'form-input',
                type: 'date',
                value: formData.run_date || new Date().toISOString().split('T')[0],
                onChange: e => setFormData({ ...formData, run_date: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Status'),
              h('select', {
                className: 'form-select',
                value: formData.status || 'Planned',
                onChange: e => setFormData({ ...formData, status: e.target.value })
              },
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
          h('h3', null, formData.id ? 'Edit Employee Details' : 'Add Employee'),
          h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
        ),
        h('form', { onSubmit: handleCreateEmployee },
          h('div', { className: 'modal-body' },
            h('div', { className: 'form-group' },
              h('label', null, 'Employee Name'),
              h('input', {
                className: 'form-input',
                placeholder: 'e.g. Suresh K',
                required: true,
                value: formData.name || '',
                onChange: e => setFormData({ ...formData, name: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Role / Position'),
              h('input', {
                className: 'form-input',
                placeholder: 'e.g. Production Operator',
                required: true,
                value: formData.role || '',
                onChange: e => setFormData({ ...formData, role: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Monthly Salary (₹)'),
              h('input', {
                className: 'form-input',
                type: 'number',
                step: '0.01',
                placeholder: '0.00',
                required: true,
                value: formData.monthly_salary || '',
                onChange: e => setFormData({ ...formData, monthly_salary: e.target.value })
              })
            ),
            h('div', { className: 'form-group' },
              h('label', null, 'Status'),
              h('select', {
                className: 'form-select',
                value: formData.status || 'Active',
                onChange: e => setFormData({ ...formData, status: e.target.value })
              },
                h('option', { value: 'Active' }, 'Active'),
                h('option', { value: 'Inactive' }, 'Inactive')
              )
            )
          ),
          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Cancel'),
            h('button', { type: 'submit', className: 'btn btn-primary' }, formData.id ? 'Update Employee' : 'Save Employee')
          )
        )
      )
    ),

    // ================= MODAL: TAX INVOICE PREVIEW & PRINT (Fig. B) =================
    modalType === 'invoicePreview' && selectedInvoice && h('div', {
      className: 'modal-overlay',
      onClick: (e) => { if (e.target === e.currentTarget) setModalType(null); }
    },
      h('div', { className: 'modal-card', style: { maxWidth: 840, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 0 } },
        // Header for screen viewing
        h('div', { className: 'modal-header no-print', style: { padding: '16px 24px', borderBottom: '1px solid var(--border-light)' } },
          h('div', null,
            h('h3', { style: { margin: 0, fontSize: 16 } }, `Tax Invoice: ${selectedInvoice.invoice_no || ('INV-' + selectedInvoice.id)}`),
            h('div', { style: { fontSize: 12, color: '#64748b' } }, 'Printable GST compliant tax invoice')
          ),
          h('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
            h('button', {
              className: 'btn btn-primary',
              style: { padding: '6px 14px', fontSize: 13 },
              onClick: () => window.print()
            }, h(Icon, { name: 'download', size: 14 }), 'Download PDF / Print'),
            h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
          )
        ),
        // Printable Invoice Document Body
        h('div', { className: 'printable-invoice', style: { padding: '36px 40px', background: '#fff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' } },
          // Company Letterhead & Document Title
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: 20, marginBottom: 24 } },
            h('div', { style: { display: 'flex', gap: 14, alignItems: 'center' } },
              h('img', {
                src: '/logo.png',
                alt: 'ForgeLedger Logo',
                style: { width: 48, height: 48, borderRadius: 10, objectFit: 'contain' }
              }),
              h('div', null,
                h('h2', { style: { margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' } }, companySettings?.name || currentUser?.company_name || 'ForgeLedger Industrial Corp'),
                h('div', { style: { fontSize: 12, color: '#475569', marginTop: 2 } }, companySettings?.legal_name || 'Manufacturing & Industrial Solutions'),
                h('div', { style: { fontSize: 11, color: '#64748b', marginTop: 2 } }, companySettings?.address || 'Plot 42, Peenya Industrial Area, Phase II, Bengaluru, Karnataka - 560058'),
                h('div', { style: { fontSize: 11, color: '#64748b' } }, `GSTIN: ${companySettings?.gst_no || '29AABCF1234F1Z5'} | CIN/REG: ${companySettings?.registration_no || 'U28112KA2022PTC158921'}`)
              )
            ),
            h('div', { style: { textAlign: 'right' } },
              h('div', { style: { display: 'inline-block', background: '#0f172a', color: '#fff', padding: '4px 12px', borderRadius: 4, fontWeight: 800, fontSize: 13, letterSpacing: '0.8px', textTransform: 'uppercase' } }, 'TAX INVOICE'),
              h('div', { style: { fontSize: 14, fontWeight: 700, marginTop: 8, fontFamily: 'monospace' } }, selectedInvoice.invoice_no || `INV-${selectedInvoice.id}`),
              h('div', { style: { fontSize: 11.5, color: '#64748b', marginTop: 2 } }, `Date: ${formatDate(selectedInvoice.issued_date || new Date().toISOString().split('T')[0])}`),
              selectedInvoice.due_date && h('div', { style: { fontSize: 11.5, color: '#64748b' } }, `Due: ${formatDate(selectedInvoice.due_date)}`),
              h('div', { style: { marginTop: 6 } },
                h('span', {
                  style: {
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: selectedInvoice.status === 'Paid' ? '#dcfce7' : selectedInvoice.status === 'Overdue' ? '#fee2e2' : '#fef3c7',
                    color: selectedInvoice.status === 'Paid' ? '#15803d' : selectedInvoice.status === 'Overdue' ? '#b91c1c' : '#b45309'
                  }
                }, selectedInvoice.status || 'Pending')
              )
            )
          ),

          // Bill To & Supply Details Grid
          h('div', { style: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, padding: '16px', background: '#f8fafc', borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0' } },
            h('div', null,
              h('div', { style: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 } }, 'BILLED TO (BUYER)'),
              h('div', { style: { fontSize: 15, fontWeight: 700, color: '#0f172a' } }, selectedInvoice.customer || 'Customer Client'),
              h('div', { style: { fontSize: 12, color: '#475569', marginTop: 2 } }, 'Industrial Supplies & Operations Division'),
              h('div', { style: { fontSize: 11.5, color: '#64748b', marginTop: 2 } }, 'GSTIN / UIN: 29AAACH7409R1ZZ'),
              h('div', { style: { fontSize: 11.5, color: '#64748b' } }, 'State: Karnataka (29)')
            ),
            h('div', { style: { borderLeft: '1px solid #e2e8f0', paddingLeft: 18 } },
              h('div', { style: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 } }, 'DISPATCH & PAYMENT TERMS'),
              h('div', { style: { fontSize: 12, color: '#334155' } }, 'Payment Mode: Bank Wire / NEFT / RTGS'),
              h('div', { style: { fontSize: 12, color: '#334155', marginTop: 2 } }, 'Place of Supply: Karnataka (29)'),
              h('div', { style: { fontSize: 12, color: '#334155', marginTop: 2 } }, 'Reverse Charge: No'),
              h('div', { style: { fontSize: 12, color: '#334155', marginTop: 2 } }, 'Delivery Term: Ex-Works Factory')
            )
          ),

          // Table of Tax Invoice Line Items
          (() => {
            const rawItems = selectedInvoice.items;
            const items = (() => {
              if (Array.isArray(rawItems) && rawItems.length > 0) return rawItems;
              if (typeof rawItems === 'string') {
                try {
                  const p = JSON.parse(rawItems);
                  if (Array.isArray(p) && p.length > 0) return p;
                } catch (_) {}
              }
              return null;
            })();

            const totalAmt = Number(selectedInvoice.amount) || 0;
            const taxable = items ?
              items.reduce((sum, it) => sum + (Number(it.line_total) || ((Number(it.quantity) || 1) * (Number(it.unit_price) || 0))), 0) :
              Math.round((totalAmt / 1.18) * 100) / 100;
            const totalGst = Math.round(taxable * 0.18 * 100) / 100;
            const cgst = Math.round((totalGst / 2) * 100) / 100;
            const sgst = Math.round((totalGst - cgst) * 100) / 100;
            const finalTotal = totalAmt > 0 ? totalAmt : Math.round((taxable + totalGst) * 100) / 100;

            return h('div', null,
              h('table', { style: { width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 } },
                h('thead', null,
                  h('tr', { style: { background: '#0f172a', color: '#fff', textAlign: 'left' } },
                    h('th', { style: { padding: '8px 10px', borderRadius: '4px 0 0 0' } }, '#'),
                    h('th', { style: { padding: '8px 10px' } }, 'DESCRIPTION OF GOODS / SERVICES'),
                    h('th', { style: { padding: '8px 10px', textAlign: 'center' } }, 'HSN/SAC'),
                    h('th', { style: { padding: '8px 10px', textAlign: 'right' } }, 'QTY'),
                    h('th', { style: { padding: '8px 10px', textAlign: 'right' } }, 'RATE (₹)'),
                    h('th', { style: { padding: '8px 10px', textAlign: 'right' } }, 'TAXABLE (₹)'),
                    h('th', { style: { padding: '8px 10px', textAlign: 'right', borderRadius: '0 4px 0 0' } }, 'TOTAL (₹)')
                  )
                ),
                h('tbody', null,
                  items ?
                    items.map((it, idx) => {
                      const qty = Number(it.quantity) || 1;
                      const rate = Number(it.unit_price) || 0;
                      const lineTaxable = Number(it.line_total) || (qty * rate);
                      const lineTotal = Math.round(lineTaxable * 1.18 * 100) / 100;
                      return h('tr', { key: idx, style: { borderBottom: '1px solid #e2e8f0' } },
                        h('td', { style: { padding: '10px 10px', color: '#64748b' } }, String(idx + 1)),
                        h('td', { style: { padding: '10px 10px', fontWeight: 600, color: '#0f172a' } },
                          it.product_name || 'Finished Product Delivery',
                          h('div', { style: { fontSize: 11, color: '#64748b', fontWeight: 400, marginTop: 2 } }, 'Precision manufactured output per specification')
                        ),
                        h('td', { style: { padding: '10px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#475569' } }, it.hsn || '848340'),
                        h('td', { style: { padding: '10px 10px', textAlign: 'right', fontFamily: 'monospace' } }, `${qty} units`),
                        h('td', { style: { padding: '10px 10px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(rate)),
                        h('td', { style: { padding: '10px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 } }, formatCurrency(lineTaxable)),
                        h('td', { style: { padding: '10px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 } }, formatCurrency(lineTotal))
                      );
                    }) :
                    h('tr', { style: { borderBottom: '1px solid #e2e8f0' } },
                      h('td', { style: { padding: '12px 10px', color: '#64748b' } }, '1'),
                      h('td', { style: { padding: '12px 10px', fontWeight: 600, color: '#0f172a' } },
                        selectedInvoice.product_name || 'Industrial Fabricated Output - Batch Delivery',
                        h('div', { style: { fontSize: 11, color: '#64748b', fontWeight: 400, marginTop: 2 } }, 'Precision machined engineering components per specification')
                      ),
                      h('td', { style: { padding: '12px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#475569' } }, '848340'),
                      h('td', { style: { padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace' } }, `${selectedInvoice.quantity || 1} units`),
                      h('td', { style: { padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(taxable / (selectedInvoice.quantity || 1))),
                      h('td', { style: { padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 } }, formatCurrency(taxable)),
                      h('td', { style: { padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 } }, formatCurrency(totalAmt))
                    )
                )
              ),

              // Invoice Totals & Tax Calculation Breakdown
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14 } },
                // Left: Bank details & Amount in words
                h('div', { style: { width: '52%' } },
                  h('div', { style: { padding: '12px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5 } },
                    h('div', { style: { fontWeight: 700, color: '#334155', marginBottom: 4 } }, 'BANK ACCOUNT DETAILS FOR REMITTANCE:'),
                    h('div', null, 'Bank Name: HDFC Bank Ltd'),
                    h('div', null, `A/C Name: ${companySettings?.legal_name || companySettings?.name || 'ForgeLedger Industrial Corp'}`),
                    h('div', null, 'A/C No: 50200084920194'),
                    h('div', null, 'IFSC Code: HDFC0001048 (Industrial Branch)')
                  ),
                  h('div', { style: { fontSize: 11, color: '#64748b', marginTop: 10, lineHeight: 1.4 } },
                    'Terms: Payment is due within standard credit terms. Interest @ 18% p.a. will be charged on overdue payments. Goods once sold are not returnable.'
                  )
                ),
                // Right: Tax Breakdown Summary Table
                h('div', { style: { width: '44%' } },
                  h('table', { style: { width: '100%', fontSize: 12, borderCollapse: 'collapse' } },
                    h('tbody', null,
                      h('tr', { style: { borderBottom: '1px solid #e2e8f0' } },
                        h('td', { style: { padding: '6px 0', color: '#64748b' } }, 'Taxable Value'),
                        h('td', { style: { padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 } }, formatCurrency(taxable))
                      ),
                      h('tr', { style: { borderBottom: '1px solid #e2e8f0' } },
                        h('td', { style: { padding: '6px 0', color: '#64748b' } }, 'Central GST (CGST 9.0%)'),
                        h('td', { style: { padding: '6px 0', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(cgst))
                      ),
                      h('tr', { style: { borderBottom: '1px solid #e2e8f0' } },
                        h('td', { style: { padding: '6px 0', color: '#64748b' } }, 'State GST (SGST 9.0%)'),
                        h('td', { style: { padding: '6px 0', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(sgst))
                      ),
                      h('tr', { style: { borderTop: '2px solid #0f172a' } },
                        h('td', { style: { padding: '10px 0', fontWeight: 800, fontSize: 14 } }, 'Total Invoice Value'),
                        h('td', { style: { padding: '10px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: 16, color: '#0f172a' } }, formatCurrency(finalTotal))
                      )
                    )
                  )
                )
              ),

              // Authorized Signatory
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 36, paddingTop: 18, borderTop: '1px solid #cbd5e1' } },
                h('div', { style: { fontSize: 11, color: '#94a3b8' } },
                  'This is a computer generated invoice authenticated by ForgeLedger Cloud ERP.'
                ),
                h('div', { style: { textAlign: 'center', width: 200 } },
                  h('div', { style: { height: 40, borderBottom: '1px dashed #64748b', marginBottom: 6 } }),
                  h('div', { style: { fontSize: 11.5, fontWeight: 700, color: '#0f172a' } }, `For ${companySettings?.name || 'ForgeLedger'}`),
                  h('div', { style: { fontSize: 10.5, color: '#64748b' } }, 'Authorized Signatory')
                )
              )
            );
          })()
        ),
        // Footer actions for screen viewing
        h('div', { className: 'modal-footer no-print', style: { padding: '14px 24px', borderTop: '1px solid var(--border-light)' } },
          selectedInvoice.status !== 'Paid' && h('button', {
            className: 'btn btn-outline',
            style: { marginRight: 'auto', borderColor: '#10b981', color: '#059669' },
            onClick: () => {
              fetch(`/api/sales/${selectedInvoice.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Paid' })
              }).then(() => {
                if (window.__showToast) window.__showToast(`Invoice ${selectedInvoice.invoice_no} marked as Paid!`, 'success');
                setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
                loadAllData();
              });
            }
          }, '✓ Mark as Paid'),
          h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Close'),
          h('button', {
            type: 'button',
            className: 'btn btn-primary',
            onClick: () => window.print()
          }, h(Icon, { name: 'download', size: 14 }), 'Print / Save PDF')
        )
      )
    ),

    // ================= MODAL: SALARY PAYSLIP PREVIEW & PRINT =================
    modalType === 'payslipPreview' && selectedEmployee && h('div', {
      className: 'modal-overlay',
      onClick: (e) => { if (e.target === e.currentTarget) setModalType(null); }
    },
      h('div', { className: 'modal-card', style: { maxWidth: 760, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 0 } },
        // Header for screen viewing
        h('div', { className: 'modal-header no-print', style: { padding: '16px 24px', borderBottom: '1px solid var(--border-light)' } },
          h('div', null,
            h('h3', { style: { margin: 0, fontSize: 16 } }, `Salary Payslip: ${selectedEmployee.name}`),
            h('div', { style: { fontSize: 12, color: '#64748b' } }, 'Employee Monthly Compensation Voucher')
          ),
          h('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
            h('button', {
              className: 'btn btn-primary',
              style: { padding: '6px 14px', fontSize: 13 },
              onClick: () => window.print()
            }, h(Icon, { name: 'download', size: 14 }), 'Print Payslip'),
            h('button', { className: 'modal-close', onClick: () => setModalType(null) }, '✕')
          )
        ),
        // Printable Payslip Body
        h('div', { className: 'printable-invoice', style: { padding: '36px 40px', background: '#fff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' } },
          // Company Header
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 } },
            h('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
              h('img', {
                src: '/logo.png',
                alt: 'ForgeLedger Logo',
                style: { width: 44, height: 44, borderRadius: 8, objectFit: 'contain' }
              }),
              h('div', null,
                h('h2', { style: { margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' } }, companySettings?.name || currentUser?.company_name || 'ForgeLedger Industrial Corp'),
                h('div', { style: { fontSize: 11.5, color: '#64748b' } }, companySettings?.address || 'Peenya Industrial Area, Phase II, Bengaluru, Karnataka')
              )
            ),
            h('div', { style: { textAlign: 'right' } },
              h('div', { style: { display: 'inline-block', background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: 4, fontWeight: 700, fontSize: 12, textTransform: 'uppercase' } }, 'SALARY PAYSLIP'),
              h('div', { style: { fontSize: 12.5, fontWeight: 600, marginTop: 4 } }, new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))
            )
          ),

          // Employee Details Grid
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '14px 16px', background: '#f8fafc', borderRadius: 6, marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 12 } },
            h('div', null,
              h('div', { style: { display: 'flex', marginBottom: 4 } },
                h('span', { style: { color: '#64748b', width: 110 } }, 'Employee Name:'),
                h('span', { style: { fontWeight: 700, color: '#0f172a' } }, selectedEmployee.name)
              ),
              h('div', { style: { display: 'flex', marginBottom: 4 } },
                h('span', { style: { color: '#64748b', width: 110 } }, 'Employee ID:'),
                h('span', { style: { fontFamily: 'monospace', fontWeight: 600 } }, `EMP-${String(selectedEmployee.id).padStart(4, '0')}`)
              ),
              h('div', { style: { display: 'flex' } },
                h('span', { style: { color: '#64748b', width: 110 } }, 'Designation/Role:'),
                h('span', { style: { fontWeight: 600 } }, selectedEmployee.role)
              )
            ),
            h('div', null,
              h('div', { style: { display: 'flex', marginBottom: 4 } },
                h('span', { style: { color: '#64748b', width: 110 } }, 'Payment Mode:'),
                h('span', { style: { fontWeight: 600 } }, 'Bank Transfer (NEFT)')
              ),
              h('div', { style: { display: 'flex', marginBottom: 4 } },
                h('span', { style: { color: '#64748b', width: 110 } }, 'Status:'),
                h('span', { style: { color: selectedEmployee.status === 'Active' ? '#059669' : '#d97706', fontWeight: 700 } }, selectedEmployee.status)
              ),
              h('div', { style: { display: 'flex' } },
                h('span', { style: { color: '#64748b', width: 110 } }, 'Pay Days:'),
                h('span', { style: { fontFamily: 'monospace' } }, '30 Days')
              )
            )
          ),

          // Compensation Breakdown Table (Earnings vs Deductions)
          (() => {
            const grossSalary = Number(selectedEmployee.monthly_salary) || 28000;
            const basic = Math.round(grossSalary * 0.50);
            const hra = Math.round(grossSalary * 0.30);
            const special = grossSalary - basic - hra;

            const pf = Math.round(Math.min(1800, grossSalary * 0.06));
            const pt = 200;
            const totalDeductions = pf + pt;
            const netTakeHome = grossSalary - totalDeductions;

            return h('div', null,
              h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 } },
                // Earnings column
                h('div', { style: { border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' } },
                  h('div', { style: { background: '#f1f5f9', padding: '8px 12px', fontWeight: 700, fontSize: 12, borderBottom: '1px solid #e2e8f0', color: '#0f172a' } }, 'EARNINGS'),
                  h('table', { style: { width: '100%', fontSize: 12, borderCollapse: 'collapse' } },
                    h('tbody', null,
                      h('tr', { style: { borderBottom: '1px solid #f1f5f9' } },
                        h('td', { style: { padding: '8px 12px', color: '#475569' } }, 'Basic Salary (50%)'),
                        h('td', { style: { padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(basic))
                      ),
                      h('tr', { style: { borderBottom: '1px solid #f1f5f9' } },
                        h('td', { style: { padding: '8px 12px', color: '#475569' } }, 'House Rent Allowance (HRA)'),
                        h('td', { style: { padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(hra))
                      ),
                      h('tr', { style: { borderBottom: '1px solid #f1f5f9' } },
                        h('td', { style: { padding: '8px 12px', color: '#475569' } }, 'Special / Factory Allowance'),
                        h('td', { style: { padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(special))
                      ),
                      h('tr', { style: { background: '#f8fafc', fontWeight: 700 } },
                        h('td', { style: { padding: '10px 12px', color: '#0f172a' } }, 'Gross Earnings'),
                        h('td', { style: { padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#0f172a' } }, formatCurrency(grossSalary))
                      )
                    )
                  )
                ),
                // Deductions column
                h('div', { style: { border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' } },
                  h('div', { style: { background: '#f1f5f9', padding: '8px 12px', fontWeight: 700, fontSize: 12, borderBottom: '1px solid #e2e8f0', color: '#0f172a' } }, 'DEDUCTIONS'),
                  h('table', { style: { width: '100%', fontSize: 12, borderCollapse: 'collapse' } },
                    h('tbody', null,
                      h('tr', { style: { borderBottom: '1px solid #f1f5f9' } },
                        h('td', { style: { padding: '8px 12px', color: '#475569' } }, 'Provident Fund (PF)'),
                        h('td', { style: { padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(pf))
                      ),
                      h('tr', { style: { borderBottom: '1px solid #f1f5f9' } },
                        h('td', { style: { padding: '8px 12px', color: '#475569' } }, 'Professional Tax (PT)'),
                        h('td', { style: { padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' } }, formatCurrency(pt))
                      ),
                      h('tr', { style: { borderBottom: '1px solid #f1f5f9' } },
                        h('td', { style: { padding: '8px 12px', color: '#94a3b8' } }, 'TDS / Other Deductions'),
                        h('td', { style: { padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#94a3b8' } }, '₹0')
                      ),
                      h('tr', { style: { background: '#f8fafc', fontWeight: 700 } },
                        h('td', { style: { padding: '10px 12px', color: '#dc2626' } }, 'Total Deductions'),
                        h('td', { style: { padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' } }, formatCurrency(totalDeductions))
                      )
                    )
                  )
                )
              ),

              // Net Take Home Pay Highlight
              h('div', { style: { padding: '14px 20px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } },
                h('div', null,
                  h('div', { style: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' } }, 'NET TAKE-HOME COMPENSATION'),
                  h('div', { style: { fontSize: 11, color: '#cbd5e1', marginTop: 2 } }, 'Credited directly to employee registered bank account')
                ),
                h('div', { style: { fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' } }, formatCurrency(netTakeHome))
              ),

              // Signatures
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32, paddingTop: 18, borderTop: '1px solid #cbd5e1' } },
                h('div', { style: { textAlign: 'center', width: 180 } },
                  h('div', { style: { height: 35, borderBottom: '1px dashed #64748b', marginBottom: 4 } }),
                  h('div', { style: { fontSize: 11, fontWeight: 600, color: '#475569' } }, 'Employee Signature')
                ),
                h('div', { style: { textAlign: 'center', width: 200 } },
                  h('div', { style: { height: 35, borderBottom: '1px dashed #64748b', marginBottom: 4 } }),
                  h('div', { style: { fontSize: 11.5, fontWeight: 700, color: '#0f172a' } }, `For ${companySettings?.name || 'ForgeLedger'}`),
                  h('div', { style: { fontSize: 10.5, color: '#64748b' } }, 'Authorized HR Signatory')
                )
              )
            );
          })()
        ),
        // Footer actions
        h('div', { className: 'modal-footer no-print', style: { padding: '14px 24px', borderTop: '1px solid var(--border-light)' } },
          h('button', { type: 'button', className: 'btn btn-outline', onClick: () => setModalType(null) }, 'Close'),
          h('button', {
            type: 'button',
            className: 'btn btn-primary',
            onClick: () => window.print()
          }, h(Icon, { name: 'download', size: 14 }), 'Print Payslip')
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
    ),

    // Mobile Bottom Navigation Bar (Native mobile experience)
    h('nav', { className: 'mobile-bottom-nav' },
      h('button', {
        className: `bottom-nav-item ${activeTab === 'overview' ? 'active' : ''}`,
        onClick: () => { setActiveTab('overview'); setMobileMenuOpen(false); }
      }, h(Icon, { name: 'overview', size: 18 }), h('span', null, 'Overview')),
      h('button', {
        className: `bottom-nav-item ${activeTab === 'inventory' ? 'active' : ''}`,
        onClick: () => { setActiveTab('inventory'); setMobileMenuOpen(false); }
      }, h(Icon, { name: 'inventory', size: 18 }), h('span', null, 'Goods')),
      h('button', {
        className: `bottom-nav-item ${activeTab === 'production' ? 'active' : ''}`,
        onClick: () => { setActiveTab('production'); setMobileMenuOpen(false); }
      }, h(Icon, { name: 'production', size: 18 }), h('span', null, 'Production')),
      h('button', {
        className: `bottom-nav-item ${activeTab === 'rawMaterials' ? 'active' : ''}`,
        onClick: () => { setActiveTab('rawMaterials'); setMobileMenuOpen(false); }
      }, h(Icon, { name: 'rawMaterials', size: 18 }), h('span', null, 'Materials')),
      h('button', {
        className: `bottom-nav-item ${mobileMenuOpen ? 'active' : ''}`,
        onClick: () => setMobileMenuOpen(!mobileMenuOpen)
      }, h(Icon, { name: 'menu', size: 18 }), h('span', null, 'More'))
    ),

    // Mobile Floating Action Button (FAB) Speed Dial
    h(MobileFloatingActions, {
      isOpen: fabOpen,
      onToggle: setFabOpen,
      onAction: (act) => {
        if (act === 'sale') { setFormData({}); setModalType('sale'); }
        else if (act === 'production') { setFormData({}); setModalType('production'); }
        else if (act === 'expense') { setFormData({}); setModalType('expense'); }
        else if (act === 'rawMaterial') { setModalType('rawMaterial'); }
      }
    }),

    // Global Command Palette & Database Search (Ctrl+K)
    h(CommandPalette, {
      isOpen: showCommandPalette,
      onClose: () => setShowCommandPalette(false),
      finishedGoods,
      rawMaterials,
      sales,
      employees,
      onNavigate: (tab, searchVal) => {
        setActiveTab(tab);
        if (searchVal) setSearchQuery(searchVal);
      },
      onAction: (act) => {
        if (act === 'barcodeScanner') { setShowScannerModal(true); }
        else if (act === 'labelStudio') { setLabelModalItem(null); setShowLabelModal(true); }
        else if (act === 'team') { setActiveTab('settings'); setSettingsTab('team'); }
        else if (act === 'aiAnalyst') { setAiAnalystInitialQuery(''); setShowAiAnalyst(true); }
        else if (act === 'ocr') { setShowOcrModal(true); }
        else if (act === 'forecast') { setActiveTab('rawMaterials'); setShowForecastView(true); }
        else if (act === 'sale') { setFormData({}); setModalType('sale'); }
        else if (act === 'production') { setFormData({}); setModalType('production'); }
        else if (act === 'expense') { setFormData({}); setModalType('expense'); }
        else if (act === 'employee') { setFormData({}); setModalType('employee'); }
        else if (act === 'switchCompany') { setShowCompanyModal(true); }
        else if (act === 'shortcuts') { setShowShortcutsModal(true); }
      }
    }),

    // Keyboard Shortcuts Cheat Sheet Modal
    h(ShortcutsModal, {
      isOpen: showShortcutsModal,
      onClose: () => setShowShortcutsModal(false)
    }),

    // Toast Notification System
    h(ToastContainer, { toasts, onDismiss: removeToast }),

    // Floating AI Analyst Trigger Pill
    h('button', {
      className: 'ai-floating-trigger',
      onClick: () => { setAiAnalystInitialQuery(''); setShowAiAnalyst(true); },
      title: 'Ask ForgeAI Business Analyst'
    }, h('span', { style: { fontSize: 16 } }, '✦'), 'Ask ForgeAI'),

    // Smart Document / Invoice OCR Modal
    h(SmartInvoiceOcrModal, {
      isOpen: showOcrModal,
      onClose: () => setShowOcrModal(false),
      onSuccess: (exp) => {
        addToast(`Expense saved from vendor bill: ${exp.description || 'Invoice'}!`, 'success');
        loadAllData();
      },
      currency: '₹'
    }),

    // ForgeAI Natural Language Business Analyst Drawer
    h(AiAnalystDrawer, {
      isOpen: showAiAnalyst,
      onClose: () => setShowAiAnalyst(false),
      initialQuery: aiAnalystInitialQuery,
      currency: '₹'
    }),

    // Barcode & QR Code Label Studio Modal
    h(BarcodeLabelModal, {
      isOpen: showLabelModal,
      onClose: () => setShowLabelModal(false),
      initialItem: labelModalItem,
      finishedGoods,
      rawMaterials,
      company: companySettings || (userCompanies && userCompanies[0]) || { name: 'Riverton Works' },
      onOpenScanner: () => setShowScannerModal(true)
    }),

    // Mobile & Camera Barcode Scanner Modal
    h(BarcodeScannerModal, {
      isOpen: showScannerModal,
      onClose: () => setShowScannerModal(false),
      finishedGoods,
      rawMaterials,
      onUpdateStock: handleUpdateStockFromScanner,
      onAddToInvoice: (item) => {
        setFormData({
          items: [{
            product_id: item.id,
            product_name: item.name,
            quantity: 1,
            unit_price: item.price,
            line_total: item.price
          }],
          tax: item.price * 0.18,
          total: item.price * 1.18
        });
        setActiveTab('sales');
        setModalType('sale');
      },
      onOpenLabelStudio: (item) => {
        setLabelModalItem(item);
        setShowLabelModal(true);
      }
    }),

    // Invite Team Colleague Modal
    h(InviteTeamModal, {
      isOpen: showInviteModal,
      onClose: () => setShowInviteModal(false),
      onInvite: handleInviteTeamMember
    }),

    // Assign & Add Role Modal (Admin Only)
    h(AssignRoleModal, {
      isOpen: showAssignRoleModal,
      onClose: () => setShowAssignRoleModal(false),
      teamMembers: teamMembers,
      onUpdateRole: handleUpdateMemberRole,
      onInviteMember: handleInviteTeamMember
    })
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
