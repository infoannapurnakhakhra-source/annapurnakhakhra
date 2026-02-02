"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BREADCRUMB_LABELS,
  HIDDEN_BREADCRUMB_SEGMENTS,
} from "@/lib/breadcrumbs";

function formatLabel(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Truncate text after maxLength characters
function truncateLabel(label, maxLength = 20) {
  if (label.length > maxLength) {
    return label.slice(0, maxLength) + "...";
  }
  return label;
}

export default function Breadcrumbs({ currentTitle }) {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter(seg => !HIDDEN_BREADCRUMB_SEGMENTS.includes(seg));

  return (
    <>
      <nav className="mb-2 md:mb-6 ml-8 text-sm hidden md:block">
        <ol className="flex items-center flex-wrap gap-2 text-neutral-600">
          <li>
            <Link
              href="/"
              className="breadcrumb-link hover:text-[#7d4b0e] transition"
            >
              Home
            </Link>
          </li>

          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;

            const label = isLast && currentTitle
              ? currentTitle
              : BREADCRUMB_LABELS[segment] || formatLabel(segment);

            return (
              <li key={href} className="flex items-center gap-2">
                <span className="text-neutral-400">/</span>

                {isLast ? (
                  <span className="font-semibold text-[#7d4b0e]">
                    {truncateLabel(label, 45)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="breadcrumb-link hover:text-[#7d4b0e] transition"
                  >
                    {truncateLabel(label, 40)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <style>{`
        .breadcrumb-link {
          position: relative;
        }

        .breadcrumb-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 2px;
          width: 0;
          background-color: #7d4b0e;
          transition: width 0.5s ease;
        }

        .breadcrumb-link:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}
