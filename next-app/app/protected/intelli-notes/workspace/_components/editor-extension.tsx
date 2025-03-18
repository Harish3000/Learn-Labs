import React, { useCallback, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Code,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  SquareCheckBigIcon,
  AtomIcon,
  NotebookPen,
  Search,
  SpellCheck
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { chatSession } from "@/configs/ai-model";
import { toast } from "sonner";
import { Tooltip } from "@nextui-org/tooltip";
import { generates } from "./../../../../../configs/generates";


interface EditorExtensionProps {
  editor: any;
}

const EditorExtension: React.FC<EditorExtensionProps> = ({
  editor
}) => {
  const params = useParams() as { fileId: string };
  const { fileId } = params;
  const SearchAI = useAction(api.myAction.search);
  const saveNotes = useMutation(api.notes.AddNotes);

  const OnAiClick = async () => {
    toast.info("Intellinote is getting your answer...");
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    console.log("selected text:", selectedText);

    const result = await SearchAI({
      query: selectedText,
      fileId: fileId
    });

    console.log("unformatted answer", result);

    const UnformattedAns = JSON.parse(result);
    let AllUnformattedAns = "";
    UnformattedAns &&
      UnformattedAns.forEach((item: { pageContent: string }) => {
        AllUnformattedAns = AllUnformattedAns + item.pageContent;
      });

    const GENERATED_TEXT = generates.generateAnswer(
      selectedText,
      AllUnformattedAns
    );

    console.log("Generated text for AI:", GENERATED_TEXT);

    const AiModelResult = await chatSession.sendMessage(GENERATED_TEXT);
    console.log(AiModelResult.response.text());
    const FinalAns = AiModelResult.response
      .text()
      .replace("```", "")
      .replace("html", "")
      .replace("```", "");

    console.log("Final processed answer:", FinalAns);

    const AllText = editor.getHTML();
    editor.commands.setContent(
      AllText + "<p><strong> Answer :</strong>" + FinalAns + "</p>"
    );

    console.log("Saving notes with saveNotes mutation.");
    saveNotes({
      notes: editor.getHTML(),
      fileId: fileId,
      createdBy: "Admin"
    });
    console.log("Notes saved successfully.");
    toast.success("Intellinote has successfully added your answer");
  };

  // selected text summarize
  const OnSummarizeClick = async () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    if (!selectedText || selectedText.trim() === "") {
      toast.error("Please select text to summarize.");
      return;
    }

    toast.info("Summarizing the selected text...");
    console.log("Selected text for summarization:", selectedText);

    try {
      const GENERATED_TEXT = generates.summarizeText(selectedText);
      console.log("Generated summarization prompt:", GENERATED_TEXT);

      const AiModelResult = await chatSession.sendMessage(GENERATED_TEXT);
      console.log("AI summarization result:", AiModelResult.response.text());

      const Summary = AiModelResult.response
        .text()
        .replace("```", "")
        .replace("text", "")
        .replace("```", "");

      console.log("Processed summary:", Summary);

      const AllText = editor.getHTML();
      editor.commands.setContent(
        AllText + "<p><strong> Summary :</strong> " + Summary + "</p>"
      );

      console.log("Saving summarized notes with saveNotes mutation.");
      // Save summarized notes
      await saveNotes({
        notes: editor.getHTML(),
        fileId: fileId,
        createdBy: "Admin"
      });

      console.log("Summarized notes saved successfully.");
      toast.success("Summarization complete and added to your notes!");
    } catch (error) {
      console.error("Error during summarization:", error);
      toast.error("Failed to summarize the selected text. Please try again.");
    }
  };

  // Grammer checker
  const handleGrammarCheck = async () => {
    if (!editor) return;

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    if (!selectedText.trim()) {
      toast.error("Please select text to check grammar.");
      return;
    }

    toast.info("Checking grammar...");

    try {
      const TEXT = generates.GrammerCkeck(selectedText);

      const AiModelResult = await chatSession.sendMessage(TEXT);
      const responseText = await AiModelResult.response.text();
      const correctedText = responseText.trim();

      if (correctedText.toLowerCase() === selectedText.toLowerCase()) {
        toast.success("The sentence is already correct!");
        return;
      }

      const existingText = editor.getHTML();
      const formattedCorrection = `
  <p><strong>Grammar Suggestions:</strong></p>
  <p><strong>Original:</strong> ${selectedText}</p>
  <p><strong>Corrected:</strong> ${correctedText}</p>
`;


      editor.commands.setContent(existingText + formattedCorrection);
      toast.success("Grammar check complete! Corrections suggested.");

      // Save updated notes
      await saveNotes({
        notes: editor.getHTML(),
        fileId: fileId,
        createdBy: "Admin"
      });

    } catch (error) {
      console.error("Grammar check failed:", error);
      toast.error("Failed to check grammar. Please try again.");
    }
  };

  return (
    editor && (
      <div className="">
        <div className="control-group">
          <div className="button-group flex gap-3">
            {/* heading styles */}
            <Tooltip content="Heading 1">
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={editor.isActive({ level: 1 }) ? "text-blue-500" : ""}
              >
                <Heading1 />
              </button>
            </Tooltip>
            <Tooltip content="Heading 2">
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={editor.isActive({ level: 2 }) ? "text-blue-500" : ""}
              >
                <Heading2 />
              </button>
            </Tooltip>

            <Tooltip content="Bold">
              {/* bold button */}
              <button
                onClick={() =>
                  editor && editor.chain().focus().toggleBold().run()
                }
                className={
                  editor && editor.isActive("bold") ? "text-blue-500" : ""
                }
              >
                <Bold />
              </button>
            </Tooltip>
            <Tooltip content="Italic">
              {/* italic button */}
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "text-blue-500" : ""}
              >
                <Italic />
              </button>
            </Tooltip>

            <Tooltip content="Underline">
              {/* underLine button */}
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "text-blue-500" : ""}
              >
                <Underline />
              </button>
            </Tooltip>
            <Tooltip content="Code">
              {/* code blocks */}
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive("code") ? "text-blue-500" : ""}
              >
                <Code />
              </button>
            </Tooltip>
            <Tooltip content="Task List">
              {/* tasks */}
              <button
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive("taskList") ? "text-blue-500" : ""}
              >
                <SquareCheckBigIcon />
              </button>
            </Tooltip>
            <Tooltip content="Strike through">
              {/* Strike through button */}
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "text-blue-500" : ""}
              >
                <Strikethrough />
              </button>
            </Tooltip>
            <Tooltip content="Subscript">
              {/* Subscript button  */}
              <button
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={editor.isActive("subscript") ? "text-blue-500" : ""}
              >
                <Subscript />
              </button>
            </Tooltip>
            <Tooltip content="Superscript">
              {/* Super Script button */}
              <button
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={
                  editor.isActive("superscript") ? "text-blue-500" : ""
                }
              >
                <Superscript />
              </button>
            </Tooltip>
            <Tooltip content="Hightlight">
              {/* hightlight */}
              <button
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: "#ffc078" })
                    .run()
                }
                className={
                  editor.isActive("highlight", { color: "#ffc078" })
                    ? "text-orange-400"
                    : ""
                }
              >
                <Highlighter />
              </button>
            </Tooltip>
            <Tooltip content="Left align">
              {/* indentation */}
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={
                  editor.isActive({ textAlign: "left" }) ? "text-blue-500" : ""
                }
              >
                <AlignLeft />
              </button>
            </Tooltip>
            <Tooltip content="Center">
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={
                  editor.isActive({ textAlign: "center" })
                    ? "text-blue-500"
                    : ""
                }
              >
                <AlignCenter />
              </button>
            </Tooltip>
            <Tooltip content="Right align" placement="bottom">
              <button
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={
                  editor.isActive({ textAlign: "right" }) ? "text-blue-500" : ""
                }
              >
                <AlignRight />
              </button>
            </Tooltip>
            <Tooltip content="Ask AI" placement="bottom">
              {/* AI content */}
              <button
                onClick={() => OnAiClick()}
                className={"hover:text-blue-500"}
              >
                <AtomIcon />
              </button>
            </Tooltip>
            <Tooltip content="Summarize" placement="bottom">
              {/* Summarize content */}
              <button
                onClick={() => OnSummarizeClick()}
                className={"hover:text-blue-500"}
              >
                <NotebookPen />
              </button>
            </Tooltip>
            <Tooltip content="Check Grammar" placement='bottom'>
              <button onClick={handleGrammarCheck} className="text-blue-500">
                <SpellCheck />
              </button>
            </Tooltip>


          </div>
        </div>
      </div>
    )
  );
};

export default EditorExtension;
