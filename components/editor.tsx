'use client';

import { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Code2, Minus, Link2, Link2Off, ImagePlus, Undo2, Redo2,
} from 'lucide-react';

export interface EditorHandleValue {
  html: string;
  json: unknown;
}

export default function RichEditor({
  initialHtml = '',
  onChange,
  onUploadImage,
}: {
  initialHtml?: string;
  onChange: (value: EditorHandleValue) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: 'rounded-xl' } },
      }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      Placeholder.configure({
        placeholder: 'Start with the lede. What happened, and why does it matter to Michigan?',
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: 'prose-mich focus:outline-none' },
    },
    onUpdate: ({ editor }) => onChange({ html: editor.getHTML(), json: editor.getJSON() }),
  });

  useEffect(() => {
    if (editor && initialHtml && editor.isEmpty) {
      editor.commands.setContent(initialHtml);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor) return;
    if (onUploadImage) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = await onUploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      };
      input.click();
      return;
    }
    const url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor, onUploadImage]);

  if (!editor) {
    return <div className="h-[520px] animate-pulse rounded-2xl bg-slate-100" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-card focus-within:border-maize focus-within:ring-4 focus-within:ring-maize/20">
      <div className="sticky top-[68px] z-20 flex flex-wrap items-center gap-0.5 border-b border-[var(--line)] bg-white/95 px-2.5 py-2 backdrop-blur">
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleBold().run()} on="bold" label="Bold"><Bold size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleItalic().run()} on="italic" label="Italic"><Italic size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleStrike().run()} on="strike" label="Strikethrough"><Strikethrough size={16} /></Btn>
        <Sep />
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} on="heading" attrs={{ level: 2 }} label="Heading"><Heading2 size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} on="heading" attrs={{ level: 3 }} label="Subheading"><Heading3 size={16} /></Btn>
        <Sep />
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleBulletList().run()} on="bulletList" label="Bullets"><List size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleOrderedList().run()} on="orderedList" label="Numbered list"><ListOrdered size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleBlockquote().run()} on="blockquote" label="Quote"><Quote size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().toggleCodeBlock().run()} on="codeBlock" label="Code block"><Code2 size={16} /></Btn>
        <Sep />
        <Btn ed={editor} cmd={setLink} on="link" label="Add link"><Link2 size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().unsetLink().run()} label="Remove link"><Link2Off size={16} /></Btn>
        <Btn ed={editor} cmd={addImage} label="Insert image"><ImagePlus size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().setHorizontalRule().run()} label="Divider"><Minus size={16} /></Btn>
        <Sep />
        <Btn ed={editor} cmd={() => editor.chain().focus().undo().run()} label="Undo"><Undo2 size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().redo().run()} label="Redo"><Redo2 size={16} /></Btn>

        <span className="ml-auto pr-1 text-[11.5px] font-medium text-slate-400">
          {editor.storage.characterCount?.words?.() ??
            editor.getText().split(/\s+/).filter(Boolean).length}{' '}
          words
        </span>
      </div>

      <div className="px-6 py-6 sm:px-9 sm:py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-[var(--line)]" />;
}

function Btn({
  ed, cmd, on, attrs, label, children,
}: {
  ed: Editor;
  cmd: () => void;
  on?: string;
  attrs?: Record<string, unknown>;
  label: string;
  children: React.ReactNode;
}) {
  const active = on ? ed.isActive(on, attrs) : false;
  return (
    <button
      type="button"
      onClick={cmd}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition ${
        active ? 'bg-navy text-maize' : 'text-slate-500 hover:bg-slate-100 hover:text-navy'
      }`}
    >
      {children}
    </button>
  );
}
