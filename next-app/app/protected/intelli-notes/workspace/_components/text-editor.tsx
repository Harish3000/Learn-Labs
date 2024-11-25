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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TextEditorProps {
  fileId: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const notes = useQuery(api.notes.GetNotes, {
    fileId: fileId
  });

  console.log("Notes", notes);
  const saveNotes = useMutation(api.notes.AddNotes);
  
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

   const handleSave = () => {
     if (editor) {
       saveNotes({
         fileId,
         notes: editor.getHTML(),
         createdBy: "Admin", // Replace with dynamic user info if needed
       })
         .then(() => {
           toast.success("Notes saved successfully!");
         })
         .catch((err) => {
           toast.error("Error saving notes:", err);
         });
     }
  };
  
  return (
    <div>
      <div className="flex-2 flex justify-end" onClick={handleSave}>
        <Button size="sm">Save</Button>
      </div>
      {/* <div className="mb-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Notes
        </button>
      </div> */}
      <EditorExtension editor={editor} />
      <div className="overflow-scroll h-[88]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
