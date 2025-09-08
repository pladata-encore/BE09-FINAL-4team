import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from "lexical";
import ExampleTheme from "./themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import "./style.css";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

function Placeholder() {
  return (
    <div className="editor-placeholder">
      내용을 입력하세요
    </div>
  );
}

function EditorInitializer({ json, setEditorInstance }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    setEditorInstance(editor);
  }, [editor, setEditorInstance]);

  useEffect(() => {
    if (json && json.trim() !== '') {
      try {
        const parsedData = JSON.parse(json);
        const editorState = editor.parseEditorState(parsedData);
        editor.setEditorState(editorState);
        console.log('에디터 상태 로드 성공');
      } catch (error) {
        console.error('Failed to parse editor state:', error);
        console.log('Fallback to empty state');
        // Fallback to empty state
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        });
      }
    } else {
      // Create empty state
      console.log('Creating empty editor state');
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(''));
        root.append(paragraph);
      });
    }
    
    // 에디터가 편집 가능한지 확인
    setTimeout(() => {
      console.log('에디터 편집 가능 상태:', editor.isEditable());
    }, 100);
    
  }, [json, editor]);

  return null; // 실제로 렌더링되는 UI는 없음
}

const editorConfigBase = {
  theme: ExampleTheme,
  onError(error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

const Editor = forwardRef(({ jsonData: json, onChange, readOnly = false, showToolbar = true, backgroundColor }, ref) => {
  const [mounted, setMounted] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  
  // ref를 통해 외부에서 에디터 상태를 가져올 수 있도록 함
  useImperativeHandle(ref, () => ({
    getEditorState: () => {
      if (editorInstance) {
        const editorState = editorInstance.getEditorState();
        return JSON.stringify(editorState.toJSON());
      }
      return "";
    }
  }), [editorInstance]);

  function handleChange(editorState) {
    const jsonString = JSON.stringify(editorState.toJSON());
    onChange?.(jsonString);  // 상위에서 내려온 콜백에 전달
  }
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8 gap-2">
        <div className="w-5 h-5 border-2 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
        <span>에디터 로딩 중...</span>
      </div>
    );
  }

  // 배경색 결정: prop > readOnly > 기본값
  const resolvedBg = backgroundColor !== undefined ? backgroundColor : (readOnly ? "transparent" : "#fff");

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfigBase,
        editable: !readOnly,
        namespace: 'lexical-editor',
      }}
    >
      <div className="editor-container">
        {showToolbar && <ToolbarPlugin />}
        <div
          className="editor-inner"
          style={{ background: resolvedBg }}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`editor-input ${readOnly ? 'pointer-events-none' : ''}`}
                style={{ background: resolvedBg }}
              />
            }
            placeholder={<Placeholder />}
          />
          {!readOnly && <AutoFocusPlugin />}
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <CodeHighlightPlugin />
          <EditorInitializer json={json} setEditorInstance={setEditorInstance} />
        </div>
        {!readOnly && <OnChangePlugin onChange={handleChange} />}
      </div>
    </LexicalComposer>
  );
});

Editor.displayName = 'Editor';

export default Editor;