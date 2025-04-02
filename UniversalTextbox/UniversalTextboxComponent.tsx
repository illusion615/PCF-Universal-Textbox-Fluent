import * as React from "react";
import {
    FluentProvider,
    webLightTheme,
    Button,
    Tag
} from "@fluentui/react-components";
import { EditRegular, CopyRegular, BugRegular, Checkmark20Regular, Dismiss20Regular, ZoomIn20Regular, ZoomOut20Regular } from "@fluentui/react-icons";
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

mdParser.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet("src");
    const alt = token.content || "";
    return `<img src="${src}" alt="${alt}" class="markdown-image" data-src="${src}" />`;
};

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
    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const [modalImageUrl, setModalImageUrl] = React.useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = React.useState(1);

    React.useEffect(() => {
        setLocalText(rawText);
    }, [rawText]);

    React.useEffect(() => {
        if (textType === "Markdown" && !isEditing && !isDebugging) {
            mermaid.initialize({ startOnLoad: false });
            setTimeout(() => {
                mermaid.run({ querySelector: '.mermaid' });
            }, 0);
        }
    }, [localText, textType, isEditing, isDebugging]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isImageModalOpen) {
                if (e.key === "+") {
                    setZoomLevel((prev) => prev + 0.1);
                } else if (e.key === "-") {
                    setZoomLevel((prev) => Math.max(0.1, prev - 0.1));
                } else if (e.key === "Escape") {
                    setIsImageModalOpen(false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isImageModalOpen]);

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

    const handleImageClick = (src: string) => {
        setModalImageUrl(src);
        setIsImageModalOpen(true);
        setZoomLevel(1); // Reset zoom level
    };

    return (
        <FluentProvider theme={webLightTheme}>
            <div className="control-container">
                <div className="header">
                    <Tag appearance="brand">{textType}</Tag>
                    <div style={{ flexGrow: 3 }} />
                    <div className="button-container">
                        {!isEditing && !isDebugging && (
                            <Button
                                title="Copy"
                                className="icon-button"
                                icon={<CopyRegular />}
                                onClick={handleCopy} />
                        )}
                        {displayMode != "View" && !isDebugging && !isEditing && (
                            <Button
                                title="Edit"
                                className="icon-button"
                                icon={<EditRegular />}
                                onClick={() => {
                                    setIsEditing(true);
                                    setIsDebugging(false);
                                }}
                            />
                        )}
                        {!isDebugging && isEditing && (
                            <Button
                                title="Save"
                                className="icon-button"
                                icon={<Checkmark20Regular />}
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsDebugging(false);
                                    onTextBlur(localText);
                                }}
                            />
                        )}
                        {!isDebugging && isEditing && (
                            <Button
                                title="Cancel"
                                className="icon-button"
                                icon={<Dismiss20Regular />}
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsDebugging(false);
                                }}
                            />
                        )}{debugMode && (
                            <Button
                                title="Debug"
                                className="icon-button"
                                icon={<BugRegular />}
                                onClick={() => {
                                    setIsDebugging(!isDebugging);
                                    setIsEditing(false);
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="content-area">
                    {isEditing ? (
                        <TextareaAutosize
                            value={localText}
                            style={{ width: "100%", resize: "none", flexGrow: 1, boxSizing: "border-box", overflow: "auto" }}
                            onChange={(e) => setLocalText(e.target.value)}
                        />
                    ) : (
                        <div
                            className="markdown-content"
                            dangerouslySetInnerHTML={{ __html: renderDisplayContent() }}
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.tagName === "IMG" && target.classList.contains("markdown-image")) {
                                    const src = target.getAttribute("data-src");
                                    if (src) {
                                        handleImageClick(src);
                                    }
                                }
                            }}
                        />
                    )}
                </div>
                {isImageModalOpen && modalImageUrl && (
                    <div className="image-modal">
                        <div className="image-modal-overlay" onClick={() => setIsImageModalOpen(false)}></div>
                        <div className="image-modal-content">
                            <div className="image-modal-header">
                                <Button
                                    className="image-modal-button"
                                    title="Close"
                                    icon={<Dismiss20Regular />}
                                    onClick={() => setIsImageModalOpen(false)}></Button>
                                <Button
                                    className="image-modal-button"
                                    title="Zoom in"
                                    icon={<ZoomIn20Regular />}
                                    onClick={() => setZoomLevel((prev) => prev + 0.1)}></Button>
                                <Button
                                    className="image-modal-button"
                                    title="Zoom out"
                                    icon={<ZoomOut20Regular />}
                                    onClick={() => setZoomLevel((prev) => Math.max(0.1, prev - 0.1))}></Button>
                            </div>
                            <img
                                src={modalImageUrl}
                                alt="Modal"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </FluentProvider>
    );
};

export default UniversalTextboxComponent;