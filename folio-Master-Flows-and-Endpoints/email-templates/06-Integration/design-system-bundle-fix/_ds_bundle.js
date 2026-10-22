/* @ds-bundle: {"format":4,"namespace":"NITDADesignSystem_019ddc","components":[{"name":"Alert","sourcePath":"components/Alert/Alert.jsx"},{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"Card","sourcePath":"components/Card/Card.jsx"},{"name":"EmptyState","sourcePath":"components/EmptyState/EmptyState.jsx"},{"name":"Field","sourcePath":"components/Field/Field.jsx"},{"name":"Metric","sourcePath":"components/Metric/Metric.jsx"},{"name":"Pill","sourcePath":"components/Pill/Pill.jsx"},{"name":"Stepper","sourcePath":"components/Stepper/Stepper.jsx"},{"name":"Table","sourcePath":"components/Table/Table.jsx"},{"name":"Tabs","sourcePath":"components/Tabs/Tabs.jsx"}],"sourceHashes":{"components/Alert/Alert.jsx":"86a3517bd99a","components/Button/Button.jsx":"c62a16efaf61","components/Card/Card.jsx":"595fdebef3df","components/EmptyState/EmptyState.jsx":"6fc75aa05d6d","components/Field/Field.jsx":"cc73a5dae844","components/Metric/Metric.jsx":"cec771fe60e4","components/Pill/Pill.jsx":"85e601abd8e7","components/Stepper/Stepper.jsx":"ef874c514b1e","components/Table/Table.jsx":"5ef6e489fd5b","components/Tabs/Tabs.jsx":"3ee6fc52dec6"},"inlinedExternals":[],"unexposedExports":[],"excluded":"Application and UI-kit page scripts (document-portal/**, ui_kits/**, dgo_digital_ops/ui_kits/**, tweaks-panel.jsx) are not part of the shared bundle."} */

