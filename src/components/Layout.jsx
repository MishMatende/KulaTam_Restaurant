import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

export default function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);

  // <main> is the scroll container, so reset it on page change
  // (unless we're jumping to an item via #hash).
  useEffect(() => {
    if (!hash) mainRef.current?.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return (
    <>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" ref={mainRef}>
          <Topbar />
          <div className="page">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  );
}
