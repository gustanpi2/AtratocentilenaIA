import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon, PlugInIcon } from "../icons";
import {
  MdLocationOn,
  MdManageAccounts,
  MdPeople,
  MdAttachMoney,
  MdDescription,
  MdLogin,
  MdAppRegistration,
  MdHome,
  MdSensors,
} from "react-icons/md";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type SubItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  icon?: React.ReactNode;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const othersItems: NavItem[] = [
  {
    icon: <PlugInIcon className="w-5 h-5" />,
    name: "Autenticación",
    subItems: [
      { name: "Iniciar sesión", path: "/signin", icon: <MdLogin /> },
      { name: "Registro", path: "/signup", icon: <MdAppRegistration /> },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        icon: <MdHome />,
        name: "Estaciones",
        subItems: [{ name: "Maps", path: "/", icon: <MdLocationOn /> }],
      },
    ];

    if (isAuthenticated && user?.idrol === 1) {
      items.push(
        {
          icon: <MdLocationOn />,
          name: "Estaciones & sensores",
          subItems: [
            { name: "Estaciones", path: "/stations", icon: <MdLocationOn /> },
            { name: "Sensores", path: "/sensors", icon: <MdSensors /> },
          ],
        },
        {
          icon: <MdManageAccounts />,
          name: "Gestión & usuarios",
          subItems: [
            { name: "Usuarios", path: "/users", icon: <MdPeople /> },
            //{ name: "Clientes", path: "/customers", icon: <MdPeople /> },
            {
              name: "Registro Visitas",
              path: "/visits",
              icon: <MdManageAccounts />,
            },
          ],
        },
        {
          icon: <MdDescription />,
          name: "Información y precios",
          subItems: [
            { name: "Comunas", path: "/comunas", icon: <MdLocationOn /> },
            { name: "Precios", path: "/precios", icon: <MdAttachMoney /> },
           // { name: "Documentación", path: "/docs", icon: <MdDescription /> },
          ],
        }
      );
    }
    return items;
  }, [isAuthenticated, user?.idrol]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems?.some((s) => isActive(s.path))) {
          setOpenSubmenu({ type: menuType as "main" | "others", index });
        }
      });
    });
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  // === Estilos ===
  const getMenuItemClasses = (active: boolean) => {
    const base =
      "flex items-center w-full p-2 rounded-lg transition-all duration-200 cursor-pointer text-base";
    const inactive =
      "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";
    const activeStyle =
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold shadow-sm";
    return `${base} ${active ? activeStyle : inactive}`;
  };

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => {
        const key = `${type}-${index}`;
        const isOpen = openSubmenu?.type === type && openSubmenu.index === index;
        const isCurrent = nav.subItems?.some((s) => isActive(s.path));

        return (
          <li key={key}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, type)}
                className={getMenuItemClasses(isCurrent || isOpen)}
              >
                <span
                  className={`w-5 h-5 flex-shrink-0 ${
                    !isSidebarOpen ? "mx-auto" : ""
                  }`}
                >
                  {nav.icon}
                </span>
                <span
                  className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                  }`}
                >
                  {nav.name}
                </span>
                {isSidebarOpen && (
                  <ChevronDownIcon
                    className={`ml-auto w-4 h-4 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-green-600" : "text-gray-400"
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={getMenuItemClasses(isActive(nav.path))}
                >
                  <span className="w-5 h-5 flex-shrink-0">{nav.icon}</span>
                  {isSidebarOpen && (
                    <span className="ml-3">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* Submenú */}
            {nav.subItems && isSidebarOpen && (
              <div
                //@ts-ignore
                ref={(el) => (subMenuRefs.current[key] = el)}
                className="overflow-hidden transition-all duration-300 ml-4"
                style={{ height: isOpen ? `${subMenuHeight[key]}px` : "0px" }}
              >
                <ul className="mt-2 space-y-1 border-l border-gray-200 dark:border-gray-700 ml-2 pl-4">
                  {nav.subItems.map((s) => (
                    <li key={s.name}>
                      <Link
                        to={s.path}
                        className={`flex items-center p-2 rounded-lg text-sm transition-colors duration-200 ${
                          isActive(s.path)
                            ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20"
                            : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className="mr-3 inline-block">
                          {s.icon || (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive(s.path)
                                  ? "bg-green-500"
                                  : "bg-gray-400 dark:bg-gray-500"
                              }`}
                            />
                          )}
                        </span>
                        {s.name}
                        <span className="flex items-center gap-1 ml-auto text-xs font-bold">
                          {s.new && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/40 dark:text-green-400">
                              New
                            </span>
                          )}
                          {s.pro && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full dark:bg-yellow-900/40 dark:text-yellow-400">
                              Pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 
      text-gray-900 dark:text-gray-100 h-screen transition-all duration-300 ease-in-out z-50 
      border-r border-gray-200 dark:border-gray-800 shadow-xl
      ${isSidebarOpen ? "w-[260px] lg:w-[280px]" : "w-[72px]"} 
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-6 px-4 flex items-center transition-all duration-300 
        ${!isSidebarOpen ? "justify-center" : "justify-start gap-3"}`}
      >
        <Link to="/" aria-label="Inicio">
          {!isSidebarOpen ? (
            <img src="/images/mrv_logo.png" alt="Logo Compacto" width={48} />
          ) : (
            <>
              <img
                className="dark:hidden"
                src="/images/LOGO-2-0.png"
                alt="Logo"
                width={150}
              />
              <img
                className="hidden dark:block"
                src="/images/LOGO-2-0-DARK.png"
                alt="Logo Dark"
                width={150}
              />
            </>
          )}
        </Link>
      </div>

      <hr className="border-gray-100 dark:border-gray-800 mx-4" />

      <div className="flex flex-col overflow-y-auto no-scrollbar flex-1 px-4 py-4">
        <nav className="space-y-6">
          <div>
            <h2
              className={`text-gray-400 dark:text-gray-500 uppercase font-bold text-[10px] mb-2 px-2 transition-opacity duration-300
              ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
            >
              Menú Principal
            </h2>
            {renderMenuItems(navItems, "main")}
          </div>

          <div>
            <h2
              className={`text-gray-400 dark:text-gray-500 uppercase font-bold text-[10px] mb-2 px-2 transition-opacity duration-300
              ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
            >
              Más Acciones
            </h2>
            {renderMenuItems(
              isAuthenticated
                ? othersItems.filter((i) => i.name !== "Autenticación")
                : othersItems,
              "others"
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
