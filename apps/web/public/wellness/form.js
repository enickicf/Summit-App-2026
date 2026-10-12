// Oct 12: the wellness class form. Chosen classes go to /api/wellness; classes that overlap a chosen one on the same
// morning are disabled (pickleball is drop-in and never clashes). Retries a network failure or 5xx up to 3 times.
const form=document.querySelector('#rsvp'),error=document.querySelector('#error');let id;
const options=[...form.querySelectorAll('.class-option')];
const refresh=()=>{for(const label of form.querySelectorAll('.activity,.transport-option'))label.classList.toggle('selected',label.querySelector('input').checked);
  const chosen=options.filter(o=>o.querySelector('input').checked&&!o.hasAttribute('data-dropin'));
  for(const o of options){const input=o.querySelector('input');if(o.hasAttribute('data-dropin')||input.checked){input.disabled=false;o.classList.remove('disabled');continue;}
    const clash=chosen.some(c=>c.dataset.day===o.dataset.day&&+c.dataset.start<+o.dataset.end&&+o.dataset.start<+c.dataset.end);input.disabled=clash;o.classList.toggle('disabled',clash);}};
form.addEventListener('change',refresh);
const post=async body=>{let last;for(let i=0;i<4;i++){try{const r=await fetch('/api/wellness',{method:'POST',headers:{'Content-Type':'application/json'},body});if(r.status<500)return r;last=r;}catch(e){last=e;}await new Promise(res=>setTimeout(res,600*(i+1)));}if(last instanceof Response)return last;throw last;};
form.addEventListener('submit',async event=>{event.preventDefault();const f=new FormData(form);error.hidden=true;
  const sessions=f.getAll('sessions');
  const data={id:id||(id=crypto.randomUUID()),name:f.get('name').trim(),email:f.get('email').trim(),phone:f.get('phone').trim(),sessions,waiverAccepted:f.has('waiverAccepted'),signature:(f.get('signature')||'').trim(),waiverVersion:f.get('waiverVersion')||'',website:f.get('website')||'',textConsent:f.has('textConsent')};
  if(!sessions.length){error.textContent='Please choose at least one class.';error.hidden=false;return;}
  const button=form.querySelector('button');button.disabled=true;button.textContent='Saving your sign-up…';
  try{const r=await post(JSON.stringify(data));let result={};try{result=await r.json();}catch{}if(!r.ok)throw Error(result.error||'We couldn’t save your sign-up. Please try again; your details are still here.');
    form.hidden=true;document.querySelector('#confirmation').hidden=false;const list=document.querySelector('#confirmed-activities');
    for(const o of options.filter(o=>o.querySelector('input').checked)){const p=document.createElement('p');p.textContent=`${o.closest('fieldset').querySelector('legend').textContent} · ${o.querySelector('b').textContent} — ${o.querySelector('strong').textContent}`;list.append(p);}
  }catch(e){error.textContent=e.message||'We couldn’t save your sign-up. Please try again; your details are still here.';error.hidden=false;}
  finally{button.disabled=false;button.textContent='Sign up';}});
refresh();
