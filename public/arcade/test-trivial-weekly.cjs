// Weekly topic Somerset Trivial (B2 Conversacion): composed categories, 2 teams, first to 3 cheeses, Time's up.
const {JSDOM}=require('jsdom'),fs=require('fs');
const APP=__dirname+'/';let fails=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ FAIL: ')+m);if(!c)fails++;};
const dom=new JSDOM(fs.readFileSync(APP+'index.html','utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
const w=dom.window,doc=w.document;
['b2conv-u01','b2conv-cowboy','b2conv-sport','b2conv-paella','b2conv-siesta','b2conv-weekend'].forEach(u=>w.eval(fs.readFileSync(APP+'units/'+u+'.js','utf8')));
const ev=s=>w.eval(s), $=s=>doc.querySelector(s), all=s=>[...doc.querySelectorAll(s)];
for(const t of ['cowboy','sport','paella','siesta','weekend']){
  const id='b2conv-'+t; ev(`Game.load('${id}')`);
  ok(all('.tile').some(x=>x.textContent.includes('Somerset Trivial')),id+': Trivial tile');
  ev('Game.trivial()');
  const c=ev('Game.tvCats()');
  ok(c.length===6&&c.every(x=>x.questions.length>=8&&x.cheese&&x.colour),id+': six composed categories, 8+ questions each ('+c.map(x=>x.questions.length)+')');
  ok(c[0].id==='topic'&&c[1].label==='Fix it!','topic colour first, Fix it! second');
  ok(new Set(c.map(x=>x.colour)).size===6&&new Set(c.map(x=>x.cheese)).size===6,id+': distinct colours and cheeses');
  ok(ev('Teams.list.length')===2&&ev('Game._tv.n')===2,id+': two teams');
  ok(ev('Game.tvWinAt()')===3,id+': first to 3 cheeses');
}
ev("Game.load('b2conv-cowboy')"); ev('Game.trivial()');
const win=(t,k)=>{ // give team t the HQ cheese k
  ev(`Game._tv.t=${t}`); ev(`Game._tv.pos[${t}]='r${7*k-1}'`); ev('Game._tv.phase="move"'); ev(`Game._tv.dests=['r${7*k}']`);
  ev(`Game.tvMove('r${7*k}')`); ev('Game.tvResolve(true)'); };
win(0,0);win(0,1); ok(!$('#ov.on.winner'),'two cheeses is not a win');
win(0,2); ok(!!$('#ov.on.winner')&&$('#ov').textContent.includes('3 cheeses first'),'third cheese wins the quick game');
ev('Game.trivial()'); win(1,0); ev('Game.tvTimeUp()');
ok($('#ov').textContent.includes('Team 2 wins'),"Time's up: most cheeses wins");
ev('Game.trivial()'); ev('Teams.list.forEach(t=>t.score=0)'); ev('Game.tvTimeUp()'); ok($('#ov').textContent.includes('tie'),"Time's up with nothing: tie");
console.log(fails?fails+' FAILED':'all passed'); process.exit(fails?1:0);
