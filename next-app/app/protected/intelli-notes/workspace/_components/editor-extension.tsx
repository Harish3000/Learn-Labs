import React, { useCallback } from "react";
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
  AtomIcon
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { chatSession } from "@/configs/ai-model";
import { toast } from "sonner";

interface EditorExtensionProps {
  editor: any;
}

const EditorExtension: React.FC<EditorExtensionProps> = ({ editor }) => {
  const params = useParams() as { fileId: string };
  const { fileId } = params;

  const SearchAI = useAction(api.myAction.search);

  const OnAiClick = async () => {
    toast("Intellinote is getting your answer...");
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

    const PROMPT =
      "For question:" +
      selectedText +
      "and with the given  content as answer," +
      "please give appropriate answer in HTML format. The answer content is:" +
      AllUnformattedAns;

    const AiModelResult = await chatSession.sendMessage(PROMPT);
    console.log(AiModelResult.response.text());
    const FinalAns = AiModelResult.response
      .text()
      .replace("```", "")
      .replace("html", "")
      .replace("```", "");

    const AllText = editor.getHTML();
    editor.commands.setContent(
      AllText + "<p><strong> Answer :</strong>" + FinalAns + "</p>"
    );
  };
  return (
    editor && (
      <div className="">
        <div className="control-group">
          <div className="button-group flex gap-3">
            {/* heading styles */}
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={editor.isActive({ level: 1 }) ? "text-blue-500" : ""}
            >
              <Heading1 />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={editor.isActive({ level: 2 }) ? "text-blue-500" : ""}
            >
              <Heading2 />
            </button>
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
            {/* italic button */}
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "text-blue-500" : ""}
            >
              <Italic />
            </button>

            {/* underLine button */}
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "text-blue-500" : ""}
            >
              <Underline />
            </button>
            {/* code blocks */}
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive("code") ? "text-blue-500" : ""}
            >
              <Code />
            </button>
            {/* tasks */}
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={editor.isActive("taskList") ? "text-blue-500" : ""}
            >
              <SquareCheckBigIcon />
            </button>
            {/* Strike through button */}
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "text-blue-500" : ""}
            >
              <Strikethrough />
            </button>
            {/* Subscript button  */}
            <button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={editor.isActive("subscript") ? "text-blue-500" : ""}
            >
              <Subscript />
            </button>
            {/* Super Script button */}
            <button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={editor.isActive("superscript") ? "text-blue-500" : ""}
            >
              <Superscript />
            </button>
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
            {/* indentation */}
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={
                editor.isActive({ textAlign: "left" }) ? "text-blue-500" : ""
              }
            >
              <AlignLeft />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={
                editor.isActive({ textAlign: "center" }) ? "text-blue-500" : ""
              }
            >
              <AlignCenter />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={
                editor.isActive({ textAlign: "right" }) ? "text-blue-500" : ""
              }
            >
              <AlignRight />
            </button>
            {/* AI content */}
            <button
              onClick={() => OnAiClick()}
              className={"hover:text-blue-500"}
            >
              <AtomIcon />
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default EditorExtension;
