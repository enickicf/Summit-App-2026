// Oct 12: the text-updates page. Saves a yes (consent) or no (opt out) to /api/text-preferences. Retries a network
// failure or 5xx up to 3 times.
const form=document.querySelector('#rsvp'),error=document.querySelector('#error');
form.addEventListener('change',()=>{for(const label of form.querySelectorAll('.transport-option'))label.classList.toggle('selected',label.querySelector('input').checked);});
const post=async body=>{let last;for(let i=0;i<4;i++){try{const r=await fetch('/api/text-preferences',{method:'POST',headers:{'Content-Type':'application/json'},body});if(r.status<500)return r;last=r;}catch(e){last=e;}await new Promise(res=>setTimeout(res,600*(i+1)));}if(last instanceof Response)return last;throw last;};
form.addEventListener('submit',async event=>{event.preventDefault();const f=new FormData(form);error.hidden=true;
  const data={name:(f.get('name')||'').trim(),email:(f.get('email')||'').trim(),phone:(f.get('phone')||'').trim(),choice:f.get('choice'),website:f.get('website')||''};
  const button=form.querySelector('button');button.disabled=true;button.textContent='Saving…';
  try{const r=await post(JSON.stringify(data));let result={};try{result=await r.json();}catch{}if(!r.ok)throw Error(result.error||'We couldn’t save your choice. Please try again.');
    form.hidden=true;document.querySelector('#confirmation').hidden=false;
    document.querySelector('#confirmation-text').textContent=data.choice==='yes'?'You will get texts about the event, your tickets and Inspiring Children Foundation news. Reply STOP to any text to opt out.':'We will not text you. You can still get updates by email.';
  }catch(e){error.textContent=e.message||'We couldn’t save your choice. Please try again.';error.hidden=false;}
  finally{button.disabled=false;button.textContent='Save my choice';}});
