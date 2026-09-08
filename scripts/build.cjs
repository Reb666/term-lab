require('./check.cjs');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),src=path.join(root,'public'),dest=path.join(root,'dist');
// Only the generated dist directory in this checkout may be replaced.
if(path.dirname(dest)!==root||path.basename(dest)!=='dist')throw Error('Invalid build output');
if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw Error('Refusing symlink output');
fs.rmSync(dest,{recursive:true,force:true});fs.cpSync(src,dest,{recursive:true});
console.log('Built dist/');
