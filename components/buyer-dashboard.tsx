"use client";

import {
  Building2,
  ChevronRight,
  CircleCheck,
  Database,
  ExternalLink,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { calculateBuyerScore, scoreBand } from "@/lib/scoring";
import { seedCompanies } from "@/lib/seed-companies";
import type { BuyerSegment, Company } from "@/lib/types";

const segmentLabels: Record<BuyerSegment, string> = {
  processor: "Industria",
  catering: "Catering",
  distributor: "Distribuidor",
  retail: "Retail",
  restaurant: "Gastronomía",
};

const scoreLabels = {
  potatoEvidence: "Evidencia de uso",
  volume: "Volumen potencial",
  buyerType: "Tipo de comprador",
  distance: "Distancia logística",
  companySize: "Tamaño",
  contactability: "Contactabilidad",
} as const;

export function BuyerDashboard() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<BuyerSegment | "all">("all");
  const [selected, setSelected] = useState<Company | null>(seedCompanies[0]);

  const companies = useMemo(() => {
    return seedCompanies
      .filter((company) => segment === "all" || company.segment === segment)
      .filter((company) =>
        `${company.commercialName} ${company.legalName ?? ""} ${company.city}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
      .sort((a, b) => calculateBuyerScore(b).total - calculateBuyerScore(a).total);
  }, [search, segment]);

  const highPriority = seedCompanies.filter((company) => calculateBuyerScore(company).total >= 75).length;
  const withEvidence = seedCompanies.filter((company) => company.evidence.length > 0).length;
  const verified = seedCompanies.filter((company) => company.verificationStatus === "verified").length;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <div><strong>AgroBuyer</strong><span>Intelligence</span></div>
        </div>

        <nav aria-label="Navegación principal">
          <a className="nav-item active" href="#buyers"><Database size={18} /> Compradores</a>
          <a className="nav-item" href="#search"><Search size={18} /> Búsquedas</a>
          <a className="nav-item muted" href="#sources"><ShieldCheck size={18} /> Fuentes <small>Próximamente</small></a>
        </nav>

        <div className="sprint-card">
          <span>Sprint 01</span>
          <strong>Motor de inteligencia</strong>
          <p>Datos iniciales, evidencia y scoring determinista.</p>
          <div className="progress"><i /></div>
          <small>Base del MVP</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Córdoba · Argentina</p>
            <h1>Compradores potenciales de papa</h1>
          </div>
          <button className="primary-button"><Search size={17} /> Nueva búsqueda</button>
        </header>

        <section className="metrics" aria-label="Resumen">
          <Metric label="Empresas iniciales" value={seedCompanies.length} detail="dataset de validación" />
          <Metric label="Con evidencia" value={withEvidence} detail={`${Math.round((withEvidence / seedCompanies.length) * 100)}% del dataset`} accent />
          <Metric label="Prioridad alta" value={highPriority} detail="Buyer Score ≥ 75" />
          <Metric label="Verificadas" value={verified} detail="revisión humana completa" />
        </section>

        <section className="workspace" id="buyers">
          <div className="list-panel">
            <div className="toolbar">
              <label className="search-box">
                <Search size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa o ciudad" />
                {search && <button onClick={() => setSearch("")} aria-label="Limpiar búsqueda"><X size={15} /></button>}
              </label>
              <label className="select-box">
                <Filter size={16} />
                <select value={segment} onChange={(event) => setSegment(event.target.value as BuyerSegment | "all")}>
                  <option value="all">Todos los segmentos</option>
                  {Object.entries(segmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            <div className="table-header">
              <span>Empresa</span><span>Segmento</span><span>Distancia</span><span>Score</span><span />
            </div>
            <div className="company-list">
              {companies.map((company) => {
                const score = calculateBuyerScore(company);
                return (
                  <button
                    className={`company-row ${selected?.id === company.id ? "selected" : ""}`}
                    key={company.id}
                    onClick={() => setSelected(company)}
                  >
                    <span className="company-cell">
                      <i className={`status-dot ${company.verificationStatus}`} />
                      <span><strong>{company.commercialName}</strong><small>{company.city}, {company.province}</small></span>
                    </span>
                    <span><b className="segment-pill">{segmentLabels[company.segment]}</b></span>
                    <span className="distance"><MapPin size={14} /> {company.distanceKm} km</span>
                    <span><b className={`score score-${scoreBand(score.total).toLowerCase()}`}>{score.total}</b></span>
                    <ChevronRight size={17} className="chevron" />
                  </button>
                );
              })}
              {companies.length === 0 && <div className="empty">No hay empresas que coincidan con los filtros.</div>}
            </div>
            <footer className="legend">
              <span><i className="status-dot verified" /> Verificada</span>
              <span><i className="status-dot partial" /> Parcial</span>
              <span><i className="status-dot needs_review" /> Por revisar</span>
            </footer>
          </div>

          {selected && <CompanyDetail company={selected} />}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, detail, accent = false }: { label: string; value: number; detail: string; accent?: boolean }) {
  return <article className={`metric-card ${accent ? "accent" : ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function CompanyDetail({ company }: { company: Company }) {
  const score = calculateBuyerScore(company);
  const components = Object.entries(score).filter(([key]) => key !== "total") as [keyof typeof scoreLabels, number][];

  return (
    <aside className="detail-panel">
      <div className="detail-heading">
        <div className="company-icon"><Building2 size={22} /></div>
        <div><p>{segmentLabels[company.segment]}</p><h2>{company.commercialName}</h2></div>
        <div className={`hero-score score-${scoreBand(score.total).toLowerCase()}`}><strong>{score.total}</strong><span>/100</span></div>
      </div>

      <div className="identity-grid">
        <div><span>Razón social</span><strong>{company.legalName ?? "Pendiente"}</strong></div>
        <div><span>CUIT</span><strong>{company.cuit ?? "Pendiente"}</strong></div>
        <div><span>Ubicación</span><strong>{company.city}, {company.province}</strong></div>
        <div><span>Estado</span><strong className="verification"><i className={`status-dot ${company.verificationStatus}`} /> {statusLabel(company.verificationStatus)}</strong></div>
      </div>

      <section className="detail-section">
        <div className="section-title"><h3>Desglose del Buyer Score</h3><span>Reglas v1</span></div>
        <div className="score-list">
          {components.map(([key, points]) => {
            const maximums = { potatoEvidence: 30, volume: 20, buyerType: 15, distance: 15, companySize: 10, contactability: 10 };
            return <div key={key}><span>{scoreLabels[key]}</span><i><b style={{ width: `${(points / maximums[key]) * 100}%` }} /></i><strong>{points}/{maximums[key]}</strong></div>;
          })}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-title"><h3>Evidencia</h3><span>{company.evidence.length} fuente{company.evidence.length === 1 ? "" : "s"}</span></div>
        {company.evidence.length ? company.evidence.map((evidence) => (
          <article className="evidence-card" key={evidence.sourceUrl}>
            <CircleCheck size={18} />
            <div><strong>{evidence.claim}</strong><p>{evidence.excerpt}</p><a href={evidence.sourceUrl} target="_blank" rel="noreferrer">{evidence.sourceName} <ExternalLink size={12} /></a></div>
            <b>{Math.round(evidence.confidence * 100)}%</b>
          </article>
        )) : <div className="evidence-empty">Todavía no hay evidencia suficiente. No debe tratarse como comprador validado.</div>}
      </section>
    </aside>
  );
}

function statusLabel(status: Company["verificationStatus"]) {
  return { verified: "Verificada", partial: "Validación parcial", needs_review: "Revisión pendiente" }[status];
}
