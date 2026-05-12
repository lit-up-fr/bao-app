"use client";

import { useRef, useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
}

const LIT_UP_COLORS = [
  { label: "Teal", color: "#00989D" },
  { label: "Anthracite", color: "#2B3442" },
  { label: "Jaune", color: "#FCC33E" },
  { label: "Violet", color: "#6B2468" },
  { label: "Noir", color: "#000000" },
];

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const lastValueRef = useRef(value);

  // Set initial content once, or when value changes externally (loading data)
  useEffect(() => {
    if (!editorRef.current) return;
    // Only set innerHTML if the value changed externally (not from our own edits)
    if (value !== lastValueRef.current || !initializedRef.current) {
      if (!initializedRef.current || (editorRef.current.innerHTML !== value && !document.activeElement?.closest("[contenteditable]"))) {
        editorRef.current.innerHTML = value || "";
        initializedRef.current = true;
        lastValueRef.current = value;
      }
    }
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
  }, []);

  const insertTextAtCursor = useCallback((text: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  // Only sync to parent on blur (when user leaves the field)
  const handleBlur = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const btnStyle: React.CSSProperties = {
    height: "28px",
    border: "1.5px solid var(--line-strong)",
    borderRadius: "6px",
    background: "white",
    color: "var(--anthracite)",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    transition: "all 0.1s",
    flexShrink: 0,
    padding: "0 8px",
    gap: "4px",
  };

  const separatorStyle: React.CSSProperties = {
    width: "1px",
    height: "20px",
    background: "var(--line-strong)",
    margin: "0 4px",
    flexShrink: 0,
  };

  return (
    <div style={{ border: "2px solid var(--line-strong)", borderRadius: "10px", overflow: "hidden", background: "white" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "6px 10px",
          borderBottom: "1.5px solid var(--line)",
          background: "var(--blanc)",
          flexWrap: "wrap",
        }}
      >
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} style={btnStyle} title="Gras">
          <strong>G</strong>
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} style={btnStyle} title="Italique">
          <em style={{ fontStyle: "italic" }}>I</em>
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} style={btnStyle} title="Souligner">
          <span style={{ textDecoration: "underline" }}>S</span>
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTextAtCursor("\u00B7"); }} style={{ ...btnStyle, fontSize: "18px", fontWeight: 800 }} title="Point median (ex: un·e)">
          ·
        </button>

        <div style={separatorStyle} />

        {LIT_UP_COLORS.map((c) => (
          <button
            key={c.color}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec("foreColor", c.color); }}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              border: "2px solid var(--line)",
              background: c.color,
              cursor: "pointer",
              flexShrink: 0,
            }}
            title={`Couleur : ${c.label}`}
          />
        ))}

        <div style={separatorStyle} />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
          style={{ ...btnStyle, color: "var(--muted)" }}
          title="Effacer la mise en forme"
        >
          Effacer
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onPaste={handlePaste}
        style={{
          padding: "10px 14px",
          minHeight: `${rows * 24}px`,
          fontSize: "14px",
          fontFamily: "inherit",
          color: "var(--anthracite)",
          lineHeight: 1.6,
          outline: "none",
          overflowY: "auto",
          maxHeight: "400px",
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted);
          font-style: italic;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
