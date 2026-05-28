import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#0a0a0a",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* IM */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginBottom: "12px",
            }}
          >
            <span style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              color: "#213A70",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}>I</span>
            <span style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              color: "#213A70",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}>M</span>
          </motion.div>

          {/* Design Studio */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              color: "#D68A4E",
              fontSize: "1.6rem",
              fontWeight: "600",
              letterSpacing: "0.05em",
              margin: "0 0 10px 0",
            }}
          >
            Design Studio
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              color: "#D68A4E99",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Where Ink Meets Mind
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
