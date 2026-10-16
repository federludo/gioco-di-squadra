// Cloudflare Worker dedicated to the Gioco di Squadra public visit counter.
// Independent from GitHub Pages; only bind to the exact /api/visits route.
const responseHeaders={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff'
};

export class VisitCounter {
  constructor(state,env){
    this.state=state;
    this.env=env;
  }

  async fetch(request){
    if(request.method!=='GET'&&request.method!=='POST'){
      return new Response(JSON.stringify({error:'Method not allowed'}),{
        status:405,headers:{...responseHeaders,Allow:'GET, POST'}
      });
    }
    // One counter, stored persistently in this site's own Durable Object.
    // A transaction keeps increments consistent under concurrent requests.
    let count;
    if(request.method==='POST'){
      count=await this.state.storage.transaction(async transaction=>{
        const previous=(await transaction.get('visits'))??0;
        const next=previous+1;
        await transaction.put('visits',next);
        return next;
      });
    }else{
      count=(await this.state.storage.get('visits'))??0;
    }
    return new Response(JSON.stringify({count}),{headers:responseHeaders});
  }
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname!=='/api/visits'){
      return new Response(JSON.stringify({error:'Not found'}),{status:404,headers:responseHeaders});
    }
    if(request.method!=='GET'&&request.method!=='POST'){
      return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...responseHeaders,Allow:'GET, POST'}});
    }
    if(request.method==='POST'){
      const origin=request.headers.get('Origin');
      const site=request.headers.get('Sec-Fetch-Site');
      if(origin!==url.origin||(site&&site!=='same-origin')){
        return new Response(JSON.stringify({error:'Forbidden'}),{status:403,headers:responseHeaders});
      }
    }
    const id=env.VISIT_COUNTER.idFromName('giocodisquadra-global-visits');
    const stub=env.VISIT_COUNTER.get(id);
    return stub.fetch(request);
  }
};
