import React from "react";

export default function Cronograma() {
  const eventos = []; // plugue seu fetch aqui (aulas, prazos, provas...)

  if (eventos.length === 0) {
    return (
      <div style={box}>
        <h3 style={title}>Sem eventos no cronograma</h3>
        <p style={desc}>
          O professor ainda não adicionou datas de aula, prazos de entrega ou avaliações.
        </p>
      </div>
    );
  }

  return (
    <div style={{border:"1px solid #e2e8f0", borderRadius:16, overflow:"hidden", background:"#fff"}}>
      {eventos.map((e) => (
        <div key={e.id} style={{display:"grid", gridTemplateColumns:"160px 1fr", gap:12, padding:16, borderTop:"1px solid #e2e8f0"}}>
          <time style={{fontWeight:600, color:"#0f172a"}}>{e.date}</time>
          <div>
            <small style={{color:"#64748b"}}>{e.type}</small>
            <div style={{fontWeight:600}}>{e.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const box  = {border:"1px solid #e2e8f0", borderRadius:16, background:"#fff", padding:24, textAlign:"center"};
const title= {margin:0, fontSize:18};
const desc = {marginTop:8, color:"#475569"};
