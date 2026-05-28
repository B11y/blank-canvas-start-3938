import { motion } from "framer-motion";

const items = [
  "BRANDING",
  "LOGO DESIGN",
  "VISUAL IDENTITY",
  "SOCIAL MEDIA",
  "PRINT DESIGN",
  "PACKAGING",
  "UI/UX",
  "TYPOGRAPHY",
];

export default function Marquee() {
  const repeated = [...items, ...items, ...items];

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        borderTop: "1px solid #D68A4E33",
        borderBottom: "1px solid #D68A4E33",
        padding: "14px 0",
        backgroundColor: "transparent",
      }}
    >
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          display: "flex",
          gap: "0",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              color: i % 2 === 0 ? "#D68A4E" : "#D68A4E66",
              padding: "0 2.5rem",
              fontWeight: "500",
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
