# PCF Universal Textbox Fluent

This project is a PowerApps Component Framework (PCF) control that provides a universal textbox component using Fluent UI React v9. The component supports multiple text formats including Markdown, JSON, HTML, Rich Text, and Plain Text. It also includes a debug mode for viewing the rendered HTML.

## Features

- **Multiple Text Formats**: Supports Markdown, JSON, HTML, Rich Text, and Plain Text.
- **Fluent UI Integration**: Utilizes Fluent UI React v9 components for a modern and consistent user interface.
- **Debug Mode**: Allows viewing the rendered HTML for debugging purposes.
- **Responsive Design**: Ensures that images and other content adapt to the container's width.
- **Mermaid Diagrams**: Renders Mermaid code blocks as diagrams within Markdown.

## Screenshots
Markdown view  
![alt text](screenshots/markdownview.png)  

Json view  
![alt text](screenshots/jsonview.png)  

Debug view  
![alt text](screenshots/debugview.png)  

Presenting in Model Driven Apps  
![alt text](screenshots/mda.png)

## Installation

### Option 1: Use the Latest Release Package

Check the latest solution package under the release section.

### Option 2: Clone the Source Code and Build It Yourself

1. **Clone the repository:**
   ```sh
   git clone https://github.com/illusion615/PCF-Universal-Textbox-Fluent.git
   cd PCF-Universal-Textbox-Fluent
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Build and Package the Control:**

   - To generate an optimized bundle, run:
     ```sh
     npm run build
     ```
     This uses webpack (with production optimizations and code splitting) to generate files in the `/dist` folder.

   - Next, repackage the solution using:
     ```sh
     npm run rebuild
     ```
     This command uses `pcf-scripts` to package the PCF control into a solution file which can be imported into Power Apps or Dynamics 365.

## Usage

The PCF control is implemented in the `UniversalTextbox` directory:
- **`index.ts`**: Serves as the entry point for the control.
- **`UniversalTextboxComponent.tsx`**: Contains the main React component rendering the UI.
- **`UniversalTextboxComponent.css`**: Holds the styling rules for the control.

After building and packaging, import the generated solution (.zip file) into your Power Apps or Dynamics 365 test environment using the solution import option.

## Deployment Notice

When deploying the PCF control, you might face an error stating that the webresource content size is too big. To prevent this error:

1. **Adjust the Attachment Size Limit:**
   - In your Power Apps / Dynamics 365 environment, navigate to **Environment Settings**.
   - Under **Email Settings**, locate the **Attachments maximum file size** setting.
   - Increase the limit to accommodate your optimized bundle size (for this release, set the attachment size to at least 102400 KB).

2. **Optimize Your Bundle:**
   - Ensure that production mode, minification, and code splitting are enabled via the webpack configuration.
   - Remove any unused dependencies to reduce the overall bundle size.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.