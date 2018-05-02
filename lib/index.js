const babel = require('babel-core');
const babylon = require('babylon');
const types = require('babel-types');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const path = require('path');

function myPlugin({ types: t }) {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        if (t.isClassDeclaration(path.node.declaration) || !path.node.leadingComments.find(e => e.value === '@HMR')) {
          return path.stop();
        }
        // TMP: try to get source of CallExpressions whitout nested traversing
        const source = path.getSource().replace(/(export default)|\s|;/gi, '');

        path.replaceWith(
          t.exportDefaultDeclaration(
            t.classDeclaration(
              t.identifier('WrappedHOC(' + source + ')'),
              t.identifier('React.Component'),
              t.classBody([
                t.classProperty(t.identifier('static displayName'), t.stringLiteral('WrappedHOC(' + source + ')')),
                t.classMethod(
                  'method',
                  t.identifier('render'),
                  [],
                  t.blockStatement([
                    t.variableDeclaration('const', [
                      t.variableDeclarator(t.identifier('Comp = ' + source)),
                    ]),
                    t.returnStatement(t.identifier('React.createElement(Comp, this.props)')),
                  ]),
                )
              ]),
              [],
            )
          )
        )
      }
    }
  }
}

const generate = (a) => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.js'), 'utf-8');
  const res = babel.transform(code, {
    plugins: ['transform-react-jsx', myPlugin],
  });

  console.log(res.code);

  // const ast = babylon.parse(res.code, {
  //   sourceType: 'module',
  // });
  // console.log(JSON.stringify(ast, null, 3));

  // const traversed = traverse(ast, {
  //   enter(path) {
  //     if (types.isExportDefaultDeclaration(path.node)) {
  //       console.log(types.exportDefaultDeclaration(path.node.declaration))
  //     }
  //   }
  // });

  // console.log(traversed);
}

generate();
