import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import UniversalTextboxComponent from "./UniversalTextboxComponent";

export class UniversalTextbox implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _rawText: string = "";
    private _textType: "Markdown" | "Json" | "Html" | "Rich Text" | "Plain Text" = "Markdown";
    private _debugMode: boolean = false;
    private _currentTab: "view" | "edit" | "debug" = "view";
    private _displayMode: "View" | "Edit" | "View and Edit" = "View";

    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.updateState(context);

        console.log("Rendering UniversalTextboxComponent with parameters:", {
            rawText: this._rawText,
            textType: this._textType,
            debugMode: this._debugMode,
            currentTab: this._currentTab,
            displayMode: this._displayMode
        });

        return React.createElement(UniversalTextboxComponent, {
            rawText: this._rawText,
            textType: this._textType,
            debugMode: this._debugMode,
            currentTab: this._currentTab,
            displayMode: this._displayMode,
            onTabChange: (tab: "view" | "edit" | "debug") => {
                this._currentTab = tab;
                this._notifyOutputChanged();
            },
            onTextChange: (value: string) => {
                this._rawText = value;
                //this._notifyOutputChanged();
            },
            onTextBlur:(value:string) => {
                this._rawText=value;
                this._notifyOutputChanged();
            }
        });
    }

    private updateState(context: ComponentFramework.Context<IInputs>): void {
        // Only update _rawText if the incoming value is different from current value.
        const incomingRawText = context.parameters.Text.raw;
        if (incomingRawText !== undefined && incomingRawText !== this._rawText) {
            this._rawText = incomingRawText ?? "";
        }

        this._debugMode = context.parameters.DebugMode.raw === true;

        const textTypeValue: string = context.parameters.TextType.raw
            ? context.parameters.TextType.raw.toString()
            : "";
        this._textType =
            textTypeValue === "2"
                ? "Json"
                : textTypeValue === "3"
                    ? "Html"
                    : textTypeValue === "4"
                        ? "Rich Text"
                        : textTypeValue === "5"
                            ? "Plain Text"
                            : "Markdown";

        const displayModeValue: string = context.parameters.DisplayMode.raw
            ? context.parameters.DisplayMode.raw.toString()
            : "";
        this._displayMode =
            displayModeValue === "2"
                ? "Edit"
                : displayModeValue === "3"
                    ? "View and Edit"
                    : "View";
    }

    public getOutputs(): IOutputs {
        return {
            Text: this._rawText,
        };
    }

    public destroy(): void {
    }
}
