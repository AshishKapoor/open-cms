import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Typography } from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Placeholder } from "@tiptap/extensions";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Strike } from "@tiptap/extension-strike";
import { Underline } from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  CheckSquare,
  Minus,
  Undo,
  Redo,
  Palette,
} from "lucide-react";
import { cn } from "../lib/utils";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  hideToolbar?: boolean;
  className?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = 400,
  hideToolbar = false,
  className,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Strike,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Superscript,
      Subscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
          "min-h-full p-4 border-none outline-none"
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const addImage = React.useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = React.useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const insertTable = React.useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm",
        className
      )}
      style={{ minHeight: height }}
    >
      {/* Toolbar */}
      {!hideToolbar && (
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center flex-wrap gap-1">
            {/* Undo/Redo */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().undo().run();
              }}
              disabled={!editor.can().undo()}
              className={cn(
                "p-2 text-sm rounded-md transition-colors disabled:opacity-50",
                "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().redo().run();
              }}
              disabled={!editor.can().redo()}
              className={cn(
                "p-2 text-sm rounded-md transition-colors disabled:opacity-50",
                "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Redo"
            >
              <Redo size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text Formatting */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("bold")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("italic")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleUnderline().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("underline")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Underline"
            >
              <UnderlineIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleStrike().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("strike")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHighlight().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("highlight")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Highlight"
            >
              <Highlighter size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Headings */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("heading", { level: 1 })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("heading", { level: 2 })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("heading", { level: 3 })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text Alignment */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("left").run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive({ textAlign: "left" })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("center").run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive({ textAlign: "center" })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("right").run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive({ textAlign: "right" })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setTextAlign("justify").run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive({ textAlign: "justify" })
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBulletList().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("bulletList")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleOrderedList().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("orderedList")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleTaskList().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("taskList")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Task List"
            >
              <CheckSquare size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Special Elements */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBlockquote().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("blockquote")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Quote"
            >
              <Quote size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleCodeBlock().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("codeBlock")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Code Block"
            >
              <Code2 size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().setHorizontalRule().run();
              }}
              className="p-2 text-sm rounded-md transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              title="Horizontal Rule"
            >
              <Minus size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Links and Media */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setLink();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("link")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Add Link"
            >
              <LinkIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addImage();
              }}
              className="p-2 text-sm rounded-md transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              title="Add Image"
            >
              <ImageIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                insertTable();
              }}
              className="p-2 text-sm rounded-md transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              title="Insert Table"
            >
              <TableIcon size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Superscript/Subscript */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleSuperscript().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("superscript")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Superscript"
            >
              <SuperscriptIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleSubscript().run();
              }}
              className={cn(
                "p-2 text-sm rounded-md transition-colors",
                editor.isActive("subscript")
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
              title="Subscript"
            >
              <SubscriptIcon size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Color Picker */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const color = window.prompt(
                    "Enter color (hex, rgb, or name):"
                  );
                  if (color) {
                    editor.chain().focus().setColor(color).run();
                  }
                }}
                className="p-2 text-sm rounded-md transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                title="Text Color"
              >
                <Palette size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div
        className="overflow-auto"
        style={{
          height: hideToolbar ? height : height - 60,
          fontSize: "14px",
          lineHeight: "1.6",
          fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;
