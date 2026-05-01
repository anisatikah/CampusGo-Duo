// client/src/components/StatusBadge.jsx
const map = {
  pending:     'pill-amber',
  accepted:    'pill-volt',
  in_progress: 'pill-volt',
  active:      'pill-volt',
  completed:   'pill-muted',
  cancelled:   'pill-muted',
};
export default function StatusBadge({ status }) {
  const cls = map[status] || 'pill-muted';
  const label = String(status || '').replace('_', ' ');
  return <span className={cls}>{label}</span>;
}
