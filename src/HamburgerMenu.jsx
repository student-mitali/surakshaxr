import { useState } from "react";

export default function HamburgerMenu({ setScreen }) {
  const [open, setOpen] = useState(false);

  const goTo = (screenName) => {
    setScreen(screenName);
    setOpen(false);
  };

  return (
    <>
      {/* The 3-line button */}
      <button onClick={() => setOpen(true)} className="hamburger-btn" aria-label="Open menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Dark overlay behind the menu */}
      {open && <div className="menu-overlay" onClick={() => setOpen(false)}></div>}

      {/* Slide-out panel */}
      <div className={`menu-panel ${open ? "menu-open" : ""}`}>
        <button className="menu-close" onClick={() => setOpen(false)} aria-label="Close menu">
          ✕
        </button>

        <nav className="menu-links">
          <button onClick={() => goTo("home")}>Home</button>
          <button onClick={() => goTo("module")}>Training Module</button>
          <button onClick={() => goTo("assessment")}>Assessment</button>
          <button onClick={() => goTo("result")}>Result</button>
        </nav>
      </div>
    </>
  );
}