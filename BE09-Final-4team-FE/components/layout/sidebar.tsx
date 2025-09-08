"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { defaultMenuItems, MenuItem } from "@/lib/navigation";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAccessToken, clearAccessToken } from "@/lib/services/common/api-client";
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  Megaphone,
  ClipboardList,
  FileText,
  Settings,
  Building,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Home,
  Users,
  Briefcase,
  Calendar,
  Megaphone,
  ClipboardList,
  FileText,
  Settings,
  Building,
  Clock,
};

interface SidebarProps {
  onMenuItemClick?: (index: number) => void;
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  onMenuItemClick,
  isOpen = true,
  isMobile = false,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [toggledItems, setToggledItems] = useState<Set<number>>(new Set());
  const { isAdmin } = useAuth();
  const [tokenUpdate, setTokenUpdate] = useState(0);

  const isActive = (href: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // 비관리자는 설정 메뉴 숨김
  const visibleMenuItems = useMemo(() => {
    if (isAdmin) return defaultMenuItems;
    return defaultMenuItems.filter((item) => item.href !== "/settings");
  }, [isAdmin]);

  // 자식(하위 메뉴) 중 현재 경로와 매칭되는 것이 있는지 재귀 검사
  const hasActiveDescendant = (item?: MenuItem): boolean => {
    if (!item) return false;
    if (item.href && isActive(item.href)) return true;
    return (item.children ?? []).some((c) => hasActiveDescendant(c));
  };

  // 경로가 바뀔 때, 해당 경로를 포함하는 상위 메뉴를 자동으로 펼침
  useEffect(() => {
    const autoOpen = new Set<number>();
    defaultMenuItems.forEach((item, i) => {
      if (hasActiveDescendant(item)) autoOpen.add(i);
    });
    setExpandedItems((prev) => {
      // 사용자가 직접 토글한 상태는 유지 + 경로 기준 자동 오픈 병합
      const merged = new Set(prev);
      autoOpen.forEach((i) => merged.add(i));
      return merged;
    });
    // Settings 이외 페이지로 가도 굳이 닫지 않음(요구사항: 하위 페이지에선 유지)
    // 필요 시 아래 주석 해제하여 Settings 밖에서는 접히게 할 수 있음
    // if (!pathname.startsWith("/settings")) setExpandedItems(new Set());
  }, [pathname]); // 경로 바뀔 때마다 재평가

  const handleMenuClick = (item: MenuItem, index: number) => {
    if (item.children?.length) {
      // 하위 메뉴가 있는 경우: 토글만
      setExpandedItems((prev) => {
        const ns = new Set(prev);
        ns.has(index) ? ns.delete(index) : ns.add(index);
        return ns;
      });
      setToggledItems((prev) => new Set(prev).add(index));
      // 페이지 이동 로직 제거 - 토글만 하도록
    } else if (item.href) {
      // 하위 메뉴가 없는 경우: 페이지 이동
      router.push(item.href);
      onMenuItemClick?.(index);
      if (isMobile) onClose?.();
    }
  };

  const handleSubMenuClick = (item: MenuItem) => {
    if (item.href) {
      router.push(item.href);
      if (isMobile) onClose?.();
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl shadow-xl border-r border-gray-200/50 transition-all duration-300 ${
        isMobile
          ? `w-80 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`
          : `w-72 ${isOpen ? "translate-x-0" : "-translate-x-full"}`
      }`}
    >
      <div className="p-4 sm:p-6">
        {/* Hermes Logo */}
        <div className="flex flex-col items-center mb-6">
          <span className="mt-2 text-xl sm:text-2xl font-extrabold text-gray-800 tracking-wide">
            Hermes
          </span>
        </div>
        {/* Company Info */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Company</span>
        </div>
        {/* Navigation */}
        <nav className="space-y-2">
          {visibleMenuItems.map((item, index) => {
            const IconComponent = iconMap[item.icon];
            const active = isActive(item.href || "");
            const hasChildren = !!item.children?.length;

            // “토글로 펼친 상태” 또는 “자식 중 활성 경로가 있는 상태”면 펼침 유지
            const isExpanded =
              expandedItems.has(index) ||
              (hasChildren && hasActiveDescendant(item));

            return (
              <div key={index}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start h-12 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  }`}
                  onClick={() => handleMenuClick(item, index)}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.label}
                  {hasChildren && (
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </Button>

                {hasChildren && isExpanded && (
                  <div className="mt-1 space-y-1">
                    {item.children!.map((subItem, subIndex) => {
                      const SubIconComponent = iconMap[subItem.icon];
                      const subActive = isActive(subItem.href || "");
                      return (
                        <Button
                          key={subIndex}
                          variant={subActive ? "default" : "ghost"}
                          className={`w-full justify-start h-10 text-xs font-medium transition-all duration-200 cursor-pointer ${
                            subActive
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                          } ml-4`}
                          onClick={() => handleSubMenuClick(subItem)}
                        >
                          <SubIconComponent className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Access Token Display - Dev only */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs font-medium text-gray-600 mb-1">
              Access Token:
            </div>
            <div className="text-xs text-gray-800 break-all font-mono">
              {getAccessToken() ?? "No token"}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full text-xs"
              onClick={() => {
                clearAccessToken()
                setTokenUpdate(prev => prev + 1)
              }}
            >
              Clear Token
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
