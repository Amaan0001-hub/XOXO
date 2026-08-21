"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  RiDashboardLine,
  RiLogoutBoxLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMenuLine,
  RiGroupLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiUserLine,
  RiUserSettingsLine,
  RiUserStarLine,
  RiUserAddLine,
  RiAdminLine,
  RiTeamLine,
  RiSettings3Line,
  RiSettingsLine,
  RiShieldLine,
  RiShieldUserLine,
  RiLockLine,
  RiKeyLine,
  RiMoneyDollarCircleLine,
  RiWalletLine,
  RiBankLine,
  RiExchangeLine,
  RiLineChartLine,
  RiBarChartLine,
  RiBarChart2Line,
  RiPieChartLine,
  RiStockLine,
  RiCoinLine,
  RiFundsLine,
  RiRefundLine,
  RiPercentLine,
  RiPriceTag3Line,
  RiCouponLine,
  RiGiftLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiBuildingLine,
  RiFileListLine,
  RiFileChartLine,
  RiFilePaperLine,
  RiFileTextLine,
  RiFileUserLine,
  RiNewspaperLine,
  RiInformationLine,
  RiNotificationLine,
  RiNotificationBadgeLine,
  RiMailLine,
  RiMessage2Line,
  RiChat3Line,
  RiCustomerService2Line,
  RiHeadphoneLine,
  RiGlobalLine,
  RiMapLine,
  RiMapPinLine,
  RiCalendarLine,
  RiCalendarEventLine,
  RiHistoryLine,
  RiTimeLine,
  RiStarLine,
  RiAwardLine,
  RiMedal2Line,
  RiTrophyLine,
  RiThumbUpLine,
  RiHandCoinLine,
  RiHandHeartLine,
  RiLinksLine,
  RiTreeLine,
  RiStackLine,
  RiFlowChart,
  RiListCheck2,
  RiCheckboxLine,
  RiToggleLine,
  RiToolsLine,
  RiImageLine,
  RiGalleryLine,
  RiSlideshowLine,
  RiVideoLine,
  RiCameraLine,
  RiQrCodeLine,
  RiSearchLine,
  RiFilterLine,
  RiDownload2Line,
  RiUpload2Line,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiHome2Line,
  RiStoreLine,
  RiShoppingCartLine,
  RiShoppingBagLine,
  RiArchiveLine,
  RiTruckLine,
  RiContactsLine,
  RiIdCardLine,
  RiPassportLine,
  RiAccountCircleLine,
  RiUserSmileLine,
  RiSurveyLine,
  RiQuestionLine,
  RiBookLine,
  RiBookmarkLine,
  RiPagesLine,
  RiLayoutLine,
  RiApps2Line,
  RiPlugLine,
  RiComputerLine,
  RiServerLine,
  RiDatabase2Line,
  RiCloudLine,
  RiApiLine,
  RiCodeLine,
  RiFolderChartLine,
  RiUserHeartLine,
  RiUserFollowLine,
  RiBankCardLine,
  RiMenu4Line,
} from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { doAdminLogout, getAdminUserId } from '@/app/api/auth';
import { getAllMenuDetails } from '@/app/redux/slices/authSlice';
import { adminuserLogin } from '@/app/redux/slices/adminMasterSlice';

