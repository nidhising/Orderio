import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',          end: true,  icon: '🏠', label: 'Dashboard'  },
  { to: '/products',  end: false, icon: '📦', label: 'Products'   },
  { to: '/customers', end: false, icon: '👥', label: 'Customers'  },
  { to: '/orders',    end: false, icon: '🛒', label: 'Orders'     },
];

export default function Sidebar({ theme, onToggleTheme }) {
  const toggle = () => onToggleTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <div className="brand-logo">📦</div>
        <span className="brand-name">Orderio</span>
      </NavLink>

      <nav className="sidebar-nav">
        {links.map(({ to, end, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle — clicking sun, pill, or moon all work */}
      <div className="theme-toggle-row">
        <button
          className={`theme-btn ${theme === 'light' ? 'theme-active' : ''}`}
          onClick={toggle}
          title="Light mode"
        >☀️</button>

        <button className="theme-pill" onClick={toggle} title="Toggle theme">
          <div
            className="theme-pill-thumb"
            style={{ transform: theme === 'dark' ? 'translateX(22px)' : 'translateX(0)' }}
          />
        </button>

        <button
          className={`theme-btn ${theme === 'dark' ? 'theme-active' : ''}`}
          onClick={toggle}
          title="Dark mode"
        >🌙</button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-copyright">© 2026 Orderio<br />All rights reserved.</div>
      </div>
    </aside>
  );
}
