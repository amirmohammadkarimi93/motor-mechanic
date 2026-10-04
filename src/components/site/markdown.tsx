"use client";

import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";

interface MarkdownProps {
  content: string;
  className?: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .replace(/[`*_~#>]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .toLowerCase();
}

function Heading2({ children }: { children?: React.ReactNode }) {
  const id = slugify(extractText(children));
  return (
    <h2
      id={id}
      className="font-display text-xl md:text-2xl font-bold text-foreground mt-8 mb-4 pb-2 border-b-2 border-brand-500/40 relative scroll-mt-24"
    >
      <span className="absolute right-0 -bottom-0.5 w-12 h-0.5 bg-brand-500" />
      {children}
    </h2>
  );
}

function Heading3({ children }: { children?: React.ReactNode }) {
  const id = slugify(extractText(children));
  return (
    <h3
      id={id}
      className="font-display text-lg md:text-xl font-bold text-foreground mt-6 mb-3 flex items-center gap-2 scroll-mt-24"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
      {children}
    </h3>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={
        "prose-motor leading-relaxed text-foreground/90 text-[15px] md:text-base " +
        (className ?? "")
      }
    >
      <ReactMarkdown
        components={{
          h2: ({ children }) => <Heading2>{children}</Heading2>,
          h3: ({ children }) => <Heading3>{children}</Heading3>,
          h4: ({ children }) => (
            <h4 className="font-display text-base md:text-lg font-bold text-foreground mt-5 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-7 text-foreground/85 text-pretty">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 pr-2 list-none">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 pr-6 list-decimal marker:text-brand-600 marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 leading-7 text-foreground/85">
              <span className="mt-2.5 shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          a: ({ children, href }) =>
            href ? (
              <Link
                href={href}
                className="text-brand-700 hover:text-brand-800 underline underline-offset-4 decoration-brand-300 inline-flex items-center gap-1"
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {children}
              </Link>
            ) : (
              <span>{children}</span>
            ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground bg-brand-50/80 px-1.5 py-0.5 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 py-4 pr-5 pl-3 border-r-4 border-brand-500 bg-brand-50/60 rounded-l-lg rounded-r-md text-foreground/90 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code
              dir="ltr"
              className="inline-block px-2 py-0.5 rounded bg-ink/90 text-brand-300 text-[13px] font-mono"
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre
              dir="ltr"
              className="my-6 p-4 rounded-lg bg-ink text-white/90 overflow-x-auto text-sm font-mono border border-white/10"
            >
              {children}
            </pre>
          ),
          hr: () => (
            <hr className="my-8 border-t border-dashed border-border" />
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-right text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted text-foreground font-bold">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="p-3 text-right">{children}</th>,
          td: ({ children }) => <td className="p-3 border-t border-border">{children}</td>,
          img: ({ src, alt }) =>
            src ? (
              <img
                src={typeof src === "string" ? src : ""}
                alt={alt || ""}
                className="my-6 rounded-xl border border-border shadow-md w-full h-auto"
                loading="lazy"
              />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
