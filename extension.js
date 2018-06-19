var vscode = require('vscode');

const insertText = (val) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    editor.edit((editBuilder) => {
        editBuilder.replace(range, val);
    });
}

const normalizeSelection = (editor) => {
    return editor.selection.isEmpty 
        ? vscode.commands.executeCommand('editor.action.smartSelect.grow') 
        : Promise.resolve();
}

function insertJs(code = '', semicolon) {
   insertText(`console.log('${code.replace(/'/g, '\\\'')}', ${code})${semicolon ? ';' : ''}`)
}

function insertRust(code) {
    const element = code.replace(/[:,\.]/g, '').trim();
    insertText(`println!("${element}: {:?}", ${element});`)
}

exports.activate = function (context) {
    const insertLogStatement = vscode.commands.registerCommand('extension.generateConsoleLog', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        normalizeSelection(editor).then(() => {
            const { semicolon } = vscode.workspace.getConfiguration('console-log');
            const selection = editor.selection;
            const text = editor.document.getText(selection).trim();            
            vscode.commands.executeCommand('editor.action.insertLineAfter').then(() => {
                switch (editor.document.languageId) {
                    case "javascript":
                    case "javascriptreact":
                    case "typescript":
                    case "typescriptreact":
                        insertJs(text, semicolon);
                    break;
                    case "rust":
                        insertRust(text);
                    break;
                }
            });
        });        
    });
    context.subscriptions.push(insertLogStatement);    
};

exports.deactivate = function () {};
