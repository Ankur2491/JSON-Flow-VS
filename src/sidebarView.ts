import * as vscode from 'vscode';

export class SidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'editorWebviewSplitView';
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webviewView.webview.html = this._getHtml(webviewView);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'open') {
        vscode.commands.executeCommand('editorWebviewSplit.open');
      }
    });
  }

  private _getHtml(webviewView: vscode.WebviewView) {
    const nonce = 'JKDuh5g6gBz91QbfY7Ow7q0ImpHmSzF8';
    const csp = [
      "default-src 'none';",
      "img-src data: https:;",
      "style-src 'unsafe-inline' https:;",
      "script-src 'nonce-" + nonce + "';"
    ].join(' ');

    return /* html */ `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sidebar</title>
  <style>
    body { font-family: sans-serif; padding: 12px; }
    button { padding: 8px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; }
    p { color: #666; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <h3>Welcome to JSON-Flow!!</h3>
  <button id="openBtn">Launch JSON-Flow</button>
  <p>Click on the button to open the wizard.</p>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.getElementById('openBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'open' });
    });
  </script>
</body>
</html>
`;
  }
}
