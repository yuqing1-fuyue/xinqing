import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, User, LogOut } from 'lucide-react';
import { store } from '../store';
import { api } from '../services/api';
import styles from './Navbar.module.css';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/mood', label: '心情打卡', icon: '😊' },
  { path: '/treehole', label: '心灵树洞', icon: '🌳' },
  { path: '/groups', label: '社群小组', icon: '👥' },
  { path: '/health', label: '身心健康', icon: '💚' },
  { path: '/ai-assistant', label: 'AI助手', icon: '🤖' },
  { path: '/messages', label: '私信', icon: '💬' },
  { path: '/profile', label: '个人中心', icon: '👤' },
];

export default function Navbar() {
  const [storeInstance, state] = store.useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      storeInstance.fetchCurrentUser();
    }
  }, [state.isAuthenticated]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const data = await api.searchResources(searchQuery.trim());
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('搜索失败:', error);
        setSearchResults([]);
      }
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      try {
        const data = await api.searchResources(value.trim());
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (resource) => {
    setShowResults(false);
    setSearchQuery('');
    navigate('/health');
  };

  const handleLogout = () => {
    storeInstance.logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌸</span>
          <span className={styles.logoText}>心晴同行</span>
        </Link>

        {/* Nav links */}
        <div className={styles.navLinks}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon} {item.label}</span>
            </Link>
          ))}
        </div>

        {/* Search + actions */}
        <div className={styles.rightSection}>
          <div className={styles.searchContainer}>
            <form className={`${styles.searchBar} ${searchFocus ? styles.searchFocused : ''}`} onSubmit={handleSearch}>
              <Search size={15} color="#FF8C69" />
              <input
                type="text"
                placeholder="搜索心理文章、测评..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
            </form>
            {showResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className={styles.searchResultItem}
                    onClick={() => handleResultClick(result)}
                  >
                    <span className={styles.resultIcon}>
                      {result.category === 'exercise' ? '🧘' : result.category === 'article' ? '📖' : result.category === 'video' ? '🎬' : '📝'}
                    </span>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultTitle}>{result.title}</span>
                      <span className={styles.resultCategory}>{result.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className={styles.searchResults}>
                <div className={styles.noResults}>未找到相关资源</div>
              </div>
            )}
          </div>

          {state.isAuthenticated && state.user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <span className={styles.avatar}>{state.user.avatar || '👤'}</span>
                <span className={styles.userName}>{state.user.nickname || state.user.username}</span>
              </button>
              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{state.user.nickname}</span>
                    <span className={styles.dropdownEmail}>{state.user.email}</span>
                  </div>
                  <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>
                    <User size={14} />
                    <span>个人中心</span>
                  </button>
                  {state.user?.role === 'admin' && (
                    <button className={styles.dropdownItem} onClick={() => { navigate('/admin'); setUserMenuOpen(false); }} style={{ color: '#E74C3C' }}>
                      <span style={{ fontSize: 14 }}>🛡️</span>
                      <span>管理后台</span>
                    </button>
                  )}
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.userBtn}>
              <User size={18} />
              <span>登录</span>
            </Link>
          )}

          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.mobileItem} ${location.pathname === item.path ? styles.mobileActive : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.icon} {item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