/* ── Comprehensive keyword → icon map ── */
const ICON_MAP = [
  { keys: ['dashboard', 'home', 'overview', 'main', 'index'], icon: RiDashboardLine },
  { keys: ['landing', 'welcome'], icon: RiHome2Line },
  { keys: ['all user', 'allusers', 'all-user'], icon: RiGroupLine },
  { keys: ['user detail', 'user info', 'user profile'], icon: RiFileUserLine },
  { keys: ['user setting', 'user manage'], icon: RiUserSettingsLine },
  { keys: ['member', 'subscriber'], icon: RiUserStarLine },
  { keys: ['add user', 'new user', 'register', 'signup'], icon: RiUserAddLine },
  { keys: ['admin', 'administrator', 'superadmin'], icon: RiAdminLine },
  { keys: ['team', 'staff', 'employee', 'agent'], icon: RiTeamLine },
  { keys: ['contact', 'contacts', 'address book'], icon: RiContactsLine },
  { keys: ['user', 'account', 'profile', 'member'], icon: RiUserLine },
  { keys: ['kyc', 'identity', 'verification', 'id card', 'passport'], icon: RiIdCardLine },
  { keys: ['customer management', 'customer manage', 'customer'], icon: RiUserHeartLine },
  { keys: ['manage affiliates', 'affiliate management', 'affiliate'], icon: RiUserFollowLine },
  { keys: ['income', 'earning', 'revenue', 'profit'], icon: RiMoneyDollarCircleLine },
  { keys: ['wallet', 'balance'], icon: RiWalletLine },
  { keys: ['bank', 'banking', 'account'], icon: RiBankLine },
  { keys: ['withdraw', 'withdrawal', 'payout'], icon: RiRefundLine },
  { keys: ['deposit', 'fund', 'topup', 'top-up', 'add fund'], icon: RiHandCoinLine },
  { keys: ['transfer', 'exchange', 'transaction'], icon: RiExchangeLine },
  { keys: ['invest', 'investment'], icon: RiStockLine },
  { keys: ['trading', 'trade', 'roi', 'return'], icon: RiLineChartLine },
  { keys: ['coin', 'crypto', 'token', 'currency'], icon: RiCoinLine },
  { keys: ['fund', 'mutual', 'portfolio'], icon: RiFundsLine },
  { keys: ['commission', 'bonus', 'reward', 'incentive', 'referral bonus'], icon: RiPercentLine },
  { keys: ['package', 'plan', 'subscription', 'membership'], icon: RiArchiveLine },
  { keys: ['coupon', 'voucher', 'promo', 'discount'], icon: RiCouponLine },
  { keys: ['price', 'pricing', 'rate'], icon: RiPriceTag3Line },
  { keys: ['gift', 'bonus'], icon: RiGiftLine },
  { keys: ['payment & transaction', 'payment transaction', 'payment', 'transaction'], icon: RiBankCardLine },
  { keys: ['report', 'reports'], icon: RiFileChartLine },
  { keys: ['analytics', 'analysis', 'statistic', 'stats'], icon: RiBarChart2Line },
  { keys: ['chart', 'graph'], icon: RiPieChartLine },
  { keys: ['bar chart', 'sales chart'], icon: RiBarChartLine },
  { keys: ['summary', 'statement'], icon: RiFilePaperLine },
  { keys: ['survey', 'poll', 'feedback'], icon: RiSurveyLine },
  { keys: ['log', 'audit', 'activity log'], icon: RiFileListLine },
  { keys: ['assets management', 'assets manage', 'asset management', 'assets'], icon: RiFolderChartLine },
  { keys: ['genealogy', 'tree', 'network tree', 'downline tree'], icon: RiTreeLine },
  { keys: ['network', 'mlm', 'matrix', 'binary'], icon: RiStackLine },
  { keys: ['downline', 'referral', 'refer', 'sponsor'], icon: RiFlowChart },
  { keys: ['level', 'rank', 'tier', 'generation'], icon: RiMedal2Line },
  { keys: ['team business', 'group business'], icon: RiBriefcaseLine },
  { keys: ['business', 'total business'], icon: RiBuilding2Line },
  { keys: ['setting', 'configuration', 'config', 'preference'], icon: RiSettings3Line },
  { keys: ['general setting', 'site setting', 'system setting'], icon: RiSettingsLine },
  { keys: ['security', 'permission', 'access'], icon: RiShieldLine },
  { keys: ['role', 'privilege'], icon: RiShieldUserLine },
  { keys: ['password', 'pin', 'otp', 'token'], icon: RiLockLine },
  { keys: ['api', 'api key', 'api setting'], icon: RiKeyLine },
  { keys: ['tool', 'utility'], icon: RiToolsLine },
  { keys: ['menu management', 'menu manage', 'menu'], icon: RiMenu4Line },
  { keys: ['notification', 'alert', 'push'], icon: RiNotificationBadgeLine },
  { keys: ['mail', 'email', 'smtp'], icon: RiMailLine },
  { keys: ['message', 'inbox', 'sms'], icon: RiMessage2Line },
  { keys: ['chat', 'support chat', 'live chat'], icon: RiChat3Line },
  { keys: ['support', 'ticket', 'helpdesk', 'help'], icon: RiHeadphoneLine },
  { keys: ['announcement', 'broadcast', 'news'], icon: RiNotificationLine },
  { keys: ['page', 'cms', 'content', 'static page'], icon: RiPagesLine },
  { keys: ['blog', 'article', 'post'], icon: RiNewspaperLine },
  { keys: ['banner', 'slider', 'slideshow'], icon: RiSlideshowLine },
  { keys: ['gallery', 'media', 'image'], icon: RiGalleryLine },
  { keys: ['video', 'tutorial'], icon: RiVideoLine },
  { keys: ['faq', 'question', 'help page'], icon: RiQuestionLine },
  { keys: ['document', 'doc', 'manual'], icon: RiBookLine },
  { keys: ['term', 'privacy', 'policy'], icon: RiFileTextLine },
  { keys: ['server', 'hosting'], icon: RiServerLine },
  { keys: ['database', 'db', 'backup'], icon: RiDatabase2Line },
  { keys: ['cloud', 'storage'], icon: RiCloudLine },
  { keys: ['plugin', 'extension', 'addon', 'integration'], icon: RiPlugLine },
  { keys: ['app', 'application', 'module'], icon: RiApps2Line },
  { keys: ['layout', 'theme', 'template'], icon: RiLayoutLine },
  { keys: ['qr', 'qr code', 'barcode', 'scan'], icon: RiQrCodeLine },
  { keys: ['order', 'purchase'], icon: RiShoppingCartLine },
  { keys: ['product', 'item', 'shop', 'store', 'ecommerce'], icon: RiStoreLine },
  { keys: ['shipping', 'delivery', 'dispatch', 'logistics'], icon: RiTruckLine },
  { keys: ['history', 'past', 'old', 'archive'], icon: RiHistoryLine },
  { keys: ['schedule', 'calendar', 'event', 'appointment'], icon: RiCalendarEventLine },
  { keys: ['task', 'todo', 'checklist'], icon: RiListCheck2 },
  { keys: ['award', 'achievement', 'badge'], icon: RiAwardLine },
  { keys: ['rating', 'review', 'star'], icon: RiStarLine },
  { keys: ['map', 'location', 'region', 'country', 'city'], icon: RiMapPinLine },
  { keys: ['global', 'world', 'international', 'language'], icon: RiGlobalLine },
  { keys: ['time', 'duration', 'period'], icon: RiTimeLine },
  { keys: ['link', 'affiliate', 'url', 'share'], icon: RiLinksLine },
  { keys: ['search', 'find', 'lookup'], icon: RiSearchLine },
  { keys: ['filter', 'sort'], icon: RiFilterLine },
  { keys: ['export', 'download'], icon: RiDownload2Line },
  { keys: ['import', 'upload'], icon: RiUpload2Line },
  { keys: ['delete', 'remove', 'trash'], icon: RiDeleteBinLine },
  { keys: ['edit', 'update', 'modify'], icon: RiEditLine },
  { keys: ['view', 'detail', 'preview'], icon: RiEyeLine },
  { keys: ['toggle', 'enable', 'disable', 'status'], icon: RiToggleLine },
];