(() => {

const __ds_ns = (window.NITDADesignSystem_019ddc = window.NITDADesignSystem_019ddc || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/Alert/Alert.jsx
try { (() => {
/* DGO Alert — inline, in-flow message. Not a toast: it stays until resolved. */
function Alert({
  tone = 'info',
  title,
  icon,
  onDismiss,
  className = '',
  children,
  ...rest
}) {
  var cls = ['dgo-alert', 'dgo-alert--' + tone];
  if (className) cls.push(className);
  return React.createElement('div', Object.assign({
    className: cls.join(' '),
    role: tone === 'danger' ? 'alert' : 'status'
  }, rest), icon ? React.createElement('span', {
    className: 'dgo-alert__icon'
  }, icon) : null, React.createElement('div', {
    className: 'dgo-alert__body'
  }, title ? React.createElement('div', {
    className: 'dgo-alert__title'
  }, title) : null, children ? React.createElement('p', {
    style: {
      margin: 0
    }
  }, children) : null), onDismiss ? React.createElement('button', {
    type: 'button',
    className: 'dgo-btn dgo-btn--ghost dgo-btn--sm dgo-btn--icon',
    onClick: onDismiss,
    'aria-label': 'Dismiss',
    style: {
      marginLeft: 'auto'
    }
  }, '\u00d7') : null);
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Alert/Alert.jsx", error: String((e && e.message) || e) }); }

// components/Button/Button.jsx
try { (() => {
/* DGO Button — the system's single action element.
   Renders <button> by default, <a> when href is given. */
function Button({
  intent = 'primary',
  size = 'md',
  block = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  href,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  var cls = ['dgo-btn', 'dgo-btn--' + intent];
  if (size !== 'md') cls.push('dgo-btn--' + size);
  if (block) cls.push('dgo-btn--block');
  if (iconOnly) cls.push('dgo-btn--icon');
  if (className) cls.push(className);
  var props = {
    className: cls.join(' '),
    'data-loading': loading ? 'true' : undefined,
    'aria-busy': loading ? 'true' : undefined
  };
  if (href) return React.createElement('a', Object.assign({
    href: disabled ? undefined : href,
    'aria-disabled': disabled ? 'true' : undefined
  }, props, rest), children);
  return React.createElement('button', Object.assign({
    type: type,
    disabled: disabled || loading
  }, props, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/Card/Card.jsx
try { (() => {
/* DGO Card — the system's surface primitive. */
function Card({
  variant = 'default',
  title,
  sub,
  actions,
  footer,
  className = '',
  children,
  ...rest
}) {
  var cls = ['dgo-card'];
  if (variant !== 'default') cls.push('dgo-card--' + variant);
  if (className) cls.push(className);
  var head = title || sub || actions ? React.createElement('div', {
    className: 'dgo-card__header'
  }, React.createElement('div', {
    style: {
      minWidth: 0
    }
  }, title ? React.createElement('div', {
    className: 'dgo-card__title'
  }, title) : null, sub ? React.createElement('div', {
    className: 'dgo-card__sub'
  }, sub) : null), actions ? React.createElement('div', {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, actions) : null) : null;
  return React.createElement('div', Object.assign({
    className: cls.join(' ')
  }, rest), head, children, footer ? React.createElement('div', {
    className: 'dgo-card__footer'
  }, footer) : null);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Card/Card.jsx", error: String((e && e.message) || e) }); }

// components/EmptyState/EmptyState.jsx
try { (() => {
/* DGO EmptyState — never a bare "no results". */
function EmptyState({
  icon,
  title,
  body,
  action,
  className = '',
  ...rest
}) {
  return React.createElement('div', Object.assign({
    className: ['dgo-empty', className].filter(Boolean).join(' ')
  }, rest), icon ? React.createElement('span', {
    'aria-hidden': 'true',
    style: {
      color: 'var(--dgo-color-fg-muted)'
    }
  }, icon) : null, title ? React.createElement('div', {
    className: 'dgo-empty__title'
  }, title) : null, body ? React.createElement('p', {
    className: 'dgo-empty__body'
  }, body) : null, action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/EmptyState/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/Field/Field.jsx
try { (() => {
/* DGO Field — label + control + help/error, wired for accessibility.
   control: 'input' | 'textarea' | 'select'. Options may be strings or {value,label}. */
function Field({
  id,
  label,
  control = 'input',
  type = 'text',
  required = false,
  help,
  error,
  options = [],
  className = '',
  children,
  ...rest
}) {
  var uid = id || 'f-' + String(label || 'field').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  var describedBy = [];
  if (help) describedBy.push(uid + '-help');
  if (error) describedBy.push(uid + '-err');
  var shared = Object.assign({
    id: uid,
    required: required,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy.length ? describedBy.join(' ') : undefined
  }, rest);
  var field;
  if (control === 'textarea') {
    field = React.createElement('textarea', Object.assign({
      className: 'dgo-textarea',
      rows: rest.rows || 4
    }, shared));
  } else if (control === 'select') {
    field = React.createElement('div', {
      className: 'dgo-select'
    }, React.createElement('select', Object.assign({
      className: 'dgo-select__field'
    }, shared), children || options.map(function (o) {
      var v = typeof o === 'string' ? o : o.value;
      var l = typeof o === 'string' ? o : o.label;
      return React.createElement('option', {
        key: v,
        value: v
      }, l);
    })));
  } else {
    field = React.createElement('input', Object.assign({
      className: 'dgo-input',
      type: type
    }, shared));
  }
  return React.createElement('div', {
    className: ['dgo-field', className].filter(Boolean).join(' ')
  }, label ? React.createElement('label', {
    className: 'dgo-field__label' + (required ? ' dgo-field__label--req' : ''),
    htmlFor: uid
  }, label) : null, field, help ? React.createElement('p', {
    className: 'dgo-field__help',
    id: uid + '-help'
  }, help) : null, error ? React.createElement('p', {
    className: 'dgo-field__error',
    id: uid + '-err'
  }, error) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Field/Field.jsx", error: String((e && e.message) || e) }); }

// components/Metric/Metric.jsx
try { (() => {
/* DGO Metric — a single figure with an optional period-on-period delta. */
function Metric({
  label,
  value,
  delta,
  direction,
  hint,
  className = '',
  ...rest
}) {
  var cls = ['dgo-metric'];
  if (className) cls.push(className);
  var dir = direction || (typeof delta === 'string' && delta.charAt(0) === '-' ? 'down' : 'up');
  return React.createElement('div', Object.assign({
    className: cls.join(' ')
  }, rest), React.createElement('div', {
    className: 'dgo-metric__label'
  }, label), React.createElement('div', {
    className: 'dgo-metric__value dgo-tnum'
  }, value), delta != null ? React.createElement('div', {
    className: 'dgo-metric__delta dgo-metric__delta--' + dir
  }, React.createElement('span', {
    'aria-hidden': 'true'
  }, dir === 'down' ? '\u2193' : '\u2191'), delta) : null, hint ? React.createElement('div', {
    style: {
      fontSize: 12,
      color: 'var(--dgo-color-fg-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Metric });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Metric/Metric.jsx", error: String((e && e.message) || e) }); }

// components/Pill/Pill.jsx
try { (() => {
/* DGO Pill — compact status marker used across queues and timelines. */
function Pill({
  tone = 'info',
  dot = true,
  className = '',
  children,
  ...rest
}) {
  var cls = ['dgo-pill', 'dgo-pill--' + tone];
  if (className) cls.push(className);
  return React.createElement('span', Object.assign({
    className: cls.join(' ')
  }, rest), dot ? React.createElement('span', {
    className: 'dgo-pill__dot'
  }) : null, children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Pill/Pill.jsx", error: String((e && e.message) || e) }); }

// components/Stepper/Stepper.jsx
try { (() => {
/* DGO Stepper — linear progress through a multi-step task.
   steps: string[] or [{label, hint}]; current is a 0-based index. */
function Stepper({
  steps = [],
  current = 0,
  className = '',
  ...rest
}) {
  return React.createElement('ol', Object.assign({
    className: ['dgo-stepper', className].filter(Boolean).join(' '),
    'aria-label': 'Progress'
  }, rest), steps.map(function (s, i) {
    var label = typeof s === 'string' ? s : s.label;
    var hint = typeof s === 'string' ? null : s.hint;
    var state = i < current ? 'done' : i === current ? 'current' : 'todo';
    return React.createElement('li', {
      key: label,
      className: 'dgo-stepper__step',
      'data-state': state,
      'aria-current': state === 'current' ? 'step' : undefined
    }, React.createElement('span', {
      className: 'dgo-stepper__bullet'
    }, state === 'done' ? '\u2713' : i + 1), React.createElement('span', null, React.createElement('span', {
      style: {
        display: 'block'
      }
    }, label), hint ? React.createElement('span', {
      style: {
        display: 'block',
        fontSize: 12,
        color: 'var(--dgo-color-fg-muted)'
      }
    }, hint) : null), i < steps.length - 1 ? React.createElement('span', {
      className: 'dgo-stepper__line',
      'aria-hidden': 'true'
    }) : null);
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Stepper/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/Table/Table.jsx
try { (() => {
/* DGO Table — declarative queue table.
   columns: [{ key, label, numeric?, render? }] */
function Table({
  columns = [],
  rows = [],
  striped = true,
  rowKey = 'id',
  onRowClick,
  empty,
  className = '',
  ...rest
}) {
  if (!rows.length && empty) return empty;
  var cls = ['dgo-table'];
  if (striped) cls.push('dgo-table--striped');
  if (className) cls.push(className);
  return React.createElement('div', Object.assign({
    className: 'dgo-table-wrap'
  }, rest), React.createElement('table', {
    className: cls.join(' ')
  }, React.createElement('thead', null, React.createElement('tr', null, columns.map(function (c) {
    return React.createElement('th', {
      key: c.key,
      className: c.numeric ? 'dgo-table__num' : undefined,
      scope: 'col',
      style: c.width ? {
        width: c.width
      } : undefined
    }, c.label);
  }))), React.createElement('tbody', null, rows.map(function (r, i) {
    return React.createElement('tr', {
      key: r[rowKey] || i,
      onClick: onRowClick ? function () {
        onRowClick(r);
      } : undefined,
      style: onRowClick ? {
        cursor: 'pointer'
      } : undefined
    }, columns.map(function (c) {
      return React.createElement('td', {
        key: c.key,
        className: c.numeric ? 'dgo-table__num' : undefined
      }, c.render ? c.render(r) : r[c.key]);
    }));
  }))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Table/Table.jsx", error: String((e && e.message) || e) }); }

// components/Tabs/Tabs.jsx
try { (() => {
/* DGO Tabs — a tab list plus the active panel.
   tabs: [{ id, label, count?, panel? }]. Uncontrolled unless active/onChange are given. */
function Tabs({
  tabs = [],
  active,
  onChange,
  defaultActive,
  className = '',
  ...rest
}) {
  var first = tabs.length ? tabs[0].id : null;
  var state = React.useState(defaultActive || first);
  var current = active != null ? active : state[0];
  function select(id) {
    if (active == null) state[1](id);
    if (onChange) onChange(id);
  }
  var open = tabs.filter(function (t) {
    return t.id === current;
  })[0];
  return React.createElement('div', Object.assign({
    className: ['dgo-tabs', className].filter(Boolean).join(' ')
  }, rest), React.createElement('div', {
    className: 'dgo-tabs__list',
    role: 'tablist'
  }, tabs.map(function (t) {
    return React.createElement('button', {
      key: t.id,
      type: 'button',
      role: 'tab',
      id: 'tab-' + t.id,
      className: 'dgo-tabs__tab',
      'aria-selected': t.id === current ? 'true' : 'false',
      'aria-controls': 'panel-' + t.id,
      onClick: function () {
        select(t.id);
      }
    }, t.label, t.count != null ? React.createElement('span', {
      className: 'dgo-sidebar__count'
    }, t.count) : null);
  })), open && open.panel ? React.createElement('div', {
    role: 'tabpanel',
    id: 'panel-' + open.id,
    'aria-labelledby': 'tab-' + open.id,
    style: {
      paddingTop: 18
    }
  }, open.panel) : null);
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Tabs/Tabs.jsx", error: String((e && e.message) || e) }); }


__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Metric = __ds_scope.Metric;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
