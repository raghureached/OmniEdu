import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

const styles = `
  .rich-editor-wrapper {
    width: 100%;
    margin-bottom:10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .rich-editor-container {
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .rich-editor-container:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .rich-menubar {
    background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .rich-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 36px;
    height: 36px;
  }

  .rich-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .rich-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }

  .rich-btn-active {
    background: #3b82f6;
    color: #ffffff;
    border-color: #2563eb;
    font-weight: 600;
  }

  .rich-btn-active:hover {
    background: #2563eb;
    border-color: #1d4ed8;
  }

  .rich-divider {
    width: 1px;
    height: 24px;
    background: #d1d5db;
    margin: 0 4px;
  }

  .rich-editor-content {
    padding: 20px 24px;
    min-height: 400px;
    max-height: 600px;
    overflow-y: auto;
  }

  .rich-editor-content .ProseMirror {
    outline: none;
    min-height: 360px;
  }

  .rich-editor-content .ProseMirror p {
    margin: 0 0 12px 0;
    line-height: 1.7;
    color: #1f2937;
  }

  .rich-editor-content .ProseMirror h1 {
    font-size: 2em;
    font-weight: 700;
    margin: 24px 0 16px 0;
    color: #111827;
    line-height: 1.2;
  }

  .rich-editor-content .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 20px 0 12px 0;
    color: #111827;
    line-height: 1.3;
  }

  .rich-editor-content .ProseMirror h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 16px 0 10px 0;
    color: #111827;
    line-height: 1.4;
  }

  .rich-editor-content .ProseMirror ul,
  .rich-editor-content .ProseMirror ol {
    padding-left: 24px;
    margin: 12px 0;
  }

  .rich-editor-content .ProseMirror li {
    margin: 6px 0;
    line-height: 1.7;
    color: #1f2937;
  }

  .rich-editor-content .ProseMirror blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 16px;
    margin: 16px 0;
    color: #4b5563;
    font-style: italic;
    background: #f9fafb;
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
  }

  .rich-editor-content .ProseMirror code {
    background: #f3f4f6;
    color: #dc2626;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Courier New', monospace;
  }

  .rich-editor-content .ProseMirror pre {
    background: #1f2937;
    color: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    line-height: 1.5;
  }

  .rich-editor-content .ProseMirror pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }

  .rich-editor-content .ProseMirror a {
    color: #3b82f6;
    text-decoration: underline;
    cursor: pointer;
  }

  .rich-editor-content .ProseMirror a:hover {
    color: #2563eb;
  }

  .rich-editor-content .ProseMirror strong {
    font-weight: 700;
    color: #111827;
  }

  .rich-editor-content .ProseMirror em {
    font-style: italic;
  }

  .rich-editor-content .ProseMirror s {
    text-decoration: line-through;
  }

  .rich-editor-content::-webkit-scrollbar {
    width: 8px;
  }

  .rich-editor-content::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .rich-editor-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  .rich-editor-content::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const toggleHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const isActive = (format, options) => {
    return editor.isActive(format, options);
  };

  const buttonClass = (active) => 
    `rich-btn ${active ? 'rich-btn-active' : ''}`;

  return (
    <div className="rich-menubar">
      {[1, 2, 3].map(level => (
        <button
          key={level}
          onClick={() => toggleHeading(level)}
          className={buttonClass(isActive('heading', { level }))}
          aria-label={`Toggle heading level ${level}`}
        >
          H{level}
        </button>
      ))}

      <div className="rich-divider" />

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(isActive('bold'))}
        aria-label="Toggle bold"
      >
        <strong>B</strong>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(isActive('italic'))}
        aria-label="Toggle italic"
      >
        <em>I</em>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(isActive('strike'))}
        aria-label="Toggle strikethrough"
      >
        <s>S</s>
      </button>

      <div className="rich-divider" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(isActive('bulletList'))}
        aria-label="Toggle bullet list"
      >
        • List
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(isActive('orderedList'))}
        aria-label="Toggle ordered list"
      >
        1. List
      </button>

      <div className="rich-divider" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(isActive('blockquote'))}
        aria-label="Toggle blockquote"
      >
        ❝ Quote
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(isActive('codeBlock'))}
        aria-label="Toggle code block"
      >
        {'</>'}
      </button>

      <div className="rich-divider" />

      {/* <button
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }}
        className={buttonClass(isActive('link'))}
        aria-label="Add/edit link"
      >
        🔗 Link
      </button> */}

      {/* <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        className="rich-btn"
        aria-label="Remove link"
        disabled={!isActive('link')}
        style={{ opacity: isActive('link') ? 1 : 0.5 }}
      >
        ❌ Link
      </button> */}

      <div className="rich-divider" />

      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="rich-btn"
        aria-label="Clear formatting"
      >
        🧹 Clear
      </button>
    </div>
  );
};

const FullRichTextEditor = ({value,onChange}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <>
      <style>{styles}</style>
      <div className="rich-editor-wrapper">
        <div className="rich-editor-container">
          <MenuBar editor={editor} />
          <div className="rich-editor-content">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  );
};

export default FullRichTextEditor;