const getIconForLabel = (label = '') => {
  const normalized = label.toLowerCase().trim();
  for (const entry of ICON_MAP) {
    if (entry.keys.some(k => normalized.includes(k))) return entry.icon;
  }
  return RiDashboardLine;
};

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ Create ref
  const inputRef = useRef(null);

  const menuData = useSelector((state) => state.auth.menuData);

  useEffect(() => {
    const adminUserId = getAdminUserId();
    if (adminUserId) {
      dispatch(getAllMenuDetails(adminUserId));
    }
  }, [dispatch]);

  // ✅ ULTIMATE FIX: Handle change with setTimeout to ensure focus
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: "" }));
    }
    // ✅ Force focus after state update using setTimeout
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const result = await dispatch(adminuserLogin({ username })).unwrap();

      if (result.statusCode === 200) {
        const AuthLogin = result?.data?.AuthLogin;
        const AuthPass = result?.data?.AuthPass;
        const url = `https://xoxofx.com/user/login?username=${AuthLogin}&password=${AuthPass}`;
        window.open(url, '_blank');
        setUsername("");
        setErrors({});
      } else {
        setErrors({
          username: result?.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrors({
        username: error?.message || error?.response?.data?.message || "Login failed",
      });
    }
  };

  const handleLogout = () => {
    doAdminLogout();
    window.location.href = '/admin';
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const getMenuItems = () => {
    if (menuData && menuData.data) {
      return menuData.data.map((menu) => {
        const label = menu.menuName || menu.label || menu.title || '';
        return {
          id: menu.menuId,
          icon: getIconForLabel(label),
          label,
          href: menu.pageName ? `/admin/${menu.pageName}` : '#',
          subMenus: (menu.subMenus || []).map((sub) => ({
            ...sub,
            icon: getIconForLabel(sub.subMenuName || ''),
          })),
        };
      });
    }
    return [
      { id: 'dashboard', icon: RiDashboardLine, label: 'Dashboard', href: '/admin/Dashboard', subMenus: [] },
      { id: 'all-users', icon: RiGroupLine, label: 'All Users', href: '/admin/all-users', subMenus: [] },
      { id: 'users', icon: RiUserLine, label: 'Users', href: '/admin/users', subMenus: [] },
    ];
  };

  const renderMenuItem = (item, isMobile = false) => {
    const isActive = pathname === item.href;
    const hasSubMenus = item.subMenus && item.subMenus.length > 0;
    const isExpanded = expandedMenus[item.id];

    return (
      <li key={item.id || item.href}>
        <div className="flex items-center gap-1">
          <Link
            href={item.href}
            onClick={
              hasSubMenus
                ? (e) => { e.preventDefault(); toggleMenu(item.id); }
                : isMobile ? closeMobileMenu : undefined
            }
            title={isCollapsed && !isMobile ? item.label : undefined}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200 flex-1 overflow-hidden
              ${isActive
                ? 'bg-white/15 text-white shadow-inner shadow-white/10'
                : 'text-teal-100/80 hover:bg-white/10 hover:text-white'
              }
              ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}
            `}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-full" />
            )}
            <span className={`flex-shrink-0 transition-transform duration-200
              ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              <item.icon className="text-[1.2rem]" />
            </span>
            {(!isCollapsed || isMobile) && (
              <span className="font-semibold text-sm leading-none whitespace-nowrap">{item.label}</span>
            )}
            {isActive && isCollapsed && !isMobile && (
              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </Link>

          {hasSubMenus && (!isCollapsed || isMobile) && (
            <button
              onClick={() => toggleMenu(item.id)}
              className="p-1.5 rounded-lg text-teal-100/60 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
            >
              <span className={`block transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                <RiArrowDownSLine className="text-base" />
              </span>
            </button>
          )}
        </div>

        {hasSubMenus && isExpanded && (!isCollapsed || isMobile) && (
          <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-white/10 pl-3">
            {item.subMenus.map((subMenu) => {
              const subMenuHref = subMenu.subMenuPageName ? `/admin/${subMenu.subMenuPageName}` : '#';
              const isSubActive = pathname === subMenuHref;
              const SubIcon = subMenu.icon || getIconForLabel(subMenu.subMenuName || '');
              return (
                <li key={subMenu.subMenuId || subMenu.subMenuName}>
                  <Link
                    href={subMenuHref}
                    onClick={isMobile ? closeMobileMenu : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                      transition-all duration-200
                      ${isSubActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-teal-100/70 hover:bg-white/10 hover:text-white font-medium'
                      }
                    `}
                  >
                    <SubIcon className={`text-base flex-shrink-0
                      ${isSubActive ? 'text-white' : 'text-teal-200/70'}`} />
                    <span className="truncate">{subMenu.subMenuName}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center border-b border-white/10 flex-shrink-0
        ${isCollapsed && !isMobile ? 'justify-center p-3' : 'justify-between p-4'}`}>
        {(!isCollapsed || isMobile) && (
          <Link href="/admin" onClick={isMobile ? closeMobileMenu : undefined} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner shadow-white/10 group-hover:bg-white/30 transition-colors">
              <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <div className="leading-none">
              <p className="font-black text-white text-base tracking-tight">Admin</p>
              <p className="text-[10px] text-teal-200/70 font-semibold tracking-widest uppercase mt-0.5">Panel</p>
            </div>
          </Link>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-teal-100/70 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer flex-shrink-0"
          >
            {isCollapsed ? <RiMenuUnfoldLine className="text-lg" /> : <RiMenuFoldLine className="text-lg" />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={closeMobileMenu}
            className="p-1.5 rounded-lg text-teal-100/70 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer"
          >
            <RiCloseLine className="text-xl" />
          </button>
        )}
      </div>

    

      {(!isCollapsed || isMobile)
        ? <p className="px-5 pt-5 pb-2 text-[10px] font-black tracking-[0.18em] uppercase text-teal-200/50">Navigation</p>
        : <div className="pt-4" />
      }

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2
        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <ul className="space-y-0.5">
          {getMenuItems().map((item) => renderMenuItem(item, isMobile))}
        </ul>
      </nav>

      <div className={`flex-shrink-0 border-t border-white/10 ${isCollapsed && !isMobile ? 'p-2' : 'p-3'}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed && !isMobile ? 'Logout' : undefined}
          className={`group flex items-center gap-3 w-full rounded-xl px-3 py-2.5
            text-teal-100/70 hover:text-red-300 hover:bg-red-500/15
            transition-all duration-200 cursor-pointer
            ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}`}
        >
          <RiLogoutBoxLine className="text-[1.15rem] flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          {(!isCollapsed || isMobile) && <span className="font-semibold text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  const noiseStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
    backgroundSize: '120px',
  };

  const sidebarBase = `bg-gradient-to-b from-[#0d9488] via-[#0a8a7e] to-[#0a7c71] shadow-xl shadow-teal-900/30`;

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex items-center justify-center
          rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white
          shadow-lg shadow-teal-900/30 hover:shadow-teal-900/50 hover:scale-105
          active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Open menu"
      >
        <RiMenuLine className="text-xl" />
      </button>

      <div
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <aside className={`fixed left-0 top-0 h-screen z-50 lg:hidden w-64 flex flex-col
        ${sidebarBase} transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={noiseStyle} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-white/5 pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col">
          <SidebarContent isMobile={true} />
        </div>
      </aside>

      <aside className={`fixed left-0 top-0 h-screen z-40 hidden lg:flex flex-col
        ${sidebarBase} transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={noiseStyle} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-white/5 pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col">
          <SidebarContent isMobile={false} />
        </div>
      </aside>
    </>
  );
}