import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  const requested = new URL(req.url,'http://localhost');
  if(requested.pathname==='/__preview'){
    const width=Math.max(320,Math.min(1440,Number(requested.searchParams.get('width'))||390));
    const screens={home:'/',games:'/games',detail:'/games/elden-ring',library:'/my-library'};
    const screen=screens[requested.searchParams.get('screen')]||'/';
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end(`<!doctype html><html><head><title>CHECKPOINT responsive review</title><style>body{margin:0;background:#303439;display:flex;justify-content:center}iframe{width:${width}px;height:100vh;border:0;background:#101214;flex-shrink:0}</style></head><body><iframe src="/#${screen}" title="CHECKPOINT ${width}px preview"></iframe></body></html>`);return;
  }
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  try{const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}
  catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
const port = Number(process.env.CHECKPOINT_DEMO_PORT || 4173);
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
