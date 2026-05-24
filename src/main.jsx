import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Inject global CSS (same design tokens as landing page)
const style = document.createElement('style')
style.textContent = `
  :root {
    --sage:#7d9b6e;--sage-l:#b8cdb0;--sage-p:#eef3eb;
    --cream:#f8f5f0;--warm:#fdfcfa;--ink:#1e1e1a;--muted:#7a7971;
    --bd:rgba(125,155,110,0.18);--acc:#4e7a3e;
    --gold:#c9a84c;--terra:#c4714a;--r:14px;
    --sh:0 20px 60px rgba(30,30,26,0.08);
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{font-family:'Sora',sans-serif;background:var(--warm);color:var(--ink);font-weight:300;overflow-x:hidden;}

  /* Tool left/right panels */
  .tool-left{overflow-y:auto;border-right:1px solid var(--bd);display:flex;flex-direction:column;}
  .tool-left::-webkit-scrollbar{width:3px;}
  .tool-left::-webkit-scrollbar-thumb{background:var(--sage-l);border-radius:2px;}
  .tool-right{overflow-y:auto;padding:1.4rem 1.8rem;display:flex;flex-direction:column;gap:1rem;}
  .tool-right::-webkit-scrollbar{width:3px;}
  .tool-right::-webkit-scrollbar-thumb{background:var(--sage-l);border-radius:2px;}

  /* Income */
  .income-section{padding:1.2rem 1.4rem;border-bottom:1px solid var(--bd);}
  .inc-block{border:1px solid var(--bd);border-radius:10px;overflow:hidden;background:white;}
  .inc-hdr{display:flex;align-items:center;gap:.6rem;padding:.7rem .9rem;cursor:pointer;user-select:none;transition:background .15s;}
  .inc-hdr:hover,.inc-hdr.open{background:var(--sage-p);}
  .inc-hdr .cat-chev{font-size:.6rem;color:var(--muted);transition:transform .2s;margin-left:auto;}
  .inc-hdr.open .cat-chev{transform:rotate(180deg);}
  .inc-body{padding:.4rem .7rem .7rem;background:var(--cream);}
  .inc-total-big{font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:300;color:var(--acc);margin-right:.5rem;}

  /* Categories */
  .cats-section{padding:.7rem .8rem;flex:1;}
  .section-lbl{font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.5rem;padding:0 .2rem;}
  .cat-block{border:1px solid var(--bd);border-radius:10px;overflow:hidden;margin-bottom:.45rem;background:white;}
  .cat-hdr{display:flex;align-items:center;gap:.6rem;padding:.65rem .9rem;cursor:pointer;user-select:none;transition:background .15s;}
  .cat-hdr:hover,.cat-hdr.open{background:var(--sage-p);}
  .cat-emoji{font-size:.9rem;}
  .cat-name-txt{font-size:.8rem;font-weight:500;flex:1;color:var(--ink);}
  .cat-total-lbl{font-family:'Cormorant Garamond',serif;font-size:.9rem;color:var(--muted);transition:color .2s;}
  .cat-total-lbl.has-val{color:var(--ink);}
  .cat-chev{font-size:.6rem;color:var(--muted);transition:transform .2s;}
  .cat-hdr.open .cat-chev{transform:rotate(180deg);}
  .cat-body{padding:.3rem .6rem .6rem;background:var(--cream);}
  .col-hdr-row{display:flex;justify-content:flex-end;gap:.35rem;padding-bottom:.3rem;border-bottom:1px solid var(--bd);margin-bottom:.3rem;}
  .col-hdr-lbl{font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:center;}
  .sub-row{display:flex;align-items:center;padding:.28rem .22rem;border-radius:6px;gap:.45rem;transition:background .12s;}
  .sub-row:hover{background:white;}
  .sub-row.fx-row{background:rgba(238,243,235,.5);}
  .sub-lbl{font-size:.74rem;color:var(--muted);flex:1;}
  .sub-inputs{display:flex;gap:.28rem;align-items:center;}
  .inp-box{display:flex;align-items:center;gap:.15rem;background:white;border:1px solid var(--bd);border-radius:6px;padding:.22rem .45rem;width:74px;transition:border-color .2s;}
  .inp-box:focus-within{border-color:var(--sage);}
  .inp-sym{font-size:.62rem;color:var(--muted);}
  .inp-num{width:50px;border:none;outline:none;font-family:'Sora',sans-serif;font-size:.76rem;color:var(--ink);background:transparent;text-align:right;}
  .inp-num::placeholder{color:var(--sage-l);}

  /* Repeat toggle */
  .repeat-tog{display:flex;align-items:center;gap:2px;cursor:pointer;padding:.18rem .5rem;border-radius:2rem;border:1px solid var(--bd);background:white;transition:all .18s;flex-shrink:0;white-space:nowrap;}
  .repeat-tog:hover{border-color:var(--sage-l);background:var(--sage-p);}
  .repeat-tog.on{background:var(--sage-p);border-color:var(--sage-l);}
  .repeat-ico{font-size:.72rem;color:var(--muted);}
  .repeat-tog.on .repeat-ico{color:var(--acc);}
  .repeat-txt{font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);}
  .repeat-tog.on .repeat-txt{color:var(--acc);}

  /* Goals */
  .goals-section{padding:.7rem .8rem;border-top:1px solid var(--bd);}
  .goals-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;padding:0 .2rem;}
  .goals-hdr-title{font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}
  .gadd-btns{display:flex;gap:.3rem;}
  .gadd-btn{background:white;border:1px solid var(--bd);border-radius:2rem;padding:.25rem .7rem;font-family:'Sora',sans-serif;font-size:.65rem;color:var(--ink);cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:.22rem;}
  .gadd-btn:hover{border-color:var(--sage);background:var(--sage-p);color:var(--acc);}
  .gadd-btn.bnpl-add:hover{border-color:#9b7ab5;background:#f5f0fa;color:#6b4a8a;}
  .gadd-btn.debt-add:hover{border-color:var(--terra);background:#fff5f2;color:var(--terra);}
  .goals-list{display:flex;flex-direction:column;gap:.45rem;}
  .goal-card{background:white;border:1px solid var(--bd);border-radius:10px;padding:.75rem .9rem;}
  .goal-card.debt-card{border-left:3px solid var(--terra);}
  .goal-card.bnpl-card{border-left:3px solid #9b7ab5;}
  .goal-card.locked-card{opacity:.5;pointer-events:none;background:var(--cream);}
  .goal-card-top{display:flex;align-items:center;gap:.5rem;margin-bottom:.55rem;}
  .goal-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
  .goal-type-lbl{font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);flex:1;}
  .goal-type-lbl.debt-lbl{color:var(--terra);}
  .goal-type-lbl.bnpl-lbl{color:#9b7ab5;}
  .goal-del{background:none;border:none;color:var(--muted);cursor:pointer;font-size:.78rem;padding:.12rem;transition:color .18s;line-height:1;}
  .goal-del:hover{color:var(--terra);}
  .goal-name-inp{border:1px solid var(--bd);border-radius:7px;padding:.34rem .55rem;font-family:'Sora',sans-serif;font-size:.76rem;color:var(--ink);background:var(--cream);outline:none;width:100%;margin-bottom:.45rem;transition:border-color .2s;}
  .goal-name-inp:focus{border-color:var(--sage);background:white;}
  .goal-row2{display:grid;grid-template-columns:1fr 1fr;gap:.38rem;margin-bottom:.38rem;}
  .goal-field{display:flex;flex-direction:column;gap:.2rem;}
  .goal-field-lbl{font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);}
  .goal-inp{border:1px solid var(--bd);border-radius:7px;padding:.32rem .5rem;font-family:'Sora',sans-serif;font-size:.76rem;color:var(--ink);background:var(--cream);outline:none;width:100%;transition:border-color .2s;}
  .goal-inp:focus{border-color:var(--sage);background:white;}
  .goal-date-row{display:flex;gap:.28rem;}
  .goal-mo-sel,.goal-yr-sel{flex:1;border:1px solid var(--bd);border-radius:7px;padding:.3rem .28rem;font-family:'Sora',sans-serif;font-size:.7rem;color:var(--ink);background:var(--cream);outline:none;cursor:pointer;}
  .goal-mo-sel:focus,.goal-yr-sel:focus{border-color:var(--sage);background:white;}
  .deadline-pill{display:inline-flex;align-items:center;gap:4px;padding:.25rem .7rem;border-radius:2rem;border:1px solid var(--bd);background:white;cursor:pointer;font-family:'Sora',sans-serif;font-size:.65rem;color:var(--muted);transition:all .2s;margin-bottom:.45rem;user-select:none;}
  .deadline-pill:hover{border-color:var(--sage-l);background:var(--sage-p);}
  .deadline-pill.on{background:var(--sage-p);border-color:var(--sage-l);color:var(--acc);}
  .dp-ico{font-size:.8rem;}
  .deadline-fields{display:none;}
  .deadline-fields.show{display:grid;grid-template-columns:1fr 1fr;gap:.38rem;}
  .bnpl-fields{display:flex;flex-direction:column;gap:.38rem;}
  .bnpl-row{display:grid;grid-template-columns:1fr 1fr;gap:.38rem;}
  .bnpl-calc{background:var(--sage-p);border-radius:7px;padding:.32rem .55rem;font-size:.68rem;color:var(--acc);line-height:1.5;}
  .bnpl-calc.warn{background:#fff5f2;color:var(--terra);}
  .goal-calc{background:var(--sage-p);border-radius:7px;padding:.32rem .55rem;font-size:.68rem;color:var(--acc);line-height:1.5;}
  .goal-calc.neutral{background:var(--cream);color:var(--muted);}
  .info-note{background:var(--sage-p);border:1px solid var(--sage-l);border-radius:9px;padding:.6rem .9rem;font-size:.7rem;color:var(--acc);line-height:1.6;display:flex;gap:.5rem;align-items:flex-start;margin:.5rem 0 .2rem;}

  /* Summary */
  .summary-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;}
  .sum-card{background:white;border:1px solid var(--bd);border-radius:12px;padding:.9rem .8rem;text-align:center;position:relative;overflow:hidden;}
  .sum-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2.5px;}
  .sum-card.inc::after{background:var(--sage);}
  .sum-card.exp::after{background:var(--terra);}
  .sum-card.gls::after{background:var(--gold);}
  .sum-card.lft::after{background:var(--acc);}
  .sum-lbl{font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.38rem;}
  .sum-val{font-family:'Cormorant Garamond',serif;font-size:1.75rem;font-weight:300;display:block;line-height:1;transition:all .25s;}
  .sum-val.g{color:var(--acc);}
  .sum-val.r{color:var(--terra);}
  .sum-val.gold{color:var(--gold);}
  .sum-note{font-size:.56rem;color:var(--muted);margin-top:.22rem;display:block;}

  /* Daily */
  .daily-card{background:var(--ink);border-radius:12px;padding:1.1rem 1.4rem;color:white;display:flex;align-items:center;justify-content:space-between;gap:1rem;}
  .daily-left h3{font-family:'Cormorant Garamond',serif;font-size:.82rem;font-weight:300;opacity:.4;margin-bottom:.18rem;}
  .daily-num{font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:300;line-height:1;transition:all .25s;}
  .daily-sub{font-size:.6rem;opacity:.28;margin-top:.18rem;}
  .ring-wrap{position:relative;width:64px;height:64px;flex-shrink:0;}
  .ring-bg{fill:none;stroke:rgba(255,255,255,.08);stroke-width:5;}
  .ring-arc{fill:none;stroke:var(--sage-l);stroke-width:5;stroke-linecap:round;}
  .ring-lbl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:.52rem;opacity:.38;letter-spacing:.06em;text-transform:uppercase;}

  /* Section title */
  .sec-ttl{font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:.5rem;}
  .sec-ttl::after{content:'';flex:1;height:1px;background:var(--bd);}

  /* Goal progress */
  .gp-item{background:white;border:1px solid var(--bd);border-radius:10px;padding:.8rem .95rem;}
  .gp-item.debt-p{border-left:3px solid var(--terra);}
  .gp-item.bnpl-p{border-left:3px solid #9b7ab5;}
  .gp-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.42rem;}
  .gp-name{font-size:.76rem;font-weight:500;color:var(--ink);display:flex;align-items:center;gap:.42rem;}
  .gp-meta{font-size:.63rem;color:var(--muted);}
  .gp-track{height:6px;background:var(--sage-p);border-radius:3px;overflow:hidden;}
  .gp-fill{height:100%;border-radius:3px;transition:width .7s ease;}
  .gp-bottom{display:flex;justify-content:space-between;margin-top:.32rem;font-size:.63rem;color:var(--muted);}
  .gp-bottom .on{color:var(--acc);font-weight:500;}
  .gp-bottom .debt-on{color:var(--terra);font-weight:500;}
  .gp-bottom .bnpl-on{color:#9b7ab5;font-weight:500;}

  /* Charts */
  .chart-row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;}
  .chart-card{background:white;border:1px solid var(--bd);border-radius:12px;padding:1rem;}
  .chart-card-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:.85rem;}
  .chart-title{font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
  .chart-toggle{display:flex;gap:.3rem;}
  .ct-btn{font-size:.6rem;padding:.18rem .55rem;border-radius:1rem;border:1px solid var(--bd);background:white;color:var(--muted);cursor:pointer;font-family:'Sora',sans-serif;transition:all .15s;}
  .ct-btn.active{background:var(--sage-p);border-color:var(--sage-l);color:var(--acc);}
  .donut-wrap{display:flex;align-items:center;gap:.9rem;}
  .donut-svg-wrap{position:relative;width:96px;height:96px;flex-shrink:0;}
  .donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
  .donut-center-v{font-family:'Cormorant Garamond',serif;font-size:.95rem;}
  .donut-center-l{font-size:.5rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;}
  .donut-legend{flex:1;display:flex;flex-direction:column;gap:.34rem;}
  .leg-item{display:flex;align-items:center;gap:.38rem;font-size:.65rem;}
  .leg-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
  .leg-name{flex:1;color:var(--muted);}
  .leg-val{font-weight:500;}
  .leg-pct{color:var(--muted);font-size:.58rem;}
  .bar-chart-wrap{display:flex;flex-direction:column;gap:.6rem;}
  .bar-row{display:flex;flex-direction:column;gap:.18rem;}
  .bar-row-top{display:flex;justify-content:space-between;font-size:.65rem;}
  .bar-row-nm{color:var(--muted);}
  .bar-row-val{font-weight:500;}
  .bar-track{height:7px;background:var(--sage-p);border-radius:4px;overflow:hidden;}
  .bar-fill{height:100%;border-radius:4px;transition:width .7s ease;}
  .empty-chart{text-align:center;padding:1.4rem;color:var(--muted);font-size:.75rem;}
  .empty-chart span{font-size:1.6rem;display:block;margin-bottom:.38rem;opacity:.3;}

  /* Flip cards */
  .flip-card{cursor:pointer;border-radius:10px;transition:transform .2s ease,box-shadow .2s ease;position:relative;}
  .flip-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(30,30,26,.1);}
  .flip-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--sage-p);border:1px solid var(--sage-l);font-size:.7rem;margin-left:4px;transition:transform .4s ease;flex-shrink:0;}
  .flip-card:hover .flip-icon{transform:rotateY(180deg);}
  .flip-card.flipped .flip-icon{transform:rotateY(180deg);}
  .flip-card .flip-hint{font-size:.58rem;color:var(--muted);letter-spacing:.06em;margin-top:.5rem;opacity:.75;display:flex;align-items:center;justify-content:flex-end;gap:.35rem;}
  .flip-card .flip-hint::before{content:'';flex:1;height:.5px;background:var(--bd);}
  .flip-back{display:none;background:var(--cream);border-radius:10px;padding:.9rem 1rem;animation:fbIn .2s ease;}
  @keyframes fbIn{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:none}}
  .flip-card.flipped .flip-front{display:none;}
  .flip-card.flipped .flip-back{display:block;}
  .fb-title{font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem;}
  .fb-row{display:flex;justify-content:space-between;align-items:center;padding:.28rem 0;border-bottom:.5px solid var(--bd);font-size:.73rem;}
  .fb-row:last-child{border-bottom:none;}
  .fb-nm{color:var(--muted);display:flex;align-items:center;gap:.38rem;}
  .fb-val{font-weight:500;color:var(--ink);}
  .fb-obs{background:var(--sage-p);border-radius:7px;padding:.5rem .65rem;font-size:.7rem;color:var(--acc);line-height:1.55;margin-top:.6rem;}

  /* Suggestions */
  .sugs-wrap{display:flex;flex-direction:column;gap:.45rem;}
  .sug{border-radius:10px;padding:.8rem .95rem;display:flex;align-items:flex-start;gap:.7rem;border:1px solid;cursor:pointer;transition:all .2s;}
  .sug.ok{background:#f2f8f0;border-color:#b8d4b0;}
  .sug.cut{background:#fff5f2;border-color:#f0c4b8;}
  .sug.info{background:#f0f4f8;border-color:#b8ccdc;}
  .sug.warn{background:#fdf8ec;border-color:#e8d8a0;}
  .sug-ico{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;flex-shrink:0;}
  .sug.ok .sug-ico{background:#dcefd8;}
  .sug.cut .sug-ico{background:#fce8e2;}
  .sug.info .sug-ico{background:#dce8f0;}
  .sug.warn .sug-ico{background:#f3eccc;}
  .sug-tag{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:.15rem;}
  .sug.ok .sug-tag{color:#2a6020;}.sug.cut .sug-tag{color:#a04030;}.sug.info .sug-tag{color:#2a4a60;}.sug.warn .sug-tag{color:#7a5820;}
  .sug-text{font-size:.72rem;line-height:1.6;}
  .sug.ok .sug-text{color:#3B6D11;}.sug.cut .sug-text{color:#8a3020;}.sug.info .sug-text{color:#2a4a60;}.sug.warn .sug-text{color:#7a5820;}
  .sug-action{display:none;margin-top:.45rem;padding:.4rem .55rem;border-radius:7px;font-size:.69rem;line-height:1.55;border-left:2px solid;font-style:italic;}
  .sug.ok .sug-action{border-color:var(--sage);color:var(--acc);background:rgba(255,255,255,.6);}
  .sug.cut .sug-action{border-color:var(--terra);color:#8a3020;background:rgba(255,255,255,.6);}
  .sug.info .sug-action{border-color:#5a7fa0;color:#2a4a60;background:rgba(255,255,255,.6);}
  .sug.warn .sug-action{border-color:var(--gold);color:#7a5820;background:rgba(255,255,255,.6);}
  .sug.expanded .sug-action{display:block;}
  .sug-hint{font-size:.56rem;color:var(--muted);margin-top:.25rem;opacity:.55;}

  /* Pro nudge */
  .pro-nudge{background:var(--cream);border:1.5px dashed var(--sage-l);border-radius:12px;padding:1rem;text-align:center;}
  .pro-nudge h4{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:400;margin-bottom:.28rem;}
  .pro-nudge p{font-size:.7rem;color:var(--muted);line-height:1.6;margin-bottom:.75rem;}
  .btn-pro{background:var(--sage);color:white;border:none;padding:.52rem 1.2rem;border-radius:2rem;font-family:'Sora',sans-serif;font-size:.7rem;cursor:pointer;transition:background .2s;letter-spacing:.06em;}
  .btn-pro:hover{background:var(--acc);}

  /* Savings calc */
  .calc-card{background:white;border:1px solid var(--bd);border-radius:12px;padding:1.1rem;}
  .calc-card h3{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:400;margin-bottom:.22rem;}
  .calc-card p{font-size:.7rem;color:var(--muted);margin-bottom:1rem;line-height:1.6;}
  .calc-inputs{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem;margin-bottom:.85rem;}
  .ci{background:var(--cream);border:1px solid var(--bd);border-radius:8px;padding:.6rem .8rem;}
  .ci label{font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.26rem;}
  .ci-row{display:flex;align-items:center;gap:.22rem;}
  .ci-row span{font-size:.65rem;color:var(--muted);}
  .ci-row input{border:none;outline:none;font-family:'Sora',sans-serif;font-size:.85rem;color:var(--ink);width:100%;background:transparent;}
  .calc-out{background:var(--ink);border-radius:8px;padding:1rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;text-align:center;}
  .co-lbl{font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;opacity:.35;display:block;margin-bottom:.26rem;}
  .co-val{font-family:'Cormorant Garamond',serif;font-size:1.45rem;font-weight:300;color:white;display:block;}
  .co-val.g{color:#a8d5a0;}
  .calc-note{font-size:.65rem;color:var(--muted);margin-top:.5rem;text-align:center;line-height:1.5;}

  /* Responsive */
  @media(max-width:900px){
    .summary-cards{grid-template-columns:1fr 1fr;}
    .chart-row{grid-template-columns:1fr;}
    .calc-inputs{grid-template-columns:1fr;}
  }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
