"use strict";(self.webpackChunkmoviemania=self.webpackChunkmoviemania||[]).push([[274],{8801:function(n,e,t){var r=t(2982),i=t(5861),o=t(885),s=t(4687),a=t.n(s),c=t(2791),u=t(7480);e.Z=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,e=arguments.length>1?arguments[1]:void 0,t=arguments.length>2?arguments[2]:void 0,s=(0,c.useState)([]),f=(0,o.Z)(s,2),l=f[0],h=f[1],v=(0,c.useState)(!1),d=(0,o.Z)(v,2),g=d[0],x=d[1],m=(0,c.useState)(!1),p=(0,o.Z)(m,2),Z=p[0],b=p[1],j=(0,c.useState)(null),w=(0,o.Z)(j,2),S=w[0],k=w[1],P=(0,c.useState)(null),C=(0,o.Z)(P,2),O=C[0],F=C[1],I=(0,c.useState)(!1),L=(0,o.Z)(I,2),N=L[0],R=L[1],Y=function(){h([])};return(0,c.useEffect)((function(){if(""!==t){x(!0);var o=function(){var o=(0,i.Z)(a().mark((function i(){var o,s;return a().wrap((function(i){for(;;)switch(i.prev=i.next){case 0:return i.prev=0,i.next=3,e(n,t);case 3:return o=i.sent,i.next=6,(0,u.Q2)();case 6:s=i.sent,k(s),h((function(n){return[].concat((0,r.Z)(n),(0,r.Z)(o))})),b(Boolean(o.length)),x(!1),R(!0),i.next=18;break;case 14:i.prev=14,i.t0=i.catch(0),console.warn(i.t0),F(i.t0);case 18:return i.prev=18,x(!1),i.finish(18);case 21:case"end":return i.stop()}}),i,null,[[0,14,18,21]])})));return function(){return o.apply(this,arguments)}}();o()}}),[e,n,t]),{isLoading:g,results:l,hasNextPage:Z,error:O,config:S,isFetched:N,handleSearchbarSubmit:Y}}},1801:function(n,e,t){function r(n){var e=n.movieCard,t=n.hasNextPage,r=n.isLoading,i=n.addPage,o=n.intObserver;r||(o.current&&o.current.disconnect(),e&&(o.current=new IntersectionObserver((function(n){n[0].isIntersecting&&t&&i()})),o.current.observe(e)))}t.d(e,{X:function(){return r}})},2810:function(n,e,t){t.d(e,{Z:function(){return v}});var r,i,o=t(885),s=t(2791),a=t(1213),c=t(168),u=t(6444),f=(0,u.F4)(r||(r=(0,c.Z)(["\n  0% {\n    transform: translateY(30%);\n  }\n  50% {\n    transform: translateY(0%);\n  }\n  100% {\n    transform: translateY(30%);\n  }\n"]))),l=u.ZP.a(i||(i=(0,c.Z)(["\n  position: fixed;\n  bottom: ","px;\n  right: ","px;\n  text-decoration: none;\n  color: ",";\n  animation: "," 2s ease-in-out infinite;\n  :hover {\n    color: ",";\n  }\n\n  svg {\n    width: 60px;\n    height: auto;\n  }\n"])),(function(n){return n.theme.space[5]}),(function(n){return n.theme.space[5]}),(function(n){return n.theme.colors.accent}),f,(function(n){return n.theme.colors.accentText})),h=t(184);var v=function(n){var e=n.firstElRef,t=(0,s.useState)(!1),r=(0,o.Z)(t,2),i=r[0],c=r[1],u=new IntersectionObserver((function(n){n[0].isIntersecting?c(!1):c(!0)}),{root:null,threshold:[0]});return e.current&&u.observe(e.current),i&&(0,h.jsx)(l,{href:"#top",children:(0,h.jsx)(a.GYO,{})})}},5274:function(n,e,t){t.r(e),t.d(e,{default:function(){return d}});var r=t(885),i=t(8801),o=t(3409),s=t(2791),a=t(8954),c=t(7480),u=t(4139),f=t(2810),l=t(8963),h=t(1801),v=t(184),d=function(){var n=(0,s.useState)(1),e=(0,r.Z)(n,2),t=e[0],d=e[1],g=(0,i.Z)(t,c.AW),x=g.isLoading,m=g.results,p=g.hasNextPage,Z=g.error,b=g.config,j=function(){d((function(n){return n+1}))},w=(0,s.useRef)(),S=(0,s.useRef)(),k=(0,s.useCallback)((function(n){var e={movieCard:n,hasNextPage:p,isLoading:x,addPage:j,intObserver:w};(0,h.X)(e)}),[x,p]),P=m.map((function(n,e){return m.length===e+1?(0,v.jsx)(o.Z,{ref:k,movie:n,config:b},n.id):1===e?(0,v.jsx)(o.Z,{ref:S,movie:n,config:b},n.id):(0,v.jsx)(o.Z,{movie:n,config:b},n.id)}));return(0,v.jsxs)(v.Fragment,{children:[Z&&(0,v.jsxs)(l.x,{p:"16px",color:"white",children:["Whoops, something went wrong: ",Z.message]}),m.length>0&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u.aV,{children:P}),(0,v.jsx)(f.Z,{firstElRef:S})]}),x&&(0,v.jsx)(a.Z,{})]})}}}]);
//# sourceMappingURL=274.83b4360d.chunk.js.map