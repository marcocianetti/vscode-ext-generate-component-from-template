import { window, workspace } from 'vscode';
import {
  CONFIG_GENERATE_INDEX_EXPORT,
  CONFIG_PATH_FILE__TEMPLATES,
  CONFIG_VAR_COMPONENT_NAME,
  WORKSPACE_NAME,
} from './constants';

import fs = require('fs');
import path = require('path');

export default abstract class GenerateComponentLib {
  public static generate(componentName: string, currentPath: string) {
    const workspaceConfiguration =
      workspace.getConfiguration(WORKSPACE_NAME);

    const pathFileTemplates = workspaceConfiguration.get(
      CONFIG_PATH_FILE__TEMPLATES
    );

    const varComponentName = workspaceConfiguration.get(
      CONFIG_VAR_COMPONENT_NAME
    );

    const generateIndexExport = workspaceConfiguration.get(
      CONFIG_GENERATE_INDEX_EXPORT
    );

    try {
      const folders = workspace.workspaceFolders?.map(
        (folder) => folder.uri.path
      );

      const folder = folders?.find((f) => f === currentPath);

      if (!folder) {
        window.showErrorMessage('Workspace folder not found');
        return;
      }

      const fullPath = `${folder}/${pathFileTemplates}`;

      const files = fs.readdirSync(fullPath);

      const dirName = path.join(currentPath, componentName);

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }

      files.forEach((file: string) => {
        const fileContent = fs.readFileSync(
          path.join(fullPath, file),
          'utf-8'
        );

        const componentNameRegex = new RegExp(
          `${varComponentName}`,
          'gi'
        );

        window.showInformationMessage(varComponentName + '');

        const fileData = fileContent.replace(
          componentNameRegex,
          componentName
        );

        GenerateComponentLib.createFile(
          path.join(
            dirName,
            `${file.replace('tmpl', componentName)}`
          ),
          fileData
        );
      });

      if (generateIndexExport) {
        GenerateComponentLib.createFile(
          path.join(dirName, `index.tsx`),
          `export { default } from "./${componentName}";\n`
        );
      }
    } catch (error) {
      console.error(error);
      window.showErrorMessage(error + '');
      window.showErrorMessage(
        "No template files were found, please check if the folder '.components-templates' was created at the root of the project.\nOr check the extension settings."
      );
    }
  }

  private static createFile(path: string, data: any) {
    fs.writeFile(path, data, async (err) => {
      if (err) {
        window.showErrorMessage(
          `An error occurred while trying to create the file:\n${path}`
        );
      }
    });
  }
}
