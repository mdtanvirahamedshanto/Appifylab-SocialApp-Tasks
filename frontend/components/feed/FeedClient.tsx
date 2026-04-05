"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import HeaderNav from "./HeaderNav";
import MobileNav from "./MobileNav";
import LeftSidebar from "./LeftSidebar";
import MiddleColumn from "./MiddleColumn";
import RightSidebar from "./RightSidebar";

export default function FeedClient() {
  const auth = useAuth();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTimelineMenu, setShowTimelineMenu] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.replace("/login");
    }
  }, [auth.isLoading, auth.user, router]);

  if (auth.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading session...</div>;
  }

  if (!auth.user) {
    return null;
  }

  const displayName = `${auth.user.firstName} ${auth.user.lastName}`;

  return (
    <div className={`_layout _layout_main_wrapper ${isDarkMode ? "_dark_wrapper" : ""}`}>
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link" onClick={() => setIsDarkMode((prev) => !prev)}>
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1" />
          <div className="_layout_change_btn_ic2" />
        </button>
      </div>

      <div className="_main_layout">
        <HeaderNav
          displayName={displayName}
          showNotify={showNotify}
          showProfileMenu={showProfileMenu}
          onToggleNotify={() => setShowNotify((prev) => !prev)}
          onToggleProfile={() => setShowProfileMenu((prev) => !prev)}
          onLogout={async () => {
            await auth.logout();
            router.replace("/login");
          }}
        />

        <MobileNav />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <MiddleColumn
                  showTimelineMenu={showTimelineMenu}
                  onToggleTimeline={() => setShowTimelineMenu((prev) => !prev)}
                />
              </div>

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
