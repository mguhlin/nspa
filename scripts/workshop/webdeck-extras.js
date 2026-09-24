/* Small integration fixes; the supplied framework retains all navigation controls. */
(function(){
 // Space on a focused control should activate that control, not advance a slide.
 document.addEventListener('keydown',function(e){
  if(e.target.closest('input,textarea,select,[contenteditable="true"]') || (e.key===' '&&e.target.closest('button,a')))e.stopImmediatePropagation();
  if(e.key==='Escape'){document.getElementById('notesPanel')?.classList.remove('open');document.getElementById('help')?.classList.remove('open');}
 },true);
 // Keep print geometry independent of a phone's reflow layout.
 const deck=document.querySelector('.deck');let wasReflow=false;
 window.addEventListener('beforeprint',()=>{wasReflow=deck.classList.contains('reflow');deck.classList.remove('reflow');});
 window.addEventListener('afterprint',()=>{if(wasReflow)deck.classList.add('reflow');});
 // Browser hash navigation supports a direct slide link, including back/forward.
 window.addEventListener('hashchange',()=>{const n=Number(location.hash.slice(1));if(Number.isFinite(n)&&n>0)window.__deck?.show(n-1);});
 let touch=null;
 deck.addEventListener('touchstart',e=>{touch=e.touches.length===1?[e.touches[0].clientX,e.touches[0].clientY]:null;},{passive:true});
 deck.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch[0],dy=e.changedTouches[0].clientY-touch[1];touch=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx<0)window.__deck?.next();else window.__deck?.prev();}},{passive:true});
})();
