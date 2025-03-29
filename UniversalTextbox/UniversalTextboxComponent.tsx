import * as React from "react";
import {
    FluentProvider,
    webLightTheme,
    Button,
    Tag,
    makeStyles,
    tokens
} from "@fluentui/react-components";
import { EditRegular, EyeRegular, CopyRegular, ContentViewRegular, BugRegular } from "@fluentui/react-icons";
import TextareaAutosize from 'react-textarea-autosize';
import MarkdownIt from "markdown-it";
import markdownItMermaid from "markdown-it-mermaid";
import texmath from "markdown-it-texmath";
import mermaid from "mermaid";
import katex from "katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { html as beautifyHtml } from "js-beautify";
import "./UniversalTextboxComponent.css";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: tokens.spacingHorizontalM,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    contentArea: {
        flex: 1,
        overflow: "auto",
        padding: tokens.spacingHorizontalM,
    },
});

// 初始化 markdown-it
const mdParser: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: (str, lang) => {
        if (lang === "mermaid") {
            // Wrap Mermaid code with a div; Mermaid lib will process it.
            return `<div class="mermaid">${str}</div>`;
        }
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } catch (__) {
                /* intentionally empty */
            }
        }
        return `<pre class="hljs"><code>${mdParser.utils.escapeHtml(str)}</code></pre>`;
    },
});

// Use the mermaid plugin for markdown-it
mdParser.use(markdownItMermaid);
mdParser.use(texmath, {
    engine: katex,
    delimiters: 'dollars',
});

// 定义组件的属性接口
export interface UniversalTextboxComponentProps {
    rawText: string;
    textType: "Markdown" | "Json" | "Html" | "Rich Text" | "Plain Text";
    debugMode: boolean;
    displayMode: "View" | "Edit" | "View and Edit";
    onTextChange: (value: string) => void;
    onTextBlur: (value: string) => void;
}

// 定义组件
const UniversalTextboxComponent: React.FC<UniversalTextboxComponentProps> = ({
    rawText,
    textType,
    debugMode,
    displayMode,
    onTextChange,
    onTextBlur
}) => {
    const [localText, setLocalText] = React.useState(rawText);
    const [isEditing, setIsEditing] = React.useState(displayMode === "Edit");
    const [isDebugging, setIsDebugging] = React.useState(false);

    React.useEffect(() => {
        setLocalText(rawText);
    }, [rawText]);

    React.useEffect(() => {
        mermaid.initialize({ startOnLoad: false });
        mermaid.init(undefined, document.querySelectorAll('.mermaid'));
    }, [localText, textType, isEditing]);

    if (debugMode) {
        console.log("UniversalTextboxComponent with parameters:", {
            rawText: rawText,
            textType: textType,
            debugMode: debugMode,
            displayMode: displayMode
        });
    }

    // 将 JSON 转换为可折叠的 HTML 展示
    const renderCollapsibleJson = (value: unknown): string => {
        const escapeHtml = (html: string): string =>
            html
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        if (value === null) {
            return '<span class="json-null">null</span>';
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                let result = `<details open><summary>Array(${value.length})</summary>`;
                value.forEach((item: unknown, index: number) => {
                    result += `<div style="padding-left: 20px;"><strong>[${index}]: </strong>${renderCollapsibleJson(item)}</div>`;
                });
                result += `</details>`;
                return result;
            } else {
                const obj = value as Record<string, unknown>;
                let result = `<details open><summary>Object (${Object.keys(obj).length})</summary>`;
                Object.keys(obj).forEach((key) => {
                    result += `<div style="padding-left: 20px;"><strong>${escapeHtml(
                        key
                    )}: </strong>${renderCollapsibleJson(obj[key])}</div>`;
                });
                result += `</details>`;
                return result;
            }
        }
        if (typeof value === "string") {
            return `<span class="json-string">"${escapeHtml(value)}"</span>`;
        }
        if (typeof value === "number") {
            return `<span class="json-number">${value}</span>`;
        }
        if (typeof value === "boolean") {
            return `<span class="json-boolean">${value}</span>`;
        }
        return String(value);
    };

    // 根据文本类型与当前 Tab 渲染内容
    const renderDisplayContent = (): string => {
        if (isDebugging) {
            const formattedHtml = beautifyHtml(mdParser.render(rawText), {
                indent_size: 2,
                wrap_line_length: 80,
            });
            return `<pre><code>${formattedHtml
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</code></pre>`;
        }
        if (textType === "Json") {
            try {
                return renderCollapsibleJson(JSON.parse(rawText));
            } catch {
                return "<pre>Invalid JSON</pre>";
            }
        } else if (textType === "Html") {
            return beautifyHtml(rawText);
        } else {
            return `<div class="markdown-content">${mdParser.render(rawText)}</div>`;
        }
    };

    // Reset debug mode when switching to edit or view
    const handleEditClick = () => {
        setIsEditing(true);
        setIsDebugging(false);
    };

    const handleViewClick = () => {
        setIsEditing(false);
        setIsDebugging(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(localText).then(() => {
            if (debugMode) {
                console.log("Text copied to clipboard successfully.");
            }
            return;
        }).catch((err) => {
            console.error("Failed to copy text: ", err);
        });
    };

    return (
        <FluentProvider theme={webLightTheme}>
            <div className="control-container">
                <div className="header">
                    <Tag appearance="brand">
                        {textType}
                    </Tag>
                    <div style={{ flexGrow: 3 }} />
                    {debugMode && (
                        <Button
                            className="icon-button"
                            icon={<BugRegular />}
                            onClick={() => {
                                setIsDebugging(!isDebugging);
                                setIsEditing(false);
                            }}></Button>
                    )}
                </div>
                <div className="content-area">
                    <div style={{gap:"4px", display: "flex", alignItems: "right", position: "absolute", right: 0, top: 0 }}>
                        <div style={{ flexGrow: 3 }} />
                        {!isEditing && !isDebugging && (
                            <Button
                                className="icon-button"
                                icon={<CopyRegular />}
                                onClick={handleCopy}>
                            </Button>)}
                        {!isDebugging && (
                            <Button
                                className="icon-button"
                                icon={isEditing ? <ContentViewRegular /> : <EditRegular />}
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    setIsDebugging(false);
                                }}>
                            </Button>)}
                    </div>
                    {isEditing ? (
                        <TextareaAutosize
                            value={localText}
                            style={{ width: "100%", resize: "none" }}
                            onChange={(e) => {
                                setLocalText(e.target.value);
                                onTextChange(e.target.value);
                            }}
                            onBlur={() => onTextBlur(localText)}
                        />
                    ) : (
                        <div
                            style={{ overflow: "scroll", height: "100%" }}
                            dangerouslySetInnerHTML={{ __html: renderDisplayContent() }}
                        />
                    )}
                </div>
            </div>
        </FluentProvider>
    );
};

export default UniversalTextboxComponent;