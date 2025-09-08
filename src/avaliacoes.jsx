import React from "react";

export default function Avaliacoes() {
  const avaliacoes = []; // plugue seu fetch aqui (prova, atividade, quiz...)

  if (avaliacoes.length === 0) {
    return (
      <div style={box}>
        <h3 style={title}>Nada por aqui (ainda)</h3>
        <p style={desc}>
          Assim que houver uma avaliação, ela aparecerá com prazo e status.
        </p>
      </div>
    );
  }

  return (
    <ul style={{display:"grid", gap:12}}>
      {avaliacoes.map((a) => (
        <li key={a.id} style={row}>
          <div>
            <div style={{fontWeight:600}}>{a.title}</div>
            <small style={{color:"#64748b"}}>Status: {a.status}</small>
          </div>
          <button style={btn}>Acessar</button>
        </li>
      ))}
    </ul>
  );
}

const box  = {border:"1px solid #e2e8f0", borderRadius:16, background:"#fff", padding:24, textAlign:"center"};
const title= {margin:0, fontSize:18};
const desc = {marginTop:8, color:"#475569"};
const btn  = {padding:"8px 12px", border:"1px solid #cbd5e1", background:"#f8fafc", borderRadius:12, cursor:"pointer"};
const row  = {display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid #e2e8f0", borderRadius:16, background:"#fff", padding:16};
