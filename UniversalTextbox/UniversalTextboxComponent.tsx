import * as React from "react";
import {
    FluentProvider,
    webLightTheme,
    Tab,
    TabList,
    Textarea,
} from "@fluentui/react-components";
import { Autofill, Stack } from "@fluentui/react";
import MarkdownIt from "markdown-it";
import markdownItMermaid from "markdown-it-mermaid";
import mermaid from "mermaid";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { html as beautifyHtml } from "js-beautify";
import "./UniversalTextboxComponent.css";

// 自定义 TabPanels 与 TabPanel 组件
const TabPanels: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
);
const TabPanel: React.FC<{ children: React.ReactNode; hidden: boolean }> = ({
    children,
    hidden,
}) => (hidden ? null : <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>{children}</div>);

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

// 定义组件的属性接口
export interface UniversalTextboxComponentProps {
    rawText: string;
    textType: "Markdown" | "Json" | "Html" | "Rich Text" | "Plain Text";
    debugMode: boolean;
    currentTab: "view" | "edit" | "debug";
    displayMode: "View" | "Edit" | "View and Edit";
    onTabChange: (tab: "view" | "edit" | "debug") => void;
    onTextChange: (value: string) => void;
    onTextBlur: (value: string) => void;
}

// 定义组件
const UniversalTextboxComponent: React.FC<UniversalTextboxComponentProps> = ({
    rawText,
    textType,
    debugMode,
    currentTab,
    displayMode,
    onTabChange,
    onTextChange,
    onTextBlur
}) => {

    // Inside your component:
    const [localText, setLocalText] = React.useState(rawText);

    // Sync local state when rawText prop changes externally
    React.useEffect(() => {
        setLocalText(rawText);
    }, [rawText]);

    // Inside your UniversalTextboxComponent
    React.useEffect(() => {
        if (currentTab === "view" || currentTab === "debug") {
            mermaid.initialize({ startOnLoad: false });
            // Re-initialize Mermaid for elements with the "mermaid" class in the rendered HTML
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        }
    }, [currentTab, rawText, textType]);

    if (debugMode) {
        console.log("UniversalTextboxComponent with parameters:", {
            rawText: rawText,
            textType: textType,
            debugMode: debugMode,
            currentTab: currentTab,
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
        if (currentTab === "view") {
            if (textType === "Json") {
                try {
                    const jsonObj = JSON.parse(rawText);
                    return renderCollapsibleJson(jsonObj);
                } catch (e) {
                    return `<pre>Invalid JSON</pre>`;
                }
            } else if (textType === "Html") {
                return beautifyHtml(rawText, { indent_size: 2, wrap_line_length: 80 });
            } else {
                return `<div class="markdown-content">${mdParser.render(rawText)}</div>`;
            }
        } else if (currentTab === "debug") {
            const parsed = mdParser.render(rawText);
            const formattedHtml = beautifyHtml(parsed, {
                indent_size: 2,
                wrap_line_length: 80,
            });
            return `<pre><code>${formattedHtml
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</code></pre>`;
        }
        return "";
    };

    const tabs: React.ReactNode[] = [];
    const panels: React.ReactNode[] = [];

    // 根据 displayMode 决定显示哪些 Tab 和内容
    if (displayMode === "View") {
        tabs.push(
            <Tab key="view" value="view" onClick={() => {
                if (debugMode) {
                    console.log("clicked view tab under view display mode.");
                }
                onTabChange("view");
            }}>
                {textType}
            </Tab>
        );
    } else if (displayMode === "Edit") {
        tabs.push(
            <Tab key="edit" value="edit" onClick={() => {
                if (debugMode
                ) {
                    console.log("clicked edit tab under edit display mode.");
                }
                onTabChange("edit");
            }}>
                Edit
            </Tab>
        );
    } else {
        // View and Edit 模式
        tabs.push(
            <Tab key="view" value="view" onClick={() => {
                if (debugMode) {
                    console.log("clicked view tab under view and edit display mode and triggered onClick event.");
                }

                onTabChange("view");
            }}>
                {textType}
            </Tab>,
            <Tab key="edit" value="edit" onClick={() => {
                if (debugMode) {
                    console.log("clicked edit tab under view and edit display mode and triggered onClick event.");
                }

                onTabChange("edit");
            }}>
                Edit
            </Tab>
        );
    }

    // 如果开启了 Debug 模式，则显示 Debug Tab
    if (debugMode) {
        tabs.push(
            <Tab key="debug" value="debug" onClick={() => {
                console.log("clicked debug tab and triggered onClick event.");
                onTabChange("debug");
            }}>
                Debug
            </Tab>
        )
    }

    // 根据当前 Tab 决定显示的内容
    if (currentTab === "view") {
        panels.push(
            <TabPanel key="view" hidden={false}>
                <div style={{ padding: "5px", overflow: "scroll", height: "100%" }}
                    dangerouslySetInnerHTML={{ __html: renderDisplayContent() }}
                />
            </TabPanel>
        );
    } else if (currentTab === "edit") {
        panels.push(
            <TabPanel key="edit" hidden={false}>
                <div className="container">
                    <Textarea
                        value={localText}
                        placeholder="Enter text here"
                        onChange={(_e, data) => {
                            if (debugMode) {
                                console.log("triggered Textarea onChange event. new data: ", data.value);
                            }

                            setLocalText(data.value);
                            onTextChange(localText)
                        }}
                        onBlur={() => {
                            if (debugMode) {
                                console.log("triggered Textarea onBlur event. new rawText: ", rawText);
                            }
                            onTextBlur(localText);
                        }}
                    />
                </div>
            </TabPanel>
        );
    } else {
        panels.push(
            <TabPanel key="debug" hidden={false}>
                <div style={{ padding: "5px", overflow: "scroll", height: "100%" }}
                    dangerouslySetInnerHTML={{ __html: renderDisplayContent() }}
                /></TabPanel>
        );
    }

    return (
        <FluentProvider theme={webLightTheme}>
            <Stack verticalFill styles={{ root: { height: "100vh" } }}>
                {/* Header area */}
                <Stack.Item>
                    <TabList>{tabs}</TabList>
                </Stack.Item>
                {/* Panel area 填充其余空间 */}
                <Stack.Item grow styles={{ root: { overflow: "hidden" } }}>
                    <TabPanels>{panels}</TabPanels>
                </Stack.Item>
            </Stack>
        </FluentProvider>
    );
};

export default UniversalTextboxComponent;