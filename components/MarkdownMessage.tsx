"use client";

import React from "react";

interface MarkdownMessageProps {
  content: string;
}

// Minimal, fast markdown-like renderer tailored for TrekMate's assistant messages.
// Supports:
// - Headings when a line is fully bold (e.g., **Title** or **Title:**)
// - Paragraphs
// - Bulleted lists (- item)
// - Numbered lists (1. item)
// - Inline bold **text**
export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  const lines = content.split(/\r?\n/);

  type Block =
    | { type: "heading"; text: string }
    | { type: "paragraph"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] };

  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i].trimEnd();
    const line = raw.trim();

    // Empty line -> paragraph break
    if (line.length === 0) {
      i++;
      continue;
    }

    // Heading: whole line bold like **Heading** or **Heading:**
    const headingMatch = line.match(/^\*\*(.+?)\*\*:?$/);
    if (headingMatch) {
      blocks.push({ type: "heading", text: headingMatch[1].trim() });
      i++;
      continue;
    }

    // Unordered list
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (/^-\s+/.test(l)) {
          items.push(l.replace(/^-[\s]+/, ""));
          i++;
        } else if (l.length === 0) {
          i++;
          break;
        } else {
          break;
        }
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (/^\d+\.\s+/.test(l)) {
          items.push(l.replace(/^\d+\.[\s]+/, ""));
          i++;
        } else if (l.length === 0) {
          i++;
          break;
        } else {
          break;
        }
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph: eat consecutive non-list, non-heading lines
    const para: string[] = [raw];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      const t = next.trim();
      if (t.length === 0 || /^-\s+/.test(t) || /^\d+\.\s+/.test(t) || /^\*\*(.+?)\*\*:?$/.test(t)) {
        break;
      }
      para.push(next);
      i++;
    }
    blocks.push({ type: "paragraph", text: para.join("\n") });
  }

  // Inline bold renderer (**text**)
  function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    // Simple non-greedy match for bold pairs
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = boldRegex.exec(text)) !== null) {
      const [full, boldText] = match;
      const start = match.index;
      const end = start + full.length;
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      parts.push(<strong key={start} className="font-semibold">{boldText}</strong>);
      lastIndex = end;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }

  return (
    <div className="space-y-3">
      {blocks.map((b, idx) => {
        if (b.type === "heading") {
          return (
            <h4 key={idx} className="bold-16 text-gray-90">
              {b.text}
            </h4>
          );
        }
        if (b.type === "paragraph") {
          return (
            <p key={idx} className="regular-14 text-gray-90 whitespace-pre-line">
              {renderInline(b.text)}
            </p>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 regular-14 text-gray-90">
              {b.items.map((it, i2) => (
                <li key={i2}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1 regular-14 text-gray-90">
              {b.items.map((it, i2) => (
                <li key={i2}>{renderInline(it)}</li>
              ))}
            </ol>
          );
        }
        return null;
      })}
    </div>
  );
}


