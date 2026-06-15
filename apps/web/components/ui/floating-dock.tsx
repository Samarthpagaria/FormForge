"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";

export type DockSubItem = { title: string; href: string; icon?: React.ReactNode };
export type DockItem = { title: string; icon: React.ReactNode; href: string; subItems?: DockSubItem[] };

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  children,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  children?: React.ReactNode;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName}>
        {children}
      </FloatingDockDesktop>
      <FloatingDockMobile items={items} className={mobileClassName}>
        {children}
      </FloatingDockMobile>
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  children,
}: {
  items: DockItem[];
  className?: string;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
      {children && <div className="ml-2">{children}</div>}
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  children,
}: {
  items: DockItem[];
  className?: string;
  children?: React.ReactNode;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-white border border-neutral-200 shadow-lg shadow-neutral-200/50 px-4 pb-3 md:flex dark:bg-neutral-900 dark:border-neutral-800",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
      {children && (
        <div className="flex items-center h-10 mb-0 ml-2 border-l border-neutral-200 pl-4">
          {children}
        </div>
      )}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  subItems,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  subItems?: DockSubItem[];
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 56, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 56, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 28, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 28, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const innerContent = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className={`absolute left-1/2 -translate-x-1/2 ${
              subItems ? "bottom-full mb-4 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900" : "-top-8 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre dark:border-neutral-900 dark:bg-neutral-800"
            } text-neutral-700 dark:text-white z-50`}
          >
            {subItems ? (
              <div className="flex flex-col">
                <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                  {title}
                </div>
                <div className="flex flex-col gap-1">
                  {subItems.map((sub, i) => (
                    <a
                      key={i}
                      href={sub.href}
                      className="flex items-center gap-2.5 px-2 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    >
                      {sub.icon && <span className="w-4 h-4 flex items-center justify-center text-neutral-500">{sub.icon}</span>}
                      {sub.title}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              title
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="relative">
      {!subItems ? (
        <a href={href}>{innerContent}</a>
      ) : (
        innerContent
      )}
    </div>
  );
}
