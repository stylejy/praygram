interface Props {
  groupTitle: string;
}
export default function Navbar(props: Props) {
  const { groupTitle } = props;
  return (
    <nav className="glass-card fixed inset-x-4 top-3 z-30 px-6 py-3.5"
         style={{ borderRadius: '16px' }}>
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center">
          <h1
            className="text-lg font-light tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Praygram
          </h1>
        </a>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {groupTitle}
        </p>
      </div>
    </nav>
  );
}
