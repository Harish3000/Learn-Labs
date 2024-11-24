"use client";
import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorExtension from "./editor-extension";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Document from "@tiptap/extension-document";
import ListKeymap from "@tiptap/extension-list-keymap";
import Code from "@tiptap/extension-code";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface TextEditorProps {
  fileId: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const notes = useQuery(api.notes.GetNotes, {
    fileId: fileId
  });

  console.log("Notes", notes);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Underline,
      TextStyle,
      Subscript,
      Superscript,
      Heading,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      ListKeymap,
      Code,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Highlight.configure({ multicolor: true }),
      StarterKit,
      Placeholder.configure({
        placeholder: "Start taking your notes here.."
      })
    ],

    editorProps: {
      attributes: {
        class: "focus:outline-none h-screen p-5"
      }
    }
  });

  useEffect(() => {
    if (editor && notes) {
      editor.commands.setContent(notes);
    }
  }, [notes, editor]);

  return (
    <div>
      <EditorExtension editor={editor} />
      <div className="overflow-scroll h-[88]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
