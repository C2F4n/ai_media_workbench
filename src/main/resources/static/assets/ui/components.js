var AmwUI=(function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var t=Object.defineProperty,n=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r};function r(e){let t=Object.create(null);for(let n of e.split(`,`))t[n]=1;return e=>e in t}var i={},a=[],o=()=>{},s=()=>!1,c=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&(e.charCodeAt(2)>122||e.charCodeAt(2)<97),l=e=>e.startsWith(`onUpdate:`),u=Object.assign,d=(e,t)=>{let n=e.indexOf(t);n>-1&&e.splice(n,1)},f=Object.prototype.hasOwnProperty,p=(e,t)=>f.call(e,t),m=Array.isArray,h=e=>w(e)===`[object Map]`,g=e=>w(e)===`[object Set]`,_=e=>w(e)===`[object Date]`,v=e=>typeof e==`function`,y=e=>typeof e==`string`,b=e=>typeof e==`symbol`,x=e=>typeof e==`object`&&!!e,S=e=>(x(e)||v(e))&&v(e.then)&&v(e.catch),C=Object.prototype.toString,w=e=>C.call(e),T=e=>w(e).slice(8,-1),E=e=>w(e)===`[object Object]`,D=e=>y(e)&&e!==`NaN`&&e[0]!==`-`&&``+parseInt(e,10)===e,O=r(`,key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted`),k=e=>{let t=Object.create(null);return(n=>t[n]||(t[n]=e(n)))},A=/-\w/g,j=k(e=>e.replace(A,e=>e.slice(1).toUpperCase())),ee=/\B([A-Z])/g,M=k(e=>e.replace(ee,`-$1`).toLowerCase()),te=k(e=>e.charAt(0).toUpperCase()+e.slice(1)),N=k(e=>e?`on${te(e)}`:``),P=(e,t)=>!Object.is(e,t),ne=(e,...t)=>{for(let n=0;n<e.length;n++)e[n](...t)},re=(e,t,n,r=!1)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:r,value:n})},ie=e=>{let t=parseFloat(e);return isNaN(t)?e:t},ae=e=>{let t=y(e)?Number(e):NaN;return isNaN(t)?e:t},oe,se=()=>oe||=typeof globalThis<`u`?globalThis:typeof self<`u`?self:typeof window<`u`?window:typeof global<`u`?global:{};function ce(e){if(m(e)){let t={};for(let n=0;n<e.length;n++){let r=e[n],i=y(r)?fe(r):ce(r);if(i)for(let e in i)t[e]=i[e]}return t}if(y(e)||x(e))return e}var le=/;(?![^(]*\))/g,ue=/:([^]+)/,de=/"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;function fe(e){let t={};return e.replace(de,e=>e.startsWith(`/*`)?``:e).split(le).forEach(e=>{if(e){let n=e.split(ue);n.length>1&&(t[n[0].trim()]=n[1].trim())}}),t}function pe(e){let t=``;if(y(e))t=e;else if(m(e))for(let n=0;n<e.length;n++){let r=pe(e[n]);r&&(t+=r+` `)}else if(x(e))for(let n in e)e[n]&&(t+=n+` `);return t.trim()}var me=r(`itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly`);function he(e){return!!e||e===``}function ge(e,t,n){if(e.length!==t.length)return!1;let r=!0;for(let i=0;r&&i<e.length;i++)r=be(e[i],t[i],n);return r}function _e(e,t,n){if(e.size!==t.size)return!1;let r=Array.from(t),i=new Uint8Array(r.length);for(let t of e){let e=-1;for(let a=0;a<r.length;a++)if(!i[a]&&be(t,r[a],n)){e=a;break}if(e<0)return!1;i[e]=1}return!0}function ve(e,t,n){let r=h(e),i=h(t);if(r||i||(r=g(e),i=g(t),r||i))return r&&i?_e(e,t,n):!1;if(Object.keys(e).length!==Object.keys(t).length)return!1;for(let r in e){let i=e.hasOwnProperty(r),a=t.hasOwnProperty(r);if(i&&!a||!i&&a||!be(e[r],t[r],n))return!1}return String(e)===String(t)}function ye(e,t,n,r){n||=[new Map,new Map];let[i,a]=n;if(i.has(e)||a.has(t))return i.get(e)===t&&a.get(t)===e;i.set(e,t),a.set(t,e);let o=r(e,t,n);return i.delete(e),a.delete(t),o}function be(e,t,n){if(e===t)return!0;let r=_(e),i=_(t);return r||i?r&&i?e.getTime()===t.getTime():!1:(r=b(e),i=b(t),r||i?e===t:(r=m(e),i=m(t),r||i?r&&i?ye(e,t,n,ge):!1:(r=x(e),i=x(t),r||i?!r||!i?!1:ye(e,t,n,ve):String(e)===String(t))))}function xe(e,t){return e.findIndex(e=>be(e,t))}var Se=e=>!!(e&&e.__v_isRef===!0),F=e=>y(e)?e:e==null?``:m(e)||x(e)&&(e.toString===C||!v(e.toString))?Se(e)?F(e.value):JSON.stringify(e,I,2):String(e),I=(e,t)=>Se(t)?I(e,t.value):h(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((e,[t,n],r)=>(e[Ce(t,r)+` =>`]=n,e),{})}:g(t)?{[`Set(${t.size})`]:[...t.values()].map(e=>Ce(e))}:b(t)?Ce(t):x(t)&&!m(t)&&!E(t)?String(t):t,Ce=(e,t=``)=>b(e)?`Symbol(${e.description??t})`:e,L,we=class{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this._warnOnRun=!0,this.__v_skip=!0,!e&&L&&(L.active?(this.parent=L,this.index=(L.scopes||(L.scopes=[])).push(this)-1):(this._active=!1,this._warnOnRun=!1))}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes){let n=this.scopes.slice();for(e=0,t=n.length;e<t;e++)n[e].pause()}for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes){let n=this.scopes.slice();for(e=0,t=n.length;e<t;e++)n[e].resume()}let n=this.effects.slice();for(e=0,t=n.length;e<t;e++)n[e].resume()}}run(e){if(this._active){let t=L;try{return L=this,e()}finally{L=t}}}on(){++this._on===1&&(this.prevScope=L,L=this)}off(){if(this._on>0&&--this._on===0){if(L===this)L=this.prevScope;else{let e=L;for(;e;){if(e.prevScope===this){e.prevScope=this.prevScope;break}e=e.prevScope}}this.prevScope=void 0}}stop(e){if(this._active){this._active=!1;let t,n;for(t=0,n=this.effects.length;t<n;t++)this.effects[t].stop();for(this.effects.length=0,t=0,n=this.cleanups.length;t<n;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){let e=this.scopes.slice();for(t=0,n=e.length;t<n;t++)e[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){let e=this.parent.scopes.pop();e&&e!==this&&(this.parent.scopes[this.index]=e,e.index=this.index)}this.parent=void 0}}};function R(){return L}var z,Te=new WeakSet,B=class{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,L&&(L.active?L.effects.push(this):this.flags&=-2)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Te.has(this)&&(Te.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||ke(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,He(this),Me(this);let e=z,t=Re;z=this,Re=!0;try{return this.fn()}finally{Ne(this),z=e,Re=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Ie(e);this.deps=this.depsTail=void 0,He(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Te.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Pe(this)&&this.run()}get dirty(){return Pe(this)}},Ee=0,De,Oe;function ke(e,t=!1){e.flags|=8,t?(e.next=Oe,Oe=e):(e.next=De,De=e)}function Ae(){Ee++}function je(){if(--Ee>0)return;if(Oe){let e=Oe;for(Oe=void 0;e;){let t=e.next;e.next=void 0,e.flags&=-9,e=t}}let e;for(;De;){let t=De;for(De=void 0;t;){let n=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(t){e||=t}t=n}}if(e)throw e}function Me(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function Ne(e){let t,n=e.depsTail,r=n;for(;r;){let e=r.prevDep;r.version===-1?(r===n&&(n=e),Ie(r),Le(r)):t=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=e}e.deps=t,e.depsTail=n}function Pe(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(Fe(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function Fe(e){if(e.flags&4&&!(e.flags&16)||(e.flags&=-17,e.globalVersion===Ue)||(e.globalVersion=Ue,!e.isSSR&&e.flags&128&&(!e.deps&&!e._dirty||!Pe(e))))return;e.flags|=2;let t=e.dep,n=z,r=Re;z=e,Re=!0;try{Me(e);let n=e.fn(e._value);(t.version===0||P(n,e._value))&&(e.flags|=128,e._value=n,t.version++)}catch(e){throw t.version++,e}finally{z=n,Re=r,Ne(e),e.flags&=-3}}function Ie(e,t=!1){let{dep:n,prevSub:r,nextSub:i}=e;if(r&&(r.nextSub=i,e.prevSub=void 0),i&&(i.prevSub=r,e.nextSub=void 0),n.subs===e&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let e=n.computed.deps;e;e=e.nextDep)Ie(e,!0)}!t&&!--n.sc&&n.map&&n.map.delete(n.key)}function Le(e){let{prevDep:t,nextDep:n}=e;t&&(t.nextDep=n,e.prevDep=void 0),n&&(n.prevDep=t,e.nextDep=void 0)}var Re=!0,ze=[];function Be(){ze.push(Re),Re=!1}function Ve(){let e=ze.pop();Re=e===void 0||e}function He(e){let{cleanup:t}=e;if(e.cleanup=void 0,t){let e=z;z=void 0;try{t()}finally{z=e}}}var Ue=0,We=class{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}},Ge=class{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!z||!Re||z===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==z)t=this.activeLink=new We(z,this),z.deps?(t.prevDep=z.depsTail,z.depsTail.nextDep=t,z.depsTail=t):z.deps=z.depsTail=t,Ke(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){let e=t.nextDep;e.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=e),t.prevDep=z.depsTail,t.nextDep=void 0,z.depsTail.nextDep=t,z.depsTail=t,z.deps===t&&(z.deps=e)}return t}trigger(e){this.version++,Ue++,this.notify(e)}notify(e){Ae();try{for(let e=this.subs;e;e=e.prevSub)e.sub.notify()&&e.sub.dep.notify()}finally{je()}}};function Ke(e){if(e.dep.sc++,e.sub.flags&4){let t=e.dep.computed;if(t&&!e.dep.subs){t.flags|=20;for(let e=t.deps;e;e=e.nextDep)Ke(e)}let n=e.dep.subs;n!==e&&(e.prevSub=n,n&&(n.nextSub=e)),e.dep.subs=e}}var qe=new WeakMap,Je=Symbol(``),Ye=Symbol(``),Xe=Symbol(``);function Ze(e,t,n){if(Re&&z){let t=qe.get(e);t||qe.set(e,t=new Map);let r=t.get(n);r||(t.set(n,r=new Ge),r.map=t,r.key=n),r.track()}}function Qe(e,t,n,r,i,a){let o=qe.get(e);if(!o){Ue++;return}let s=e=>{e&&e.trigger()};if(Ae(),t===`clear`)o.forEach(s);else{let i=m(e),a=i&&D(n);if(i&&n===`length`){let e=Number(r);o.forEach((t,n)=>{(n===`length`||n===Xe||!b(n)&&n>=e)&&s(t)})}else switch((n!==void 0||o.has(void 0))&&s(o.get(n)),a&&s(o.get(Xe)),t){case`add`:i?a&&s(o.get(`length`)):(s(o.get(Je)),h(e)&&s(o.get(Ye)));break;case`delete`:i||(s(o.get(Je)),h(e)&&s(o.get(Ye)));break;case`set`:h(e)&&s(o.get(Je))}}je()}function $e(e){let t=zt(e);return t===e||(Ze(t,`iterate`,Xe),Lt(e))?t:It(e)?Ft(e)?t.map(e=>Ht(Vt(e))):t.map(Ht):t.map(Vt)}function et(e){return Ze(e=zt(e),`iterate`,Xe),e}function tt(e,t){return It(e)?Ht(Ft(e)?Vt(t):t):Vt(t)}var nt={__proto__:null,[Symbol.iterator](){return rt(this,Symbol.iterator,e=>tt(this,e))},concat(...e){return $e(this).concat(...e.map(e=>m(e)?$e(e):e))},entries(){return rt(this,`entries`,e=>(e[1]=tt(this,e[1]),e))},every(e,t){return V(this,`every`,e,t,void 0,arguments)},filter(e,t){return V(this,`filter`,e,t,e=>e.map(e=>tt(this,e)),arguments)},find(e,t){return V(this,`find`,e,t,e=>tt(this,e),arguments)},findIndex(e,t){return V(this,`findIndex`,e,t,void 0,arguments)},findLast(e,t){return V(this,`findLast`,e,t,e=>tt(this,e),arguments)},findLastIndex(e,t){return V(this,`findLastIndex`,e,t,void 0,arguments)},forEach(e,t){return V(this,`forEach`,e,t,void 0,arguments)},includes(...e){return st(this,`includes`,e)},indexOf(...e){return st(this,`indexOf`,e)},join(e){return $e(this).join(e)},lastIndexOf(...e){return st(this,`lastIndexOf`,e)},map(e,t){return V(this,`map`,e,t,void 0,arguments)},pop(){return ct(this,`pop`)},push(...e){return ct(this,`push`,e)},reduce(e,...t){return ot(this,`reduce`,e,t)},reduceRight(e,...t){return ot(this,`reduceRight`,e,t)},shift(){return ct(this,`shift`)},some(e,t){return V(this,`some`,e,t,void 0,arguments)},splice(...e){return ct(this,`splice`,e)},toReversed(){return $e(this).toReversed()},toSorted(e){return $e(this).toSorted(e)},toSpliced(...e){return $e(this).toSpliced(...e)},unshift(...e){return ct(this,`unshift`,e)},values(){return rt(this,`values`,e=>tt(this,e))}};function rt(e,t,n){let r=et(e),i=r[t],a=i.call(r);if(r!==e&&!Lt(e)){if(a[Symbol.toStringTag]===`Array Iterator`){let e=Object.create(Object.getPrototypeOf(a));return e.next=()=>it(a.next(),n),i!==at[t]&&Object.defineProperties(e,{return:{get(){let e=a.return;return typeof e==`function`?e.bind(a):e}},throw:{get(){let e=a.throw;return typeof e==`function`?e.bind(a):e}}}),e}a._next=a.next,a.next=()=>it(a._next(),n)}return a}function it(e,t){return e.done||(e.value=t(e.value)),e}var at=Array.prototype;function V(e,t,n,r,i,a){let o=et(e),s=o!==e&&!Lt(e),c=o[t];if(c!==at[t]){let t=c.apply(e,a);return s?Vt(t):t}let l=n;o!==e&&(s?l=function(t,r){return n.call(this,tt(e,t),r,e)}:n.length>2&&(l=function(t,r){return n.call(this,t,r,e)}));let u=c.call(o,l,r);return s&&i?i(u):u}function ot(e,t,n,r){let i=et(e),a=i!==e&&!Lt(e),o=n,s=!1;i!==e&&(a?(s=r.length===0,o=function(t,r,i){return s&&(s=!1,t=tt(e,t)),n.call(this,t,tt(e,r),i,e)}):n.length>3&&(o=function(t,r,i){return n.call(this,t,r,i,e)}));let c=i[t](o,...r);return s?tt(e,c):c}function st(e,t,n){let r=zt(e);Ze(r,`iterate`,Xe);let i=r[t](...n);return(i===-1||i===!1)&&Rt(n[0])?(n[0]=zt(n[0]),r[t](...n)):i}function ct(e,t,n=[]){Be(),Ae();let r=zt(e)[t].apply(e,n);return je(),Ve(),r}var lt=r(`__proto__,__v_isRef,__isVue`),H=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!==`arguments`&&e!==`caller`).map(e=>Symbol[e]).filter(b));function ut(e){b(e)||(e=String(e));let t=zt(this);return Ze(t,`has`,e),t.hasOwnProperty(e)}var dt=class{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,n){if(t===`__v_skip`)return e.__v_skip;let r=this._isReadonly,i=this._isShallow;if(t===`__v_isReactive`)return!r;if(t===`__v_isReadonly`)return r;if(t===`__v_isShallow`)return i;if(t===`__v_raw`)return n===(r?i?kt:Ot:i?Dt:Et).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(n)?e:void 0;let a=m(e);if(!r){let e;if(a&&(e=nt[t]))return e;if(t===`hasOwnProperty`)return ut}let o=Reflect.get(e,t,Ut(e)?e:n);if((b(t)?H.has(t):lt(t))||(r||Ze(e,`get`,t),i))return o;if(Ut(o)){let e=a&&D(t)?o:o.value;return r&&x(e)?Nt(e):e}return x(o)?r?Nt(o):jt(o):o}},ft=class extends dt{constructor(e=!1){super(!1,e)}set(e,t,n,r){let i=e[t],a=m(e)&&D(t);if(!this._isShallow){let e=It(i);if(!Lt(n)&&!It(n)&&(i=zt(i),n=zt(n)),!a&&Ut(i)&&!Ut(n))return e||(i.value=n),!0}let o=a?Number(t)<e.length:p(e,t),s=Reflect.set(e,t,n,Ut(e)?e:r);return e===zt(r)&&s&&(o?P(n,i)&&Qe(e,`set`,t,n,i):Qe(e,`add`,t,n)),s}deleteProperty(e,t){let n=p(e,t),r=e[t],i=Reflect.deleteProperty(e,t);return i&&n&&Qe(e,`delete`,t,void 0,r),i}has(e,t){let n=Reflect.has(e,t);return b(t)&&H.has(t)||Ze(e,`has`,t),n}ownKeys(e){return Ze(e,`iterate`,m(e)?`length`:Je),Reflect.ownKeys(e)}},pt=class extends dt{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}},mt=new ft,ht=new pt,gt=new ft(!0),_t=e=>e,vt=e=>Reflect.getPrototypeOf(e);function yt(e,t,n){return function(...r){let i=this.__v_raw,a=zt(i),o=h(a),s=e===`entries`||e===Symbol.iterator&&o,c=e===`keys`&&o,l=i[e](...r),d=n?_t:t?Ht:Vt;return!t&&Ze(a,`iterate`,c?Ye:Je),u(Object.create(l),{next(){let{value:e,done:t}=l.next();return t?{value:e,done:t}:{value:s?[d(e[0]),d(e[1])]:d(e),done:t}}})}}function bt(e){return function(...t){return e===`delete`?!1:e===`clear`?void 0:this}}function xt(e,t){let n={get(n){let r=this.__v_raw,i=zt(r),a=zt(n);e||(P(n,a)&&Ze(i,`get`,n),Ze(i,`get`,a));let{has:o}=vt(i),s=t?_t:e?Ht:Vt;if(o.call(i,n))return s(r.get(n));if(o.call(i,a))return s(r.get(a));r!==i&&r.get(n)},get size(){let t=this.__v_raw;return!e&&Ze(zt(t),`iterate`,Je),t.size},has(t){let n=this.__v_raw,r=zt(n),i=zt(t);return e||(P(t,i)&&Ze(r,`has`,t),Ze(r,`has`,i)),t===i?n.has(t):n.has(t)||n.has(i)},forEach(n,r){let i=this,a=i.__v_raw,o=zt(a),s=t?_t:e?Ht:Vt;return!e&&Ze(o,`iterate`,Je),a.forEach((e,t)=>n.call(r,s(e),s(t),i))}};return u(n,e?{add:bt(`add`),set:bt(`set`),delete:bt(`delete`),clear:bt(`clear`)}:{add(e){let n=zt(this),r=vt(n),i=zt(e),a=!t&&!Lt(e)&&!It(e)?i:e;return r.has.call(n,a)||P(e,a)&&r.has.call(n,e)||P(i,a)&&r.has.call(n,i)||(n.add(a),Qe(n,`add`,a,a)),this},set(e,n){t||Lt(n)||It(n)||(n=zt(n));let r=zt(this),{has:i,get:a}=vt(r),o=i.call(r,e);o||=(e=zt(e),i.call(r,e));let s=a.call(r,e);return r.set(e,n),o?P(n,s)&&Qe(r,`set`,e,n,s):Qe(r,`add`,e,n),this},delete(e){let t=zt(this),{has:n,get:r}=vt(t),i=n.call(t,e);i||=(e=zt(e),n.call(t,e));let a=r?r.call(t,e):void 0,o=t.delete(e);return i&&Qe(t,`delete`,e,void 0,a),o},clear(){let e=zt(this),t=e.size!==0,n=e.clear();return t&&Qe(e,`clear`,void 0,void 0,void 0),n}}),[`keys`,`values`,`entries`,Symbol.iterator].forEach(r=>{n[r]=yt(r,e,t)}),n}function St(e,t){let n=xt(e,t);return(r,i,a)=>i===`__v_isReactive`?!e:i===`__v_isReadonly`?e:i===`__v_isShallow`?t:i===`__v_raw`?r:Reflect.get(p(n,i)&&i in r?n:r,i,a)}var Ct={get:St(!1,!1)},wt={get:St(!1,!0)},Tt={get:St(!0,!1)},Et=new WeakMap,Dt=new WeakMap,Ot=new WeakMap,kt=new WeakMap;function At(e){switch(e){case`Object`:case`Array`:return 1;case`Map`:case`Set`:case`WeakMap`:case`WeakSet`:return 2;default:return 0}}function jt(e){return It(e)?e:Pt(e,!1,mt,Ct,Et)}function Mt(e){return Pt(e,!1,gt,wt,Dt)}function Nt(e){return Pt(e,!0,ht,Tt,Ot)}function Pt(e,t,n,r,i){if(!x(e)||e.__v_raw&&!(t&&e.__v_isReactive)||e.__v_skip||!Object.isExtensible(e))return e;let a=i.get(e);if(a)return a;let o=At(T(e));if(o===0)return e;let s=new Proxy(e,o===2?r:n);return i.set(e,s),s}function Ft(e){return It(e)?Ft(e.__v_raw):!!(e&&e.__v_isReactive)}function It(e){return!!(e&&e.__v_isReadonly)}function Lt(e){return!!(e&&e.__v_isShallow)}function Rt(e){return e?!!e.__v_raw:!1}function zt(e){let t=e&&e.__v_raw;return t?zt(t):e}function Bt(e){return!p(e,`__v_skip`)&&Object.isExtensible(e)&&re(e,`__v_skip`,!0),e}var Vt=e=>x(e)?jt(e):e,Ht=e=>x(e)?Nt(e):e;function Ut(e){return e?e.__v_isRef===!0:!1}function U(e){return Gt(e,!1)}function Wt(e){return Gt(e,!0)}function Gt(e,t){return Ut(e)?e:new Kt(e,t)}var Kt=class{constructor(e,t){this.dep=new Ge,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:zt(e),this._value=t?e:Vt(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){let t=this._rawValue,n=this.__v_isShallow||Lt(e)||It(e);e=n?e:zt(e),P(e,t)&&(this._rawValue=e,this._value=n?e:Vt(e),this.dep.trigger())}};function W(e){return Ut(e)?e.value:e}var qt={get:(e,t,n)=>t===`__v_raw`?e:W(Reflect.get(e,t,n)),set:(e,t,n,r)=>{let i=e[t];return Ut(i)&&!Ut(n)?(i.value=n,!0):Reflect.set(e,t,n,r)}};function Jt(e){return Ft(e)?e:new Proxy(e,qt)}var Yt=class{constructor(e){this.__v_isRef=!0,this._value=void 0;let t=this.dep=new Ge,{get:n,set:r}=e(t.track.bind(t),t.trigger.bind(t));this._get=n,this._set=r}get value(){return this._value=this._get()}set value(e){this._set(e)}};function Xt(e){return new Yt(e)}var Zt=class{constructor(e,t,n){this.fn=e,this.setter=t,this._value=void 0,this.dep=new Ge(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Ue-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=n}notify(){if(this.flags|=16,!(this.flags&8)&&z!==this)return ke(this,!0),!0}get value(){let e=this.dep.track();return Fe(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}};function Qt(e,t,n=!1){let r,i;return v(e)?r=e:(r=e.get,i=e.set),new Zt(r,i,n)}var $t={},en=new WeakMap,tn=void 0;function nn(e,t=!1,n=tn){if(n){let t=en.get(n);t||en.set(n,t=[]),t.push(e)}}function rn(e,t,n=i){let{immediate:r,deep:a,once:s,scheduler:c,augmentJob:l,call:u}=n,f=e=>a?e:Lt(e)||a===!1||a===0?an(e,1):an(e),p,h,g,_,y=!1,b=!1;if(Ut(e)?(h=()=>e.value,y=Lt(e)):Ft(e)?(h=()=>f(e),y=!0):m(e)?(b=!0,y=e.some(e=>Ft(e)||Lt(e)),h=()=>e.map(e=>{if(Ut(e))return e.value;if(Ft(e))return f(e);if(v(e))return u?u(e,2):e()})):h=v(e)?t?u?()=>u(e,2):e:()=>{if(g){Be();try{g()}finally{Ve()}}let t=tn;tn=p;try{return u?u(e,3,[_]):e(_)}finally{tn=t}}:o,t&&a){let e=h,t=a===!0?1/0:a;h=()=>an(e(),t)}let x=R(),S=()=>{p.stop(),x&&x.active&&d(x.effects,p)};if(s&&t){let e=t;t=(...t)=>{try{return e(...t)}finally{S()}}}let C=b?Array(e.length).fill($t):$t,w=e=>{if(p.flags&1&&(p.dirty||e)){if(t){let n=p.run();if(e||a||y||(b?n.some((e,t)=>P(e,C[t])):P(n,C))){let e=tn;Be();try{g&&g(),tn=p;let e=[n,C===$t?void 0:b&&C[0]===$t?[]:C,_];C=n,u?u(t,3,e):t(...e)}finally{tn=e,Ve()}}}else p.run()}};return l&&l(w),p=new B(h),p.scheduler=c?()=>c(w,!1):w,_=e=>nn(e,!1,p),g=p.onStop=()=>{let e=en.get(p);if(e){if(u)u(e,4);else for(let t of e)t();en.delete(p)}},t?r?w(!0):C=p.run():c?c(w.bind(null,!0),!0):p.run(),S.pause=p.pause.bind(p),S.resume=p.resume.bind(p),S.stop=S,S}function an(e,t=1/0,n){if(t<=0||!x(e)||e.__v_skip||(n||=new Map,(n.get(e)||0)>=t))return e;if(n.set(e,t),t--,Ut(e))an(e.value,t,n);else if(m(e))for(let r=0;r<e.length;r++)an(e[r],t,n);else if(g(e)||h(e))e.forEach(e=>{an(e,t,n)});else if(E(e)){for(let r in e)an(e[r],t,n);for(let r of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,r)&&an(e[r],t,n)}return e}function on(e,t,n,r){try{return r?e(...r):e()}catch(e){cn(e,t,n)}}function sn(e,t,n,r){if(v(e)){let i=on(e,t,n,r);return i&&S(i)&&i.catch(e=>{cn(e,t,n)}),i}if(m(e)){let i=[];for(let a=0;a<e.length;a++)i.push(sn(e[a],t,n,r));return i}}function cn(e,t,n,r=!0){let a=t?t.vnode:null,{errorHandler:o,throwUnhandledErrorInProduction:s}=t&&t.appContext.config||i;if(t){let r=t.parent,i=t.proxy,a=`https://vuejs.org/error-reference/#runtime-${n}`;for(;r;){let t=r.ec;if(t){for(let n=0;n<t.length;n++)if(t[n](e,i,a)===!1)return}r=r.parent}if(o){Be(),on(o,null,10,[e,i,a]),Ve();return}}ln(e,n,a,r,s)}function ln(e,t,n,r=!0,i=!1){if(i)throw e;console.error(e)}var un=[],dn=-1,fn=[],pn=null,mn=0,hn=Promise.resolve(),gn=null;function _n(e){let t=gn||hn;return e?t.then(this?e.bind(this):e):t}function vn(e){let t=dn+1,n=un.length;for(;t<n;){let r=t+n>>>1,i=un[r],a=En(i);a<e||a===e&&i.flags&2?t=r+1:n=r}return t}function yn(e){if(!(e.flags&1)){let t=En(e),n=un[un.length-1];!n||!(e.flags&2)&&t>=En(n)?un.push(e):un.splice(vn(t),0,e),e.flags|=1,bn()}}function bn(){gn||=hn.then(Dn)}function xn(e){if(!m(e))pn&&e.id===-1?pn.splice(mn+1,0,e):e.flags&1||(fn.push(e),e.flags|=1);else for(let t=0;t<e.length;t++)fn.push(e[t]);bn()}function Sn(e,t,n,r=dn+1){for(;r<un.length;r++){let n=un[r];if(n&&n.flags&2){if(e&&n.id!==e.uid||t!==void 0&&!(n.id>=t))continue;un.splice(r,1),r=e?r-1:dn,n.flags&4&&(n.flags&=-2),n(),n.flags&4||(n.flags&=-2)}}}function Cn(e,t,n=0){if(fn.length){let e=fn,r=0;if(t){e=[];for(let i=0;i<fn.length;i++){let a=fn[i];(a.i===void 0?t.has(a):!a.i||a.i.uid<n)?fn[r++]=a:e.push(a)}}let i=[...new Set(e)].sort((e,t)=>En(e)-En(t));if(fn.length=r,pn){for(let e=0;e<i.length;e++)pn.push(i[e]);return}for(pn=i,mn=0;mn<pn.length;mn++){let e=pn[mn];e.flags&4&&(e.flags&=-2),e.flags&8||e(),e.flags&=-2}pn=null,mn=0}}var wn=!1;function Tn(e,t){if(wn){e();return}let n=t===void 0?void 0:new Set(fn);e(),wn=!0;try{Sn(void 0,t),Cn(void 0,n,t)}finally{wn=!1}}var En=e=>e.id==null?e.flags&2?-1:1/0:e.id;function Dn(e){try{for(dn=0;dn<un.length;dn++){let e=un[dn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),on(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;dn<un.length;dn++){let e=un[dn];e&&(e.flags&=-2)}dn=-1,un.length=0,Cn(e),gn=null,(un.length||fn.length)&&Dn(e)}}var On=null,kn=null;function An(e){let t=On;return On=e,kn=e&&e.type.__scopeId||null,t}function jn(e,t=On,n){if(!t||e._n)return e;let r=(...n)=>{r._d&&Ui(-1);let i=An(t),a=zi.length,o;try{o=e(...n)}finally{for(let e=zi.length;e>a;e--)Vi();An(i),r._d&&Ui(1)}return o};return r._n=!0,r._c=!0,r._d=!0,r}function Mn(e,t){if(On===null)return e;let n=Ea(On),r=e.dirs||=[];for(let e=0;e<t.length;e++){let[a,o,s,c=i]=t[e];a&&(v(a)&&(a={mounted:a,updated:a}),a.deep&&an(o),r.push({dir:a,instance:n,value:o,oldValue:void 0,arg:s,modifiers:c}))}return e}function Nn(e,t,n,r){let i=e.dirs,a=t&&t.dirs;for(let o=0;o<i.length;o++){let s=i[o];a&&(s.oldValue=a[o].value);let c=s.dir[r];c&&(Be(),sn(c,n,8,[e.el,s,e,t]),Ve())}}function Pn(e,t,n=!1){let r=da();if(r||Kr){let i=Kr?Kr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(i&&e in i)return i[e];if(arguments.length>1)return n&&v(t)?t.call(r&&r.proxy):t}}var Fn=Symbol.for(`v-scx`),In=()=>Pn(Fn);function Ln(e,t){return zn(e,null,{flush:`sync`})}function Rn(e,t,n){return zn(e,t,n)}function zn(e,t,n=i){let{immediate:r,deep:a,flush:s,once:c}=n,l=u({},n),d=t&&r||!t&&s!==`post`,f;if(_a){if(s===`sync`){let e=In();f=e.__watcherHandles||=[]}else if(!d){let e=()=>{};return e.stop=o,e.resume=o,e.pause=o,e}}let p=ua;l.call=(e,t,n)=>sn(e,p,t,n);let m=!1;s===`post`?l.scheduler=e=>{e.i=p,Ci(e,p&&p.suspense)}:s!==`sync`&&(m=!0,l.scheduler=(e,t)=>{t?e():yn(e)}),l.augmentJob=e=>{t&&(e.flags|=4),m&&(e.flags|=2,p&&(e.id=p.uid,e.i=p))};let h=rn(e,t,l);return _a&&(f?f.push(h):d&&h()),h}var Bn=new WeakMap,Vn=Symbol(`_vte`),Hn=e=>e.__isTeleport,Un=e=>e&&(e.disabled||e.disabled===``),Wn=e=>e&&(e.defer||e.defer===``),Gn=e=>typeof SVGElement<`u`&&e instanceof SVGElement,Kn=e=>typeof MathMLElement==`function`&&e instanceof MathMLElement,qn=(e,t)=>{let n=e&&e.to;return y(n)?t?t(n):null:n},Jn={name:`Teleport`,__isTeleport:!0,process(e,t,n,r,i,a,o,s,c,l){let{mc:u,pc:d,pbc:f,o:{insert:p,querySelector:m,createText:h,createComment:g,parentNode:_}}=l,v=Un(t.props),{dynamicChildren:y}=t,b=(e,t,n)=>{e.shapeFlag&16&&u(e.children,t,n,i,a,o,s,c)},x=(e=t)=>{let n=Un(e.props),r=e.target=qn(e.props,m),a=$n(r,e,h,p);r&&(o!==`svg`&&Gn(r)?o=`svg`:o!==`mathml`&&Kn(r)&&(o=`mathml`),i&&i.isCE&&(i.ce._teleportTargets||(i.ce._teleportTargets=new Set)).add(r),n||(b(e,r,a),Qn(e,!1)))},S=e=>{let t=()=>{if(Bn.get(e)===t){if(Bn.delete(e),Un(e.props)){let t=_(e.el)||n;b(e,t,e.anchor),Qn(e,!0)}x(e)}};Bn.set(e,t),Ci(t,a)};if(e==null){let e=t.el=h(``),i=t.anchor=h(``);if(p(e,n,r),p(i,n,r),Wn(t.props)||a&&a.pendingBranch){S(t);return}v&&(b(t,n,i),Qn(t,!0)),x()}else{t.el=e.el;let r=t.anchor=e.anchor,u=Bn.get(e);if(u){u.flags|=8,Bn.delete(e),S(t);return}t.targetStart=e.targetStart;let p=t.target=e.target,h=t.targetAnchor=e.targetAnchor,g=Un(e.props),_=g?n:p,b=g?r:h;if(o===`svg`||Gn(p)?o=`svg`:(o===`mathml`||Kn(p))&&(o=`mathml`),y?(f(e.dynamicChildren,y,_,i,a,o,s),ki(e,t,!0)):c||d(e,t,_,b,i,a,o,s,!1),v)g?t.props&&e.props&&t.props.to!==e.props.to&&(t.props.to=e.props.to):Yn(t,n,r,l,1);else if((t.props&&t.props.to)!==(e.props&&e.props.to)){let e=qn(t.props,m);e&&(t.target=e,Yn(t,e,null,l,0))}else g&&Yn(t,p,h,l,1);Qn(t,v)}},remove(e,t,n,{um:r,o:{remove:i}},a){let{shapeFlag:o,children:s,anchor:c,targetStart:l,targetAnchor:u,target:d,props:f}=e,p=Un(f),m=a||!p,h=Bn.get(e);if(h&&(h.flags|=8,Bn.delete(e)),d&&(i(l),i(u)),a&&i(c),!h&&(p||d)&&o&16)for(let e=0;e<s.length;e++){let i=s[e];r(i,t,n,m,!!i.dynamicChildren)}},move:Yn,hydrate:Xn};function Yn(e,t,n,{o:{insert:r},m:i},a=2){a===0&&(e.targetStart&&r(e.targetStart,t,n),r(e.targetAnchor,t,n),n=e.targetAnchor);let{el:o,anchor:s,shapeFlag:c,children:l,props:u}=e,d=a===2;if(d&&r(o,t,n),!Bn.has(e)&&(!d||Un(u))&&c&16)for(let e=0;e<l.length;e++)i(l[e],t,n,2);d&&r(s,t,n)}function Xn(e,t,n,r,i,a,{o:{nextSibling:o,parentNode:s,querySelector:c,insert:l,createText:u}},d){function f(e,n){let r=n;for(;r;){if(r&&r.nodeType===8){if(r.data===`teleport start anchor`)t.targetStart=r;else if(r.data===`teleport anchor`){t.targetAnchor=r,e._lpa=t.targetAnchor&&o(t.targetAnchor);break}}r=o(r)}}function p(e,t){t.anchor=d(o(e),t,s(e),n,r,i,a)}let m=t.target=qn(t.props,c),h=Un(t.props);if(m){let c=m._lpa||m.firstChild;t.shapeFlag&16&&(h?(p(e,t),f(m,c),t.targetAnchor||$n(m,t,u,l,s(e)===m?e:null)):(t.anchor=o(e),f(m,c),t.targetAnchor||$n(m,t,u,l),d(c&&o(c),t,m,n,r,i,a))),Qn(t,h)}else h&&t.shapeFlag&16&&(p(e,t),t.targetStart=e,t.targetAnchor=o(e));return t.anchor&&o(t.anchor)}var Zn=Jn;function Qn(e,t){let n=e.ctx;if(n&&n.ut){let r,i;for(t?(r=e.el,i=e.anchor):(r=e.targetStart,i=e.targetAnchor);r&&r!==i;)r.nodeType===1&&r.setAttribute(`data-v-owner`,n.uid),r=r.nextSibling;n.ut()}}function $n(e,t,n,r,i=null){let a=t.targetStart=n(``),o=t.targetAnchor=n(``);return a[Vn]=o,e&&(r(a,e,i),r(o,e,i)),o}var er=Symbol(`_leaveCb`),tr=Symbol(`_enterCb`);function nr(){let e={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return Er(()=>{e.isMounted=!0}),Dr(()=>{e.isUnmounting=!0}),e}var rr=[Function,Array],ir={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:rr,onEnter:rr,onAfterEnter:rr,onEnterCancelled:rr,onBeforeLeave:rr,onLeave:rr,onAfterLeave:rr,onLeaveCancelled:rr,onBeforeAppear:rr,onAppear:rr,onAfterAppear:rr,onAppearCancelled:rr},ar={name:`BaseTransition`,props:ir,setup(e,{slots:t}){let n=da(),r=nr();return()=>{let i=t.default&&pr(t.default(),!0),a=i&&i.length?or(i):n.subTree?ea():void 0;if(!a)return;let o=zt(e),{mode:s}=o;if(r.isLeaving)return ur(a);let c=dr(a);if(!c)return ur(a);let l=lr(c,o,r,n,e=>l=e);c.type!==Li&&fr(c,l);let u=n.subTree&&dr(n.subTree);if(u&&u.type!==Li&&!qi(u,c)&&mr(n.subTree)){let e=lr(u,o,r,n);if(fr(u,e),s===`out-in`&&c.type!==Li)return r.isLeaving=!0,e.afterLeave=()=>{r.isLeaving=!1,n.job.flags&8||n.update(),delete e.afterLeave,u=void 0},ur(a);s===`in-out`&&c.type!==Li?e.delayLeave=(e,t,n)=>{let i=cr(r,u);i[String(u.key)]=u,e[er]=()=>{t(),e[er]=void 0,delete l.delayedLeave,u=void 0},l.delayedLeave=()=>{n(),delete l.delayedLeave,u=void 0}}:u=void 0}else u&&=void 0;return a}}};function or(e){let t=e[0];if(e.length>1){for(let n of e)if(n.type!==Li){t=n;break}}return t}var sr=ar;function cr(e,t){let{leavingVNodes:n}=e,r=n.get(t.type);return r||(r=Object.create(null),n.set(t.type,r)),r}function lr(e,t,n,r,i){let{appear:a,mode:o,persisted:s=!1,onBeforeEnter:c,onEnter:l,onAfterEnter:u,onEnterCancelled:d,onBeforeLeave:f,onLeave:p,onAfterLeave:h,onLeaveCancelled:g,onBeforeAppear:_,onAppear:v,onAfterAppear:y,onAppearCancelled:b}=t,x=String(e.key),S=cr(n,e),C=(e,t)=>{e&&sn(e,r,9,t)},w=(e,t)=>{let n=t[1];C(e,t),m(e)?e.every(e=>e.length<=1)&&n():e.length<=1&&n()},T={mode:o,persisted:s,beforeEnter(t){let r=c;if(!n.isMounted){if(a)r=_||c;else return}t[er]&&t[er](!0);let i=S[x];if(i&&qi(e,i)){let e=i.el[er];if(!e){let t=mr(i);e=t&&t.el[er]}e&&e()}C(r,[t])},enter(t){if(S[x]===e)return;let r=l,i=u,o=d;if(!n.isMounted){if(a)r=v||l,i=y||u,o=b||d;else return}let s=!1;t[tr]=e=>{s||(s=!0,C(e?o:i,[t]),T.delayedLeave&&T.delayedLeave(),t[tr]=void 0)};let c=t[tr].bind(null,!1);r?w(r,[t,c]):c()},leave(t,r){let i=String(e.key);if(t[tr]&&t[tr](!0),n.isUnmounting)return r();C(f,[t]);let a=!1;t[er]=n=>{a||(a=!0,r(),C(n?g:h,[t]),t[er]=void 0,S[i]===e&&delete S[i])};let o=t[er].bind(null,!1);S[i]=e,p?w(p,[t,o]):o()},clone(e){let a=lr(e,t,n,r,i);return i&&i(a),a}};return T}function ur(e){if(Cr(e))return e=Qi(e),e.children=null,e}function dr(e){if(!Cr(e))return Hn(e.type)&&e.children?or(e.children):e;if(e.component)return e.component.subTree;let{shapeFlag:t,children:n}=e;if(n){if(t&16)return n[0];if(t&32&&v(n.default))return n.default()}}function fr(e,t){if(e.shapeFlag&6&&e.component){e.transition=t;let n=e.component.subTree;fr(Hn(n.type)&&dr(n)||n,t)}else if(e.shapeFlag&128)e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback);else if(e.transition=t,e.type===G&&m(e.children)){let n=$r(e.children,!1);n&&fr(n,t)}}function pr(e,t=!1,n){let r=[],i=0;for(let a=0;a<e.length;a++){let o=e[a],s=n==null?o.key:String(n)+String(o.key==null?a:o.key);o.type===G?(o.patchFlag&128&&i++,r=r.concat(pr(o.children,t,s))):(t||o.type!==Li)&&r.push(s==null?o:Qi(o,{key:s}))}if(i>1)for(let e=0;e<r.length;e++)r[e].patchFlag=-2;return r}function mr(e){if(e.component)return mr(e.component.subTree);if(e.type===G){let t=m(e.children)&&$r(e.children,!1);return t?mr(t):void 0}if(e.type!==Li)return e}function hr(e,t){return v(e)?u({name:e.name},t,{setup:e}):e}function gr(){let e=da();return e?(e.appContext.config.idPrefix||`v`)+`-`+e.ids[0]+e.ids[1]++:``}function _r(e){e.ids=[e.ids[0]+e.ids[2]+++`-`,0,0]}function vr(e,t){let n;return!!((n=Object.getOwnPropertyDescriptor(e,t))&&!n.configurable)}var yr=new WeakMap;function br(e,t,n,r,a=!1){if(m(e)){e.forEach((e,i)=>br(e,t&&(m(t)?t[i]:t),n,r,a));return}if(Sr(r)&&!a){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&br(e,t,n,r.component.subTree);return}let o=r.shapeFlag&4?Ea(r.component):r.el,c=a?null:o,{i:l,r:u}=e,f=t&&t.r,h=l.refs===i?l.refs={}:l.refs,g=l.setupState,_=zt(g),b=g===i?s:e=>!vr(h,e)&&p(_,e),x=(e,t)=>!(t&&vr(h,t));if(f!=null&&f!==u){if(xr(t),y(f))h[f]=null,b(f)&&(g[f]=null);else if(Ut(f)){let e=t;x(f,e.k)&&(f.value=null),e.k&&(h[e.k]=null)}}if(v(u))on(u,l,12,[c,h]);else{let t=y(u),r=Ut(u);if(t||r){let i=()=>{if(e.f){let n=t?b(u)?g[u]:h[u]:x(u)||!e.k?u.value:h[e.k];if(a)m(n)&&d(n,o);else if(m(n))n.includes(o)||n.push(o);else if(t)h[u]=[o],b(u)&&(g[u]=h[u]);else{let t=[o];x(u,e.k)&&(u.value=t),e.k&&(h[e.k]=t)}}else t?(h[u]=c,b(u)&&(g[u]=c)):r&&(x(u,e.k)&&(u.value=c),e.k&&(h[e.k]=c))};if(c){let t=()=>{i(),yr.delete(e)};t.id=-1,yr.set(e,t),Ci(t,n)}else xr(e),i()}}}function xr(e){let t=yr.get(e);t&&(t.flags|=8,yr.delete(e))}se().requestIdleCallback,se().cancelIdleCallback;var Sr=e=>!!e.type.__asyncLoader,Cr=e=>e.type.__isKeepAlive;function wr(e,t,n=ua,r=!1){if(n){let i=n[e]||(n[e]=[]),a=t.__weh||=(...r)=>{Be();let i=ma(n),a=sn(t,n,e,r);return i(),Ve(),a};return r?i.unshift(a):i.push(a),a}}var Tr=e=>(t,n=ua)=>{_a&&e!==`sp`||wr(e,(...e)=>t(...e),n)},Er=Tr(`m`),Dr=Tr(`bum`),Or=Tr(`um`),kr=`components`,Ar=Symbol.for(`v-ndc`);function jr(e){return y(e)?Mr(kr,e,!1)||e:e||Ar}function Mr(e,t,n=!0,r=!1){let i=On||ua;if(i){let n=i.type;if(e===kr){let e=Da(n,!1);if(e&&(e===t||e===j(t)||e===te(j(t))))return n}let a=Nr(i[e]||n[e],t)||Nr(i.appContext[e],t);return!a&&r?n:a}}function Nr(e,t){return e&&(e[t]||e[j(t)]||e[te(j(t))])}function Pr(e,t,n,r){let i,a=n&&n[r],o=m(e);if(o||y(e)){let n=o&&Ft(e),r=!1,s=!1;n&&(r=!Lt(e),s=It(e),e=et(e)),i=Array(e.length);for(let n=0,o=e.length;n<o;n++)i[n]=t(r?s?Ht(Vt(e[n])):Vt(e[n]):e[n],n,void 0,a&&a[n])}else if(typeof e==`number`){if(!Number.isInteger(e)||e<0)i=[];else{i=Array(e);for(let n=0;n<e;n++)i[n]=t(n+1,n,void 0,a&&a[n])}}else if(x(e)){if(e[Symbol.iterator])i=Array.from(e,(e,n)=>t(e,n,void 0,a&&a[n]));else{let n=Object.keys(e);i=Array(n.length);for(let r=0,o=n.length;r<o;r++){let o=n[r];i[r]=t(e[o],o,r,a&&a[r])}}}else i=[];return n&&(n[r]=i),i}function Fr(e,t,n,r,i,a){if(n??={},On.ce||On.parent&&Sr(On.parent)&&On.parent.ce){let e=a!=null&&n.key==null?u({},n,{key:a}):n,i=Object.keys(e).length>0;return t!=="default"&&(e.name=t),K(),Gi(G,null,[Y(`slot`,e,r&&r())],i?-2:64)}let o=e[t];o&&o._c&&(o._d=!1);let s=zi.length;K();let c;try{let i=o&&Ir(o(n)),s=n.key||a||i&&i.key;c=Gi(G,{key:(s&&!b(s)?s:`_${t}`)+(!i&&r?`_fb`:``)},i||(r?r():[]),i&&e._===1?64:-2)}catch(e){for(let e=zi.length;e>s;e--)Vi();throw e}finally{o&&o._c&&(o._d=!0)}return!i&&c.scopeId&&(c.slotScopeIds=[c.scopeId+`-s`]),c}function Ir(e){return e.some(e=>!Ki(e)||!(e.type===Li||e.type===G&&!Ir(e.children)))?e:null}var Lr=e=>e?ga(e)?Ea(e):Lr(e.parent):null,Rr=u(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>Lr(e.parent),$root:e=>Lr(e.root),$host:e=>e.ce,$emit:e=>e.emit,$options:e=>e.type,$forceUpdate:e=>e.f||=()=>{yn(e.update)},$nextTick:e=>e.n||=_n.bind(e.proxy),$watch:e=>o}),zr=(e,t)=>e!==i&&!e.__isScriptSetup&&p(e,t),Br={get({_:e},t){if(t===`__v_skip`)return!0;let{ctx:n,setupState:r,data:a,props:o,accessCache:s,type:c,appContext:l}=e;if(t[0]!==`$`){let e=s[t];if(e!==void 0)switch(e){case 1:return r[t];case 2:return a[t];case 4:return n[t];case 3:return o[t]}else if(zr(r,t))return s[t]=1,r[t];else if(p(o,t))return s[t]=3,o[t];else if(n!==i&&p(n,t))return s[t]=4,n[t];else s[t]=0}let u=Rr[t],d,f;if(u)return t===`$attrs`&&Ze(e.attrs,`get`,``),u(e);if((d=c.__cssModules)&&(d=d[t]))return d;if(n!==i&&p(n,t))return s[t]=4,n[t];if(f=l.config.globalProperties,p(f,t))return f[t]},set({_:e},t,n){let{data:r,setupState:i,ctx:a}=e;return zr(i,t)?(i[t]=n,!0):p(e.props,t)||t[0]===`$`&&t.slice(1)in e?!1:(a[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:r,appContext:i,props:a,type:o}},s){let c;return!!(n[s]||zr(t,s)||p(a,s)||p(r,s)||p(Rr,s)||p(i.config.globalProperties,s)||(c=o.__cssModules)&&c[s])},defineProperty(e,t,n){return n.get==null?p(n,`value`)&&this.set(e,t,n.value,null):e._.accessCache[t]=0,Reflect.defineProperty(e,t,n)}};function Vr(e){return m(e)?e.reduce((e,t)=>(e[t]=null,e),{}):e}function Hr(e,t){return!e||!t?e||t:m(e)&&m(t)?e.concat(t):u({},Vr(e),Vr(t))}function Ur(){return{app:null,config:{isNativeTag:s,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}var Wr=0;function Gr(e,t){return function(n,r=null){v(n)||(n=u({},n)),r!=null&&!x(r)&&(r=null);let i=Ur(),a=new WeakSet,o=[],s=!1,c=i.app={_uid:Wr++,_component:n,_props:r,_container:null,_context:i,_instance:null,version:ja,get config(){return i.config},set config(e){},use(e,...t){return a.has(e)||(e&&v(e.install)?(a.add(e),e.install(c,...t)):v(e)&&(a.add(e),e(c,...t))),c},mixin(e){return c},component(e,t){return t?(i.components[e]=t,c):i.components[e]},directive(e,t){return t?(i.directives[e]=t,c):i.directives[e]},mount(a,o,l){if(!s){let u=c._ceVNode||Y(n,r);return u.appContext=i,l===!0?l=`svg`:l===!1&&(l=void 0),o&&t?t(u,a):e(u,a,l),s=!0,c._container=a,a.__vue_app__=c,Ea(u.component)}},onUnmount(e){o.push(e)},unmount(){s&&(sn(o,c._instance,16),e(null,c._container),delete c._container.__vue_app__)},provide(e,t){return i.provides[e]=t,c},runWithContext(e){let t=Kr;Kr=c;try{return e()}finally{Kr=t}}};return c}}var Kr=null;function qr(e,t,n=i){let r=da(),a=j(t),o=M(t),s=Jr(e,a),c=Xt((s,c)=>{let l,u=i,d;return Ln(()=>{let t=e[a];P(l,t)&&(l=t,c())}),{get(){return s(),n.get?n.get(l):l},set(e){let s=n.set?n.set(e):e;if(!P(s,l)&&!(u!==i&&P(e,u)))return;let f=r.vnode.props,p=!!(f&&(t in f||a in f||o in f)&&(`onUpdate:${t}`in f||`onUpdate:${a}`in f||`onUpdate:${o}`in f));p||(l=e,c()),r.emit(`update:${t}`,s),P(e,u)&&(P(e,s)&&!P(s,d)||p&&u!==i&&!P(s,l))&&c(),u=e,d=s}}});return c[Symbol.iterator]=()=>{let e=0;return{next(){return e<2?{value:e++?s||i:c,done:!1}:{done:!0}}}},c}var Jr=(e,t)=>t===`modelValue`||t===`model-value`?e.modelModifiers:e[`${t}Modifiers`]||e[`${j(t)}Modifiers`]||e[`${M(t)}Modifiers`];function Yr(e,t,...n){if(e.isUnmounted)return;let r=e.vnode.props||i,a=n,o=t.startsWith(`update:`),s=o&&Jr(r,t.slice(7));s&&(s.trim&&(a=n.map(e=>y(e)?e.trim():e)),s.number&&(a=a.map(ie)));let c,l=r[c=N(t)]||r[c=N(j(t))];!l&&o&&(l=r[c=N(M(t))]),l&&sn(l,e,6,a);let u=r[c+`Once`];if(u){if(!e.emitted)e.emitted={};else if(e.emitted[c])return;e.emitted[c]=!0,sn(u,e,6,a)}}function Xr(e,t,n=!1){let r=t.emitsCache,i=r.get(e);if(i!==void 0)return i;let a=e.emits,o={};return a?(m(a)?a.forEach(e=>o[e]=null):u(o,a),x(e)&&r.set(e,o),o):(x(e)&&r.set(e,null),null)}function Zr(e,t){return!e||!c(t)?!1:(t=t.slice(2),t=t===`Once`?t:t.replace(/Once$/,``),p(e,t[0].toLowerCase()+t.slice(1))||p(e,M(t))||p(e,t))}function Qr(e){let{type:t,vnode:n,proxy:r,withProxy:i,propsOptions:[a],slots:o,attrs:s,emit:c,render:u,renderCache:d,props:f,data:p,setupState:m,ctx:h,inheritAttrs:g}=e,_=An(e),v,y;try{if(n.shapeFlag&4){let e=i||r,t=e;v=ta(u.call(t,e,d,f,m,p,h)),y=s}else{let e=t;v=ta(e.length>1?e(f,{attrs:s,slots:o,emit:c}):e(f,null)),y=t.props?s:ei(s)}}catch(t){zi.length=0,cn(t,e,1),v=Y(Li)}let b=v;if(y&&g!==!1){let e=Object.keys(y),{shapeFlag:t}=b;e.length&&t&7&&(a&&e.some(l)&&(y=ti(y,a)),b=Qi(b,y,!1,!0))}return n.dirs&&(b=Qi(b,null,!1,!0),b.dirs=b.dirs?b.dirs.concat(n.dirs):n.dirs),n.transition&&fr(Hn(b.type)&&dr(b)||b,n.transition),v=b,An(_),v}function $r(e,t=!0){let n;for(let t=0;t<e.length;t++){let r=e[t];if(Ki(r)){if(r.type!==Li||r.children===`v-if`){if(n)return;n=r}}else return}return n}var ei=e=>{let t;for(let n in e)(n===`class`||n===`style`||c(n))&&((t||={})[n]=e[n]);return t},ti=(e,t)=>{let n={};for(let r in e)l(r)&&r.slice(9)in t||(n[r]=e[r]);return n};function ni(e,t,n){let{props:r,children:i,component:a}=e,{props:o,children:s,patchFlag:c}=t,l=a.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return r?ri(r,o,l):!!o;if(c&8){let e=t.dynamicProps;for(let t=0;t<e.length;t++){let n=e[t];if(ii(o,r,n)&&!Zr(l,n))return!0}}}else return(i||s)&&(!s||!s.$stable)?!0:r===o?!1:r?!o||ri(r,o,l):!!o;return!1}function ri(e,t,n){let r=Object.keys(t);if(r.length!==Object.keys(e).length)return!0;for(let i=0;i<r.length;i++){let a=r[i];if(!p(e,a)||ii(t,e,a)&&!Zr(n,a))return!0}return!1}function ii(e,t,n){let r=e[n],i=t[n];return n===`style`&&x(r)&&x(i)?!be(r,i):r!==i}function ai({vnode:e,parent:t,suspense:n},r){for(;t;){let n=t.subTree;if(n.suspense&&n.suspense.activeBranch===e&&(n.suspense.vnode.el=n.el=r,e=n),n===e)(e=t.vnode).el=r,t=t.parent;else break}n&&n.activeBranch===e&&(n.vnode.el=r)}var oi={},si=()=>Object.create(oi),ci=e=>Object.getPrototypeOf(e)===oi;function li(e,t,n,r=!1){let i={},a=si();e.propsDefaults=Object.create(null),di(e,t,i,a);for(let t in e.propsOptions[0])t in i||(i[t]=void 0);e.props=n?r?i:Mt(i):e.type.props?i:a,e.attrs=a}function ui(e,t,n,r){let{props:i,attrs:a,vnode:{patchFlag:o}}=e,s=zt(i),[c]=e.propsOptions,l=!1;if((r||o>0)&&!(o&16)){if(o&8){let n=e.vnode.dynamicProps;for(let r=0;r<n.length;r++){let o=n[r];if(Zr(e.emitsOptions,o))continue;let u=t[o];if(c){if(p(a,o))u!==a[o]&&(a[o]=u,l=!0);else{let t=j(o);i[t]=fi(c,s,t,u,e,!1)}}else u!==a[o]&&(a[o]=u,l=!0)}}}else{di(e,t,i,a)&&(l=!0);let r;for(let a in s)t&&(p(t,a)||(r=M(a))!==a&&p(t,r))||(c?n&&(n[a]!==void 0||n[r]!==void 0)&&(i[a]=fi(c,s,a,void 0,e,!0)):delete i[a]);if(a!==s)for(let e in a)t&&p(t,e)||(delete a[e],l=!0)}l&&Qe(e.attrs,`set`,``)}function di(e,t,n,r){let[a,o]=e.propsOptions,s=!1,c;if(t)for(let i in t){if(O(i))continue;let l=t[i],u;a&&p(a,u=j(i))?!o||!o.includes(u)?n[u]=l:(c||={})[u]=l:Zr(e.emitsOptions,i)||i in r&&l===r[i]||(r[i]=l,s=!0)}if(o){let t=zt(n),r=c||i;for(let i=0;i<o.length;i++){let s=o[i];n[s]=fi(a,t,s,r[s],e,!p(r,s))}}return s}function fi(e,t,n,r,i,a){let o=e[n];if(o!=null){let e=p(o,`default`);if(e&&r===void 0){let e=o.default;if(o.type!==Function&&!o.skipFactory&&v(e)){let{propsDefaults:a}=i;if(n in a)r=a[n];else{let o=ma(i);r=a[n]=e.call(null,t),o()}}else r=e;i.ce&&i.ce._setProp(n,r)}o[0]&&(a&&!e?r=!1:o[1]&&(r===``||r===M(n))&&(r=!0))}return r}function pi(e,t,n=!1){let r=t.propsCache,o=r.get(e);if(o)return o;let s=e.props,c={},l=[];if(!s)return x(e)&&r.set(e,a),a;if(m(s))for(let e=0;e<s.length;e++){let t=j(s[e]);mi(t)&&(c[t]=i)}else if(s)for(let e in s){let t=j(e);if(mi(t)){let n=s[e],r=c[t]=m(n)||v(n)?{type:n}:u({},n),i=r.type,a=!1,o=!0;if(m(i))for(let e=0;e<i.length;++e){let t=i[e],n=v(t)&&t.name;if(n===`Boolean`){a=!0;break}n===`String`&&(o=!1)}else a=v(i)&&i.name===`Boolean`;r[0]=a,r[1]=o,(a||p(r,`default`))&&l.push(t)}}let d=[c,l];return x(e)&&r.set(e,d),d}function mi(e){return e[0]!==`$`&&!O(e)}var hi=e=>e===`_`||e===`_ctx`||e===`$stable`,gi=e=>m(e)?e.map(ta):[ta(e)],_i=(e,t,n)=>{if(t._n)return t;let r=jn((...e)=>gi(t(...e)),n);return r._c=!1,r},vi=(e,t,n)=>{let r=e._ctx;for(let n in e){if(hi(n))continue;let i=e[n];if(v(i))t[n]=_i(n,i,r);else if(i!=null){let e=gi(i);t[n]=()=>e}}},yi=(e,t)=>{let n=gi(t);e.slots.default=()=>n},bi=(e,t,n)=>{for(let r in t)(n||!hi(r))&&(e[r]=t[r])},xi=(e,t,n)=>{let r=e.slots=si();if(e.vnode.shapeFlag&32){let e=t._;e?(bi(r,t,n),n&&re(r,`_`,e,!0)):vi(t,r)}else t&&yi(e,t)},Si=(e,t,n)=>{let{vnode:r,slots:a}=e,o=!0,s=i;if(r.shapeFlag&32){let e=t._;e?n&&e===1?o=!1:bi(a,t,n):(o=!t.$stable,vi(t,a)),s=t}else t&&(yi(e,t),s={default:1});if(o)for(let e in a)!hi(e)&&s[e]==null&&delete a[e]},Ci=Fi;function wi(e){return Ti(e)}function Ti(e,t){let n=se();n.__VUE__=!0;let{insert:r,remove:s,patchProp:c,createElement:l,createText:u,createComment:d,setText:f,setElementText:p,parentNode:m,nextSibling:h,setScopeId:g=o,insertStaticContent:_}=e,v=(e,t,n,r=null,i=null,o=null,s=void 0,c=null,l=!!t.dynamicChildren)=>{if(e===t)return;e&&!qi(e,t)&&(r=me(e),le(e,i,o,!0),e=null),t.patchFlag===-2&&(l=!1,t.dynamicChildren=null),t.dynamicChildren&&e&&e.dynamicChildren&&e.dynamicChildren.hasOnce&&(t.dynamicChildren===a&&(t.dynamicChildren=[]),t.dynamicChildren.hasOnce=!0);let{type:u,ref:d,shapeFlag:f}=t;switch(u){case Ii:y(e,t,n,r);break;case Li:b(e,t,n,r);break;case Ri:e??x(t,n,r,s);break;case G:ee(e,t,n,r,i,o,s,c,l);break;default:f&1?w(e,t,n,r,i,o,s,c,l):f&6?M(e,t,n,r,i,o,s,c,l):(f&64||f&128)&&u.process(e,t,n,r,i,o,s,c,l,ge)}d!=null&&i?br(d,e&&e.ref,o,t||e,!t):d==null&&e&&e.ref!=null&&br(e.ref,null,o,e,!0)},y=(e,t,n,i)=>{if(e==null)r(t.el=u(t.children),n,i);else{let n=t.el=e.el;t.children!==e.children&&f(n,t.children)}},b=(e,t,n,i)=>{e==null?r(t.el=d(t.children||``),n,i):t.el=e.el},x=(e,t,n,r)=>{[e.el,e.anchor]=_(e.children,t,n,r,e.el,e.anchor)},S=({el:e,anchor:t},n,i)=>{let a;for(;e&&e!==t;)a=h(e),r(e,n,i),e=a;r(t,n,i)},C=({el:e,anchor:t})=>{let n;for(;e&&e!==t;)n=h(e),s(e),e=n;s(t)},w=(e,t,n,r,i,a,o,s,c)=>{if(t.type===`svg`?o=`svg`:t.type===`math`&&(o=`mathml`),e==null)T(t,n,r,i,a,o,s,c);else{let n=e.el&&e.el._isVueCE?e.el:null;try{n&&n._beginPatch(),k(e,t,i,a,o,s,c)}finally{n&&n._endPatch()}}},T=(e,t,n,i,a,o,s,u)=>{let d,f,{props:m,shapeFlag:h,transition:g,dirs:_}=e;if(d=e.el=l(e.type,o,m&&m.is,m),h&8?p(d,e.children):h&16&&D(e.children,d,null,i,a,Ei(e,o),s,u),_&&Nn(e,null,i,`created`),E(d,e,e.scopeId,s,i),m){for(let e in m)e!==`value`&&!O(e)&&c(d,e,null,m[e],o,i);`value`in m&&c(d,`value`,null,m.value,o),(f=m.onVnodeBeforeMount)&&aa(f,i,e)}_&&Nn(e,null,i,`beforeMount`);let v=Oi(a,g);v&&g.beforeEnter(d),r(d,t,n),((f=m&&m.onVnodeMounted)||v||_)&&Ci(()=>{try{f&&aa(f,i,e),v&&g.enter(d),_&&Nn(e,null,i,`mounted`)}finally{}},a)},E=(e,t,n,r,i)=>{if(n&&g(e,n),r)for(let t=0;t<r.length;t++)g(e,r[t]);if(i){let n=i.subTree;if(t===n||Pi(n.type)&&(n.ssContent===t||n.ssFallback===t)){let t=i.vnode;E(e,t,t.scopeId,t.slotScopeIds,i.parent)}}},D=(e,t,n,r,i,a,o,s,c=0)=>{for(let l=c;l<e.length;l++){let c=e[l]=s?na(e[l]):ta(e[l]);v(null,c,t,n,r,i,a,o,s)}},k=(e,t,n,r,a,o,s)=>{let l=t.el=e.el,{patchFlag:u,dynamicChildren:d,dirs:f}=t;u|=e.patchFlag&16;let m=e.props||i,h=t.props||i,g;if(n&&Di(n,!1),(g=h.onVnodeBeforeUpdate)&&aa(g,n,t,e),f&&Nn(t,e,n,`beforeUpdate`),n&&Di(n,!0),d&&(!e.dynamicChildren||e.dynamicChildren.length!==d.length)&&(u=0,s=!1,d=null),(m.innerHTML&&h.innerHTML==null||m.textContent&&h.textContent==null)&&p(l,``),d?A(e.dynamicChildren,d,l,n,r,Ei(t,a),o):s||ie(e,t,l,null,n,r,Ei(t,a),o,!1),u>0){if(u&16)j(l,m,h,n,a);else if(u&2&&m.class!==h.class&&c(l,`class`,null,h.class,a),u&4&&c(l,`style`,m.style,h.style,a),u&8){let e=t.dynamicProps;for(let t=0;t<e.length;t++){let r=e[t],i=m[r],o=h[r];(o!==i||r===`value`)&&c(l,r,i,o,a,n)}}u&1&&e.children!==t.children&&p(l,t.children)}else!s&&d==null&&j(l,m,h,n,a);((g=h.onVnodeUpdated)||f)&&Ci(()=>{g&&aa(g,n,t,e),f&&Nn(t,e,n,`updated`)},r)},A=(e,t,n,r,i,a,o)=>{for(let s=0;s<t.length;s++){let c=e[s],l=t[s],u=c.el||Ni(c),d=u&&(c.type===G||!qi(c,l)||c.shapeFlag&198)?m(u):n;v(c,l,d,null,r,i,a,o,!0)}},j=(e,t,n,r,a)=>{if(t!==n){if(t!==i)for(let i in t)!O(i)&&!(i in n)&&c(e,i,t[i],null,a,r);for(let i in n){if(O(i))continue;let o=n[i],s=t[i];o!==s&&i!==`value`&&c(e,i,s,o,a,r)}`value`in n&&c(e,`value`,t.value,n.value,a)}},ee=(e,t,n,i,a,o,s,c,l)=>{let d=t.el=e?e.el:u(``),f=t.anchor=e?e.anchor:u(``),{patchFlag:p,dynamicChildren:m,slotScopeIds:h}=t;h&&(c=c?c.concat(h):h),e==null?(r(d,n,i),r(f,n,i),D(t.children||[],n,f,a,o,s,c,l)):p>0&&p&64&&m&&e.dynamicChildren&&e.dynamicChildren.length===m.length?(A(e.dynamicChildren,m,n,a,o,s,c),(t.key!=null||a&&t===a.subTree)&&ki(e,t,!0)):ie(e,t,n,f,a,o,s,c,l)},M=(e,t,n,r,i,a,o,s,c)=>{t.slotScopeIds=s,e==null?t.shapeFlag&512?i.ctx.activate(t,n,r,o,c):te(t,n,r,i,a,o,c):N(e,t,c)},te=(e,t,n,r,i,a,o)=>{let s=e.component=la(e,r,i);if(Cr(e)&&(s.ctx.renderer=ge),va(s,!1,o),s.asyncDep){if(i&&i.registerDep(s,P,o,a),!e.el){let r=s.subTree=Y(Li);b(null,r,t,n),e.placeholder=r.el}}else P(s,e,t,n,i,a,o)},N=(e,t,n)=>{let r=t.component=e.component;if(ni(e,t,n)){if(r.asyncDep&&!r.asyncResolved){t.el=e.el,t.placeholder=e.placeholder,re(r,t,n);return}r.next=t,r.update()}else t.el=e.el,t.placeholder=e.placeholder,r.vnode=t},P=(e,t,n,r,i,a,o)=>{let s=()=>{if(e.isMounted){let{next:t,bu:n,u:r,parent:s,vnode:c}=e;{let n=ji(e);if(n){t&&(t.el=c.el,re(e,t,o)),n.asyncDep.then(()=>{Ci(()=>{e.isUnmounted||l()},i)});return}}let u=t,d;Di(e,!1),t?(t.el=c.el,re(e,t,o)):t=c,n&&ne(n),(d=t.props&&t.props.onVnodeBeforeUpdate)&&aa(d,s,t,c),Di(e,!0);let f=Qr(e),p=e.subTree;e.subTree=f,v(p,f,m(p.el),me(p),e,i,a),t.el=f.el,u===null&&ai(e,f.el),r&&Ci(r,i),(d=t.props&&t.props.onVnodeUpdated)&&Ci(()=>aa(d,s,t,c),i)}else{let o,{el:s,props:c}=t,{bm:l,m:u,parent:d,root:f,type:p}=e,m=Sr(t);if(Di(e,!1),l&&ne(l),!m&&(o=c&&c.onVnodeBeforeMount)&&aa(o,d,t),Di(e,!0),s&&ve){let t=()=>{e.subTree=Qr(e),ve(s,e.subTree,e,i,null)};m&&p.__asyncHydrate?p.__asyncHydrate(s,e,t):t()}else{f.ce&&f.ce._hasShadowRoot()&&f.ce._injectChildStyle(p,e.parent?e.parent.type:void 0);let o=e.subTree=Qr(e);v(null,o,n,r,e,i,a),t.el=o.el}if(u&&Ci(u,i),!m&&(o=c&&c.onVnodeMounted)){let e=t;Ci(()=>aa(o,d,e),i)}(t.shapeFlag&256||d&&Sr(d.vnode)&&d.vnode.shapeFlag&256)&&e.a&&Ci(e.a,i),e.isMounted=!0,t=n=r=null}};e.scope.on();let c=e.effect=new B(s);e.scope.off();let l=e.update=c.run.bind(c),u=e.job=c.runIfDirty.bind(c);u.i=e,u.id=e.uid,c.scheduler=()=>yn(u),Di(e,!0),l()},re=(e,t,n)=>{t.component=e;let r=e.vnode.props;e.vnode=t,e.next=null,ui(e,t.props,r,n),Si(e,t.children,n),Be(),Sn(e),Ve()},ie=(e,t,n,r,i,a,o,s,c=!1)=>{let l=e&&e.children,u=e?e.shapeFlag:0,d=t.children,{patchFlag:f,shapeFlag:m}=t;if(f>0){if(f&128){oe(l,d,n,r,i,a,o,s,c);return}if(f&256){ae(l,d,n,r,i,a,o,s,c);return}}m&8?(u&16&&pe(l,i,a),d!==l&&p(n,d)):u&16?m&16?oe(l,d,n,r,i,a,o,s,c):pe(l,i,a,!0):(u&8&&p(n,``),m&16&&D(d,n,r,i,a,o,s,c))},ae=(e,t,n,r,i,o,s,c,l)=>{e||=a,t||=a;let u=e.length,d=t.length,f=Math.min(u,d),p=0;for(;p<f;p++){let r=t[p]=l?na(t[p]):ta(t[p]);v(e[p],r,n,null,i,o,s,c,l)}u>d?pe(e,i,o,!0,!1,f):D(t,n,r,i,o,s,c,l,f)},oe=(e,t,n,r,i,o,s,c,l)=>{let u=0,d=t.length,f=e.length-1,p=d-1;for(;u<=f&&u<=p;){let r=e[u],a=t[u]=l?na(t[u]):ta(t[u]);if(qi(r,a))v(r,a,n,null,i,o,s,c,l);else break;u++}for(;u<=f&&u<=p;){let r=e[f],a=t[p]=l?na(t[p]):ta(t[p]);if(qi(r,a))v(r,a,n,null,i,o,s,c,l);else break;f--,p--}if(u>f){if(u<=p){let e=p+1,a=e<d?t[e].el:r;for(;u<=p;)v(null,t[u]=l?na(t[u]):ta(t[u]),n,a,i,o,s,c,l),u++}}else if(u>p)for(;u<=f;)le(e[u],i,o,!0),u++;else{let m=u,h=u,g=new Map;for(u=h;u<=p;u++){let e=t[u]=l?na(t[u]):ta(t[u]);e.key!=null&&g.set(e.key,u)}let _,y=0,b=p-h+1,x=!1,S=0,C=Array(b);for(u=0;u<b;u++)C[u]=0;for(u=m;u<=f;u++){let r=e[u];if(y>=b){le(r,i,o,!0);continue}let a;if(r.key!=null)a=g.get(r.key);else for(_=h;_<=p;_++)if(C[_-h]===0&&qi(r,t[_])){a=_;break}a===void 0?le(r,i,o,!0):(C[a-h]=u+1,a>=S?S=a:x=!0,v(r,t[a],n,null,i,o,s,c,l),y++)}let w=x?Ai(C):a;for(_=w.length-1,u=b-1;u>=0;u--){let e=h+u,a=t[e],f=t[e+1],p=e+1<d?f.el||Ni(f):r;C[u]===0?v(null,a,n,p,i,o,s,c,l):x&&(_<0||u!==w[_]?ce(a,n,p,2):_--)}}},ce=(e,t,n,i,a=null)=>{let{el:o,type:c,transition:l,children:u,shapeFlag:d}=e;if(d&6)ce(e.component.subTree,t,n,i);else if(d&128)e.suspense.move(t,n,i);else if(d&64)c.move(e,t,n,ge);else if(c===G){r(o,t,n);for(let e=0;e<u.length;e++)ce(u[e],t,n,i);r(e.anchor,t,n)}else if(c===Ri)S(e,t,n);else if(i!==2&&d&1&&l){if(i===0)l.persisted&&!o[er]?r(o,t,n):(l.beforeEnter(o),r(o,t,n),Ci(()=>l.enter(o),a));else{let{leave:i,delayLeave:a,afterLeave:c}=l,u=()=>{e.ctx.isUnmounted?s(o):r(o,t,n)},d=()=>{let e=o._isLeaving||!!o[er];o._isLeaving&&o[er](!0),l.persisted&&!e?u():i(o,()=>{u(),c&&c()})};a?a(o,u,d):d()}}else r(o,t,n)},le=(e,t,n,r=!1,i=!1)=>{let{type:a,props:o,ref:s,children:c,dynamicChildren:l,shapeFlag:u,patchFlag:d,dirs:f,cacheIndex:p,memo:m}=e;if((d===-2||l&&l.hasOnce)&&(i=!1),s!=null&&(Be(),br(s,null,n,e,!0),Ve()),p==null||e.ctx&&e.ctx!==t||(t.renderCache[p]=void 0),u&256){t.ctx.deactivate(e);return}let h=u&1&&f,g=!Sr(e),_;if(g&&(_=o&&o.onVnodeBeforeUnmount)&&aa(_,t,e),u&6)fe(e.component,n,r);else{if(u&128){e.suspense.unmount(n,r);return}h&&Nn(e,null,t,`beforeUnmount`),u&64?e.type.remove(e,t,n,ge,r):l&&!l.hasOnce&&(a!==G||d>0&&d&64)?pe(l,t,n,!1,!0):(a===G&&d&384||!i&&u&16)&&pe(c,t,n),r&&ue(e)}let v=m!=null&&p==null;(g&&(_=o&&o.onVnodeUnmounted)||h||v)&&Ci(()=>{_&&aa(_,t,e),h&&Nn(e,null,t,`unmounted`),v&&(e.el=null)},n)},ue=e=>{let{type:t,el:n,anchor:r,transition:i}=e,a=t===G;if(a&&!i){de(n,r);return}if(t===Ri){C(e),i&&!i.persisted&&i.afterLeave&&i.afterLeave();return}let o=a?mr(e):e,c=()=>{a?m(n)&&de(n,r):s(n),i&&!i.persisted&&i.afterLeave&&i.afterLeave()};if(o&&o.shapeFlag&1&&i&&!i.persisted){let{leave:e,delayLeave:t}=i,n=o.el,r=()=>e(n,c);t?t(n,c,r):r()}else c()},de=(e,t)=>{let n;for(;e!==t;)n=h(e),s(e),e=n;s(t)},fe=(e,t,n)=>{let{bum:r,scope:i,job:a,subTree:o,um:s,m:c,a:l}=e;Mi(c),Mi(l),r&&ne(r),i.stop(),a?(a.flags|=8,le(o,e,t,n)):e.vnode.el&&o&&(o.transition=e.vnode.transition,le(o,e,t,n)),s&&Ci(s,t),Ci(()=>{e.isUnmounted=!0},t)},pe=(e,t,n,r=!1,i=!1,a=0)=>{for(let o=a;o<e.length;o++)le(e[o],t,n,r,i)},me=e=>{if(e.shapeFlag&6)return me(e.component.subTree);if(e.shapeFlag&128)return e.suspense.next();let t=h(e.anchor||e.el),n=t&&t[Vn];return n?h(n):t},he=(e,t,n)=>{Tn(()=>{e==null?t._vnode&&le(t._vnode,null,null,!0):v(t._vnode||null,e,t,null,null,null,n),t._vnode=e},e&&t._vnode?void 0:e&&e.component?e.component.uid:ca())},ge={p:v,um:le,m:ce,r:ue,mt:te,mc:D,pc:ie,pbc:A,n:me,o:e},_e,ve;return t&&([_e,ve]=t(ge)),{render:he,hydrate:_e,createApp:Gr(he,_e)}}function Ei({type:e,props:t},n){return n===`svg`&&e===`foreignObject`||n===`mathml`&&e===`annotation-xml`&&t&&t.encoding&&t.encoding.includes(`html`)?void 0:n}function Di({effect:e,job:t},n){n?(e.flags|=32,t.flags|=4):(e.flags&=-33,t.flags&=-5)}function Oi(e,t){return(!e||e&&!e.pendingBranch)&&t&&!t.persisted}function ki(e,t,n=!1){let r=e.children,i=t.children;if(m(r)&&m(i))for(let e=0;e<r.length;e++){let t=r[e],a=i[e];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=i[e]=na(i[e]),a.el=t.el),!n&&a.patchFlag!==-2&&ki(t,a)),a.type===Ii&&(a.patchFlag===-1&&(a=i[e]=na(a)),a.el=t.el),a.type===Li&&!a.el&&(a.el=t.el)}}function Ai(e){let t=e.slice(),n=[0],r,i,a,o,s,c=e.length;for(r=0;r<c;r++){let c=e[r];if(c!==0){if(i=n[n.length-1],e[i]<c){t[r]=i,n.push(r);continue}for(a=0,o=n.length-1;a<o;)s=a+o>>1,e[n[s]]<c?a=s+1:o=s;c<e[n[a]]&&(a>0&&(t[r]=n[a-1]),n[a]=r)}}for(a=n.length,o=n[a-1];a-->0;)n[a]=o,o=t[o];return n}function ji(e){let t=e.subTree.component;if(t)return t.asyncDep&&!t.asyncResolved?t:ji(t)}function Mi(e){if(e)for(let t=0;t<e.length;t++)e[t].flags|=8}function Ni(e){if(e.placeholder)return e.placeholder;let t=e.component;return t?Ni(t.subTree):null}var Pi=e=>e.__isSuspense;function Fi(e,t){t&&t.pendingBranch?m(e)?t.effects.push(...e):t.effects.push(e):xn(e)}var G=Symbol.for(`v-fgt`),Ii=Symbol.for(`v-txt`),Li=Symbol.for(`v-cmt`),Ri=Symbol.for(`v-stc`),zi=[],Bi=null;function K(e=!1){zi.push(Bi=e?null:[])}function Vi(){zi.pop(),Bi=zi[zi.length-1]||null}var Hi=1;function Ui(e,t=!1){Hi+=e,e<0&&Bi&&t&&(Bi.hasOnce=!0)}function Wi(e){return e.dynamicChildren=Hi>0?Bi||a:null,Vi(),Hi>0&&Bi&&Bi.push(e),e}function q(e,t,n,r,i,a){return Wi(J(e,t,n,r,i,a,!0))}function Gi(e,t,n,r,i){return Wi(Y(e,t,n,r,i,!0))}function Ki(e){return e?e.__v_isVNode===!0:!1}function qi(e,t){return e.type===t.type&&e.key===t.key}var Ji=({key:e})=>e??null,Yi=({ref:e,ref_key:t,ref_for:n})=>(typeof e==`number`&&(e=``+e),e==null?null:y(e)||Ut(e)||v(e)?{i:On,r:e,k:t,f:!!n}:e);function J(e,t=null,n=null,r=0,i=null,a=e===G?0:1,o=!1,s=!1){let c={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&Ji(t),ref:t&&Yi(t),scopeId:kn,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:a,patchFlag:r,dynamicProps:i,dynamicChildren:null,appContext:null,ctx:On};return s?(ra(c,n),a&128&&e.normalize(c)):n&&(c.shapeFlag|=y(n)?8:16),Hi>0&&!o&&Bi&&(c.patchFlag>0||a&6)&&c.patchFlag!==32&&Bi.push(c),c}var Y=Xi;function Xi(e,t=null,n=null,r=0,i=null,a=!1){if(e&&e!==Ar||(e=Li),Ki(e)){let r=Qi(e,t,!0);return n&&ra(r,n),Hi>0&&!a&&Bi&&(r.shapeFlag&6?Bi[Bi.indexOf(e)]=r:Bi.push(r)),r.patchFlag=-2,r}if(Oa(e)&&(e=e.__vccOpts),t){t=Zi(t);let{class:e,style:n}=t;e&&!y(e)&&(t.class=pe(e)),x(n)&&(Rt(n)&&!m(n)&&(n=u({},n)),t.style=ce(n))}let o=y(e)?1:Pi(e)?128:Hn(e)?64:x(e)?4:v(e)?2:0;return J(e,t,n,r,i,o,a,!0)}function Zi(e){return e?Rt(e)||ci(e)?u({},e):e:null}function Qi(e,t,n=!1,r=!1){let{props:i,ref:a,patchFlag:o,children:s,transition:c}=e,l=t?ia(i||{},t):i,u={__v_isVNode:!0,__v_skip:!0,type:e.type,props:l,key:l&&Ji(l),ref:t&&t.ref?n&&a?m(a)?a.concat(Yi(t)):[a,Yi(t)]:Yi(t):a,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:s,target:e.target,targetStart:e.targetStart,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==G?o===-1?16:o|16:o,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:c,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&Qi(e.ssContent),ssFallback:e.ssFallback&&Qi(e.ssFallback),placeholder:e.placeholder,el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce,cacheIndex:e.cacheIndex};return c&&r&&fr(u,c.clone(u)),u}function X(e=` `,t=0){return Y(Ii,null,e,t)}function $i(e,t){let n=Y(Ri,null,e);return n.staticCount=t,n}function ea(e=``,t=!1){return t?(K(),Gi(Li,null,e)):Y(Li,null,e)}function ta(e){return e==null||typeof e==`boolean`?Y(Li):m(e)?Y(G,null,e.slice()):Ki(e)?na(e):Y(Ii,null,String(e))}function na(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:Qi(e)}function ra(e,t){let n=0,{shapeFlag:r}=e;if(t==null)t=null;else if(m(t))n=16;else if(typeof t==`object`){if(r&65){let n=t.default;n&&(n._c&&(n._d=!1),ra(e,n()),n._c&&(n._d=!0));return}{n=32;let r=t._;!r&&!ci(t)?t._ctx=On:r===3&&On&&(On.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}}else if(v(t)){if(r&65){ra(e,{default:t});return}t={default:t,_ctx:On},n=32}else t=String(t),r&64?(n=16,t=[X(t)]):n=8;e.children=t,e.shapeFlag|=n}function ia(...e){let t={};for(let n=0;n<e.length;n++){let r=e[n];for(let e in r)if(e===`class`)t.class!==r.class&&(t.class=pe([t.class,r.class]));else if(e===`style`)t.style=ce([t.style,r.style]);else if(c(e)){let n=t[e],i=r[e];i&&n!==i&&!(m(n)&&n.includes(i))?t[e]=n?[].concat(n,i):i:i==null&&n==null&&!l(e)&&(t[e]=i)}else e!==``&&(t[e]=r[e])}return t}function aa(e,t,n,r=null){sn(e,t,7,[n,r])}var oa=Ur(),sa=0;function ca(){return sa}function la(e,t,n){let r=e.type,a=(t?t.appContext:e.appContext)||oa,o={uid:sa++,vnode:e,type:r,parent:t,appContext:a,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new we(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(a.provides),ids:t?t.ids:[``,0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:pi(r,a),emitsOptions:Xr(r,a),emit:null,emitted:null,propsDefaults:i,inheritAttrs:r.inheritAttrs,ctx:i,data:i,props:i,attrs:i,slots:i,refs:i,setupState:i,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return o.ctx={_:o},o.root=t?t.root:o,o.emit=Yr.bind(null,o),e.ce&&e.ce(o),o}var ua=null,da=()=>ua||On,fa,pa;{let e=se(),t=(t,n)=>{let r;return(r=e[t])||(r=e[t]=[]),r.push(n),e=>{r.length>1?r.forEach(t=>t(e)):r[0](e)}};fa=t(`__VUE_INSTANCE_SETTERS__`,e=>ua=e),pa=t(`__VUE_SSR_SETTERS__`,e=>_a=e)}var ma=e=>{let t=ua;return fa(e),e.scope.on(),()=>{e.scope.off(),fa(t)}},ha=()=>{ua&&ua.scope.off(),fa(null)};function ga(e){return e.vnode.shapeFlag&4}var _a=!1;function va(e,t=!1,n=!1){t&&pa(t);let{props:r,children:i}=e.vnode,a=ga(e);li(e,r,a,t),xi(e,i,n||t);let o=a?ya(e,t):void 0;return t&&pa(!1),o}function ya(e,t){let n=e.type;e.accessCache=Object.create(null),e.proxy=new Proxy(e.ctx,Br);let{setup:r}=n;if(r){Be();let n=e.setupContext=r.length>1?Ta(e):null,i=ma(e),a=on(r,e,0,[e.props,n]),o=S(a);if(Ve(),i(),(o||e.sp)&&!Sr(e)&&_r(e),o){if(a.then(ha,ha),t)return a.then(n=>{pa(!0);try{ba(e,n,t)}finally{pa(!1)}}).catch(t=>{cn(t,e,0)});e.asyncDep=a}else ba(e,a,t)}else Ca(e,t)}function ba(e,t,n){v(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:x(t)&&(e.setupState=Jt(t)),Ca(e,n)}var xa,Sa;function Ca(e,t,n){let r=e.type;if(!e.render){if(!t&&xa&&!r.render){let t=r.template||!1;if(t){let{isCustomElement:n,compilerOptions:i}=e.appContext.config,{delimiters:a,compilerOptions:o}=r;r.render=xa(t,u(u({isCustomElement:n,delimiters:a},i),o))}}e.render=r.render||o,Sa&&Sa(e)}}var wa={get(e,t){return Ze(e,`get`,``),e[t]}};function Ta(e){return{attrs:new Proxy(e.attrs,wa),slots:e.slots,emit:e.emit,expose:t=>{e.exposed=t||{}}}}function Ea(e){return e.exposed?e.exposeProxy||=new Proxy(Jt(Bt(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in Rr)return Rr[n](e)},has(e,t){return t in e||t in Rr}}):e.proxy}function Da(e,t=!0){return v(e)?e.displayName||e.name:e.name||t&&e.__name}function Oa(e){return v(e)&&`__vccOpts`in e}var ka=(e,t)=>Qt(e,t,_a);function Aa(e,t,n){try{Ui(-1);let r=arguments.length;return r===2?x(t)&&!m(t)?Ki(t)?Y(e,null,[t]):Y(e,t):Y(e,null,t):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Ki(n)&&(n=[n]),Y(e,t,n))}finally{Ui(1)}}var ja=`3.5.44`,Ma=void 0,Na=typeof window<`u`&&window.trustedTypes;if(Na)try{Ma=Na.createPolicy(`vue`,{createHTML:e=>e})}catch{}var Pa=Ma?e=>Ma.createHTML(e):e=>e,Fa=`http://www.w3.org/2000/svg`,Ia=`http://www.w3.org/1998/Math/MathML`,La=typeof document<`u`?document:null,Ra=La&&La.createElement(`template`),za={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{let t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,r)=>{let i=t===`svg`?La.createElementNS(Fa,e):t===`mathml`?La.createElementNS(Ia,e):n?La.createElement(e,{is:n}):La.createElement(e);return e===`select`&&r&&r.multiple!=null&&i.setAttribute(`multiple`,r.multiple),i},createText:e=>La.createTextNode(e),createComment:e=>La.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>La.querySelector(e),setScopeId(e,t){e.setAttribute(t,``)},insertStaticContent(e,t,n,r,i,a){let o=n?n.previousSibling:t.lastChild;if(i&&(i===a||i.nextSibling))for(;t.insertBefore(i.cloneNode(!0),n),i!==a&&(i=i.nextSibling););else{Ra.innerHTML=Pa(r===`svg`?`<svg>${e}</svg>`:r===`mathml`?`<math>${e}</math>`:e);let i=Ra.content;if(r===`svg`||r===`mathml`){let e=i.firstChild;for(;e.firstChild;)i.appendChild(e.firstChild);i.removeChild(e)}t.insertBefore(i,n)}return[o?o.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}},Ba=`transition`,Va=`animation`,Ha=Symbol(`_vtc`),Ua={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},Wa=u({},ir,Ua),Ga=(e=>(e.displayName=`Transition`,e.props=Wa,e))((e,{slots:t})=>Aa(sr,Ja(e),t)),Ka=(e,t=[])=>{m(e)?e.forEach(e=>e(...t)):e&&e(...t)},qa=e=>e?m(e)?e.some(e=>e.length>1):e.length>1:!1;function Ja(e){let t={};for(let n in e)n in Ua||(t[n]=e[n]);if(e.css===!1)return t;let{name:n=`v`,type:r,duration:i,enterFromClass:a=`${n}-enter-from`,enterActiveClass:o=`${n}-enter-active`,enterToClass:s=`${n}-enter-to`,appearFromClass:c=a,appearActiveClass:l=o,appearToClass:d=s,leaveFromClass:f=`${n}-leave-from`,leaveActiveClass:p=`${n}-leave-active`,leaveToClass:m=`${n}-leave-to`}=e,h=Ya(i),g=h&&h[0],_=h&&h[1],{onBeforeEnter:v,onEnter:y,onEnterCancelled:b,onLeave:x,onLeaveCancelled:S,onBeforeAppear:C=v,onAppear:w=y,onAppearCancelled:T=b}=t,E=(e,t,n,r)=>{e._enterCancelled=r,Qa(e,t?d:s),Qa(e,t?l:o),n&&n()},D=(e,t)=>{e._isLeaving=!1,Qa(e,f),Qa(e,m),Qa(e,p),t&&t()},O=e=>(t,n)=>{let i=e?w:y,o=()=>E(t,e,n);Ka(i,[t,o]),$a(()=>{Qa(t,e?c:a),Za(t,e?d:s),qa(i)||to(t,r,g,o)})};return u(t,{onBeforeEnter(e){Ka(v,[e]),Za(e,a),Za(e,o)},onBeforeAppear(e){Ka(C,[e]),Za(e,c),Za(e,l)},onEnter:O(!1),onAppear:O(!0),onLeave(e,t){e._isLeaving=!0;let n=()=>D(e,t);Za(e,f),e._enterCancelled?(Za(e,p),ao(e)):(ao(e),Za(e,p)),$a(()=>{e._isLeaving&&(Qa(e,f),Za(e,m),qa(x)||to(e,r,_,n))}),Ka(x,[e,n])},onEnterCancelled(e){E(e,!1,void 0,!0),Ka(b,[e])},onAppearCancelled(e){E(e,!0,void 0,!0),Ka(T,[e])},onLeaveCancelled(e){D(e),Ka(S,[e])}})}function Ya(e){if(e==null)return null;if(x(e))return[Xa(e.enter),Xa(e.leave)];{let t=Xa(e);return[t,t]}}function Xa(e){return ae(e)}function Za(e,t){t.split(/\s+/).forEach(t=>t&&e.classList.add(t)),(e[Ha]||(e[Ha]=new Set)).add(t)}function Qa(e,t){t.split(/\s+/).forEach(t=>t&&e.classList.remove(t));let n=e[Ha];n&&(n.delete(t),n.size||(e[Ha]=void 0))}function $a(e){requestAnimationFrame(()=>{requestAnimationFrame(e)})}var eo=0;function to(e,t,n,r){let i=e._endId=++eo,a=()=>{i===e._endId&&r()};if(n!=null)return setTimeout(a,n);let{type:o,timeout:s,propCount:c}=no(e,t);if(!o)return r();let l=o+`end`,u=0,d=()=>{e.removeEventListener(l,f),a()},f=t=>{t.target===e&&++u>=c&&d()};setTimeout(()=>{u<c&&d()},s+1),e.addEventListener(l,f)}function no(e,t){let n=window.getComputedStyle(e),r=e=>(n[e]||``).split(`, `),i=r(`${Ba}Delay`),a=r(`${Ba}Duration`),o=ro(i,a),s=r(`${Va}Delay`),c=r(`${Va}Duration`),l=ro(s,c),u=null,d=0,f=0;t===Ba?o>0&&(u=Ba,d=o,f=a.length):t===Va?l>0&&(u=Va,d=l,f=c.length):(d=Math.max(o,l),u=d>0?o>l?Ba:Va:null,f=u?u===Ba?a.length:c.length:0);let p=u===Ba&&/\b(?:transform|all)(?:,|$)/.test(r(`${Ba}Property`).toString());return{type:u,timeout:d,propCount:f,hasTransform:p}}function ro(e,t){for(;e.length<t.length;)e=e.concat(e);return Math.max(...t.map((t,n)=>io(t)+io(e[n])))}function io(e){return e===`auto`?0:Number(e.slice(0,-1).replace(`,`,`.`))*1e3}function ao(e){return(e?e.ownerDocument:document).body.offsetHeight}function oo(e,t,n){let r=e[Ha];r&&(t=(t?[t,...r]:[...r]).join(` `)),t==null?e.removeAttribute(`class`):n?e.setAttribute(`class`,t):e.className=t}var so=Symbol(`_vod`),co=Symbol(`_vsh`),lo=Symbol(``),uo=/(?:^|;)\s*display\s*:/;function fo(e,t,n){let r=e.style,i=y(n),a=!1;if(n&&!i){if(t){if(y(t))for(let e of t.split(`;`)){let t=e.slice(0,e.indexOf(`:`)).trim();n[t]??mo(r,t,``)}else for(let e in t)n[e]??mo(r,e,``)}for(let i in n){i===`display`&&(a=!0);let o=n[i];o==null?mo(r,i,``):vo(e,i,!y(t)&&t?t[i]:void 0,o)||mo(r,i,o)}}else if(i){if(t!==n){let e=r[lo];e&&(n+=`;`+e),r.cssText=n,a=uo.test(n)}}else t&&e.removeAttribute(`style`);so in e&&(i&&t===n||(e[so]=a?r.display:``),e[co]&&(r.display=`none`))}var po=/\s*!important$/;function mo(e,t,n){if(m(n))n.forEach(n=>mo(e,t,n));else if(n??=``,t.startsWith(`--`))po.test(n)?e.setProperty(t,n.replace(po,``),`important`):e.setProperty(t,n);else{let r=_o(e,t);po.test(n)?e.setProperty(M(r),n.replace(po,``),`important`):e[r]=n}}var ho=[`Webkit`,`Moz`,`ms`],go={};function _o(e,t){let n=go[t];if(n)return n;let r=j(t);if(r!==`filter`&&r in e)return go[t]=r;r=te(r);for(let n=0;n<ho.length;n++){let i=ho[n]+r;if(i in e)return go[t]=i}return t}function vo(e,t,n,r){return e.tagName===`TEXTAREA`&&(t===`width`||t===`height`)&&y(r)&&n===r}var yo=`http://www.w3.org/1999/xlink`;function bo(e,t,n,r,i,a=me(t)){r&&t.startsWith(`xlink:`)?n==null?e.removeAttributeNS(yo,t.slice(6,t.length)):e.setAttributeNS(yo,t,n):n==null||a&&!he(n)?e.removeAttribute(t):e.setAttribute(t,a?``:b(n)?String(n):n)}function xo(e,t,n,r,i){if(t===`innerHTML`||t===`textContent`){n!=null&&(e[t]=t===`innerHTML`?Pa(n):n);return}let a=e.tagName;if(t===`value`&&a!==`PROGRESS`&&!a.includes(`-`)){let r=a===`OPTION`?e.getAttribute(`value`)||``:e.value,i=n==null?e.type===`checkbox`?`on`:``:String(n);r===i&&`_value`in e||(e.value=i),n??e.removeAttribute(t),e._value=n;return}let o=!1;if(n===``||n==null){let r=typeof e[t];r===`boolean`?n=he(n):n==null&&r===`string`?(n=``,o=!0):r===`number`&&(n=0,o=!0)}try{e[t]=n}catch{}o&&e.removeAttribute(i||t)}function So(e,t,n,r){e.addEventListener(t,n,r)}function Co(e,t,n,r){e.removeEventListener(t,n,r)}var wo=Symbol(`_vei`);function To(e,t,n,r,i=null){let a=e[wo]||(e[wo]={}),o=a[t];if(r&&o)o.value=r;else{let[n,s]=Oo(t);r?So(e,n,a[t]=Mo(r,i),s):o&&(Co(e,n,o,s),a[t]=void 0)}}var Eo=/(Once|Passive|Capture)$/,Do=/^on:?(?:Once|Passive|Capture)$/;function Oo(e){let t,n;for(;(n=e.match(Eo))&&!Do.test(e);)t||={},e=e.slice(0,e.length-n[1].length),t[n[1].toLowerCase()]=!0;return[e[2]===`:`?e.slice(3):M(e.slice(2)),t]}var ko=0,Ao=Promise.resolve(),jo=()=>ko||=(Ao.then(()=>ko=0),Date.now());function Mo(e,t){let n=e=>{if(!e._vts)e._vts=Date.now();else if(e._vts<=n.attached)return;let r=n.value;if(m(r)){let n=e.stopImmediatePropagation;e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0};let i=r.slice(),a=[e];for(let n=0;n<i.length&&!e._stopped;n++){let e=i[n];e&&sn(e,t,5,a)}}else sn(r,t,5,[e])};return n.value=e,n.attached=jo(),n}var No=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&e.charCodeAt(2)>96&&e.charCodeAt(2)<123,Po=(e,t,n,r,i,a)=>{let o=i===`svg`;t===`class`?oo(e,r,o):t===`style`?fo(e,n,r):c(t)?l(t)||To(e,t,n,r,a):(t[0]===`.`?(t=t.slice(1),1):t[0]===`^`?(t=t.slice(1),0):Fo(e,t,r,o))?(xo(e,t,r),e.tagName.includes(`-`)||t!==`value`&&t!==`checked`&&t!==`selected`||bo(e,t,r,o,a,t!==`value`)):e._isVueCE&&(Io(e,t)||e._def.__asyncLoader&&(/[A-Z]/.test(t)||!y(r)))?xo(e,j(t),r,a,t):(t===`true-value`?e._trueValue=r:t===`false-value`&&(e._falseValue=r),bo(e,t,r,o))};function Fo(e,t,n,r){if(r)return!!(t===`innerHTML`||t===`textContent`||t in e&&No(t)&&v(n));if(t===`spellcheck`||t===`draggable`||t===`translate`||t===`autocorrect`||t===`sandbox`&&e.tagName===`IFRAME`||t===`form`||t===`list`&&e.tagName===`INPUT`||t===`type`&&e.tagName===`TEXTAREA`)return!1;if(t===`width`||t===`height`){let t=e.tagName;if(t===`IMG`||t===`VIDEO`||t===`CANVAS`||t===`SOURCE`)return!1}return No(t)&&y(n)?!1:t in e}function Io(e,t){let n=e._def.props;if(!n)return!1;let r=j(t);return Array.isArray(n)?n.some(e=>j(e)===r):Object.keys(n).some(e=>j(e)===r)}var Lo=e=>{let t=e.props[`onUpdate:modelValue`]||!1;return m(t)?e=>ne(t,e):t};function Ro(e){e.target.composing=!0}function zo(e){let t=e.target;t.composing&&(t.composing=!1,t.dispatchEvent(new Event(`input`)))}var Bo=Symbol(`_assign`),Vo=Symbol(`_initialValue`);function Ho(e,t,n){return t&&(e=e.trim()),n&&(e=ie(e)),e}var Uo={created(e,{modifiers:{lazy:t,trim:n,number:r}},i){e.parentNode&&(e.type===`text`?e[Vo]=e.defaultValue.replace(/[\r\n]/g,``):e.type===`textarea`&&(e[Vo]=e.defaultValue.replace(/\r\n?/g,`
`))),e[Bo]=Lo(i);let a=r||i.props&&i.props.type===`number`;So(e,t?`change`:`input`,t=>{t.target.composing||e[Bo](Ho(e.value,n,a))}),(n||a)&&So(e,`change`,()=>{e.value=Ho(e.value,n,a)}),t||(So(e,`compositionstart`,Ro),So(e,`compositionend`,zo),So(e,`change`,zo))},mounted(e,{value:t,modifiers:{trim:n,number:r}}){let i=t??``,a=e[Vo];delete e[Vo],a!==void 0&&(e.type===`text`||e.type===`textarea`)&&e.value!==a?e[Bo](Ho(e.value,n,r)):e.value=i},beforeUpdate(e,{value:t,oldValue:n,modifiers:{lazy:r,trim:i,number:a}},o){if(e[Bo]=Lo(o),e.composing)return;let s=(a||e.type===`number`)&&!/^0\d/.test(e.value)?ie(e.value):e.value,c=t??``;if(s===c)return;let l=e.getRootNode();(l instanceof Document||l instanceof ShadowRoot)&&l.activeElement===e&&e.type!==`range`&&(r&&t===n||i&&e.value.trim()===c)||(e.value=c)}},Wo={deep:!0,created(e,t,n){e[Bo]=Lo(n),So(e,`change`,()=>{let t=e._modelValue,n=Xo(e),r=e.checked,i=e[Bo];if(m(t)){let e=xe(t,n),a=e!==-1;if(r&&!a)i(t.concat(n));else if(!r&&a){let n=[...t];n.splice(e,1),i(n)}}else if(g(t)){let e=new Set(t);r?e.add(n):e.delete(n),i(e)}else i(Zo(e,r))})},mounted:Go,beforeUpdate(e,t,n){e[Bo]=Lo(n),Go(e,t,n)}};function Go(e,{value:t,oldValue:n},r){e._modelValue=t;let i;if(m(t))i=xe(t,r.props.value)>-1;else if(g(t))i=t.has(r.props.value);else{if(t===n)return;i=be(t,Zo(e,!0))}e.checked!==i&&(e.checked=i)}var Ko={created(e,{value:t},n){e.checked=be(t,n.props.value),e[Bo]=Lo(n),So(e,`change`,()=>{e[Bo](Xo(e))})},beforeUpdate(e,{value:t,oldValue:n},r){e[Bo]=Lo(r),t!==n&&(e.checked=be(t,r.props.value))}},qo={deep:!0,created(e,{value:t,modifiers:{number:n}},r){e._modelValue=t,So(e,`change`,()=>{let t=Array.prototype.filter.call(e.options,e=>e.selected).map(e=>n?ie(Xo(e)):Xo(e)),r=e.multiple,i=r?g(e._modelValue)?new Set(t):t:t[0],a=e._pendingValue=[r,r?m(i)?t.slice():t:i];try{e[Bo](i)}finally{_n(()=>{e._pendingValue===a&&(e._pendingValue=void 0)})}}),e[Bo]=Lo(r)},mounted(e,{value:t}){Yo(e,t)},beforeUpdate(e,{value:t},n){e._modelValue=t,e[Bo]=Lo(n)},updated(e,{value:t}){let n=e._pendingValue;e._pendingValue=void 0,n&&n[0]===e.multiple&&Jo(t,n[1],n[0])||Yo(e,t)}};function Jo(e,t,n){if(!n||m(e))return be(e,t);if(g(e)){if(e.size!==t.length)return!1;for(let n of t)if(!e.has(n))return!1;return!0}return!1}function Yo(e,t){let n=e.multiple,r=m(t);if(!n||r||g(t)){for(let i=0,a=e.options.length;i<a;i++){let a=e.options[i],o=Xo(a);if(n){if(r){let e=typeof o;a.selected=e===`string`||e===`number`?t.some(e=>String(e)===String(o)):xe(t,o)>-1}else a.selected=t.has(o)}else if(be(Xo(a),t)){e.selectedIndex!==i&&(e.selectedIndex=i);return}}!n&&e.selectedIndex!==-1&&(e.selectedIndex=-1)}}function Xo(e){return`_value`in e?e._value:e.value}function Zo(e,t){let n=t?`_trueValue`:`_falseValue`;return n in e?e[n]:t}var Qo={created(e,t,n){es(e,t,n,null,`created`)},mounted(e,t,n){es(e,t,n,null,`mounted`)},beforeUpdate(e,t,n,r){es(e,t,n,r,`beforeUpdate`)},updated(e,t,n,r){es(e,t,n,r,`updated`)}};function $o(e,t){switch(e){case`SELECT`:return qo;case`TEXTAREA`:return Uo;default:switch(t){case`checkbox`:return Wo;case`radio`:return Ko;default:return Uo}}}function es(e,t,n,r,i){let a=$o(e.tagName,n.props&&n.props.type)[i];a&&a(e,t,n,r)}var ts=[`ctrl`,`shift`,`alt`,`meta`],ns={stop:e=>e.stopPropagation(),prevent:e=>e.preventDefault(),self:e=>e.target!==e.currentTarget,ctrl:e=>!e.ctrlKey,shift:e=>!e.shiftKey,alt:e=>!e.altKey,meta:e=>!e.metaKey,left:e=>`button`in e&&e.button!==0,middle:e=>`button`in e&&e.button!==1,right:e=>`button`in e&&e.button!==2,exact:(e,t)=>ts.some(n=>e[`${n}Key`]&&!t.includes(n))},rs=(e,t)=>{if(!e)return e;let n=e._withMods||={},r=t.join(`.`);return n[r]||(n[r]=((n,...r)=>{for(let e=0;e<t.length;e++){let r=ns[t[e]];if(r&&r(n,t))return}return e(n,...r)}))},is={esc:`escape`,space:` `,up:`arrow-up`,left:`arrow-left`,right:`arrow-right`,down:`arrow-down`,delete:`backspace`},as=(e,t)=>{let n=e._withKeys||={},r=t.join(`.`);return n[r]||(n[r]=(n=>{if(!(`key`in n))return;let r=M(n.key);if(t.some(e=>e===r||is[e]===r))return e(n)}))},os=u({patchProp:Po},za),ss;function cs(){return ss||=wi(os)}var ls=((...e)=>{let t=cs().createApp(...e),{mount:n}=t;return t.mount=e=>{let r=ds(e);if(!r)return;let i=t._component;v(i)||i.render||i.template||(i.template=r.innerHTML),r.nodeType===1&&(r.textContent=``);let a=n(r,!1,us(r));return r instanceof Element&&(r.removeAttribute(`v-cloak`),r.setAttribute(`data-v-app`,``)),a},t});function us(e){if(e instanceof SVGElement)return`svg`;if(typeof MathMLElement==`function`&&e instanceof MathMLElement)return`mathml`}function ds(e){return y(e)?document.querySelector(e):e}var fs=(e,t)=>{let n=e.__vccOpts||e;for(let[e,r]of t)n[e]=r;return n},ps={};function ms(e,t){return K(),q(G,null,[t[0]||=J(`div`,{id:`account-notice`,class:`notice`,role:`status`,hidden:``},null,-1),t[1]||=J(`div`,{id:`account-panel`,hidden:``},[J(`button`,{id:`back-workbench`,class:`button secondary compact back-workbench`,type:`button`},[J(`i`,{"data-lucide":`arrow-left`,"aria-hidden":`true`}),X(`返回工作台`)]),J(`div`,{class:`account-heading`},[J(`div`,null,[J(`p`,{class:`eyebrow`},`我的账户`),J(`h1`,{id:`account-greeting`})]),J(`span`,{class:`status-badge`},[J(`span`,{class:`status-dot`}),X(`已登录`)])]),J(`div`,{class:`account-layout`},[J(`nav`,{class:`account-nav`,role:`tablist`,"aria-label":`账户分区`},[J(`button`,{id:`account-profile-tab`,type:`button`,role:`tab`,"aria-selected":`true`,"aria-controls":`profile-section`},[J(`i`,{"data-lucide":`user-round`,"aria-hidden":`true`}),X(`账户资料`)]),J(`button`,{id:`account-security-tab`,type:`button`,role:`tab`,"aria-selected":`false`,"aria-controls":`security-section`,tabindex:`-1`},[J(`i`,{"data-lucide":`shield-check`,"aria-hidden":`true`}),X(`账户安全`)]),J(`button`,{id:`account-cloud-tab`,type:`button`,role:`tab`,"aria-selected":`false`,"aria-controls":`cloud-section`,tabindex:`-1`},[J(`i`,{"data-lucide":`cpu`,"aria-hidden":`true`}),X(`AI 服务`)])]),J(`div`,{class:`account-sections`},[J(`section`,{id:`profile-section`,class:`account-section`,role:`tabpanel`,"aria-labelledby":`account-profile-tab`},[J(`h2`,null,`账户资料`),J(`dl`,{class:`profile-info`},[J(`div`,null,[J(`dt`,null,`用户名`),J(`dd`,{id:`profile-username`})]),J(`div`,null,[J(`dt`,null,`邮箱`),J(`dd`,{id:`profile-email`})]),J(`div`,null,[J(`dt`,null,`邮箱状态`),J(`dd`,{id:`profile-email-status`})]),J(`div`,null,[J(`dt`,null,`注册时间`),J(`dd`,{id:`profile-created`})])]),J(`form`,{id:`profile-form`,class:`profile-form`},[J(`label`,{class:`field`},[X(`昵称`),J(`input`,{id:`profile-name`,name:`displayName`,required:``,autocomplete:`nickname`})]),J(`button`,{class:`icon-button save-button`,type:`submit`,title:`保存昵称`,"aria-label":`保存昵称`},[J(`i`,{"data-lucide":`save`,"aria-hidden":`true`})])]),J(`p`,{id:`profile-error`,class:`form-error`,role:`alert`,hidden:``})]),J(`section`,{id:`security-section`,class:`account-section`,role:`tabpanel`,"aria-labelledby":`account-security-tab`,hidden:``},[J(`h2`,null,`账户安全`),J(`form`,{id:`password-form`,novalidate:``},[J(`label`,{class:`field`},[X(`当前密码`),J(`input`,{id:`current-password`,name:`currentPassword`,type:`password`,autocomplete:`current-password`,required:``})]),J(`p`,{id:`new-password-help`,class:`field-help`},`新密码需要6–16个字符，至少3个不同字符，避免常见弱密码，且不能与当前密码相同。`),J(`label`,{class:`field`},[X(`新密码`),J(`input`,{id:`new-password`,name:`newPassword`,type:`password`,autocomplete:`new-password`,required:``,"aria-describedby":`new-password-help`,placeholder:`6–16个字符`})]),J(`label`,{class:`field`},[X(`确认新密码`),J(`input`,{id:`confirm-new-password`,name:`confirmNewPassword`,type:`password`,autocomplete:`new-password`,required:``})]),J(`p`,{id:`password-error`,class:`form-error`,role:`alert`,hidden:``}),J(`button`,{class:`button secondary`,type:`submit`},[J(`i`,{"data-lucide":`key-round`,"aria-hidden":`true`}),X(`修改密码`)])]),J(`div`,{class:`session-actions`},[J(`button`,{id:`logout-all`,class:`button secondary`},[J(`i`,{"data-lucide":`log-out`,"aria-hidden":`true`}),X(`退出所有设备`)])])]),J(`section`,{id:`cloud-section`,class:`account-section`,role:`tabpanel`,"aria-labelledby":`account-cloud-tab`,hidden:``},[J(`div`,{class:`section-heading`},[J(`h2`,{id:`cloud-title`},`AI 服务`),J(`button`,{id:`refresh-cloud`,class:`icon-button`,type:`button`,title:`刷新 AI 服务状态`,"aria-label":`刷新 AI 服务状态`},[J(`i`,{"data-lucide":`refresh-cw`,"aria-hidden":`true`})])]),J(`p`,{class:`transport-warning`,"data-transport-warning":``,role:`status`,hidden:``},[J(`i`,{"data-lucide":`shield-alert`,"aria-hidden":`true`}),J(`span`,null,`当前连接未加密，请通过 HTTPS 访问后再填写或更新 API 密钥。`)]),J(`p`,{id:`cloud-state`,class:`muted`,role:`status`}),J(`p`,{id:`cloud-error`,class:`form-error`,role:`alert`,hidden:``}),J(`div`,{class:`cloud-call-preference`},[J(`label`,{class:`check-field`},[J(`input`,{id:`skip-cloud-confirmation`,type:`checkbox`,"aria-describedby":`cloud-confirmation-help`}),X(`本次登录不再提示云端调用`)]),J(`p`,{id:`cloud-confirmation-help`,class:`field-help`},`仅跳过调用前的费用提示，重新登录后恢复。关闭提示不影响供应商计费。`)]),J(`div`,{class:`cloud-categories`,role:`tablist`,"aria-label":`AI服务分类`},[J(`button`,{id:`cloud-text-tab`,type:`button`,role:`tab`,"aria-selected":`true`,"aria-controls":`cloud-text-panel`},[J(`i`,{"data-lucide":`messages-square`,"aria-hidden":`true`}),X(`文字AI`)]),J(`button`,{id:`cloud-speech-tab`,type:`button`,role:`tab`,"aria-selected":`false`,"aria-controls":`cloud-speech-panel`,tabindex:`-1`},[J(`i`,{"data-lucide":`audio-lines`,"aria-hidden":`true`}),X(`语音识别`)])]),J(`div`,{id:`cloud-providers`,class:`cloud-providers`},[J(`div`,{id:`cloud-text-panel`,role:`tabpanel`,"aria-labelledby":`cloud-text-tab`},[J(`div`,{id:`cloud-text-providers`,class:`cloud-provider-grid`})]),J(`div`,{id:`cloud-speech-panel`,role:`tabpanel`,"aria-labelledby":`cloud-speech-tab`,hidden:``},[J(`div`,{id:`cloud-speech-providers`,class:`cloud-provider-grid`})])])]),J(`section`,{id:`account-danger-section`,class:`account-section danger-section`,hidden:``},[J(`h2`,null,`注销账号`),J(`p`,{class:`muted`},`注销后无法恢复，素材和文件将被清理，用户名和邮箱将保留占用。`),J(`button`,{id:`open-delete-dialog`,class:`button danger-outline`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`}),X(`注销账号`)])])])])],-1)],64)}var hs=fs(ps,[[`render`,ms]]),gs={},_s={id:`ai-section`,class:`ai-section`,hidden:``,"aria-labelledby":`ai-title`};function vs(e,t){return K(),q(`section`,_s,[...t[0]||=[J(`div`,{class:`section-heading`},[J(`h2`,{id:`ai-title`},`AI 处理`),J(`button`,{id:`refresh-ai-plan`,class:`icon-button`,type:`button`,title:`恢复最近方案`,"aria-label":`恢复最近方案`},[J(`i`,{"data-lucide":`refresh-cw`,"aria-hidden":`true`})])],-1),J(`div`,{id:`workflow-mode`,class:`workflow-mode`,role:`group`,"aria-label":`方案输入方式`,"data-mode":`text`},[J(`span`,{class:`workflow-mode-indicator`,"aria-hidden":`true`}),J(`button`,{id:`workflow-text-mode`,type:`button`,"aria-pressed":`true`,"aria-controls":`ai-form`},[J(`i`,{"data-lucide":`text-cursor-input`,"aria-hidden":`true`}),X(`文字输入`)]),J(`button`,{id:`workflow-step-mode`,type:`button`,"aria-pressed":`false`,"aria-controls":`workflow-form`},[J(`i`,{"data-lucide":`list-ordered`,"aria-hidden":`true`}),X(`分步填写`)])],-1),J(`div`,{class:`ai-layout`},[J(`div`,{id:`workflow-viewport`,class:`workflow-viewport`},[J(`form`,{id:`ai-form`},[J(`label`,{class:`field`},[X(`当前素材`),J(`output`,{id:`ai-source`,class:`conversion-source`},`未选择就绪素材`)]),J(`label`,{class:`field`},[X(`处理要求`),J(`textarea`,{id:`ai-instruction`,rows:`4`,maxlength:`4000`,required:``,placeholder:`保留前5秒，转成360p并导出`})]),J(`p`,{id:`ai-model-warning`,class:`model-warning`,hidden:``},[J(`i`,{"data-lucide":`info`,"aria-hidden":`true`}),J(`span`,null,`服务端使用轻量模型，理解能力有限，复杂要求可能解析不准确，请核对方案后再执行。`)]),J(`p`,{id:`ai-state`,class:`muted`,role:`status`}),J(`p`,{id:`ai-error`,class:`form-error`,role:`alert`,hidden:``}),J(`button`,{id:`generate-ai-plan`,class:`button primary`,type:`submit`},[J(`i`,{"data-lucide":`sparkles`,"aria-hidden":`true`}),J(`span`,{id:`generate-ai-label`},`生成方案`)])]),J(`form`,{id:`workflow-form`,hidden:``,inert:``},[J(`label`,{class:`field`},[X(`当前素材`),J(`output`,{id:`workflow-source`,class:`conversion-source`},`未选择就绪素材`)]),J(`ol`,{id:`workflow-steps`,class:`workflow-steps`}),J(`button`,{id:`workflow-add`,class:`button secondary compact`,type:`button`},[J(`i`,{"data-lucide":`plus`,"aria-hidden":`true`}),X(`添加步骤`)]),J(`h3`,{class:`workflow-export-heading`},`最终导出`),J(`div`,{class:`conversion-fields`},[J(`label`,{class:`field`},[X(`格式`),J(`select`,{id:`workflow-format`},[J(`option`,{value:`mp4`},`MP4`),J(`option`,{value:`mov`},`MOV`),J(`option`,{value:`mkv`},`MKV`),J(`option`,{value:`webm`},`WebM`),J(`option`,{value:`mp3`},`MP3`),J(`option`,{value:`m4a`},`M4A`),J(`option`,{value:`wav`},`WAV`),J(`option`,{value:`flac`},`FLAC`)])]),J(`label`,{id:`workflow-codec-field`,class:`field`},[X(`视频编码`),J(`select`,{id:`workflow-codec`},[J(`option`,{value:`h264`},`H.264`),J(`option`,{value:`hevc`},`H.265 / HEVC`),J(`option`,{value:`vp9`},`VP9`),J(`option`,{value:`av1`},`AV1`)])])]),J(`label`,{id:`workflow-size-field`,class:`field`},[X(`目标体积（MB，可留空）`),J(`input`,{id:`workflow-size`,type:`number`,min:`0.03125`,step:`any`,inputmode:`decimal`})]),J(`label`,{id:`workflow-audio-field`,class:`checkbox-field`},[J(`input`,{id:`workflow-audio`,type:`checkbox`}),X(`另存完整原始音轨 MP3`)]),J(`p`,{id:`workflow-state`,class:`muted`,role:`status`}),J(`p`,{id:`workflow-error`,class:`form-error`,role:`alert`,hidden:``}),J(`button`,{id:`workflow-save`,class:`button primary`,type:`submit`},[J(`i`,{"data-lucide":`list-checks`,"aria-hidden":`true`}),X(`生成方案`)])])]),J(`div`,{id:`ai-plan`,hidden:``},[J(`div`,{class:`section-heading`},[J(`h3`,null,`处理方案`),J(`span`,{id:`ai-plan-status`,class:`media-status`})]),J(`p`,{id:`ai-plan-summary`,class:`result-filename`}),J(`div`,{id:`ai-plan-details`}),J(`button`,{id:`workflow-edit`,class:`icon-button`,type:`button`,title:`编辑步骤`,"aria-label":`编辑步骤`,hidden:``},[J(`i`,{"data-lucide":`list-ordered`,"aria-hidden":`true`})]),J(`button`,{id:`execute-ai-plan`,class:`button primary`,type:`button`},[J(`i`,{"data-lucide":`play`,"aria-hidden":`true`}),X(`确认执行`)])])],-1),J(`div`,{id:`ai-result-slot`},null,-1)]])}var ys=fs(gs,[[`render`,vs]]),bs={},xs={id:`find-section`,class:`find-section`,hidden:``,"aria-labelledby":`find-title`};function Ss(e,t){return K(),q(`section`,xs,[...t[0]||=[$i(`<div class="section-heading"><h2 id="find-title">找片段</h2><button id="refresh-find" class="icon-button" type="button" title="刷新字幕版本" aria-label="刷新字幕版本"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div><p id="find-source" class="result-filename">未选择就绪素材</p>`,2),J(`form`,{id:`find-form`},[J(`fieldset`,{class:`find-modes`},[J(`legend`,{class:`sr-only`},`查找方式`),J(`label`,null,[J(`input`,{type:`radio`,name:`find-mode`,value:`search`,checked:``}),J(`span`,null,`按内容查找`)]),J(`label`,null,[J(`input`,{type:`radio`,name:`find-mode`,value:`recommend`}),J(`span`,null,`片段建议`)])]),J(`label`,{class:`field`},[X(`目标内容`),J(`textarea`,{id:`find-query`,rows:`2`,maxlength:`1000`,required:``,placeholder:`产品使用限制`})]),J(`div`,{class:`find-options`},[J(`label`,{class:`field`},[X(`最多结果`),J(`input`,{id:`find-limit`,type:`number`,min:`1`,max:`20`,step:`1`,value:`10`,required:``})]),J(`label`,{id:`find-budget-field`,class:`field`,hidden:``},[X(`建议总时长（秒）`),J(`input`,{id:`find-budget`,type:`number`,min:`1`,max:`900`,step:`1`,value:`60`})])]),J(`p`,{id:`find-state`,class:`muted`,role:`status`}),J(`p`,{id:`find-error`,class:`form-error`,role:`alert`,hidden:``}),J(`button`,{id:`find-submit`,class:`button primary`,type:`submit`},[J(`i`,{"data-lucide":`search`,"aria-hidden":`true`}),J(`span`,{id:`find-submit-label`},`查找片段`)])],-1),J(`p`,{id:`find-result-state`,class:`muted`,role:`status`,hidden:``},null,-1),J(`div`,{id:`find-preview-section`,hidden:``},[J(`div`,{class:`section-heading`},[J(`h3`,null,`片段预览`),J(`span`,{id:`find-preview-range`,class:`muted`})]),J(`video`,{id:`find-preview`,controls:``,preload:`metadata`,"aria-label":`片段预览`}),J(`p`,{id:`find-preview-error`,class:`form-error`,role:`alert`,hidden:``})],-1),J(`div`,{id:`find-results-view`},null,-1)]])}var Cs=fs(bs,[[`render`,Ss]]),ws={},Ts={id:`join-section`,class:`join-section`,hidden:``,"aria-labelledby":`join-title`};function Es(e,t){return K(),q(`section`,Ts,[...t[0]||=[$i(`<div class="section-heading"><h2 id="join-title">片段拼接</h2><button id="refresh-join" class="icon-button" type="button" title="恢复最近拼接方案" aria-label="恢复最近拼接方案"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div><p id="join-source" class="result-filename">未选择就绪素材</p>`,2),J(`form`,{id:`join-form`},[J(`ol`,{id:`join-clips`,class:`join-clips`}),J(`div`,{class:`join-actions`},[J(`button`,{id:`add-join-clip`,class:`icon-button`,type:`button`,title:`添加片段`,"aria-label":`添加片段`},[J(`i`,{"data-lucide":`plus`,"aria-hidden":`true`})]),J(`span`,{id:`join-total`,class:`muted`,role:`status`})]),J(`p`,{id:`join-state`,class:`muted`,role:`status`}),J(`p`,{id:`join-range-error`,class:`form-error`,role:`status`,hidden:``},`每段至少0.5秒且不能超出素材，最多20段、总时长最多15分钟。`),J(`p`,{id:`join-error`,class:`form-error`,role:`alert`,hidden:``}),J(`button`,{id:`export-join`,class:`button primary`,type:`submit`},[J(`i`,{"data-lucide":`film`,"aria-hidden":`true`}),X(`导出拼接视频`)])],-1),J(`video`,{id:`join-preview`,controls:``,preload:`metadata`,"aria-label":`拼接片段预览`,hidden:``},null,-1),J(`div`,{id:`join-result-slot`},null,-1)]])}var Ds=fs(ws,[[`render`,Es]]),Os={},ks={id:`conversion-section`,class:`conversion-section`,hidden:``,"aria-labelledby":`conversion-title`};function As(e,t){return K(),q(`section`,ks,[...t[0]||=[J(`h2`,{id:`conversion-title`},`视频转换`,-1),J(`div`,{id:`conversion-layout`,class:`conversion-layout`},[J(`form`,{id:`conversion-form`},[J(`label`,{class:`field`},[X(`当前素材`),J(`output`,{id:`conversion-source`,class:`conversion-source`},`未选择就绪素材`)]),J(`div`,{id:`processing-fields`,class:`conversion-fields`},[J(`label`,{class:`field`},[X(`输出`),J(`output`,{id:`processing-format`},`MP4 · H.264`)]),J(`label`,{id:`resolution-field`,class:`field`},[X(`分辨率`),J(`select`,{id:`conversion-resolution`},[J(`option`,{value:`source`},`原分辨率`),J(`option`,{value:`360p`},`360p`),J(`option`,{value:`480p`},`480p`),J(`option`,{value:`720p`},`720p`),J(`option`,{value:`1080p`},`1080p`),J(`option`,{value:`1440p`},`1440p`),J(`option`,{value:`2160p`},`2160p`),J(`option`,{value:`custom`},`自定义`)])]),J(`label`,{class:`field`},[X(`音轨`),J(`output`,{id:`processing-audio-mode`},`保留音轨`)])]),J(`div`,{class:`export-settings`},[J(`div`,{class:`conversion-fields`},[J(`label`,{id:`export-format-field`,class:`field`},[X(`视频格式`),J(`select`,{id:`export-format`},[J(`option`,{value:`mp4`},`MP4`),J(`option`,{value:`mkv`},`MKV`),J(`option`,{value:`mov`},`MOV`),J(`option`,{value:`webm`},`WebM`)])]),J(`label`,{id:`export-codec-field`,class:`field`},[X(`视频编码`),J(`select`,{id:`export-codec`},[J(`option`,{value:`h264`},`H.264`),J(`option`,{value:`hevc`},`H.265 / HEVC`),J(`option`,{value:`vp9`},`VP9`),J(`option`,{value:`av1`},`AV1`)])]),J(`label`,{id:`export-audio-format-field`,class:`field`,hidden:``},[X(`音频格式`),J(`select`,{id:`export-audio-format`},[J(`option`,{value:`mp3`},`MP3`),J(`option`,{value:`m4a`},`M4A / AAC`),J(`option`,{value:`wav`},`WAV / PCM`),J(`option`,{value:`flac`},`FLAC`)])])]),J(`div`,{id:`export-custom-fields`,class:`conversion-fields`,hidden:``},[J(`label`,{class:`field`},[X(`最大宽度`),J(`input`,{id:`export-width`,type:`number`,min:`2`,max:`4096`,step:`1`,value:`1920`})]),J(`label`,{class:`field`},[X(`最大高度`),J(`input`,{id:`export-height`,type:`number`,min:`2`,max:`4096`,step:`1`,value:`1080`})])]),J(`label`,{id:`export-combine-field`,class:`checkbox-field`},[J(`input`,{id:`export-combine`,type:`checkbox`}),X(`组合处理`)]),J(`div`,{id:`export-combination`,class:`export-combination`,hidden:``},[J(`label`,{class:`checkbox-field`},[J(`input`,{id:`export-trim`,type:`checkbox`}),X(`裁切`)]),J(`label`,{class:`checkbox-field`},[J(`input`,{id:`export-compress`,type:`checkbox`}),X(`目标体积压缩`)]),J(`label`,{class:`checkbox-field`},[J(`input`,{id:`export-mute`,type:`checkbox`}),X(`静音`)]),J(`label`,{class:`checkbox-field`},[J(`input`,{id:`export-extract`,type:`checkbox`}),X(`另存原始音轨 MP3`)])])]),J(`label`,{id:`compression-target-field`,class:`field compression-target-field`,hidden:``},[X(`目标体积（MB）`),J(`input`,{id:`compression-target`,type:`number`,min:`0.03125`,step:`any`,inputmode:`decimal`})]),J(`div`,{id:`trim-fields`,class:`conversion-fields trim`,hidden:``},[J(`label`,{class:`field`},[X(`开始时间（秒）`),J(`input`,{id:`trim-start`,type:`number`,min:`0`,step:`0.001`,inputmode:`decimal`})]),J(`label`,{class:`field`},[X(`结束时间（秒）`),J(`input`,{id:`trim-end`,type:`number`,min:`0.5`,step:`0.001`,inputmode:`decimal`})])]),J(`p`,{id:`trim-range-error`,class:`form-error`,role:`status`,hidden:``},`区间需至少0.5秒，且不超过素材时长。`),J(`p`,{id:`compression-small`,class:`form-error`,role:`status`,hidden:``},`当前素材体积过小，无法进行目标体积压缩。`),J(`p`,{id:`audio-missing`,class:`form-error`,role:`status`,hidden:``},`当前素材没有可提取的音轨。`),J(`p`,{id:`conversion-error`,class:`form-error`,role:`alert`,hidden:``}),J(`p`,{id:`export-plan-state`,class:`muted`,role:`status`}),J(`div`,{class:`export-actions`},[J(`button`,{id:`start-conversion`,class:`button primary`,type:`submit`,disabled:``},[J(`i`,{"data-lucide":`play`,"aria-hidden":`true`}),J(`span`,{id:`start-processing-label`},`开始转换`)]),J(`button`,{id:`save-export-plan`,class:`icon-button`,type:`button`,title:`保存导出方案`,"aria-label":`保存导出方案`},[J(`i`,{"data-lucide":`save`,"aria-hidden":`true`})]),J(`button`,{id:`restore-export-plan`,class:`icon-button`,type:`button`,title:`恢复最近导出方案`,"aria-label":`恢复最近导出方案`},[J(`i`,{"data-lucide":`rotate-ccw`,"aria-hidden":`true`})])])]),J(`div`,{id:`conversion-result`,hidden:``,"aria-live":`polite`},[J(`div`,{class:`section-heading`},[J(`h2`,null,`处理结果`),J(`span`,{id:`task-status`,class:`media-status`})]),J(`p`,{id:`task-stage`,class:`muted`}),J(`p`,{id:`compression-stats`,class:`muted`,hidden:``}),J(`p`,{id:`task-error`,class:`form-error`,role:`alert`,hidden:``}),J(`label`,{id:`output-selector-field`,class:`field`,hidden:``},[X(`结果文件`),J(`select`,{id:`output-selector`})]),J(`p`,{id:`output-preview-status`,class:`muted`,role:`status`,hidden:``}),J(`video`,{id:`output-preview`,controls:``,preload:`metadata`,hidden:``}),J(`audio`,{id:`output-audio`,controls:``,preload:`metadata`,hidden:``}),J(`p`,{id:`audio-stats`,class:`muted`,hidden:``}),J(`p`,{id:`output-empty`,class:`muted`,role:`status`,hidden:``},`暂无可用结果`),J(`div`,{class:`conversion-actions`},[J(`button`,{id:`cancel-task`,class:`button secondary compact`,type:`button`,hidden:``},[J(`i`,{"data-lucide":`square`,"aria-hidden":`true`}),X(`取消任务`)]),J(`a`,{id:`download-output`,class:`button primary compact`,hidden:``},[J(`i`,{"data-lucide":`download`,"aria-hidden":`true`}),J(`span`,{id:`download-label`},`下载 MP4`)]),J(`button`,{id:`delete-output`,class:`icon-button danger-outline`,type:`button`,title:`删除结果`,"aria-label":`删除结果`,hidden:``},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`})])])])],-1)]])}var js=fs(Os,[[`render`,As]]),Ms={},Ns={id:`subtitle-section`,class:`subtitle-section`,hidden:``,"aria-labelledby":`subtitle-title`};function Ps(e,t){return K(),q(`section`,Ns,[...t[0]||=[$i(`<div class="section-heading"><h2 id="subtitle-title">字幕处理</h2><button id="refresh-subtitle" class="icon-button" type="button" title="刷新字幕" aria-label="刷新字幕"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div><p id="subtitle-source" class="result-filename">未选择就绪素材</p><div class="subtitle-toolbar"><label class="field">识别服务<select id="asr-provider"><option value="tencent">腾讯云</option><option value="aliyun">阿里云百炼</option></select></label><label class="field asr-model-field">语音识别模型<select id="asr-model" aria-describedby="asr-model-note"></select></label><button id="start-transcription" class="button primary" type="button"><i data-lucide="captions" aria-hidden="true"></i><span id="transcription-label">识别字幕</span></button><button id="cancel-transcription" class="button secondary compact" type="button" hidden><i data-lucide="square" aria-hidden="true"></i>取消识别</button></div><p id="asr-model-note" class="muted asr-model-note" hidden></p>`,4),J(`p`,{id:`subtitle-state`,class:`muted`,role:`status`},null,-1),J(`p`,{id:`subtitle-error`,class:`form-error`,role:`alert`,hidden:``},null,-1),J(`div`,{id:`subtitle-editor`,hidden:``},[J(`div`,{class:`subtitle-toolbar`},[J(`label`,{class:`field`},[X(`版本`),J(`select`,{id:`subtitle-version`})]),J(`label`,{class:`checkbox-field`},[J(`input`,{id:`subtitle-original`,type:`checkbox`}),X(`识别原文`)]),J(`span`,{id:`subtitle-draft-state`,class:`muted`,role:`status`}),J(`button`,{id:`save-subtitle`,class:`icon-button save-button`,type:`button`,title:`保存字幕`,"aria-label":`保存字幕`},[J(`i`,{"data-lucide":`save`,"aria-hidden":`true`})]),J(`a`,{id:`download-srt`,class:`button secondary compact`},[J(`i`,{"data-lucide":`download`,"aria-hidden":`true`}),X(`下载 SRT`)])]),J(`div`,{class:`subtitle-toolbar translation-toolbar`},[J(`label`,{class:`field`},[X(`翻译目标语言`),J(`select`,{id:`translation-language`},[J(`option`,{value:`en`},`英语`),J(`option`,{value:`zh-CN`},`简体中文`),J(`option`,{value:`zh-TW`},`繁体中文`),J(`option`,{value:`ja`},`日语`),J(`option`,{value:`ko`},`韩语`),J(`option`,{value:`fr`},`法语`),J(`option`,{value:`de`},`德语`),J(`option`,{value:`es`},`西班牙语`),J(`option`,{value:`ru`},`俄语`),J(`option`,{value:`pt`},`葡萄牙语`)])]),J(`button`,{id:`translate-subtitle`,class:`button secondary compact`,type:`button`},[J(`i`,{"data-lucide":`languages`,"aria-hidden":`true`}),X(`翻译字幕`)]),J(`button`,{id:`cancel-translation`,class:`icon-button`,type:`button`,title:`停止后续翻译，已发出的请求仍可能计费`,"aria-label":`停止翻译`,hidden:``},[J(`i`,{"data-lucide":`square`,"aria-hidden":`true`})]),J(`span`,{id:`translation-state`,class:`muted`,role:`status`})]),J(`section`,{id:`translation-preview`,class:`translation-preview`,"aria-labelledby":`translation-title`,hidden:``},[J(`div`,{class:`section-heading`},[J(`h3`,{id:`translation-title`},`翻译预览`),J(`button`,{id:`discard-translation`,class:`icon-button danger-outline`,type:`button`,title:`放弃译文`,"aria-label":`放弃译文`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`})])]),J(`div`,{class:`subtitle-toolbar`},[J(`label`,{class:`field`},[X(`字幕内容`),J(`select`,{id:`translation-layout`},[J(`option`,{value:`bilingual`},`双语 · 原文在上`),J(`option`,{value:`translated`},`仅译文`)])]),J(`button`,{id:`save-translation`,class:`button primary compact`,type:`button`},[J(`i`,{"data-lucide":`save`,"aria-hidden":`true`}),X(`保存为新版本`)])]),J(`ol`,{id:`translation-segments`,class:`translation-segments`})]),J(`ol`,{id:`subtitle-segments`,class:`subtitle-segments`}),J(`button`,{id:`burn-subtitle`,class:`button primary`,type:`button`},[J(`i`,{"data-lucide":`film`,"aria-hidden":`true`}),X(`生成字幕视频`)])],-1),J(`div`,{id:`subtitle-result-slot`,hidden:``},null,-1)]])}var Fs=fs(Ms,[[`render`,Ps]]),Is={id:`phase-edit`,class:`phase-panel`,role:`tabpanel`,"aria-labelledby":`phase-edit-tab`,hidden:``},Ls={class:`editor-layout`},Rs={class:`editor-controls`,role:`region`,"aria-label":`编辑设置`,tabindex:`0`},zs=hr({__name:`EditorPanel`,setup(e){return(e,t)=>(K(),q(`section`,Is,[J(`div`,Ls,[t[0]||=J(`aside`,{class:`editor-inspector`,"aria-label":`素材预览`,tabindex:`0`},[J(`h2`,{class:`inspector-heading`},[J(`i`,{"data-lucide":`monitor-play`,"aria-hidden":`true`}),X(`素材预览`)]),J(`div`,{id:`editor-preview-slot`,class:`editor-preview-frame`},[J(`video`,{id:`source-preview`,controls:``,preload:`metadata`,"aria-label":`原视频预览`,hidden:``}),J(`div`,{id:`editor-preview-empty`,class:`preview-empty`},[J(`i`,{"data-lucide":`clapperboard`,"aria-hidden":`true`}),J(`span`,null,`暂无可预览素材`)])]),J(`div`,{id:`editor-preview-messages`},[J(`p`,{id:`source-preview-status`,class:`muted`,role:`status`,hidden:``}),J(`button`,{id:`retry-source-preview`,class:`icon-button`,type:`button`,title:`重新加载原视频`,"aria-label":`重新加载原视频`,hidden:``},[J(`i`,{"data-lucide":`rotate-cw`,"aria-hidden":`true`})]),J(`p`,{id:`media-error`,class:`form-error`,hidden:``})]),J(`div`,{class:`editor-source-bar`},[J(`i`,{"data-lucide":`file-video`,"aria-hidden":`true`}),J(`div`,null,[J(`strong`,{id:`editor-filename`},`未选择素材`),J(`span`,{id:`editor-file-info`},`等待导入`)]),J(`button`,{id:`replace-source`,class:`icon-button`,type:`button`,title:`更换素材`,"aria-label":`更换素材`},[J(`i`,{"data-lucide":`folder-open`,"aria-hidden":`true`})])]),J(`details`,{id:`editor-info-details`,class:`editor-info-details`},[J(`summary`,null,[X(`素材信息`),J(`i`,{"data-lucide":`chevron-down`,"aria-hidden":`true`})]),J(`dl`,{id:`editor-metadata`,class:`metadata-list`})])],-1),J(`div`,Rs,[Y(Ds),Y(Cs),Y(ys),Y(Fs),Y(js)])])]))}}),Bs={},Vs={id:`phase-export`,class:`phase-panel`,role:`tabpanel`,"aria-labelledby":`phase-export-tab`,hidden:``};function Hs(e,t){return K(),q(`section`,Vs,[...t[0]||=[$i(`<div class="phase-heading"><div><p class="eyebrow">输出</p><h2>导出结果</h2></div><div class="phase-export-actions"><a id="export-srt" class="button primary compact" hidden><i data-lucide="download" aria-hidden="true"></i>下载 SRT</a><button id="back-to-editing" class="button secondary compact" type="button"><i data-lucide="arrow-left" aria-hidden="true"></i>返回编辑</button></div></div><div id="export-result-slot"></div><div id="export-result-empty" class="export-result-empty"><i data-lucide="film" aria-hidden="true"></i><h3 id="export-empty-title">暂无导出结果</h3><span id="export-result-summary" class="muted">尚未生成文件</span></div>`,3)]])}var Us=fs(Bs,[[`render`,Hs]]),Ws={},Gs={id:`history-panel`,hidden:``,"aria-label":`处理记录与方案`};function Ks(e,t){return K(),q(`section`,Gs,[...t[0]||=[J(`div`,{class:`history-tabs`,role:`tablist`,"aria-label":`记录分类`},[J(`button`,{id:`history-tasks-tab`,type:`button`,role:`tab`,"aria-selected":`true`,"aria-controls":`history-tasks-slot`},`处理任务`),J(`button`,{id:`history-plans-tab`,type:`button`,role:`tab`,"aria-selected":`false`,"aria-controls":`history-plans-panel`,tabindex:`-1`},`保存的方案`)],-1),J(`div`,{id:`history-tasks-slot`,role:`tabpanel`,"aria-labelledby":`history-tasks-tab`},null,-1),J(`section`,{id:`history-plans-panel`,role:`tabpanel`,"aria-labelledby":`history-plans-tab`,hidden:``},[J(`div`,{class:`section-heading`},[J(`h2`,null,`保存的方案`),J(`button`,{id:`refresh-plans`,class:`icon-button`,type:`button`,title:`刷新方案`,"aria-label":`刷新方案`},[J(`i`,{"data-lucide":`refresh-cw`,"aria-hidden":`true`})])]),J(`p`,{id:`plan-list-error`,class:`form-error`,role:`alert`,hidden:``}),J(`p`,{id:`plan-list-empty`,class:`empty-state`},`暂无保存的方案`),J(`ul`,{id:`plan-list`,class:`media-list`}),J(`div`,{class:`pagination`},[J(`span`,{id:`plan-total`,class:`muted`},`0 个方案`),J(`button`,{id:`plan-prev`,class:`icon-button`,type:`button`,title:`上一页方案`,"aria-label":`上一页方案`,disabled:``},[J(`i`,{"data-lucide":`chevron-left`,"aria-hidden":`true`})]),J(`span`,{id:`plan-page`},`1`),J(`button`,{id:`plan-next`,class:`icon-button`,type:`button`,title:`下一页方案`,"aria-label":`下一页方案`,disabled:``},[J(`i`,{"data-lucide":`chevron-right`,"aria-hidden":`true`})])])],-1)]])}var qs=fs(Ws,[[`render`,Ks]]),Js={id:`phase-import`,class:`phase-panel`,role:`tabpanel`,"aria-labelledby":`phase-import-tab`},Ys=[`hidden`],Xs={class:`phase-export-actions`},Zs=[`disabled`],Qs=hr({__name:`ImportPanel`,props:{home:{}},setup(e){return(t,n)=>(K(),q(`section`,Js,[J(`div`,{class:`phase-heading`,hidden:e.home.tool===`detect`},[n[3]||=J(`h2`,null,`选择素材`,-1),J(`div`,Xs,[J(`button`,{class:`button secondary compact`,type:`button`,disabled:e.home.busy,onClick:n[0]||=t=>e.home.openTool(`detect`)},[...n[1]||=[J(`i`,{"data-lucide":`upload`,"aria-hidden":`true`},null,-1),X(`上传新视频`,-1)]],8,Zs),n[2]||=J(`button`,{id:`continue-editing`,class:`button secondary compact`,type:`button`,disabled:``},[J(`span`,null,`继续编辑`),J(`i`,{"data-lucide":`arrow-right`,"aria-hidden":`true`})],-1)])],8,Ys),n[4]||=J(`div`,{id:`import-library-slot`},null,-1)]))}}),$s={},ec={id:`recent-section`,class:`recent-section`,"aria-labelledby":`recent-title`};function tc(e,t){return K(),q(`section`,ec,[...t[0]||=[J(`div`,{class:`section-heading`},[J(`h2`,{id:`recent-title`},`素材库`),J(`button`,{id:`refresh-media`,class:`icon-button`,type:`button`,title:`刷新素材`,"aria-label":`刷新素材`},[J(`i`,{"data-lucide":`refresh-cw`,"aria-hidden":`true`})])],-1),J(`p`,{id:`media-list-error`,class:`form-error`,role:`alert`,hidden:``},null,-1),$i(`<p id="media-list-empty" class="empty-state">暂无素材</p><ul id="media-list" class="media-list"></ul><div class="pagination"><span id="media-total" class="muted">0 个素材</span><button id="media-prev" class="icon-button" type="button" title="上一页" aria-label="上一页" disabled><i data-lucide="chevron-left" aria-hidden="true"></i></button><span id="media-page">1</span><button id="media-next" class="icon-button" type="button" title="下一页" aria-label="下一页" disabled><i data-lucide="chevron-right" aria-hidden="true"></i></button></div>`,3)]])}var nc=fs($s,[[`render`,tc]]),rc={},ic={id:`task-section`,class:`task-section`,hidden:``,"aria-labelledby":`task-list-title`};function ac(e,t){return K(),q(`section`,ic,[...t[0]||=[J(`div`,{class:`section-heading`},[J(`h2`,{id:`task-list-title`},`处理记录`),J(`button`,{id:`refresh-tasks`,class:`icon-button`,type:`button`,title:`刷新任务`,"aria-label":`刷新任务`},[J(`i`,{"data-lucide":`refresh-cw`,"aria-hidden":`true`})])],-1),J(`p`,{id:`task-list-error`,class:`form-error`,role:`alert`,hidden:``},null,-1),$i(`<p id="task-list-empty" class="empty-state">暂无处理任务</p><ul id="task-list" class="media-list"></ul><div class="pagination"><span id="task-total" class="muted">0 个任务</span><button id="task-prev" class="icon-button" type="button" title="上一页任务" aria-label="上一页任务" disabled><i data-lucide="chevron-left" aria-hidden="true"></i></button><span id="task-page">1</span><button id="task-next" class="icon-button" type="button" title="下一页任务" aria-label="下一页任务" disabled><i data-lucide="chevron-right" aria-hidden="true"></i></button></div>`,3)]])}var oc=fs(rc,[[`render`,ac]]),sc={id:`workbench-panel`,class:`workspace-embedded`},cc={id:`workbench-layout`,class:`workbench-layout`},lc={id:`tool-content`,class:`tool-content`},uc={id:`tool-stage`,class:`tool-stage`},dc=hr({__name:`WorkbenchContent`,props:{home:{}},setup(e){return(t,n)=>(K(),Gi(Zn,{to:`#workspace-tool-surface-${e.home.tool}`,defer:``},[J(`div`,sc,[J(`div`,cc,[J(`div`,lc,[n[0]||=J(`div`,{id:`workspace-toolbar`,class:`workspace-toolbar`},[J(`div`,{id:`workspace-phases`,class:`workspace-phases`,role:`tablist`,"aria-label":`处理流程`}),J(`span`,{id:`workspace-file-state`,class:`workspace-file-state`},`未选择素材`)],-1),n[1]||=J(`details`,{id:`tool-dependencies`,class:`tool-dependencies`,"aria-label":`处理方式与API依赖`},[J(`summary`,null,[J(`i`,{"data-lucide":`network`,"aria-hidden":`true`}),J(`span`,{id:`dependency-kind`,class:`dependency-kind`},`服务端处理`),J(`span`,{id:`dependency-summary`,class:`dependency-summary`},`站点处理环境`),J(`i`,{"data-lucide":`chevron-down`,class:`disclosure-chevron`,"aria-hidden":`true`})]),J(`div`,{class:`dependency-heading`},[J(`strong`,{id:`dependency-title`},`视频检测`),J(`button`,{id:`dependency-settings`,class:`button secondary compact`,type:`button`,hidden:``},[J(`i`,{"data-lucide":`settings-2`,"aria-hidden":`true`}),X(`AI 配置 `)])]),J(`dl`,{id:`dependency-services`,class:`dependency-services`}),J(`p`,{id:`dependency-detail`,class:`dependency-detail`})],-1),J(`div`,uc,[Y(Qs,{home:e.home},null,8,[`home`]),Y(zs),Y(Us),Y(qs),Y(nc),Y(oc)])])])])],8,[`to`]))}}),fc={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},pc=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim();function mc(e){return e!=null}function hc(e,t={}){let n=t.attributeNames??{},r=e=>n[e]??e,i=e.size??e.width??fc.width,a=e.size??e.height??fc.height,o=e.aliases?.filter(e=>typeof e==`string`&&e.trim()!==``).map(e=>`lucide-${e}`)??[],s=[...e.name?[`lucide-${e.name}`]:[],...o],c=t.className?.split(` `).filter(Boolean)??[],l=t.includeDefaultClasses===!1?pc(...c):pc(`lucide`,...s,...c),u=t.absoluteStrokeWidth?Number(t.strokeWidth??fc[`stroke-width`])*Number(e.size??e.width??fc.width)/Number(t.size??t.width??fc.width):t.strokeWidth??fc[`stroke-width`];return[`svg`,{...Object.entries(fc).reduce((e,[t,n])=>(e[r(t)]=n,e),{}),...`color`in t&&t.color&&{[r(`stroke`)]:t.color},...`size`in t&&mc(t.size)&&{[r(`width`)]:t.size,[r(`height`)]:t.size},...`width`in t&&mc(t.width)&&{[r(`width`)]:t.width},...`height`in t&&mc(t.height)&&{[r(`height`)]:t.height},[r(`stroke-width`)]:u,...l&&{[r(`class`)]:l},[r(`viewBox`)]:`0 0 ${i} ${a}`,...t.hasA11yProp===!1?{[r(`aria-hidden`)]:`true`}:{},...`attributes`in t&&t.attributes},e.node.map(e=>{let[n,i,a]=e,o=t.nonScalingStroke?{[r(`vector-effect`)]:`non-scaling-stroke`,...i}:i;return a?[n,o,a]:[n,o]})]}var gc=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},_c=e=>e===``,vc=e=>e?.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),yc=Symbol(`lucide-icons`);function bc(){return Pn(yc,{})}var xc=({name:e,iconNode:t,"icon-node":n,icon:r={name:e&&vc(e),node:t??n??[],size:24,aliases:[]},absoluteStrokeWidth:i,"absolute-stroke-width":a,nonScalingStroke:o,"non-scaling-stroke":s,strokeWidth:c,"stroke-width":l,size:u,width:d=u,height:f=u,color:p,...m},{slots:h})=>{let{size:g,color:_,strokeWidth:v=2,absoluteStrokeWidth:y=!1,nonScalingStroke:b=!1,class:x=``}=bc(),S=_c(i)||_c(a)||i===!0||a===!0||y===!0,C=_c(o)||_c(s)||o===!0||s===!0||b===!0;delete m.class;let w=h.default?.(),[,T,E=[]]=hc(r,{color:p??_,width:d??u??g,height:f??u??g,strokeWidth:c??l??v,absoluteStrokeWidth:S,nonScalingStroke:C,className:x,hasA11yProp:w!=null&&w.length>0||gc(m),attributes:m});return Aa(`svg`,T,[...E.map(([e,t])=>Aa(e,t)),...w??[]])};function Sc(e,t=[]){let n=typeof e==`string`?{name:e,node:t}:e;return(e,{slots:t})=>Aa(xc,{...e,icon:n},t.default?{default:t.default}:void 0)}var Cc=Sc({name:`arrow-big-up`,size:24,node:[[`path`,{d:`M9 19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6a1 1 0 0 1 1-1h3.293a.707.707 0 0 0 .5-1.207l-7.086-7.086a1 1 0 0 0-1.414 0l-7.086 7.086a.707.707 0 0 0 .5 1.207H8a1 1 0 0 1 1 1z`,key:`106j91`}]]}),wc=Sc({name:`arrow-down`,size:24,node:[[`path`,{d:`M12 5v14`,key:`s699le`}],[`path`,{d:`m19 12-7 7-7-7`,key:`1idqje`}]]}),Tc=Sc({name:`arrow-left`,size:24,node:[[`path`,{d:`m12 19-7-7 7-7`,key:`1l729n`}],[`path`,{d:`M19 12H5`,key:`x3x0zl`}]]}),Ec=Sc({name:`arrow-up-right`,size:24,node:[[`path`,{d:`M7 7h10v10`,key:`1tivn9`}],[`path`,{d:`M7 17 17 7`,key:`1vkiza`}]]}),Dc=Sc({name:`arrow-up`,size:24,node:[[`path`,{d:`m5 12 7-7 7 7`,key:`hav0vg`}],[`path`,{d:`M12 19V5`,key:`x0mq9r`}]]}),Oc=Sc({name:`battery-full`,size:24,node:[[`path`,{d:`M10 10v4`,key:`1mb2ec`}],[`path`,{d:`M14 10v4`,key:`1nt88p`}],[`path`,{d:`M22 14v-4`,key:`14q9d5`}],[`path`,{d:`M6 10v4`,key:`1n77qd`}],[`rect`,{x:`2`,y:`6`,width:`16`,height:`12`,rx:`2`,key:`13zb55`}]]}),kc=Sc({name:`check`,size:24,node:[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]}),Ac=Sc({name:`chevron-down`,size:24,node:[[`path`,{d:`m6 9 6 6 6-6`,key:`qrunsl`}]]}),jc=Sc({name:`chevrons-left-right`,size:24,node:[[`path`,{d:`m9 7-5 5 5 5`,key:`j5w590`}],[`path`,{d:`m15 7 5 5-5 5`,key:`1bl6da`}]]}),Mc=Sc({name:`circle-alert`,size:24,node:[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`line`,{x1:`12`,x2:`12`,y1:`8`,y2:`12`,key:`1pkeuh`}],[`line`,{x1:`12`,x2:`12.01`,y1:`16`,y2:`16`,key:`4dfq90`}]],aliases:[`alert-circle`]}),Nc=Sc({name:`copy`,size:24,node:[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]}),Pc=Sc({name:`delete`,size:24,node:[[`path`,{d:`M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z`,key:`1yo7s0`}],[`path`,{d:`m12 9 6 6`,key:`anjzzh`}],[`path`,{d:`m18 9-6 6`,key:`1fp51s`}]]}),Fc=Sc({name:`download`,size:24,node:[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]}),Ic=Sc({name:`eye-off`,size:24,node:[[`path`,{d:`M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49`,key:`ct8e1f`}],[`path`,{d:`M14.084 14.158a3 3 0 0 1-4.242-4.242`,key:`151rxh`}],[`path`,{d:`M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143`,key:`13bj9a`}],[`path`,{d:`m2 2 20 20`,key:`1ooewy`}]]}),Lc=Sc({name:`eye`,size:24,node:[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`,key:`1nclc0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]]}),Rc=Sc({name:`file-headphone`,size:24,node:[[`path`,{d:`M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343`,key:`1vfytu`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0`,key:`1etmh7`}]],aliases:[`file-audio`,`file-audio-2`]}),zc=Sc({name:`file-play`,size:24,node:[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z`,key:`1tzo1f`}]],aliases:[`file-video`]}),Bc=Sc({name:`folder-input`,size:24,node:[[`path`,{d:`M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1`,key:`fm4g5t`}],[`path`,{d:`M2 13h10`,key:`pgb2dq`}],[`path`,{d:`m9 16 3-3-3-3`,key:`6m91ic`}]]}),Vc=Sc({name:`house`,size:24,node:[[`path`,{d:`M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8`,key:`5wwlr5`}],[`path`,{d:`M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`,key:`r6nss1`}]],aliases:[`home`]}),Hc=Sc({name:`keyboard`,size:24,node:[[`path`,{d:`M10 8h.01`,key:`1r9ogq`}],[`path`,{d:`M12 12h.01`,key:`1mp3jc`}],[`path`,{d:`M14 8h.01`,key:`1primd`}],[`path`,{d:`M16 12h.01`,key:`1l6xoz`}],[`path`,{d:`M18 8h.01`,key:`emo2bl`}],[`path`,{d:`M6 8h.01`,key:`x9i8wu`}],[`path`,{d:`M7 16h10`,key:`wp8him`}],[`path`,{d:`M8 12h.01`,key:`czm47f`}],[`rect`,{width:`20`,height:`16`,x:`2`,y:`4`,rx:`2`,key:`18n3k1`}]]}),Uc=Sc({name:`list-plus`,size:24,node:[[`path`,{d:`M16 5H3`,key:`m91uny`}],[`path`,{d:`M11 12H3`,key:`51ecnj`}],[`path`,{d:`M16 19H3`,key:`zzsher`}],[`path`,{d:`M18 9v6`,key:`1twb98`}],[`path`,{d:`M21 12h-6`,key:`bt1uis`}]]}),Wc=Sc({name:`loader-circle`,size:24,node:[[`path`,{d:`M21 12a9 9 0 1 1-6.219-8.56`,key:`13zald`}]],aliases:[`loader-2`]}),Gc=Sc({name:`log-in`,size:24,node:[[`path`,{d:`m10 17 5-5-5-5`,key:`1bsop3`}],[`path`,{d:`M15 12H3`,key:`6jk70r`}],[`path`,{d:`M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4`,key:`u53s6r`}]]}),Kc=Sc({name:`mouse-pointer-2`,size:24,node:[[`path`,{d:`M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z`,key:`edeuup`}]]}),qc=Sc({name:`play`,size:24,node:[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`,key:`10ikf1`}]]}),Jc=Sc({name:`plus`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`M12 5v14`,key:`s699le`}]]}),Yc=Sc({name:`rotate-ccw-clock`,size:24,node:[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}],[`path`,{d:`M12 7v5l4 2`,key:`1fdv2h`}]],aliases:[`history`]}),Xc=Sc({name:`rotate-ccw`,size:24,node:[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]}),Zc=Sc({name:`save`,size:24,node:[[`path`,{d:`M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z`,key:`1c8476`}],[`path`,{d:`M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7`,key:`1ydtos`}],[`path`,{d:`M7 3v4a1 1 0 0 0 1 1h7`,key:`t51u73`}]]}),Qc=Sc({name:`scan-line`,size:24,node:[[`path`,{d:`M3 7V5a2 2 0 0 1 2-2h2`,key:`aa7l1z`}],[`path`,{d:`M17 3h2a2 2 0 0 1 2 2v2`,key:`4qcy5o`}],[`path`,{d:`M21 17v2a2 2 0 0 1-2 2h-2`,key:`6vwrx8`}],[`path`,{d:`M7 21H5a2 2 0 0 1-2-2v-2`,key:`ioqczr`}],[`path`,{d:`M7 12h10`,key:`b7w52i`}]]}),$c=Sc({name:`scissors`,size:24,node:[[`circle`,{cx:`6`,cy:`6`,r:`3`,key:`1lh9wr`}],[`path`,{d:`M8.12 8.12 12 12`,key:`1alkpv`}],[`path`,{d:`M20 4 8.12 15.88`,key:`xgtan2`}],[`circle`,{cx:`6`,cy:`18`,r:`3`,key:`fqmcym`}],[`path`,{d:`M14.8 14.8 20 20`,key:`ptml3r`}]]}),el=Sc({name:`send`,size:24,node:[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]}),tl=Sc({name:`settings`,size:24,node:[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`,key:`1i5ecw`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]]}),nl=Sc({name:`signal`,size:24,node:[[`path`,{d:`M2 20h.01`,key:`4haj6o`}],[`path`,{d:`M7 20v-4`,key:`j294jx`}],[`path`,{d:`M12 20v-8`,key:`i3yub9`}],[`path`,{d:`M17 20V8`,key:`1tkaf5`}],[`path`,{d:`M22 4v16`,key:`sih9yq`}]]}),rl=Sc({name:`sliders-horizontal`,size:24,node:[[`path`,{d:`M10 5H3`,key:`1qgfaw`}],[`path`,{d:`M12 19H3`,key:`yhmn1j`}],[`path`,{d:`M14 3v4`,key:`1sua03`}],[`path`,{d:`M16 17v4`,key:`1q0r14`}],[`path`,{d:`M21 12h-9`,key:`1o4lsq`}],[`path`,{d:`M21 19h-5`,key:`1rlt1p`}],[`path`,{d:`M21 5h-7`,key:`1oszz2`}],[`path`,{d:`M8 10v4`,key:`tgpxqk`}],[`path`,{d:`M8 12H3`,key:`a7s4jb`}]]}),il=Sc({name:`sparkles`,size:24,node:[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]],aliases:[`stars`]}),al=Sc({name:`trash`,size:24,node:[[`path`,{d:`M10 11v6`,key:`nco0om`}],[`path`,{d:`M14 11v6`,key:`outv1u`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`,key:`miytrc`}],[`path`,{d:`M3 6h18`,key:`d0wm0j`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`,key:`e791ji`}]],aliases:[`trash-2`]}),ol=Sc({name:`upload`,size:24,node:[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]}),sl=Sc({name:`user-plus`,size:24,node:[[`path`,{d:`M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`,key:`1yyitq`}],[`circle`,{cx:`9`,cy:`7`,r:`4`,key:`nufk8`}],[`line`,{x1:`19`,x2:`19`,y1:`8`,y2:`14`,key:`1bvyxn`}],[`line`,{x1:`22`,x2:`16`,y1:`11`,y2:`11`,key:`1shjgl`}]]}),cl=Sc({name:`user-round`,size:24,node:[[`circle`,{cx:`12`,cy:`8`,r:`5`,key:`1hypcn`}],[`path`,{d:`M20 21a8 8 0 0 0-16 0`,key:`rfgkzh`}]],aliases:[`user-2`]}),ll=Sc({name:`volume-2`,size:24,node:[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]}),ul=Sc({name:`volume-x`,size:24,node:[[`path`,{d:`M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z`,key:`1p7khw`}],[`path`,{d:`m16.5 14.5 5-5`,key:`cul3yw`}],[`path`,{d:`m16.5 9.5 5 5`,key:`1akey5`}]]}),dl=Sc({name:`wand-sparkles`,size:24,node:[[`path`,{d:`m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72`,key:`ul74o6`}],[`path`,{d:`m14 7 3 3`,key:`1r5n42`}],[`path`,{d:`M5 6v4`,key:`ilb8ba`}],[`path`,{d:`M19 14v4`,key:`blhpug`}],[`path`,{d:`M10 2v2`,key:`7u0qdc`}],[`path`,{d:`M7 8H3`,key:`zfb6yr`}],[`path`,{d:`M21 16h-4`,key:`1cnmox`}],[`path`,{d:`M11 3H9`,key:`1obp7u`}]],aliases:[`wand-2`]}),fl=Sc({name:`wifi`,size:24,node:[[`path`,{d:`M12 20h.01`,key:`zekei9`}],[`path`,{d:`M2 8.82a15 15 0 0 1 20 0`,key:`dnpr2z`}],[`path`,{d:`M5 12.859a10 10 0 0 1 14 0`,key:`1x1e6c`}],[`path`,{d:`M8.5 16.429a5 5 0 0 1 7 0`,key:`1bycff`}]]}),pl=Sc({name:`x`,size:24,node:[[`path`,{d:`M18 6 6 18`,key:`1bl5f8`}],[`path`,{d:`m6 6 12 12`,key:`d8bk6v`}]]});function ml(e,t,n=1,r=100){let i=Math.max(0,1-Math.abs(e)/r)**1.65*n;return`translate(${Math.max(-7,Math.min(7,e*.23))*i}px, ${Math.max(-5,Math.min(3,t*.16))*i-10*i}px) scale(${1+.72*i})`}var hl=[{id:`detect`,label:`视频检测`,group:`regular`,icon:`ScanLine`,kind:`local`},{id:`convert`,label:`视频转换`,group:`regular`,icon:`FileVideo`,kind:`local`},{id:`compress`,label:`视频压缩`,group:`regular`,icon:`Minimize2`,kind:`local`},{id:`audio`,label:`提取音频`,group:`regular`,icon:`AudioLines`,kind:`local`},{id:`trim`,label:`视频裁切`,group:`regular`,icon:`Scissors`,kind:`local`},{id:`join`,label:`片段拼接`,group:`regular`,icon:`ListVideo`,kind:`local`},{id:`mute`,label:`视频静音`,group:`regular`,icon:`VolumeX`,kind:`local`},{id:`subtitle`,label:`字幕处理`,group:`ai`,icon:`Captions`,kind:`mixed`},{id:`ai`,label:`AI 处理`,group:`ai`,icon:`Sparkles`,kind:`mixed`},{id:`find`,label:`找片段`,group:`ai`,icon:`Search`,kind:`cloud`},{id:`history`,label:`处理记录`,group:`history`,icon:`History`,kind:`local`}],gl=[{id:`regular`,label:`常规处理`},{id:`ai`,label:`AI协作处理`},{id:`history`,label:`历史记录`}],_l=[`import`,`edit`,`export`],vl=Object.fromEntries(hl.map(e=>[e.id,e.label])),yl=Object.fromEntries(hl.map(e=>[e.id,e.group]));function bl(e){return hl.some(t=>t.id===e)}function xl(e){return _l.some(t=>t===e)}function Sl(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(1)} GB`}var Cl=(e,t)=>`${(e/1e3).toFixed(3)} 至 ${(t/1e3).toFixed(3)} 秒`;function wl(e){switch(e.operation){case`trim`:return`保留 `+Cl(e.startMs,e.endMs);case`join_clips`:return`选段拼接：`+e.clips.map(e=>Cl(e.startMs,e.endMs)).join(` → `);case`resize`:return`缩放 `+(e.resolutionPreset===`custom`?`${e.width} x ${e.height} 最大边界`:e.resolutionPreset);case`mute`:return`静音`;case`export`:return`导出 ${e.outputFormat.toUpperCase()}${e.videoCodec?` / `+e.videoCodec:``}${e.targetSizeBytes?` / 最多 `+Sl(e.targetSizeBytes):``}${e.extractAudio?` / 另存完整原始音轨 MP3`:``}`}}function Tl(e){if(!e)return[];let t=[[`操作`,{workflow:`顺序处理`,export:`组合导出`,join_clips:`拼接`,transcode:`转换`,compress:`压缩`,trim:`裁切`,mute:`静音`,extract_audio:`提取`,burn_subtitles:`字幕烧录`}[e.operation]],[`格式`,e.outputFormat.toUpperCase()]];return e.operation===`join_clips`&&e.clips&&(e.clips.forEach((e,n)=>t.push([`第 ${n+1} 段`,Cl(e.startMs,e.endMs)])),t.push([`拼接总时长`,(e.clips.reduce((e,t)=>e+t.endMs-t.startMs,0)/1e3).toFixed(3)+` 秒`],[`分辨率`,`原分辨率`])),e.operation===`workflow`&&e.steps?.forEach((e,n)=>t.push([`步骤 ${n+1}`,wl(e)])),e.resolutionPreset&&t.push([`分辨率`,e.resolutionPreset===`source`?`原分辨率`:e.resolutionPreset===`custom`?`${e.width} x ${e.height} 最大边界`:e.resolutionPreset]),e.videoCodec&&t.push([`视频编码`,{h264:`H.264`,hevc:`H.265 / HEVC`,vp9:`VP9`,av1:`AV1`}[e.videoCodec]||e.videoCodec]),e.targetSizeBytes!=null&&t.push([`目标体积`,Sl(e.targetSizeBytes)]),e.startMs!=null&&e.endMs!=null&&t.push([`保留区间`,Cl(e.startMs,e.endMs)]),t.push([`音轨`,e.operation===`mute`||e.audioMode===`mute`||e.steps?.some(e=>e.operation===`mute`)?`全部移除`:e.operation===`extract_audio`||[`mp3`,`m4a`,`wav`,`flac`].includes(e.outputFormat)?`提取第一条音轨`:`保留`]),e.extractAudio&&t.push([`附加文件`,`完整原始音轨 MP3（不受裁切影响）`]),t}var El=new Intl.NumberFormat(`zh-CN`,{maximumFractionDigits:3});function Dl(e){return e==null||!Number.isFinite(e)||e<=0?`未提供`:e>=1e6?El.format(e/1e6)+` Mbps`:El.format(e/1e3)+` kbps`}function Ol(e,t){let n=!e?.bitRate&&e?.durationMs&&t?t*8e3/e.durationMs:null,r=[[`时长`,e?(e.durationMs/1e3).toFixed(2)+` 秒`:`—`],[`文件大小`,t==null?`—`:Sl(t)],[`分辨率`,e?.width&&e.height?e.width+` × `+e.height:`—`],[`封装格式`,e?.container?.toUpperCase()||`—`],[`视频编码`,e?.videoCodec?.toUpperCase()||`—`],[`平均帧率`,e?.frameRate?El.format(e.frameRate)+` fps`:`未提供`],[n?`总码率（估算）`:`总码率`,Dl(e?.bitRate||n)],[`视频码率`,Dl(e?.videoBitRate)],[`像素格式`,e?.pixelFormat||`未提供`],[`音轨`,e?e.hasAudio?e.audioCodec?.toUpperCase()||`有音轨`:`无音轨`:`—`]];if(e?.hasAudio){let t=e.channels?{1:`单声道`,2:`双声道`}[e.channels]||e.channels+` 声道`:`未提供`;r.push([`音频码率`,Dl(e.audioBitRate)],[`采样率`,e.sampleRate?El.format(e.sampleRate/1e3)+` kHz`:`未提供`],[`声道`,e.channelLayout?t+` · `+e.channelLayout:t])}return r}var kl={class:`media-detect`},Al={class:`media-detect-grid`},jl={class:`media-detect-preview`,"aria-labelledby":`media-detect-preview-title`},Ml=[`data-dragging`],Nl=[`src`],Pl={key:1,class:`media-detect-empty`},Fl={class:`media-detect-frame`,"aria-hidden":`true`},Il={key:0},Ll={key:1},Rl={key:2},zl={key:3},Bl={key:4},Vl={key:5},Hl={key:6},Ul=[`disabled`],Wl={class:`media-detect-file-bar`},Gl={class:`media-detect-file`},Kl={class:`media-detect-file-icon`},ql={key:0,class:`media-detect-file-text`},Jl=[`title`],Yl={key:1,class:`media-detect-file-text`},Xl=[`title`],Zl={key:2,class:`media-detect-file-text`},Ql={key:0},$l={key:0,class:`media-detect-actions`},eu=[`disabled`],tu=[`disabled`],nu={key:0,class:`media-detect-message`,role:`alert`},ru={key:1,class:`media-detect-message`,role:`status`},iu={class:`media-detect-inspector`,"aria-labelledby":`media-detect-inspector-title`},au={class:`media-detect-inspector-header`},ou=[`data-status`,`data-busy`,`data-error`],su={class:`media-detect-specs`},cu={class:`media-detect-resolution`},lu={key:0},uu={key:0,class:`media-detect-message`,role:`alert`},du=[`disabled`],fu=[`disabled`],pu=hr({__name:`MediaDetectionPanel`,props:{detection:{},active:{type:Boolean},disabled:{type:Boolean}},setup(e){let t=e,n=ka(()=>t.detection.state),r=e=>t.detection.stageFile(e),i=()=>t.detection.upload(),a=()=>t.detection.retry(),o=()=>t.detection.refresh(),s=U(),c=U(!1),l=U(!1),u=ka(()=>n.value.file??n.value.item),d=ka(()=>n.value.item?.metadata),f=ka(()=>n.value.item?.status===`READY`?n.value.item.previewUrl:null),p=ka(()=>n.value.item?.status===`PROBING`),m=ka(()=>!t.disabled&&n.value.limits?.mediaTool===!0&&n.value.pending!==`upload`),h=ka(()=>m.value&&!n.value.pending),g=ka(()=>n.value.pending===`upload`?`上传中`:n.value.detectionError?`需检查`:p.value?`检测中`:n.value.item?.status===`READY`?`已完成`:n.value.item?.status===`FAILED`?`检测失败`:`等待导入`),_=ka(()=>d.value?.width&&d.value.height?`${d.value.width} × ${d.value.height}`:`—`),v=ka(()=>Ol(d.value,n.value.item?.sizeBytes).filter(([e])=>e!==`分辨率`));Rn([f,()=>t.active],()=>{l.value=!1,c.value=!1});function y(e){let t=e.currentTarget,n=t.files?.[0];n&&m.value&&r(n),t.value=``}function b(e){e.dataTransfer?.types.includes(`Files`)&&(e.dataTransfer.dropEffect=m.value?`copy`:`none`,c.value=m.value)}function x(e){let t=e.currentTarget;e.relatedTarget instanceof Node&&t.contains(e.relatedTarget)||(c.value=!1)}function S(e){c.value=!1;let t=e.dataTransfer?.files[0];t&&m.value&&r(t)}return(t,r)=>(K(),q(`div`,kl,[J(`div`,Al,[J(`section`,jl,[r[7]||=J(`header`,{class:`media-detect-preview-header`},[J(`h2`,{id:`media-detect-preview-title`},`素材预览`),J(`span`,{class:`media-detect-service`},`站点处理 · 无需第三方 API`)],-1),J(`div`,{class:`media-detect-stage`,"data-dragging":c.value,onDragover:rs(b,[`prevent`]),onDragleave:x,onDrop:rs(S,[`prevent`])},[e.active&&f.value&&!l.value?(K(),q(`video`,{key:0,src:f.value,controls:``,playsinline:``,preload:`metadata`,"aria-label":`原视频预览`,onError:r[0]||=e=>l.value=!0},null,40,Nl)):(K(),q(`div`,Pl,[J(`div`,Fl,[n.value.pending===`upload`||p.value?(K(),Gi(W(Wc),{key:0,class:`media-detect-spinner`})):n.value.item?(K(),Gi(W(Qc),{key:1})):(K(),Gi(W(ol),{key:2}))]),n.value.pending===`upload`?(K(),q(`strong`,Il,`正在上传视频`)):p.value?(K(),q(`strong`,Ll,F(n.value.detectionError?`等待刷新检测状态`:`正在检测视频`),1)):l.value?(K(),q(`strong`,Rl,`原视频暂时无法播放`)):n.value.item?.status===`READY`?(K(),q(`strong`,zl,`当前格式无法直接预览`)):n.value.item?.status===`FAILED`?(K(),q(`strong`,Bl,`素材检测失败`)):n.value.file?(K(),q(`strong`,Vl,`视频已选好`)):(K(),q(`strong`,Hl,F(c.value?`松开以选择视频`:`拖入一个视频`),1)),!n.value.item&&!n.value.file?(K(),q(`button`,{key:7,class:`media-detect-pick`,type:`button`,disabled:!m.value,onClick:r[1]||=e=>s.value?.click()},[r[4]||=X(`选择视频 `,-1),Y(W(Ec),{"aria-hidden":`true`})],8,Ul)):ea(``,!0),l.value&&f.value?(K(),q(`button`,{key:8,class:`media-detect-pick`,type:`button`,onClick:r[2]||=e=>l.value=!1},`重新加载预览`)):ea(``,!0)]))],40,Ml),J(`input`,{ref_key:`fileInput`,ref:s,type:`file`,hidden:``,accept:`.mp4,.mov,.mkv,.webm`,onChange:y},null,544),J(`div`,Wl,[J(`div`,Gl,[J(`span`,Kl,[Y(W(zc),{"aria-hidden":`true`})]),n.value.file?(K(),q(`div`,ql,[J(`strong`,{title:n.value.file.name},F(n.value.file.name),9,Jl),J(`small`,null,F(W(Sl)(n.value.file.size))+` · `+F(n.value.pending===`upload`?`上传中`:`待上传`),1)])):n.value.item?(K(),q(`div`,Yl,[J(`strong`,{title:n.value.item.originalFilename},F(n.value.item.originalFilename),9,Xl),J(`small`,null,F(W(Sl)(n.value.item.sizeBytes)),1)])):(K(),q(`div`,Zl,[r[5]||=J(`strong`,null,`MP4 / MOV / MKV / WebM`,-1),n.value.limits?.maxUploadBytes?(K(),q(`small`,Ql,`单个文件最大 `+F(W(Sl)(n.value.limits.maxUploadBytes)),1)):ea(``,!0)]))]),u.value?(K(),q(`div`,$l,[J(`button`,{type:`button`,class:`media-detect-secondary`,disabled:!m.value,onClick:r[3]||=e=>s.value?.click()},`更换视频`,8,eu),n.value.file?(K(),q(`button`,{key:0,type:`button`,class:`media-detect-primary`,disabled:!h.value,onClick:i},F(n.value.pending===`upload`?`上传中…`:`上传并检测`),9,tu)):ea(``,!0)])):ea(``,!0)]),n.value.uploadError?(K(),q(`p`,nu,[Y(W(Mc),{"aria-hidden":`true`}),X(F(n.value.uploadError),1)])):n.value.limits&&!n.value.limits.mediaTool?(K(),q(`p`,ru,[Y(W(Mc),{"aria-hidden":`true`}),r[6]||=X(` 视频检测工具暂不可用。 `,-1)])):ea(``,!0)]),J(`section`,iu,[J(`div`,au,[r[8]||=J(`h2`,{id:`media-detect-inspector-title`},`检测结果`,-1),J(`span`,{class:`media-detect-status`,role:`status`,"data-status":n.value.item?.status,"data-busy":n.value.pending===`upload`||p.value,"data-error":!!n.value.detectionError},F(g.value),9,ou)]),J(`dl`,su,[J(`div`,cu,[r[9]||=J(`dt`,null,`分辨率`,-1),J(`dd`,null,[X(F(_.value),1),_.value===`—`?ea(``,!0):(K(),q(`small`,lu,`px`))])]),(K(!0),q(G,null,Pr(v.value,([e,t])=>(K(),q(`div`,{key:e,class:`media-detect-spec`},[J(`dt`,null,F(e),1),J(`dd`,null,F(t),1)]))),128))]),n.value.detectionError||n.value.item?.error?(K(),q(`p`,uu,[Y(W(Mc),{"aria-hidden":`true`}),X(F(n.value.detectionError||n.value.item?.error?.message),1)])):ea(``,!0),n.value.item?.status===`FAILED`?(K(),q(`button`,{key:1,type:`button`,class:`media-detect-secondary`,disabled:!h.value,onClick:a},[Y(W(Xc),{"aria-hidden":`true`}),r[10]||=X(`重新检测`,-1)],8,du)):p.value&&n.value.detectionError?(K(),q(`button`,{key:2,type:`button`,class:`media-detect-secondary`,disabled:e.disabled||!!n.value.pending,onClick:o},[Y(W(Xc),{"aria-hidden":`true`}),r[11]||=X(`刷新检测状态`,-1)],8,fu)):ea(``,!0)]),r[12]||=J(`div`,{id:`detect-library-slot`,class:`media-detect-library`},null,-1)])]))}}),mu=[`data-preview-stack`,`data-glow-tracking`,`hidden`],hu={class:`workspace-tool-header`},gu={class:`workspace-tool-title`},_u=[`aria-label`],vu=[`id`,`aria-controls`,`aria-selected`,`tabindex`,`disabled`,`onClick`],yu=[`id`,`hidden`],bu=[`id`,`aria-labelledby`,`aria-hidden`,`inert`,`data-depth`],xu={class:`workspace-tool-panel-body`,tabindex:`0`},Su=[`id`],Cu=hr({__name:`WorkbenchToolTabs`,props:{group:{},label:{},visible:{type:Boolean},home:{},navigationDisabled:{type:Boolean}},setup(e){let t=e,n=hl.filter(e=>e.group===t.group),r=Wt(n.map(e=>e.id)),i=ka(()=>r.value[0]),a=ka(()=>n.findIndex(e=>e.id===i.value)),o=U(),s=U(),c=U(),l=Wt({left:0,width:0}),u=Wt([]),d=U(!1),f=U(!1),p=matchMedia(`(prefers-reduced-motion: reduce)`),m,h=0;function g(){return[...o.value?.querySelectorAll(`[role="tab"]`)??[]]}function _(){let e=g()[a.value];e?.offsetWidth&&(l.value={left:e.offsetLeft,width:e.offsetWidth})}function v(){u.value=[]}function y(e){e.pointerType===`mouse`&&(d.value=!0)}function b(){d.value=!1,v()}function x(e){e.pointerType!==`mouse`||p.matches||(u.value=g().map(t=>{let{left:n,top:r,width:i,height:a}=t.getBoundingClientRect();return ml(e.clientX-n-i/2,e.clientY-r-a/2,.44,144)}))}function S(){m&&!h&&(h=requestAnimationFrame(C))}function C(){if(h=0,!m||!s.value)return;let e=d.value?`.workspace-tool-panel:is([data-depth="0"], [data-depth="1"], [data-depth="2"])`:`.workspace-tool-panel[data-depth="0"]`,t=s.value.querySelectorAll(e);for(let e of t){let t=e.querySelector(`.workspace-tool-glow`);if(!t)continue;let{left:n,top:r,width:i,height:a}=e.getBoundingClientRect();if(!i||!a)continue;let o=(m.clientX-n)/i*100,s=(m.clientY-r)/a*100;t.style.setProperty(`--workspace-glow-x`,`${o}%`),t.style.setProperty(`--workspace-glow-y`,`${d.value?Math.max(0,s):s}%`)}f.value=!0}function w(e){e.pointerType!==`mouse`||p.matches||(m=e,S())}function T(){m=void 0,f.value=!1,cancelAnimationFrame(h),h=0}function E(e){return r.value.indexOf(e)}function D(e){if(t.navigationDisabled||![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;e.preventDefault(),v();let r=e.key===`ArrowLeft`?-1:1,i=e.key===`Home`?0:e.key===`End`?n.length-1:(a.value+r+n.length)%n.length;t.home.openTool(n[i].id),g()[i].focus()}let O=new ResizeObserver(_);return Rn(()=>t.home.tool,e=>{yl[e]===t.group&&e!==i.value&&(r.value=[e,...r.value.filter(t=>t!==e)])},{immediate:!0}),Rn([i,()=>t.visible],([,e])=>{if(!e){b(),T();return}if(_(),i.value!==`detect`&&i.value!==`history`&&!p.matches){for(let e of c.value?.getAnimations()??[])e.cancel();c.value?.animate([{opacity:0,transform:`translateY(-8px) scaleY(.85)`},{opacity:1,transform:`translateY(0) scaleY(1)`}],{duration:240,easing:`cubic-bezier(.2,.8,.2,1)`})}let t=s.value?.querySelector(`.workspace-tool-panel[data-depth="0"]`);for(let e of t?.querySelectorAll(`.workspace-tool-panel-body, .editor-inspector, .editor-controls`)??[])e.scrollTo({top:0});S()},{flush:`post`}),Er(()=>{for(let e of g())O.observe(e);_(),p.addEventListener(`change`,v),p.addEventListener(`change`,T)}),Or(()=>{O.disconnect(),T(),p.removeEventListener(`change`,v),p.removeEventListener(`change`,T)}),(t,r)=>(K(),q(`div`,{class:`workspace-tool-tabs`,"data-preview-stack":d.value,"data-glow-tracking":f.value,hidden:!e.visible,onPointermovePassive:w,onPointerleave:T,onPointercancel:T,onScrollCapturePassive:S},[J(`div`,hu,[J(`div`,{class:`workspace-tool-nav`,onPointerenter:y,onPointerleave:b,onPointercancel:b},[J(`h1`,gu,F(e.label),1),J(`div`,{class:`workspace-tool-tab-scroll`,onScroll:v},[J(`div`,{ref_key:`tabList`,ref:o,class:`workspace-tool-tab-list`,role:`tablist`,"aria-label":`${e.label}子功能`,onKeydown:D,onPointermove:x},[J(`span`,{class:`workspace-tool-tab-indicator`,"aria-hidden":`true`,style:ce({translate:`${l.value.left}px 0`,width:`${l.value.width}px`})},[J(`span`,{style:ce({transform:u.value[a.value]})},null,4)],4),(K(!0),q(G,null,Pr(W(n),(t,n)=>(K(),q(`button`,{id:`workspace-tool-tab-${t.id}`,key:t.id,type:`button`,class:`workspace-tool-tab`,role:`tab`,"aria-controls":`workspace-tool-panel-${t.id}`,"aria-selected":t.id===i.value,tabindex:t.id===i.value?0:-1,disabled:e.navigationDisabled,onClick:n=>e.home.openTool(t.id)},[J(`span`,{style:ce({transform:u.value[n]})},F(t.label),5)],8,vu))),128))],40,_u)],32)],32),J(`div`,{ref_key:`subnav`,ref:c,id:`workspace-subnav-${e.group}`,class:`workspace-subnav`,hidden:i.value===`detect`||i.value===`history`},null,8,yu)]),J(`div`,{ref_key:`toolStack`,ref:s,class:`workspace-tool-stack`},[(K(!0),q(G,null,Pr(W(n),t=>(K(),q(`section`,{id:`workspace-tool-panel-${t.id}`,key:t.id,class:pe([`workspace-tool-panel`,{"workspace-detection-panel":t.id===`detect`}]),role:`tabpanel`,"aria-labelledby":`workspace-tool-tab-${t.id}`,"aria-hidden":t.id!==i.value,inert:t.id!==i.value,"data-depth":E(t.id),style:ce({"--workspace-card-depth":E(t.id)})},[r[0]||=J(`span`,{class:`workspace-tool-glow`,"aria-hidden":`true`},null,-1),J(`div`,xu,[t.id===`detect`?(K(),Gi(pu,{key:0,detection:e.home.detection,active:e.visible&&i.value===t.id,disabled:e.home.busy},null,8,[`detection`,`active`,`disabled`])):ea(``,!0),J(`div`,{id:`workspace-tool-surface-${t.id}`,class:`workspace-tool-surface`},null,8,Su)])],14,bu))),128))],512)],40,mu))}}),wu={class:`workspace-home`},Tu=[`data-expanded`,`onKeydown`],Eu=[`aria-label`,`aria-expanded`],Du={id:`workspace-home-nav`,class:`workspace-home-nav`,"aria-label":`工作台导航`},Ou=[`aria-label`,`aria-current`,`disabled`,`onClick`],ku={class:`workspace-home-icon`},Au={class:`workspace-home-label`,"aria-hidden":`true`},ju={class:`workspace-home-account-actions`},Mu=[`aria-current`,`disabled`],Nu={class:`workspace-home-icon`},Pu=[`aria-current`,`disabled`],Fu={class:`workspace-home-icon`},Iu=[`disabled`],Lu={class:`workspace-home-icon`},Ru={class:`workspace-home-identity`},zu={class:`workspace-home-avatar`,"aria-hidden":`true`},Bu={class:`workspace-home-label`},Vu=[`hidden`],Hu=hr({__name:`WorkbenchHomeScreen`,props:{home:{}},setup(e){let t=e,n=U(!1),r=U(),i=U(),a=ka(()=>Array.from(t.home.userName.trim())[0]?.toUpperCase()||`F`),o={regular:rl,ai:il,history:Yc},s=ka(()=>gl.find(e=>e.id===t.home.section)),c=ka(()=>t.home.busy||t.home.detection.state.pending===`upload`||t.home.detection.state.pending===`retry`);Rn([()=>t.home.section,()=>t.home.tool],()=>i.value?.scrollTo({top:0}),{flush:`post`});function l(e){e.pointerType===`mouse`&&(n.value=!0)}function u(e){e.target instanceof HTMLElement&&e.target!==r.value&&e.target.matches(`:focus-visible`)&&(n.value=!0)}function d(e){let t=e.currentTarget;t instanceof HTMLElement&&!t.matches(`:hover`)&&!(e.relatedTarget instanceof Node&&t.contains(e.relatedTarget))&&(n.value=!1)}function f(){n.value=!1,r.value?.focus()}function p(e){c.value||(t.home.open(e),matchMedia(`(hover: none)`).matches&&(n.value=!1))}return(t,m)=>(K(),q(`div`,wu,[J(`aside`,{id:`workspace-home-sidebar`,class:`workspace-home-sidebar`,"data-expanded":n.value,onPointerenter:l,onPointerleave:m[4]||=e=>n.value=!1,onFocusin:u,onFocusout:d,onKeydown:as(rs(f,[`prevent`]),[`esc`])},[J(`button`,{ref_key:`toggle`,ref:r,type:`button`,class:`workspace-home-logo workspace-home-link`,"aria-label":n.value?`收起侧栏`:`展开侧栏`,"aria-expanded":n.value,"aria-controls":`workspace-home-nav`,onClick:m[0]||=e=>n.value=!n.value},[...m[5]||=[J(`span`,{class:`workspace-home-mark`,"aria-hidden":`true`},null,-1),J(`span`,{class:`workspace-home-label`,"aria-hidden":`true`},`FrameFlow`,-1)]],8,Eu),J(`nav`,Du,[(K(!0),q(G,null,Pr(W(gl),t=>(K(),q(`button`,{key:t.id,type:`button`,class:`workspace-home-link`,"aria-label":t.label,"aria-controls":`workspace-home-overview`,"aria-current":e.home.section===t.id?`page`:void 0,disabled:c.value,onClick:e=>p(t.id)},[J(`span`,ku,[(K(),Gi(jr(o[t.id]),{"aria-hidden":`true`}))]),J(`span`,Au,F(t.label),1)],8,Ou))),128))]),J(`div`,ju,[J(`button`,{type:`button`,class:`workspace-home-link`,"aria-label":`个人资料`,"aria-controls":`account-panel`,"aria-current":e.home.section===`profile`?`page`:void 0,disabled:c.value,onClick:m[1]||=e=>p(`profile`)},[J(`span`,Nu,[Y(W(cl),{"aria-hidden":`true`})]),m[6]||=J(`span`,{class:`workspace-home-label`,"aria-hidden":`true`},`个人资料`,-1)],8,Mu),J(`button`,{type:`button`,class:`workspace-home-link`,"aria-label":`设置`,"aria-controls":`account-panel`,"aria-current":e.home.section===`settings`?`page`:void 0,disabled:c.value,onClick:m[2]||=e=>p(`settings`)},[J(`span`,Fu,[Y(W(tl),{"aria-hidden":`true`})]),m[7]||=J(`span`,{class:`workspace-home-label`,"aria-hidden":`true`},`设置`,-1)],8,Pu),J(`button`,{type:`button`,class:`workspace-home-link`,"aria-label":`退出登录`,disabled:e.home.busy,onClick:m[3]||=t=>e.home.logout()},[J(`span`,Lu,[Y(W(Tc),{"aria-hidden":`true`})]),m[8]||=J(`span`,{class:`workspace-home-label`,"aria-hidden":`true`},`退出登录`,-1)],8,Iu),J(`div`,Ru,[J(`span`,zu,F(a.value),1),J(`span`,Bu,F(e.home.userName),1)])])],40,Tu),J(`div`,{ref_key:`content`,ref:i,class:`workspace-home-content`},[Fr(t.$slots,`default`),J(`section`,{id:`workspace-home-overview`,class:`workspace-home-overview`,"aria-label":`工作台主界面`,hidden:!s.value},[(K(!0),q(G,null,Pr(W(gl),t=>(K(),Gi(Cu,{key:t.id,group:t.id,label:t.label,visible:s.value?.id===t.id,home:e.home,"navigation-disabled":c.value},null,8,[`group`,`label`,`visible`,`home`,`navigation-disabled`]))),128))],8,Vu)],512)]))}}),Uu={id:`account-view`,class:`account-shell workspace-home-account`,hidden:``},Wu=hr({__name:`AccountArea`,props:{home:{}},setup(e){return(t,n)=>(K(),q(`section`,Uu,[Y(Hu,{home:e.home},{default:jn(()=>[Y(hs)]),_:1},8,[`home`]),Y(dc,{home:e.home},null,8,[`home`])]))}}),Gu=[{src:`/assets/auth/gallery/mountain-ridges.webp`,alt:`雾中的蓝色山脊`},{src:`/assets/auth/gallery/turquoise-surf.webp`,alt:`在沙滩上涌起白沫的碧蓝海浪`},{src:`/assets/auth/gallery/sunset-meadow.webp`,alt:`日落时的草地和树木`},{src:`/assets/auth/gallery/forest-path.webp`,alt:`阳光穿过树林照亮小径`},{src:`/assets/auth/gallery/aerial-shore.webp`,alt:`从空中俯瞰海浪与沙滩`}],Ku=1280,qu=.72,Ju=1280,Yu=26,Xu=(e,t,n)=>Math.max(t,Math.min(n,e)),Zu=e=>({x:e.clientX,y:e.clientY,time:e.timeStamp});function Qu(e,t){let n=new Map,r={x:0,y:0},i,a,o=0;function s(){for(let[e,t]of n)t.cancel(),e.remove();n.clear()}t.addEventListener(`change`,()=>{t.matches&&s()});function c(t,r){let{clientWidth:i,clientHeight:a}=e;if(!i||!a||t.x<0||t.x>i||t.y<0||t.y>a)return;if(n.size>=Yu){let e=n.keys().next().value;n.get(e)?.cancel(),n.delete(e),e.remove()}let s=Xu(i*.104,68,130),c=s*1.25,l=Math.hypot(r.x,r.y)*qu,u=qu/Math.hypot(1,l/Ju),d=r.x*u,f=r.y*u,p=(Math.random()-.5)*41,m=d*.1+(Math.random()-.5)*95,h=a-t.y+c,g=(Math.sqrt(f*f+2*Ku*h)-f)/Ku,_=new Image;_.src=Gu[o].src,o=(o+1)%Gu.length,_.alt=``,_.decoding=`async`,_.draggable=!1,_.style.left=`${t.x-s/2}px`,_.style.top=`${t.y-c/2}px`,_.style.width=`${s}px`,_.style.height=`${c}px`,e.append(_);let v=Math.ceil(g*24),y=Array.from({length:v+1},(e,t)=>{let n=g*t/v;return{transform:`translate3d(${d*n}px, ${f*n+Ku*n*n/2}px, 0) rotate(${p+m*n}deg)`}}),b=_.animate(y,{duration:g*1e3,fill:`backwards`});n.set(_,b),b.onfinish=()=>{n.delete(_),_.remove()}}return{start(e){i=Zu(e),a=void 0,r.x=r.y=0},move(e){if(t.matches||!i)return;let n=Zu(e),o=n.x-i.x,s=n.y-i.y;if(Math.hypot(o,s)<1)return;let l=Math.max(6,n.time-i.time),u=1-Math.exp(-l/18);if(r.x+=(o*1e3/l-r.x)*u,r.y+=(s*1e3/l-r.y)*u,i=n,a){let e=n.time-a.time,t=Math.hypot(n.x-a.x,n.y-a.y);if(e<44||e<96&&t<32)return}c(n,r),a=n},end(){i=void 0,a=void 0}}}var $u=`amw-auth-theme-split`,ed=`(max-width: 600px), (pointer: coarse) and (max-height: 600px)`;function td(e){let t=e.querySelector(`.auth-theme-slider`),n=t.querySelector(`.auth-dock-tile`),r=t.querySelector(`.auth-theme-follower`),i=r.querySelector(`#auth-theme-hint`),a=matchMedia(`(prefers-reduced-motion: reduce)`),o=matchMedia(ed),s=Qu(e.querySelector(`.auth-theme-gravity`),a),c=CSS.supports(`backdrop-filter`,`invert(1)`)||CSS.supports(`-webkit-backdrop-filter`,`invert(1)`),l=f(),u=l,d=null;function f(){try{let e=localStorage.getItem($u);if(e?.trim()){let t=Number(e);if(Number.isFinite(t)&&t>=0&&t<=100)return t}}catch{}return 100}function p(){l=u;try{localStorage.setItem($u,String(u))}catch{}}function m(n){u=Math.max(0,Math.min(100,Math.round(n*10)/10)),e.style.setProperty(`--auth-theme-split`,`${u}%`),t.setAttribute(`aria-valuenow`,String(Math.round(u))),t.setAttribute(`aria-valuetext`,u===0?`全暗色`:u===100?`全亮色`:`左侧亮色 ${Math.round(u)}%，右侧暗色`),t.matches(`:focus-visible`)&&!d&&_(),e.dataset.theme=(!c||o.matches)&&u<50?`dark`:`light`}function h(t){if(t.pointerId!==d?.id)return;let n=e.clientWidth;n&&(t.clientX<=4?m(0):t.clientX>=n-4?m(100):m(d.startPosition+(t.clientX-d.startX)/n*100))}function g(e,t,n){r.style.transform=`translate(${t-e.left}px, ${n-e.top}px)`,r.classList.toggle(`is-right`,t+i.offsetWidth+24>document.documentElement.clientWidth),r.classList.toggle(`is-below`,n<64)}function _(){let e=t.getBoundingClientRect();g(e,e.left+e.width/2,e.top+e.height/2)}function v(){t.classList.remove(`is-hovering`),n.style.removeProperty(`transform`),t.matches(`:focus-visible`)&&_()}function y(e){if(e.pointerType!==`mouse`||d)return;let r=t.getBoundingClientRect(),{clientX:i,clientY:o}=e;if(!(i<r.left||i>r.right||o<r.top||o>r.bottom)){if(t.classList.add(`is-hovering`),!a.matches){let e=i-r.left-r.width/2,t=o-r.top-r.height/2;n.style.transform=ml(e,t)}g(r,i,o)}}t.addEventListener(`focus`,_),t.addEventListener(`pointerenter`,y),t.addEventListener(`pointerleave`,v),a.addEventListener(`change`,()=>n.style.removeProperty(`transform`)),t.addEventListener(`pointerdown`,e=>{e.button!==0||d||(e.pointerType===`mouse`&&e.preventDefault(),d={id:e.pointerId,startX:e.clientX,startPosition:u},t.setPointerCapture(e.pointerId),t.classList.add(`is-dragging`),v(),s.start(e))}),t.addEventListener(`pointermove`,e=>{d?e.pointerId===d.id&&(h(e),s.move(e)):y(e)}),t.addEventListener(`pointerup`,e=>{e.pointerId===d?.id&&(h(e),d=null,s.end(),t.classList.remove(`is-dragging`),p(),y(e))});function b(e){e.pointerId===d?.id&&(d=null,s.end(),t.classList.remove(`is-dragging`),m(l))}return t.addEventListener(`pointercancel`,b),t.addEventListener(`lostpointercapture`,b),t.addEventListener(`keydown`,e=>{let t;switch(e.key){case`ArrowLeft`:case`ArrowDown`:t=u-5;break;case`ArrowRight`:case`ArrowUp`:t=u+5;break;case`Home`:t=0;break;case`End`:t=100;break;default:return}e.preventDefault(),m(t),p()}),m(l),o.addEventListener(`change`,()=>m(u)),window.addEventListener(`storage`,e=>{(e.key===$u||e.key===null)&&(l=f(),d||m(l))}),()=>{let e=d?.id;d=null,e!==void 0&&t.hasPointerCapture(e)&&t.releasePointerCapture(e),s.end(),t.classList.remove(`is-dragging`),v(),m(l)}}var nd=[`id`],rd=[`href`,`startOffset`],id=[`from`,`to`],ad=`Welcome to FrameFlow`,od=130,sd=hr({__name:`AuthCornerWelcome`,setup(e){let t=gr(),n=[-1,0,1,2,3,4,5].map(e=>e*135),r=U(null),i=U(!1),a;return Er(()=>{let e=r.value;if(!e)return;let t=e.closest(`#auth-view`),n=t?.querySelector(`.auth-phone`),o=e.querySelector(`path`);if(!t||!n||!o)return;let{width:s,height:c}=e.viewBox.baseVal,l=o.getTotalLength(),u=Array.from({length:121},(e,t)=>o.getPointAtLength(l*t/120)).filter(e=>e.x>=-16&&e.y<=c+16),d=matchMedia(`(prefers-reduced-motion: reduce)`),f=!1;function p(){let r=t.getBoundingClientRect(),i=n.getBoundingClientRect();if(!r.width||!i.width)return;let a=Math.max(0,r.right-i.right-10),o=Math.max(0,r.bottom-i.bottom-10),l=r.width/s;for(let e of u){let t=Math.max(1,s-e.x+16),n=Math.max(1,c-e.y+16);l=Math.min(l,Math.max(a/t,o/n))}e.style.setProperty(`--auth-corner-width`,`${Math.floor(l*s)}px`)}function m(){i.value=f&&!document.hidden&&!d.matches}let h=new IntersectionObserver(([e])=>{f=e.isIntersecting,m()});h.observe(e);let g=new ResizeObserver(p);g.observe(t),g.observe(n),p(),window.addEventListener(`resize`,p),d.addEventListener(`change`,m),document.addEventListener(`visibilitychange`,m),a=()=>{h.disconnect(),g.disconnect(),window.removeEventListener(`resize`,p),d.removeEventListener(`change`,m),document.removeEventListener(`visibilitychange`,m)}}),Or(()=>a?.()),(e,a)=>(K(),q(`svg`,{ref_key:`drawing`,ref:r,class:`auth-corner-welcome`,viewBox:`0 0 296 158`,preserveAspectRatio:`xMaxYMax meet`,"aria-hidden":`true`},[J(`defs`,null,[J(`path`,{id:W(t),d:`M -52 176 H -10 C 27 176 64 155 100 132 C 151 100 184 82 164 53 C 148 30 113 38 112 67 C 111 99 150 121 197 108 C 246 95 286 55 296 18`},null,8,nd)]),(K(!0),q(G,null,Pr(W(n),e=>(K(),q(`text`,{key:e,"font-size":`14`,textLength:od,lengthAdjust:`spacingAndGlyphs`},[J(`textPath`,{href:`#${W(t)}`,startOffset:e},[X(F(ad)+` `),i.value?(K(),q(`animate`,{key:0,attributeName:`startOffset`,from:e,to:e+135,dur:`14s`,repeatCount:`indefinite`},null,8,id)):ea(``,!0)],8,rd)]))),128))],512))}}),cd=hr({__name:`AuthCubesGrid`,setup(e){let t=U(null),n;return Er(()=>{let e=t.value,r=e?.getContext(`2d`),i=e?.closest(`#auth-view`);if(!e||!r||!i)return;let a=e,o=r,s=i,c=matchMedia(`(prefers-reduced-motion: reduce)`),l=CSS.supports(`backdrop-filter`,`invert(1)`)||CSS.supports(`-webkit-backdrop-filter`,`invert(1)`),u=[],d=1/120,f=0,p=0,m=150,h=0,g=0,_=0,v,y=!1;function b(){o.fillStyle=`#efedeb`,o.fillRect(0,0,f,p);let e=m*.49,t=m*.279;for(let n of u){let{x:r,depth:i}=n,a=n.y+Math.max(-m*.31,Math.min(m*1.12,i)),s=n.y+m*1.45;if(a-t>p||s+t<0)continue;let c=Math.round(Math.min(23,Math.max(0,i)*.22)),l=o.createLinearGradient(0,a,0,a+m*.9);l.addColorStop(0,`rgb(${205-c}, ${201-c}, ${197-c})`),l.addColorStop(1,`#e8e6e3`),o.fillStyle=l,o.beginPath(),o.moveTo(r-e,a),o.lineTo(r,a+t),o.lineTo(r+e,a),o.lineTo(r+e,s),o.lineTo(r,s+t),o.lineTo(r-e,s),o.closePath(),o.fill(),o.fillStyle=`#574f4617`,o.beginPath(),o.moveTo(r,a+t),o.lineTo(r+e,a),o.lineTo(r+e,s),o.lineTo(r,s+t),o.closePath(),o.fill(),o.fillStyle=`rgb(${246-c}, ${245-c}, ${244-c})`,o.beginPath(),o.moveTo(r,a-t),o.lineTo(r+e,a),o.lineTo(r,a+t),o.lineTo(r-e,a),o.closePath(),o.fill()}}function x(){let e=!1;for(let e of u){let t=0;for(let n of e.neighbors)t+=n.depth-e.depth;e.velocity+=(t*34-e.depth*23-e.velocity*5.1)*d}for(let t of u)t.depth+=t.velocity*d,e||=Math.abs(t.depth)>.23||Math.abs(t.velocity)>.8;return e}function S(e){h=0,_+=g?Math.min((e-g)/1e3,.035):d,g=e;let t=!0;for(;_>=d;)t=x(),_-=d;if(t)h=requestAnimationFrame(S);else{for(let e of u)e.depth=e.velocity=0;g=_=0}b()}function C(){cancelAnimationFrame(h),h=g=_=0,v=void 0;for(let e of u)e.depth=e.velocity=0}function w(){if(!y)return;let e=a.clientWidth,t=a.clientHeight;if(!e||!t||e===f&&t===p)return;C(),f=e,p=t,m=Math.min(164,Math.max(96,f*.106));let n=m/2,r=m*.285,i=Math.min(devicePixelRatio||1,1.4,Math.sqrt(24e5/(f*p)));a.width=Math.round(f*i),a.height=Math.round(p*i),o.setTransform(a.width/f,0,0,a.height/p,0,0);let s=[],c=Math.ceil(f/n)+5,l=Math.ceil(p/r)+12;u.length=0;for(let e=0;e<l;e++){let t=[];s.push(t);for(let i=e%2;i<c;i+=2){let a={x:(i-2)*n,y:(e-6)*r,depth:0,velocity:0,neighbors:[]};for(let t of[s[e-1]?.[i-1],s[e-1]?.[i+1]])t&&(a.neighbors.push(t),t.neighbors.push(a));u.push(a),t[i]=a}}b()}function T(e,t,n){let r=m*.81;for(let i of u){let a=i.x-e,o=(i.y-t)*1.46,s=1-(a*a+o*o)/(r*r);if(s<=0)continue;let c=n*s**2-i.depth;c<=0||(i.depth+=c*.68,i.velocity=Math.max(i.velocity,c*4.3))}}function E(e){if(!y||document.hidden||c.matches||e.pointerType===`touch`||s.hidden||s.inert||s.dataset.theme===`dark`)return;let t=Number.parseFloat(s.style.getPropertyValue(`--auth-theme-split`)),n=l&&Number.isFinite(t)?f*t/100:f,r={x:e.clientX,y:e.clientY,time:e.timeStamp};if(r.x<0||r.x>=n||r.y<0||r.y>=p){v=void 0;return}let i=v;v=r;let a=i?r.time-i.time:1/0;if(!i||a>145)T(r.x,r.y,m*.12);else{let e=r.x-i.x,t=r.y-i.y,n=Math.hypot(e,t);if(n<1)return;let o=n/Math.max(5,a),s=m*(.1+.94*(1-Math.exp(-o/1.28))),c=Math.min(16,Math.ceil(n/(m*.16)));for(let n=1;n<=c;n++)T(i.x+e*n/c,i.y+t*n/c,s)}h||=requestAnimationFrame(S)}function D(){C(),y&&!document.hidden&&b()}let O=new IntersectionObserver(([e])=>{y=e.isIntersecting,y?f===a.clientWidth&&p===a.clientHeight?b():w():C()}),k=new ResizeObserver(w);O.observe(a),k.observe(a),window.addEventListener(`pointermove`,E,{passive:!0}),c.addEventListener(`change`,D),document.addEventListener(`visibilitychange`,D),n=()=>{C(),O.disconnect(),k.disconnect(),window.removeEventListener(`pointermove`,E),c.removeEventListener(`change`,D),document.removeEventListener(`visibilitychange`,D)}}),Or(()=>n?.()),(e,n)=>(K(),q(`canvas`,{ref_key:`surface`,ref:t,class:`auth-cubes-grid`,"aria-hidden":`true`},null,512))}}),ld=1e3,ud=1001,dd=1002,fd=1003,pd=1004,md=1005,hd=1006,gd=1007,_d=1008,vd=1009,yd=1010,bd=1011,xd=1012,Sd=1013,Cd=1014,wd=1015,Td=1016,Ed=1017,Dd=1018,Od=1020,kd=35902,Ad=35899,jd=1021,Md=1022,Nd=1023,Pd=1026,Fd=1027,Id=1028,Ld=1029,Rd=1030,zd=1031,Bd=1033,Vd=33776,Hd=33777,Ud=33778,Wd=33779,Gd=35840,Kd=35841,qd=35842,Jd=35843,Yd=36196,Xd=37492,Zd=37496,Qd=37488,$d=37489,ef=37490,tf=37491,nf=37808,rf=37809,af=37810,of=37811,sf=37812,cf=37813,lf=37814,uf=37815,df=37816,ff=37817,pf=37818,mf=37819,hf=37820,gf=37821,_f=36492,vf=36494,yf=36495,bf=36283,xf=36284,Sf=36285,Cf=36286,wf=2300,Tf=2301,Ef=2302,Df=2303,Of=2400,kf=2401,Af=2402,jf=3200,Mf=`srgb`,Nf=`srgb-linear`,Pf=`linear`,Ff=`srgb`,If=7680,Lf=35044,Rf=2e3;function zf(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Bf(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Vf(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Hf(){let e=Vf(`canvas`);return e.style.display=`block`,e}var Uf={};function Wf(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Gf(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function Kf(...e){e=Gf(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function qf(...e){e=Gf(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Jf(...e){let t=e.join(` `);t in Uf||(Uf[t]=!0,Kf(...e))}function Yf(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Xf={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},Zf=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Qf=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),$f=Math.PI/180,ep=180/Math.PI;function tp(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Qf[e&255]+Qf[e>>8&255]+Qf[e>>16&255]+Qf[e>>24&255]+`-`+Qf[t&255]+Qf[t>>8&255]+`-`+Qf[t>>16&15|64]+Qf[t>>24&255]+`-`+Qf[n&63|128]+Qf[n>>8&255]+`-`+Qf[n>>16&255]+Qf[n>>24&255]+Qf[r&255]+Qf[r>>8&255]+Qf[r>>16&255]+Qf[r>>24&255]).toLowerCase()}function np(e,t,n){return Math.max(t,Math.min(n,e))}function rp(e,t){return(e%t+t)%t}function ip(e,t,n){return(1-n)*e+n*t}function ap(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function op(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function sp(e,t){if(t.constructor===Float32Array)return e;let n=op(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function cp(e,t){if(t.constructor===Float32Array)return e;let n=op(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var lp=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=np(this.x,e.x,t.x),this.y=np(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=np(this.x,e,t),this.y=np(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(np(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(np(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},up=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:Kf(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(np(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Z=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(fp.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(fp.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=np(this.x,e.x,t.x),this.y=np(this.y,e.y,t.y),this.z=np(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=np(this.x,e,t),this.y=np(this.y,e,t),this.z=np(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(np(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return dp.copy(this).projectOnVector(e),this.sub(dp)}reflect(e){return this.sub(dp.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(np(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},dp=new Z,fp=new up,pp=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Jf(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(mp.makeScale(e,t)),this}rotate(e){return Jf(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(mp.makeRotation(-e)),this}translate(e,t){return Jf(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(mp.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},mp=new pp,hp=new pp().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),gp=new pp().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function _p(){let e={enabled:!0,workingColorSpace:Nf,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=yp(e.r),e.g=yp(e.g),e.b=yp(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=bp(e.r),e.g=bp(e.g),e.b=bp(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Pf:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Nf]:{primaries:t,whitePoint:r,transfer:Pf,toXYZ:hp,fromXYZ:gp,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Mf},outputColorSpaceConfig:{drawingBufferColorSpace:Mf}},[Mf]:{primaries:t,whitePoint:r,transfer:Ff,toXYZ:hp,fromXYZ:gp,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Mf}}}),e}var vp=_p();function yp(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function bp(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var xp,Sp=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{xp===void 0&&(xp=Vf(`canvas`)),xp.width=e.width,xp.height=e.height;let t=xp.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=xp}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Vf(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=yp(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(yp(t[e]/255)*255):t[e]=yp(t[e]);return{data:t,width:e.width,height:e.height}}return Kf(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Cp=0,wp=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Cp++}),this.uuid=tp(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Tp(r[t].image)):e.push(Tp(r[t]))}else e=Tp(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Tp(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Sp.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(Kf(`Texture: Unable to serialize Texture.`),{})}var Ep=0,Dp=new Z,Op=class e extends Zf{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=ud,i=ud,a=hd,o=_d,s=Nd,c=vd,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ep++}),this.uuid=tp(),this.name=``,this.source=new wp(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new lp(0,0),this.repeat=new lp(1,1),this.center=new lp(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new pp,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Dp).x}get height(){return this.source.getSize(Dp).y}get depth(){return this.source.getSize(Dp).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Kf(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?Kf(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ld:e.x-=Math.floor(e.x);break;case ud:e.x=e.x<0?0:1;break;case dd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case ld:e.y-=Math.floor(e.y);break;case ud:e.y=e.y<0?0:1;break;case dd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Op.DEFAULT_IMAGE=null,Op.DEFAULT_MAPPING=300,Op.DEFAULT_ANISOTROPY=1;var kp=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=np(this.x,e.x,t.x),this.y=np(this.y,e.y,t.y),this.z=np(this.z,e.z,t.z),this.w=np(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=np(this.x,e,t),this.y=np(this.y,e,t),this.z=np(this.z,e,t),this.w=np(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(np(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ap=class extends Zf{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:hd,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new kp(0,0,e,t),this.scissorTest=!1,this.viewport=new kp(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new Op({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:hd,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new wp(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},jp=class extends Ap{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Mp=class extends Op{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=fd,this.minFilter=fd,this.wrapR=ud,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Np=class extends Op{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=fd,this.minFilter=fd,this.wrapR=ud,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Pp=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Fp.setFromMatrixColumn(e,0).length(),i=1/Fp.setFromMatrixColumn(e,1).length(),a=1/Fp.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Lp,e,Rp)}lookAt(e,t,n){let r=this.elements;return Vp.subVectors(e,t),Vp.lengthSq()===0&&(Vp.z=1),Vp.normalize(),zp.crossVectors(n,Vp),zp.lengthSq()===0&&(Math.abs(n.z)===1?Vp.x+=1e-4:Vp.z+=1e-4,Vp.normalize(),zp.crossVectors(n,Vp)),zp.normalize(),Bp.crossVectors(Vp,zp),r[0]=zp.x,r[4]=Bp.x,r[8]=Vp.x,r[1]=zp.y,r[5]=Bp.y,r[9]=Vp.y,r[2]=zp.z,r[6]=Bp.z,r[10]=Vp.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],N=r[11],P=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*N,i[12]=a*w+o*O+s*ee+c*P,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*N,i[13]=l*w+u*O+d*ee+f*P,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*N,i[14]=p*w+m*O+h*ee+g*P,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*N,i[15]=_*w+v*O+y*ee+b*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Fp.set(r[0],r[1],r[2]).length(),o=Fp.set(r[4],r[5],r[6]).length(),s=Fp.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Ip.copy(this);let c=1/a,l=1/o,u=1/s;return Ip.elements[0]*=c,Ip.elements[1]*=c,Ip.elements[2]*=c,Ip.elements[4]*=l,Ip.elements[5]*=l,Ip.elements[6]*=l,Ip.elements[8]*=u,Ip.elements[9]*=u,Ip.elements[10]*=u,t.setFromRotationMatrix(Ip),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Rf,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Rf,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Fp=new Z,Ip=new Pp,Lp=new Z(0,0,0),Rp=new Z(1,1,1),zp=new Z,Bp=new Z,Vp=new Z,Hp=new Pp,Up=new up,Wp=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(np(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-np(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(np(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-np(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(np(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-np(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:Kf(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Hp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Hp,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Up.setFromEuler(this),this.setFromQuaternion(Up,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wp.DEFAULT_ORDER=`XYZ`;var Gp=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Kp=0,qp=new Z,Jp=new up,Yp=new Pp,Xp=new Z,Zp=new Z,Qp=new Z,$p=new up,em=new Z(1,0,0),tm=new Z(0,1,0),nm=new Z(0,0,1),rm={type:`added`},im={type:`removed`},am={type:`childadded`,child:null},om={type:`childremoved`,child:null},sm=class e extends Zf{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Kp++}),this.uuid=tp(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new Z,n=new Wp,r=new up,i=new Z(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Pp},normalMatrix:{value:new pp}}),this.matrix=new Pp,this.matrixWorld=new Pp,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Gp,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Jp.setFromAxisAngle(e,t),this.quaternion.multiply(Jp),this}rotateOnWorldAxis(e,t){return Jp.setFromAxisAngle(e,t),this.quaternion.premultiply(Jp),this}rotateX(e){return this.rotateOnAxis(em,e)}rotateY(e){return this.rotateOnAxis(tm,e)}rotateZ(e){return this.rotateOnAxis(nm,e)}translateOnAxis(e,t){return qp.copy(e).applyQuaternion(this.quaternion),this.position.add(qp.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(em,e)}translateY(e){return this.translateOnAxis(tm,e)}translateZ(e){return this.translateOnAxis(nm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Yp.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Xp.copy(e):Xp.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Zp.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Yp.lookAt(Zp,Xp,this.up):Yp.lookAt(Xp,Zp,this.up),this.quaternion.setFromRotationMatrix(Yp),r&&(Yp.extractRotation(r.matrixWorld),Jp.setFromRotationMatrix(Yp),this.quaternion.premultiply(Jp.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(qf(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(rm),am.child=e,this.dispatchEvent(am),am.child=null):qf(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(im),om.child=e,this.dispatchEvent(om),om.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Yp.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Yp.multiply(e.parent.matrixWorld)),e.applyMatrix4(Yp),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(rm),am.child=e,this.dispatchEvent(am),am.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zp,e,Qp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zp,$p,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};sm.DEFAULT_UP=new Z(0,1,0),sm.DEFAULT_MATRIX_AUTO_UPDATE=!0,sm.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var cm=class extends sm{constructor(){super(),this.isGroup=!0,this.type=`Group`}},lm={type:`move`},um=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new cm,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new cm,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new cm,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Z,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(lm)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new cm;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},dm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fm={h:0,s:0,l:0},pm={h:0,s:0,l:0};function mm(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var hm=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Mf){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,vp.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=vp.workingColorSpace){return this.r=e,this.g=t,this.b=n,vp.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=vp.workingColorSpace){if(e=rp(e,1),t=np(t,0,1),n=np(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=mm(i,r,e+1/3),this.g=mm(i,r,e),this.b=mm(i,r,e-1/3)}return vp.colorSpaceToWorking(this,r),this}setStyle(e,t=Mf){function n(t){t!==void 0&&parseFloat(t)<1&&Kf(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:Kf(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);Kf(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Mf){let n=dm[e.toLowerCase()];return n===void 0?Kf(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yp(e.r),this.g=yp(e.g),this.b=yp(e.b),this}copyLinearToSRGB(e){return this.r=bp(e.r),this.g=bp(e.g),this.b=bp(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Mf){return vp.workingToColorSpace(gm.copy(this),e),Math.round(np(gm.r*255,0,255))*65536+Math.round(np(gm.g*255,0,255))*256+Math.round(np(gm.b*255,0,255))}getHexString(e=Mf){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=vp.workingColorSpace){vp.workingToColorSpace(gm.copy(this),t);let n=gm.r,r=gm.g,i=gm.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=vp.workingColorSpace){return vp.workingToColorSpace(gm.copy(this),t),e.r=gm.r,e.g=gm.g,e.b=gm.b,e}getStyle(e=Mf){vp.workingToColorSpace(gm.copy(this),e);let t=gm.r,n=gm.g,r=gm.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(fm),this.setHSL(fm.h+e,fm.s+t,fm.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(fm),e.getHSL(pm);let n=ip(fm.h,pm.h,t),r=ip(fm.s,pm.s,t),i=ip(fm.l,pm.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},gm=new hm;hm.NAMES=dm;var _m=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new hm(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},vm=class extends sm{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wp,this.environmentIntensity=1,this.environmentRotation=new Wp,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},ym=new Z,bm=new Z,xm=new Z,Sm=new Z,Cm=new Z,wm=new Z,Tm=new Z,Em=new Z,Dm=new Z,Om=new Z,km=new kp,Am=new kp,jm=new kp,Mm=class e{constructor(e=new Z,t=new Z,n=new Z){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),ym.subVectors(e,t),r.cross(ym);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){ym.subVectors(r,t),bm.subVectors(n,t),xm.subVectors(e,t);let a=ym.dot(ym),o=ym.dot(bm),s=ym.dot(xm),c=bm.dot(bm),l=bm.dot(xm),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Sm)!==null&&Sm.x>=0&&Sm.y>=0&&Sm.x+Sm.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Sm)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Sm.x),s.addScaledVector(a,Sm.y),s.addScaledVector(o,Sm.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return km.setScalar(0),Am.setScalar(0),jm.setScalar(0),km.fromBufferAttribute(e,t),Am.fromBufferAttribute(e,n),jm.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(km,i.x),a.addScaledVector(Am,i.y),a.addScaledVector(jm,i.z),a}static isFrontFacing(e,t,n,r){return ym.subVectors(n,t),bm.subVectors(e,t),ym.cross(bm).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ym.subVectors(this.c,this.b),bm.subVectors(this.a,this.b),ym.cross(bm).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Cm.subVectors(r,n),wm.subVectors(i,n),Em.subVectors(e,n);let s=Cm.dot(Em),c=wm.dot(Em);if(s<=0&&c<=0)return t.copy(n);Dm.subVectors(e,r);let l=Cm.dot(Dm),u=wm.dot(Dm);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Cm,a);Om.subVectors(e,i);let f=Cm.dot(Om),p=wm.dot(Om);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(wm,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Tm.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Tm,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Cm,a).addScaledVector(wm,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Nm=class{constructor(e=new Z(1/0,1/0,1/0),t=new Z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Fm.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Fm.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Fm.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Fm):Fm.fromBufferAttribute(r,t),Fm.applyMatrix4(e.matrixWorld),this.expandByPoint(Fm);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Im.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Im.copy(e.boundingBox)),Im.applyMatrix4(e.matrixWorld),this.union(Im)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Fm),Fm.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Um),Wm.subVectors(this.max,Um),Lm.subVectors(e.a,Um),Rm.subVectors(e.b,Um),zm.subVectors(e.c,Um),Bm.subVectors(Rm,Lm),Vm.subVectors(zm,Rm),Hm.subVectors(Lm,zm);let t=[0,-Bm.z,Bm.y,0,-Vm.z,Vm.y,0,-Hm.z,Hm.y,Bm.z,0,-Bm.x,Vm.z,0,-Vm.x,Hm.z,0,-Hm.x,-Bm.y,Bm.x,0,-Vm.y,Vm.x,0,-Hm.y,Hm.x,0];return!qm(t,Lm,Rm,zm,Wm)||(t=[1,0,0,0,1,0,0,0,1],!qm(t,Lm,Rm,zm,Wm))?!1:(Gm.crossVectors(Bm,Vm),t=[Gm.x,Gm.y,Gm.z],qm(t,Lm,Rm,zm,Wm))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Fm).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Fm).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Pm[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pm[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pm[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pm[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pm[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pm[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pm[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pm[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pm)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Pm=[new Z,new Z,new Z,new Z,new Z,new Z,new Z,new Z],Fm=new Z,Im=new Nm,Lm=new Z,Rm=new Z,zm=new Z,Bm=new Z,Vm=new Z,Hm=new Z,Um=new Z,Wm=new Z,Gm=new Z,Km=new Z;function qm(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Km.fromArray(e,a);let o=i.x*Math.abs(Km.x)+i.y*Math.abs(Km.y)+i.z*Math.abs(Km.z),s=t.dot(Km),c=n.dot(Km),l=r.dot(Km);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Jm=new Z,Ym=new lp,Xm=0,Zm=class extends Zf{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Xm++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Lf,this.updateRanges=[],this.gpuType=wd,this.version=0,this._normalizationScale=e===void 0?void 0:op(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ym.fromBufferAttribute(this,t),Ym.applyMatrix3(e),this.setXY(t,Ym.x,Ym.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Jm.fromBufferAttribute(this,t),Jm.applyMatrix3(e),this.setXYZ(t,Jm.x,Jm.y,Jm.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Jm.fromBufferAttribute(this,t),Jm.applyMatrix4(e),this.setXYZ(t,Jm.x,Jm.y,Jm.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Jm.fromBufferAttribute(this,t),Jm.applyNormalMatrix(e),this.setXYZ(t,Jm.x,Jm.y,Jm.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Jm.fromBufferAttribute(this,t),Jm.transformDirection(e),this.setXYZ(t,Jm.x,Jm.y,Jm.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?sp(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?cp(e,this.array):Math.round(e*t)}},Qm=class extends Zm{constructor(e,t,n){super(new Uint16Array(e),t,n)}},$m=class extends Zm{constructor(e,t,n){super(new Uint32Array(e),t,n)}},eh=class extends Zm{constructor(e,t,n){super(new Float32Array(e),t,n)}},th=new Nm,nh=new Z,rh=new Z,ih=class{constructor(e=new Z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?th.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;nh.subVectors(e,this.center);let t=nh.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(nh,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(rh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(nh.copy(e.center).add(rh)),this.expandByPoint(nh.copy(e.center).sub(rh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ah=0,oh=new Pp,sh=new sm,ch=new Z,lh=new Nm,uh=new Nm,dh=new Z,fh=class e extends Zf{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ah++}),this.uuid=tp(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(zf(e)?$m:Qm)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new pp().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return oh.makeRotationFromQuaternion(e),this.applyMatrix4(oh),this}rotateX(e){return oh.makeRotationX(e),this.applyMatrix4(oh),this}rotateY(e){return oh.makeRotationY(e),this.applyMatrix4(oh),this}rotateZ(e){return oh.makeRotationZ(e),this.applyMatrix4(oh),this}translate(e,t,n){return oh.makeTranslation(e,t,n),this.applyMatrix4(oh),this}scale(e,t,n){return oh.makeScale(e,t,n),this.applyMatrix4(oh),this}lookAt(e){return sh.lookAt(e),sh.updateMatrix(),this.applyMatrix4(sh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ch).negate(),this.translate(ch.x,ch.y,ch.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new eh(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&Kf(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Nm);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)qf(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new Z(-1/0,-1/0,-1/0),new Z(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];lh.setFromBufferAttribute(n),this.morphTargetsRelative?(dh.addVectors(this.boundingBox.min,lh.min),this.boundingBox.expandByPoint(dh),dh.addVectors(this.boundingBox.max,lh.max),this.boundingBox.expandByPoint(dh)):(this.boundingBox.expandByPoint(lh.min),this.boundingBox.expandByPoint(lh.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&qf(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ih);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)qf(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new Z,1/0);else if(e){let n=this.boundingSphere.center;if(lh.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];uh.setFromBufferAttribute(n),this.morphTargetsRelative?(dh.addVectors(lh.min,uh.min),lh.expandByPoint(dh),dh.addVectors(lh.max,uh.max),lh.expandByPoint(dh)):(lh.expandByPoint(uh.min),lh.expandByPoint(uh.max))}lh.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)dh.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(dh));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)dh.fromBufferAttribute(a,t),o&&(ch.fromBufferAttribute(e,t),dh.add(ch)),r=Math.max(r,n.distanceToSquared(dh))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&qf(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){qf(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Zm(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new Z,s[e]=new Z;let l=new Z,u=new Z,d=new Z,f=new lp,p=new lp,m=new lp,h=new Z,g=new Z;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new Z,b=new Z,x=new Z,S=new Z;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Zm(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new Z,i=new Z,a=new Z,o=new Z,s=new Z,c=new Z,l=new Z,u=new Z;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)dh.fromBufferAttribute(e,t),dh.normalize(),e.setXYZ(t,dh.x,dh.y,dh.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Zm(a,r,i)}if(this.index===null)return Kf(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},ph=new Z,mh=new Z,hh=new pp,gh=class{constructor(e=new Z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=ph.subVectors(n,t).cross(mh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(ph),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||hh.getNormalMatrix(e),r=this.coplanarPoint(ph).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},_h=0,vh=class extends Zf{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_h++}),this.uuid=tp(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new hm(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=If,this.stencilZFail=If,this.stencilZPass=If,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Kf(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?Kf(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new hm().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new gh().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new lp().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new lp().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},yh=new Z,bh=new Z,xh=new Z,Sh=new Z,Ch=class{constructor(e=new Z,t=new Z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,yh)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=yh.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(yh.copy(this.origin).addScaledVector(this.direction,t),yh.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){bh.copy(e).add(t).multiplyScalar(.5),xh.copy(t).sub(e).normalize(),Sh.copy(this.origin).sub(bh);let i=e.distanceTo(t)*.5,a=-this.direction.dot(xh),o=Sh.dot(this.direction),s=-Sh.dot(xh),c=Sh.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(bh).addScaledVector(xh,d),f}intersectSphere(e,t){if(e.radius<0)return null;yh.subVectors(e.center,this.origin);let n=yh.dot(this.direction),r=yh.dot(yh)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,yh)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,N=C/w,P=1/w,ne=T-te*D,re=E-N*D,ie=O-te*A,ae=k-N*A,oe=j-te*M,se=ee-N*M,ce=oe*ae-se*ie,le=ne*se-re*oe,ue=ie*re-ae*ne;if(r){if(ce<0||le<0||ue<0)return null}else if((ce<0||le<0||ue<0)&&(ce>0||le>0||ue>0))return null;let de=ce+le+ue;if(de===0)return null;let fe=P*(ce*D+le*A+ue*M);return(de>0?fe<0:fe>0)?null:this.at(fe/de,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},wh=class extends vh{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new hm(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wp,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Th=new Pp,Eh=new Ch,Dh=new ih,Oh=new Z,kh=new Z,Ah=new Z,jh=new Z,Mh=new Z,Nh=new Z,Ph=new Z,Fh=new Z,Ih=class extends sm{constructor(e=new fh,t=new wh){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Nh.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Mh.fromBufferAttribute(s,e),a?Nh.addScaledVector(Mh,r):Nh.addScaledVector(Mh.sub(t),r))}t.add(Nh)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Dh.copy(n.boundingSphere),Dh.applyMatrix4(i),Eh.copy(e.ray).recast(e.near),!(Dh.containsPoint(Eh.origin)===!1&&(Eh.intersectSphere(Dh,Oh)===null||Eh.origin.distanceToSquared(Oh)>(e.far-e.near)**2))&&(Th.copy(i).invert(),Eh.copy(e.ray).applyMatrix4(Th),(n.boundingBox===null||Eh.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Eh)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Rh(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Rh(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Rh(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Rh(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Lh(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Fh.copy(s),Fh.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Fh);return l<n.near||l>n.far?null:{distance:l,point:Fh.clone(),object:e}}function Rh(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,kh),e.getVertexPosition(c,Ah),e.getVertexPosition(l,jh);let u=Lh(e,t,n,r,kh,Ah,jh,Ph);if(u){let e=new Z;Mm.getBarycoord(Ph,kh,Ah,jh,e),i&&(u.uv=Mm.getInterpolatedAttribute(i,s,c,l,e,new lp)),a&&(u.uv1=Mm.getInterpolatedAttribute(a,s,c,l,e,new lp)),o&&(u.normal=Mm.getInterpolatedAttribute(o,s,c,l,e,new Z),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new Z,materialIndex:0};Mm.getNormal(kh,Ah,jh,t.normal),u.face=t,u.barycoord=e}return u}var zh=class extends Op{constructor(e=null,t=1,n=1,r,i,a,o,s,c=fd,l=fd,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Bh=class extends Zm{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Vh=new Pp,Hh=new Pp,Uh=[],Wh=new Nm,Gh=new Pp,Kh=new Ih,qh=new ih,Jh=class extends Ih{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Bh(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Gh)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Nm),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vh),Wh.copy(e.boundingBox).applyMatrix4(Vh),this.boundingBox.union(Wh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ih),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vh),qh.copy(e.boundingSphere).applyMatrix4(Vh),this.boundingSphere.union(qh)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Kh.geometry=this.geometry,Kh.material=this.material,Kh.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qh.copy(this.boundingSphere),qh.applyMatrix4(n),e.ray.intersectsSphere(qh)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Vh),Hh.multiplyMatrices(n,Vh),Kh.matrixWorld=Hh,Kh.raycast(e,Uh);for(let e=0,n=Uh.length;e<n;e++){let n=Uh[e];n.instanceId=i,n.object=this,t.push(n)}Uh.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Bh(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new zh(new Float32Array(r*this.count),r,this.count,Id,wd));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Yh=new ih,Xh=new lp(.5,.5),Zh=new Z,Qh=class{constructor(e=new gh,t=new gh,n=new gh,r=new gh,i=new gh,a=new gh){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Rf,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Yh.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Yh.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Yh)}intersectsSprite(e){return Yh.center.set(0,0,0),Yh.radius=.7071067811865476+Xh.distanceTo(e.center),Yh.applyMatrix4(e.matrixWorld),this.intersectsSphere(Yh)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Zh.x=r.normal.x>0?e.max.x:e.min.x,Zh.y=r.normal.y>0?e.max.y:e.min.y,Zh.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Zh)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},$h=new Pp,eg=class e{constructor(){this.coordinateSystem=Rf,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];$h.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new Qh),n[e].setFromProjectionMatrix($h,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new Qh),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},tg=class extends Op{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ng=class extends Op{constructor(e,t,n=Cd,r,i,a,o=fd,s=fd,c,l=Pd,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new wp(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},rg=class extends ng{constructor(e,t=Cd,n=301,r,i,a=fd,o=fd,s,c=Pd){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ig=class extends Op{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ag=class e extends fh{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new eh(c,3)),this.setAttribute(`normal`,new eh(l,3)),this.setAttribute(`uv`,new eh(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new Z;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},og=class e extends fh{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new eh(p,3)),this.setAttribute(`normal`,new eh(m,3)),this.setAttribute(`uv`,new eh(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};function sg(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(lg(i))i.isRenderTargetTexture?(Kf(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(lg(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function cg(e){let t={};for(let n=0;n<e.length;n++){let r=sg(e[n]);for(let e in r)t[e]=r[e]}return t}function lg(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function ug(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function dg(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:vp.workingColorSpace}var fg={clone:sg,merge:cg},pg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,mg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,hg=class extends vh{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pg,this.fragmentShader=mg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=sg(e.uniforms),this.uniformsGroups=ug(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new hm().setHex(r.value);break;case`v2`:this.uniforms[n].value=new lp().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new Z().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new kp().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new pp().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Pp().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},gg=class extends hg{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},_g=class extends vh{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type=`MeshPhongMaterial`,this.color=new hm(16777215),this.specular=new hm(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new hm(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new lp(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wp,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},vg=class extends vh{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=jf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},yg=class extends vh{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function bg(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function xg(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Sg=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Cg=class extends Sg{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Of,endingEnd:Of}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case kf:i=e,o=2*t-n;break;case Af:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case kf:a=e,s=2*n-t;break;case Af:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},wg=class extends Sg{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Tg=class extends Sg{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Eg=class extends Sg{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=kg(n,t,g,y,r);i[p]=Dg(x,o,_,b,m)}return i}};function Dg(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Og(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function kg(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Dg(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Og(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Ag=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=bg(t,this.TimeBufferType),this.values=bg(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:bg(e.times,Array),values:bg(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),xg(e.settings)&&(n.settings={inTangents:bg(e.settings.inTangents,Array),outTangents:bg(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Tg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new wg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Cg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Eg(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case wf:t=this.InterpolantFactoryMethodDiscrete;break;case Tf:t=this.InterpolantFactoryMethodLinear;break;case Ef:t=this.InterpolantFactoryMethodSmooth;break;case Df:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return Kf(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return wf;case this.InterpolantFactoryMethodLinear:return Tf;case this.InterpolantFactoryMethodSmooth:return Ef;case this.InterpolantFactoryMethodBezier:return Df}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;xg(this.settings)&&(jg(this.settings.inTangents,e),jg(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;xg(this.settings)&&(Mg(this.settings.inTangents,e),Mg(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(qf(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(qf(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){qf(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){qf(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Bf(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){qf(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ef,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,xg(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function jg(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function Mg(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Ag.prototype.ValueTypeName=``,Ag.prototype.TimeBufferType=Float32Array,Ag.prototype.ValueBufferType=Float32Array,Ag.prototype.DefaultInterpolation=Tf;var Ng=class extends Ag{constructor(e,t,n){super(e,t,n)}};Ng.prototype.ValueTypeName=`bool`,Ng.prototype.ValueBufferType=Array,Ng.prototype.DefaultInterpolation=wf,Ng.prototype.InterpolantFactoryMethodLinear=void 0,Ng.prototype.InterpolantFactoryMethodSmooth=void 0;var Pg=class extends Ag{constructor(e,t,n,r){super(e,t,n,r)}};Pg.prototype.ValueTypeName=`color`;var Fg=class extends Ag{constructor(e,t,n,r){super(e,t,n,r)}};Fg.prototype.ValueTypeName=`number`;var Ig=class extends Sg{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)up.slerpFlat(i,0,a,c-o,a,c,s);return i}},Lg=class extends Ag{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Ig(this.times,this.values,this.getValueSize(),e)}};Lg.prototype.ValueTypeName=`quaternion`,Lg.prototype.InterpolantFactoryMethodSmooth=void 0;var Rg=class extends Ag{constructor(e,t,n){super(e,t,n)}};Rg.prototype.ValueTypeName=`string`,Rg.prototype.ValueBufferType=Array,Rg.prototype.DefaultInterpolation=wf,Rg.prototype.InterpolantFactoryMethodLinear=void 0,Rg.prototype.InterpolantFactoryMethodSmooth=void 0;var zg=class extends Ag{constructor(e,t,n,r){super(e,t,n,r)}};zg.prototype.ValueTypeName=`vector`;var Bg=class extends sm{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new hm(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Vg=new Pp,Hg=new Z,Ug=new Z,Wg=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new lp(512,512),this.mapType=vd,this.map=null,this.mapPass=null,this.matrix=new Pp,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qh,this._frameExtents=new lp(1,1),this._viewportCount=1,this._viewports=[new kp(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Hg.setFromMatrixPosition(e.matrixWorld),t.position.copy(Hg),Ug.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ug),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Vg.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Vg,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Vg)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Gg=new Z,Kg=new up,qg=new Z,Jg=class extends sm{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Pp,this.projectionMatrix=new Pp,this.projectionMatrixInverse=new Pp,this.coordinateSystem=Rf,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Gg,Kg,qg),qg.x===1&&qg.y===1&&qg.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Gg,Kg,qg.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Gg,Kg,qg),qg.x===1&&qg.y===1&&qg.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Gg,Kg,qg.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Yg=new Z,Xg=new lp,Zg=new lp,Qg=class extends Jg{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ep*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan($f*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ep*2*Math.atan(Math.tan($f*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yg.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yg.x,Yg.y).multiplyScalar(-e/Yg.z),Yg.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yg.x,Yg.y).multiplyScalar(-e/Yg.z)}getViewSize(e,t){return this.getViewBounds(e,Xg,Zg),t.subVectors(Zg,Xg)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan($f*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},$g=class extends Jg{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},e_=class extends Wg{constructor(){super(new $g(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},t_=class extends Bg{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(sm.DEFAULT_UP),this.updateMatrix(),this.target=new sm,this.shadow=new e_}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},n_=class extends Bg{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},r_=-90,i_=1,a_=class extends sm{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Qg(r_,i_,e,t);r.layers=this.layers,this.add(r);let i=new Qg(r_,i_,e,t);i.layers=this.layers,this.add(i);let a=new Qg(r_,i_,e,t);a.layers=this.layers,this.add(a);let o=new Qg(r_,i_,e,t);o.layers=this.layers,this.add(o);let s=new Qg(r_,i_,e,t);s.layers=this.layers,this.add(s);let c=new Qg(r_,i_,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},o_=class extends Qg{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},s_=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=c_.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function c_(){this._document.hidden===!1&&this.reset()}var l_=`\\[\\]\\.:\\/`,u_=RegExp(`[\\[\\]\\.:\\/]`,`g`),d_=`[^\\[\\]\\.:\\/]`,f_=`[^`+l_.replace(`\\.`,``)+`]`,p_=`((?:WC+[\\/:])*)`.replace(`WC`,d_),m_=`(WCOD+)?`.replace(`WCOD`,f_),h_=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,d_),g_=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,d_),__=RegExp(`^`+p_+m_+h_+g_+`$`),v_=[`material`,`materials`,`bones`,`map`],y_=class{constructor(e,t,n){let r=n||b_.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},b_=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(u_,``)}static parseTrackName(e){let t=__.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);v_.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Kf(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){qf(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){qf(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){qf(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){qf(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){qf(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){qf(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){qf(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;qf(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){qf(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){qf(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};b_.Composite=y_,b_.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},b_.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},b_.prototype.GetterByBindingType=[b_.prototype._getValue_direct,b_.prototype._getValue_array,b_.prototype._getValue_arrayElement,b_.prototype._getValue_toArray],b_.prototype.SetterByBindingTypeAndVersioning=[[b_.prototype._setValue_direct,b_.prototype._setValue_direct_setNeedsUpdate,b_.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[b_.prototype._setValue_array,b_.prototype._setValue_array_setNeedsUpdate,b_.prototype._setValue_array_setMatrixWorldNeedsUpdate],[b_.prototype._setValue_arrayElement,b_.prototype._setValue_arrayElement_setNeedsUpdate,b_.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[b_.prototype._setValue_fromArray,b_.prototype._setValue_fromArray_setNeedsUpdate,b_.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var x_=new Pp,S_=class{constructor(e,t,n=0,r=1/0){this.ray=new Ch(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Gp,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):qf(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return x_.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(x_),this}intersectObject(e,t=!0,n=[]){return w_(e,this,n,t),n.sort(C_),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)w_(e[r],this,n,t);return n.sort(C_),n}};function C_(e,t){return e.distance-t.distance}function w_(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)w_(r[e],t,n,!0)}}(class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function T_(e,t,n,r){let i=E_(r);switch(n){case jd:return e*t;case Id:return e*t/i.components*i.byteLength;case Ld:return e*t/i.components*i.byteLength;case Rd:return e*t*2/i.components*i.byteLength;case zd:return e*t*2/i.components*i.byteLength;case Md:return e*t*3/i.components*i.byteLength;case Nd:return e*t*4/i.components*i.byteLength;case Bd:return e*t*4/i.components*i.byteLength;case Vd:case Hd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Ud:case Wd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Kd:case Jd:return Math.max(e,16)*Math.max(t,8)/4;case Gd:case qd:return Math.max(e,8)*Math.max(t,8)/2;case Yd:case Xd:case Qd:case $d:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Zd:case ef:case tf:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case nf:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case rf:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case af:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case of:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case sf:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case cf:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case lf:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case uf:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case df:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ff:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case pf:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case mf:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case hf:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case gf:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case _f:case vf:case yf:return Math.ceil(e/4)*Math.ceil(t/4)*16;case bf:case xf:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Sf:case Cf:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function E_(e){switch(e){case vd:case yd:return{byteLength:1,components:1};case xd:case bd:case Td:return{byteLength:2,components:1};case Ed:case Dd:return{byteLength:2,components:4};case Cd:case Sd:case wd:return{byteLength:4,components:1};case kd:case Ad:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?Kf(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function D_(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function O_(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var k_={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Q={common:{diffuse:{value:new hm(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new pp},alphaMap:{value:null},alphaMapTransform:{value:new pp},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new pp}},envmap:{envMap:{value:null},envMapRotation:{value:new pp},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new pp}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new pp}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new pp},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new pp},normalScale:{value:new lp(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new pp},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new pp}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new pp}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new pp}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new hm(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new hm(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new pp},alphaTest:{value:0},uvTransform:{value:new pp}},sprite:{diffuse:{value:new hm(16777215)},opacity:{value:1},center:{value:new lp(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new pp},alphaMap:{value:null},alphaMapTransform:{value:new pp},alphaTest:{value:0}}},A_={basic:{uniforms:cg([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.fog]),vertexShader:k_.meshbasic_vert,fragmentShader:k_.meshbasic_frag},lambert:{uniforms:cg([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new hm(0)},envMapIntensity:{value:1}}]),vertexShader:k_.meshlambert_vert,fragmentShader:k_.meshlambert_frag},phong:{uniforms:cg([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new hm(0)},specular:{value:new hm(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:k_.meshphong_vert,fragmentShader:k_.meshphong_frag},standard:{uniforms:cg([Q.common,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.roughnessmap,Q.metalnessmap,Q.fog,Q.lights,{emissive:{value:new hm(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:k_.meshphysical_vert,fragmentShader:k_.meshphysical_frag},toon:{uniforms:cg([Q.common,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.gradientmap,Q.fog,Q.lights,{emissive:{value:new hm(0)}}]),vertexShader:k_.meshtoon_vert,fragmentShader:k_.meshtoon_frag},matcap:{uniforms:cg([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,{matcap:{value:null}}]),vertexShader:k_.meshmatcap_vert,fragmentShader:k_.meshmatcap_frag},points:{uniforms:cg([Q.points,Q.fog]),vertexShader:k_.points_vert,fragmentShader:k_.points_frag},dashed:{uniforms:cg([Q.common,Q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:k_.linedashed_vert,fragmentShader:k_.linedashed_frag},depth:{uniforms:cg([Q.common,Q.displacementmap]),vertexShader:k_.depth_vert,fragmentShader:k_.depth_frag},normal:{uniforms:cg([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,{opacity:{value:1}}]),vertexShader:k_.meshnormal_vert,fragmentShader:k_.meshnormal_frag},sprite:{uniforms:cg([Q.sprite,Q.fog]),vertexShader:k_.sprite_vert,fragmentShader:k_.sprite_frag},background:{uniforms:{uvTransform:{value:new pp},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:k_.background_vert,fragmentShader:k_.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new pp}},vertexShader:k_.backgroundCube_vert,fragmentShader:k_.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:k_.cube_vert,fragmentShader:k_.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:k_.equirect_vert,fragmentShader:k_.equirect_frag},distance:{uniforms:cg([Q.common,Q.displacementmap,{referencePosition:{value:new Z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:k_.distance_vert,fragmentShader:k_.distance_frag},shadow:{uniforms:cg([Q.lights,Q.fog,{color:{value:new hm(0)},opacity:{value:1}}]),vertexShader:k_.shadow_vert,fragmentShader:k_.shadow_frag}};A_.physical={uniforms:cg([A_.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new pp},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new pp},clearcoatNormalScale:{value:new lp(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new pp},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new pp},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new pp},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new pp},sheen:{value:0},sheenColor:{value:new hm(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new pp},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new pp},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new pp},transmissionSamplerSize:{value:new lp},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new pp},attenuationDistance:{value:0},attenuationColor:{value:new hm(0)},specularColor:{value:new hm(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new pp},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new pp},anisotropyVector:{value:new lp},anisotropyMap:{value:null},anisotropyMapTransform:{value:new pp}}]),vertexShader:k_.meshphysical_vert,fragmentShader:k_.meshphysical_frag};var j_={r:0,b:0,g:0},M_=new Pp,N_=new pp;N_.set(-1,0,0,0,1,0,0,0,1);function P_(e,t,n,r,i,a){let o=new hm(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new Ih(new ag(1,1,1),new hg({name:`BackgroundCubeMaterial`,uniforms:sg(A_.backgroundCube.uniforms),vertexShader:A_.backgroundCube.vertexShader,fragmentShader:A_.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(M_.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(N_),l.material.toneMapped=vp.getTransfer(i.colorSpace)!==Ff,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Ih(new og(2,2),new hg({name:`BackgroundMaterial`,uniforms:sg(A_.background.uniforms),vertexShader:A_.background.vertexShader,fragmentShader:A_.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=vp.getTransfer(i.colorSpace)!==Ff,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(j_,dg(e)),n.buffers.color.setClear(j_.r,j_.g,j_.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function F_(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function I_(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function L_(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(Kf(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&Kf(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&Kf(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function R_(e){let t=this,n=null,r=0,i=!1,a=!1,o=new gh,s=new pp,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var z_=class extends jp{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new tg(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ag(5,5,5),i=new hg({name:`CubemapFromEquirect`,uniforms:sg(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Ih(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=hd),new a_(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},B_=256,V_=3,H_=20,U_=256,W_=16,G_=3,K_=new Z,q_=new hm,J_=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new a_(1,10,null),this._boxMesh=new Ih(new ag(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=K_}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(q_));let h=new a_(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tv(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ev(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(B_,ap(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?B_:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Y_(e,!1,!1),n=Math.log2(e)-V_;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Y_(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=tv()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=ev()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Z_(),this._integrationMaterial=Q_());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/W_);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-G_)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(U_*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=$_());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function Y_(e,t,n){return new z_(e,{minFilter:_d,generateMipmaps:t,type:Td,colorSpace:Nf,depthBuffer:n})}function X_(e,t,n){return new hg({name:e,uniforms:t,vertexShader:k_.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function Z_(){return X_(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${U_}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Q_(){return X_(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:W_}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function $_(){return X_(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${H_}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function ev(){return X_(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function tv(){return X_(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function nv(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new z_(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new J_(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new J_(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function rv(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Jf(`WebGLRenderer: `+e+` extension not supported.`),t}}}function iv(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?$m:Qm)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function av(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ov(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:qf(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function sv(e,t,n){let r=new WeakMap,i=new kp;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],p=0;e===!0&&(p=1),n===!0&&(p=2),a===!0&&(p=3);let m=o.attributes.position.count*p,h=1;m>t.maxTextureSize&&(h=Math.ceil(m/t.maxTextureSize),m=t.maxTextureSize);let g=new Float32Array(m*h*4*u),_=new Mp(g,m,h,u);_.type=wd,_.needsUpdate=!0;let v=p*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=m*h*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new lp(m,h)},r.set(o,d);function f(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,f)}o.addEventListener(`dispose`,f)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function cv(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var lv={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function uv(e,t,n,r,i,a){let o=new jp(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new fh;u.setAttribute(`position`,new eh([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new eh([0,2,0,0,2,0],2));let d=new gg({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Ih(u,d),p=new $g(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new jp(t,n,{type:Td,depthBuffer:!1,stencilBuffer:!1}),c=new jp(t,n,{type:Td,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new ng(t,n),a===!0&&(l.format=Fd,l.type=Od)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},vp.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=lv[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var dv=new Op,fv=new ng(1,1),pv=new rg(1),mv=new Mp,hv=new Np,gv=new tg,_v=[],vv=[],yv=new Float32Array(16),bv=new Float32Array(9),xv=new Float32Array(4);function Sv(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=_v[i];if(a===void 0&&(a=new Float32Array(i),_v[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Cv(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function wv(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Tv(e,t){let n=vv[t];n===void 0&&(n=new Int32Array(t),vv[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Ev(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Dv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Cv(n,t))return;e.uniform2fv(this.addr,t),wv(n,t)}}function Ov(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Cv(n,t))return;e.uniform3fv(this.addr,t),wv(n,t)}}function kv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Cv(n,t))return;e.uniform4fv(this.addr,t),wv(n,t)}}function Av(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Cv(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),wv(n,t)}else{if(Cv(n,r))return;xv.set(r),e.uniformMatrix2fv(this.addr,!1,xv),wv(n,r)}}function jv(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Cv(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),wv(n,t)}else{if(Cv(n,r))return;bv.set(r),e.uniformMatrix3fv(this.addr,!1,bv),wv(n,r)}}function Mv(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Cv(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),wv(n,t)}else{if(Cv(n,r))return;yv.set(r),e.uniformMatrix4fv(this.addr,!1,yv),wv(n,r)}}function Nv(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Pv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Cv(n,t))return;e.uniform2iv(this.addr,t),wv(n,t)}}function Fv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Cv(n,t))return;e.uniform3iv(this.addr,t),wv(n,t)}}function Iv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Cv(n,t))return;e.uniform4iv(this.addr,t),wv(n,t)}}function Lv(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Rv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Cv(n,t))return;e.uniform2uiv(this.addr,t),wv(n,t)}}function zv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Cv(n,t))return;e.uniform3uiv(this.addr,t),wv(n,t)}}function Bv(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Cv(n,t))return;e.uniform4uiv(this.addr,t),wv(n,t)}}function Vv(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function Hv(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Vv(fv):dv,n.setTexture2D(t||a,i)}function Uv(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||hv,i)}function Wv(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Vv(pv):gv,n.setTextureCube(t||a,i)}function Gv(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||mv,i)}function Kv(e){switch(e){case 5126:return Ev;case 35664:return Dv;case 35665:return Ov;case 35666:return kv;case 35674:return Av;case 35675:return jv;case 35676:return Mv;case 5124:case 35670:return Nv;case 35667:case 35671:return Pv;case 35668:case 35672:return Fv;case 35669:case 35673:return Iv;case 5125:return Lv;case 36294:return Rv;case 36295:return zv;case 36296:return Bv;case 35678:case 36198:case 36298:case 36306:case 35682:return Hv;case 35679:case 36299:case 36307:return Uv;case 35680:case 36300:case 36308:case 36293:return Wv;case 36289:case 36303:case 36311:case 36292:return Gv}}function qv(e,t){e.uniform1fv(this.addr,t)}function Jv(e,t){let n=Sv(t,this.size,2);e.uniform2fv(this.addr,n)}function Yv(e,t){let n=Sv(t,this.size,3);e.uniform3fv(this.addr,n)}function Xv(e,t){let n=Sv(t,this.size,4);e.uniform4fv(this.addr,n)}function Zv(e,t){let n=Sv(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Qv(e,t){let n=Sv(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function $v(e,t){let n=Sv(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ey(e,t){e.uniform1iv(this.addr,t)}function ty(e,t){e.uniform2iv(this.addr,t)}function ny(e,t){e.uniform3iv(this.addr,t)}function ry(e,t){e.uniform4iv(this.addr,t)}function iy(e,t){e.uniform1uiv(this.addr,t)}function ay(e,t){e.uniform2uiv(this.addr,t)}function oy(e,t){e.uniform3uiv(this.addr,t)}function sy(e,t){e.uniform4uiv(this.addr,t)}function cy(e,t,n){let r=this.cache,i=t.length,a=Tv(n,i);Cv(r,a)||(e.uniform1iv(this.addr,a),wv(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Vv(fv):dv;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function ly(e,t,n){let r=this.cache,i=t.length,a=Tv(n,i);Cv(r,a)||(e.uniform1iv(this.addr,a),wv(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||hv,a[e])}function uy(e,t,n){let r=this.cache,i=t.length,a=Tv(n,i);Cv(r,a)||(e.uniform1iv(this.addr,a),wv(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Vv(pv):gv;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function dy(e,t,n){let r=this.cache,i=t.length,a=Tv(n,i);Cv(r,a)||(e.uniform1iv(this.addr,a),wv(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||mv,a[e])}function fy(e){switch(e){case 5126:return qv;case 35664:return Jv;case 35665:return Yv;case 35666:return Xv;case 35674:return Zv;case 35675:return Qv;case 35676:return $v;case 5124:case 35670:return ey;case 35667:case 35671:return ty;case 35668:case 35672:return ny;case 35669:case 35673:return ry;case 5125:return iy;case 36294:return ay;case 36295:return oy;case 36296:return sy;case 35678:case 36198:case 36298:case 36306:case 35682:return cy;case 35679:case 36299:case 36307:return ly;case 35680:case 36300:case 36308:case 36293:return uy;case 36289:case 36303:case 36311:case 36292:return dy}}var py=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Kv(t.type)}},my=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=fy(t.type)}},hy=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},gy=/(\w+)(\])?(\[|\.)?/g;function _y(e,t){e.seq.push(t),e.map[t.id]=t}function vy(e,t,n){let r=e.name,i=r.length;for(gy.lastIndex=0;;){let a=gy.exec(r),o=gy.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){_y(n,l===void 0?new py(s,e,t):new my(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new hy(s),_y(n,e)),n=e}}}var yy=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);vy(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function by(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var xy=37297,Sy=0;function Cy(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var wy=new pp;function Ty(e){vp._getMatrix(wy,vp.workingColorSpace,e);let t=`mat3( ${wy.elements.map(e=>e.toFixed(4))} )`;switch(vp.getTransfer(e)){case Pf:return[t,`LinearTransferOETF`];case Ff:return[t,`sRGBTransferOETF`];default:return Kf(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ey(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Cy(e.getShaderSource(t),r)}return i}function Dy(e,t){let n=Ty(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var Oy={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function ky(e,t){let n=Oy[t];return n===void 0?(Kf(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Ay=new Z;function jy(){return vp.getLuminanceCoefficients(Ay),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Ay.x.toFixed(4)}, ${Ay.y.toFixed(4)}, ${Ay.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function My(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Fy).join(`
`)}function Ny(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Py(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Fy(e){return e!==``}function Iy(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Ly(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ry=/^[ \t]*#include +<([\w\d./]+)>/gm;function zy(e){return e.replace(Ry,By)}function By(e,t){let n=k_[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return zy(n)}var Vy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hy(e){return e.replace(Vy,Uy)}function Uy(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Wy(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Gy={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Ky(e){return Gy[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var qy={302:`ENVMAP_MODE_REFRACTION`};function Jy(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:qy[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Yy={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Xy(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Yy[e.combine]||`ENVMAP_BLENDING_NONE`}function Zy(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Ky(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Jy(n),d=Xy(n),f=My(n),p=Ny(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Fy).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Fy).join(`
`),g.length>0&&(g+=`
`)):(h=[Wy(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Fy).join(`
`),g=[Wy(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:k_.tonemapping_pars_fragment,n.toneMapping===0?``:ky(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,k_.colorspace_pars_fragment,Dy(`linearToOutputTexel`,n.outputColorSpace),jy(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Fy).join(`
`)),o=zy(o),o=Iy(o,n),o=Ly(o,n),s=zy(s),s=Iy(s,n),s=Ly(s,n),o=Hy(o),s=Hy(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=by(i,i.VERTEX_SHADER,v),x=by(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=Ey(i,b,`vertex`),n=Ey(i,x,`fragment`);qf(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):Kf(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new yy(i,m),w=Py(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,xy)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Sy++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var Qy=0,$y=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new eb(e),t.set(e,n)),n}},eb=class{constructor(e){this.id=Qy++,this.code=e,this.usedTimes=0}};function tb(e){return e===1030||e===37490||e===36285}function nb(e,t,n,r,i,a){let o=new Gp,s=new $y,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&Kf(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=A_[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),ee=m.isInstancedMesh===!0,M=m.isBatchedMesh===!0,te=!!i.map,N=!!i.matcap,P=!!b,ne=P&&b.isPMREMTexture===!0,re=!!i.aoMap,ie=!!i.lightMap,ae=!!i.bumpMap&&i.wireframe===!1,oe=!!i.normalMap,se=!!i.displacementMap,ce=!!i.emissiveMap,le=!!i.metalnessMap,ue=!!i.roughnessMap,de=i.anisotropy>0,fe=i.clearcoat>0,pe=i.diffuseRoughness>0,me=i.dispersion>0,he=i.retroreflectivity>0,ge=i.iridescence>0,_e=i.sheen>0,ve=i.transmission>0,ye=de&&!!i.anisotropyMap,be=fe&&!!i.clearcoatMap,xe=fe&&!!i.clearcoatNormalMap,Se=fe&&!!i.clearcoatRoughnessMap,F=pe&&!!i.diffuseRoughnessMap,I=ge&&!!i.iridescenceMap,Ce=ge&&!!i.iridescenceThicknessMap,L=_e&&!!i.sheenColorMap,we=_e&&!!i.sheenRoughnessMap,R=!!i.specularMap,z=!!i.specularColorMap,Te=!!i.specularIntensityMap,B=ve&&!!i.transmissionMap,Ee=ve&&!!i.thicknessMap,De=!!i.gradientMap,Oe=!!i.alphaMap,ke=i.alphaTest>0,Ae=!!i.alphaHash,je=!!i.extensions,Me=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Me=e.toneMapping);let Ne=ne?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Pe={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:M,batchingColor:M&&m._colorsTexture!==null,instancing:ee,instancingColor:ee&&m.instanceColor!==null,instancingMorph:ee&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:vp.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:te,matcap:N,envMap:P,envMapMode:P&&b.mapping,envMapPMREM:ne,envMapMaxLod:ne?Ne.length-1:null,envMapSize:ne?Ne[0].width:null,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:se,emissiveMap:ce,normalMapObjectSpace:oe&&i.normalMapType===1,normalMapTangentSpace:oe&&i.normalMapType===0,packedNormalMap:oe&&i.normalMapType===0&&tb(i.normalMap.format),metalnessMap:le,roughnessMap:ue,anisotropy:de,anisotropyMap:ye,clearcoat:fe,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:Se,diffuseRoughness:pe,diffuseRoughnessMap:F,dispersion:me,retroreflection:he,iridescence:ge,iridescenceMap:I,iridescenceThicknessMap:Ce,sheen:_e,sheenColorMap:L,sheenRoughnessMap:we,specularMap:R,specularColorMap:z,specularIntensityMap:Te,transmission:ve,transmissionMap:B,thicknessMap:Ee,gradientMap:De,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Oe,alphaTest:ke,alphaHash:Ae,combine:i.combine,mapUv:te&&p(i.map.channel),aoMapUv:re&&p(i.aoMap.channel),lightMapUv:ie&&p(i.lightMap.channel),bumpMapUv:ae&&p(i.bumpMap.channel),normalMapUv:oe&&p(i.normalMap.channel),displacementMapUv:se&&p(i.displacementMap.channel),emissiveMapUv:ce&&p(i.emissiveMap.channel),metalnessMapUv:le&&p(i.metalnessMap.channel),roughnessMapUv:ue&&p(i.roughnessMap.channel),anisotropyMapUv:ye&&p(i.anisotropyMap.channel),clearcoatMapUv:be&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:xe&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:F&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:I&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:L&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:we&&p(i.sheenRoughnessMap.channel),specularMapUv:R&&p(i.specularMap.channel),specularColorMapUv:z&&p(i.specularColorMap.channel),specularIntensityMapUv:Te&&p(i.specularIntensityMap.channel),transmissionMapUv:B&&p(i.transmissionMap.channel),thicknessMapUv:Ee&&p(i.thicknessMap.channel),alphaMapUv:Oe&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(oe||de),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(te||Oe),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&oe===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Me,decodeVideoTexture:te&&i.map.isVideoTexture===!0&&vp.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&i.emissiveMap.isVideoTexture===!0&&vp.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:je&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(je&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Pe.vertexUv1s=c.has(1),Pe.vertexUv2s=c.has(2),Pe.vertexUv3s=c.has(3),c.clear(),Pe}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=A_[t];n=fg.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new Zy(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function rb(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function ib(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ab(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ob(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||ib),r.length>1&&r.sort(t||ab),i.length>1&&i.sort(t||ab)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function sb(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new ob,e.set(t,[i])):n>=r.length?(i=new ob,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function cb(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new Z,color:new hm};break;case`SpotLight`:n={position:new Z,direction:new Z,color:new hm,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new Z,color:new hm,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new Z,skyColor:new hm,groundColor:new hm};break;case`RectAreaLight`:n={color:new hm,position:new Z,halfWidth:new Z,halfHeight:new Z}}return e[t.id]=n,n}}}function lb(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lp};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lp};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lp,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var ub=0;function db(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function fb(e){let t=new cb,n=lb(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new Z);let i=new Z,a=new Pp,o=new Pp;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(db);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Q.LTC_FLOAT_1,r.rectAreaLTC2=Q.LTC_FLOAT_2):(r.rectAreaLTC1=Q.LTC_HALF_1,r.rectAreaLTC2=Q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=ub++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function pb(e){let t=new fb(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function mb(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new pb(e),t.set(n,[a])):r>=i.length?(a=new pb(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var hb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gb=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,_b=[new Z(1,0,0),new Z(-1,0,0),new Z(0,1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1)],vb=[new Z(0,-1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1),new Z(0,-1,0),new Z(0,-1,0)],yb=new Pp,bb=new Z,xb=new Z;function Sb(e,t,n){let r=new Qh,i=new lp,a=new lp,o=new kp,s=new vg,c=new yg,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new hg({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new lp},radius:{value:4}},vertexShader:hb,fragmentShader:gb}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new fh;m.setAttribute(`position`,new Zm(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new Ih(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(Kf(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){Kf(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){Kf(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new jp(i.x,i.y,{format:Rd,type:Td,minFilter:hd,magFilter:hd,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new ng(i.x,i.y,wd),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Pd,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=fd,d.map.depthTexture.magFilter=fd}else l.isPointLight?(d.map=new z_(i.x),d.map.depthTexture=new rg(i.x,Cd)):(d.map=new jp(i.x,i.y),d.map.depthTexture=new ng(i.x,i.y,Cd)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Pd,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=hd,d.map.depthTexture.magFilter=hd):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=fd,d.map.depthTexture.magFilter=fd);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),bb.setFromMatrixPosition(l.matrixWorld),e.position.copy(bb),xb.copy(e.position),xb.add(_b[t]),e.up.copy(vb[t]),e.lookAt(xb),e.updateMatrixWorld(),n.makeTranslation(-bb.x,-bb.y,-bb.z),yb.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(yb,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new jp(i.x,i.y,{format:Rd,type:Td}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Cb(e,t){function n(){let t=!1,n=new kp,r=null,i=new kp(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?le(e.DEPTH_TEST):ue(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Xf[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?le(e.STENCIL_TEST):ue(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new hm(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(N)[1]),M=te>=1);let P=null,ne={},re=e.getParameter(e.SCISSOR_BOX),ie=e.getParameter(e.VIEWPORT),ae=new kp().fromArray(re),oe=new kp().fromArray(ie);function se(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ce={};ce[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),le(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),le(e.CULL_FACE),ge(0);function le(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ue(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function de(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function fe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function pe(t){return h!==t&&(e.useProgram(t),h=t,!0)}let me={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};me[103]=e.MIN,me[104]=e.MAX;let he={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ge(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(ue(e.BLEND),g=!1);else if(g===!1&&(le(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:qf(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:qf(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:qf(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:qf(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(me[n],me[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(he[r],he[i],he[o],he[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function _e(t,n){t.side===2?ue(e.CULL_FACE):le(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?ge(0):ge(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),xe(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?le(e.SAMPLE_ALPHA_TO_COVERAGE):ue(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ye(t){t===0?ue(e.CULL_FACE):(le(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function be(t){t!==k&&(M&&e.lineWidth(t),k=t)}function xe(t,n,r){t?(le(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):ue(e.POLYGON_OFFSET_FILL)}function Se(t){t?le(e.SCISSOR_TEST):ue(e.SCISSOR_TEST)}function F(t){t===void 0&&(t=e.TEXTURE0+ee-1),P!==t&&(e.activeTexture(t),P=t)}function I(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+ee-1:P);let i=ne[r];i===void 0&&(i={type:void 0,texture:void 0},ne[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||ce[t]),i.type=t,i.texture=n)}function Ce(){let t=ne[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function L(){try{e.compressedTexImage2D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function we(){try{e.compressedTexImage3D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function R(){try{e.texSubImage2D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function z(){try{e.texSubImage3D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function Te(){try{e.compressedTexSubImage2D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function B(){try{e.compressedTexSubImage3D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function Ee(){try{e.texStorage2D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function De(){try{e.texStorage3D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function Oe(){try{e.texImage2D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function ke(){try{e.texImage3D(...arguments)}catch(e){qf(`WebGLState:`,e)}}function Ae(t){return d[t]===void 0?e.getParameter(t):d[t]}function je(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Me(t){ae.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ae.copy(t))}function Ne(t){oe.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),oe.copy(t))}function Pe(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function Fe(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Ie(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},P=null,ne={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new hm(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ae.set(0,0,e.canvas.width,e.canvas.height),oe.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:le,disable:ue,bindFramebuffer:de,drawBuffers:fe,useProgram:pe,setBlending:ge,setMaterial:_e,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:xe,setScissorTest:Se,activeTexture:F,bindTexture:I,unbindTexture:Ce,compressedTexImage2D:L,compressedTexImage3D:we,texImage2D:Oe,texImage3D:ke,pixelStorei:je,getParameter:Ae,updateUBOMapping:Pe,uniformBlockBinding:Fe,texStorage2D:Ee,texStorage3D:De,texSubImage2D:R,texSubImage3D:z,compressedTexSubImage2D:Te,compressedTexSubImage3D:B,scissor:Me,viewport:Ne,reset:Ie}}function wb(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new lp,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):Vf(`canvas`)}function v(e,t,n){let r=1,i=Ee(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),Kf(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&Kf(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];Kf(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||Kf(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Pf:vp.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,Kf(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function E(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function D(e){k(e.target)}function O(e){A(e.target)}function k(e){e.removeEventListener(`dispose`,D),E(e),ee(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function A(e){e.removeEventListener(`dispose`,O),E(e),te(e)}function j(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?A(t):k(t))}m.clear(),d.clear()}function ee(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&M(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function M(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function te(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&k(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let N=0;function P(){N=0}function ne(){return N}function re(e){N=e}function ie(){let e=N;return e>=i.maxTextures&&Kf(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),N+=1,e}function ae(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function oe(t,i){let a=r.get(t);if(t.isVideoTexture&&Te(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)Kf(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)Kf(`WebGLRenderer: Texture marked for update but image is incomplete`);else{_e(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function se(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?_e(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function ce(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?_e(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function le(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?ve(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ue={[ld]:e.REPEAT,[ud]:e.CLAMP_TO_EDGE,[dd]:e.MIRRORED_REPEAT},de={[fd]:e.NEAREST,[pd]:e.NEAREST_MIPMAP_NEAREST,[md]:e.NEAREST_MIPMAP_LINEAR,[hd]:e.LINEAR,[gd]:e.LINEAR_MIPMAP_NEAREST,[_d]:e.LINEAR_MIPMAP_LINEAR},fe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function pe(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&Kf(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ue[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ue[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ue[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,de[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,de[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,fe[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function me(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,D),T(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=ae(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&M(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function he(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ge(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=he(n.start,r.width,4),c=he(t.start,r.width,4);n.start<=i+1&&a===c&&he(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function _e(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=me(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=vp.getPrimaries(vp.workingColorSpace),r=o.colorSpace===``?null:vp.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=B(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);pe(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,T=u.dataReady,E=w(o,t);if(o.isDepthTexture)m=C(o.format===Fd,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&ge(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(T){if(o.layerUpdates.size>0){let t=T_(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else Kf(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?Kf(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=T_(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=Ee(g[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=Ee(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ve(t,o,s){if(o.image.length!==6)return;let c=me(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=vp.getPrimaries(vp.workingColorSpace),r=o.colorSpace===``?null:vp.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=B(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),T=o.isVideoTexture!==!0,E=u.__version===void 0||c===!0,D=l.dataReady,O=w(o,h);pe(e.TEXTURE_CUBE_MAP,o);let k;if(o.isDepthTexture){if(x=C(o.format===Fd,o.type),E){if(T)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,h.width,h.height);for(let t=0;t<6;t++){k=m[t].mipmaps;for(let r=0;r<k.length;r++){let i=k[r];o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?Kf(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(k=o.mipmaps,T&&E){k.length>0&&O++;let t=Ee(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<k.length;r++){let i=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<k.length;r++){let i=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ye(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,R(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function be(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,R(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,R(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,R(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,R(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function xe(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?le(i.depthTexture,0):oe(i.depthTexture,0);let u=c.__webglTexture,d=R(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Se(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)xe(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?xe(i.__webglFramebuffer[0],t,0):xe(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),be(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),be(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function F(t,n,i){let a=r.get(t);n!==void 0&&ye(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Se(t)}function I(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,O),T(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&z(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=R(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),be(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),pe(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ye(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ye(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),pe(c,a),ye(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),pe(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ye(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ye(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&Se(t)}function Ce(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let L=[];function we(t){if(t.samples>0){if(z(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(L.length=0,L.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&L.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,L))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function R(e){return Math.min(i.maxSamples,e.samples)}function z(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Te(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function B(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(vp.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&Kf(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):qf(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ee(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=ie,this.resetTextureUnits=P,this.getTextureUnits=ne,this.setTextureUnits=re,this.setTexture2D=oe,this.setTexture2DArray=se,this.setTexture3D=ce,this.setTextureCube=le,this.rebindTextures=F,this.setupRenderTarget=I,this.updateRenderTargetMipmap=Ce,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=Se,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=z,this.dispose=j}function Tb(e,t){function n(n,r=``){let i,a=vp.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Eb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Db=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ob=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ig(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new hg({vertexShader:Eb,fragmentShader:Db,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ih(new og(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},kb=class extends Zf{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Ob,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new lp,C=null,w=null,T=new Qg;T.viewport=new kp;let E=new Qg;E.viewport=new kp;let D=[T,E],O=new o_,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new um,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new um,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new um,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,re.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&Kf(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&Kf(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Fd:Pd,a=_.stencil?Od:Cd);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new jp(d.textureWidth,d.textureHeight,{format:Nd,type:vd,depthTexture:new ng(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new jp(f.framebufferWidth,f.framebufferHeight,{format:Nd,type:vd,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),re.setContext(r),re.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;te(O,i);for(let e=0;e<a.length;e++)te(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),N(e,O,i)};function N(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ep*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let P=null;function ne(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new Qg,o.layers.enable(n),o.viewport=new kp,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new ig,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}P&&P(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let re=new D_;re.setAnimationLoop(ne),this.setAnimationLoop=function(e){P=e},this.dispose=function(){}}},Ab=new Pp,jb=new pp;jb.set(-1,0,0,0,1,0,0,0,1);function Mb(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,dg(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Ab.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(jb),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Nb(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?Kf(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):Kf(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var Pb=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Fb=null;function Ib(){return Fb===null&&(Fb=new zh(Pb,16,16,Rd,Td),Fb.name=`DFG_LUT`,Fb.minFilter=hd,Fb.magFilter=hd,Fb.wrapS=ud,Fb.wrapT=ud,Fb.generateMipmaps=!1,Fb.needsUpdate=!0),Fb}var Lb=class{constructor(e={}){let{canvas:t=Hf(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=vd}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([Bd,zd,Ld]),g=new Set([vd,Cd,xd,Od,Ed,Dd]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=Mf;let j=0,ee=0,M=null,te=-1,N=null,P=new kp,ne=new kp,re=null,ie=new hm(0),ae=0,oe=t.width,se=t.height,ce=1,le=null,ue=null,de=new kp(0,0,oe,se),fe=new kp(0,0,oe,se),pe=!1,me=new Qh,he=new eg,ge=!1,_e=!1,ve=new Pp,ye=new Z,be=new kp,xe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Se=!1;function F(){return M===null?ce:1}let I=n;function Ce(e,n){return t.getContext(e,n)}let L,we,R,z,Te,B,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,Ge,!1),t.addEventListener(`webglcontextrestored`,Ke,!1),t.addEventListener(`webglcontextcreationerror`,qe,!1),I===null){let t=`webgl2`;if(I=Ce(t,e),I===null)throw Ce(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}Ue()}catch(e){throw t.removeEventListener(`webglcontextlost`,Ge,!1),t.removeEventListener(`webglcontextrestored`,Ke,!1),t.removeEventListener(`webglcontextcreationerror`,qe,!1),qf(`WebGLRenderer: `+e.message),e}function Ue(){L=new rv(I),L.init(),Be=new Tb(I,L),we=new L_(I,L,e,Be),R=new Cb(I,L),we.reversedDepthBuffer&&d&&R.buffers.depth.setReversed(!0),O=I.createFramebuffer(),k=I.createFramebuffer(),A=I.createFramebuffer(),z=new ov(I),Te=new rb,B=new wb(I,L,R,Te,we,Be,z),Ee=new nv(T),De=new O_(I),Ve=new F_(I,De),Oe=new iv(I,De,z,Ve),ke=new cv(I,Oe,De,Ve,z),Le=new sv(I,we,B),Pe=new R_(Te),Ae=new nb(T,Ee,L,we,Ve,Pe),je=new Mb(T,Te),Me=new sb,Ne=new mb(L),Ie=new P_(T,Ee,R,ke,p,s),Fe=new Sb(T,ke,we),He=new Nb(I,z,we,R),Re=new I_(I,L,z),ze=new av(I,L,z),z.programs=Ae.programs,T.capabilities=we,T.extensions=L,T.properties=Te,T.renderLists=Me,T.shadowMap=Fe,T.state=R,T.info=z}m!==1009&&(w=new uv(m,t.width,t.height,o,r,i));let We=new kb(T,I);this.xr=We,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let e=L.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=L.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ce},this.setPixelRatio=function(e){e!==void 0&&(ce=e,this.setSize(oe,se,!1))},this.getSize=function(e){return e.set(oe,se)},this.setSize=function(e,n,r=!0){We.isPresenting?Kf(`WebGLRenderer: Can't change size while VR device is presenting.`):(oe=e,se=n,t.width=Math.floor(e*ce),t.height=Math.floor(n*ce),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(oe*ce,se*ce).floor()},this.setDrawingBufferSize=function(e,n,r){oe=e,se=n,ce=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)qf(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){Kf(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(P)},this.getViewport=function(e){return e.copy(de)},this.setViewport=function(e,t,n,r){e.isVector4?de.set(e.x,e.y,e.z,e.w):de.set(e,t,n,r),R.viewport(P.copy(de).multiplyScalar(F()).round())},this.getScissor=function(e){return e.copy(fe)},this.setScissor=function(e,t,n,r){e.isVector4?fe.set(e.x,e.y,e.z,e.w):fe.set(e,t,n,r),R.scissor(ne.copy(fe).multiplyScalar(F()).round())},this.getScissorTest=function(){return pe},this.setScissorTest=function(e){R.setScissorTest(pe=e)},this.setOpaqueSort=function(e){le=e},this.setTransparentSort=function(e){ue=e},this.getClearColor=function(e){return e.copy(Ie.getClearColor())},this.setClearColor=function(){Ie.setClearColor(...arguments)},this.getClearAlpha=function(){return Ie.getClearAlpha()},this.setClearAlpha=function(){Ie.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=Ie.getClearColor(),r=Ie.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,I.clearBufferuiv(I.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,I.clearBufferiv(I.COLOR,0,v))}else r|=I.COLOR_BUFFER_BIT}t&&(r|=I.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&I.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ge,!1),t.removeEventListener(`webglcontextrestored`,Ke,!1),t.removeEventListener(`webglcontextcreationerror`,qe,!1),Ie.dispose(),Me.dispose(),Ne.dispose(),B.dispose(),Te.dispose(),Ee.dispose(),ke.dispose(),Oe.dispose(),Ve.dispose(),He.dispose(),Ae.dispose(),We.dispose(),We.removeEventListener(`sessionstart`,et),We.removeEventListener(`sessionend`,tt),nt.stop()};function Ge(e){e.preventDefault(),Wf(`WebGLRenderer: Context Lost.`),E=!0}function Ke(){Wf(`WebGLRenderer: Context Restored.`),E=!1;let e=z.autoReset,t=Fe.enabled,n=Fe.autoUpdate,r=Fe.needsUpdate,i=Fe.type;Ue(),z.autoReset=e,Fe.enabled=t,Fe.autoUpdate=n,Fe.needsUpdate=r,Fe.type=i}function qe(e){qf(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Je(e){let t=e.target;t.removeEventListener(`dispose`,Je),Ye(t)}function Ye(e){Xe(e),Te.remove(e)}function Xe(e){let t=Te.get(e).programs;t!==void 0&&(t.forEach(function(e){Ae.releaseProgram(e)}),e.isShaderMaterial&&Ae.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=xe);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=dt(e,t,n,r,i);R.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Oe.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ve.setup(i,r,s,n,c);let h,g=Re;if(c!==null&&(h=De.get(c),g=ze,g.setIndex(h)),i.isMesh)r.wireframe===!0?(R.setLineWidth(r.wireframeLinewidth*F()),g.setMode(I.LINES)):g.setMode(I.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),R.setLineWidth(e*F()),i.isLineSegments?g.setMode(I.LINES):i.isLineLoop?g.setMode(I.LINE_LOOP):g.setMode(I.LINE_STRIP)}else i.isPoints?g.setMode(I.POINTS):i.isSprite&&g.setMode(I.TRIANGLES);if(i.isBatchedMesh){if(L.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?De.get(c).bytesPerElement:1,o=Te.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(I,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ze(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),ge===!0&&Pe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,ct(e,t,r),e.side=0,e.needsUpdate=!0,ct(e,t,r),e.side=2):ct(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Ne.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),_e=this.localClippingEnabled,ge=Pe.init(this.clippingPlanes,_e),ge===!0&&Pe.setGlobalState(this.clippingPlanes,t),D!==null&&Fe.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];Ze(o,n,t,e),r.add(o)}else Ze(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=Te.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}L.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Qe=null;function $e(e){Qe&&Qe(e)}function et(){nt.stop()}function tt(){nt.start()}let nt=new D_;nt.setAnimationLoop($e),typeof self<`u`&&nt.setContext(self),this.setAnimationLoop=function(e){Qe=e,We.setAnimationLoop(e),e===null?nt.stop():nt.start()},We.addEventListener(`sessionstart`,et),We.addEventListener(`sessionend`,tt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){qf(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=We.enabled===!0&&We.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),We.enabled===!0&&We.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(We.cameraAutoUpdate===!0&&We.updateCamera(t),t=We.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Ne.get(e,C.length),x.init(t),x.state.textureUnits=B.getTextureUnits(),C.push(x),ve.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?he.setFromArrayCamera(t):me.setFromProjectionMatrix(ve,Rf,t.reversedDepth),_e=this.localClippingEnabled,ge=Pe.init(this.clippingPlanes,_e),b=Me.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,We.enabled===!0&&We.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&rt(e,t,-1/0,T.sortObjects)}rt(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(le,ue),Se=We.enabled===!1||We.isPresenting===!1||We.hasDepthSensing()===!1,Se&&Ie.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),ge===!0&&Pe.beginShadows();let i=x.state.shadowsArray;if(Fe.render(i,e,t),ge===!0&&Pe.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];at(n,r,e,a)}Se&&Ie.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];it(b,e,n,n.viewport)}}else r.length>0&&at(n,r,e,t),Se&&Ie.render(e),it(b,e,t)}M!==null&&ee===0&&(B.updateMultisampleRenderTarget(M),B.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Ve.resetDefaultState(),te=-1,N=null,C.pop(),C.length>0?(x=C[C.length-1],B.setTextureUnits(x.state.textureUnits),ge===!0&&Pe.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function rt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?he:me;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&be.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ve);let i=ke.update(e),a=e.material;a.visible&&b.push(e,i,a,n,be.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?he:me;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=ke.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),be.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),be.copy(e.boundingSphere.center)),be.applyMatrix4(e.matrixWorld).applyMatrix4(ve)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,be.z,s,t)}}else a.visible&&b.push(e,i,a,n,be.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)rt(i[e],t,n,r)}function it(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),ge===!0&&Pe.setGlobalState(T.clippingPlanes,n),r&&R.viewport(P.copy(r)),i.length>0&&V(i,t,n),a.length>0&&V(a,t,n),o.length>0&&V(o,t,n),R.buffers.depth.setTest(!0),R.buffers.depth.setMask(!0),R.buffers.color.setMask(!0),R.setPolygonOffset(!1)}function at(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=L.has(`EXT_color_buffer_half_float`)||L.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new jp(1,1,{generateMipmaps:!0,type:e?Td:vd,minFilter:_d,samples:Math.max(4,we.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:vp.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||P;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(ie),ae=T.getClearAlpha(),ae<1&&T.setClearColor(16777215,.5),T.clear(),Se&&Ie.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),ge===!0&&Pe.setGlobalState(T.clippingPlanes,r),V(e,n,r),B.updateMultisampleRenderTarget(a),B.updateRenderTargetMipmap(a),L.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ot(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(B.updateMultisampleRenderTarget(a),B.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(ie,ae),d!==void 0&&(r.viewport=d),T.toneMapping=u}function V(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ot(o,t,n,s,l,c)}}function ot(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function st(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function ct(e,t,n){t.isScene!==!0&&(t=xe);let r=Te.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Ae.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Ae.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ee.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Je),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ut(e,s),d}else s.uniforms=Ae.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Ae.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Pe.uniform),ut(e,s),r.needsLights=pt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=st(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function lt(e,t,n,r,i){let a=Te.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=ct(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function H(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=yy.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ut(e,t){let n=Te.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function dt(e,t,n,r,i){t.isScene!==!0&&(t=xe),B.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:vp.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ee.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=Te.get(r),b=x.state.lights;if(ge===!0&&(_e===!0||e!==N)){let t=e===N&&r.id===te;Pe.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Pe.numPlanes||v.numIntersection!==Pe.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===st(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?lt(r,t,i,s,h):ct(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(R.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==te&&(te=r.id,O=!0),E||N!==e){R.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(I,`projectionMatrix`,e.projectionMatrix),A.setValue(I,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(I,ye.setFromMatrixPosition(e.matrixWorld)),we.logarithmicDepthBuffer&&A.setValue(I,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(I,`isOrthographic`,e.isOrthographicCamera===!0),N!==e&&(N=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(I,`sunShadowMap`,b.state.sunShadowMap,B),b.state.directionalShadowMap.length>0&&A.setValue(I,`directionalShadowMap`,b.state.directionalShadowMap,B),b.state.spotShadowMap.length>0&&A.setValue(I,`spotShadowMap`,b.state.spotShadowMap,B),b.state.pointShadowMap.length>0&&A.setValue(I,`pointShadowMap`,b.state.pointShadowMap,B)),i.isSkinnedMesh){A.setOptional(I,i,`bindMatrix`),A.setOptional(I,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(I,`boneTexture`,e.boneTexture,B))}i.isBatchedMesh&&(A.setOptional(I,i,`batchingTexture`),A.setValue(I,`batchingTexture`,i._matricesTexture,B),A.setOptional(I,i,`batchingIdTexture`),A.setValue(I,`batchingIdTexture`,i._indirectTexture,B),A.setOptional(I,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(I,`batchingColorTexture`,i._colorsTexture,B));let ee=n.morphAttributes;if((ee.position!==void 0||ee.normal!==void 0||ee.color!==void 0)&&Le.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(I,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=Ib()),O){if(A.setValue(I,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&ft(j,k),a&&r.fog===!0&&je.refreshFogUniforms(j,a),je.refreshMaterialUniforms(j,r,ce,se,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}yy.upload(I,H(v),j,B)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(yy.upload(I,H(v),j,B),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(I,`center`,i.center),A.setValue(I,`modelViewMatrix`,i.modelViewMatrix),A.setValue(I,`normalMatrix`,i.normalMatrix),A.setValue(I,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];He.update(n,w),He.bind(n,w)}}return w}function ft(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function pt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=Te.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),Te.get(e.texture).__webglTexture=t,Te.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=Te.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=Te.get(e);if(o.__useDefaultFramebuffer!==void 0){R.bindFramebuffer(I.FRAMEBUFFER,o.__webglFramebuffer),P.copy(e.viewport),ne.copy(e.scissor),re=e.scissorTest,R.viewport(P),R.scissor(ne),R.setScissorTest(re),te=-1;return}if(o.__webglFramebuffer===void 0)B.setupRenderTarget(e);else if(o.__hasExternalTextures)B.rebindTextures(e,Te.get(e.texture).__webglTexture,Te.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&Te.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);B.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=Te.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&B.useMultisampledRTT(e)===!1?Te.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,P.copy(e.viewport),ne.copy(e.scissor),re=e.scissorTest}else P.copy(de).multiplyScalar(ce).floor(),ne.copy(fe).multiplyScalar(ce).floor(),re=pe;if(n!==0&&(r=O),R.bindFramebuffer(I.FRAMEBUFFER,r)&&R.drawBuffers(e,r),R.viewport(P),R.scissor(ne),R.setScissorTest(re),i){let r=Te.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=Te.get(e.textures[t]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=Te.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,t.__webglTexture,n)}te=-1};function mt(e){let t=Te.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=we.textureFormatReadable(e.format),t.__typeReadable=we.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){qf(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=Te.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){R.bindFramebuffer(I.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s);let u=mt(o);if(u.__formatReadable===!1){qf(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){qf(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&I.readPixels(t,n,r,i,Be.convert(c),Be.convert(l),a)}finally{let e=M===null?null:Te.get(M).__webglFramebuffer;R.bindFramebuffer(I.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=Te.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){R.bindFramebuffer(I.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s);let d=mt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,f),I.bufferData(I.PIXEL_PACK_BUFFER,a.byteLength,I.STREAM_READ),I.readPixels(t,n,r,i,Be.convert(l),Be.convert(u),0),I.bindBuffer(I.PIXEL_PACK_BUFFER,null);let p=M===null?null:Te.get(M).__webglFramebuffer;R.bindFramebuffer(I.FRAMEBUFFER,p);let m=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Yf(I,m,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,f),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,a),I.bindBuffer(I.PIXEL_PACK_BUFFER,null),I.deleteBuffer(f),I.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;B.setTexture2D(e,0),I.copyTexSubImage2D(I.TEXTURE_2D,n,0,0,o,s,i,a),R.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Be.convert(t.format),_=Be.convert(t.type),v;t.isData3DTexture?(B.setTexture3D(t,0),v=I.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(B.setTexture2DArray(t,0),v=I.TEXTURE_2D_ARRAY):(B.setTexture2D(t,0),v=I.TEXTURE_2D),R.activeTexture(I.TEXTURE0),R.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,t.flipY),R.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),R.pixelStorei(I.UNPACK_ALIGNMENT,t.unpackAlignment);let y=R.getParameter(I.UNPACK_ROW_LENGTH),b=R.getParameter(I.UNPACK_IMAGE_HEIGHT),x=R.getParameter(I.UNPACK_SKIP_PIXELS),S=R.getParameter(I.UNPACK_SKIP_ROWS),C=R.getParameter(I.UNPACK_SKIP_IMAGES);R.pixelStorei(I.UNPACK_ROW_LENGTH,h.width),R.pixelStorei(I.UNPACK_IMAGE_HEIGHT,h.height),R.pixelStorei(I.UNPACK_SKIP_PIXELS,l),R.pixelStorei(I.UNPACK_SKIP_ROWS,u),R.pixelStorei(I.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=Te.get(e),r=Te.get(t),h=Te.get(n.__renderTarget),g=Te.get(r.__renderTarget);R.bindFramebuffer(I.READ_FRAMEBUFFER,h.__webglFramebuffer),R.bindFramebuffer(I.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Te.get(e).__webglTexture,i,d+n),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Te.get(t).__webglTexture,a,m+n)),I.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,I.DEPTH_BUFFER_BIT,I.NEAREST);R.bindFramebuffer(I.READ_FRAMEBUFFER,null),R.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||Te.has(e)){let n=Te.get(e),r=Te.get(t);R.bindFramebuffer(I.READ_FRAMEBUFFER,k),R.bindFramebuffer(I.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,n.__webglTexture,i),T?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,r.__webglTexture,a),i===0?T?I.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):I.copyTexSubImage2D(v,a,f,p,l,u,o,s):I.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,I.COLOR_BUFFER_BIT,I.NEAREST);R.bindFramebuffer(I.READ_FRAMEBUFFER,null),R.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?I.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h);R.pixelStorei(I.UNPACK_ROW_LENGTH,y),R.pixelStorei(I.UNPACK_IMAGE_HEIGHT,b),R.pixelStorei(I.UNPACK_SKIP_PIXELS,x),R.pixelStorei(I.UNPACK_SKIP_ROWS,S),R.pixelStorei(I.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&I.generateMipmap(v),R.unbindTexture()},this.initRenderTarget=function(e){Te.get(e).__webglFramebuffer===void 0&&B.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?B.setTextureCube(e,0):e.isData3DTexture?B.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?B.setTexture2DArray(e,0):B.setTexture2D(e,0),R.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,R.reset(),Ve.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Rf}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=vp._getDrawingBufferColorSpace(e),t.unpackColorSpace=vp._getUnpackColorSpace()}},Rb=new Z;function zb(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;Rb.copy(t),Rb[r]=0,Rb.normalize();let l=.5*o/(o+s),u=1-Rb.angleTo(e)/c;return Math.sign(Rb[n])===1?u*l:s/(o+s)+l+l*(1-u)}var Bb=class e extends ag{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new Z,c=new Z,l=new Z(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new Z,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=zb(m,c,`z`,`y`,i,n),f[a+1]=1-zb(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-zb(m,c,`z`,`y`,i,n),f[a+1]=1-zb(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-zb(m,c,`x`,`z`,i,e),f[a+1]=zb(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-zb(m,c,`x`,`z`,i,e),f[a+1]=1-zb(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-zb(m,c,`x`,`y`,i,e),f[a+1]=1-zb(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=zb(m,c,`x`,`y`,i,e),f[a+1]=1-zb(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}},Vb={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Hb=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Ub=new $g(-1,1,1,-1,0,1),Wb=new class extends fh{constructor(){super(),this.setAttribute(`position`,new eh([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new eh([0,2,0,0,2,0],2))}},Gb=class{constructor(e){this._mesh=new Ih(Wb,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ub)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Kb=class extends Hb{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof hg?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=fg.clone(e.uniforms),this.material=new hg({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Gb(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},qb=class extends Hb{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Jb=class extends Hb{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},Yb=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new lp);this._width=n.width,this._height=n.height,t=new jp(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Td}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Kb(Vb),this.copyPass.material.blending=0,this.timer=new s_}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}qb!==void 0&&(r instanceof qb?n=!0:r instanceof Jb&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new lp);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Xb={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},Zb=class extends Hb{constructor(){super(),this.isOutputPass=!0,this.uniforms=fg.clone(Xb.uniforms),this.material=new gg({name:Xb.name,uniforms:this.uniforms,vertexShader:Xb.vertexShader,fragmentShader:Xb.fragmentShader}),this._fsQuad=new Gb(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},vp.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Qb=class extends Hb{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new hm}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},$b=48,ex=.72,tx=3,nx=12,rx=Math.PI*.03,ix=Math.PI*.05,ax={speed:6,frequency:1.2,width:3,jitter:.2,fadeTime:2,trailSpacing:.1,idleStrength:.8},ox={uniforms:{tDiffuse:{value:null},shiftAmount:{value:.004},vignetteRadius:{value:.35},vignetteSoftness:{value:.45}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float shiftAmount;
    uniform float vignetteRadius;
    uniform float vignetteSoftness;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      vec2 dir = sign(vUv - center);
      float vignetteFactor = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, dist);
      vec2 shift = dir * shiftAmount * vignetteFactor;
      float r = texture2D(tDiffuse, vUv + shift).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - shift).b;
      gl_FragColor = vec4(vec3(r, g, b) * (1.0 - vignetteFactor * 0.7), 1.0);
    }
  `},sx=e=>e.replace(`#include <common>`,`#include <common>
      varying float vHeight;
      attribute vec2 aOffset;
      uniform sampler2D uTrailTexture;
      uniform int       uTrailCount;
      uniform float     uWaveSpeed;
      uniform float     uWaveFreq;
      uniform float     uWaveWidth;
      uniform float     uFadeTime;
      uniform float     uAmplitude;
      uniform float     uJitter;
      uniform float     uMaxHeight;

      vec2 hash2( vec2 p ) {
        p = vec2(
          dot( p, vec2( 127.1, 311.7 ) ),
          dot( p, vec2( 269.5, 183.3 ) )
        );
        return fract( sin( p ) * 43758.5453123 ) - 0.5;
      }`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
      vHeight = 0.0;
      if ( position.y > 0.0 ) {
        vec2 worldXZ = aOffset + hash2( aOffset ) * uJitter;
        float waveHeight  = 0.0;
        float totalWeight = 0.0;

        for ( int i = 0; i < uTrailCount; i++ ) {
          vec4 td = texture2D(
            uTrailTexture,
            vec2( ( float(i) + 0.5 ) / ${$b}.0, 0.5 )
          );
          float dist    = length( worldXZ - td.rg );
          float relDist = dist - uWaveSpeed * td.b;
          float window  = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
          float fade    = exp( -td.b / uFadeTime );
          float atten   = 1.0 / ( 1.0 + dist * 0.1 );
          float weight  = fade * window * atten * td.a;

          waveHeight  += weight * cos( uWaveFreq * relDist );
          totalWeight += weight;
        }

        waveHeight /= max( totalWeight, 1.0 );

        float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
        transformed.y += displacement;
        vHeight = displacement;
      }`);function cx(e,t){let n=`#ff6a2b`,r=`#0b0b0d`,i=t.clientWidth,a=t.clientHeight,o=Math.min(window.devicePixelRatio,1.35,Math.sqrt(16e5/Math.max(1,i*a))),s=new vm;s.background=new hm(r),s.fog=new _m(r,9,26);let c=new Qg(40,i/a,.1,200),l=new lp,u=new lp,d=(e,t)=>{let n=.7+t*rx,r=e*ix;c.position.set(-12*Math.cos(n)*Math.sin(r),nx*Math.cos(n)*Math.cos(r),nx*Math.sin(n)),c.up.set(0,1,0),c.lookAt(0,0,0)};d(0,0);let f=new Lb({canvas:e,antialias:!0});f.toneMapping=4,f.toneMappingExposure=1.3,f.shadowMap.enabled=!0,f.shadowMap.type=1,f.setSize(i,a,!1),f.setPixelRatio(o);let p=new Yb(f);p.addPass(new Qb(s,c)),p.addPass(new Kb(ox)),p.addPass(new Zb),p.setSize(i,a),p.setPixelRatio(o),s.add(new n_(`#ffffff`,.35));let m=new t_(`#ffffff`,3);m.position.set(-20,12,-6),m.castShadow=!0,m.shadow.mapSize.set(1024,1024),m.shadow.radius=6,m.shadow.camera.near=.1,m.shadow.camera.far=60,m.shadow.camera.left=-22,m.shadow.camera.right=22,m.shadow.camera.top=22,m.shadow.camera.bottom=-22,m.shadow.bias=1e-4,s.add(m);let h=new t_(n,1.2);h.position.set(12,4,10),s.add(h);let g=31.999999999999996,_=[{x:-2.8,z:-1.2,age:.6,distDelta:1.2},{x:3.1,z:2.4,age:1.1,distDelta:1}],v=null,y=0,b=0,x=!0,S=new Float32Array(192),C=new zh(S,$b,1,Nd,wd);C.needsUpdate=!0;let w={uTrailTexture:{value:C},uTrailCount:{value:0},uFadeTime:{value:ax.fadeTime}},T=new Ih(new og(g,g),new wh({side:2,visible:!1}));T.rotation.x=-Math.PI/2,T.updateMatrixWorld(!0);let E=new S_,D=new lp,O=e=>{_.length>=$b&&_.shift(),_.push(e)},k=()=>({...w,uWaveSpeed:{value:ax.speed},uWaveFreq:{value:ax.frequency},uWaveWidth:{value:ax.width},uAmplitude:{value:.5},uJitter:{value:ax.jitter},uMaxHeight:{value:.5}}),A=1600,j=new Bb(ex,tx,ex,2,.12),ee=new Bh(new Float32Array(A*2),2);j.setAttribute(`aOffset`,ee);let M=new _g({color:16777215,shininess:60});M.onBeforeCompile=e=>{Object.assign(e.uniforms,k(),{uColorBase:{value:new hm(`#2a2a30`)},uColorHigh:{value:new hm(n)},uGlow:{value:.9}}),e.vertexShader=sx(e.vertexShader),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
        varying float vHeight;
        uniform vec3  uColorBase;
        uniform vec3  uColorHigh;
        uniform float uMaxHeight;
        uniform float uGlow;`).replace(`#include <color_fragment>`,`#include <color_fragment>
        float crest  = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
        float trough = clamp( -vHeight / uMaxHeight, 0.0, 1.0 );
        diffuseColor.rgb = mix( uColorBase, uColorHigh, crest ) * ( 1.0 - trough * 0.6 );`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
        totalEmissiveRadiance += uColorHigh * crest * crest * uGlow;`)};let te=new vg;te.onBeforeCompile=e=>{Object.assign(e.uniforms,k()),e.vertexShader=sx(e.vertexShader)};let N=new Jh(j,M,A);N.customDepthMaterial=te,N.castShadow=!0,N.receiveShadow=!0,s.add(N);let P=new sm,ne=.7999999999999999,re=39*ne/2;for(let e=0;e<40;e++)for(let t=0;t<40;t++){let n=e*40+t,r=e*ne-re,i=t*ne-re;P.position.set(r,0,i),P.updateMatrix(),N.setMatrixAt(n,P.matrix),ee.setXY(n,r,i)}N.instanceMatrix.needsUpdate=!0,ee.needsUpdate=!0;let ie=e=>{let n=t.getBoundingClientRect(),r=(e.clientX-n.left)/n.width*2-1,i=-((e.clientY-n.top)/n.height)*2+1;if(Math.abs(r)>1||Math.abs(i)>1)return;l.set(r,i),D.set(r,i),E.setFromCamera(D,c);let a=E.intersectObject(T);if(a.length===0)return;let{x:o,z:s}=a[0].point,u=0;v&&(u=Math.hypot(o-v.x,s-v.z),u<ax.trailSpacing)||(O({x:o,z:s,age:0,distDelta:u}),v={x:o,z:s},y=0,x=!1,b=0)},ae=new ResizeObserver(()=>{t.clientWidth&&t.clientHeight&&(i=t.clientWidth,a=t.clientHeight,o=Math.min(window.devicePixelRatio,1.35,Math.sqrt(16e5/Math.max(1,i*a))),c.aspect=i/a,c.updateProjectionMatrix(),f.setSize(i,a,!1),f.setPixelRatio(o),p.setSize(i,a),p.setPixelRatio(o))});return ae.observe(t),{update:e=>{u.x+=(l.x-u.x)*.04,u.y+=(l.y-u.y)*.04,d(u.x,u.y);let t=ax.fadeTime*4;for(let n=_.length-1;n>=0;n--)_[n].age+=e,_[n].age>t&&_.splice(n,1);y+=e,y>=3&&!x&&(x=!0,b=0),x&&(b+=e,b>=1.5&&(O({x:(Math.random()*.5-.25)*g,z:(Math.random()*.5-.25)*g,age:0,distDelta:ax.idleStrength+Math.random()*.2}),b=0));let n=Math.min(_.length,$b);if(n>0||w.uTrailCount.value>0){for(let e=0;e<n;e++)S.set([_[e].x,_[e].z,_[e].age,_[e].distDelta],e*4);C.needsUpdate=!0,w.uTrailCount.value=n}p.render()},dispose:()=>{ae.disconnect(),N.dispose(),j.dispose(),M.dispose(),te.dispose(),T.geometry.dispose(),T.material.dispose(),C.dispose();for(let e of p.passes)e.dispose();p.dispose(),m.shadow.dispose(),f.dispose()},pointerMove:ie}}var lx=[`data-renderer`,`data-running`],ux=hr({__name:`AuthDarkCubes`,setup(e){let t=U(),n=U(),r=U(`idle`),i=U(!1),a;return Er(()=>{let e=n.value,o=t.value,s=o?.closest(`#auth-view`);if(!e||!o||!s)return;let c=matchMedia(`(prefers-reduced-motion: reduce)`),l=CSS.supports(`backdrop-filter`,`invert(1)`)||CSS.supports(`-webkit-backdrop-filter`,`invert(1)`),u,d=!1,f=!1,p=0,m=0;function h(){cancelAnimationFrame(p),p=m=0,i.value=!1}function g(e){if(p=0,f&&u){if(!m||e-m>=1e3/30){let t=m?Math.min((e-m)/1e3,.1):1/30;m=e,u.update(t)}p=requestAnimationFrame(g)}}function _(){let t=Number.parseFloat(s.style.getPropertyValue(`--auth-theme-split`)),n=l?Number.isFinite(t)&&t<100:s.dataset.theme===`dark`;if(f=d&&n&&!s.hidden&&!s.inert&&!document.hidden,!f||r.value===`fallback`)h();else{if(!u)try{u=cx(e,o),r.value=`ready`}catch{r.value=`fallback`,h();return}c.matches?(h(),u.update(0)):p||=(i.value=!0,requestAnimationFrame(g))}}function v(e){if(!f||c.matches||e.pointerType!==`mouse`)return;let t=Number.parseFloat(s.style.getPropertyValue(`--auth-theme-split`));l&&e.clientX<s.clientWidth*t/100||u?.pointerMove(e)}function y(e){e.preventDefault(),h(),r.value=`fallback`}function b(){u?.dispose(),u=void 0,r.value=`idle`,_()}let x=new IntersectionObserver(([e])=>{d=e.isIntersecting,_()});x.observe(o);let S=new MutationObserver(_);S.observe(s,{attributes:!0,attributeFilter:[`hidden`,`inert`,`style`,`data-theme`]}),window.addEventListener(`pointermove`,v,{passive:!0}),document.addEventListener(`visibilitychange`,_),c.addEventListener(`change`,_),e.addEventListener(`webglcontextlost`,y),e.addEventListener(`webglcontextrestored`,b),_(),a=()=>{f=!1,h(),x.disconnect(),S.disconnect(),window.removeEventListener(`pointermove`,v),document.removeEventListener(`visibilitychange`,_),c.removeEventListener(`change`,_),e.removeEventListener(`webglcontextlost`,y),e.removeEventListener(`webglcontextrestored`,b),u?.dispose()}}),Or(()=>a?.()),(e,a)=>(K(),q(`div`,{ref_key:`container`,ref:t,class:`auth-dark-cubes`,"data-renderer":r.value,"data-running":i.value,"aria-hidden":`true`},[J(`canvas`,{ref_key:`canvas`,ref:n},null,512)],8,lx))}}),dx=[`data-ready`],fx=[`hidden`,`tabindex`],px={key:0,class:`auth-gallery-fallback`},mx=[`src`,`alt`],hx=hr({__name:`AuthGallery`,setup(e){let t=U(null),n=U(!1),r=U(!1),i=U(!1),a,o=e=>Math.max(0,Math.min(1,e)),s=(e,t)=>(e%t+t)%t;function c(e,t,n){let r=Math.imul(e+1,374761393)^Math.imul(t+1,668265263)^Math.imul(n+1,982451653);return(Math.imul(r^r>>>13,1274126177)>>>16&65535)/65535}return Er(()=>{let e=t.value,l=e?.getContext(`2d`);if(!e||!l){r.value=!0;return}let u=e,d=l,f=matchMedia(`(prefers-reduced-motion: reduce)`),p=[],m=[],h=new Map,g=!0,_=!1,v=!1,y=0,b=0,x=0,S=0,C=0,w=1,T=0,E=1,D=0,O=0,k=null,A=null;async function j(){v=!0;let e=await Promise.all(Gu.map(async({src:e})=>{let t=new Image;t.src=e;try{return await t.decode(),t}catch{return null}}));if(g){for(let t of e)t&&p.push(t);r.value=p.length===0,ee(),re()}}function ee(){if(!_||!p.length)return;let e=u.clientWidth,t=u.clientHeight,r=Math.min(devicePixelRatio||1,1.5);if(!e||!t||e===y&&t===b&&r===w)return;let i=C;y=e,b=t,w=r,S=Math.round(b*.8),x=Math.round(S*.8),C=x+Math.max(12,Math.round(x*.085)),i&&(T*=C/i),u.width=Math.round(y*w),u.height=Math.round(b*w),d.setTransform(w,0,0,w,0,0),m.length=0,h.clear();for(let e of p){let t=document.createElement(`canvas`);t.width=Math.round(x*w),t.height=Math.round(S*w);let n=Math.min(e.naturalWidth/t.width,e.naturalHeight/t.height),r=t.width*n,i=t.height*n;t.getContext(`2d`).drawImage(e,(e.naturalWidth-r)/2,(e.naturalHeight-i)/2,r,i,0,0,t.width,t.height),m.push(t)}N(),n.value=!0}function M(e,t,n,r,i,a,o){let s=n*n+r*r,l=s<i*i,u=e.get(t);if(!l&&!u)return;let d=u??{x:0,y:0},f=0,p=0;if(l){let e=Math.sqrt(s),a=i*(.84+c(t,0,0)*.36)*(1-e/i)**1.45,o=e>.001?Math.atan2(r,n):t*2.4;f=Math.cos(o)*a,p=Math.sin(o)*a}let m=l?a:o;if(d.x+=(f-d.x)*m,d.y+=(p-d.y)*m,!l&&d.x*d.x+d.y*d.y<.16)e.delete(t);else return u||e.set(t,d),d}function te(e,t,n,r,i,a,s,l){let u=Math.max(7,Math.round(x/21)),f=Math.ceil(x/u),p=Math.max(34,Math.min(49,x*.255)),m=1-Math.exp(-l/34),g=1-Math.exp(-l/78),_=h.get(e)??(s?new Map:void 0),v=s?.x??1/0,b=s?.y??1/0,C=e.width/x,w=e.height/S,T=Math.min(i*.88,x*.76);for(let s=0,l=0;s<S;s+=u,l++){let h=Math.min(u,S-s),E=r+s+h/2,D=1-Math.abs((s+h/2)/S*2-1);for(let O=0,k=0;O<x;O+=u,k++){let A=Math.min(u,x-O),j=n+O+A/2,ee=a?0:o(1-Math.min(j,y-j)/i),te=ee?Math.max(0,ee-.05-c(k,l,t)*.31):0,N=l*f+k,P=_&&!te?M(_,N,j-v,E-b,p,m,g):void 0;if(te&&_?.delete(N),!te){if(P)continue;let t=O+A<x?.4:0,i=s+h<S?.4:0;d.globalAlpha=1,d.drawImage(e,O*C,s*w,A*C,h*w,n+O,r+s,A+t,h+i);continue}let ne=c(k+13,l+67,t),re=.74*(1-Math.exp(-10*te))+.26*o(te/.7),ie=(j<y/2?-1:1)*re*(13+ne*T),ae=.26+c(k+59,l+23,t)*.39+D*.19-ne*.1,oe=ae*(.28+c(k+9,l+47,t)*.25),se=o((te-oe)/(ae-oe));if(se>=1)continue;let ce=n+O+ie;if(ce+A<0||ce>=y)continue;let le=r+s+(c(k+37,l+9,t)-.5)*re*84,ue=1-se*.59,de=ce+A*ue/2,fe=Math.min(de,y-de),pe=i*(.035+(1-D)*.21)*re,me=o((fe-pe)/(9+ne*i*.24));me&&(d.globalAlpha=(1-se)**1.42*me,d.drawImage(e,O*C,s*w,A*C,h*w,ce,le,A*ue,h*ue))}}if(d.globalAlpha=1,_?.size){h.set(e,_);for(let[t,i]of _){let a=t%f*u,o=Math.floor(t/f)*u,s=Math.min(u,x-a),c=Math.min(u,S-o);d.drawImage(e,a*C,o*w,s*C,c*w,n+a+i.x,r+o+i.y,s,c)}}else h.delete(e)}function N(e=0){if(!m.length)return;d.clearRect(0,0,y,b);let t=h.size?new Set(h.keys()):null,n=(y-x)/2-T,r=(b-S)/2,i=Math.min(y*.235,x*.98),a=Math.floor((-x-n)/C);for(let o=a;n+o*C<y;o++){let a=n+o*C;if(a+x<=0)continue;let c=s(o+1,m.length),l=m[c];t?.delete(l);let u=a>=i&&a+x<=y-i,p=a+x/2,g=(u||p>=y/2-C&&p<y/2+C)&&A&&A.x>=a&&A.x<=a+x&&A.y>=r&&A.y<=r+S?A:null;f.matches||u&&!g&&!h.has(l)?d.drawImage(l,a,r,x,S):te(l,c,a,r,i,u,g,e)}t?.forEach(e=>h.delete(e))}function P(e,t=0){C&&m.length&&(T=s(T+e,C*m.length),N(t))}function ne(e){D=requestAnimationFrame(ne);let t=O?e-O:0;if(O&&t<(A||h.size?12:30))return;O=e;let n=Math.min(t,45);k?h.size&&N(n):P(n*.027*E,n)}function re(){cancelAnimationFrame(D),O=0,(!_||document.hidden||f.matches)&&(A=null,h.clear()),_&&!document.hidden&&m.length&&(N(),f.matches||(D=requestAnimationFrame(ne)))}function ie(e){e.button===0&&e.isPrimary&&n.value&&(k={id:e.pointerId,x:e.clientX},A=null,i.value=!0,u.setPointerCapture(e.pointerId))}function ae(e){A=!f.matches&&e.pointerType===`mouse`&&e.offsetX>=0&&e.offsetX<y&&e.offsetY>=0&&e.offsetY<b?{x:e.offsetX,y:e.offsetY}:null}function oe(e){if(!k)ae(e);else if(e.pointerId===k.id){let t=k.x-e.clientX;Math.abs(t)>.5&&(E=Math.sign(t)),P(t),k.x=e.clientX}}function se(){A=null}function ce(e){e.pointerId===k?.id&&(k=null,i.value=!1,e.type===`pointerup`&&ae(e))}function le(e){!n.value||e.key!==`ArrowLeft`&&e.key!==`ArrowRight`||(e.preventDefault(),E=e.key===`ArrowLeft`?-1:1,P(C*E))}let ue=new IntersectionObserver(([e])=>{_=e.isIntersecting,_&&!v&&j(),_&&ee(),re()}),de=new ResizeObserver(ee);ue.observe(u),de.observe(u),u.addEventListener(`pointerdown`,ie),u.addEventListener(`pointermove`,oe),u.addEventListener(`pointerleave`,se),u.addEventListener(`pointerup`,ce),u.addEventListener(`pointercancel`,ce),u.addEventListener(`lostpointercapture`,ce),u.addEventListener(`keydown`,le),document.addEventListener(`visibilitychange`,re),f.addEventListener(`change`,re),a=()=>{g=!1,cancelAnimationFrame(D),ue.disconnect(),de.disconnect(),u.removeEventListener(`pointerdown`,ie),u.removeEventListener(`pointermove`,oe),u.removeEventListener(`pointerleave`,se),u.removeEventListener(`pointerup`,ce),u.removeEventListener(`pointercancel`,ce),u.removeEventListener(`lostpointercapture`,ce),u.removeEventListener(`keydown`,le),document.removeEventListener(`visibilitychange`,re),f.removeEventListener(`change`,re)}}),Or(()=>a?.()),(e,a)=>(K(),q(`div`,{class:`auth-gallery`,"data-ready":n.value},[J(`canvas`,{ref_key:`surface`,ref:t,class:pe([`auth-gallery-canvas`,{"is-dragging":i.value}]),hidden:r.value,tabindex:n.value?0:-1,role:`group`,"aria-label":`风景图片画廊，可拖动或用左右方向键浏览`},null,10,fx),r.value?(K(),q(`div`,px,[(K(!0),q(G,null,Pr(W(Gu),e=>(K(),q(`img`,{key:e.src,src:e.src,alt:e.alt,loading:`lazy`},null,8,mx))),128))])):ea(``,!0)],8,dx))}});function gx(){let e,t,n=!1;function r(){if(!window.AudioContext)return;let r=e??=new AudioContext;r.resume().catch(()=>{}),!(t||n)&&(n=!0,Promise.all([fetch(`/assets/auth/keyboard/config.json`).then(e=>{if(!e.ok)throw Error(`Keyboard timing unavailable`);return e.json()}),fetch(`/assets/auth/keyboard/sound.ogg`).then(e=>{if(!e.ok)throw Error(`Keyboard sound unavailable`);return e.arrayBuffer()}).then(e=>r.decodeAudioData(e))]).then(([n,i])=>{e===r&&(t={buffer:i,cues:n.defines})}).catch(()=>{}).finally(()=>{n=!1}))}function i(n,r=!1){let i=t?.cues[n];if(!e||e.state!==`running`||!t||!i)return;let[a,o]=i,s=a+(r?o*.54:0),c=o*(r?.46:.51),l=e.createBufferSource(),u=e.createGain();l.buffer=t.buffer,u.gain.value=r?.22:.4,l.connect(u),u.connect(e.destination),l.onended=()=>{l.disconnect(),u.disconnect()},l.start(0,s/1e3,c/1e3)}function a(){e?.close().catch(()=>{}),e=void 0,t=void 0}return{prepare:r,play:i,dispose:a}}var _x=[`aria-expanded`,`aria-controls`],vx={class:`auth-keyboard-controls`},yx=[`aria-pressed`],bx=[`aria-label`,`aria-pressed`,`onPointerdown`,`onPointerup`,`onClick`],xx={key:2},Sx={key:0,"aria-hidden":`true`},Cx=hr({__name:`AuthKeyboard`,props:{tileStyle:{}},emits:[`openEntry`],setup(e,{emit:t}){let n=t;function r(e,t){return e.map(([e,n],r)=>({text:e,shifted:n??e.toUpperCase(),scan:t+r}))}let i={action:`close`,label:`Esc`,scan:1},a=[[{text:"`",shifted:`~`,scan:41},...r([`1!`,`2@`,`3#`,`4$`,`5%`,`6^`,`7&`,`8*`,`9(`,`0)`,`-_`,`=+`],2),{action:`delete`,label:`退格`,scan:14,units:1.6}],[{action:`tab`,label:`Tab`,scan:15,units:1.6},...r([...`qwertyuiop`,`[{`,`]}`],16),{text:`\\`,shifted:`|`,scan:43}],[{action:`caps`,label:`Caps`,scan:58,units:1.8},...r([...`asdfghjkl`,`;:`,`'"`],30),{action:`enter`,label:`Enter`,scan:28,units:2.1}],[{action:`shift`,label:`Shift`,scan:42,units:2.3},...r([...`zxcvbnm`,`,<`,`.>`,`/?`],44),{action:`shift`,label:`Shift`,scan:54,units:2.5}],[{action:`space`,label:`空格`,scan:57}]],o=U(),s=U(),c=U(),l=U(!1),u=U(!1),d=U(!1),f=U(!1),p=U(),m=gx(),h=null,g=null,_,v,y;function b(){let e=h?.querySelectorAll(`.auth-phone-content input`)??[];return Array.from(e).filter(e=>[`text`,`password`,`email`,`search`,`tel`,`url`].includes(e.type)).filter(e=>!e.matches(`:disabled`)&&!e.readOnly&&!e.closest(`[hidden], [inert]`))}function x(e=b()){let t=document.activeElement;return t instanceof HTMLInputElement&&e.includes(t)?t:g&&e.includes(g)?g:e[0]}function S(e=!1){O(),e&&s.value?.contains(document.activeElement)&&(x()??o.value)?.focus({preventScroll:!0}),l.value=!1,d.value=!1,u.value=!1}async function C(){if(l.value){S();return}let e=x();e||=(n(`openEntry`),await _n(),x()),matchMedia(`(hover: none) and (pointer: coarse)`).matches||(l.value=!0,f.value||m.prepare()),e?.focus()}function w(e,t,n=!1){e.focus({preventScroll:!0});let r=e.value;if(typeof document.execCommand==`function`&&document.execCommand(n?`delete`:`insertText`,!1,t)||e.value!==r)return e.value!==r;let i=e.selectionStart??r.length,a=e.selectionEnd??i;n&&i===a&&(i-=Array.from(r.slice(0,i)).at(-1)?.length??0);let o=r.slice(0,i)+t+r.slice(a);return o===r||e.maxLength>=0&&o.length>e.maxLength?!1:(e.value=o,e.selectionStart!==null&&e.setSelectionRange(i+t.length,i+t.length),e.dispatchEvent(new InputEvent(`input`,{bubbles:!0,inputType:n?`deleteContentBackward`:`insertText`,data:n?null:t})),e.value!==r)}function T(e){return(/^[a-z]$/.test(e.text)?u.value!==d.value:d.value)?e.shifted:e.text}function E(e,t=!1){f.value||m.play(e.scan,t)}function D(){f.value=!f.value,f.value||m.prepare()}function O(e){e&&e.pointerId!==p.value||(window.clearTimeout(v),window.clearInterval(y),p.value=void 0)}function k(e,t){if(!t.isPrimary||t.button!==0||(E(e),!(`action`in e)||e.action!==`delete`))return;let n=t.currentTarget;if(!(n instanceof HTMLElement))return;O(),p.value=t.pointerId,n.setPointerCapture(t.pointerId);let r=x();if(!r||!w(r,``,!0))return;d.value=!1;function i(){x()!==r||!w(r,``,!0)?window.clearInterval(y):E(e)}v=window.setTimeout(()=>{y=window.setInterval(i,55),i()},380)}function A(e,t){t.isPrimary&&t.button===0&&E(e,!0),O(t)}function j(e,t){t.detail===0?(E(e),ee(e)):`action`in e&&e.action===`delete`||ee(e)}function ee(e){if(`action`in e){if(e.action===`close`){S(!0);return}if(e.action===`shift`){d.value=!d.value;return}if(e.action===`caps`){u.value=!u.value;return}}let t=b(),n=x(t);if(n){if(!(`action`in e))w(n,T(e));else if(e.action===`delete`)w(n,``,!0);else if(e.action===`space`)w(n,` `);else if(e.action===`tab`){let e=d.value?-1:1;t[(t.indexOf(n)+e+t.length)%t.length]?.focus()}else if(e.action===`enter`){let e=n.form?.querySelector(`button[type="submit"]:enabled`);e&&n.form?.requestSubmit(e)}d.value=!1}}function M(e){e.target instanceof HTMLInputElement&&b().includes(e.target)&&(g=e.target)}function te(e){l.value&&e.target instanceof Node&&!h?.contains(e.target)&&!s.value?.contains(e.target)&&S()}function N(e){l.value&&e.key===`Escape`&&S(!0)}Er(()=>{h=o.value?.closest(`.auth-phone`)??null,c.value=h?.closest(`#auth-view`)??void 0,h?.addEventListener(`focusin`,M),document.addEventListener(`pointerdown`,te,!0),document.addEventListener(`keydown`,N),window.addEventListener(`blur`,P),c.value&&(_=new MutationObserver(()=>{(c.value?.hidden||c.value?.inert)&&(S(),g=null)}),_.observe(c.value,{attributeFilter:[`hidden`,`inert`]}))});function P(){O()}return Or(()=>{O(),m.dispose(),h?.removeEventListener(`focusin`,M),document.removeEventListener(`pointerdown`,te,!0),document.removeEventListener(`keydown`,N),window.removeEventListener(`blur`,P),_?.disconnect()}),(t,n)=>(K(),q(G,null,[J(`button`,{ref_key:`trigger`,ref:o,class:`auth-dock-button`,"aria-label":`键盘`,type:`button`,"aria-expanded":l.value,"aria-controls":l.value?`auth-keyboard`:void 0,onMousedown:n[0]||=rs(()=>{},[`prevent`]),onClick:C},[J(`span`,{class:`auth-dock-tile`,"aria-hidden":`true`,style:ce(e.tileStyle)},[Y(W(Hc))],4),n[7]||=J(`span`,{class:`auth-dock-tip`,"aria-hidden":`true`},`键盘`,-1)],40,_x),c.value?(K(),Gi(Zn,{key:0,to:c.value},[Y(Ga,{name:`auth-keyboard`},{default:jn(()=>[l.value?(K(),q(`section`,{key:0,id:`auth-keyboard`,ref_key:`panel`,ref:s,class:`auth-virtual-keyboard`,"aria-label":`虚拟键盘`},[J(`div`,vx,[J(`button`,{type:`button`,class:`auth-keycap auth-keycap-control`,"aria-label":`关闭键盘`,onMousedown:n[1]||=rs(()=>{},[`prevent`]),onPointerdown:n[2]||=e=>k(i,e),onPointerup:n[3]||=e=>A(i,e),onClick:n[4]||=e=>j(i,e)},` Esc `,32),J(`button`,{type:`button`,class:`auth-keycap auth-keycap-control auth-keyboard-mute`,"aria-label":`键盘音效`,"aria-pressed":!f.value,onMousedown:n[5]||=rs(()=>{},[`prevent`]),onClick:D},[f.value?(K(),Gi(W(ul),{key:0,"aria-hidden":`true`})):(K(),Gi(W(ll),{key:1,"aria-hidden":`true`}))],40,yx)]),(K(),q(G,null,Pr(a,(e,t)=>J(`div`,{key:t,class:`auth-keyboard-row`},[(K(!0),q(G,null,Pr(e,(e,t)=>(K(),q(`button`,{key:t,type:`button`,class:pe([`auth-keycap`,{"auth-keycap-control":`action`in e,"auth-keycap-space":`action`in e&&e.action===`space`,"is-held":`action`in e&&e.action===`delete`&&p.value!==void 0}]),style:ce(`action`in e&&e.units?{"--key-units":e.units}:void 0),"aria-label":`action`in e?e.label:T(e),"aria-pressed":`action`in e&&e.action===`shift`?d.value:`action`in e&&e.action===`caps`?u.value:void 0,onMousedown:n[6]||=rs(()=>{},[`prevent`]),onPointerdown:t=>k(e,t),onPointerup:t=>A(e,t),onPointercancel:O,onLostpointercapture:O,onClick:t=>j(e,t)},[`action`in e?(K(),q(G,{key:0},[e.action===`delete`?(K(),Gi(W(Pc),{key:0,"aria-hidden":`true`})):e.action===`shift`?(K(),Gi(W(Cc),{key:1,"aria-hidden":`true`})):(K(),q(`span`,xx,F(e.label),1))],64)):(K(),q(G,{key:1},[e.shifted&&e.shifted!==e.text.toUpperCase()?(K(),q(`small`,Sx,F(d.value?e.text:e.shifted),1)):ea(``,!0),J(`span`,null,F(T(e)),1)],64))],46,bx))),128))])),64))],512)):ea(``,!0)]),_:1})],8,[`to`])):ea(``,!0)],64))}}),wx=[`id`,`aria-label`,`aria-controls`,`aria-selected`,`tabindex`,`onClick`],Tx={class:`auth-dock-tip`,"aria-hidden":`true`},Ex={key:0,class:`auth-dock-login-note`,"aria-hidden":`true`},Dx=hr({__name:`AuthDock`,props:{active:{}},emits:[`select`],setup(e,{emit:t}){let n=e,r=t,i=[{id:`home`,label:`主界面`,icon:Vc,controls:`auth-phone-home-panel`},{id:`login`,label:`登录`,icon:Gc,controls:`login-panel`},{id:`register`,label:`注册`,icon:sl,controls:`register-panel`}],a=Wt(null),o=matchMedia(`(prefers-reduced-motion: reduce)`);function s(){a.value=null}o.addEventListener(`change`,s),Or(()=>o.removeEventListener(`change`,s));function c(e){if(o.matches||e.pointerType===`touch`)return;let t=e.currentTarget;if(!(t instanceof HTMLElement)||!(e.target instanceof Element))return;let n=t.getBoundingClientRect(),r=[...t.querySelectorAll(`.auth-dock-button`)],i=e.target.closest(`.auth-dock-button`),s=r.map(e=>{let t=e.getBoundingClientRect();return{x:t.left-n.left+t.width/2,y:t.top-n.top+t.height/2}});a.value={x:e.clientX-n.left,y:e.clientY-n.top,centers:s,label:i?.getAttribute(`aria-label`)??null,atRightEdge:i===r.at(-1)}}function l(e){let t=a.value,n=t?.centers[e];return!t||!n?{}:{transform:ml(t.x-n.x,t.y-n.y)}}function u(){n.active===`home`&&r(`select`,`login`)}function d(e){if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;e.preventDefault(),s();let t=i.findIndex(e=>e.id===n.active),a=e.key===`ArrowLeft`?-1:1,o=e.key===`Home`?0:e.key===`End`?i.length-1:(t+a+i.length)%i.length;r(`select`,i[o].id),document.getElementById(`${i[o].id}-tab`)?.focus()}return(t,n)=>(K(),q(`div`,{class:`auth-dock`,onPointermove:c,onPointerleave:s},[J(`div`,{class:`auth-dock-tabs`,role:`tablist`,"aria-label":`手机导航`,onKeydown:d},[(K(),q(G,null,Pr(i,(t,n)=>J(`button`,{id:`${t.id}-tab`,key:t.id,class:`auth-dock-button`,type:`button`,role:`tab`,"aria-label":t.label,"aria-controls":t.controls,"aria-selected":e.active===t.id,tabindex:e.active===t.id?0:-1,onClick:e=>r(`select`,t.id)},[J(`span`,{class:`auth-dock-tile`,"aria-hidden":`true`,style:ce(l(n))},[(K(),Gi(jr(t.icon)))],4),J(`span`,Tx,F(t.label),1)],8,wx)),64)),e.active===`home`&&!a.value?(K(),q(`span`,Ex,[...n[0]||=[J(`svg`,{viewBox:`0 0 68 43`,fill:`none`},[J(`path`,{d:`M64 8C52 1 40 5 32 12s-6 15 0 15c4 0 4-8-3-9C18 16 8 28 3 39m-1-11 1 11 11-3`})],-1),J(`span`,null,`点击登录`,-1)]])):ea(``,!0)],32),Y(Cx,{"tile-style":l(i.length),onOpenEntry:u},null,8,[`tile-style`]),a.value?.label?(K(),q(`span`,{key:0,class:pe([`auth-dock-follower`,{"is-right":a.value.atRightEdge}]),style:ce({transform:`translate(${a.value.x}px, ${a.value.y}px)`}),"aria-hidden":`true`},[Y(W(Kc)),J(`span`,null,F(a.value.label),1)],6)):ea(``,!0)],32))}}),Ox=new Set([`passwordpassword`,`password123456789`,`123456789012345`,`qwertyuiopasdfgh`]);function kx(e){if(!e)return`请输入密码。`;let t=Array.from(e);return t.length<6||t.length>16?`密码需要6–16个字符。`:!e.trim()||new Set(t).size<3||Ox.has(e.toLowerCase())?`密码过于简单：至少使用3个不同字符，且不要使用常见弱密码。`:``}function Ax(e){return e?/^[a-zA-Z0-9_]{4,32}$/.test(e)?``:`用户名需要4–32位英文字母、数字或下划线，不能包含空格或中文。`:`请输入用户名。`}function jx(e,t){return e?Array.from(e).length>128?`${t}最多128个字符。`:``:`请输入${t}。`}function Mx(e){return e instanceof Error?e:{message:`请求失败，请稍后重试。`}}var Nx={class:`auth-entry-field`},Px=[`for`],Fx={class:`auth-entry-input-wrap`},Ix=[`id`,`type`,`aria-invalid`,`aria-describedby`],Lx=[`aria-label`,`aria-pressed`],Rx=[`id`],zx=[`id`],Bx=hr({inheritAttrs:!1,__name:`AuthEntryInput`,props:Hr({id:{},label:{},kind:{default:`text`},error:{},hint:{},masked:{type:Boolean}},{modelValue:{required:!0},modelModifiers:{}}),emits:[`update:modelValue`],setup(e){let t=e,n=qr(e,`modelValue`),r=U(!1),i=U();Rn(()=>t.masked,e=>{e&&(r.value=!1)});function a(){let e=i.value,t=e&&[e.selectionStart,e.selectionEnd];r.value=!r.value,e&&t&&(e.type=r.value?`text`:`password`,e.setSelectionRange(t[0],t[1]))}return(t,o)=>(K(),q(`div`,Nx,[J(`label`,{for:e.id},F(e.label),9,Px),J(`div`,Fx,[Mn(J(`input`,ia({ref_key:`input`,ref:i,"onUpdate:modelValue":o[0]||=e=>n.value=e,id:e.id,class:`auth-entry-input`},t.$attrs,{type:e.kind===`password`&&r.value?`text`:e.kind,"aria-invalid":e.error?`true`:void 0,"aria-describedby":e.error?e.id+`-error`:e.hint?e.id+`-hint`:void 0}),null,16,Ix),[[Qo,n.value]]),e.kind===`password`?(K(),q(`button`,{key:0,type:`button`,class:`auth-entry-reveal`,"aria-label":r.value?`隐藏密码`:`显示密码`,"aria-pressed":r.value,onMousedown:o[1]||=rs(()=>{},[`prevent`]),onClick:a},[r.value?(K(),Gi(W(Ic),{key:0,"aria-hidden":`true`})):(K(),Gi(W(Lc),{key:1,"aria-hidden":`true`}))],40,Lx)):ea(``,!0)]),e.error?(K(),q(`span`,{key:0,id:e.id+`-error`,class:`auth-entry-error`},F(e.error),9,Rx)):e.hint?(K(),q(`span`,{key:1,id:e.id+`-hint`,class:`auth-entry-hint`},F(e.hint),9,zx)):ea(``,!0)]))}}),Vx=[`hidden`],Hx={key:0,class:`auth-entry-warning`,role:`status`},Ux=[`hidden`],Wx=[`hidden`,`inert`],Gx={key:0,class:`auth-entry-success`,role:`status`},Kx=[`disabled`],qx={class:`auth-entry-remember`},Jx={key:0,class:`auth-entry-error`,role:`alert`},Yx=[`disabled`,`aria-busy`],Xx={class:`auth-entry-arrow`},Zx=[`hidden`,`inert`],Qx={key:0,class:`auth-entry-warning`,role:`status`},$x=[`disabled`],eS={class:`auth-entry-code-row`},tS=[`disabled`,`aria-busy`],nS={key:0,class:`auth-entry-success`,role:`status`},rS={key:1,class:`auth-entry-error`,role:`alert`},iS=[`disabled`,`aria-busy`],aS={class:`auth-entry-arrow`},oS=hr({__name:`AuthEntryForms`,props:{auth:{},panel:{}},emits:[`select`],setup(e,{emit:t}){let n=e,r=t,i=jt({username:``,password:``,rememberMe:!1}),a=jt({username:``,email:``,emailCode:``,displayName:``,password:``,confirmation:``}),o=jt({}),s=jt({}),c=U(),l=U(``),u=U(``),d=U(``),f=U(!1),p=U(),m=ka(()=>a.email.trim().toLowerCase()),h=U(Date.now()),g=jt(new Map),_=ka(()=>Math.max(0,Math.ceil(((g.get(m.value)??0)-h.value)/1e3))),v=ka(()=>n.auth.registrationAllowed&&!c.value&&!_.value),y,b=location.protocol===`http:`&&!window.isSecureContext;function x(){h.value=Date.now();for(let[e,t]of g)t<=h.value&&g.delete(e);g.size&&(y=setTimeout(x,500))}function S(e,t){g.set(e,Date.now()+t*1e3),clearTimeout(y),x()}Or(()=>clearTimeout(y)),Rn(m,()=>{p.value=void 0,a.emailCode=``,d.value=``,s.emailCode=``}),Rn(()=>n.auth.visible,e=>{e||(i.password=``,a.password=a.confirmation=``,a.emailCode=``,i.rememberMe=!1)});function C(e){o[e]=``,l.value=``,f.value=!1}function w(e){s[e]=``,e===`password`&&s.confirmation&&(s.confirmation=T()),u.value=``}function T(){return a.confirmation?a.confirmation===a.password?``:`两次输入的密码不一致。`:`请再次输入密码。`}function E(){return m.value?m.value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value)&&/^[\x21-\x7e]+$/.test(m.value)?``:`请输入有效的邮箱地址。`:`请输入邮箱。`}function D(e){_n(()=>document.getElementById(e)?.focus())}async function O(){if(!c.value){if(f.value=!1,l.value=``,o.username=Ax(i.username),o.password=jx(i.password,`密码`),o.username||o.password)D(o.username?`login-username`:`login-password`);else{c.value=`login`;try{await n.auth.login({...i}),i.password=``,i.rememberMe=!1,a.password=a.confirmation=``}catch(e){let t=Mx(e);l.value=t.message,t.code===`INVALID_CREDENTIALS`&&n.panel===`login`&&D(`login-password`)}finally{c.value=void 0}}}}async function k(){if(!v.value)return;if(u.value=``,s.email=E(),s.email){D(`register-email`);return}let e=m.value;c.value=`code`;try{let t=await n.auth.sendCode(e);if(S(e,20),m.value!==e)return;p.value={email:e,id:t.challengeId,expiry:Date.parse(t.expiresAt)},a.emailCode=``,s.emailCode=``,d.value=`验证码已发送，请查看邮箱。`,n.panel===`register`&&D(`register-code`)}catch(t){let n=Mx(t);n.status===429&&S(e,n.retryAfter??60),m.value===e&&(u.value=n.message)}finally{c.value=void 0}}let A=[`username`,`email`,`emailCode`,`displayName`,`password`,`confirmation`],j={username:`register-username`,email:`register-email`,emailCode:`register-code`,displayName:`register-name`,password:`register-password`,confirmation:`register-confirmation`};async function ee(){if(c.value||!n.auth.registrationAllowed)return;u.value=``;let e=p.value,t=e?.id,d=e&&e.email===m.value&&e.expiry>Date.now();Object.assign(s,{username:Ax(a.username),email:E(),emailCode:d?/^\d{6}$/.test(a.emailCode)?``:`请输入 6 位数字验证码。`:`请先获取当前邮箱的验证码。`,displayName:Array.from(a.displayName.trim()).length>50?`昵称最多 50 个字符。`:``,password:kx(a.password),confirmation:T()});let h=A.find(e=>s[e]);if(h||!t){h&&D(j[h]);return}let g=a.displayName.trim();c.value=`register`;try{await n.auth.register({username:a.username,email:m.value,emailChallengeId:t,emailCode:a.emailCode,password:a.password,...g?{displayName:g}:{}}),i.username=a.username,i.password=``,l.value=``,o.username=o.password=``,Object.assign(a,{username:``,email:``,emailCode:``,displayName:``,password:``,confirmation:``}),f.value=!0,r(`select`,`login`),D(`login-password`)}catch(e){let t=Mx(e);for(let e of t.details??[]){let t=A.find(t=>t===e.field);t&&(s[t]=e.message)}u.value=t.message,t.code===`EMAIL_VERIFICATION_INVALID`&&(s.emailCode=t.message);let r=A.find(e=>s[e]);r&&n.panel===`register`&&D(j[r])}finally{c.value=void 0}}function M(){r(`select`,`home`),D(`home-tab`)}return(t,n)=>(K(),q(G,null,[J(`div`,{class:`auth-entry-header`,hidden:e.panel===`home`},[J(`button`,{type:`button`,class:`auth-entry-back`,"aria-label":`返回主界面`,onClick:M},[Y(W(Tc),{"aria-hidden":`true`})]),J(`h2`,null,F(e.panel===`register`?`创建账号`:`登录`),1)],8,Vx),W(b)&&e.panel!==`home`?(K(),q(`p`,Hx,` 当前连接未加密，请通过 HTTPS 输入密码和验证码。 `)):ea(``,!0),J(`div`,{class:`auth-entry-scroll`,hidden:e.panel===`home`},[J(`section`,{id:`login-panel`,role:`tabpanel`,"aria-labelledby":`login-tab`,hidden:e.panel!==`login`,inert:e.panel!==`login`},[f.value?(K(),q(`p`,Gx,`注册成功，请登录。`)):ea(``,!0),J(`form`,{id:`login-form`,class:`auth-entry-form`,novalidate:``,onSubmit:rs(O,[`prevent`])},[J(`fieldset`,{disabled:c.value===`login`},[Y(Bx,{id:`login-username`,modelValue:i.username,"onUpdate:modelValue":[n[0]||=e=>i.username=e,n[1]||=e=>C(`username`)],label:`用户名`,name:`username`,autocomplete:`username`,placeholder:`请输入用户名`,error:o.username},null,8,[`modelValue`,`error`]),Y(Bx,{id:`login-password`,modelValue:i.password,"onUpdate:modelValue":[n[2]||=e=>i.password=e,n[3]||=e=>C(`password`)],label:`密码`,name:`password`,kind:`password`,autocomplete:`current-password`,placeholder:`请输入密码`,masked:e.panel!==`login`,error:o.password},null,8,[`modelValue`,`masked`,`error`]),J(`label`,qx,[Mn(J(`input`,{id:`remember-me`,"onUpdate:modelValue":n[4]||=e=>i.rememberMe=e,type:`checkbox`},null,512),[[Wo,i.rememberMe]]),n[19]||=J(`svg`,{viewBox:`0 0 18 18`,"aria-hidden":`true`},[J(`circle`,{cx:`9`,cy:`9`,r:`8`}),J(`polyline`,{points:`1 9 7 14 15 4`})],-1),n[20]||=J(`span`,null,`保持登录`,-1)]),l.value?(K(),q(`p`,Jx,F(l.value),1)):ea(``,!0),J(`button`,{class:`auth-entry-submit`,type:`submit`,disabled:!!c.value,"aria-busy":c.value===`login`},[J(`span`,null,F(c.value===`login`?`登录中…`:`登录`),1),J(`span`,Xx,[c.value===`login`?(K(),Gi(W(Wc),{key:0,class:`spinning`,"aria-hidden":`true`})):(K(),Gi(W(Ec),{key:1,"aria-hidden":`true`}))])],8,Yx)],8,Kx)],32),J(`button`,{type:`button`,class:`auth-entry-link`,onClick:n[5]||=e=>r(`select`,`register`)},`没有账号？去注册`)],8,Wx),J(`section`,{id:`register-panel`,role:`tabpanel`,"aria-labelledby":`register-tab`,hidden:e.panel!==`register`,inert:e.panel!==`register`},[e.auth.registrationAllowed?(K(),q(`form`,{key:1,id:`register-form`,class:`auth-entry-form`,novalidate:``,onSubmit:rs(ee,[`prevent`])},[J(`fieldset`,{disabled:c.value===`register`},[Y(Bx,{id:`register-username`,modelValue:a.username,"onUpdate:modelValue":[n[6]||=e=>a.username=e,n[7]||=e=>w(`username`)],label:`用户名`,name:`username`,autocomplete:`username`,placeholder:`4–32 位字母、数字或下划线`,error:s.username},null,8,[`modelValue`,`error`]),Y(Bx,{id:`register-email`,modelValue:a.email,"onUpdate:modelValue":[n[8]||=e=>a.email=e,n[9]||=e=>w(`email`)],label:`邮箱`,name:`email`,kind:`email`,autocomplete:`email`,placeholder:`name@example.com`,error:s.email},null,8,[`modelValue`,`error`]),J(`div`,eS,[Y(Bx,{id:`register-code`,modelValue:a.emailCode,"onUpdate:modelValue":[n[10]||=e=>a.emailCode=e,n[11]||=e=>w(`emailCode`)],label:`邮箱验证码`,name:`emailCode`,inputmode:`numeric`,autocomplete:`one-time-code`,maxlength:`6`,placeholder:`6 位数字`,error:s.emailCode},null,8,[`modelValue`,`error`]),J(`button`,{id:`send-email-code`,class:`auth-entry-send`,type:`button`,disabled:!v.value,"aria-busy":c.value===`code`,onClick:k},[c.value===`code`?(K(),Gi(W(Wc),{key:0,class:`spinning`,"aria-hidden":`true`})):_.value&&d.value?(K(),Gi(W(kc),{key:1,"aria-hidden":`true`})):(K(),Gi(W(el),{key:2,"aria-hidden":`true`})),J(`span`,null,F(c.value===`code`?`发送中…`:_.value?_.value+` 秒后重发`:`发送验证码`),1)],8,tS)]),d.value?(K(),q(`p`,nS,F(d.value),1)):ea(``,!0),Y(Bx,{id:`register-password`,modelValue:a.password,"onUpdate:modelValue":[n[12]||=e=>a.password=e,n[13]||=e=>w(`password`)],label:`密码`,name:`password`,kind:`password`,autocomplete:`new-password`,placeholder:`6–16 个字符`,hint:`至少使用 3 个不同字符，避开常见弱密码。`,masked:e.panel!==`register`,error:s.password},null,8,[`modelValue`,`masked`,`error`]),Y(Bx,{id:`register-confirmation`,modelValue:a.confirmation,"onUpdate:modelValue":[n[14]||=e=>a.confirmation=e,n[15]||=e=>w(`confirmation`)],label:`确认密码`,kind:`password`,autocomplete:`new-password`,placeholder:`请再输一次密码`,masked:e.panel!==`register`,error:s.confirmation},null,8,[`modelValue`,`masked`,`error`]),Y(Bx,{id:`register-name`,modelValue:a.displayName,"onUpdate:modelValue":[n[16]||=e=>a.displayName=e,n[17]||=e=>w(`displayName`)],label:`昵称（选填）`,name:`displayName`,autocomplete:`nickname`,placeholder:`留空时使用用户名`,error:s.displayName},null,8,[`modelValue`,`error`]),u.value?(K(),q(`p`,rS,F(u.value),1)):ea(``,!0),J(`button`,{class:`auth-entry-submit`,type:`submit`,disabled:!!c.value,"aria-busy":c.value===`register`},[J(`span`,null,F(c.value===`register`?`注册中…`:`注册`),1),J(`span`,aS,[c.value===`register`?(K(),Gi(W(Wc),{key:0,class:`spinning`,"aria-hidden":`true`})):(K(),Gi(W(Ec),{key:1,"aria-hidden":`true`}))])],8,iS)],8,$x)],32)):(K(),q(`p`,Qx,`当前暂未开放注册。`)),J(`button`,{type:`button`,class:`auth-entry-link`,onClick:n[18]||=e=>r(`select`,`login`)},`已有账号？去登录`)],8,Zx)],8,Ux)],64))}}),sS=`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-<>=$#*`,cS=15,lS=19,uS=900,dS=49,fS=6,pS=3,mS=`15px ui-monospace, Consolas, monospace`,hS=hr({__name:`AuthMatrixTrail`,setup(e){let t=U(null),n;return Er(()=>{let e=t.value,r=e?.getContext(`2d`),i=document.createElement(`canvas`),a=i.getContext(`2d`);if(!e||!r||!a)return;let o=e,s=o.parentElement??o,c=r,l=a,u=matchMedia(`(prefers-reduced-motion: reduce)`),d=new Map,f=[],p=[],m=0,h=0,g=0,_=0,v=!1,y=0,b=-1/0,x=0,S;function C(e,t){c.fillStyle=t;let n=(e%g+.5)*cS,r=(Math.floor(e/g)+.5)*lS;c.fillText(p[e],n,r)}function w(e){for(let t=f.length-1;t>=0;t--)e-f[t].start>=(_+fS)*f[t].stepMs&&f.splice(t,1);if(e>=x&&f.length<pS){let t=[];for(let e=1;e<g-1;e++)f.some(t=>t.column===e)||t.push(e);if(t.length){let n=t[Math.floor(Math.random()*t.length)];f.push({column:n,start:e,stepMs:78+Math.random()*15})}x=e+1100+Math.random()*490}for(let t of f){let n=(e-t.start)/t.stepMs,r=Math.floor(n);for(let e=Math.max(0,r-fS);e<=Math.min(_-1,r);e++){let r=n-e,i=Math.max(0,1-r/fS)**1.4,a=Math.min(1,.38+r*3)*i*.88;C(e*g+t.column,`rgba(31, 102, 232, ${a})`)}}}function T(e,t){if(m&&h&&(c.clearRect(0,0,m,h),c.drawImage(i,0,0,m,h),t)){w(e);for(let[t,n]of d){let r=(e-n.start)/uS;r>=1?d.delete(t):C(t,`rgba(104, 161, 225, ${n.strength*(1-Math.max(0,r))**1.5*.86})`)}}}function E(){if(!v||(m=o.clientWidth,h=o.clientHeight,!m||!h))return;g=Math.ceil(m/cS),_=Math.ceil(h/lS);let e=Math.min(devicePixelRatio||1,1.5);o.width=i.width=Math.round(m*e),o.height=i.height=Math.round(h*e);for(let t of[c,l])t.setTransform(e,0,0,e,0,0),t.font=mS,t.textAlign=`center`,t.textBaseline=`middle`;D(),p.length=0;for(let e=0;e<_;e++)for(let t=0;t<g;t++){let n=sS[Math.floor(Math.random()*44)];p.push(n),Math.random()<.48&&(l.fillStyle=`rgba(71, 86, 105, ${.085+Math.random()*.06})`,l.fillText(n,(t+.5)*cS,(e+.5)*lS))}T(performance.now(),!1)}function D(){d.clear(),f.length=0,x=0,A()}function O(e,t,n){let r=Math.max(0,Math.floor((e-dS)/cS)),i=Math.min(g-1,Math.floor((e+dS)/cS)),a=Math.max(0,Math.floor((t-dS)/lS)),o=Math.min(_-1,Math.floor((t+dS)/lS));for(let s=a;s<=o;s++)for(let a=r;a<=i;a++){let r=Math.hypot((a+.5)*cS-e,(s+.5)*lS-t);if(r>=dS)continue;let i=s*g+a,o=(1-r/dS)**.9,c=d.get(i);o>=(c?c.strength*Math.max(0,1-(n-c.start)/uS)**1.5:0)&&d.set(i,{strength:o,start:n})}}function k(e){if(!v||document.hidden||u.matches||e.pointerType===`touch`&&!e.isPrimary)return;let t=o.getBoundingClientRect(),n=performance.now(),r=e.clientX-t.left,i=e.clientY-t.top,a=S;if(a&&n-a.time<100){let e=Math.min(12,Math.ceil(Math.hypot(r-a.x,i-a.y)/13));for(let t=1;t<e;t++)O(a.x+(r-a.x)*t/e,a.y+(i-a.y)*t/e,n)}O(r,i,n),S={x:r,y:i,time:n}}function A(){S=void 0}function j(e){e-b>=32&&(T(e,!0),b=e),y=requestAnimationFrame(j)}function ee(){cancelAnimationFrame(y),!v||document.hidden||u.matches?(D(),v&&!document.hidden&&T(performance.now(),!1)):y=requestAnimationFrame(j)}let M=new IntersectionObserver(([e])=>{v=e.isIntersecting,v&&(m!==o.clientWidth||h!==o.clientHeight)&&E(),ee()}),te=new ResizeObserver(()=>{(m!==o.clientWidth||h!==o.clientHeight)&&E()});M.observe(o),te.observe(o),s.addEventListener(`pointermove`,k,{passive:!0}),s.addEventListener(`pointerdown`,k,{passive:!0}),s.addEventListener(`pointerleave`,A),s.addEventListener(`pointercancel`,A),document.addEventListener(`visibilitychange`,ee),u.addEventListener(`change`,ee),n=()=>{cancelAnimationFrame(y),M.disconnect(),te.disconnect(),s.removeEventListener(`pointermove`,k),s.removeEventListener(`pointerdown`,k),s.removeEventListener(`pointerleave`,A),s.removeEventListener(`pointercancel`,A),document.removeEventListener(`visibilitychange`,ee),u.removeEventListener(`change`,ee)}}),Or(()=>n?.()),(e,n)=>(K(),q(`canvas`,{ref_key:`surface`,ref:t,class:`auth-matrix-trail`,"aria-hidden":`true`},null,512))}}),gS=`FrameFlow`,_S=hr({__name:`AuthPhoneName`,setup(e){let t=[`#83b320`,`#2fc36a`,`#2aa9d2`,`#0470ca`,`#6b0aff`,`#b700da`,`#da00ab`,`#e6405c`,`#e8623f`,`#f9812f`],n=matchMedia(`(prefers-reduced-motion: reduce)`);function r(e){let t=e.currentTarget;if(!(t instanceof HTMLElement)||e.pointerType===`touch`||n.matches)return;let{x:r,y:i,width:a,height:o}=t.getBoundingClientRect();a&&o&&(t.style.setProperty(`--wordmark-x`,`${(.5-(e.clientY-i)/o)*28}deg`),t.style.setProperty(`--wordmark-y`,`${((e.clientX-r)/a-.5)*36}deg`),t.style.setProperty(`--wordmark-depth`,`28px`))}function i(e){let t=e.currentTarget;t instanceof HTMLElement&&(t.style.removeProperty(`--wordmark-x`),t.style.removeProperty(`--wordmark-y`),t.style.removeProperty(`--wordmark-depth`))}return(e,n)=>(K(),q(`div`,{class:`auth-wordmark-stage`,onPointermove:r,onPointerleave:i,onPointercancel:i},[J(`h1`,{class:`auth-phone-wordmark`,"aria-label":gS},[(K(),q(G,null,Pr(gS,(e,n)=>J(`span`,{key:n,class:`auth-wordmark-letter`,"aria-hidden":`true`,style:ce({"--letter-color":t[n],"--letter-next-color":t[(n+4)%t.length],"--letter-delay":n*-.11+`s`})},F(e),5)),64))])],32))}}),vS={class:`auth-phone`,"aria-label":`手机界面`},yS={class:`auth-phone-screen`},bS={class:`auth-phone-status`,"aria-hidden":`true`},xS={class:`auth-phone-time`},SS={class:`auth-phone-indicators`},CS={class:`auth-phone-content`},wS=[`hidden`],TS={class:`auth-phone-dock`},ES=hr({__name:`AuthPhone`,props:{auth:{}},setup(e){let t=U(``),n=U(`home`),r;function i(){if(clearTimeout(r),document.hidden)return;let e=new Date,n=String(e.getHours()).padStart(2,`0`),a=String(e.getMinutes()).padStart(2,`0`);t.value=`${n}:${a}`,r=setTimeout(i,6e4-e.getTime()%6e4)}return Er(()=>{i(),document.addEventListener(`visibilitychange`,i)}),Or(()=>{clearTimeout(r),document.removeEventListener(`visibilitychange`,i)}),(r,i)=>(K(),q(`section`,vS,[J(`div`,yS,[Y(hS),J(`div`,bS,[J(`span`,xS,F(t.value),1),i[2]||=J(`span`,{class:`auth-phone-notch`},null,-1),J(`span`,SS,[Y(W(nl)),Y(W(fl)),Y(W(Oc))])]),J(`div`,CS,[i[3]||=J(`p`,{id:`auth-notice`,class:`notice`,role:`status`,hidden:``},null,-1),J(`div`,{id:`auth-phone-home-panel`,role:`tabpanel`,"aria-labelledby":`home-tab`,hidden:n.value!==`home`},[n.value===`home`?(K(),Gi(_S,{key:0})):ea(``,!0)],8,wS),Y(oS,{auth:e.auth,panel:n.value,onSelect:i[0]||=e=>n.value=e},null,8,[`auth`,`panel`])]),J(`div`,TS,[Y(Dx,{active:n.value,onSelect:i[1]||=e=>n.value=e},null,8,[`active`])]),i[4]||=J(`div`,{class:`auth-phone-home`,"aria-hidden":`true`},null,-1)])]))}}),DS=[`aria-label`],OS={class:`auth-typewriter-phrase`,"aria-hidden":`true`},kS=hr({__name:`AuthTypewriter`,setup(e){let t=[[`通向剪辑的道路`,`从这里开始`],[`注册，登录，`,`然后开始使用。`]],n=t.map(e=>e.join(``)).join(`。`),r=U(null),i=U(0),a=U(0),o=ka(()=>t[i.value]),s=ka(()=>o.value[0].length+o.value[1].length),c=ka(()=>{let[e,t]=o.value;return[e.slice(0,a.value),t.slice(0,Math.max(0,a.value-e.length))]}),l=ka(()=>+(a.value>o.value[0].length)),u;return Er(()=>{let e=r.value;if(!e)return;let n=matchMedia(`(prefers-reduced-motion: reduce)`),o=!1,c=!1,l;function d(){if(clearTimeout(l),n.matches){c=!1,a.value=s.value;return}if(!o||document.hidden)return;let e=a.value===s.value,r=a.value===0;l=setTimeout(()=>{e&&(c=!0),c&&r&&(i.value=(i.value+1)%t.length,c=!1),a.value+=c?-1:1,d()},e?2350:r?180:c?42:92)}let f=new IntersectionObserver(([e])=>{o=e.isIntersecting,d()});f.observe(e),document.addEventListener(`visibilitychange`,d),n.addEventListener(`change`,d),u=()=>{clearTimeout(l),f.disconnect(),document.removeEventListener(`visibilitychange`,d),n.removeEventListener(`change`,d)}}),Or(()=>u?.()),(e,i)=>(K(),q(`h1`,{ref_key:`heading`,ref:r,class:`auth-typewriter`,"aria-label":W(n)},[(K(),q(G,null,Pr(t,e=>J(`span`,{key:e[0],class:`auth-typewriter-phrase auth-typewriter-reserve`,"aria-hidden":`true`},[(K(!0),q(G,null,Pr(e,e=>(K(),q(`span`,{key:e,class:`auth-typewriter-line`},F(e),1))),128))])),64)),J(`span`,OS,[(K(!0),q(G,null,Pr(c.value,(e,t)=>(K(),q(`span`,{key:t,class:`auth-typewriter-line`},[(K(!0),q(G,null,Pr(e,(e,t)=>(K(),q(`span`,{key:t,class:`auth-typewriter-character`},F(e),1))),128)),t===l.value?(K(),q(`span`,{key:0,class:pe([`auth-typewriter-caret`,{"typing-complete":a.value===s.value}])},null,2)):ea(``,!0)]))),128))])],8,DS))}}),AS={class:`sr-only`},jS=`欢迎使用`,MS=hr({__name:`AuthWelcome`,setup(e){let t=[`你的高效 AI 剪辑工具`,`最佳音视频创作平台`],n=[`#1d4ed8`,`#2563eb`,`#3b82f6`,`#0ea5e9`,`#45b7d1`],r=U(null),i=U(null),a=U(null),o=U(!1),s=U(0),c;return Er(()=>{let e=r.value,l=i.value,u=a.value;if(!e||!l||!u)return;let d=u,f=l.getContext(`2d`),p=matchMedia(`(prefers-reduced-motion: reduce)`),m=!1,h=0,g=-1/0,_,v=0,y=0,b=0;function x(e){if(!f||!v||!y)return;f.clearRect(0,0,v,y),f.globalCompositeOperation=`source-over`,f.fillStyle=`#5c8dcf`,f.fillText(jS,v/2,b),f.globalCompositeOperation=`source-atop`;let t=e/850,r=y*.096;f.lineWidth=Math.max(1.6,r*.45);for(let e=-3;e<15;e++){let i=e*r,a=t+e*.31;f.strokeStyle=n[(e+5)%n.length],f.beginPath(),f.moveTo(-2,i+Math.sin(a)*y*.15),f.bezierCurveTo(v*.27,i+Math.cos(a)*y*.55,v*.66,i-Math.sin(a+.6)*y*.49,v+2,i+Math.cos(a+1.3)*y*.18),f.stroke()}o.value=!0}function S(){if(d.style.setProperty(`--auth-rotation-screen-width`,`${document.documentElement.clientWidth}px`),d.style.setProperty(`--auth-rotation-start`,`${d.getBoundingClientRect().left}px`),!f||!l||!l.clientWidth)return;v=l.clientWidth,y=l.clientHeight;let e=Math.min(devicePixelRatio||1,2);l.width=Math.round(v*e),l.height=Math.round(y*e),f.setTransform(e,0,0,e,0,0);let t=getComputedStyle(l);f.font=`${t.fontWeight} ${t.fontSize} ${t.fontFamily}`,f.textAlign=`center`;let n=f.measureText(jS);b=(y+n.actualBoundingBoxAscent-n.actualBoundingBoxDescent)/2,x(p.matches?0:performance.now())}function C(e){e-g>=32&&(x(e),g=e),h=requestAnimationFrame(C)}function w(){cancelAnimationFrame(h),clearInterval(_),m&&!document.hidden&&(S(),p.matches?s.value=0:(f&&(h=requestAnimationFrame(C)),_=setInterval(()=>{s.value=(s.value+1)%t.length},3200)))}let T=new IntersectionObserver(([e])=>{m=e.isIntersecting,w()});function E(){m&&S()}let D=new ResizeObserver(E);T.observe(e),D.observe(l),D.observe(e),window.addEventListener(`resize`,E),document.addEventListener(`visibilitychange`,w),p.addEventListener(`change`,w),c=()=>{cancelAnimationFrame(h),clearInterval(_),T.disconnect(),D.disconnect(),window.removeEventListener(`resize`,E),document.removeEventListener(`visibilitychange`,w),p.removeEventListener(`change`,w)}}),Or(()=>c?.()),(e,n)=>(K(),q(`p`,{ref_key:`heading`,ref:r,class:`auth-welcome`},[J(`span`,AS,F(jS)+F(t[0]),1),J(`span`,{class:pe([`auth-welcome-wordmark`,{"is-painted":o.value}]),"aria-hidden":`true`},[J(`span`,null,F(jS)),J(`canvas`,{ref_key:`wordmark`,ref:i},null,512)],2),J(`span`,{ref_key:`rotation`,ref:a,class:`auth-welcome-rotation`,"aria-hidden":`true`},[(K(),q(G,null,Pr(t,e=>J(`span`,{key:e,class:`auth-welcome-word-size`},F(e),1)),64)),Y(Ga,{name:`auth-word`,mode:`out-in`},{default:jn(()=>[(K(),q(`span`,{key:s.value,class:`auth-welcome-word`},F(t[s.value]),1))]),_:1})],512)],512))}}),NS={class:`auth-phone-layout`},PS={key:0,class:`auth-intro`},FS={key:3,class:`auth-theme-dark`,"aria-hidden":`true`},IS={key:4,class:`auth-theme-divider`,"aria-hidden":`true`},LS={id:`auth-theme-toggle`,class:`auth-theme-slider`,role:`slider`,tabindex:`0`,"aria-label":`登录页主题`,"aria-orientation":`horizontal`,"aria-valuemin":`0`,"aria-valuemax":`100`,"aria-valuenow":`100`,"aria-valuetext":`全亮色`,"aria-describedby":`auth-theme-hint`},RS={class:`auth-dock-tile`,"aria-hidden":`true`},zS={class:`auth-dock-follower auth-theme-follower`},BS=hr({__name:`AuthScreen`,props:{auth:{}},setup(e){let t=matchMedia(ed),n=U(t.matches);function r(){n.value=t.matches}return Er(()=>t.addEventListener(`change`,r)),Or(()=>t.removeEventListener(`change`,r)),(t,r)=>(K(),q(`section`,{id:`auth-view`,class:pe([`auth-phone-page`,{"auth-phone-only":n.value}]),"data-theme":`light`,hidden:``},[n.value?ea(``,!0):(K(),Gi(cd,{key:0})),n.value?ea(``,!0):(K(),Gi(ux,{key:1})),J(`div`,NS,[n.value?ea(``,!0):(K(),q(`div`,PS,[Y(MS),Y(kS)])),Y(ES,{auth:e.auth},null,8,[`auth`]),n.value?ea(``,!0):(K(),Gi(hx,{key:1}))]),n.value?ea(``,!0):(K(),Gi(sd,{key:2})),n.value?ea(``,!0):(K(),q(`div`,FS)),n.value?ea(``,!0):(K(),q(`div`,IS)),r[1]||=J(`div`,{class:`auth-theme-gravity`,"aria-hidden":`true`},null,-1),J(`div`,LS,[J(`span`,RS,[Y(W(jc))]),J(`span`,zS,[Y(W(Kc),{"aria-hidden":`true`}),r[0]||=J(`span`,{id:`auth-theme-hint`,role:`tooltip`},`滑动以切换风格`,-1)])])],2))}}),VS={};function HS(e,t){return K(),q(G,null,[t[0]||=$i(`<dialog id="action-confirm-dialog" data-kind="warning" aria-labelledby="action-confirm-title" aria-describedby="action-confirm-description"><div class="dialog-heading"><div class="dialog-title-group"><span id="action-confirm-icon" class="dialog-icon"><i data-lucide="triangle-alert" aria-hidden="true"></i></span><h2 id="action-confirm-title">确认操作</h2></div><button id="close-action-confirm" class="icon-button" type="button" title="取消操作" aria-label="取消操作"><i data-lucide="x" aria-hidden="true"></i></button></div><p id="action-confirm-description" class="dialog-description"></p><div class="dialog-actions"><button id="cancel-action-confirm" class="button secondary" type="button" autofocus>取消</button><button id="accept-action-confirm" class="button primary" type="button"><i data-lucide="check" aria-hidden="true"></i><span>继续</span></button></div></dialog><dialog id="cloud-confirm-dialog" aria-labelledby="cloud-confirm-title" aria-describedby="cloud-confirm-description cloud-confirm-fee"><div class="dialog-heading"><div class="cloud-confirm-heading"><span class="cloud-confirm-icon"><i data-lucide="cloud-upload" aria-hidden="true"></i></span><h2 id="cloud-confirm-title">确认调用云端服务</h2></div><button id="close-cloud-confirm" class="icon-button" type="button" title="取消调用" aria-label="取消调用"><i data-lucide="x" aria-hidden="true"></i></button></div><p id="cloud-confirm-description" class="muted">本次操作将使用以下服务处理数据。</p><dl class="cloud-confirm-details"><div><dt>服务商</dt><dd id="cloud-confirm-provider"></dd></div><div><dt>发送内容</dt><dd id="cloud-confirm-content"></dd></div></dl><p id="cloud-confirm-detail" class="muted" hidden></p><p id="cloud-confirm-fee" class="cloud-confirm-fee"><i data-lucide="badge-dollar-sign" aria-hidden="true"></i><span>可能产生服务费用，按供应商的计费规则结算。</span></p><label id="cloud-confirm-skip-row" class="check-field"><input id="cloud-confirm-skip" type="checkbox">本次登录不再提示</label><div class="dialog-actions"><button id="cancel-cloud-confirm" class="button secondary" type="button" autofocus>取消</button><button id="accept-cloud-confirm" class="button primary" type="button"><i data-lucide="arrow-right" aria-hidden="true"></i><span>继续调用</span></button></div></dialog>`,2),t[1]||=J(`dialog`,{id:`delete-output-dialog`,"aria-labelledby":`delete-output-title`,"aria-describedby":`delete-output-description`},[J(`div`,{class:`dialog-heading`},[J(`div`,{class:`dialog-title-group`},[J(`span`,{class:`dialog-icon danger-icon`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`})]),J(`h2`,{id:`delete-output-title`},`删除结果`)]),J(`button`,{id:`close-delete-output`,class:`icon-button`,type:`button`,title:`取消`,"aria-label":`取消删除结果`},[J(`i`,{"data-lucide":`x`,"aria-hidden":`true`})])]),J(`p`,{id:`delete-output-name`,class:`result-filename`}),J(`p`,{id:`delete-output-description`,class:`muted`},`仅删除此结果文件，原素材、参数和处理记录保留。此操作不可恢复。`),J(`form`,{id:`delete-output-form`},[J(`p`,{id:`delete-output-error`,class:`form-error`,role:`alert`,hidden:``}),J(`div`,{class:`dialog-actions`},[J(`button`,{id:`cancel-delete-output`,class:`button secondary`,type:`button`},`取消`),J(`button`,{class:`button danger`,type:`submit`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`}),X(`确认删除结果`)])])])],-1),t[2]||=J(`dialog`,{id:`delete-media-dialog`,"aria-labelledby":`delete-media-title`,"aria-describedby":`delete-media-description`},[J(`div`,{class:`dialog-heading`},[J(`div`,{class:`dialog-title-group`},[J(`span`,{class:`dialog-icon danger-icon`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`})]),J(`h2`,{id:`delete-media-title`},`删除素材`)]),J(`button`,{id:`close-delete-media`,class:`icon-button`,type:`button`,title:`取消`,"aria-label":`取消删除素材`},[J(`i`,{"data-lucide":`x`,"aria-hidden":`true`})])]),J(`p`,{id:`delete-media-name`,class:`result-filename`}),J(`p`,{id:`delete-media-description`,class:`muted`},`关联的处理记录和结果也会删除，正在进行的任务将停止。此操作不可恢复。`),J(`form`,{id:`delete-media-form`},[J(`p`,{id:`delete-media-error`,class:`form-error`,role:`alert`,hidden:``}),J(`div`,{class:`dialog-actions`},[J(`button`,{id:`cancel-delete-media`,class:`button secondary`,type:`button`},`取消`),J(`button`,{class:`button danger`,type:`submit`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`}),X(`确认删除`)])])])],-1),t[3]||=J(`dialog`,{id:`delete-dialog`,"aria-labelledby":`delete-title`,"aria-describedby":`delete-description`},[J(`div`,{class:`dialog-heading`},[J(`div`,{class:`dialog-title-group`},[J(`span`,{class:`dialog-icon danger-icon`},[J(`i`,{"data-lucide":`user-round-x`,"aria-hidden":`true`})]),J(`h2`,{id:`delete-title`},`确认注销账号`)]),J(`button`,{id:`close-delete-dialog`,class:`icon-button`,type:`button`,title:`取消`,"aria-label":`取消`},[J(`i`,{"data-lucide":`x`,"aria-hidden":`true`})])]),J(`p`,{id:`delete-description`,class:`muted`},`所有设备将退出登录。账号与素材将无法访问，此操作不可恢复。`),J(`form`,{id:`delete-form`},[J(`label`,{class:`field`},[X(`当前密码`),J(`input`,{id:`delete-password`,name:`currentPassword`,type:`password`,autocomplete:`current-password`,required:``})]),J(`label`,{class:`field`},[X(`输入用户名以确认`),J(`input`,{id:`delete-username`,name:`confirmUsername`,required:``,autocomplete:`off`,spellcheck:`false`})]),J(`p`,{id:`delete-error`,class:`form-error`,role:`alert`,hidden:``}),J(`div`,{class:`dialog-actions`},[J(`button`,{id:`cancel-delete`,class:`button secondary`,type:`button`},`取消`),J(`button`,{class:`button danger`,type:`submit`},[J(`i`,{"data-lucide":`trash-2`,"aria-hidden":`true`}),X(`确认注销`)])])])],-1)],64)}var US=fs(VS,[[`render`,HS]]),WS=hr({__name:`App`,props:{auth:{},home:{}},setup(e){return(t,n)=>(K(),q(G,null,[J(`main`,null,[n[0]||=$i(`<section id="loading-view" class="loading-view" aria-live="polite"><i data-lucide="loader-circle" class="spinning" aria-hidden="true"></i><span>正在加载账户…</span></section><section id="unavailable-view" class="auth-shell" hidden><h1>暂时无法连接</h1><p id="unavailable-message" class="muted">服务暂时不可用，请稍后重试。</p><button id="retry-connection" class="button primary"><i data-lucide="refresh-cw" aria-hidden="true"></i>重新连接 </button></section>`,2),Y(BS,{auth:e.auth},null,8,[`auth`]),Y(Wu,{home:e.home},null,8,[`home`])]),Y(US)],64))}}),GS={key:0,id:`find-retrieval`,class:`retrieval-state`,role:`status`},KS={id:`find-results`,class:`find-results`},qS={class:`find-result-heading`},JS={class:`find-result-actions`},YS=[`title`,`aria-label`,`disabled`,`onClick`],XS=[`aria-label`,`disabled`,`onClick`],ZS=[`aria-label`,`disabled`,`onClick`],QS={class:`muted`},$S={key:0},eC=[`open`],tC={class:`evidence-links`},nC=[`title`,`disabled`,`onClick`],rC=hr({__name:`FindResults`,props:{result:{},recommend:{type:Boolean},busy:{type:Boolean},previewAvailable:{type:Boolean},canTrim:{type:Boolean},canJoin:{type:Boolean}},emits:[`action`],setup(e,{emit:t}){let n=e,r=t,i=ka(()=>(n.recommend?n.result?.clips:n.result?.matches)??[]),a=e=>`${(e/1e3).toFixed(3)} 秒`;return(t,n)=>(K(),q(G,null,[e.result?.retrieval?(K(),q(`p`,GS,[J(`span`,null,F(e.result.retrieval.method===`BM25_COVERAGE`?`均匀抽样候选`:`BM25 召回`),1),J(`span`,null,`候选字幕 `+F(e.result.retrieval.retrievedSegments)+` / `+F(e.result.retrieval.totalSegments)+` 段`,1)])):ea(``,!0),J(`ol`,KS,[(K(!0),q(G,null,Pr(i.value,(t,n)=>(K(),q(`li`,{key:`${e.result?.transcriptId}:${e.result?.transcriptVersion}:${n}`,class:`find-result`},[J(`div`,qS,[J(`h3`,null,F(e.recommend?t.title:`片段 ${n+1}`),1),J(`div`,JS,[J(`button`,{type:`button`,class:`icon-button`,title:e.previewAvailable?`预览片段`:`当前原视频不支持直接预览`,"aria-label":`预览片段 ${n+1}`,disabled:e.busy||!e.previewAvailable,onClick:e=>r(`action`,`preview`,t)},[Y(W(qc),{"aria-hidden":`true`})],8,YS),J(`button`,{type:`button`,class:`icon-button`,title:`带入裁切`,"aria-label":`裁切片段 ${n+1}`,disabled:e.busy||!e.canTrim||t.endMs-t.startMs<500,onClick:e=>r(`action`,`trim`,t)},[Y(W($c),{"aria-hidden":`true`})],8,XS),J(`button`,{type:`button`,class:`icon-button`,title:`加入拼接`,"aria-label":`加入拼接 ${n+1}`,disabled:e.busy||!e.canJoin||t.endMs-t.startMs<500,onClick:e=>r(`action`,`join`,t)},[Y(W(Uc),{"aria-hidden":`true`})],8,ZS)])]),J(`p`,QS,F(a(t.startMs))+` 至 `+F(a(t.endMs)),1),e.recommend?(K(),q(`p`,$S,F(t.reason),1)):ea(``,!0),J(`details`,{open:n===0},[J(`summary`,null,`原文 · `+F(t.evidence.length)+` 段`,1),J(`blockquote`,null,F(t.evidence.map(e=>e.text).join(`
`)),1),J(`div`,tC,[(K(!0),q(G,null,Pr(t.evidence,n=>(K(),q(`button`,{key:n.segmentId,type:`button`,class:`button secondary compact`,title:`预览原文 ${a(n.startMs)}`,disabled:e.busy||!e.previewAvailable,onClick:e=>r(`action`,`preview`,{...t,startMs:n.startMs,endMs:n.endMs})},[Y(W(qc),{"aria-hidden":`true`}),X(F(a(n.startMs)),1)],8,nC))),128))])],8,eC)]))),128))])],64))}}),iC={id:`ai-plan-parameters`,class:`metadata-list`},aC={id:`ai-plan-questions`,class:`ai-questions`},oC=hr({__name:`PlanDetails`,props:{plan:{}},setup(e){let t=e,n=ka(()=>Tl(t.plan?.parameters??null));return(t,r)=>(K(),q(G,null,[J(`dl`,iC,[(K(!0),q(G,null,Pr(n.value,([e,t])=>(K(),q(`div`,{key:e},[J(`dt`,null,F(e),1),J(`dd`,null,F(t),1)]))),128))]),J(`ul`,aC,[(K(!0),q(G,null,Pr(e.plan?.questions??[],e=>(K(),q(`li`,{key:e.code},F(e.message),1))),128))])],64))}}),sC=[`id`,`aria-selected`,`aria-controls`,`tabindex`,`disabled`,`onClick`],cC=hr({__name:`WorkbenchPhases`,props:{state:{}},emits:[`select`],setup(e,{emit:t}){let n=e,r=t,i={import:`导入`,edit:`编辑`,export:`导出`},a={import:Bc,edit:rl,export:Fc};function o(e){if(n.state.busy||![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;e.preventDefault();let t=_l.indexOf(n.state.phase),i=e.key===`Home`?0:e.key===`End`?2:(t+(e.key===`ArrowRight`?1:2))%3;r(`select`,_l[i]),document.getElementById(`phase-${_l[i]}-tab`)?.focus()}return(t,n)=>(K(),q(G,null,[n[0]||=J(`span`,{class:`phase-indicator`,"aria-hidden":`true`},null,-1),(K(!0),q(G,null,Pr(W(_l),t=>(K(),q(`button`,{id:`phase-${t}-tab`,key:t,role:`tab`,type:`button`,"aria-selected":e.state.phase===t,"aria-controls":`phase-${t}`,tabindex:e.state.phase===t?0:-1,disabled:e.state.busy,onClick:e=>r(`select`,t),onKeydown:o},[(K(),Gi(jr(a[t]),{"aria-hidden":`true`})),J(`span`,null,F(i[t]),1)],40,sC))),128))],64))}});function lC(e){let t=document.getElementById(e);if(!t)throw Error(`Missing workbench element: `+e);return t}function uC(){let e=matchMedia(`(prefers-reduced-motion: reduce)`),t=jt({tool:`detect`,phase:`import`,visible:!1,busy:!1}),n=new Map,r;function i(){r?.cancel(),r=void 0}function a(){for(let e of _l){let n=lC(`phase-`+e);n.hidden=t.tool===`history`||e!==t.phase,n.inert=n.hidden}lC(`workspace-phases`).style.setProperty(`--phase-index`,String(_l.indexOf(t.phase))),lC(`tool-stage`).dataset.phase=t.phase,document.querySelectorAll(`#tool-stage video, #tool-stage audio`).forEach(e=>{t.tool!==`history`&&e.closest(`#phase-`+t.phase)||e.pause()})}function o(o,s=!0){if(!xl(o)||t.tool===`history`)return!1;let c=t.phase;if(t.phase=o,n.set(t.tool,o),a(),i(),s&&c!==o&&!e.matches&&t.visible){let e=_l.indexOf(o)>_l.indexOf(c)?1:-1,t=lC(`phase-`+o).animate([{opacity:.35,transform:`translateX(`+e*12+`px)`},{opacity:1,transform:`translateX(0)`}],{duration:200,easing:`cubic-bezier(.2,.7,.3,1)`});r=t,t.finished.then(()=>{r===t&&i()}).catch(()=>{})}return!0}function s(e){return bl(e)?(n.set(t.tool,t.phase),t.tool=e,t.phase=n.get(e)??(e===`detect`?`import`:`edit`),i(),a(),!0):!1}function c(){n.clear(),t.tool=`detect`,t.phase=`import`,i(),a()}function l(e){Object.assign(t,e),t.visible||i()}function u(){e.matches&&i()}return e.addEventListener(`change`,u),{state:t,get tool(){return t.tool},get phase(){return t.phase},selectTool:s,selectPhase:o,reset:c,update:l,connect:a,dispose(){i(),e.removeEventListener(`change`,u)}}}var dC=[`disabled`,`onClick`],fC={class:`file-name`},pC={class:`file-size`},mC=[`aria-label`,`disabled`,`onClick`],hC=hr({__name:`MediaLibrary`,props:{items:{},busy:{type:Boolean},size:{type:Function},status:{type:Function}},emits:[`open`,`remove`],setup(e,{emit:t}){let n=t;return(t,r)=>(K(!0),q(G,null,Pr(e.items,t=>(K(),q(`li`,{key:t.id,class:`media-row`},[J(`button`,{type:`button`,disabled:e.busy,onClick:e=>n(`open`,t)},[Y(W(zc),{"aria-hidden":`true`}),J(`span`,fC,F(t.originalFilename),1),J(`span`,pC,F(e.size(t.sizeBytes)),1),J(`span`,{class:pe([`media-status`,{ready:t.status===`READY`,failed:t.status===`FAILED`}])},F(e.status(t.status)),3)],8,dC),J(`button`,{type:`button`,class:`icon-button media-remove`,title:`删除素材`,"aria-label":`删除素材 ${t.originalFilename}`,disabled:e.busy,onClick:e=>n(`remove`,t)},[Y(W(al),{"aria-hidden":`true`})],8,mC)]))),128))}}),gC=[`open`],_C={class:`record-title`},vC={key:0,class:`record-instruction`},yC={class:`record-parameters`},bC={key:1,class:`form-error`},xC=hr({__name:`RecordDetails`,props:{recordKey:{},title:{},parameters:{},instruction:{},error:{},expanded:{},operation:{type:Function}},emits:[`expand`],setup(e,{emit:t}){let n=e,r=t,i={operation:`处理方式`,outputFormat:`输出格式`,videoCodec:`视频编码`,resolutionPreset:`分辨率`,width:`最大宽度`,height:`最大高度`,audioMode:`音轨`,startMs:`开始（毫秒）`,endMs:`结束（毫秒）`,targetSizeBytes:`目标体积（字节）`,extractAudio:`另存音轨`,clips:`拼接区间`,steps:`处理步骤`,transcriptId:`字幕`,transcriptVersion:`字幕版本`,useOriginal:`保留原文`},a={source:`原分辨率`,keep:`保留音轨`,mute:`静音`},o=ka(()=>Object.entries(n.parameters??{}).filter(([,e])=>e!==null).map(([e,t])=>[i[e]??e,e===`operation`?n.operation(String(t)):typeof t==`boolean`?t?`是`:`否`:typeof t==`object`?JSON.stringify(t,null,2):a[String(t)]??String(t)]));function s(e){let t=e.currentTarget.open;t?n.expanded.add(n.recordKey):n.expanded.delete(n.recordKey),r(`expand`,t)}return(t,n)=>(K(),q(`details`,{class:`record-details`,open:e.expanded.has(e.recordKey),onToggle:s},[J(`summary`,null,[Fr(t.$slots,`summary`,{},()=>[J(`span`,_C,[X(F(e.title),1),Fr(t.$slots,`subtitle`)]),Y(W(Ac),{class:`disclosure-chevron`,"aria-hidden":`true`})])]),e.instruction?(K(),q(`p`,vC,F(e.instruction),1)):ea(``,!0),J(`dl`,yC,[(K(!0),q(G,null,Pr(o.value,([e,t])=>(K(),q(`div`,{key:e},[J(`dt`,null,F(e),1),J(`dd`,null,F(t),1)]))),128))]),e.error?(K(),q(`p`,bC,F(e.error),1)):ea(``,!0),Fr(t.$slots,`default`)],40,gC))}}),SC=[`data-active`,`disabled`,`title`,`onClick`],CC=[`disabled`,`onClick`],wC=hr({__name:`PlanHistory`,props:{items:{},busy:{type:Boolean},expanded:{},operation:{type:Function}},emits:[`restore`,`remove`],setup(e,{emit:t}){let n=t;return(t,r)=>(K(!0),q(G,null,Pr(e.items,t=>(K(),q(`li`,{key:t.id,class:`history-row`},[Y(xC,{"record-key":`plan:${t.id}`,title:t.summary||`未完成方案`,parameters:t.parameters,instruction:t.instruction,expanded:e.expanded,operation:e.operation},{subtitle:jn(()=>[r[0]||=J(`br`,null,null,-1),J(`small`,null,F(t.status===`EXECUTED`?`已执行`:t.status===`READY`?`待执行`:`待完善`)+` · v`+F(t.version)+` · `+F(t.id.slice(0,8))+` · `+F(new Date(t.createdAt).toLocaleString(`zh-CN`)),1)]),_:2},1032,[`record-key`,`title`,`parameters`,`instruction`,`expanded`,`operation`]),J(`button`,{class:`icon-button`,type:`button`,"data-record-action":`true`,"data-active":t.parameters?.operation===`burn_subtitles`?`true`:void 0,disabled:e.busy||t.parameters?.operation===`burn_subtitles`,title:t.parameters?.operation===`burn_subtitles`?`字幕烧录方案请在字幕处理中重新确认字幕版本`:`恢复这个方案`,"aria-label":`恢复这个方案`,onClick:e=>n(`restore`,t)},[Y(W(Xc),{"aria-hidden":`true`})],8,SC),J(`button`,{class:`icon-button`,type:`button`,"data-record-action":`true`,title:`删除保存的方案`,"aria-label":`删除保存的方案`,disabled:e.busy,onClick:e=>n(`remove`,t)},[Y(W(al),{"aria-hidden":`true`})],8,CC)]))),128))}}),TC={class:`file-name`},EC={class:`file-size`},DC={class:`record-instruction`},OC=[`disabled`,`onClick`],kC=[`data-active`,`title`,`disabled`,`onClick`],AC=hr({__name:`TaskHistory`,props:{items:{},busy:{type:Boolean},expanded:{},instructions:{},size:{type:Function},operation:{type:Function},status:{type:Function},format:{type:Function}},emits:[`open`,`remove`,`inspect`],setup(e,{emit:t}){let n=e,r=t;function i(e){return[`QUEUED`,`RUNNING`,`CANCELLING`].includes(e.status)}function a(e){return e.kind===`TRANSCRIPTION`?`语音转字幕`:`${n.operation(e.parameters?.operation??``)} ${n.format(e.parameters)}`}function o(e){return n.status(e.status,e.kind===`TRANSCRIPTION`?`transcribe`:e.parameters?.operation)}function s(e){return new Intl.DateTimeFormat(`zh-CN`,{month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function c(e){return e.parameters?.operation===`extract_audio`||e.parameters?.operation===`export`&&!e.parameters.videoCodec}return(t,n)=>(K(!0),q(G,null,Pr(e.items,t=>(K(),q(`li`,{key:t.id,class:`history-row`},[Y(xC,{"record-key":`task:${t.id}`,title:`${a(t)} · ${o(t)}`,parameters:t.parameters,error:t.error?.message,expanded:e.expanded,operation:e.operation,onExpand:e=>e&&r(`inspect`,t)},{summary:jn(()=>[(K(),Gi(jr(c(t)?W(Rc):W(zc)),{"aria-hidden":`true`})),J(`span`,TC,[J(`span`,null,F(a(t)),1),J(`small`,null,F(t.id.slice(0,8))+` · `+F(s(t.createdAt)),1)]),J(`span`,EC,F(t.outputs[0]?e.size(t.outputs[0].sizeBytes):``),1),J(`span`,{class:pe([`media-status`,{ready:t.status===`SUCCEEDED`,failed:t.status===`FAILED`}])},F(o(t)),3),Y(W(Ac),{class:`disclosure-chevron`,"aria-hidden":`true`})]),default:jn(()=>[J(`p`,DC,F(e.instructions.get(`${t.planId}:${t.planVersion}`)??``),1)]),_:2},1032,[`record-key`,`title`,`parameters`,`error`,`expanded`,`operation`,`onExpand`]),J(`button`,{class:`icon-button`,type:`button`,"data-record-action":`open`,title:`打开处理结果`,"aria-label":`打开处理结果`,disabled:e.busy,onClick:e=>r(`open`,t)},[Y(W(Ec),{"aria-hidden":`true`})],8,OC),J(`button`,{class:`icon-button`,type:`button`,"data-record-action":`true`,"data-active":String(i(t)),title:i(t)?`任务结束后可删除记录`:`删除处理记录`,"aria-label":`删除处理记录`,disabled:e.busy||i(t),onClick:e=>r(`remove`,t)},[Y(W(al),{"aria-hidden":`true`})],8,kC)]))),128))}});function jC(){return{expanded:jt(new Set),instructions:jt(new Map)}}function MC(e,t,n){let r=Mt({busy:!1,media:[],plans:[],tasks:[]}),i=[[`media-list`,()=>Aa(hC,{items:r.media,busy:r.busy,size:e.size,status:e.mediaStatus,onOpen:e.openMedia,onRemove:e.removeMedia})],[`plan-list`,()=>Aa(wC,{items:r.plans,busy:r.busy,expanded:t,operation:e.operation,onRestore:e.restorePlan,onRemove:e.removePlan})],[`task-list`,()=>Aa(AC,{items:r.tasks,busy:r.busy,expanded:t,instructions:n,size:e.size,operation:e.operation,status:e.taskStatus,format:e.format,onOpen:e.openTask,onRemove:e.removeTask,onInspect:e.inspectTask})]].map(([e,t])=>{let n=ls({render:t});return n.mount(document.getElementById(e)),n});return{update(e){Object.assign(r,e)},clear(){r.media=[],r.tasks=[],r.plans=[]},dispose(){i.forEach(e=>e.unmount())}}}var NC={class:`field`},PC=[`value`,`aria-label`,`disabled`,`onInput`],FC={class:`field`},IC=[`value`,`aria-label`,`disabled`,`onInput`],LC={class:`join-row-actions`},RC=[`aria-label`,`disabled`,`onClick`],zC=[`aria-label`,`disabled`,`onClick`],BC=[`aria-label`,`disabled`,`onClick`],VC=[`aria-label`,`disabled`,`onClick`],HC=[`aria-label`,`disabled`,`onClick`],UC=hr({__name:`JoinRanges`,props:{rows:{},disabled:{type:Boolean},preview:{type:Boolean},revision:{}},emits:[`change`,`preview`],setup(e,{emit:t}){let n=e,r=t;function i(e,t){[n.rows[e],n.rows[e+t]]=[n.rows[e+t],n.rows[e]],r(`change`)}return(t,n)=>(K(!0),q(G,null,Pr(e.rows,(t,a)=>(K(),q(`li`,{key:a,class:`join-row`},[J(`span`,null,F(a+1),1),J(`label`,NC,[n[0]||=X(`开始（秒）`,-1),J(`input`,{value:t.start,type:`number`,min:`0`,step:`0.001`,required:``,"aria-label":`片段${a+1}开始时间`,disabled:e.disabled,onInput:e=>{t.start=e.target.value,r(`change`)}},null,40,PC)]),J(`label`,FC,[n[1]||=X(`结束（秒）`,-1),J(`input`,{value:t.end,type:`number`,min:`0`,step:`0.001`,required:``,"aria-label":`片段${a+1}结束时间`,disabled:e.disabled,onInput:e=>{t.end=e.target.value,r(`change`)}},null,40,IC)]),J(`div`,LC,[J(`button`,{class:`icon-button`,type:`button`,title:`上移片段`,"aria-label":`上移片段 ${a+1}`,disabled:e.disabled||a===0,onClick:e=>i(a,-1)},[Y(W(Dc),{"aria-hidden":`true`})],8,RC),J(`button`,{class:`icon-button`,type:`button`,title:`下移片段`,"aria-label":`下移片段 ${a+1}`,disabled:e.disabled||a===e.rows.length-1,onClick:e=>i(a,1)},[Y(W(wc),{"aria-hidden":`true`})],8,zC),J(`button`,{class:`icon-button`,type:`button`,title:`复制片段`,"aria-label":`复制片段 ${a+1}`,disabled:e.disabled||e.rows.length>=20,onClick:n=>{e.rows.splice(a+1,0,{...t}),r(`change`)}},[Y(W(Nc),{"aria-hidden":`true`})],8,BC),J(`button`,{class:`icon-button`,type:`button`,title:`预览片段`,"aria-label":`预览片段 ${a+1}`,disabled:e.disabled||!e.preview,onClick:e=>r(`preview`,a)},[Y(W(qc),{"aria-hidden":`true`})],8,VC),J(`button`,{class:`icon-button`,type:`button`,title:`移除片段`,"aria-label":`移除片段 ${a+1}`,disabled:e.disabled||e.rows.length<=1,onClick:t=>{e.rows.splice(a,1),r(`change`)}},[Y(W(al),{"aria-hidden":`true`})],8,HC)])]))),128))}}),WC={class:`field`},GC=[`min`,`step`,`aria-label`,`value`,`disabled`],KC=hr({__name:`NumberField`,props:{label:{},modelValue:{},min:{},step:{},disabled:{type:Boolean}},emits:[`update:modelValue`],setup(e,{emit:t}){let n=t;return(t,r)=>(K(),q(`label`,WC,[X(F(e.label),1),J(`input`,{type:`number`,min:e.min??0,step:e.step??`0.001`,"aria-label":e.label,value:e.modelValue!=null&&Number.isFinite(e.modelValue)?e.modelValue:``,disabled:e.disabled,required:``,onInput:r[0]||=e=>n(`update:modelValue`,e.target.value===``?NaN:Number(e.target.value))},null,40,GC)]))}}),qC={class:`workflow-step-head`},JC=[`value`,`aria-label`,`disabled`,`onChange`],YC=[`title`,`aria-label`,`disabled`,`onClick`],XC=[`title`,`aria-label`,`disabled`,`onClick`],ZC=[`title`,`aria-label`,`disabled`,`onClick`],QC={key:0,class:`conversion-fields`},$C={class:`field`},ew=[`onUpdate:modelValue`,`disabled`,`onChange`],tw=[`value`],nw={key:0,class:`conversion-fields`},rw=[`title`,`aria-label`,`disabled`,`onClick`],iw=[`title`,`aria-label`,`disabled`,`onClick`],aw=hr({__name:`WorkflowSteps`,props:{steps:{},disabled:{type:Boolean},duration:{},revision:{},defaultStep:{type:Function}},emits:[`change`],setup(e,{emit:t}){let n=e,r=t;function i(e,t){[n.steps[e],n.steps[e+t]]=[n.steps[e+t],n.steps[e]],r(`change`)}function a(e,t){n.steps[e]=n.defaultStep(t.target.value),r(`change`)}return(t,n)=>(K(!0),q(G,null,Pr(e.steps,(t,o)=>(K(),q(`li`,{key:o,class:`workflow-step`},[J(`div`,qC,[J(`span`,null,F(o+1),1),J(`select`,{value:t.operation,"aria-label":`步骤 ${o+1} 操作`,disabled:e.disabled,onChange:e=>a(o,e)},[...n[2]||=[J(`option`,{value:`trim`},`保留区间`,-1),J(`option`,{value:`join_clips`},`选段拼接`,-1),J(`option`,{value:`resize`},`缩放`,-1),J(`option`,{value:`mute`},`静音`,-1)]],40,JC),J(`button`,{class:`icon-button`,type:`button`,title:`上移步骤 ${o+1}`,"aria-label":`上移步骤 ${o+1}`,disabled:e.disabled||o===0,onClick:e=>i(o,-1)},[Y(W(Dc),{"aria-hidden":`true`})],8,YC),J(`button`,{class:`icon-button`,type:`button`,title:`下移步骤 ${o+1}`,"aria-label":`下移步骤 ${o+1}`,disabled:e.disabled||o===e.steps.length-1,onClick:e=>i(o,1)},[Y(W(wc),{"aria-hidden":`true`})],8,XC),J(`button`,{class:`icon-button`,type:`button`,title:`删除步骤 ${o+1}`,"aria-label":`删除步骤 ${o+1}`,disabled:e.disabled,onClick:t=>{e.steps.splice(o,1),r(`change`)}},[Y(W(al),{"aria-hidden":`true`})],8,ZC)]),t.operation===`trim`?(K(),q(`div`,QC,[Y(KC,{label:`开始（上一步结果，秒）`,"model-value":t.startMs/1e3,disabled:e.disabled,"onUpdate:modelValue":e=>{t.startMs=Math.round(e*1e3),r(`change`)}},null,8,[`model-value`,`disabled`,`onUpdate:modelValue`]),Y(KC,{label:`结束（秒）`,"model-value":t.endMs/1e3,disabled:e.disabled,"onUpdate:modelValue":e=>{t.endMs=Math.round(e*1e3),r(`change`)}},null,8,[`model-value`,`disabled`,`onUpdate:modelValue`])])):t.operation===`resize`?(K(),q(G,{key:1},[J(`label`,$C,[n[3]||=X(`分辨率`,-1),Mn(J(`select`,{"onUpdate:modelValue":e=>t.resolutionPreset=e,disabled:e.disabled,onChange:e=>{t.width=t.resolutionPreset===`custom`?1920:null,t.height=t.resolutionPreset===`custom`?1080:null,r(`change`)}},[(K(),q(G,null,Pr([`source`,`360p`,`480p`,`720p`,`1080p`,`1440p`,`2160p`,`custom`],e=>J(`option`,{key:e,value:e},F(e===`source`?`当前分辨率`:e===`custom`?`自定义`:e),9,tw)),64))],40,ew),[[qo,t.resolutionPreset]])]),t.resolutionPreset===`custom`?(K(),q(`div`,nw,[Y(KC,{modelValue:t.width,"onUpdate:modelValue":[e=>t.width=e,n[0]||=e=>r(`change`)],label:`最大宽度`,min:2,step:`1`,disabled:e.disabled},null,8,[`modelValue`,`onUpdate:modelValue`,`disabled`]),Y(KC,{modelValue:t.height,"onUpdate:modelValue":[e=>t.height=e,n[1]||=e=>r(`change`)],label:`最大高度`,min:2,step:`1`,disabled:e.disabled},null,8,[`modelValue`,`onUpdate:modelValue`,`disabled`])])):ea(``,!0)],64)):t.operation===`join_clips`?(K(),q(G,{key:2},[(K(!0),q(G,null,Pr(t.clips,(n,i)=>(K(),q(`div`,{key:i,class:`workflow-range`},[Y(KC,{label:`片段 ${i+1} 开始（秒）`,"model-value":n.startMs/1e3,disabled:e.disabled,"onUpdate:modelValue":e=>{n.startMs=Math.round(e*1e3),r(`change`)}},null,8,[`label`,`model-value`,`disabled`,`onUpdate:modelValue`]),Y(KC,{label:`结束（秒）`,"model-value":n.endMs/1e3,disabled:e.disabled,"onUpdate:modelValue":e=>{n.endMs=Math.round(e*1e3),r(`change`)}},null,8,[`model-value`,`disabled`,`onUpdate:modelValue`]),J(`button`,{class:`icon-button`,type:`button`,title:`删除步骤 ${o+1} 的片段 ${i+1}`,"aria-label":`删除步骤 ${o+1} 的片段 ${i+1}`,disabled:e.disabled||t.clips.length===1,onClick:e=>{t.clips.splice(i,1),r(`change`)}},[Y(W(pl),{"aria-hidden":`true`})],8,rw)]))),128)),J(`button`,{class:`icon-button`,type:`button`,title:`步骤 ${o+1} 添加区间`,"aria-label":`步骤 ${o+1} 添加区间`,disabled:e.disabled||t.clips.length>=20,onClick:n=>{t.clips.push({startMs:0,endMs:Math.min(5e3,e.duration||5e3)}),r(`change`)}},[Y(W(Jc),{"aria-hidden":`true`})],8,iw)],64)):ea(``,!0)]))),128))}});function ow(e){let t=Mt({rows:[],steps:[],joinDisabled:!1,workflowDisabled:!1,preview:!1,duration:0,revision:0}),n=ls({render:()=>Aa(UC,{rows:t.rows,disabled:t.joinDisabled,preview:t.preview,revision:t.revision,onChange:e.joinChanged,onPreview:e.previewJoin})}),r=ls({render:()=>Aa(aw,{steps:t.steps,disabled:t.workflowDisabled,duration:t.duration,revision:t.revision,defaultStep:e.defaultStep,onChange:e.workflowChanged})});return n.mount(document.getElementById(`join-clips`)),r.mount(document.getElementById(`workflow-steps`)),{update(e){e.rows&&=jt(e.rows),e.steps&&=jt(e.steps),Object.assign(t,e),t.revision++},dispose(){n.unmount(),r.unmount()}}}var sw=[`data-segment-id`],cw=[`max`,`aria-label`,`value`,`disabled`,`onInput`],lw=[`max`,`aria-label`,`value`,`disabled`,`onInput`],uw=[`onUpdate:modelValue`,`aria-label`,`disabled`],dw=[`data-correct`,`title`,`aria-label`,`disabled`,`onClick`],fw={key:0,class:`subtitle-suggestion`},pw=[`disabled`,`onClick`],mw=hr({__name:`SubtitleSegments`,props:{segments:{},revision:{},disabled:{type:Boolean},canCorrect:{type:Boolean},correctionTitle:{},duration:{},correct:{type:Function}},emits:[`change`],setup(e,{emit:t}){let n=e,r=t,i=jt({});Rn(()=>n.revision,()=>{for(let e of Object.keys(i))delete i[e]});async function a(e){let t=n.revision,r=await n.correct(e);t===n.revision&&r!==null&&(i[e]=r)}return(t,n)=>(K(!0),q(G,null,Pr(e.segments,(t,o)=>(K(),q(`li`,{key:t.id,class:`subtitle-segment`,"data-segment-id":t.id},[J(`span`,null,F(o+1),1),J(`label`,null,[n[1]||=X(`开始（秒）`,-1),J(`input`,{type:`number`,min:`0`,step:`0.001`,max:e.duration/1e3,"data-field":`startMs`,"aria-label":`第${o+1}段开始（秒）`,value:Number.isFinite(t.startMs)?t.startMs/1e3:``,disabled:e.disabled,onInput:e=>{t.startMs=e.target.value===``?NaN:Math.round(Number(e.target.value)*1e3),r(`change`)}},null,40,cw)]),J(`label`,null,[n[2]||=X(`结束（秒）`,-1),J(`input`,{type:`number`,min:`0`,step:`0.001`,max:e.duration/1e3,"data-field":`endMs`,"aria-label":`第${o+1}段结束（秒）`,value:Number.isFinite(t.endMs)?t.endMs/1e3:``,disabled:e.disabled,onInput:e=>{t.endMs=e.target.value===``?NaN:Math.round(Number(e.target.value)*1e3),r(`change`)}},null,40,lw)]),J(`label`,null,[n[3]||=X(`字幕`,-1),Mn(J(`textarea`,{"onUpdate:modelValue":e=>t.text=e,rows:`2`,maxlength:`4000`,"data-field":`text`,"aria-label":`第${o+1}段字幕`,disabled:e.disabled,onInput:n[0]||=e=>r(`change`)},null,40,uw),[[Uo,t.text]])]),J(`button`,{class:`icon-button`,type:`button`,"data-correct":t.id,title:e.correctionTitle,"aria-label":`校对第${o+1}段`,disabled:e.disabled||!e.canCorrect,onClick:e=>a(t.id)},[Y(W(dl),{"aria-hidden":`true`})],8,dw),i[t.id]==null?ea(``,!0):(K(),q(`div`,fw,[J(`p`,null,F(i[t.id]),1),J(`button`,{class:`button secondary compact`,type:`button`,disabled:e.disabled,onClick:e=>{t.text=i[t.id],delete i[t.id],r(`change`)}},[Y(W(kc),{"aria-hidden":`true`}),n[4]||=X(`采用建议`,-1)],8,pw)]))],8,sw))),128))}}),hw={class:`translation-time muted`},gw={class:`field`},_w=[`onUpdate:modelValue`,`aria-label`,`disabled`],vw=[`aria-label`],yw=hr({__name:`TranslationSegments`,props:{source:{},segments:{},bilingual:{type:Boolean},disabled:{type:Boolean}},setup(e){return(t,n)=>(K(!0),q(G,null,Pr(e.segments,(t,r)=>(K(),q(`li`,{key:t.id,class:`translation-segment`},[J(`small`,hw,F(r+1)+` · `+F((t.startMs/1e3).toFixed(3))+` - `+F((t.endMs/1e3).toFixed(3))+` 秒`,1),J(`p`,null,F(e.source[r].text),1),J(`label`,gw,[n[0]||=X(`译文`,-1),Mn(J(`textarea`,{"onUpdate:modelValue":e=>t.text=e,rows:`3`,maxlength:`4000`,"aria-label":`第${r+1}段译文`,disabled:e.disabled},null,8,_w),[[Uo,t.text]])]),J(`output`,{"aria-label":`第${r+1}段字幕预览`},F((e.bilingual?e.source[r].text+`
`:``)+t.text.replace(/\r\n?/g,`
`).trim()),9,vw)]))),128))}});function bw(e){let t=Mt({segments:[],source:[],translated:[],revision:0,disabled:!0,canCorrect:!1,correctionTitle:``,duration:0,translationDisabled:!1,bilingual:!1}),n=ls({render:()=>Aa(mw,{segments:t.segments,revision:t.revision,disabled:t.disabled,canCorrect:t.canCorrect,correctionTitle:t.correctionTitle,duration:t.duration,correct:e.correct,onChange:e.changed})}),r=ls({render:()=>Aa(yw,{source:t.source,segments:t.translated,disabled:t.translationDisabled,bilingual:t.bilingual})});return n.mount(document.getElementById(`subtitle-segments`)),r.mount(document.getElementById(`translation-segments`)),{update(e){Object.assign(t,e)},setSegments(e){t.segments=jt(structuredClone(e)),t.revision++},setTranslation(e,n){t.source=e,t.translated=jt(n)},clearTranslation(){t.source=[],t.translated=[]},dispose(){n.unmount(),r.unmount()}}}var xw=[{id:`tencent`,name:`腾讯云语音识别`,fields:[[`appId`,`AppId`,!1,20],[`secretId`,`SecretId`,!0,128],[`secretKey`,`SecretKey`,!0,256]]},{id:`aliyun`,name:`阿里云百炼语音识别`,fields:[[`apiKey`,`API Key`,!0,512],[`workspaceId`,`Workspace ID`,!1,80]]},{id:`deepseek`,name:`文字 AI`,fields:[[`apiKey`,`API Key`,!0,512],[`model`,`模型`,!1,80],[`workspaceId`,`Workspace ID（北京，可选）`,!1,80]]}],Sw={deepseek:{name:`DeepSeek`,model:`deepseek-flash`,models:[[`deepseek-flash`,`DeepSeek Flash`],[`deepseek-v4-pro`,`DeepSeek V4 Pro`]],endpoint:`https://api.deepseek.com/chat/completions`},openai:{name:`OpenAI`,model:``,models:[[`gpt-6-sol`,`GPT-6 Sol`],[`gpt-6-astra`,`GPT-6 Astra`],[`gpt-5.6-sol`,`GPT-5.6 Sol`],[`gpt-5.6-luna`,`GPT-5.6 Luna`]],endpoint:`https://api.openai.com/v1/chat/completions`},bailian:{name:`千问 / 阿里云百炼`,model:`qwen-plus`,models:[[`qwen-plus`,`千问 Plus`],[`qwen-flash`,`千问 Flash`],[`qwen-max`,`千问 Max`]],endpoint:`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`},doubao:{name:`豆包 / 火山方舟`,model:``,models:[[`doubao-seed-2-1-lite-260915`,`豆包 Seed 2.1 Lite`],[`doubao-seed-2-1-pro-260915`,`豆包 Seed 2.1 Pro`],[`doubao-seed-2-0-mini-260428`,`豆包 Seed 2.0 Mini`]],endpoint:`https://ark.cn-beijing.volces.com/api/v3/chat/completions`}},Cw=`[A-Za-z0-9_.:\\/\\-]{1,80}`,ww={appId:[/^[0-9]{1,20}$/,`AppId 应为1至20位数字。`],secretId:[/^[A-Za-z0-9]{1,128}$/,`SecretId 应为字母或数字，不要填写网址或其他字段。`],secretKey:[/^[A-Za-z0-9+/=_-]{1,256}$/,`SecretKey 格式不正确，请复制对应供应商的密钥。`],apiKey:[/^[A-Za-z0-9_.-]{1,512}$/,`API Key 格式不正确。只填写密钥，不要包含网址、Bearer 前缀、空格或换行。`]},Tw=[`id`,`data-dirty`],Ew={class:`section-heading`},Dw={class:`field`},Ow=[`aria-label`,`disabled`],kw={value:`SERVER`},Aw=[`hidden`],jw=[`hidden`],Mw={key:0,class:`field`},Nw=[`disabled`],Pw=[`value`],Fw=[`hidden`],Iw=[`aria-label`,`required`,`disabled`],Lw=[`value`,`title`],Rw=[`onUpdate:modelValue`,`name`,`type`,`maxlength`,`autocomplete`,`aria-label`,`data-secret`,`placeholder`,`required`,`pattern`,`disabled`],zw=[`hidden`],Bw=[`required`,`pattern`,`placeholder`,`disabled`],Vw={key:2,class:`cloud-endpoint`},Hw={"aria-label":`官方接口地址`},Uw={class:`cloud-provider-actions`},Ww=[`aria-label`,`disabled`],Gw=[`aria-label`,`hidden`,`disabled`],Kw=hr({__name:`CloudProvider`,props:{provider:{},saved:{},disabled:{type:Boolean},resetKey:{},services:{}},setup(e){let t=e,n=U(),r=U();function i(){return t.saved}let a=i(),o=U(a.mode),s=U(a.textProvider||`deepseek`),c=U(!1),l=jt({appId:a.appId||``,workspaceId:a.workspaceId||``,apiKey:``,secretId:``,secretKey:``,model:a.mode===`PERSONAL`?a.model||``:Sw[s.value].model,customModel:``}),u=ka(()=>t.provider.id===`deepseek`),d=ka(()=>Sw[s.value]),f=ka(()=>t.saved.personalStored&&t.saved.mode===`PERSONAL`&&(!u.value||s.value===(t.saved.textProvider||`deepseek`))),p=ka(()=>{let e=[...d.value.models];return t.saved.mode===`PERSONAL`&&s.value===(t.saved.textProvider||`deepseek`)&&t.saved.model&&!e.some(([e])=>e===t.saved.model)&&e.push([t.saved.model,`已保存：`+t.saved.model]),e});t.saved.mode===`PERSONAL`&&!d.value.models.some(([e])=>e===t.saved.model)&&(l.customModel=t.saved.model||``);let m=ka(()=>u.value&&l.model===`__custom__`),h=ka(()=>t.saved.available??t.saved.configured),g=ka(()=>c.value?`未保存`:t.saved.mode===`OFF`?`已停用`:t.saved.mode===`SERVER`?h.value?`服务端模型已就绪`:u.value?`服务端模型暂不可用，请检查模型服务是否已启动。`:`服务端模型不支持语音识别，请配置我的凭据`:h.value?`个人凭据已配置`:t.saved.unavailableReason||(t.saved.personalStored?`个人凭据不可读取`:`个人凭据尚未配置`)),_=ka(()=>s.value===`bailian`&&/^[A-Za-z0-9][A-Za-z0-9-]{0,79}$/.test(l.workspaceId)?`https://${l.workspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions`:d.value.endpoint);function v(){c.value=!0}function y(){l.apiKey=``,l.secretId=``,l.secretKey=``}Rn(()=>t.resetKey,y);function b(){y(),l.customModel=``,l.workspaceId=``,l.model=d.value.model,v()}function x(e,t){return u.value&&e===`apiKey`?d.value.name+` API Key`:u.value&&e===`model`?d.value.name+` 模型`:t}function S(e){return!t.disabled&&n.value?.isConnected&&t.services.context()===e}async function C(){if(t.disabled)return;if(l.customModel=l.customModel.trim(),o.value===`PERSONAL`)for(let[e,n]of t.provider.fields){let i=ww[e];if(i&&(l[e]=l[e].trim(),l[e]?!i[0].test(l[e]):!f.value)){t.services.error(l[e]?i[1]:`请填写`+t.provider.name+` `+x(e,n)+`。`),r.value?.querySelector(`input[name="${e}"]`)?.focus();return}}if(await _n(),!r.value?.reportValidity())return;let e=t.services.context(),n={expectedVersion:t.saved.version,mode:o.value};if(o.value===`PERSONAL`){u.value&&(n.textProvider=s.value);for(let[e,,r]of t.provider.fields)u.value&&e===`workspaceId`&&s.value!==`bailian`||r&&!l[e]||(n[e]=l[e]);if(m.value&&(n.model=l.customModel),!await t.services.confirm({title:`保存个人凭据`,message:`将${t.provider.name}的个人凭据加密保存在此服务器。后续调用使用你在对应服务商的额度，保存本身不会发起付费调用。`,confirmLabel:`保存凭据`,kind:`info`,icon:`key-round`}))return}else if(t.saved.personalStored&&!await t.services.confirm({title:`切换服务来源`,message:`这会删除此供应商已保存的个人凭据，并切换到所选服务来源。恢复个人服务时需要重新填写凭据。`,confirmLabel:`删除并切换`,kind:`danger`,icon:`key-round`}))return;S(e)&&await t.services.write(t.provider.id,`PUT`,n)}async function w(){if(t.disabled)return;let e=t.services.context();await t.services.confirm({title:`删除个人凭据`,message:`删除${t.provider.name}的个人凭据并停用此服务。不会自动切换到服务端模型或其他供应商；重新启用时需再次配置。`,confirmLabel:`删除并停用`,kind:`danger`,icon:`trash-2`})&&S(e)&&await t.services.write(t.provider.id,`DELETE`,{expectedVersion:t.saved.version})}return(t,i)=>(K(),q(`article`,{id:`cloud-${e.provider.id}`,ref_key:`article`,ref:n,class:`cloud-provider`,"data-dirty":c.value?`true`:void 0},[J(`div`,Ew,[J(`h3`,null,F(e.provider.name),1),J(`span`,{class:pe([`cloud-provider-status muted`,{error:!c.value&&e.saved.mode!==`OFF`&&!h.value}]),role:`status`},F(g.value),3)]),J(`form`,{ref_key:`form`,ref:r,autocomplete:`off`,onSubmit:i[5]||=rs(()=>{},[`prevent`])},[J(`label`,Dw,[i[8]||=X(`服务来源`,-1),Mn(J(`select`,{"onUpdate:modelValue":i[0]||=e=>o.value=e,name:`mode`,"aria-label":`${e.provider.name}凭据来源`,disabled:e.disabled,onChange:i[1]||=e=>{y(),v()}},[i[6]||=J(`option`,{value:`PERSONAL`},`我的凭据`,-1),J(`option`,kw,F(u.value?`服务端部署 · 千问`:`服务端模型（不支持语音识别）`),1),i[7]||=J(`option`,{value:`OFF`},`停用`,-1)],40,Ow),[[qo,o.value]])]),J(`p`,{class:`model-warning`,hidden:!u.value||o.value!==`SERVER`},`服务端使用轻量模型，理解能力有限，复杂要求可能解析不准确。`,8,Aw),J(`div`,{class:`cloud-fields`,hidden:o.value!==`PERSONAL`},[u.value?(K(),q(`label`,Mw,[i[9]||=X(`模型供应商`,-1),Mn(J(`select`,{"onUpdate:modelValue":i[2]||=e=>s.value=e,name:`textProvider`,"aria-label":`文字 AI模型供应商`,disabled:e.disabled||o.value!==`PERSONAL`,onChange:b},[(K(!0),q(G,null,Pr(W(Sw),(e,t)=>(K(),q(`option`,{key:t,value:t},F(e.name),9,Pw))),128))],40,Nw),[[qo,s.value]])])):ea(``,!0),(K(!0),q(G,null,Pr(e.provider.fields,([t,n,r,a])=>(K(),q(`label`,{key:t,class:`field`,hidden:u.value&&t===`workspaceId`&&s.value!==`bailian`},[X(F(x(t,n))+` `,1),u.value&&t===`model`?Mn((K(),q(`select`,{key:0,"onUpdate:modelValue":i[3]||=e=>l.model=e,name:`model`,"aria-label":`${e.provider.name} ${x(t,n)}`,required:o.value===`PERSONAL`,disabled:e.disabled||o.value!==`PERSONAL`,onChange:v},[i[10]||=J(`option`,{value:``,disabled:``},`请选择模型`,-1),(K(!0),q(G,null,Pr(p.value,([e,t])=>(K(),q(`option`,{key:e,value:e,title:e},F(t),9,Lw))),128)),i[11]||=J(`option`,{value:`__custom__`},`自定义模型`,-1)],40,Iw)),[[qo,l.model]]):Mn((K(),q(`input`,{key:1,"onUpdate:modelValue":e=>l[t]=e,name:t,type:r?`password`:`text`,maxlength:a,autocomplete:r?`new-password`:`off`,spellcheck:!1,"aria-label":`${e.provider.name} ${x(t,n)}`,"data-secret":r?`true`:void 0,placeholder:r?f.value?`已保存，留空保留`:u.value?`填写此供应商的 API Key`:n:void 0,required:u.value&&t===`apiKey`&&o.value===`PERSONAL`&&!f.value,pattern:u.value&&t===`workspaceId`?`[A-Za-z0-9][A-Za-z0-9-]{0,79}`:void 0,disabled:e.disabled||o.value!==`PERSONAL`||u.value&&t===`workspaceId`&&s.value!==`bailian`,onInput:v},null,40,Rw)),[[Qo,l[t]]])],8,Fw))),128)),u.value?(K(),q(`label`,{key:1,class:`field`,hidden:!m.value},[i[12]||=X(`自定义模型 ID`,-1),Mn(J(`input`,{"onUpdate:modelValue":i[4]||=e=>l.customModel=e,name:`customModel`,type:`text`,maxlength:`80`,autocomplete:`off`,spellcheck:!1,"aria-label":`自定义模型 ID`,required:m.value&&o.value===`PERSONAL`,pattern:m.value&&o.value===`PERSONAL`?W(Cw):void 0,placeholder:s.value===`doubao`?`Model ID 或 Endpoint ID（ep-...）`:`填写供应商提供的模型 ID`,disabled:e.disabled||o.value!==`PERSONAL`,onInput:v},null,40,Bw),[[Uo,l.customModel]])],8,zw)):ea(``,!0),u.value?(K(),q(`div`,Vw,[J(`output`,Hw,F(_.value),1)])):ea(``,!0),i[13]||=J(`p`,{class:`cloud-endpoint muted`},`保存仅检查格式，不验证密钥、权限或余额；请使用所选供应商的密钥。真实调用失败时会显示具体原因。`,-1)],8,jw),J(`div`,Uw,[J(`button`,{class:`button primary`,type:`button`,title:`保存配置`,"aria-label":`保存${e.provider.name}配置`,disabled:e.disabled,onClick:C},[Y(W(Zc),{"aria-hidden":`true`}),i[14]||=J(`span`,null,`保存`,-1)],8,Ww),J(`button`,{class:`icon-button danger-outline`,type:`button`,title:`删除个人凭据并停用`,"aria-label":`删除${e.provider.name}个人凭据`,hidden:!e.saved.personalStored,disabled:e.disabled,onClick:w},[Y(W(al),{"aria-hidden":`true`})],8,Gw)])],544)],8,Tw))}});function qw(e){let t=Mt({entries:[],disabled:!0,resetKey:0}),n=[`text`,`speech`].map(n=>{let r=ls({render:()=>t.entries.filter(e=>e.provider===`deepseek`==(n===`text`)).map(n=>Aa(Kw,{key:`${n.provider}:${n.version}`,provider:xw.find(e=>e.id===n.provider),saved:n,disabled:t.disabled,resetKey:t.resetKey,services:e}))});return r.mount(document.getElementById(`cloud-${n}-providers`)),r});return{update(e){Object.assign(t,e)},clearSecrets(){t.resetKey++},dispose(){n.forEach(e=>e.unmount())}}}var Jw=n({createRecordState:()=>jC,existingPasswordIssue:()=>jx,mountApplication:()=>Yw,mountCloudSettings:()=>qw,mountFindResults:()=>Zw,mountHistory:()=>MC,mountPlanDetails:()=>Qw,mountSequenceEditors:()=>ow,mountTranscriptEditors:()=>bw,mountWorkspaceNavigation:()=>Xw,newPasswordIssue:()=>kx,textVendors:()=>Sw,toolNames:()=>vl,usernameIssue:()=>Ax});function Yw(e,t){return ls(WS,{auth:e,home:t}).mount(`#app`)}function Xw(e,t){let n=uC(),r=ls({render:()=>Aa(cC,{state:n.state,onSelect:e=>{n.state.busy||t.selectPhase(e)}})});return r.mount(e),n.connect(),{...n,get tool(){return n.tool},get phase(){return n.phase},dispose(){n.dispose(),r.unmount()}}}function Zw(e,t){let n=Mt({result:null,recommend:!1,busy:!1,previewAvailable:!1,canTrim:!1,canJoin:!1}),r=ls({render:()=>Aa(rC,{...n,onAction:t})});return r.mount(e),{update(e){Object.assign(n,e)},clear(){n.result=null},dispose(){r.unmount()}}}function Qw(e){let t=Mt({plan:null}),n=ls({render:()=>Aa(oC,{plan:t.plan})});return n.mount(e),{update(e){t.plan=e},dispose(){n.unmount()}}}function $w(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function eT(e){return $w(e)&&typeof e.field==`string`&&typeof e.message==`string`}async function tT(e){let t=await e.json().catch(()=>null);return $w(t)?t:{}}function nT(e){let t=null,n=0;class r extends Error{code;status;retryAfter;details;constructor(t,n,r,i=[]){super(t===`RATE_LIMITED`?`操作过于频繁，请在${Math.max(1,Number(r)||60)}秒后重试。`:e(t)),this.name=`ApiError`,this.code=t,this.status=n,this.retryAfter=Math.max(1,Number(r)||60),this.details=Array.isArray(i)?i.filter(eT).slice(0,20):[]}}async function i(){let e=n,r=await fetch(`/api/auth/csrf`,{credentials:`same-origin`,cache:`no-store`});if(!r.ok)throw Error(`暂时无法连接服务，请稍后重试。`);let i=await tT(r);if(i.code!==`SUCCESS`||!$w(i.data)||typeof i.data.token!=`string`||!i.data.token)throw Error(`暂时无法连接服务，请稍后重试。`);e===n&&(t=i.data.token)}async function a(e,n={},o=!1){if(!e.startsWith(`/api/`))throw Error(`接口地址必须属于本站。`);let s=n.method||`GET`,c=s!==`GET`;c&&!t&&await i();let l={Accept:`application/json`};c&&t&&(l[`X-CSRF-Token`]=t),n.body!==void 0&&!(n.body instanceof FormData)&&(l[`Content-Type`]=`application/json`);let u;try{u=await fetch(e,{method:s,headers:l,credentials:`same-origin`,cache:`no-store`,body:n.body===void 0?void 0:n.body instanceof FormData?n.body:JSON.stringify(n.body)})}catch{throw Error(`暂时无法连接服务，请稍后重试。`)}let d=await tT(u);if(!u.ok||d.code!==`SUCCESS`){if(u.status===403&&d.code===`CSRF_INVALID`&&!o)return await i(),a(e,n,!0);throw new r(typeof d.code==`string`?d.code:`INTERNAL_ERROR`,u.status,u.headers.get(`Retry-After`),d.details)}return d.data}return{request:a,refreshCsrf:i,ApiError:r,setCsrfToken(e){n++,t=e}}}var rT=1180,iT=`auth-burn-outgoing`;function aT(e,t,n){if(e.hidden||document.hidden||!CSS.supports(`clip-path`,`path(evenodd, "M 0 0 Z")`))return;let r=e.getBoundingClientRect(),i=document.documentElement.clientWidth,a=window.innerHeight;if(!r.width||!a||!i)return;let o=document.createElement(`canvas`),s=o.getContext(`2d`);if(!s)return;let c=s,l=Math.min(devicePixelRatio||1,1.3,Math.sqrt(2e6/(i*a)));o.width=Math.ceil(i*l),o.height=Math.ceil(a*l),o.className=`auth-burn-fire`,o.setAttribute(`aria-hidden`,`true`),c.setTransform(o.width/i,0,0,o.height/a,0,0),c.lineJoin=c.lineCap=`round`;let u=t?.getBoundingClientRect(),d=u?.width?u.left+u.width/2:i*.65,f=u?.height?u.top+u.height/2:a*.55,p=Math.max(8,Math.min(i-8,d)),m=Math.max(8,Math.min(a-8,f)),h=Math.hypot(Math.max(p,i-p),Math.max(m,a-m)),g=h*1.16+55,_=Math.max(240,Math.min(620,Math.round(h*.43))),v=Array.from({length:_},(e,t)=>{let n=t*Math.PI*2/_;return{angle:n,dx:Math.cos(n),dy:Math.sin(n),radius:0}}),y=[],b=`M ${-r.left} ${-r.top} h ${i} v ${a} h ${-i} Z`,x=e.inert,S=0,C=!0,w=0,T=!0;e.style.setProperty(`--burn-top`,`${r.top}px`),e.style.setProperty(`--burn-left`,`${r.left}px`),e.style.setProperty(`--burn-width`,`${r.width}px`),e.style.setProperty(`--burn-height`,`${r.height}px`),e.classList.add(iT),e.inert=!0,document.body.append(o);function E(){if(C){C=!1,cancelAnimationFrame(S),window.removeEventListener(`resize`,E),window.removeEventListener(`pagehide`,E),document.removeEventListener(`visibilitychange`,E),o.remove(),e.hidden=!0,e.inert=x,e.classList.remove(iT),e.style.removeProperty(`clip-path`);for(let t of[`--burn-top`,`--burn-left`,`--burn-width`,`--burn-height`])e.style.removeProperty(t);n()}}function D(e=0){c.beginPath();for(let[t,n]of v.entries()){let r=p+n.dx*(n.radius+e),i=m+n.dy*(n.radius+e);t===0?c.moveTo(r,i):c.lineTo(r,i)}c.closePath()}function O(e,t,n=0,r=t){c.lineWidth=e,c.strokeStyle=t,c.shadowBlur=n,c.shadowColor=r,c.stroke(),c.shadowBlur=0}function k(e){c.beginPath();let t=!1;for(let n of v){if(Math.sin(n.angle*27+e*15)+.45*Math.sin(n.angle*63-e*8)<.3){t=!1;continue}let r=p+n.dx*(n.radius-.8),i=m+n.dy*(n.radius-.8);t?c.lineTo(r,i):c.moveTo(r,i),t=!0}O(3.1,`#fff6ce`,9,`#ffc76e`)}function A(e){if(e-w>22&&e<1015){w=e;for(let t=0;t<16;t++){let t=v[Math.floor(Math.random()*v.length)],n=p+t.dx*t.radius,r=m+t.dy*t.radius;if(n<0||n>i||r<0||r>a)continue;let o=22+Math.random()*95,s=Math.random()<.44;y.push({x:n,y:r,vx:-t.dx*o+(Math.random()-.5)*42,vy:-t.dy*o-42,born:e,life:150+Math.random()*275,size:.7+Math.random()*(s?3.4:2.2),ash:s})}}for(let t=y.length-1;t>=0;t--){let n=y[t],r=e-n.born;if(r>=n.life){y.splice(t,1);continue}let i=r/1e3,a=n.x+n.vx*i,o=n.y+n.vy*i-38*i*i;c.globalAlpha=(1-r/n.life)*(n.ash?.58:.92),c.fillStyle=n.ash?`#3a2a24`:r<70?`#fff0a6`:`#e88633`,c.fillRect(a,o,n.size,n.size*(n.ash?.73:1))}c.globalAlpha=1}let j=performance.now();function ee(t){let n=Math.max(0,t-j);if(n>=rT){E();return}c.clearRect(0,0,i,a);let o=Math.min(1,n/1095),s=g*o**1.23,l=Math.min(1,s/95),u=Math.min(68,s*.12),d=n/1e3,f=!1,_=v.map(e=>{let t=e.angle,n=Math.sin(t*4+2.1+d*.42)*.5+Math.sin(t*9-.9-d*1.1)*.3+Math.sin(t*17+d*1.8)*.2,o=6.5*Math.sin(t*31+d*6)+3.5*Math.sin(t*59-d*5)+2*Math.sin(t*91+d*4.6)+1.25*Math.sin(t*115-d*7);e.radius=Math.max(0,s+u*n+l*o);let c=p+e.dx*e.radius,h=m+e.dy*e.radius;return f||=c>-70&&c<i+70&&h>-70&&h<a+70,`${(c-r.left).toFixed(1)} ${(h-r.top).toFixed(1)}`});if(T&&(s-u-14>h?(T=!1,e.hidden=!0):e.style.clipPath=`path(evenodd, "${b} M ${_.join(` L `)} Z")`),f&&s>2){let e=Math.min(1,s/24);c.globalAlpha=e,D(9),O(14,`#47312419`,30,`#261b1690`),D(5),O(10,`#321b12a6`,6,`#654023a1`),D(),O(9,`#f9772573`,19,`#fa7a29d0`),O(3.7,`#ffa651d6`,7,`#ffb64a`),O(1.5,`#ffe3acd8`),k(d)}A(n),S=requestAnimationFrame(ee)}return window.addEventListener(`resize`,E),window.addEventListener(`pagehide`,E),document.addEventListener(`visibilitychange`,E),S=requestAnimationFrame(ee),E}function oT(e,t){let n=Mt({limits:null,file:null,item:null,pending:null,uploadError:``,detectionError:``}),r=0;function i(e){n.limits=e}function a(e){return e.size?n.limits?.maxUploadBytes&&e.size>n.limits.maxUploadBytes?`单个文件不能超过 ${Sl(n.limits.maxUploadBytes)}。`:``:`请选择非空的视频文件。`}function o(e){n.pending!==`upload`&&(n.uploadError=a(e),n.file=n.uploadError?null:e)}function s(){r++,Object.assign(n,{limits:null,item:null,file:null,pending:null,uploadError:``,detectionError:``})}function c(e){n.item=e,n.detectionError=``}function l(e){n.detectionError=e}async function u(e,i){if(n.pending)return;let a=r;n.pending=e,e===`upload`?n.uploadError=``:n.detectionError=``;try{let o=await i();if(r!==a||!o)return;e===`upload`&&(n.file=null),t.showMedia(o)}catch(i){if(r!==a)return;let o=Mx(i);o.status===401?t.sessionExpired():e===`upload`?n.uploadError=o.message:n.detectionError=o.message}finally{r===a&&(n.pending=null)}}function d(){let i=n.file;if(!i||!n.limits?.mediaTool||(n.uploadError=a(i),n.uploadError))return;let o=new FormData;o.append(`file`,i);let s=r;return u(`upload`,async()=>!await t.beforeUpload()||s!==r?null:e(`/api/media`,{method:`POST`,body:o}))}function f(){let t=n.item;if(t&&t.status===`PROBING`)return u(`refresh`,()=>e(`/api/media/${encodeURIComponent(t.id)}`))}function p(){let t=n.item;if(t&&t.status===`FAILED`&&n.limits?.mediaTool)return u(`retry`,()=>e(`/api/media/${encodeURIComponent(t.id)}/probe`,{method:`POST`}))}return{state:n,setLimits:i,setItem:c,reportError:l,stageFile:o,upload:d,refresh:f,retry:p,reset:s}}function $(e){let t=document.getElementById(e);if(!t)throw Error(`Missing application element: ${e}`);return t}function sT(){"use strict";let e=!1,t=0,n=Mt({visible:!1,registrationAllowed:!1,async login(n){t++,e=!0;try{let e=await V(`/api/auth/login`,{method:`POST`,body:n});ct(e.csrfToken),wt(e.user,!0),H(`account-notice`,``),it?.postMessage(`account-changed`)}finally{e=!1}},sendCode:e=>V(`/api/auth/registration-email-code`,{method:`POST`,body:{email:e}}),register:e=>V(`/api/auth/register`,{method:`POST`,body:e})}),r=oT((e,t)=>V(e,t),{beforeUpload:()=>sn(null),showMedia(e){j=1,cn(e)},sessionExpired(){Ct(),H(`auth-notice`,at.UNAUTHENTICATED,!0)}}),i=Mt({userName:``,section:`regular`,tool:`detect`,busy:!1,detection:r,open(e){!g&&u&&(e===`profile`||e===`settings`?(zt(`account`),Bt(e===`profile`?`profile`:`security`)):(zt(`workbench`),En(k.get(e)??hl.find(t=>t.group===e).id)))},openTool(e){u&&e!==i.tool&&En(e)},logout(){!g&&u&&Et(`account-notice`,()=>Lt(!1))}});Yw(n,i);let a=$(`recent-section`);$(`detect-library-slot`).append(a),$(`join-title`).textContent=`片段顺序`,$(`find-title`).textContent=`查找条件`,$(`ai-title`).textContent=`处理方案`,$(`subtitle-title`).textContent=`字幕编辑与导出`,$(`task-list-title`).textContent=`任务列表`;let o=Zw($(`find-results-view`),(e,t)=>{!g&&nt&&(e===`preview`?Wn(t):Un(t,e===`join`))}),s=Qw($(`ai-plan-details`)),{toolNames:c}=Jw,l=Xw($(`workspace-phases`),{selectPhase:e=>pn(e)});document.querySelectorAll(`[data-transport-warning]`).forEach(e=>{e.hidden=location.protocol!==`http:`||window.isSecureContext});let u=null,d=null,f=null,p=null,m=!1,h=0,g=!1,_=window.matchMedia(`(max-width: 900px)`),v=window.matchMedia(`(prefers-reduced-motion: reduce)`),y,b=td($(`auth-view`)),x=`amw-cloud-confirmation`,S=!1,C=null,w=null,T=``,E=new Map,D=`workbench`,O=`regular`,k=new Map,A=`profile`,j=1,ee=0,M=null,te=null,N=null,P=null,ne=1,re=0,ie=1,ae=0,oe=0,se=0,ce=jC(),le=ce.expanded,ue=ce.instructions,de=MC({openMedia:vr,removeMedia:yr,openTask:xr,removeTask:e=>Cr(`task`,e),inspectTask:Sr,restorePlan:wr,removePlan:e=>Cr(`plan`,e),size:Sl,mediaStatus:tn,operation:hr,taskStatus:mr,format:gr},le,ue),fe=new Set,pe=null,me=null,he=!1,ge=0,_e=null,ve=`transcode`,ye=null,be=null,xe=null,Se=null,F=0,I=null,Ce=null,L=0,we=0,R=!1,z=!1,Te=null,B=null,Ee=null,De=null,Oe=[],ke=null,Ae=0,je=!1,Me=!1,Ne=null,Pe=null,Fe=null,Ie=null,Le=0,Re=!1,ze=!1,Be=!1,Ve=!1,He=[],Ue=!1,We=[],Ge=null,Ke=0,qe=0,Je=ow({joinChanged:()=>{Me=!0,On(),Mn()},previewJoin:Pn,workflowChanged:Gn,defaultStep:Kn}),Ye=bw({changed:()=>{R=!0,or()},correct:lr}),Xe=qw({context:()=>JSON.stringify([u?.id,h,F]),confirm:vt,error:e=>H(`cloud-error`,e,!0),write:Yt}),Ze=null,Qe=null,$e=0,et=!1,tt=!1,nt=null,rt=null,it=typeof BroadcastChannel==`function`?new BroadcastChannel(`amw-account`):null,at={INVALID_CREDENTIALS:`用户名或密码不正确。`,UNAUTHENTICATED:`登录已失效，请重新登录。`,CSRF_INVALID:`安全验证已过期，请重新提交。`,HTTPS_REQUIRED:`请通过 HTTPS 安全连接访问本站。`,CURRENT_PASSWORD_INVALID:`当前密码不正确。`,ACCOUNT_ALREADY_EXISTS:`用户名或邮箱已被使用，请更换后重试。`,INVALID_REQUEST:`请完整填写表单。`,INVALID_PARAMETERS:`输入有误，请检查格式、长度及必填项。`,PASSWORD_UNCHANGED:`新密码不能与当前密码相同。`,WEAK_PASSWORD:`密码过于简单：至少使用3个不同字符，且不要使用常见弱密码。`,REGISTRATION_DISABLED:`当前暂未开放注册。`,EMAIL_DELIVERY_UNAVAILABLE:`验证邮件暂时无法发送，请稍后重试。`,EMAIL_VERIFICATION_INVALID:`验证码无效、已过期或尝试次数已用尽，请重新获取。`,MEDIA_TOOL_UNAVAILABLE:`视频检测工具暂不可用。`,MEDIA_PREVIEW_UNAVAILABLE:`原素材暂时无法直接预览。`,TRANSCODE_UNAVAILABLE:`视频转换工具暂不可用。`,COMPRESSION_TARGET_UNREACHABLE:`目标体积无法达成，请增大目标或降低分辨率。`,SOURCE_HAS_NO_AUDIO:`素材没有可提取的音轨。`,AUDIO_EXTRACTION_UNAVAILABLE:`MP3编码工具暂不可用。`,AUDIO_EXTRACTION_FAILED:`提取音频失败，请检查素材后重试。`,TRIM_FAILED:`视频裁切失败，请调整区间或更换素材。`,MUTE_FAILED:`视频静音失败，请检查素材后重试。`,AI_UNAVAILABLE:`AI 服务尚未配置或暂不可用。`,LOCAL_AI_UNAVAILABLE:`服务端模型暂不可用，请稍后重试或切换我的凭据。`,AI_BUSY:`AI 服务繁忙，请稍后重试。`,AI_PLAN_FAILED:`未生成有效方案，请修改处理要求后重试。`,AI_ANALYSIS_FAILED:`未得到有效的字幕分析结果，请修改目标或稍后重试。`,TRANSCRIPT_ANALYSIS_TOO_LARGE:`字幕超过本次分析上限，请使用较短素材。`,AI_FAILED:`文字校对失败，请稍后重试或手动修改。`,AI_TRANSLATION_FAILED:`字幕翻译结果无效或不完整，原字幕未修改。`,TRANSCRIPT_TRANSLATION_TOO_LARGE:`本批字幕超过翻译上限，请减少字幕内容。`,ASR_UNAVAILABLE:`所选语音识别服务尚未配置或暂不可用。`,ASR_FAILED:`语音识别失败，请检查服务配置或稍后重试。`,ASR_NO_SPEECH:`没有识别到有效语音。`,TRANSCRIPT_ALREADY_EXISTS:`素材已有字幕，请刷新后确认是否重新识别。`,TRANSCRIPT_VERSION_CONFLICT:`字幕已变更，请刷新字幕后重试。`,SUBTITLE_BURN_UNAVAILABLE:`字幕烧录工具暂不可用。`,SUBTITLE_BURN_FAILED:`字幕烧录失败，未生成可用结果。`,CLIP_JOIN_FAILED:`片段拼接失败，未生成可用结果。`,CLOUD_CREDENTIALS_UNAVAILABLE:`个人云端凭据暂不可读取，请检查加密密钥或重新配置。`,CLOUD_CREDENTIALS_CONFLICT:`云端配置已被修改，请刷新后重试。`,CLOUD_AUTH_FAILED:`云端身份验证失败。请前往设置 → AI服务，检查密钥、所选供应商及接口地域是否匹配。`,CLOUD_PERMISSION_DENIED:`云端拒绝访问。请检查账号状态、服务是否开通，以及密钥或工作空间权限。`,CLOUD_QUOTA_EXCEEDED:`云端余额或可用额度不足。请到对应供应商控制台检查余额、资源包和额度限制。`,CLOUD_MODEL_UNAVAILABLE:`云端模型或接入点不存在或无权访问。请在设置 → AI服务中检查模型ID、地域及开通权限。`,CLOUD_RATE_LIMITED:`云端调用频率或并发超限，请稍后重试。本次不会自动重试。`,CLOUD_REQUEST_REJECTED:`云端未接受请求。请检查所选模型是否支持当前功能、参数及输入内容。`,CLOUD_NETWORK_ERROR:`服务器无法连接云端服务。请检查服务器网络、代理及TLS连接。`,CLOUD_TIMEOUT:`云端调用超时，请稍后重试。本次不会自动重试。`,CLOUD_SERVICE_UNAVAILABLE:`云端服务暂不可用或返回异常，请稍后重试。`,QUEUE_FULL:`处理队列已满，请稍后重试。`,PLAN_VERSION_CONFLICT:`方案版本已变化，请刷新后重试。`,TASK_NOT_CANCELLABLE:`任务已经结束，无法取消。`,OUTPUT_UNAVAILABLE:`结果文件已丢失或不可用。`,FILE_TOO_LARGE:`文件超过上传大小限制。`,STORAGE_ERROR:`文件暂时无法保存，请稍后重试。`,RESOURCE_CONFLICT:`当前素材状态不允许此操作。`,RESOURCE_NOT_FOUND:`素材不存在或已不可访问。`,INTERNAL_ERROR:`操作暂时未完成，请稍后重试。`},{request:V,refreshCsrf:ot,ApiError:st,setCsrfToken:ct}=nT(e=>e===`AI_UNAVAILABLE`&&d?.textAi?.source===`SERVER`?at.LOCAL_AI_UNAVAILABLE:at[e]||`请求未完成，请稍后重试。`);function lt(){window.lucide?.createIcons()}function H(e,t,n=!1){let r=$(e);r.textContent=t,r.hidden=!t,r.classList.toggle(`error`,n)}function ut(){$(`skip-cloud-confirmation`).checked=S,$(`skip-cloud-confirmation`).disabled=!u}function dt(e=!1){S=!1;try{if(e)localStorage.removeItem(x);else{let e=JSON.parse(localStorage.getItem(x)||`null`);S=!!u&&e?.owner===u.id&&e?.skip===!0}}catch{}ut()}function ft(e){S=!!u&&e;try{S&&u?localStorage.setItem(x,JSON.stringify({owner:u.id,skip:!0})):localStorage.removeItem(x)}catch{}ut()}function pt(){return JSON.stringify([u?.id,F,M?.id,d?.textAi,d?.asrProviders,d?.asrModels,$(`asr-model`).value])}function mt(e){let t=C;t&&(C=null,e=e&&!g&&t.context===pt(),e&&t.paid&&$(`cloud-confirm-skip`).checked&&ft(!0),$(`cloud-confirm-dialog`).open&&$(`cloud-confirm-dialog`).close(),t.resolve(e))}function ht({provider:e,content:t,detail:n=``,paid:r=!0}){return g||!u||C||document.querySelector(`dialog[open]`)?Promise.resolve(!1):r&&S?Promise.resolve(!0):($(`cloud-confirm-title`).textContent=r?`确认调用云端服务`:`确认字幕翻译`,$(`cloud-confirm-provider`).textContent=e,$(`cloud-confirm-content`).textContent=t,$(`cloud-confirm-detail`).textContent=n,$(`cloud-confirm-detail`).hidden=!n,$(`cloud-confirm-fee`).hidden=!r,$(`cloud-confirm-skip-row`).hidden=!r,$(`cloud-confirm-dialog`).setAttribute(`aria-describedby`,[`cloud-confirm-description`,r&&`cloud-confirm-fee`,n&&`cloud-confirm-detail`].filter(Boolean).join(` `)),$(`cloud-confirm-skip`).checked=!1,new Promise(e=>{C={resolve:e,paid:r,context:pt()},$(`cloud-confirm-dialog`).showModal()}))}$(`skip-cloud-confirmation`).addEventListener(`change`,e=>ft(e.currentTarget.checked)),$(`accept-cloud-confirm`).addEventListener(`click`,()=>mt(!0));for(let e of[`cancel-cloud-confirm`,`close-cloud-confirm`])$(e).addEventListener(`click`,()=>mt(!1));$(`cloud-confirm-dialog`).addEventListener(`cancel`,e=>{e.preventDefault(),mt(!1)}),$(`cloud-confirm-dialog`).addEventListener(`close`,()=>{$(`cloud-confirm-dialog`).open||mt(!1)}),document.querySelectorAll(`dialog`).forEach(e=>e.addEventListener(`keydown`,e=>{if(e.key!==`Tab`)return;let t=[...e.currentTarget.querySelectorAll(`button:not(:disabled), input:not(:disabled)`)].filter(e=>e.getClientRects().length),n=e.shiftKey&&document.activeElement===t[0]?t.at(-1):!e.shiftKey&&document.activeElement===t.at(-1)?t[0]:null;n&&(e.preventDefault(),n.focus())})),window.addEventListener(`storage`,e=>{(e.key===x||e.key===null)&&dt()});function gt(){return JSON.stringify([u?.id,F,M?.id,D,l.tool])}function _t(e){let t=w;t&&(w=null,e=e&&!g&&t.context===gt(),$(`action-confirm-dialog`).open&&$(`action-confirm-dialog`).close(),t.resolve(e))}function vt({title:e,message:t,confirmLabel:n,kind:r=`warning`,icon:i=`triangle-alert`}){if(g||!u||w||document.querySelector(`dialog[open]`))return Promise.resolve(!1);$(`action-confirm-title`).textContent=e,$(`action-confirm-description`).textContent=t,$(`action-confirm-dialog`).dataset.kind=r;let a=document.createElement(`i`);return a.dataset.lucide=i,a.setAttribute(`aria-hidden`,`true`),$(`action-confirm-icon`).replaceChildren(a),$(`accept-action-confirm`).className=`button `+(r===`danger`?`danger`:`primary`),$(`accept-action-confirm`).querySelector(`span`).textContent=n,lt(),new Promise(e=>{w={resolve:e,context:gt()},$(`action-confirm-dialog`).showModal()})}$(`accept-action-confirm`).addEventListener(`click`,()=>_t(!0));for(let e of[`cancel-action-confirm`,`close-action-confirm`])$(e).addEventListener(`click`,()=>_t(!1));$(`action-confirm-dialog`).addEventListener(`cancel`,e=>{e.preventDefault(),_t(!1)}),$(`action-confirm-dialog`).addEventListener(`close`,()=>{$(`action-confirm-dialog`).open||_t(!1)});function yt(e,t=!1){y?.();let r=$(`auth-view`);if(e===`auth-view`&&r.hidden&&b(),t&&!v.matches){let e=document.activeElement;y=aT(r,e instanceof HTMLElement&&r.contains(e)?e:null,()=>{y=void 0})}e!==`account-view`&&(mt(!1),_t(!1));for(let t of[`loading-view`,`unavailable-view`,`auth-view`,`account-view`])$(t).hidden=t!==e&&(t!==`auth-view`||!y);n.visible=e===`auth-view`,hn()}v.addEventListener(`change`,()=>{v.matches&&y?.()});function bt(e){g=e,i.busy=e,document.querySelectorAll(`button, form input, form select`).forEach(t=>{t.closest(`#find-results-view, #ai-plan-details, #auth-view, #workspace-home-sidebar, .workspace-tool-tab-list, .media-detect, #workspace-phases, #media-list, #plan-list, #task-list, #join-clips, #workflow-steps, #subtitle-segments, #translation-segments, #cloud-providers`)||(t.disabled=e||t.hasAttribute(`data-unavailable`))}),l.update({busy:e}),de.update({busy:e}),document.body.setAttribute(`aria-busy`,String(e)),Ht()}function xt(e,t){e.title=t?`隐藏密码`:`显示密码`,e.setAttribute(`aria-label`,e.title);let n=document.createElement(`i`);n.dataset.lucide=t?`eye-off`:`eye`,n.setAttribute(`aria-hidden`,`true`),e.replaceChildren(n)}function St(){document.querySelectorAll(`#account-view :is(input[autocomplete="current-password"], input[autocomplete="new-password"])`).forEach(e=>{e.value=``,e.type=`password`}),document.querySelectorAll(`#account-view .password-toggle`).forEach(e=>{xt(e,!1)});for(let e of Object.values(At))for(let t of e)Nt($(t),``),delete $(t).dataset.touched;lt()}function Ct(e=``){E.clear(),delete $(`asr-model`).dataset.catalog,mt(!1),_t(!1),u=null,dt(!0),Kt(),d&&={...d,aiPlans:!1,asr:!1,asrProviders:[],semanticSearch:!1,clipRecommendations:!1,subtitleCorrection:!1,subtitleTranslation:!1},Zt(),$(`delete-dialog`).close(),St(),yt(`auth-view`),H(`auth-notice`,e),H(`account-notice`,``)}function wt(e,t=!1){let n=u?.id!==e.id;n&&u&&Zt(),u=e,i.userName=e.displayName||e.username,(n||t)&&dt(t),$(`account-greeting`).textContent=`你好，${e.displayName}`,$(`profile-username`).textContent=e.username,$(`profile-email`).textContent=e.email,$(`profile-email-status`).textContent=e.emailVerified?`已验证`:`未验证`,$(`profile-created`).textContent=new Intl.DateTimeFormat(`zh-CN`,{year:`numeric`,month:`long`,day:`numeric`,timeZone:`Asia/Shanghai`}).format(new Date(e.createdAt)),$(`profile-name`).value=String(e.displayName),St(),yt(`account-view`,t),t&&window.scrollTo({top:0,behavior:`instant`}),H(`auth-notice`,``),n&&(r.setLimits(d),Kt(),zt(`workbench`),qt(),ln())}async function Tt(){if(e)return;let n=t;try{await ot();let e=await V(`/api/users/me`);if(n!==t)return;wt(e,!$(`auth-view`).hidden&&!$(`auth-view`).inert)}catch(e){if(n!==t)return;Mx(e).status===401?Ct():yt(`unavailable-view`)}}async function Et(e,t,n=null){H(e,``),bt(!0);let r=null;try{await t(),n&&(r=$(n))}catch(t){let n=Mx(t);if(n.code===`UNAUTHENTICATED`)Ct(),H(`auth-notice`,n.message,!0),await ot().catch(()=>{});else{let t=It(e,n);H(e,t.length?Ft(t):n.message,!0),r=t[0]?.input}}finally{bt(!1),r?.focus()}}let{newPasswordIssue:Dt,existingPasswordIssue:Ot}=Jw;function kt(e,t){let n=Dt(e);if(n)throw Error(n);if(e!==t)throw Error(`两次输入的密码不一致。`)}let At={"password-error":[`current-password`,`new-password`,`confirm-new-password`]},jt={"current-password":e=>Ot(e.value,`当前密码`),"new-password":e=>Dt(e.value)||(e.value===$(`current-password`).value?at.PASSWORD_UNCHANGED:``),"confirm-new-password":e=>e.value?e.value===$(`new-password`).value?``:`两次输入的密码不一致。`:`请再次输入新密码。`};function Nt(e,t){let n=$(`${e.id}-error`);n.textContent=t,n.hidden=!t,t?e.setAttribute(`aria-invalid`,`true`):(e.removeAttribute(`aria-invalid`),delete e.dataset.serverError)}function Pt(e,t=At[e]){let n=[];for(let e of t){let t=$(e),r=jt[e](t);Nt(t,r),r&&n.push({input:t,message:r})}return H(e,Ft(n),!0),n[0]?.input.focus(),!n.length}function Ft(e){return e.length>1?`有${e.length}项需要修改，请查看标红输入框下方的提示。`:e[0]?.message||``}function It(e,t){let n=At[e];if(!n)return[];let r=[`INVALID_PARAMETERS`,`INVALID_REQUEST`].includes(t.code??``)&&t.details||[],i=t.code===`WEAK_PASSWORD`?`newPassword`:t.code===`CURRENT_PASSWORD_INVALID`?`currentPassword`:t.code===`PASSWORD_UNCHANGED`?`newPassword`:null;i&&(r=[{field:i,message:t.message}]);let a=[];for(let e of n){let t=$(e),n=r.find(e=>e.field===t.name);n&&(Nt(t,n.message),t.dataset.serverError=`true`,a.push({input:t,message:n.message}))}return a}for(let[e,t]of Object.entries(At))for(let n of t){let t=$(n),r=t.closest(`.field`),i=document.createElement(`span`);t.setAttribute(`aria-label`,r.firstChild?.textContent?.trim()||``),i.id=`${n}-error`,i.className=`field-error`,i.hidden=!0,r.append(i),t.setAttribute(`aria-describedby`,[t.getAttribute(`aria-describedby`),i.id].filter(Boolean).join(` `));let a=()=>Nt(t,jt[n](t));t.addEventListener(`blur`,e=>{t.dataset.touched=`true`,e.relatedTarget instanceof Element&&e.relatedTarget.closest(`button`)&&t.form?.contains(e.relatedTarget)||t.dataset.serverError||a()}),t.addEventListener(`input`,()=>{H(e,``),delete t.dataset.serverError,(t.dataset.touched||t.hasAttribute(`aria-invalid`))&&a();let r=n===`new-password`?$(`confirm-new-password`):null;(r?.dataset.touched||r?.hasAttribute(`aria-invalid`))&&Nt(r,jt[r.id](r))})}document.querySelectorAll(`#account-view .password-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=$(e.dataset.passwordTarget||``),n=t.type===`password`;t.type=n?`text`:`password`,xt(e,n),lt()})});async function Lt(e){await V(e?`/api/auth/logout-all`:`/api/auth/logout`,{method:`POST`}),Ct(e?`已退出所有设备。`:``),await ot(),it?.postMessage(`account-changed`)}$(`logout-all`).addEventListener(`click`,()=>Et(`account-notice`,()=>Lt(!0))),$(`profile-form`).addEventListener(`submit`,e=>{e.preventDefault();let t=$(`profile-name`).value.trim();Et(`profile-error`,async()=>{if(!t||Array.from(t).length>50)throw Error(`昵称需要1–50个字符。`);wt(await V(`/api/users/me`,{method:`PATCH`,body:{displayName:t}})),H(`account-notice`,`昵称已更新。`)})}),$(`password-form`).addEventListener(`submit`,e=>{if(e.preventDefault(),g||!Pt(`password-error`))return;let t={currentPassword:$(`current-password`).value,newPassword:$(`new-password`).value},n=$(`confirm-new-password`).value;Et(`password-error`,async()=>{kt(t.newPassword,n),await V(`/api/users/me/password`,{method:`PUT`,body:t}),Ct(`密码已修改，请重新登录。`),await ot(),it?.postMessage(`account-changed`)})});function Rt(){$(`delete-dialog`).close(),St()}$(`open-delete-dialog`).addEventListener(`click`,()=>{$(`delete-form`).reset(),H(`delete-error`,``),$(`delete-dialog`).showModal()}),$(`close-delete-dialog`).addEventListener(`click`,Rt),$(`cancel-delete`).addEventListener(`click`,Rt),$(`delete-dialog`).addEventListener(`cancel`,()=>{St()}),$(`delete-form`).addEventListener(`submit`,e=>{if(e.preventDefault(),!u)return;let t=u.username,n={currentPassword:$(`delete-password`).value,confirmUsername:$(`delete-username`).value};Et(`delete-error`,async()=>{if(n.confirmUsername.toLowerCase()!==t.toLowerCase())throw Error(`确认用户名与当前账号不一致。`);await V(`/api/users/me`,{method:`DELETE`,body:n}),Ct(`账号已注销。`),await ot(),it?.postMessage(`account-changed`)})}),$(`retry-connection`).addEventListener(`click`,()=>kr()),$(`back-workbench`).addEventListener(`click`,()=>zt(`workbench`));function zt(e){D=e,Gt(),e===`account`&&u&&p!==u.id&&Xt(),$(`workbench-panel`).hidden=e!==`workbench`,$(`account-panel`).hidden=e!==`account`,Vt(),hn(),e!==`workbench`&&document.querySelectorAll(`#workbench-panel video, #workbench-panel audio`).forEach(e=>e.pause())}function Bt(e){A=e;for(let t of[`profile`,`security`,`cloud`]){let n=t===e;$(`${t}-section`).hidden=!n,$(`account-${t}-tab`).setAttribute(`aria-selected`,String(n)),$(`account-${t}-tab`).tabIndex=n?0:-1}$(`account-danger-section`).hidden=e!==`security`,Vt()}function Vt(){i.section=D===`workbench`?O:A===`profile`?`profile`:`settings`}for(let e of[`profile`,`security`,`cloud`])$(`account-${e}-tab`).addEventListener(`click`,()=>Bt(e));document.querySelector(`.account-nav`).addEventListener(`keydown`,e=>{let t=[`profile`,`security`,`cloud`],n=t.findIndex(e=>$(`account-${e}-tab`)===document.activeElement);if(n<0||![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;e.preventDefault();let r=e.key===`Home`?0:e.key===`End`?2:(n+(e.key===`ArrowRight`?1:2))%3;Bt(t[r]),$(`account-${t[r]}-tab`).focus()});function Ht(){let e=$(`export-combine`).checked&&ve!==`extract_audio`,t=ve===`trim`||e&&$(`export-trim`).checked,n=ve===`compress`||e&&$(`export-compress`).checked;$(`media-prev`).disabled=g||j<=1,$(`media-next`).disabled=g||j*10>=ee,M?.status===`READY`&&ye!==M.id&&(ye=M.id,$(`compression-target`).value=String((M.sizeBytes*.7/1024/1024).toFixed(3)));let r=Math.floor(Number($(`compression-target`).value)*1024*1024);if(M?.status===`READY`&&be!==M.id){be=M.id,$(`trim-start`).value=`0`,$(`trim-end`).value=String((M.metadata?.durationMs??0)/1e3);for(let e of[`trim-start`,`trim-end`])$(e).max=String((M?.metadata?.durationMs??0)/1e3)}for(let e of[`trim-start`,`trim-end`])$(e).disabled=g||!t,$(e).required=t;let i=t&&!Dn().valid;$(`trim-range-error`).hidden=!t||M?.status!==`READY`||!i,$(`compression-target`).disabled=g||!n,$(`compression-target`).required=n,$(`compression-target-field`).hidden=!n,$(`trim-fields`).hidden=!t;let a=n&&(!Number.isSafeInteger(r)||r<32768||r>=(M?.sizeBytes||0));$(`start-conversion`).disabled=g||M?.status!==`READY`||a||i||ve===`extract_audio`&&!M.metadata?.hasAudio||!d?.supportedOperations?.includes(ve)||pr(N)&&N.mediaId===M?.id,$(`compression-small`).hidden=ve!==`compress`||M?.status!==`READY`||M.sizeBytes>32768,$(`conversion-resolution`).disabled=g||ve===`extract_audio`||ve===`trim`&&!e,$(`resolution-field`).hidden=ve===`extract_audio`||ve===`trim`&&!e,$(`audio-missing`).hidden=ve!==`extract_audio`||M?.status!==`READY`||!!M.metadata?.hasAudio,$(`conversion-source`).textContent=M?.status===`READY`&&M?.originalFilename||`未选择就绪素材`,$(`cancel-task`).disabled=g||!pr(N)||N?.status===`CANCELLING`,$(`delete-output`).disabled=g||!_e,$(`task-prev`).disabled=g||ne<=1,$(`task-next`).disabled=g||ne*10>=re,$(`plan-prev`).disabled=g||ie<=1,$(`plan-next`).disabled=g||ie*10>=ae,bn(n),or(),er(),zn(),Mn(),Jt(),gn(),fn()}let{textVendors:Ut}=Jw;function U(){return Ut[d?.textAi?.provider===`local`?`deepseek`:d?.textAi?.provider||`deepseek`]?.name||`DeepSeek`}function Wt(e){for(let t of[`text`,`speech`]){let n=t===e;$(`cloud-${t}-panel`).hidden=!n,$(`cloud-${t}-tab`).setAttribute(`aria-selected`,String(n)),$(`cloud-${t}-tab`).tabIndex=n?0:-1}}for(let e of[`text`,`speech`])$(`cloud-${e}-tab`).addEventListener(`click`,()=>Wt(e));document.querySelector(`.cloud-categories`).addEventListener(`keydown`,e=>{if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;e.preventDefault();let t=e.key===`Home`?`text`:e.key===`End`?`speech`:$(`cloud-text-panel`).hidden?`text`:`speech`;Wt(t),$(`cloud-${t}-tab`).focus()});function Gt(){Xe.clearSecrets()}function Kt(){h++,f=null,p=null,m=!1,Xe.update({entries:[]}),Wt(`text`),H(`cloud-state`,``),H(`cloud-error`,``)}let W=0;async function qt(){let e=u?.id,t=F;if(!e)return;let i=++W;try{let a=await V(`/api/system/capabilities`);if(u?.id!==e||F!==t||i!==W)return;d=a,r.setLimits(a),n.registrationAllowed=a.registration,Ht(),f?.find(e=>e.provider===`deepseek`)?.mode===`SERVER`&&a.textAi?.source===`SERVER`&&(f=(f??[]).map(e=>e.provider===`deepseek`?{...e,available:a.textAi.available,unavailableReason:a.textAi.unavailableReason}:e),Xe.update({entries:f}))}catch(t){let n=Mx(t);u?.id===e&&n.status===401&&Ct()}}function Jt(){$(`refresh-cloud`).disabled=g||m||!u,Xe.update({disabled:g||m||!u})}async function Yt(e,t,n){let r=u?.id,i=h;await Et(`cloud-error`,async()=>{let a=await V(`/api/users/me/cloud-credentials/`+e,{method:t,body:n});u?.id===r&&h===i&&(f=(f??[]).map(t=>t.provider===e?a:t),Xe.update({entries:f}),Jt(),await qt())})}async function Xt(){let e=u?.id,t=++h;if(e){Gt(),m=!0,Jt(),H(`cloud-error`,``),H(`cloud-state`,`正在读取配置…`);try{let n=await V(`/api/users/me/cloud-credentials`);if(u?.id!==e||h!==t)return;f=n,p=e,Xe.update({entries:f}),lt(),H(`cloud-state`,``),await qt()}catch(n){let r=Mx(n);if(u?.id!==e||h!==t)return;r.status===401?Ct():H(`cloud-error`,r.message,!0)}finally{h===t&&(m=!1,Jt())}}}$(`refresh-cloud`).addEventListener(`click`,Xt);function Zt(){r.reset(),O=`regular`,k.clear(),oe++,se++,ie=1,ae=0,le.clear(),ue.clear(),de.clear(),H(`plan-list-error`,``),Bt(`profile`),l.reset(),yn(),F++,$n(),Ln(),kn(),rr(),xe=null,$(`delete-media-dialog`).close(),Se=null,$(`delete-output-dialog`).close(),clearTimeout(te??void 0),te=null,j=1,ee=0,M=null,nn(),clearTimeout(P??void 0),P=null,N=null,pe=null,_e=null,ne=1,re=0,ye=null,$(`compression-target`).value=``,be=null,$(`trim-start`).value=``,$(`trim-end`).value=``,$(`conversion-result`).hidden=!0,$(`output-preview`).pause(),$(`output-preview`).removeAttribute(`src`),$(`output-preview`).load(),$(`output-preview`).hidden=!0,$(`download-output`).hidden=!0,$(`download-output`).removeAttribute(`href`),$(`delete-output`).hidden=!0,$(`output-empty`).hidden=!0,$(`output-audio`).pause(),$(`output-audio`).removeAttribute(`src`),$(`output-audio`).load(),$(`output-audio`).hidden=!0,dn(`detect`)}function Qt(){yn(),Ln(),kn(),$n(),rr(),clearTimeout(te??void 0),te=null,M=null,r.setItem(null),nn(),ye=null,$(`compression-target`).value=``,be=null,$(`trim-start`).value=``,$(`trim-end`).value=``,Ht()}function $t(){N=null,_e=null,$(`conversion-result`).hidden=!0;for(let e of[`output-preview`,`output-audio`])$(e).pause(),$(e).removeAttribute(`src`),$(e).load(),$(e).hidden=!0;$(`download-output`).hidden=!0,$(`download-output`).removeAttribute(`href`),$(`delete-output`).hidden=!0,$(`output-empty`).hidden=!0,Ht()}function en(e){F++,M?.id===e&&Qt(),N?.mediaId===e&&$t(),pe?.mediaId===e&&(pe=null)}function tn(e){return{PROBING:`检测中`,READY:`已就绪`,FAILED:`检测失败`}[e]||e}function nn(){H(`media-error`,``);let e=$(`source-preview`);e.pause(),e.removeAttribute(`src`),e.load(),e.hidden=!0,$(`retry-source-preview`).hidden=!0,H(`source-preview-status`,``)}function rn(e){let t=e.status===`READY`?e.previewUrl:null;$(`source-preview`).getAttribute(`src`)!==t&&(nn(),t&&($(`source-preview`).src=t,$(`source-preview`).hidden=!1)),t||H(`source-preview-status`,e.status===`READY`?`当前格式不支持直接预览。`:``)}function an(){i.tool===`detect`?$(`source-preview`).hasAttribute(`src`)&&nn():M&&rn(M)}function on(){return r.state.pending===`upload`||r.state.pending===`retry`}$(`source-preview`).addEventListener(`error`,()=>{M?.previewUrl&&$(`source-preview`).error&&(H(`source-preview-status`,`原视频暂时无法播放。`,!0),$(`retry-source-preview`).hidden=!1)}),$(`source-preview`).addEventListener(`loadeddata`,()=>{H(`source-preview-status`,``),$(`retry-source-preview`).hidden=!0}),$(`retry-source-preview`).addEventListener(`click`,()=>{M?.previewUrl&&(H(`source-preview-status`,``),$(`retry-source-preview`).hidden=!0,$(`source-preview`).load())});async function sn(e){return g?!1:!M||M.id===e||!(R||B||Me||he||Ue||ze)||vt({title:`切换素材`,message:`当前素材有未保存的修改。切换后，这些修改将被放弃，已保存的方案、字幕和原素材不受影响。`,confirmLabel:`放弃并切换`,icon:`file-video`})}function cn(e){if(M&&M.id!==e.id&&yn(),clearTimeout(te??void 0),te=null,M?.id!==e.id&&rr(),M?.id!==e.id&&$n(),M?.id!==e.id&&Ln(),M?.id!==e.id&&kn(),M=e,r.setItem(e),an(),H(`media-error`,e.error?.message||``,!0),Ht(),!$(`subtitle-section`).hidden&&e.status===`READY`&&Ce!==e.id&&sr(),!$(`ai-section`).hidden&&e.status===`READY`&&Ie!==e.id&&nr(),!$(`find-section`).hidden&&e.status===`READY`&&Qe!==e.id&&Bn(),!$(`join-section`).hidden&&e.status===`READY`&&ke!==e.id&&Fn(),e.status===`PROBING`){let t=u?.id,n=F;te=setTimeout(async()=>{if(te=null,t&&u?.id===t&&M?.id===e.id)try{let r=await V(`/api/media/${e.id}`);if(u?.id!==t||M?.id!==e.id||F!==n)return;cn(r),r.status!==`PROBING`&&await ln()}catch(i){let a=Mx(i);if(u?.id!==t||F!==n||M?.id!==e.id)return;a.status===401?Ct():a.status===404&&M?.id===e.id?(en(e.id),await ln(),await Dr()):(r.reportError(a.message),H(`media-error`,a.message,!0))}},2e3)}}async function ln(){let e=u?.id,t=F,n=j;if(e)try{let r=await V(`/api/media?page=${n}&pageSize=10`);if(u?.id!==e||F!==t||j!==n)return;if(n>1&&!r.items.length)return j=Math.max(1,Math.ceil(r.total/10)),ln();H(`media-list-error`,``),ee=r.total,$(`media-list-empty`).hidden=r.items.length>0,$(`media-total`).textContent=`${r.total} 个素材`,$(`media-page`).textContent=String(j),de.update({media:r.items});let i=r.items.find(e=>e.id===M?.id);if(i)cn(i);else if(!M&&r.items.length)cn(r.items[0]);else if(M){let r=M.id;try{let i=await V(`/api/media/${r}`);if(u?.id!==e||F!==t||M?.id!==r||j!==n)return;cn(i)}catch(n){let i=Mx(n);if(u?.id!==e||F!==t)return;if(i.status!==404)throw i;en(r),await Dr()}}Ht(),lt()}catch(r){let i=Mx(r);if(u?.id!==e||F!==t||j!==n)return;i.status===401?Ct():H(`media-list-error`,i.message,!0)}}$(`refresh-media`).addEventListener(`click`,()=>ln());function un(){$(`delete-media-dialog`).close(),xe=null}$(`close-delete-media`).addEventListener(`click`,un),$(`cancel-delete-media`).addEventListener(`click`,un),$(`delete-media-dialog`).addEventListener(`cancel`,e=>{g?e.preventDefault():xe=null}),$(`delete-media-form`).addEventListener(`submit`,e=>{if(e.preventDefault(),g||!xe)return;let t=xe;Et(`delete-media-error`,async()=>{await V(`/api/media/${t.id}`,{method:`DELETE`}),u?.id===t.owner&&(en(t.id),un(),await ln(),await Dr(),H(`account-notice`,`素材及关联记录已删除，文件将在后台清理。`),$(`refresh-media`).focus())})}),$(`media-prev`).addEventListener(`click`,()=>{j>1&&(j--,ln())}),$(`media-next`).addEventListener(`click`,()=>{j*10<ee&&(j++,ln())});function dn(e){if(!bl(e)||!l.selectTool(e))return;i.tool=e;let t=$(e===`detect`?`detect-library-slot`:`import-library-slot`);a.parentElement!==t&&t.append(a),O=yl[e],document.getElementById(`workspace-subnav-${O}`)?.append($(`workspace-toolbar`)),k.set(O,e),e===`detect`&&pn(`import`,!1),an(),Vt();let n=[`convert`,`compress`,`audio`,`trim`,`mute`].includes(e);ve=e===`mute`?`mute`:e===`trim`?`trim`:e===`audio`?`extract_audio`:e===`compress`?`compress`:`transcode`,$(`history-panel`).hidden=e!==`history`,$(`workspace-toolbar`).hidden=e===`history`||e===`detect`,$(`tool-dependencies`).hidden=e===`history`||e===`detect`,$(`conversion-section`).hidden=!n,$(`task-section`).hidden=!1,$(`ai-section`).hidden=e!==`ai`,$(`find-section`).hidden=e!==`find`,e!==`find`&&$(`find-preview`).pause(),$(`join-section`).hidden=e!==`join`,e!==`join`&&$(`join-preview`).pause(),e===`join`&&M?.status===`READY`&&ke!==M.id&&Fn(),e===`find`&&M?.status===`READY`&&Bn(),e===`ai`&&M?.status===`READY`&&Ie!==M.id&&nr(),$(`subtitle-section`).hidden=e!==`subtitle`,e===`subtitle`&&M?.status===`READY`&&Ce!==M.id&&sr(),$(`compression-target-field`).hidden=ve!==`compress`,$(`compression-target`).required=ve===`compress`,$(`compression-target`).disabled=ve!==`compress`,$(`conversion-title`).textContent=`输出设置`,$(`start-processing-label`).textContent=e===`mute`?`开始静音`:e===`trim`?`开始裁切`:e===`audio`?`开始提取`:e===`compress`?`开始压缩`:`开始转换`,$(`resolution-field`).hidden=e===`audio`||e===`trim`,$(`trim-fields`).hidden=e!==`trim`,$(`processing-fields`).classList.toggle(`audio`,e===`audio`),$(`processing-fields`).classList.toggle(`trim`,e===`trim`),$(`processing-format`).textContent=e===`audio`?`MP3 · 192 kbps`:`MP4 · H.264`,$(`processing-audio-mode`).textContent=e===`mute`?`移除音轨`:e===`audio`?`第一条音轨`:`保留音轨`,H(`conversion-error`,``),Ht(),e===`history`&&($(`history-plans-panel`).hidden?Dr():Tr())}function fn(){let e=M?.status===`READY`;$(`continue-editing`).disabled=g||!e,$(`workspace-file-state`).textContent=M?M?.originalFilename||`未选择就绪素材`:`未选择素材`,$(`workspace-file-state`).title=M?.originalFilename||``,$(`editor-filename`).textContent=M?.originalFilename||`未选择素材`;let t=M?.metadata;$(`editor-file-info`).textContent=t?`${(t.durationMs/1e3).toFixed(2)} 秒 · ${t.width} × ${t.height} · ${Sl(M?.sizeBytes||0)}`:M?tn(M.status):`等待导入`,$(`editor-preview-empty`).hidden=!!$(`source-preview`).getAttribute(`src`),$(`editor-metadata`).replaceChildren(...(M?Ol(M.metadata,M.sizeBytes):[]).map(([e,t])=>{let n=document.createElement(`div`),r=document.createElement(`dt`);r.textContent=e;let i=document.createElement(`dd`);return i.textContent=t,n.append(r,i),n}));let n=!!N&&N.kind!==`TRANSCRIPTION`&&!$(`conversion-result`).hidden;$(`export-result-empty`).hidden=n;let r=l.tool===`subtitle`&&!!I&&!R&&!$(`download-srt`).hidden;$(`export-srt`).hidden=!r,r?($(`export-srt`).setAttribute(`href`,$(`download-srt`).getAttribute(`href`)||``),$(`export-srt`).setAttribute(`download`,`subtitles.srt`)):$(`export-srt`).removeAttribute(`href`),$(`export-empty-title`).textContent=r?`字幕已就绪`:`暂无导出结果`,$(`export-result-summary`).textContent=r?`字幕 v${I?.version} · SRT`:N?.kind===`TRANSCRIPTION`?`字幕识别结果保存在编辑区`:`尚未生成文件`}function pn(e,t=!0){l.selectPhase(e,t)&&(fn(),t&&$(`workbench-panel`).closest(`.workspace-tool-panel-body`)?.scrollTo({top:0}))}function mn(e){_r(e),pn(e.kind===`TRANSCRIPTION`?`edit`:`export`)}function hn(){l.update({visible:!!u&&D===`workbench`&&!$(`account-view`).hidden,busy:g})}function gn(){let e=d||{},t=l.tool===`subtitle`,n=[`ai`,`find`].includes(l.tool),r=$(`asr-provider`).value,i=e.asrProviders||[],a=e.textAi?.source===`SERVER`;$(`ai-model-warning`).hidden=!a||Ve;let o=a?`服务端部署 · 千问 `+(e.textAi?.model||`Qwen3.5-4B`):U()+` · 文本对话 API`,s=e.textAi?.available===!0?`处理工具暂不可用`:a?at.LOCAL_AI_UNAVAILABLE:e.textAi?.unavailableReason||`未配置`,u=JSON.stringify([l.tool,Ve,r,$(`asr-model`).value,e.mediaTool,e.supportedOperations,e.aiPlans,e.semanticSearch,e.clipRecommendations,e.subtitleCorrection,e.subtitleTranslation,i,e.textAi]);if(T===u)return;T=u;let f=l.tool===`ai`&&Ve?`local`:t?`mixed`:n?a?`local`:`cloud`:`local`;$(`dependency-kind`).dataset.kind=f,$(`dependency-kind`).textContent={local:a&&n&&!(l.tool===`ai`&&Ve)?`服务端部署`:`服务端处理`,cloud:`云端 API`,mixed:`站点 + API`}[f];let p=n&&!(l.tool===`ai`&&Ve);$(`dependency-summary`).textContent=p?e.textAi?.available===!1?s:o:t?`语音识别 API / 文字模型`:`站点处理 · 无第三方 AI 调用`,$(`dependency-summary`).classList.toggle(`unavailable`,!!(p&&e.textAi?.available===!1)),$(`dependency-title`).textContent=c[l.tool],$(`dependency-settings`).hidden=f===`local`&&!(n&&!(l.tool===`ai`&&Ve));let m=[],h;if(t){let t=ir().find(e=>e.provider===r&&e.id===$(`asr-model`).value);m.push([`语音转字幕`,(r===`aliyun`?`阿里云百炼 · `:`腾讯云 · `)+(t?.name||`语音识别 API`),i.includes(r)?`已配置`:`未配置或工具未就绪`,i.includes(r)]),m.push([`文字校对`,o,e.subtitleCorrection?a?`已就绪`:`已配置`:s,!!e.subtitleCorrection]),m.push([`字幕翻译 / 双语字幕`,o,e.subtitleTranslation?a?`已就绪`:`已配置`:s,!!e.subtitleTranslation]),m.push([`编辑 / SRT`,`本站后端 · 无第三方 API`,`站点处理`,!0]),m.push([`已有字幕烧录`,`服务端 FFmpeg / libass`,e.supportedOperations?.includes(`burn_subtitles`)?`工具已就绪`:`工具未就绪`,!!e.supportedOperations?.includes(`burn_subtitles`)]),h=a?`语音识别向选定供应商发送音轨；文字校对使用站点服务端部署的千问，不需要用户自行部署模型。`:`识别向选定供应商发送音轨，校对只发送选中句子的文字；第三方调用可能计费。`}else if(n)l.tool===`ai`?(Ve?m.push([`分步填写`,`本站后端 · 无第三方 API`,e.supportedOperations?.includes(`workflow`)?`工具已就绪`:`工具未就绪`,!!e.supportedOperations?.includes(`workflow`)]):m.push([`指令理解`,o,e.aiPlans?a?`已就绪`:`已配置`:s,!!e.aiPlans]),m.push([`确认后执行`,`服务端 FFmpeg · 无第三方 API`,`站点处理`,!0]),h=Ve?`参数由站点服务端处理，不调用第三方 AI。`:a?`使用站点服务端部署的千问，仅向模型提供文字和素材参数，不向第三方模型服务上传视频。确认方案后才执行。`:`仅发送处理要求和素材参数，不上传原视频。第三方生成方案可能计费，确认后才由站点执行。`):(m.push([`内容检索`,o,e.semanticSearch?a?`已就绪`:`已配置`:s,!!e.semanticSearch]),m.push([`片段建议`,o,e.clipRecommendations?a?`已就绪`:`已配置`:s,!!e.clipRecommendations]),h=a?`站点服务端部署的千问分析已保存字幕，不向第三方模型服务发送字幕或原视频。`:`向 ${U()} 发送已保存字幕及查找要求，不发送原视频；第三方调用可能计费。`);else{let t={convert:`transcode`,compress:`compress`,audio:`extract_audio`,trim:`trim`,join:`join_clips`,mute:`mute`}[l.tool],n=l.tool===`detect`?e.mediaTool:e.supportedOperations?.includes(t||``);m.push([`处理引擎`,l.tool===`detect`?`服务端 ffprobe`:`服务端 FFmpeg / ffprobe`,n?`工具已就绪`:`工具未就绪`,!!n]),m.push([`第三方 API`,`不需要 API Key`,`无需云端 AI`,!0]),h=`素材由站点服务端保存和处理，不需要用户安装处理工具，不调用第三方 AI。`}$(`dependency-services`).replaceChildren(...m.map(([e,t,n,r])=>{let i=document.createElement(`div`),a=document.createElement(`dt`),o=document.createElement(`dd`),s=document.createElement(`span`),c=document.createElement(`span`);return a.textContent=e,s.textContent=t,c.textContent=n,c.className=`dependency-state`,c.dataset.ready=String(r),o.append(s,c),i.append(a,o),i})),$(`dependency-detail`).textContent=h}$(`asr-provider`).addEventListener(`change`,()=>{or(),gn()}),$(`asr-model`).addEventListener(`change`,()=>{E.set($(`asr-provider`).value,$(`asr-model`).value),or(),gn()}),$(`dependency-settings`).addEventListener(`click`,()=>{zt(`account`),Bt(`cloud`),Wt(l.tool===`subtitle`?`speech`:`text`),$(`cloud-section`).scrollIntoView({block:`start`,behavior:v.matches?`instant`:`smooth`}),$(`refresh-cloud`).focus({preventScroll:!0})});let vn={mp4:[`h264`,`hevc`,`av1`],mov:[`h264`,`hevc`],mkv:[`h264`,`hevc`,`vp9`,`av1`],webm:[`vp9`,`av1`]};function yn(){ge++,me=null,he=!1,$(`export-format`).value=`mp4`,$(`export-codec`).value=`h264`,$(`export-audio-format`).value=`mp3`,$(`conversion-resolution`).value=`source`;for(let e of[`export-combine`,`export-trim`,`export-compress`,`export-mute`,`export-extract`])$(e).checked=!1;H(`export-plan-state`,``)}function bn(e){let t=ve===`extract_audio`,n=$(`export-combine`).checked&&!t,r=d?.supportedOperations?.includes(`export`);$(`export-format-field`).hidden=t,$(`export-codec-field`).hidden=t,$(`export-audio-format-field`).hidden=!t,$(`export-combine-field`).hidden=t,$(`export-combination`).hidden=!n,$(`export-custom-fields`).hidden=t||ve===`trim`&&!n||$(`conversion-resolution`).value!==`custom`;for(let e of[`export-format`,`export-audio-format`]){for(let t of $(e).options)t.disabled=!d?.exportFormats?.some(e=>e===t.value);$(e).disabled=g||!r}let i=(vn[$(`export-format`).value]||[]).filter(t=>d?.exportVideoCodecs?.some(e=>e===t)&&(!e||[`h264`,`vp9`].includes(t)));for(let e of $(`export-codec`).options)e.disabled=!i.includes(e.value);r&&!i.includes($(`export-codec`).value)&&($(`export-codec`).value=String(i[0]||``)),$(`export-codec`).disabled=g||!r;for(let e of[`export-combine`,`export-trim`,`export-compress`,`export-mute`,`export-extract`,`export-width`,`export-height`])$(e).disabled=g||!r;$(`export-extract`).disabled||=!M?.metadata?.hasAudio;let a=!r||!u||M?.status!==`READY`;if($(`save-export-plan`).disabled=g||a,$(`restore-export-plan`).disabled=g||a,(n||$(`export-format`).value!==`mp4`||$(`export-codec`).value!==`h264`)&&($(`start-processing-label`).textContent=`导出`),r){let e=t?$(`export-audio-format`).value:$(`export-format`).value;$(`processing-format`).textContent=e.toUpperCase()+(t?``:` · `+$(`export-codec`).selectedOptions[0]?.textContent)}$(`processing-audio-mode`).textContent=t?`第一条音轨`:ve===`mute`||n&&$(`export-mute`).checked?`移除音轨`:`保留音轨`}function xn(){let e=ve===`extract_audio`,t=$(`export-combine`).checked&&!e,n=ve===`trim`||t&&$(`export-trim`).checked,r=ve===`compress`||t&&$(`export-compress`).checked,i=Dn();if(n&&!i.valid)throw Error(`区间需至少0.5秒，且不超过素材时长。`);let a=e?null:ve===`trim`&&!t?`source`:$(`conversion-resolution`).value,o={operation:`export`,outputFormat:e?$(`export-audio-format`).value:$(`export-format`).value,videoCodec:e?null:$(`export-codec`).value,resolutionPreset:a,width:a===`custom`?Number($(`export-width`).value):null,height:a===`custom`?Number($(`export-height`).value):null,audioMode:!e&&(ve===`mute`||t&&$(`export-mute`).checked)?`mute`:`keep`,startMs:n?i.startMs:null,endMs:n?i.endMs:null,targetSizeBytes:r?Math.floor(Number($(`compression-target`).value)*1024*1024):null,extractAudio:t&&$(`export-extract`).checked};if(o.targetSizeBytes!=null&&(!Number.isSafeInteger(o.targetSizeBytes)||o.targetSizeBytes<32768||o.targetSizeBytes>=(M?.sizeBytes||0)))throw Error(`目标体积需至少32 KB，并小于原文件。`);if(a===`custom`&&(o.width==null||o.height==null||![o.width,o.height].every(e=>Number.isInteger(e)&&e>=2&&e<=4096)||o.width*o.height>8847360))throw Error(`自定义尺寸需为2至4096的整数，总像素不超过8847360。`);return o}function Sn(){return $(`export-combine`).checked||(ve===`extract_audio`?$(`export-audio-format`).value!==`mp3`:$(`export-format`).value!==`mp4`||$(`export-codec`).value!==`h264`||![`source`,`720p`].includes($(`conversion-resolution`).value))}function Cn(e,t){return Object.keys(t).every(n=>e?.[n]===t[n])}async function wn(e){let t=u?.id,n=M?.id,r=ge,i=F;if(!t||!n)throw Error(`请先选择就绪素材。`);let a=me?.mediaId===n&&me.status===`READY`?me:null,o=await V(a?`/api/operation-plans/${a.id}`:`/api/operation-plans`,{method:a?`PATCH`:`POST`,body:a?{expectedVersion:a.version,parameters:e}:{mediaId:n,parameters:e}});return u?.id!==t||M?.id!==n||ge!==r||F!==i?null:(me=o,he=!1,H(`export-plan-state`,`已保存 · v${o.version}`),o)}$(`save-export-plan`).addEventListener(`click`,()=>Et(`conversion-error`,async()=>{await wn(xn())})),$(`restore-export-plan`).addEventListener(`click`,async()=>{g||he&&!await vt({title:`恢复导出方案`,message:`当前未保存的导出设置将被替换为最近保存的方案。原素材和已生成的文件保持不变。`,confirmLabel:`恢复方案`,icon:`rotate-ccw`})||g||Et(`conversion-error`,async()=>{let e=u?.id,t=M?.id,n=ge,r=F,i,a=1;do{let o=await V(`/api/operation-plans?mediaId=${t}&page=${a}&pageSize=50`);if(u?.id!==e||M?.id!==t||ge!==n||F!==r)return;if(i=o.items.find(e=>e.parameters?.operation===`export`),i||a*50>=o.total)break;a++}while(a<=20);i?Tn(i):H(`export-plan-state`,`暂无已保存的导出方案`)})});function Tn(e){let t=e.parameters;t&&(me=e,he=!1,dn(br(t)),t.videoCodec?($(`export-format`).value=String(t.outputFormat),$(`export-codec`).value=String(t.videoCodec)):$(`export-audio-format`).value=String(t.outputFormat),$(`conversion-resolution`).value=String(t.resolutionPreset||`source`),t.width&&($(`export-width`).value=String(t.width)),t.height&&($(`export-height`).value=String(t.height)),$(`export-combine`).checked=!!t.videoCodec,$(`export-trim`).checked=t.startMs!=null,$(`export-compress`).checked=t.targetSizeBytes!=null,$(`export-mute`).checked=t.audioMode===`mute`,$(`export-extract`).checked=!!t.extractAudio,t.startMs!=null&&($(`trim-start`).value=String(t.startMs/1e3),$(`trim-end`).value=String((t.endMs??t.startMs??0)/1e3)),t.targetSizeBytes!=null&&($(`compression-target`).value=String(Number((t.targetSizeBytes/1024/1024).toFixed(6)))),H(`export-plan-state`,`已恢复 · v${e.version}`),Ht())}for(let e of[`export-format`,`export-codec`,`export-audio-format`,`export-combine`,`export-trim`,`export-compress`,`export-mute`,`export-extract`,`export-width`,`export-height`,`conversion-resolution`,`compression-target`,`trim-start`,`trim-end`])$(e).addEventListener(`input`,()=>{he=!0,ge++,H(`export-plan-state`,`未保存`),Ht()});function En(e){if(g||on())return;dn(e);let t={convert:`transcode`,compress:`compress`,trim:`trim`,audio:`extract_audio`,mute:`mute`}[e],n={convert:`视频转换工具暂不可用。`,compress:`视频压缩工具暂不可用。`,trim:`视频裁切工具暂不可用。`,audio:`MP3编码工具暂不可用。`,mute:`视频静音工具暂不可用。`}[e];t&&!d?.supportedOperations?.includes(t)&&H(`conversion-error`,n||`处理工具暂不可用。`,!0)}$(`compression-target`).addEventListener(`input`,Ht);function Dn(){let e=e=>{let t=Number($(e).value),n=Math.round(t*1e3);return $(e).value!==``&&Number.isSafeInteger(n)&&Math.abs(t-n/1e3)<1e-9?n:NaN},t=e(`trim-start`),n=e(`trim-end`);return{startMs:t,endMs:n,valid:t>=0&&n-t>=500&&n<=(M?.metadata?.durationMs||0)}}for(let e of[`trim-start`,`trim-end`])$(e).addEventListener(`input`,Ht);function On(){Pe=null,$(`join-preview`).pause(),$(`join-preview`).removeAttribute(`src`),$(`join-preview`).onloadedmetadata=null,$(`join-preview`).load(),$(`join-preview`).hidden=!0}function kn(){Ae++,Oe=[],ke=null,je=!1,Me=!1,Ne=null,Je.update({rows:[]}),On(),H(`join-error`,``)}function An(e,t){return{start:String(e/1e3),end:String(t/1e3)}}function jn(){let e=e=>/^\d+(?:\.\d{1,3})?$/.test(e)?Math.round(Number(e)*1e3):NaN,t=Oe.map(t=>({startMs:e(t.start),endMs:e(t.end)})),n=t.reduce((e,t)=>e+t.endMs-t.startMs,0);return{clips:t,total:n,valid:t.length>0&&t.length<=20&&Number.isSafeInteger(n)&&n<=9e5&&t.every(e=>Number.isSafeInteger(e.startMs)&&Number.isSafeInteger(e.endMs)&&e.startMs>=0&&e.endMs-e.startMs>=500&&e.endMs<=(M?.metadata?.durationMs||0))}}function Mn(){let e=M?.status===`READY`,t=jn();$(`join-source`).textContent=e&&M?.originalFilename||`未选择就绪素材`,$(`join-total`).textContent=`${Oe.length} 段 · ${Number.isFinite(t.total)?(t.total/1e3).toFixed(3):`--`} 秒`,$(`join-range-error`).hidden=!e||!Oe.length||t.valid,$(`join-state`).textContent=je?`正在读取方案…`:e?d?.supportedOperations?.includes(`join_clips`)?Me?`未导出`:``:`片段拼接工具暂不可用。`:`未选择就绪素材`,$(`export-join`).disabled=g||je||!e||!t.valid||!d?.supportedOperations?.includes(`join_clips`)||pr(N)&&N.mediaId===M?.id,$(`add-join-clip`).disabled=g||je||!e||Oe.length>=20,$(`refresh-join`).disabled=g||je||!e,Je.update({joinDisabled:g||je,preview:!!M?.previewUrl})}function Nn(){Je.update({rows:Oe}),Mn()}function Pn(e){if(g||!M?.previewUrl)return;let t=jn().clips[e];if(!t||!Number.isSafeInteger(t.startMs)||!Number.isSafeInteger(t.endMs)||t.endMs<=t.startMs)return;Pe={start:t.startMs/1e3,end:t.endMs/1e3};let n=$(`join-preview`);n.hidden=!1;let r=()=>{Pe&&(n.currentTime=Pe.start,n.play().catch(()=>H(`join-error`,`片段暂时无法播放。`,!0)))};n.getAttribute(`src`)===M.previewUrl?n.readyState>=1?r():n.onloadedmetadata=r:(n.onloadedmetadata=r,n.src=M.previewUrl,n.load())}async function Fn(){let e=u?.id,t=M?.id,n=F,r=++Ae;if(e&&t&&M?.status===`READY`){ke=t,je=!0,Ne=null,Me=!1,On(),Oe=[An(0,M?.metadata?.durationMs??0)],Nn();try{let i=await V(`/api/operation-plans?mediaId=${t}&page=1&pageSize=10`);if(u?.id!==e||F!==n||M?.id!==t||Ae!==r)return;let a=i.items.find(e=>e.parameters?.operation===`join_clips`);a&&(Oe=(a.parameters?.clips??[]).map(e=>An(e.startMs,e.endMs)),Ne=a.status===`READY`?a:null),H(`join-error`,``)}catch(t){let i=Mx(t);if(u?.id!==e||F!==n||Ae!==r)return;i.status===401?Ct():H(`join-error`,i.message,!0)}finally{Ae===r&&(je=!1,Nn())}}}$(`join-preview`).addEventListener(`timeupdate`,()=>{Pe&&$(`join-preview`).currentTime>=Pe.end&&$(`join-preview`).pause()}),$(`join-preview`).addEventListener(`play`,()=>{let e=$(`join-preview`);Pe&&(e.currentTime<Pe.start||e.currentTime>=Pe.end)&&(e.currentTime=Pe.start)}),$(`refresh-join`).addEventListener(`click`,async()=>{g||Me&&!await vt({title:`恢复拼接方案`,message:`放弃当前未导出的片段顺序和时间修改，恢复最近保存的拼接方案。原素材保持不变。`,confirmLabel:`恢复方案`,icon:`rotate-ccw`})||Fn()}),$(`add-join-clip`).addEventListener(`click`,()=>{g||je||!M||Oe.length>=20||(Oe.push(An(0,Math.min(5e3,M?.metadata?.durationMs??0))),Me=!0,Nn())}),$(`join-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=jn();if(g||je||!t.valid||M?.status!==`READY`)return;let n=Ae;if(!await vt({title:`导出拼接视频`,message:`按当前顺序拼接 ${t.clips.length} 段，共 ${(t.total/1e3).toFixed(3)} 秒，生成 MP4。原素材保持不变。`,confirmLabel:`开始导出`,kind:`info`,icon:`clapperboard`})||g||Ae!==n)return;let r=u?.id,i=M.id,a=F;Et(`join-error`,async()=>{let e={operation:`join_clips`,outputFormat:`mp4`,clips:t.clips,audioMode:`keep`},n=()=>u?.id===r&&F===a&&M?.id===i,o=Ne?.mediaId===i?Ne:null;if(!o){if(o=await V(`/api/operation-plans`,{method:`POST`,body:{mediaId:i,parameters:e}}),!n())return;Ne=o}else if(JSON.stringify(o.parameters?.clips)!==JSON.stringify(t.clips)){if(o=await V(`/api/operation-plans/${o.id}`,{method:`PATCH`,body:{expectedVersion:o.version,parameters:e}}),!n())return;Ne=o}let s=await V(`/api/operation-plans/${o.id}/execute`,{method:`POST`,body:{expectedVersion:o.version}});n()&&(Ne=null,Me=!1,mn(s),ne=1,await Dr())})});function In(){nt=null,rt=null,o.clear(),H(`find-result-state`,``),$(`find-preview`).pause(),$(`find-preview`).removeAttribute(`src`),$(`find-preview`).load(),$(`find-preview`).onloadedmetadata=null,$(`find-preview-section`).hidden=!0,H(`find-preview-error`,``)}function Ln(){$e++,Qe=null,Ze=null,et=!1,tt=!1,$(`find-query`).value=``,In(),H(`find-error`,``)}function Rn(){return document.querySelector(`input[name="find-mode"]:checked`).value}function zn(){let e=Rn()===`recommend`,t=M?.status===`READY`,n=e?d?.clipRecommendations:d?.semanticSearch,r=Number($(`find-limit`).value),i=Number($(`find-budget`).value);$(`find-source`).textContent=M?.originalFilename||`未选择就绪素材`,$(`find-budget-field`).hidden=!e,$(`find-budget`).required=e,$(`find-budget`).disabled=g||et||!e,$(`find-limit`).disabled=g||et,document.querySelectorAll(`input[name="find-mode"]`).forEach(e=>{e.disabled=g||et}),$(`find-limit`).max=e?`10`:`20`,$(`find-query`).disabled=g||et||!t,$(`refresh-find`).disabled=g||et||!t,$(`find-submit`).disabled=g||et||!t||!Ze||!n||!$(`find-query`).value.trim()||!Number.isInteger(r)||r<1||r>(e?10:20)||e&&(!Number.isInteger(i)||i<1||i>900),$(`find-submit-label`).textContent=tt?`分析中…`:e?`生成建议`:`查找片段`,$(`find-state`).textContent=et?`正在读取字幕…`:tt?`正在分析字幕…`:t?Ze?n?`字幕 v${Ze.version}`:d?.textAi?.source===`SERVER`?at.LOCAL_AI_UNAVAILABLE:d?.textAi?.unavailableReason||`AI 服务尚未配置。`:`当前素材暂无字幕。`:`未选择就绪素材`,o.update({busy:g,previewAvailable:!!M?.previewUrl,canTrim:!!d?.supportedOperations?.includes(`trim`),canJoin:!!d?.supportedOperations?.includes(`join_clips`)})}async function Bn(){let e=u?.id,t=M?.id,n=F;if(!e||!t||M?.status!==`READY`)return;let r=++$e;Qe=t,et=!0,zn();try{let i=await V(`/api/media/${t}/transcript`);if(u?.id!==e||F!==n||M?.id!==t||$e!==r)return;(Ze?.id!==i.id||Ze?.version!==i.version)&&In(),Ze={id:i.id,version:i.version},H(`find-error`,``)}catch(t){let i=Mx(t);if(u?.id!==e||F!==n||$e!==r)return;i.status===401?Ct():i.status===404?(Ze=null,In()):H(`find-error`,i.message,!0)}finally{$e===r&&(et=!1,zn())}}function Vn(e){return`${(e/1e3).toFixed(3)} 秒`}function Hn(e,t){In(),nt=e;let n=(t?e.clips:e.matches)||[];H(`find-result-state`,n.length?`${n.length} 个结果 · 字幕 v${e.transcriptVersion}`:e.message||`未找到相关片段。`),o.update({result:e,recommend:t}),zn()}function Un(e,t){let n=nt,r=u?.id,i=F,a=$e;n&&Et(`find-error`,async()=>{let o=await V(`/api/media/${n.mediaId}/transcript`);if(u?.id!==r||F!==i||a!==$e||M?.id!==n.mediaId)return;if(o.id!==n.transcriptId||o.version!==n.transcriptVersion)throw In(),Ze=o,new st(`TRANSCRIPT_VERSION_CONFLICT`,409);let s;if(t){if(ke!==n.mediaId&&await Fn(),u?.id!==r||F!==i||M?.id!==n.mediaId||a!==$e)return;let t=!Me&&!Ne&&Oe.length===1&&Oe[0].start===`0`&&Number(Oe[0].end)*1e3===(M?.metadata?.durationMs??0);if(!t&&Oe.length>=20)throw Error(`最多添加20个片段。`);t&&(Oe=[]),Oe.push(An(e.startMs,e.endMs)),Me=!0,dn(`join`),Nn(),s=$(`join-section`)}else dn(`trim`),be=M.id,$(`trim-start`).value=String(String(e.startMs/1e3)),$(`trim-end`).value=String(String(e.endMs/1e3)),Ht(),s=$(`conversion-section`);await _n(),s.scrollIntoView({block:`start`})})}function Wn(e){if(!M?.previewUrl||nt?.mediaId!==M.id)return;let t=$(`find-preview`);rt={start:e.startMs/1e3,end:e.endMs/1e3};let n=rt;H(`find-preview-error`,``),$(`find-preview-range`).textContent=`${Vn(e.startMs)} 至 ${Vn(e.endMs)}`,$(`find-preview-section`).hidden=!1;let r=()=>{rt&&(t.currentTime=rt.start,t.play().catch(()=>{rt===n&&H(`find-preview-error`,`片段暂时无法播放，请重试。`,!0)}))};t.getAttribute(`src`)!==M.previewUrl||t.error?(t.onloadedmetadata=r,t.src=M.previewUrl,t.load()):t.readyState>=1?r():t.onloadedmetadata=r}$(`find-preview`).addEventListener(`timeupdate`,()=>{rt&&$(`find-preview`).currentTime>=rt.end&&$(`find-preview`).pause()}),$(`find-preview`).addEventListener(`play`,()=>{let e=$(`find-preview`);rt&&(e.currentTime<rt.start||e.currentTime>=rt.end)&&(e.currentTime=rt.start)}),$(`find-preview`).addEventListener(`error`,()=>{rt&&H(`find-preview-error`,`原视频暂时无法播放。`,!0)}),$(`refresh-find`).addEventListener(`click`,Bn);for(let e of[`find-query`,`find-limit`,`find-budget`])$(e).addEventListener(`input`,()=>{$e++,In(),zn()});document.querySelectorAll(`input[name="find-mode"]`).forEach(e=>e.addEventListener(`change`,()=>{$e++,In(),$(`find-limit`).value=String(Rn()===`recommend`?`3`:`10`),zn()})),$(`find-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),g||!Ze||!M)return;let t=u?.id,n=M.id,r=F,i=$e,a=Ze,o=Rn()===`recommend`;if(d?.textAi?.source!==`SERVER`&&!await ht({provider:U(),content:`目标描述和当前已保存的字幕`})||g||u?.id!==t||M?.id!==n||F!==r||$e!==i||Ze!==a)return;let s=++$e;Et(`find-error`,async()=>{let e=$(`find-query`).value.trim();if(!e||Array.from(e).length>500)throw Error(`目标内容需要1至500个字符。`);tt=!0,In(),zn();try{let i={query:e,transcriptId:a.id,transcriptVersion:a.version,limit:Number($(`find-limit`).value)};o&&(i.maxTotalDurationMs=Number($(`find-budget`).value)*1e3);let c=await V(`/api/media/${n}/${o?`clip-recommendations`:`search`}`,{method:`POST`,body:i});if(u?.id!==t||M?.id!==n||F!==r||$e!==s)return;Hn(c,o)}finally{tt=!1,zn()}})});function Gn(){Ue=!0,ze=!0,Le++,$(`ai-plan`).hidden=!0,er()}function Kn(e){let t=Math.min(5e3,M?.metadata?.durationMs||5e3);return e===`trim`?{operation:e,startMs:0,endMs:t}:e===`resize`?{operation:e,resolutionPreset:`360p`,width:null,height:null}:e===`join_clips`?{operation:e,clips:[{startMs:0,endMs:t}]}:{operation:`mute`}}function qn(){Je.update({steps:He,duration:M?.metadata?.durationMs||0}),er()}function Jn(e){let t=e.steps||[],n=t.at(-1);if(!n||n.operation!==`export`)throw Error(`顺序方案缺少有效的导出步骤。`);He=structuredClone(t.slice(0,-1).filter(e=>e.operation!==`export`)),$(`workflow-format`).value=String(n.outputFormat),$(`workflow-size`).value=String(n.targetSizeBytes==null?``:n.targetSizeBytes/1048576),$(`workflow-audio`).checked=!!n.extractAudio,n.videoCodec&&($(`workflow-codec`).value=String(n.videoCodec)),Ue=!1,qn()}function Yn(){Ke++,We.forEach(e=>e.cancel()),We=[],Ge?.cancel(),Ge=null;for(let e of[$(`ai-form`),$(`workflow-form`)])e.classList.remove(`mode-outgoing`),e.hidden=e.id===`ai-form`?Ve:!Ve,e.inert=e.hidden}function Xn(e=$(`workflow-viewport`).getBoundingClientRect().height){let t=$(`workflow-viewport`);Ge?.cancel();let n=t.getBoundingClientRect().height,r=qe-performance.now();Ge=r>0&&Math.abs(n-e)>1?t.animate([{height:`${e}px`},{height:`${n}px`}],{duration:r,easing:`cubic-bezier(.22,.75,.22,1)`}):null}function Zn(e){let t=$(`workflow-viewport`),n=$(Ve?`workflow-form`:`ai-form`),r=e!==Ve&&!v.matches&&t.getClientRects().length>0,i=t.getBoundingClientRect().height;if(Yn(),Ve=e,Le++,Re=!1,$(`ai-form`).hidden=e,$(`ai-form`).inert=e,$(`workflow-form`).hidden=!e,$(`workflow-form`).inert=!e,$(`workflow-mode`).dataset.mode=e?`steps`:`text`,$(`workflow-text-mode`).setAttribute(`aria-pressed`,String(!e)),$(`workflow-step-mode`).setAttribute(`aria-pressed`,String(e)),gn(),er(),!r)return;let a=$(e?`workflow-form`:`ai-form`),o=e?1:-1,s=Ke;n.classList.add(`mode-outgoing`),n.hidden=!1,n.inert=!0;let c={duration:340,easing:`cubic-bezier(.22,.75,.22,1)`};We=[n.animate([{transform:`translateX(0)`,opacity:1},{transform:`translateX(${-o*110}%)`,opacity:0}],c),a.animate([{transform:`translateX(${o*110}%)`,opacity:.2},{transform:`translateX(0)`,opacity:1}],c)],qe=performance.now()+c.duration,Xn(i),Promise.all(We.map(e=>e.finished)).then(()=>{s===Ke&&Yn()}).catch(()=>{})}let Qn=new ResizeObserver(()=>{Ge&&Xn()});Qn.observe($(`ai-form`)),Qn.observe($(`workflow-form`)),v.addEventListener(`change`,()=>{v.matches&&Yn()}),$(`workflow-text-mode`).addEventListener(`click`,async()=>{!g&&Ve&&(!Ue||await vt({title:`切换文字输入`,message:`当前未保存的处理步骤将被放弃。已保存的方案保留，可稍后重新打开。`,confirmLabel:`放弃并切换`,icon:`messages-square`}))&&(Ue=!1,Zn(!1),tr(null),nr(!0))}),$(`workflow-step-mode`).addEventListener(`click`,()=>{Ve||(Zn(!0),tr(null),nr())}),$(`workflow-edit`).addEventListener(`click`,()=>{Fe?.parameters?.operation===`workflow`&&(Zn(!0),Jn(Fe.parameters),tr(Fe))}),$(`workflow-add`).addEventListener(`click`,()=>{He.length<11&&(He.push(Kn(`trim`)),Gn(),qn())});for(let e of[`workflow-format`,`workflow-codec`,`workflow-size`,`workflow-audio`])$(e).addEventListener(`input`,Gn);$(`workflow-form`).addEventListener(`submit`,e=>{e.preventDefault();let t=u?.id,n=M?.id,r=F,i=Le;g||Re||!n||Et(`workflow-error`,async()=>{let e=M?.metadata?.durationMs??0,a=!M?.metadata?.hasAudio;for(let[t,n]of He.entries()){if(n.operation===`trim`||n.operation===`join_clips`){let r=n.operation===`trim`?[n]:n.clips,i=n.operation===`trim`?100:500;if(r.some(t=>!Number.isSafeInteger(t.startMs)||!Number.isSafeInteger(t.endMs)||t.startMs<0||t.endMs>e||t.endMs-t.startMs<i))throw Error(`步骤 ${t+1} 区间无效：当前结果长 ${(e/1e3).toFixed(3)} 秒，区间至少 ${i/1e3} 秒。`);if(e=r.reduce((e,t)=>e+t.endMs-t.startMs,0),e>9e5)throw Error(`拼接结果不能超过15分钟。`)}n.operation===`mute`&&(a=!0)}let o=$(`workflow-format`).value,s=[`mp3`,`m4a`,`wav`,`flac`].includes(o);if(s&&a)throw Error(`当前步骤已无音轨，无法导出音频。`);let c={operation:`export`,outputFormat:o,videoCodec:s?null:$(`workflow-codec`).value,targetSizeBytes:s||!$(`workflow-size`).value?null:Math.round(Number($(`workflow-size`).value)*1048576),extractAudio:!s&&$(`workflow-audio`).checked},l={operation:`workflow`,outputFormat:o,steps:[...structuredClone(He),c]},d=Fe?.parameters?.operation===`workflow`&&Fe.status===`READY`&&Fe.mediaId===n?Fe:null,f=await V(d?`/api/operation-plans/${d.id}`:`/api/operation-plans`,{method:d?`PATCH`:`POST`,body:d?{expectedVersion:d.version,parameters:l}:{mediaId:n,parameters:l}});u?.id===t&&M?.id===n&&F===r&&Le===i&&(Ue=!1,tr(f))})});function $n(){Le++,Fe=null,Ie=null,Re=!1,ze=!1,Be=!1,$(`ai-plan`).hidden=!0,$(`ai-instruction`).value=``,H(`ai-error`,``),Ue=!1,He=[],qn(),H(`workflow-error`,``),$(`workflow-format`).value=`mp4`,$(`workflow-codec`).value=`h264`,$(`workflow-size`).value=``,$(`workflow-audio`).checked=!1}function er(){let e=M?.status===`READY`;$(`ai-source`).textContent=e&&M?.originalFilename||`未选择就绪素材`,$(`ai-instruction`).disabled=g||Re||!e,$(`generate-ai-plan`).disabled=g||Re||!e||!d?.aiPlans||!$(`ai-instruction`).value.trim(),$(`refresh-ai-plan`).disabled=g||Re||!e,$(`execute-ai-plan`).disabled=g||Re||ze||!e||Fe?.mediaId!==M?.id||Fe?.status!==`READY`,$(`ai-state`).textContent=Be?`正在生成方案…`:Re?`正在读取方案…`:d?.aiPlans?``:d?.textAi?.available===!0?`当前处理工具暂不可用。`:d?.textAi?.source===`SERVER`?at.LOCAL_AI_UNAVAILABLE:d?.textAi?.unavailableReason||`AI 服务尚未配置。`,$(`generate-ai-label`).textContent=Be?`生成中…`:`生成方案`,$(`ai-result-slot`).hidden=!N||N.mediaId!==M?.id||N.kind===`TRANSCRIPTION`,$(`workflow-source`).textContent=e&&M?.originalFilename||`未选择就绪素材`;let t=g||Re||!e||!d?.supportedOperations?.includes(`workflow`);for(let e of $(`workflow-form`).querySelectorAll(`input, select, button`))e.closest(`#workflow-steps`)||(e.disabled=t);Je.update({workflowDisabled:t}),$(`workflow-add`).disabled||=He.length>=11,$(`workflow-text-mode`).disabled=g||Re,$(`workflow-step-mode`).disabled=g||Re;let n=$(`workflow-format`).value,r=[`mp3`,`m4a`,`wav`,`flac`].includes(n);$(`workflow-codec-field`).hidden=r,$(`workflow-size-field`).hidden=r,$(`workflow-audio-field`).hidden=r;for(let e of $(`workflow-format`).options)e.disabled=!d?.exportFormats?.some(t=>t===e.value);let i=(vn[n]||[]).filter(e=>d?.exportVideoCodecs?.some(t=>t===e)&&(!$(`workflow-size`).value||[`h264`,`vp9`].includes(e)));for(let e of $(`workflow-codec`).options)e.disabled=!i.includes(e.value);!r&&i.length&&!i.includes($(`workflow-codec`).value)&&($(`workflow-codec`).value=String(i[0])),$(`workflow-audio`).disabled||=!M?.metadata?.hasAudio,$(`workflow-state`).textContent=d?.supportedOperations?.includes(`workflow`)?Ue?`未保存`:``:`顺序处理工具暂不可用。`}function tr(e){if(Fe=e,ze=!1,$(`ai-plan`).hidden=!e,!e){s.update(null),er();return}$(`ai-plan-status`).textContent=e.status===`NEEDS_INPUT`?`待补充`:e.status===`EXECUTED`?`已执行`:`待确认`,$(`ai-plan-status`).className=`media-status `+(e.status===`READY`?`ready`:``),$(`ai-plan-summary`).textContent=e.summary;let t=e.parameters;s.update(e),$(`workflow-edit`).hidden=t?.operation!==`workflow`||Ve,er()}async function nr(e=!1){let t=u?.id,n=M?.id,r=F;if(!t||!n||M?.status!==`READY`)return;let i=++Le;Ie=n,Re=!0,er();try{let a=await V(`/api/operation-plans?mediaId=${n}&page=1&pageSize=10`);if(u?.id!==t||M?.id!==n||F!==r||Le!==i)return;let o=a.items.find(e=>Ve?e.parameters?.operation===`workflow`:e.instruction);if(Ve&&o?.parameters&&Jn(o.parameters),!Ve&&!e&&($(`ai-instruction`).value=String(o?.instruction||``)),tr(o||null),H(`ai-error`,``),!Ve&&e&&$(`ai-instruction`).value!==(o?.instruction||``)&&(ze=!0,$(`ai-plan`).hidden=!0,er()),o?.taskId){let e=await V(`/api/tasks/${o.taskId}`);u?.id===t&&M?.id===n&&F===r&&Le===i&&_r(e)}}catch(e){let n=Mx(e);if(u?.id!==t||F!==r||Le!==i)return;n.status===401?Ct():H(`ai-error`,n.message,!0)}finally{Le===i&&(Re=!1,er())}}$(`refresh-ai-plan`).addEventListener(`click`,async()=>{g||(Ve?Ue:$(`ai-instruction`).value)&&!await vt({title:`恢复最近方案`,message:`恢复最近保存的方案并放弃当前输入。未保存的文字或处理步骤不会保留。`,confirmLabel:`恢复方案`,icon:`rotate-ccw`})||(Ue=!1,nr())}),$(`ai-instruction`).addEventListener(`input`,()=>{Le++,ze=!0,$(`ai-plan`).hidden=!0,er()}),$(`ai-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=$(`ai-instruction`).value.trim(),n=u?.id,r=M?.id,i=F;if(!t||g||!r)return;let a=Le;if(d?.textAi?.source!==`SERVER`&&!await ht({provider:U(),content:`处理要求和视频参数`})||g||u?.id!==n||M?.id!==r||F!==i||Le!==a)return;let o=++Le;Ie=r,Et(`ai-error`,async()=>{if(Array.from(t).length>2e3)throw Error(`处理要求不能超过2000个字符。`);Be=!0,er();try{let e=Fe&&Fe.status!==`EXECUTED`?{expectedVersion:Fe.version,instruction:t}:{mediaId:r,instruction:t},a=await V(Fe&&Fe.status!==`EXECUTED`?`/api/operation-plans/${Fe.id}`:`/api/operation-plans`,{method:Fe&&Fe.status!==`EXECUTED`?`PATCH`:`POST`,body:e});if(u?.id!==n||M?.id!==r||F!==i||Le!==o)return;tr(a)}finally{Be=!1,er()}})}),$(`execute-ai-plan`).addEventListener(`click`,()=>{let e=Fe,t=u?.id,n=Le,r=F;g||e?.status!==`READY`||e.mediaId!==M?.id||Et(`ai-error`,async()=>{let i=await V(`/api/operation-plans/${e.id}/execute`,{method:`POST`,body:{expectedVersion:e.version}});u?.id===t&&F===r&&Le===n&&M?.id===e.mediaId&&(tr({...e,status:`EXECUTED`,taskId:i.id}),mn(i),ne=1,await Dr())})});function rr(){Ee&&(Ee.cancelled=!0),Ee=null,ur(),L++,I=null,Ce=null,we=0,R=!1,z=!1,Te=null,De=null,$(`subtitle-result-slot`).hidden=!0,$(`subtitle-editor`).hidden=!0,Ye.setSegments([]),$(`download-srt`).removeAttribute(`href`),$(`subtitle-original`).checked=!1,H(`subtitle-error`,``)}function ir(){return Array.isArray(d?.asrModels)?d.asrModels:[{provider:`tencent`,id:`16k_zh`,name:`中文通用 16k`},{provider:`aliyun`,id:`paraformer-realtime-v2`,name:`Paraformer V2 · 常规转写`}]}function ar(e){let t=$(`asr-provider`).value,n=$(`asr-model`),r=ir().filter(e=>e.provider===t),i=JSON.stringify([t,r]);if(n.dataset.catalog!==i){n.replaceChildren(),n.dataset.catalog=i;for(let e of r){let t=document.createElement(`option`);t.value=String(e.id),t.textContent=e.name+(e.recommended&&r.length>1?`（推荐）`:``),t.title=e.id,n.append(t)}let e=E.get(t);n.value=String(r.find(t=>t.id===e)?.id||r.find(e=>e.recommended)?.id||r[0]?.id||``)}n.disabled=e||!r.length,$(`asr-model-note`).hidden=!r.length,$(`asr-model-note`).textContent=r.length?`${n.value} · 文言文与生僻字需核对，模型权限与费用以服务商为准。`:``}function or(){let e=d?.asrProviders||[];for(let t of $(`asr-provider`).options)t.disabled=!e.includes(t.value);$(`asr-provider`).value&&e.includes($(`asr-provider`).value)||($(`asr-provider`).value=String(e[0]||``));let t=N?.kind===`TRANSCRIPTION`&&N.mediaId===M?.id?N:null;ar(g||z||pr(t)),$(`subtitle-source`).textContent=M?.originalFilename||`未选择就绪素材`,$(`asr-provider`).disabled=g||!e.length||pr(t),$(`start-transcription`).disabled=g||z||M?.status!==`READY`||!M?.metadata?.hasAudio||!e.length||!$(`asr-model`).value||pr(t)||!!B,$(`transcription-label`).textContent=I?`重新识别`:`识别字幕`,$(`cancel-transcription`).hidden=!pr(t),$(`cancel-transcription`).disabled=g||t?.status===`CANCELLING`,$(`refresh-subtitle`).disabled=g||z||M?.status!==`READY`,$(`subtitle-state`).textContent=z?`正在读取字幕…`:pr(t)?mr(t.status,`transcribe`):t?.error?t.error.message:M?.status===`READY`&&!M?.metadata?.hasAudio?`当前素材没有音轨。`:e.length?I?`${I.segments.length} 段字幕`:`暂无字幕`:`语音识别服务尚未配置。`,$(`save-subtitle`).disabled=g||!R||!I||I.version!==we||$(`subtitle-original`).checked,$(`subtitle-version`).disabled=g||R||!!B||!I,$(`subtitle-original`).disabled=g||R||!!B||!I,$(`subtitle-draft-state`).textContent=R?`有未保存的修改`:I?`已保存 · v${I.version}`:``;let n=!I||I.version!==we||$(`subtitle-original`).checked||!!B;$(`translate-subtitle`).disabled=g||z||!I||R||!!B||I.version!==we||!d?.subtitleTranslation||pr(t),$(`translate-subtitle`).title=d?.subtitleTranslation?R?`请先保存字幕修改`:`翻译字幕`:`文字模型暂不可用，请检查 AI 服务配置`,$(`translation-language`).disabled=g||!!B,$(`cancel-translation`).hidden=!Ee,$(`cancel-translation`).disabled=!Ee||Ee.cancelled,$(`save-translation`).disabled=g||!B,$(`discard-translation`).disabled=g,$(`translation-layout`).disabled=g,Ye.update({translationDisabled:g});let r=N?.mediaId===M?.id&&N?.parameters?.operation===`burn_subtitles`?N:null;$(`subtitle-result-slot`).hidden=!r,$(`burn-subtitle`).disabled=g||z||n||R||M?.status!==`READY`||!d?.supportedOperations?.includes(`burn_subtitles`)||pr(r),$(`burn-subtitle`).title=d?.supportedOperations?.includes(`burn_subtitles`)?R?`请先保存字幕`:`生成字幕视频`:`字幕烧录工具暂不可用`,Ye.update({disabled:g||n,canCorrect:!g&&!n&&!R&&!!d?.subtitleCorrection,correctionTitle:d?.textAi?.source===`SERVER`?`服务端千问校对`:U()+` 校对`,duration:M?.metadata?.durationMs||0}),$(`download-srt`).hidden=!I||R||!!B,I&&($(`download-srt`).href=`/api/transcripts/${I.id}/srt?version=${$(`subtitle-original`).checked?1:I.version}`)}async function sr(e){let t=u?.id,n=M?.id,r=F;if(!t||!n||M?.status!==`READY`)return;ur();let i=++L;Ce=n,z=!0,or();try{let a=await V(e&&I?`/api/transcripts/${I.id}?version=${e}`:`/api/media/${n}/transcript`);if(u?.id!==t||F!==r||M?.id!==n||L!==i)return;e||(we=a.version),I=a,R=!1,$(`subtitle-original`).checked=!1,$(`subtitle-version`).replaceChildren(...Array.from({length:we},(e,t)=>{let n=document.createElement(`option`);return n.value=String(String(t+1)),n.textContent=`v${t+1}`,n})),$(`subtitle-version`).value=String(String(a.version)),cr(),H(`subtitle-error`,``)}catch(e){let n=Mx(e);if(u?.id!==t||F!==r||L!==i)return;n.status===401?Ct():n.status===404?(I=null,$(`subtitle-editor`).hidden=!0):H(`subtitle-error`,n.message,!0)}finally{L===i&&(z=!1,or())}}function cr(){$(`subtitle-editor`).hidden=!I,Ye.setSegments(I?$(`subtitle-original`).checked?I.originalSegments:I.segments:[]),or()}async function lr(e){if(g||!I||!d?.subtitleCorrection)return null;let t=I,n=L,r=u?.id;if(d?.textAi?.source!==`SERVER`&&!await ht({provider:U(),content:`当前这段已保存的字幕`,detail:`获取校对建议，不会直接覆盖原文。`})||g||u?.id!==r||L!==n||I!==t)return null;let i=null;return await Et(`subtitle-error`,async()=>{let a=await V(`/api/transcripts/${t.id}/corrections`,{method:`POST`,body:{expectedVersion:t.version,segmentId:e}});u?.id===r&&L===n&&I===t&&(i=a.correctedText)}),i}function ur(){B=null,$(`translation-preview`).hidden=!0,Ye.clearTranslation(),$(`subtitle-segments`).hidden=!1,H(`translation-state`,``)}function dr(e){let t=B;if(!t)return``;let n=t.segments[e].text.replace(/\r\n?/g,`
`).trim();return $(`translation-layout`).value===`bilingual`?t.source[e].text+`
`+n:n}function fr(){let e=B;e&&($(`translation-preview`).hidden=!1,$(`subtitle-segments`).hidden=!0,$(`translation-title`).textContent=`翻译预览 · ${$(`translation-language`).selectedOptions[0].textContent} · 原稿 v${e.item.version}`,Ye.setTranslation(e.source,e.segments),Ye.update({bilingual:$(`translation-layout`).value===`bilingual`}),or(),fn())}$(`translation-layout`).addEventListener(`change`,()=>{Ye.update({bilingual:$(`translation-layout`).value===`bilingual`})}),$(`discard-translation`).addEventListener(`click`,async()=>{if(g||!B)return;let e=B;await vt({title:`放弃译文`,message:`未保存的译文和本次编辑将被清除，已保存的字幕原稿保留。已发出的翻译请求仍可能计费。`,confirmLabel:`放弃译文`,icon:`languages`})&&!g&&B===e&&(ur(),or(),fn())}),$(`cancel-translation`).addEventListener(`click`,()=>{Ee&&(Ee.cancelled=!0,H(`translation-state`,`正在停止，等待当前批次结束…`),or())}),$(`translate-subtitle`).addEventListener(`click`,async()=>{if(g||!I||R||B||I.version!==we||!d?.subtitleTranslation)return;let e=I,t=u?.id,n=F,r=L,i=$(`translation-language`).value,a=$(`subtitle-original`).checked,o=a?e.originalSegments:e.segments,s=[],c=[],l=0;for(let e of o){let t=Array.from(e.text).length;c.length&&(c.length>=20||l+t>2e3)&&(s.push(c),c=[],l=0),c.push(e),l+=t}if(c.length&&s.push(c),s.length>60){H(`subtitle-error`,`字幕超过本次 60 批翻译上限，请精简字幕后再试。`,!0);return}if(!await ht({provider:d?.textAi?.source===`SERVER`?`服务端千问`:U(),content:`当前选择的已保存字幕`,paid:d?.textAi?.source!==`SERVER`,detail:`${o.length} 段字幕，分 ${s.length} 批翻译为${$(`translation-language`).selectedOptions[0].textContent}。原稿保留，译文需确认后保存。`})||g||u?.id!==t||F!==n||L!==r||I!==e)return;let f={cancelled:!1,complete:!1};Ee=f;let p=()=>u?.id===t&&F===n&&L===r&&I===e&&Ee===f;await Et(`subtitle-error`,async()=>{try{let t=[];for(let n of s){if(!p()||f.cancelled)return;H(`translation-state`,`正在翻译 ${t.length} / ${o.length} 段…`);let r=await V(`/api/transcripts/${e.id}/translations`,{method:`POST`,body:{expectedVersion:e.version,targetLanguage:i,segmentIds:n.map(e=>e.id),useOriginal:a}});if(!p()||f.cancelled)return;if(r.transcriptId!==e.id||r.transcriptVersion!==e.version||r.targetLanguage!==i||!Array.isArray(r.segments)||r.segments.length!==n.length||r.segments.some((e,t)=>e.id!==n[t].id||e.startMs!==n[t].startMs||e.endMs!==n[t].endMs||typeof e.text!=`string`))throw new st(`AI_TRANSLATION_FAILED`,422);t.push(...r.segments)}let n=await V(`/api/media/${e.mediaId}/transcript`);if(!p()||f.cancelled)return;if(n.id!==e.id||n.version!==e.version)throw new st(`TRANSCRIPT_VERSION_CONFLICT`,409);B={item:e,source:o,segments:t,language:i,useOriginal:a},f.complete=!0,H(`translation-state`,`${t.length} 段译文待确认`),fr()}finally{p()&&(f.complete||H(`translation-state`,f.cancelled?`已停止，原稿未修改。已发出的请求仍可能计费。`:`翻译未完成，原稿未修改。`),Ee=null,or())}})}),$(`save-translation`).addEventListener(`click`,async()=>{if(g||!B||!I)return;let e=B,t=I,n=u?.id,r=L;await vt({title:`保存字幕新版本`,message:`将${$(`translation-layout`).value===`bilingual`?`双语字幕`:`译文`}保存为新版本。原稿 v${t.version} 和识别原文继续保留。`,confirmLabel:`保存新版本`,kind:`info`,icon:`save`})&&(g||u?.id!==n||L!==r||I!==t||B!==e||await Et(`subtitle-error`,async()=>{let i=e.segments.map((t,n)=>{let r=dr(n);if(!e.segments[n].text.trim()||Array.from(r).length>2e3||/\n[\t ]*\n/.test(r)||Array.from(r).some(e=>{let t=e.charCodeAt(0);return t<32&&![9,10,13].includes(t)||t>=127&&t<=159}))throw Error(`第 ${n+1} 段字幕不能为空、包含空行或控制字符，原文与译文合计最多 2000 个字符；可改选仅译文或精简文本。`);return{id:t.id,startMs:t.startMs,endMs:t.endMs,text:r}});if(new TextEncoder().encode(JSON.stringify(i)).length>2097152)throw Error(`字幕总量超过 2 MiB，请精简译文。`);let a=await V(`/api/media/${t.mediaId}/transcript`);if(u?.id===n&&L===r&&B===e){if(a.id!==t.id||a.version!==t.version)throw new st(`TRANSCRIPT_VERSION_CONFLICT`,409);await V(`/api/transcripts/${t.id}`,{method:`PATCH`,body:{expectedVersion:t.version,segments:i}}),u?.id===n&&L===r&&B===e&&(await sr(),H(`translation-state`,`已保存新版本`))}}))}),$(`burn-subtitle`).addEventListener(`click`,async()=>{if(g||!I||R||z||I.version!==we||$(`subtitle-original`).checked)return;let e=I,t=u?.id,n=F;await vt({title:`导出带字幕视频`,message:`使用已保存的字幕 v${e.version} 生成带字幕的 MP4。字幕将烧录进画面，原视频保持不变。`,confirmLabel:`开始导出`,kind:`info`,icon:`captions`})&&(g||u?.id!==t||F!==n||I!==e||R||Et(`subtitle-error`,async()=>{let r={operation:`burn_subtitles`,outputFormat:`mp4`,transcriptId:e.id,transcriptVersion:e.version,resolutionPreset:`source`,audioMode:`keep`};De&&De.mediaId===e.mediaId&&De.parameters?.transcriptId===e.id&&De.parameters?.transcriptVersion===e.version||(De=await V(`/api/operation-plans`,{method:`POST`,body:{mediaId:e.mediaId,parameters:r}}));let i=await V(`/api/operation-plans/${De.id}/execute`,{method:`POST`,body:{expectedVersion:De.version}});u?.id===t&&F===n&&M?.id===e.mediaId&&(De=null,mn(i),ne=1,await Dr())}))}),$(`refresh-subtitle`).addEventListener(`click`,async()=>{g||(!R&&!B||await vt({title:`刷新字幕`,message:`未保存的字幕和翻译修改将被放弃，重新读取已保存的字幕版本。`,confirmLabel:`放弃并刷新`,icon:`refresh-cw`}))&&sr()}),$(`subtitle-version`).addEventListener(`change`,()=>sr(Number($(`subtitle-version`).value))),$(`subtitle-original`).addEventListener(`change`,cr),$(`start-transcription`).addEventListener(`click`,async()=>{if(g||!M||!d?.asr)return;let e=$(`asr-provider`).value,t=$(`asr-model`).value,n=e===`aliyun`?`阿里云百炼`:`腾讯云`;if(!ir().some(n=>n.provider===e&&n.id===t))return;let r=u?.id,i=M?.id,a=F,o=I;await ht({provider:n,content:`当前素材的音轨`,detail:`模型：${t}。`+(o?`重新识别会创建新字幕，原有版本仍保留。`:``)})&&(g||u?.id!==r||M?.id!==i||F!==a||I!==o||$(`asr-provider`).value!==e||$(`asr-model`).value!==t||Et(`subtitle-error`,async()=>{let n=await V(`/api/media/${i}/transcriptions`,{method:`POST`,body:{language:`zh-CN`,force:!!o,provider:e,...Array.isArray(d?.asrModels)?{model:t}:{}}});u?.id===r&&M?.id===i&&F===a&&(_r(n),ne=1,await Dr())}))}),$(`cancel-transcription`).addEventListener(`click`,()=>Et(`subtitle-error`,async()=>{N?.kind===`TRANSCRIPTION`&&N.mediaId===M?.id&&(_r(await V(`/api/tasks/${N.id}/cancel`,{method:`POST`})),await Dr())})),$(`save-subtitle`).addEventListener(`click`,()=>{let e=I,t=L,n=u?.id;e&&Et(`subtitle-error`,async()=>{let r=[...$(`subtitle-segments`).children].map(e=>{let t=t=>{let n=e.querySelector(`[data-field="${t}"]`).value,r=Number(n),i=Math.round(r*1e3);if(n===``||!Number.isSafeInteger(i)||Math.abs(r-i/1e3)>1e-9)throw Error(`时间最多保留三位小数。`);return i};return{id:e.dataset.segmentId,startMs:t(`startMs`),endMs:t(`endMs`),text:e.querySelector(`textarea`).value}});await V(`/api/transcripts/${e.id}`,{method:`PATCH`,body:{expectedVersion:e.version,segments:r}}),u?.id===n&&L===t&&I===e&&(R=!1,await sr(),H(`subtitle-error`,``))})}),window.addEventListener(`beforeunload`,e=>{(R||B||Ee||Me||he||Ue)&&(e.preventDefault(),e.returnValue=``)});function pr(e){return!!e&&[`QUEUED`,`RUNNING`,`CANCELLING`].includes(e.status)}function mr(e,t){let n=hr(t);return{QUEUED:`排队中`,RUNNING:n+`中`,CANCELLING:`取消中`,CANCELLED:`已取消`,SUCCEEDED:`已完成`,FAILED:n+`失败`}[e]||e}function hr(e){return e===`workflow`?`顺序处理`:e===`export`?`导出`:e===`join_clips`?`拼接`:e===`burn_subtitles`?`字幕烧录`:e===`transcribe`?`识别`:e===`mute`?`静音`:e===`trim`?`裁切`:e===`extract_audio`?`提取`:e===`compress`?`压缩`:`转换`}function gr(e){return e?.operation===`workflow`?`${e.outputFormat.toUpperCase()} · ${(e.steps??[]).length} 步`:e?.operation===`export`?`${e.outputFormat.toUpperCase()}${e.videoCodec?` · `+e.videoCodec:``}${e.startMs===null?``:` · 裁切`}${e.targetSizeBytes===null?``:` · 压缩`}${e.audioMode===`mute`?` · 静音`:``}`:e?.operation===`join_clips`?`MP4 · ${(e.clips??[]).length}段 · ${((e.clips??[]).reduce((e,t)=>e+t.endMs-t.startMs,0)/1e3).toFixed(3)} 秒`:e?.operation===`burn_subtitles`?`MP4 · 字幕 v${e.transcriptVersion}`:e?.operation===`trim`?`MP4 · ${((e.startMs??0)/1e3).toFixed(3)}-${((e.endMs??0)/1e3).toFixed(3)} 秒`:e?.operation===`extract_audio`?`MP3`:`MP4 · ${e?.resolutionPreset===`720p`?`720p`:`原分辨率`}`}function _r(e,t=_e){if(N=e,e.kind===`TRANSCRIPTION`){$(`conversion-result`).hidden=!0,e.mediaId!==M?.id||e.status!==`SUCCEEDED`||!e.transcript||Te===e.id||R||B||Ee||z||(Te=e.id,sr()),Ht();return}$(`conversion-result`).hidden=!1,$(`task-status`).textContent=mr(e.status,e.parameters?.operation),$(`task-status`).className=`media-status `+(e.status===`SUCCEEDED`?`ready`:e.status===`FAILED`?`failed`:``);let n={WAITING:`等待处理`,TRANSCODING:`正在`+hr(e.parameters?.operation),VERIFYING:`正在校验文件`,DONE:e.outputs.length?`文件已就绪`:`无可用结果`,CANCELLED:`任务已取消`,FAILED:`任务未完成`,TRANSCRIBING:`正在识别`,EXPORTING:`正在导出`}[e.stage]||e.stage;$(`task-stage`).textContent=`${e.id.slice(0,8)} · ${gr(e.parameters)} · ${n}`,H(`task-error`,e.error?.message||``,!0),$(`cancel-task`).hidden=!pr(e);let r=e.status===`SUCCEEDED`?e.outputs.find(e=>e.id===t)||e.outputs[0]:null;$(`output-selector-field`).hidden=e.outputs.length<2,$(`output-selector`).replaceChildren(...e.outputs.map(e=>{let t=document.createElement(`option`);return t.value=String(e.id),t.textContent=e.filename,t})),r&&($(`output-selector`).value=String(r.id)),$(`output-empty`).hidden=e.status!==`SUCCEEDED`||!!r;let i=r?.contentType?.startsWith(`audio/`);$(`compression-stats`).hidden=!r||e.parameters?.operation!==`compress`,$(`compression-stats`).textContent=r&&e.parameters?.operation===`compress`?`目标 ${Sl(e.parameters.targetSizeBytes??0)} · 实际 ${Sl(r.sizeBytes)}`:``,_e!==(r?.id||null)&&($(`output-preview`).pause(),$(`output-audio`).pause(),$(`output-preview`).removeAttribute(`src`),$(`output-preview`).load(),$(`output-audio`).removeAttribute(`src`),$(`output-audio`).load(),r?.previewUrl&&($(i?`output-audio`:`output-preview`).src=r.previewUrl),_e=r?.id||null),$(`output-preview`).hidden=!r?.previewUrl||!!i,$(`output-audio`).hidden=!r?.previewUrl||!i,H(`output-preview-status`,r&&!r.previewUrl?`当前格式请下载后播放。`:``),$(`audio-stats`).hidden=!i,$(`audio-stats`).textContent=i&&r?`${((r.metadata?.durationMs??0)/1e3).toFixed(2)} 秒 · ${Sl(r.sizeBytes)}`:``,$(`download-label`).textContent=`下载 `+(r?.filename?.split(`.`).pop()?.toUpperCase()||`文件`),$(`download-output`).hidden=!r,$(`delete-output`).hidden=!r,r?($(`download-output`).href=r.downloadUrl,$(`download-output`).setAttribute(`download`,r.filename)):$(`download-output`).removeAttribute(`href`),Ht()}$(`output-selector`).addEventListener(`change`,()=>{let e=$(`output-selector`).value;N&&_r(N,e)});for(let e of[`output-preview`,`output-audio`])$(e).addEventListener(`error`,()=>{_e&&$(e).error&&H(`output-preview-status`,`浏览器无法播放此编码，请下载后播放。`)});async function vr(e){let t=u?.id,n=F;on()||!await sn(e.id)||g||on()||u?.id!==t||F!==n||(cn(e),M?.id===e.id&&e.status===`READY`&&i.tool!==`detect`&&pn(`edit`))}function yr(e){g||on()||!u||(xe={id:e.id,owner:u.id,revision:F},$(`delete-media-name`).textContent=e.originalFilename,H(`delete-media-error`,``),$(`delete-media-dialog`).showModal(),$(`cancel-delete-media`).focus())}function br(e){switch(e?.operation){case`extract_audio`:return`audio`;case`trim`:return`trim`;case`compress`:return`compress`;case`mute`:return`mute`;case`export`:{if(!e.videoCodec)return`audio`;let t=[];return e.startMs!=null&&t.push(`trim`),e.targetSizeBytes!=null&&t.push(`compress`),e.audioMode===`mute`&&t.push(`mute`),t.length===1&&!e.extractAudio?t[0]:`convert`}default:return`convert`}}async function xr(e){let t=u?.id,n=F;if(e.mediaId){if(!await sn(e.mediaId)||g||u?.id!==t||F!==n)return;Et(`task-list-error`,async()=>{let r=await V(`/api/media/${e.mediaId}`);u?.id===t&&F===n&&(cn(r),M?.id===r.id&&(e.parameters?.operation===`workflow`?(dn(`ai`),Zn(!0),Jn(e.parameters),tr({id:e.planId||e.id,mediaId:e.mediaId,version:e.planVersion||1,status:`EXECUTED`,parameters:e.parameters,summary:gr(e.parameters),questions:[],warnings:[],taskId:e.id})):e.parameters?.operation===`join_clips`?(dn(`join`),Ae++,je=!1,ke=e.mediaId,Oe=(e.parameters.clips??[]).map(e=>An(e.startMs,e.endMs)),Me=!1,Ne=null,Nn()):e.kind===`TRANSCRIPTION`||e.parameters?.operation===`burn_subtitles`?dn(`subtitle`):dn(br(e.parameters)),mn(e)))})}else dn(br(e.parameters)),mn(e)}async function Sr(e){if(!e.planId)return;let t=u?.id,n=F,r=e.planId+`:`+e.planVersion;if(!(ue.has(r)||fe.has(r))){fe.add(r),ue.set(r,`正在读取处理要求…`);try{let i=await V(`/api/operation-plans/${e.planId}`);u?.id===t&&F===n&&ue.set(r,i.instruction||i.summary||``)}catch(e){let i=Mx(e);u?.id===t&&F===n&&ue.set(r,i.status===404?`原方案已删除，任务参数仍保留。`:`处理要求暂时无法读取。`)}finally{fe.delete(r)}}}async function Cr(e,t){if(g||e===`task`&&pr(t)||!await vt({title:e===`task`?`删除处理记录`:`删除保存的方案`,message:e===`task`?`删除这条处理记录？仅从记录列表移除，原素材和生成文件会保留。`:`删除这个保存的方案？已生成的任务和文件不受影响。`,confirmLabel:`确认删除`,kind:`danger`,icon:`trash-2`}))return;let n=u?.id,r=F;Et(e===`task`?`task-list-error`:`plan-list-error`,async()=>{if(await V(`/api/${e===`task`?`tasks`:`operation-plans`}/${t.id}`,{method:`DELETE`}),u?.id===n&&F===r){if(le.delete(e+`:`+t.id),e===`task`)se++,N?.id===t.id&&$t(),await Dr(),$(`refresh-tasks`).focus();else{me?.id===t.id&&(me=null,he=!0,H(`export-plan-state`,`方案已删除，当前参数未清空`)),pe?.id===t.id&&(pe=null),Ne?.id===t.id&&(Ne=null,Me=!0),De?.id===t.id&&(De=null),Fe?.id===t.id&&(Fe=null,ze=!0,$(`ai-plan`).hidden=!0);for(let e of ue.keys())e.startsWith(t.id+`:`)&&ue.delete(e);await Tr(),$(`refresh-plans`).focus()}}})}async function wr(e){if(g||(he||ze||Ue||Me||R||B)&&!await vt({title:`恢复保存的方案`,message:`当前未保存的编辑将被此方案替换。已保存的版本和生成文件不受影响。`,confirmLabel:`恢复方案`,icon:`rotate-ccw`}))return;let t=u?.id,n=F;Et(`plan-list-error`,async()=>{let r=await V(`/api/media/${e.mediaId}`);if(u?.id!==t||F!==n||(cn(r),M?.id!==r.id))return;let i=e.parameters;if(!i)throw Error(`这个方案尚未生成可执行参数。`);if(i?.operation===`export`)Tn(e);else if(e.instruction||i?.operation===`workflow`)Le++,Re=!1,Ie=r.id,dn(`ai`),Zn(i?.operation===`workflow`),Ve?Jn(i):$(`ai-instruction`).value=String(e.instruction||``),tr(e);else if(i?.operation===`join_clips`)Ae++,je=!1,ke=r.id,dn(`join`),Oe=(i.clips??[]).map(e=>An(e.startMs,e.endMs)),Me=!1,Ne=e.status===`READY`?e:null,Nn();else if(i?.operation===`burn_subtitles`)dn(`subtitle`);else{let t={transcode:`convert`,compress:`compress`,extract_audio:`audio`,trim:`trim`,mute:`mute`}[i?.operation];if(!t)throw Error(`这个方案暂不支持恢复编辑。`);yn(),dn(t),$(`conversion-resolution`).value=String(i.resolutionPreset||`source`),i.startMs!=null&&($(`trim-start`).value=String(i.startMs/1e3),$(`trim-end`).value=String((i.endMs??i.startMs??0)/1e3)),i.targetSizeBytes&&($(`compression-target`).value=String(i.targetSizeBytes/1024/1024)),pe=e.status===`READY`?e:null}if(pn(`edit`),Ht(),e.taskId){let i=await V(`/api/tasks/${e.taskId}`);u?.id===t&&F===n&&M?.id===r.id&&_r(i)}})}async function Tr(){let e=u?.id,t=F,n=ie,r=++oe;if(e)try{let i=await V(`/api/operation-plans?page=${n}&pageSize=10`);if(u?.id!==e||F!==t||r!==oe||n!==ie)return;if(n>1&&!i.items.length)return ie=Math.max(1,Math.ceil(i.total/10)),Tr();ae=i.total,$(`plan-total`).textContent=`${i.total} 个方案`,$(`plan-page`).textContent=String(n),$(`plan-list-empty`).hidden=!!i.items.length,H(`plan-list-error`,``),de.update({plans:i.items}),lt(),Ht()}catch(n){let i=Mx(n);if(u?.id!==e||F!==t||r!==oe)return;i.status===401?Ct():H(`plan-list-error`,i.message,!0)}}function Er(e){$(`history-tasks-slot`).hidden=e,$(`history-plans-panel`).hidden=!e,$(`history-tasks-tab`).setAttribute(`aria-selected`,String(!e)),$(`history-plans-tab`).setAttribute(`aria-selected`,String(e)),$(`history-tasks-tab`).tabIndex=e?-1:0,$(`history-plans-tab`).tabIndex=e?0:-1,e?Tr():Dr()}$(`history-tasks-tab`).addEventListener(`click`,()=>Er(!1)),$(`history-plans-tab`).addEventListener(`click`,()=>Er(!0)),document.querySelector(`.history-tabs`).addEventListener(`keydown`,e=>{if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;e.preventDefault();let t=e.key===`End`||e.key!==`Home`&&$(`history-plans-panel`).hidden;Er(t),$(t?`history-plans-tab`:`history-tasks-tab`).focus()}),$(`refresh-plans`).addEventListener(`click`,Tr),$(`plan-prev`).addEventListener(`click`,()=>{ie>1&&(ie--,Tr())}),$(`plan-next`).addEventListener(`click`,()=>{ie*10<ae&&(ie++,Tr())});async function Dr(){clearTimeout(P??void 0),P=null;let e=++se,t=u?.id,n=ne,r=F;if(t)try{let i=await V(`/api/tasks?page=${n}&pageSize=10`);if(u?.id!==t||ne!==n||F!==r||se!==e)return;if(n>1&&!i.items.length)return ne=Math.max(1,Math.ceil(i.total/10)),Dr();H(`task-list-error`,``),re=i.total,$(`task-total`).textContent=`${i.total} 个任务`,$(`task-page`).textContent=String(n),$(`task-list-empty`).hidden=i.items.length>0,de.update({tasks:i.items});let a=i.items.find(e=>e.id===N?.id);if(a)_r(a);else if(!N&&i.items.length)_r(i.items[0]);else if(N){let i=N.id,a;try{a=await V(`/api/tasks/${i}`)}catch(n){let i=Mx(n);if(u?.id!==t||F!==r||se!==e)return;if(i.status!==404)throw i;$t();return}if(u?.id!==t||N?.id!==i||ne!==n||F!==r||se!==e)return;_r(a)}lt(),Ht(),(i.items.some(pr)||pr(N))&&(P=setTimeout(Dr,2e3))}catch(i){let a=Mx(i);if(u?.id!==t||F!==r||ne!==n||se!==e)return;a.status===401?Ct():(H(`task-list-error`,a.message,!0),P=setTimeout(Dr,5e3))}}$(`conversion-form`).addEventListener(`submit`,e=>{e.preventDefault(),Et(`conversion-error`,async()=>{if(M?.status!==`READY`)throw Error(`当前素材尚未就绪。`);let e=M.id,t=$(`conversion-resolution`).value,n=Dn();if(ve===`trim`&&!n.valid)throw Error(`区间需至少0.5秒，且不超过素材时长。`);let r=ve===`trim`?{operation:`trim`,outputFormat:`mp4`,startMs:n.startMs,endMs:n.endMs,audioMode:`keep`}:ve===`extract_audio`?{operation:`extract_audio`,outputFormat:`mp3`}:ve===`mute`?{operation:`mute`,outputFormat:`mp4`,resolutionPreset:t}:{operation:ve,outputFormat:`mp4`,resolutionPreset:t,audioMode:`keep`};if(ve===`extract_audio`&&!M.metadata?.hasAudio)throw Error(`素材没有可提取的音轨。`);if(ve===`compress`&&(r.targetSizeBytes=Math.floor(Number($(`compression-target`).value)*1024*1024),!Number.isSafeInteger(r.targetSizeBytes)||r.targetSizeBytes<32768||r.targetSizeBytes>=M.sizeBytes))throw Error(`目标体积需至少32 KB，并小于原文件。`);(Sn()||me?.mediaId===e&&me.status===`READY`&&Cn(me.parameters,xn()))&&(r=xn());let i=u?.id,a=F;if(!pe||pe.mediaId!==e||!Cn(pe.parameters,r)){let t=r.operation===`export`?await wn(r):await V(`/api/operation-plans`,{method:`POST`,body:{mediaId:e,parameters:r}});if(!t||u?.id!==i||M?.id!==e||F!==a)return;pe=t}let o=await V(`/api/operation-plans/${pe.id}/execute`,{method:`POST`,body:{expectedVersion:pe.version}});u?.id===i&&M?.id===e&&F===a&&(me?.id===pe.id&&(me={...me,status:`EXECUTED`}),he=!1,mn(o),pe=null,ne=1,await Dr())})}),$(`cancel-task`).addEventListener(`click`,()=>Et(`task-error`,async()=>{N&&(_r(await V(`/api/tasks/${N.id}/cancel`,{method:`POST`})),await Dr())}));function Or(){$(`delete-output-dialog`).close(),Se=null}$(`delete-output`).addEventListener(`click`,()=>{let e=N?.outputs.find(e=>e.id===_e);!g&&e&&u&&(Se={id:e.id,owner:u.id},$(`delete-output-name`).textContent=e.filename,H(`delete-output-error`,``),$(`delete-output-dialog`).showModal(),$(`cancel-delete-output`).focus())}),$(`close-delete-output`).addEventListener(`click`,Or),$(`cancel-delete-output`).addEventListener(`click`,Or),$(`delete-output-dialog`).addEventListener(`cancel`,e=>{g?e.preventDefault():Se=null}),$(`delete-output-form`).addEventListener(`submit`,e=>{if(e.preventDefault(),g||!Se)return;let t=Se;Et(`delete-output-error`,async()=>{await V(`/api/outputs/${t.id}`,{method:`DELETE`}),u?.id===t.owner&&(F++,N&&_r({...N,outputs:N.outputs.filter(e=>e.id!==t.id)}),Or(),await Dr(),H(`account-notice`,`结果已删除，原素材和处理记录已保留。`),$(`refresh-tasks`).focus())})}),$(`refresh-tasks`).addEventListener(`click`,Dr),$(`task-prev`).addEventListener(`click`,()=>{ne>1&&(ne--,Dr())}),$(`task-next`).addEventListener(`click`,()=>{ne*10<re&&(ne++,Dr())}),it&&(it.onmessage=()=>{mt(!1),_t(!1),dt(),g||Tt()}),document.addEventListener(`visibilitychange`,()=>{!document.hidden&&!g&&d&&Tt()});async function kr(){yt(`loading-view`),bt(!0);try{d=await V(`/api/system/capabilities`),n.registrationAllowed=d.registration,await Tt()}catch(e){let t=Mx(e);$(`unavailable-message`).textContent=t.code===`HTTPS_REQUIRED`?at.HTTPS_REQUIRED:`服务暂时不可用，请稍后重试。`,yt(`unavailable-view`)}finally{bt(!1),lt()}}$(`history-tasks-slot`).append($(`task-section`)),$(`export-result-slot`).append($(`conversion-result`)),$(`editor-info-details`).open=!_.matches,$(`continue-editing`).addEventListener(`click`,()=>pn(`edit`)),$(`replace-source`).addEventListener(`click`,()=>pn(`import`)),$(`back-to-editing`).addEventListener(`click`,()=>pn(`edit`)),dn(`detect`),lt();let Ar=!1;setInterval(async()=>{if(!(!u||g||document.hidden||Ar)){Ar=!0;try{await qt()}finally{Ar=!1}}},1e4),kr()}return sT(),e.createRecordState=jC,e.existingPasswordIssue=jx,e.mountApplication=Yw,e.mountCloudSettings=qw,e.mountFindResults=Zw,e.mountHistory=MC,e.mountPlanDetails=Qw,e.mountSequenceEditors=ow,e.mountTranscriptEditors=bw,e.mountWorkspaceNavigation=Xw,e.newPasswordIssue=kx,e.startWorkbench=sT,e.textVendors=Sw,e.toolNames=vl,e.usernameIssue=Ax,e})({});