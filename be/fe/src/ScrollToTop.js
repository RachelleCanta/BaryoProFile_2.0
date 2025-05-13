import { useEffect, useState } from "react";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 200);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          padding: "10px 15px",
          fontSize: "14px",
          zIndex: 9999,
          width: "max-content",
        }}
      >
        ⬆️ Scroll To Top
      </button>
    )
  );
}

export default ScrollToTopButton;
