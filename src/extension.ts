import * as vscode from 'vscode';
import { SidebarViewProvider } from './sidebarView';
import * as path from 'path';
import * as fs from 'fs';
export function activate(context: vscode.ExtensionContext) {
  // Register sidebar view provider
  const sidebarProvider = new SidebarViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarViewProvider.viewType,
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }

    )
  );

  // Register command to open editor + webview
  const disposable = vscode.commands.registerCommand('editorWebviewSplit.open', async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: '',
      language: 'json',
    });
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);

    const panel = vscode.window.createWebviewPanel(
      'previewPanel',
      'JSON-Flow Graph',
      { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // panel.webview.html = getWebviewContent(panel);

    // const extPath = path.join(context.extensionPath, 'assets');
    // const indexPath = path.join(extPath, 'index.html');

    // let html = fs.readFileSync(indexPath, 'utf8');

    // panel.webview.html = html


    const buildPath = path.join(context.extensionPath, 'webview-ui', 'build');
    const indexPath = path.join(buildPath, 'index.html');

    let html = fs.readFileSync(indexPath, 'utf8');

    const scriptRegex = /<script\s+src="(.+?)"><\/script>/g;
    const cssRegex = /<link\s+href="(.+?)"\s+rel="stylesheet">/g;


        html = html
      .replace(scriptRegex, (m, src) => {
        const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(buildPath, src)));
        return `<script src="${scriptUri}"></script>`;
      })
      .replace(cssRegex, (m, href) => {
        const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(buildPath, href)));
        return `<link href="${styleUri}" rel="stylesheet">`;
      });

    // Fix absolute paths (CRA may output /static/js/... etc.)
    html = html.replace(/"\/static\//g, `"${panel.webview.asWebviewUri(vscode.Uri.file(path.join(buildPath, 'static'))).toString()}/`);

    panel.webview.html = html;


    const editorChangeListener = vscode.workspace.onDidChangeTextDocument((event)=>{
      if(event.document === doc) {
        const text  = event.document.getText();
        panel.webview.postMessage({command: 'update', text});
      }
    })

    // Receive messages from webview
    panel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'alert') {
        vscode.window.showInformationMessage(message.text);
      }
    });

    panel.onDidDispose(()=>{
      editorChangeListener.dispose();
    })
  });


  context.subscriptions.push(disposable);
}

export function deactivate() {}

const nonce = 'jkEiBOZbkCcGAjTafQmYnThRS9qkm8LX';
  const csp = [
    "default-src 'none';",
    "img-src data: https:;",
    "style-src 'unsafe-inline' https:;",
    "script-src 'nonce-" + nonce + "';"
  ].join(' ');

// function getWebviewContent(panel: vscode.WebviewPanel) {
//   const nonce = 'jkEiBOZbkCcGAjTafQmYnThRS9qkm8LX';
//   const csp = [
//     "default-src 'none';",
//     "img-src data: https:;",
//     "style-src 'unsafe-inline' https:;",
//     "script-src 'nonce-" + nonce + "';"
//   ].join(' ');

//   return /* html */ `
// <!doctype html>
// <html lang="en">
// <head>
//   <meta charset="utf-8"/>
//   <meta http-equiv="Content-Security-Policy" content="${csp}">
//   <meta name="viewport" content="width=device-width, initial-scale=1" />
//   <title>Webview</title>
//   <style>
//     body { font-family: sans-serif; padding: 16px; }
//     textarea { width:100%; height:120px; padding:8px; box-sizing:border-box; font-size:14px; }
//     button { padding:8px 12px; background:#007acc; color:#fff; border:none; border-radius:4px; cursor:pointer; }
//   </style>
// </head>
// <body>
//   <h2>Right-side Webview</h2>
//   <p>Plain HTML webview (no React)</p>
//   <textarea id="msg" placeholder="Type a message to send to VS Code"></textarea>
//   <div style="margin-top:10px;">
//     <button id="send">Send to VS Code</button>
//   </div>

//   <script nonce="${nonce}">
//     const vscode = acquireVsCodeApi();
//     document.getElementById('send').addEventListener('click', () => {
//       const text = document.getElementById('msg').value;
//       vscode.postMessage({ command: 'alert', text: text || 'Hello from webview!' });
//     });
//   </script>
// </body>
// </html>
// `;
// }
