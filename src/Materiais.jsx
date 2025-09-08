import React from "react";

export default function Materiais() {
  const materiais = []; // plugue seu fetch aqui (PDFs, vídeos, links...)

  if (materiais.length === 0) {
    return (
      <div style={box}>
        <h3 style={title}>Nenhum material disponível ainda</h3>
        <p style={desc}>
          Quando o professor publicar os conteúdos, eles aparecerão aqui.
        </p>
        <button style={btn} onClick={() => alert("Materiais são publicados pelo professor por unidade/tópico.")}>
          Como funciona?
        </button>
      </div>
    );
  }

  return (
    <ul style={{display:"grid", gap:12}}>
      {materiais.map((m) => (
        <li key={m.id} style={card}>
          <small style={{color:"#64748b"}}>{m.type}</small>
          <div style={{fontWeight:600}}>{m.title}</div>
        </li>
      ))}
    </ul>
  );
}

const box  = {border:"1px solid #e2e8f0", borderRadius:16, background:"#fff", padding:24, textAlign:"center"};
const title= {margin:0, fontSize:18};
const desc = {marginTop:8, color:"#475569"};
const btn  = {marginTop:16, padding:"8px 12px", border:"1px solid #cbd5e1", background:"#f8fafc", borderRadius:12, cursor:"pointer"};
const card = {border:"1px solid #e2e8f0", borderRadius:16, background:"#fff", padding:16};
