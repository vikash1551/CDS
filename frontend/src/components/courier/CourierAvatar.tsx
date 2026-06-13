import { motion } from "framer-motion";

export function CourierAvatar({ gender, size = 56, isMoving = false }: { gender: "male" | "female"; size?: number; isMoving?: boolean }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0 rounded-full" style={{ background: "var(--color-brand)", opacity: 0.3 }}
        animate={{ scale: isMoving ? [1, 1.6, 1] : [1, 1.3, 1], opacity: isMoving ? [0.4, 0, 0.4] : [0.2, 0, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute inset-1 flex items-center justify-center rounded-full border-2 border-white shadow-pop"
        style={{ background: "var(--gradient-brand)" }}
        animate={isMoving ? { scale: [1, 1.05, 1], y: [0, -2, 0] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
        <span style={{ fontSize: size * 0.45 }}>{gender === "male" ? "👨" : "👩"}</span>
      </motion.div>
      <motion.div className="absolute bottom-0 right-0 rounded-full border-2"
        style={{ width: size * 0.22, height: size * 0.22, background: "var(--color-success)", borderColor: "var(--color-card)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      <div className="absolute -right-1 -top-1 flex items-center justify-center rounded-full shadow-soft"
        style={{ width: size * 0.32, height: size * 0.32, background: "var(--color-card)", fontSize: size * 0.18 }}>🎒</div>
    </div>
  );
}
