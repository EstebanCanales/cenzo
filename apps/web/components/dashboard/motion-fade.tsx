"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function MotionFade({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
}

