// app/admin/layout.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/adminAuth";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드", icon: "◈" },
  { href: "/admin/concerts", label: "공연 관리", icon: "♪" },
  { href: "/admin/bands", label: "밴드 관리", icon: "★" },
  { href: "/admin/venues", label: "공연장 관리", icon: "◉" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 로그인 페이지는 인증 체크 스킵
    if (pathname === "/admin") {
      setReady(true);
      return;
    }
    if (!isAdminAuthenticated()) {
      router.replace("/admin");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  // 로그인 페이지는 사이드바 없이 렌더링
  if (pathname === "/admin") {
    return <>{ready && children}</>;
  }

  if (!ready) return null;

  const handleLogout = () => {
    clearAdminSession();
    router.replace("/admin");
  };

  return (
    <div className={styles.adminWrap}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <p className={styles.sidebarLogo}>KBAND</p>
          <p className={styles.sidebarSub}>관리자</p>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${pathname.startsWith(href) ? styles.navActive : ""}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
