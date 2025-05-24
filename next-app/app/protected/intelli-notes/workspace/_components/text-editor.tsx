"use client";
import React, { useEffect, useState } from "react";
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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Tooltip } from "@nextui-org/tooltip";
import {
  FacebookShare,
  LinkedinShare,
  TelegramShare,
  WhatsappShare,
  EmailShare
} from "react-share-kit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TextEditorProps {
  fileId: string;
  fileName: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ fileId, fileName }) => {
  console.log("TextEditor component initialized with fileId:", fileId);

  const notes = useQuery(api.notes.GetNotes, {
    fileId: fileId
  });

  console.log("Fetching notes for fileId:", fileId);
  console.log("Fetched notes:", notes);

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
      console.log("Setting editor content with notes:", notes);
      editor.commands.setContent(notes);
    }
  }, [notes, editor]);

  const handleSave = () => {
    if (editor) {
      saveNotes({
        fileId,
        notes: editor.getHTML(),
        createdBy: "Admin" // Replace with dynamic user info if needed
      })
        .then(() => {
          console.log("Notes saved successfully");
          toast.success("Notes saved successfully!");
        })
        .catch((err) => {
          console.error("Error saving notes:", err);
          toast.error("Error saving notes:", err);
        });
    }
  };

  const handleExportToPDF = async () => {
    if (!editor) {
      console.error("Editor is not initialized.");
      toast.error("Editor is not initialized.");
      return;
    }

    console.log("Exporting notes to PDF");
    const content = editor.getHTML();
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 15;
    let yOffset = margin + 20; // Adjust for header space
    const pageHeight = doc.internal.pageSize.getHeight();
    let pageCount = 1;

    doc.setFont("Helvetica");

    // Add the header to the first page
    doc.setFontSize(20);
    doc.setFont("Helvetica", "bold");
    doc.text("IntelliNote Notes", margin, 15);
    doc.setFontSize(12);
    doc.line(margin, 18, 210 - margin, 18); // Underline header

    const parser = new DOMParser();
    const docHTML = parser.parseFromString(content, "text/html");

    docHTML.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === "H1") {
          doc.setFontSize(18);
          doc.setFont("Helvetica", "bold");
        } else if (element.tagName === "H2") {
          doc.setFontSize(16);
          doc.setFont("Helvetica", "bold");
        } else if (element.tagName === "H3") {
          doc.setFontSize(14);
          doc.setFont("Helvetica", "bold");
        } else {
          doc.setFontSize(12);
          doc.setFont("Helvetica", "normal");
        }

        const text = element.innerText;
        const splitText = doc.splitTextToSize(text, 180);

        if (yOffset + splitText.length * 7 >= pageHeight - 20) {
          addFooter(doc, pageCount);
          doc.addPage();
          pageCount++;
          yOffset = margin;
        }

        doc.text(splitText, margin, yOffset);
        yOffset += splitText.length * 7;
      }
    });

    addFooter(doc, pageCount); // Add footer to the last page
    doc.save("notes.pdf");
    console.log("PDF downloaded successfully");
    toast.success("PDF downloaded successfully!");
  };

  // Function to add footer with page numbers
  const addFooter = (doc: jsPDF, pageNumber: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(`Page ${pageNumber}`, 100, pageHeight - 10);
  };
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const shareUrl = `https://learn-labs-348802358133.asia-south1.run.app/protected/intelli-notes/workspace/${fileId}`;

  const shareTitle = `Check out my notes on "${fileName}" using IntelliNote:`;

  // Handler to toggle the share modal visibility
  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };
  return (
    <div>
      <div className="flex-2 flex justify-end gap-2 mb-5">
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
        <Button onClick={handleExportToPDF} size="sm">
          Export
        </Button>

        {/* Share Via Button */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Share Via</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Notes</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap justify-center gap-4 pt-1 pb-1">
              <Tooltip content="Facebook" placement="bottom">
                <FacebookShare url={shareUrl} quote={shareTitle} className="w-100 h-20 text-white fill-current" round blankTarget />
              </Tooltip>
              <Tooltip content="LinkedIn" placement="bottom">
                <LinkedinShare url={shareUrl} title={shareTitle} className="w-full h-full text-white fill-current" round blankTarget />
              </Tooltip>
              <Tooltip content="Telegram" placement="bottom">
                <TelegramShare url={shareUrl} title={shareTitle} className="w-full h-full text-white fill-current" round blankTarget />
              </Tooltip>
              <Tooltip content="WhatsApp" placement="bottom">
                <WhatsappShare url={shareUrl} title={shareTitle} className="w-full h-full text-white fill-current" round blankTarget />
              </Tooltip>
              <Tooltip content="WhatsApp" placement="bottom">
                <EmailShare
                  url={shareUrl} title={shareTitle} className="w-full h-full text-white fill-current" round blankTarget
                  subject={'IntelliNote lecture Note'}
                  body={shareTitle}
                />

              </Tooltip>
            </div>
            <div className="mt-1 flex justify-end">
              <Button onClick={() => setIsShareModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
      <EditorExtension editor={editor} />
      <div className="overflow-scroll h-[88]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
