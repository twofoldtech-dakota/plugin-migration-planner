import"./Nq2m2xDw.js";import{o as k}from"./DsmKcCbW.js";import{d as q,p as z,e as F,r as G,g as u,z as p,t as R,C as y,i as T,a as H,b as N,B as A,f as W}from"./DcamcR-f.js";import{a as j,s as I}from"./CTZ8dTRF.js";import{b as J}from"./DwGCDbOQ.js";import{p as g}from"./jfJYy30P.js";var K=W('<span role="presentation"><!></span>');function X(C,a){z(a,!0);let c=g(a,"position",3,"top"),E=g(a,"delay",3,350),P=g(a,"block",3,!1),d=A(!1),h=A(void 0),t=null,l=null,r=null;const m=6,f=8;function _(){t||(t=document.createElement("div"),t.setAttribute("role","tooltip"),t.style.cssText=`
			position: fixed;
			z-index: 9999;
			pointer-events: none;
			max-width: 16rem;
			width: max-content;
			white-space: normal;
			opacity: 0;
			transform: scale(0.96);
			transition: opacity 120ms ease-out, transform 120ms ease-out;
		`,t.className="brutal-border-thin bg-surface shadow-md text-xs font-mono p-2 text-text-secondary",document.body.appendChild(t))}function w(){t&&(t.remove(),t=null)}function M(){if(!u(h)||!t)return;t.textContent=a.text;const e=u(h).getBoundingClientRect(),i=t.getBoundingClientRect(),D=window.innerWidth,v=window.innerHeight;let o=0,s=0;c()==="top"?(o=e.top-i.height-m,s=e.left+e.width/2-i.width/2):c()==="bottom"?(o=e.bottom+m,s=e.left+e.width/2-i.width/2):c()==="left"?(o=e.top+e.height/2-i.height/2,s=e.left-i.width-m):(o=e.top+e.height/2-i.height/2,s=e.right+m),c()==="top"&&o<f?o=e.bottom+m:c()==="bottom"&&o+i.height>v-f&&(o=e.top-i.height-m),s=Math.max(f,Math.min(s,D-i.width-f)),o=Math.max(f,Math.min(o,v-i.height-f)),t.style.top=`${o}px`,t.style.left=`${s}px`,t.style.opacity="1",t.style.transform="scale(1)"}function x(){r&&(clearTimeout(r),r=null),u(d)||(l=setTimeout(()=>{p(d,!0),_(),requestAnimationFrame(()=>{requestAnimationFrame(M)})},E()))}function b(){l&&(clearTimeout(l),l=null),r=setTimeout(()=>{p(d,!1),w()},100)}k(()=>{l&&clearTimeout(l),r&&clearTimeout(r),w()});var n=K(),B=F(n);j(B,()=>a.children),G(n),J(n,e=>p(h,e),()=>u(h)),R(()=>I(n,1,P()?"flex min-w-0":"inline-flex")),y("mouseenter",n,x),y("mouseleave",n,b),T("focusin",n,x),T("focusout",n,b),H(C,n),N()}q(["focusin","focusout"]);export{X as T};
