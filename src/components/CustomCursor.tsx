import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleEnter = () => setHovered(true);
    const handleLeave = () => setHovered(false);

    window.addEventListener("mousemove", move);

    const targets = document.querySelectorAll("a, button, [role='button']");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [visible]);

  if (typeof window === "undefined") return null;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <motion.div
        animate={{
          x: position.x - (hovered ? 20 : 12),
          y: position.y - (hovered ? 20 : 12),
          width: hovered ? 40 : 24,
          height: hovered ? 40 : 24,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          borderRadius: "50%",
          border: "1.5px solid #D68A4E",
          pointerEvents: "none",
          zIndex: 999999,
          mixBlendMode: "normal",
        }}
      />
      <motion.div
        animate={{
          x: position.x - 3,
          y: position.y - 3,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.2 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "#D68A4E",
          pointerEvents: "none",
          zIndex: 999999,
        }}
      />
    </>
  );
}
