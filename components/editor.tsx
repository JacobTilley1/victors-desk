'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Code2, Minus, Link2, Link2Off, ImagePlus, Undo2, Redo2,
  Search, Text as TextIcon, Table as TableIcon,
  Rows3, Columns3, Trash2,
} from 'lucide-react';
import ImagePicker, { type PickedPhoto } from '@/components/image-picker';

export interface EditorHandleValue {
  html: string;
  json: unknown;
}

/**
 * ProseMirror builds node attribute objects with Object.create(null), so they
 * have no prototype. React Server Actions reject those ("Only plain objects...
 * can be passed to Server Actions"), which breaks publishing. A round-trip
 * through JSON rebuilds everything as ordinary objects.
 */
function toPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
  const [pickerOpen, setPickerOpen] = useState(false);
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
      /*
       * resizable puts ProseMirror's own column-resize plugin in play, which is
       * what makes a stat table usable — narrow columns for numbers, wide ones
       * for names. Tiptap wraps every table in .tableWrapper, and globals.css
       * makes that wrapper scroll horizontally so a wide table doesn't break
       * the article layout on a phone.
       */
      Table.configure({ resizable: true, HTMLAttributes: { class: 'stat-table' } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: 'prose-mich focus:outline-none' },
    },
    onUpdate: ({ editor }) =>
      onChange({ html: editor.getHTML(), json: toPlainObject(editor.getJSON()) }),
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
        if (!url) return;
        const alt = window.prompt(
          'Describe this image for screen readers and search engines:',
          ''
        );
        editor.chain().focus().setImage({ src: url, alt: alt?.trim() || undefined }).run();
      };
      input.click();
      return;
    }
    const url = window.prompt('Image URL');
    if (!url) return;
    const alt = window.prompt('Describe this image:', '');
    editor.chain().focus().setImage({ src: url, alt: alt?.trim() || undefined }).run();
  }, [editor, onUploadImage]);

  /** Edit the alt text of whichever image is currently selected. */
  const editAlt = useCallback(() => {
    if (!editor || !editor.isActive('image')) return;
    const current = (editor.getAttributes('image').alt as string) ?? '';
    const alt = window.prompt('Alt text — describe the image:', current);
    if (alt === null) return;
    editor.chain().focus().updateAttributes('image', { alt: alt.trim() }).run();
  }, [editor]);

  /** Insert a stock photo along with its credit line. */
  const insertStock = useCallback((photo: PickedPhoto) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setImage({ src: photo.full, alt: photo.alt })
      .createParagraphNear()
      .insertContent(`<p><em>Photo by ${photo.photographer} via Pexels</em></p>`)
      .run();
  }, [editor]);

  if (!editor) {
    return <div className="h-[520px] animate-pulse rounded-2xl bg-slate-100" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-card focus-within:border-maize focus-within:ring-4 focus-within:ring-maize/20">
      {/*
        The toolbar is fixed at the top of the editor and the text scrolls
        inside its own pane below it. A sticky toolbar over a page-scrolled
        document always ends up covering the line you're writing.
      */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--line)] bg-white px-2.5 py-2">
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
        <Btn ed={editor} cmd={addImage} label="Upload image"><ImagePlus size={16} /></Btn>
        <Btn ed={editor} cmd={() => setPickerOpen(true)} label="Find a free photo"><Search size={16} /></Btn>
        {editor.isActive('image') && (
          <Btn ed={editor} cmd={editAlt} label="Edit alt text"><TextIcon size={16} /></Btn>
        )}
        <Btn ed={editor} cmd={() => editor.chain().focus().setHorizontalRule().run()} label="Divider"><Minus size={16} /></Btn>
        <Sep />
        <Btn
          ed={editor}
          cmd={() =>
            editor.chain().focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          label="Insert table"
        >
          <TableIcon size={16} />
        </Btn>
        {/*
          Row and column controls only appear when the cursor is inside a
          table. Showing four dead buttons the rest of the time makes the
          toolbar look broken.
        */}
        {editor.isActive('table') && (
          <>
            <Btn ed={editor} cmd={() => editor.chain().focus().addRowAfter().run()} label="Add row"><Rows3 size={16} /></Btn>
            <Btn ed={editor} cmd={() => editor.chain().focus().addColumnAfter().run()} label="Add column"><Columns3 size={16} /></Btn>
            <Btn ed={editor} cmd={() => editor.chain().focus().deleteRow().run()} label="Delete row"><Rows3 size={16} className="opacity-50" /></Btn>
            <Btn ed={editor} cmd={() => editor.chain().focus().deleteColumn().run()} label="Delete column"><Columns3 size={16} className="opacity-50" /></Btn>
            <Btn ed={editor} cmd={() => editor.chain().focus().deleteTable().run()} label="Delete table"><Trash2 size={16} /></Btn>
          </>
        )}
        <Sep />
        <Btn ed={editor} cmd={() => editor.chain().focus().undo().run()} label="Undo"><Undo2 size={16} /></Btn>
        <Btn ed={editor} cmd={() => editor.chain().focus().redo().run()} label="Redo"><Redo2 size={16} /></Btn>

        <span className="ml-auto pr-1 text-[11.5px] font-medium text-slate-400">
          {editor.storage.characterCount?.words?.() ??
            editor.getText().split(/\s+/).filter(Boolean).length}{' '}
          words
        </span>
      </div>

      <div className="max-h-[calc(100vh-15rem)] min-h-[460px] overflow-y-auto px-6 py-6 sm:px-9 sm:py-8">
        <EditorContent editor={editor} />
      </div>

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={insertStock}
      />
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
