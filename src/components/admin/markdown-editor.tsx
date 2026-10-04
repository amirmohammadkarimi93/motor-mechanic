"use client";

import { MDXEditor, type MDXEditorMethods } from "@mdxeditor/editor";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  UndoRedo,
  CreateLink,
  InsertImage,
  InsertCodeBlock,
  InsertThematicBreak,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import * as React from "react";

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Markdown editor wrapper around MDXEditor for Persian admin content.
 * Provides a clean toolbar with bold/italic/lists/headings/links/images.
 */
export function MarkdownEditor({
  value = "",
  onChange,
  placeholder = "متن را وارد کنید...",
  className,
}: MarkdownEditorProps) {
  const ref = React.useRef<MDXEditorMethods>(null);

  return (
    <div
      className={
        "rounded-md border border-input bg-background overflow-hidden " +
        (className ?? "")
      }
      dir="rtl"
    >
      <MDXEditor
        ref={ref}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <InsertImage />
                <ListsToggle />
                <InsertCodeBlock />
                <InsertThematicBreak />
              </>
            ),
          }),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          markdownShortcutPlugin(),
        ]}
        contentEditableClassName="prose prose-sm max-w-none min-h-[180px] p-3 focus:outline-none"
      />
    </div>
  );
}
