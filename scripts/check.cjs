const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
for(const m of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g))assert(fs.existsSync(path.join(root,m[1])),`Missing asset ${m[1]}`);
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const file of scripts){const source=fs.readFileSync(path.join(root,file),'utf8');new vm.Script(source,{filename:file});if(file!=='app.js')vm.runInContext(source,ctx,{filename:file});}
const {TERMS:terms,TERM_DOMAINS:domains,DEMOS:demos}=ctx;
const ids=new Set(terms.map(t=>t.id));assert.equal(ids.size,terms.length,'Duplicate term IDs');
assert.equal(new Set(domains.map(d=>d.id)).size,domains.length,'Duplicate domain IDs');
for(const t of terms){
 const d=domains.find(d=>d.id===t.domain);assert(d,`Unknown domain ${t.id}`);assert(d.categories.includes(t.category),`Unknown category ${t.id}`);
 for(const k of ['id','name','en','brief','definition','tip','code','why','source'])assert(typeof t[k]==='string'&&t[k].trim(),`${t.id}: missing ${k}`);
 assert.equal(typeof demos[t.demo],'function',`Missing demo ${t.id}`);
 assert(t.quiz.length>=3&&Number.isInteger(t.answer)&&t.answer>=0&&t.answer<t.quiz.length-1,`Invalid quiz ${t.id}`);
 for(const id of t.related)assert(ids.has(id),`${t.id}: invalid related ${id}`);
 if(t.domain==='ui'){
  assert(t.variants?.length>=2,`Missing variants ${t.id}`);
  assert(ids.has(t.comparison?.other)&&t.comparison.difference,`Invalid comparison ${t.id}`);
 }
 assert.equal(new URL(t.source).protocol,'https:');
}
console.log(`Validated ${terms.length} terms, ${domains.length} domains and ${scripts.length} scripts.`);
