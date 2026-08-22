"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Pencil, Plus, X } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { EmptyState, Eyebrow, Metric, Panel, ProgressBar } from "@/components/ui";
import { currencies, currencyOf, formatMoney } from "@/lib/money";
import { totals } from "@/lib/metrics";
import type { Client, Currency, Project } from "@/lib/types";

const id = () => crypto.randomUUID();
const clientStatuses = ["Lead", "Contacted", "Replied", "Discovery", "Proposal", "Negotiating", "Closed Won", "Closed Lost", "Active Client", "Completed"];
const projectStages = ["PLANNING", "DESIGN", "BUILDING", "REVIEW", "LIVE", "COMPLETE", "PAUSED"];
const projectPriorities = ["Low", "Medium", "High", "Critical"];
const formCurrency = (formData: FormData): Currency => formData.get("currency") === "EUR" ? "EUR" : "GBP";

function CurrencySelect({ name = "currency", defaultValue, value, onChange }: { name?: string; defaultValue?: Currency; value?: Currency; onChange?: (currency: Currency) => void }) {
  return (
    <select
      name={name}
      defaultValue={value ? undefined : defaultValue}
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value as Currency) : undefined}
      aria-label="Currency"
    >
      {currencies.map((currency) => <option value={currency} key={currency}>{currency === "GBP" ? "£ Pounds (GBP)" : "€ Euros (EUR)"}</option>)}
    </select>
  );
}

function Page({ title, eyebrow, sub, children }: { title: string; eyebrow: string; sub: string; children: React.ReactNode }) {
  return <div className="page module-page"><header className="page-title"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{sub}</p></div></header>{children}</div>;
}

export function BusinessHQ() {
  const { data } = useApp();
  const [currency, setCurrency] = useState<Currency>(data.settings.currency);
  const money = totals(data, currency);
  const funnel = data.dailyLogs.reduce((result, log) => ({
    sent: result.sent + log.outreach.sent,
    responses: result.responses + log.outreach.responses,
    meetings: result.meetings + log.outreach.meetings,
    proposals: result.proposals + log.outreach.proposals,
    closed: result.closed + log.outreach.closed,
  }), { sent: 0, responses: 0, meetings: 0, proposals: 0, closed: 0 });
  return (
    <Page title="BUSINESS HQ" eyebrow="CEO VIEW" sub="Use this page to review revenue, clients, projects, and the point where your sales pipeline needs attention.">
      <div className="currency-toolbar">
        <label>Financial view<CurrencySelect value={currency} onChange={setCurrency} /></label>
        <small>GBP and EUR totals stay separate—no automatic exchange rate is applied.</small>
      </div>
      <div className="metric-grid wide">
        <Metric label={`Revenue · ${currency}`} value={formatMoney(money.income, currency)} accent />
        <Metric label={`Outstanding · ${currency}`} value={formatMoney(money.outstanding, currency)} />
        <Metric label="Active clients" value={data.clients.filter((client) => client.status === "Active Client").length} />
        <Metric label="Projects live" value={data.projects.filter((project) => project.stage === "LIVE").length} />
      </div>
      <div className="two-col">
        <Panel>
          <Eyebrow>PIPELINE</Eyebrow><h3>From contact to client</h3>
          <div className="funnel">{Object.entries(funnel).map(([key, value], index) => <div key={key} style={{ width: `${100 - index * 11}%` }}><span>{key}</span><strong>{value}</strong></div>)}</div>
        </Panel>
        <Panel>
          <Eyebrow>THIS WEEK’S OBJECTIVE</Eyebrow><h3>Main bottleneck</h3>
          <p className="large-copy">{funnel.sent === 0 ? "The pipeline needs its first conversations." : funnel.responses === 0 ? "Outreach is moving; the message needs a response." : "Keep qualified prospects moving to a clear next step."}</p>
          <button className="button">Start business focus block <ArrowUpRight /></button>
        </Panel>
      </div>
    </Page>
  );
}

function ClientForm({ client, onSubmit, onCancel }: { client?: Client; onSubmit: (formData: FormData) => void; onCancel: () => void }) {
  return (
    <Panel accent className="record-editor">
      <div className="panel-heading"><div><Eyebrow>{client ? "EDIT CLIENT" : "NEW PROSPECT"}</Eyebrow><h3>{client ? client.businessName : "Add a client or prospect"}</h3></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel editing"><X /></button></div>
      <p className="section-explainer">Save the contact and business details you will need for outreach, follow-up, and delivery.</p>
      <form action={onSubmit} className="form-grid">
        <label>Business name<input name="business" required autoFocus defaultValue={client?.businessName} /></label>
        <label>Contact name<input name="contact" required defaultValue={client?.contactName} /></label>
        <label>Email<input name="email" type="email" required defaultValue={client?.email} /></label>
        <label>Phone<input name="phone" type="tel" defaultValue={client?.phone} /></label>
        <label>Website<input name="website" type="url" placeholder="https://" defaultValue={client?.website} /></label>
        <label>Business type<input name="type" placeholder="Local business, agency…" defaultValue={client?.businessType} /></label>
        <label>Lead source<input name="source" placeholder="Direct outreach, referral…" defaultValue={client?.source ?? "Direct outreach"} /></label>
        <label>First contacted<input name="firstContacted" type="date" defaultValue={client?.firstContacted ?? new Date().toISOString().slice(0, 10)} /></label>
        <label>Status<select name="status" defaultValue={client?.status ?? "Lead"}>{clientStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <div className="form-actions span-2"><button className="button" type="submit">{client ? "Save client changes" : "Save prospect"}</button><button className="button secondary" type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    </Panel>
  );
}

export function ClientsPage() {
  const { data, update } = useApp();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = data.clients.find((client) => client.id === editingId);
  const clientFromForm = (formData: FormData, clientId: string): Client => ({
    id: clientId,
    businessName: String(formData.get("business")),
    contactName: String(formData.get("contact")),
    email: String(formData.get("email")),
    phone: String(formData.get("phone")),
    website: String(formData.get("website")),
    businessType: String(formData.get("type") || "Local business"),
    source: String(formData.get("source") || "Direct outreach"),
    firstContacted: String(formData.get("firstContacted")),
    status: String(formData.get("status") || "Lead"),
  });
  const add = (formData: FormData) => {
    update((current) => ({ ...current, clients: [...current.clients, clientFromForm(formData, id())] }));
    setCreating(false);
  };
  const save = (formData: FormData) => {
    if (!editingId) return;
    update((current) => ({ ...current, clients: current.clients.map((client) => client.id === editingId ? clientFromForm(formData, client.id) : client) }));
    setEditingId(null);
  };
  return (
    <Page title="CLIENTS" eyebrow="PIPELINE / CRM" sub="Add prospects here, then edit their contact details and status whenever the relationship changes.">
      <div className="page-actions"><button className="button" onClick={() => { setCreating(true); setEditingId(null); }}><Plus />Add prospect</button></div>
      {creating && <ClientForm onSubmit={add} onCancel={() => setCreating(false)} />}
      {editing && <ClientForm key={editing.id} client={editing} onSubmit={save} onCancel={() => setEditingId(null)} />}
      {data.clients.length === 0 ? (
        <EmptyState title="No clients yet." body="Add the first prospect and make the pipeline visible." action="+ Add prospect" onAction={() => setCreating(true)} />
      ) : (
        <Panel className="table-wrap client-table">
          <table>
            <thead><tr><th>Business</th><th>Contact</th><th>Status</th><th>First contact</th><th>Actions</th></tr></thead>
            <tbody>{data.clients.map((client) => (
              <tr key={client.id}>
                <td><b>{client.businessName}</b><small>{client.businessType}</small></td>
                <td>{client.contactName}<small>{client.email}</small></td>
                <td><select value={client.status} onChange={(event) => update((current) => ({ ...current, clients: current.clients.map((item) => item.id === client.id ? { ...item, status: event.target.value } : item) }))}>{clientStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                <td>{client.firstContacted || "—"}</td>
                <td><button className="edit-button" onClick={() => { setEditingId(client.id); setCreating(false); }}><Pencil />Edit</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Panel>
      )}
    </Page>
  );
}

function ProjectForm({ project, clients, defaultCurrency, onSubmit, onCancel }: { project?: Project; clients: Client[]; defaultCurrency: Currency; onSubmit: (formData: FormData) => void; onCancel: () => void }) {
  return (
    <Panel accent className="record-editor">
      <div className="panel-heading"><div><Eyebrow>{project ? "EDIT PROJECT" : "NEW PROJECT"}</Eyebrow><h3>{project ? project.name : "Define the work"}</h3></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel editing"><X /></button></div>
      <p className="section-explainer">Set the delivery details and choose the currency used for both the agreed price and payments.</p>
      <form action={onSubmit} className="form-grid project-form">
        <label>Project name<input name="name" required autoFocus defaultValue={project?.name} /></label>
        <label>Client<select name="client" defaultValue={project?.clientId ?? ""}><option value="">Personal / internal</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.businessName}</option>)}</select></label>
        <label className="span-2">Description<textarea name="description" defaultValue={project?.description} /></label>
        <label>Stage<select name="stage" defaultValue={project?.stage ?? "PLANNING"}>{projectStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
        <label>Priority<select name="priority" defaultValue={project?.priority ?? "High"}>{projectPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        <label>Deadline<input name="deadline" type="date" defaultValue={project?.deadline} /></label>
        <label>Progress (%)<input name="progress" type="number" min="0" max="100" defaultValue={project?.progress ?? 10} /></label>
        <label>Tech stack<input name="stack" defaultValue={project?.techStack} /></label>
        <label>Currency<CurrencySelect defaultValue={project ? currencyOf(project.currency) : defaultCurrency} /></label>
        <label>Agreed price<input name="price" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={project?.price} /></label>
        <label>Amount paid<input name="paid" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={project?.paid} /></label>
        <label>Repository URL<input name="repositoryUrl" type="url" placeholder="https://github.com/…" defaultValue={project?.repositoryUrl} /></label>
        <label>Live URL<input name="liveUrl" type="url" placeholder="https://…" defaultValue={project?.liveUrl} /></label>
        <div className="form-actions span-2"><button className="button" type="submit">{project ? "Save project changes" : "Create project"}</button><button className="button secondary" type="button" onClick={onCancel}>Cancel</button></div>
      </form>
    </Panel>
  );
}

export function ProjectsPage() {
  const { data, update } = useApp();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = data.projects.find((project) => project.id === editingId);
  const projectFromForm = (formData: FormData, projectId: string): Project => ({
    id: projectId,
    name: String(formData.get("name")),
    clientId: String(formData.get("client")) || undefined,
    description: String(formData.get("description")),
    stage: String(formData.get("stage") || "PLANNING"),
    deadline: String(formData.get("deadline")),
    progress: Number(formData.get("progress")),
    priority: String(formData.get("priority") || "High"),
    techStack: String(formData.get("stack")),
    repositoryUrl: String(formData.get("repositoryUrl")),
    liveUrl: String(formData.get("liveUrl")),
    price: Number(formData.get("price")),
    paid: Number(formData.get("paid")),
    currency: formCurrency(formData),
  });
  const add = (formData: FormData) => {
    update((current) => ({ ...current, projects: [...current.projects, projectFromForm(formData, id())] }));
    setCreating(false);
  };
  const save = (formData: FormData) => {
    if (!editingId) return;
    update((current) => ({ ...current, projects: current.projects.map((project) => project.id === editingId ? projectFromForm(formData, project.id) : project) }));
    setEditingId(null);
  };
  return (
    <Page title="PROJECTS" eyebrow="DELIVERY SYSTEM" sub="Create projects here, then edit every detail—including price, paid amount, and GBP or EUR currency—afterwards.">
      <div className="page-actions"><button className="button" onClick={() => { setCreating(true); setEditingId(null); }}><Plus />New project</button></div>
      {creating && <ProjectForm clients={data.clients} defaultCurrency={data.settings.currency} onSubmit={add} onCancel={() => setCreating(false)} />}
      {editing && <ProjectForm key={editing.id} project={editing} clients={data.clients} defaultCurrency={data.settings.currency} onSubmit={save} onCancel={() => setEditingId(null)} />}
      {data.projects.length === 0 ? (
        <EmptyState title="Nothing on the build floor." body="Create a website, AI tool, automation, or portfolio project." action="+ New project" onAction={() => setCreating(true)} />
      ) : (
        <div className="project-grid">{data.projects.map((project) => {
          const currency = currencyOf(project.currency);
          return (
            <Panel key={project.id}>
              <div className="panel-heading"><div><Eyebrow>{project.stage}</Eyebrow><h3>{project.name}</h3></div><button className="edit-button" onClick={() => { setEditingId(project.id); setCreating(false); }}><Pencil />Edit</button></div>
              <p>{project.description || "A clear outcome waiting to be shipped."}</p>
              <ProgressBar value={project.progress} />
              <label>Progress<input type="range" min="0" max="100" value={project.progress} onChange={(event) => update((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? { ...item, progress: Number(event.target.value) } : item) }))} /></label>
              <div className="project-pricing"><span><small>ASKED</small><b>{formatMoney(project.price, currency)}</b></span><span><small>PAID</small><b>{formatMoney(project.paid, currency)}</b></span></div>
              <div className="project-meta"><span>{currency}</span><span>{project.deadline || "No deadline"}</span></div>
            </Panel>
          );
        })}</div>
      )}
    </Page>
  );
}

export function MoneyPage() {
  const { data, update } = useApp();
  const [mode, setMode] = useState<"expense" | "income" | null>(null);
  const [viewCurrency, setViewCurrency] = useState<Currency>(data.settings.currency);
  const money = totals(data, viewCurrency);
  const add = (formData: FormData) => {
    const amount = Number(formData.get("amount"));
    const date = String(formData.get("date"));
    const currency = formCurrency(formData);
    if (mode === "expense") {
      update((current) => ({ ...current, expenses: [...current.expenses, { id: id(), amount, date, category: String(formData.get("category")), description: String(formData.get("description")), scope: String(formData.get("scope")) as "business" | "personal", currency }] }));
    } else {
      update((current) => ({ ...current, income: [...current.income, { id: id(), amount, date, source: String(formData.get("category")), description: String(formData.get("description")), scope: String(formData.get("scope")) as "business" | "personal", currency }] }));
    }
    setMode(null);
  };
  const chart = [
    ...data.income.filter((entry) => currencyOf(entry.currency) === viewCurrency).map((entry) => ({ date: entry.date, income: entry.amount, expense: 0 })),
    ...data.expenses.filter((entry) => currencyOf(entry.currency) === viewCurrency).map((entry) => ({ date: entry.date, income: 0, expense: entry.amount })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const ledger = [
    ...data.income.map((entry) => ({ ...entry, kind: "Income" as const, label: entry.source })),
    ...data.expenses.map((entry) => ({ ...entry, kind: "Expense" as const, label: entry.category })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Page title="MONEY" eyebrow="CASH / ALLOCATION" sub="Record income and expenses in pounds or euros, then switch the financial view without combining unlike currencies.">
      <div className="page-actions money-actions"><label className="compact-select">View<CurrencySelect value={viewCurrency} onChange={setViewCurrency} /></label><button className="button" onClick={() => setMode("income")}><Plus />Income</button><button className="button secondary" onClick={() => setMode("expense")}><Plus />Expense</button></div>
      {mode && (
        <Panel accent className="record-editor">
          <div className="panel-heading"><div><Eyebrow>NEW {mode.toUpperCase()}</Eyebrow><h3>Record {mode}</h3></div><button className="icon-button" type="button" onClick={() => setMode(null)} aria-label="Cancel"><X /></button></div>
          <form action={add} className="form-grid">
            <label>Amount<input name="amount" type="number" step="0.01" min="0" inputMode="decimal" required /></label>
            <label>Currency<CurrencySelect defaultValue={viewCurrency} /></label>
            <label>Date<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
            <label>{mode === "expense" ? "Category" : "Source"}<input name="category" required /></label>
            <label>Description<input name="description" /></label>
            <label>Scope<select name="scope"><option value="personal">Personal</option><option value="business">Business</option></select></label>
            <div className="form-actions span-2"><button className="button">Record {mode}</button><button className="button secondary" type="button" onClick={() => setMode(null)}>Cancel</button></div>
          </form>
        </Panel>
      )}
      <div className="metric-grid wide">
        <Metric label={`Total income · ${viewCurrency}`} value={formatMoney(money.income, viewCurrency)} accent />
        <Metric label={`Expenses · ${viewCurrency}`} value={formatMoney(money.expenses, viewCurrency)} />
        <Metric label={`Net cash · ${viewCurrency}`} value={formatMoney(money.net, viewCurrency)} />
        <Metric label="Savings rate" value={money.income ? `${Math.round(money.net / money.income * 100)}%` : "—"} />
      </div>
      <Panel className="chart-panel">
        <Eyebrow>INCOME VS SPENDING · {viewCurrency}</Eyebrow><h3>Cash movement</h3>
        {chart.length ? <ResponsiveContainer width="100%" height={280}><AreaChart data={chart}><defs><linearGradient id="income" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".45" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => formatMoney(Number(value), viewCurrency)} /><Area dataKey="income" stroke="var(--accent)" fill="url(#income)" /><Area dataKey="expense" stroke="var(--danger)" fill="transparent" /></AreaChart></ResponsiveContainer> : <EmptyState title={`No ${viewCurrency} cashflow yet.`} body={`Record ${viewCurrency === "GBP" ? "pound" : "euro"} income or an expense to begin this timeline.`} />}
      </Panel>
      <Panel>
        <Eyebrow>RECENT ENTRIES</Eyebrow><h3>Currency-labelled ledger</h3>
        {ledger.length ? <div className="money-ledger">{ledger.slice(0, 12).map((entry) => { const currency = currencyOf(entry.currency); return <div key={`${entry.kind}-${entry.id}`}><span><b>{entry.label}</b><small>{entry.kind} · {entry.date} · {currency}</small></span><strong className={entry.kind === "Expense" ? "expense" : ""}>{entry.kind === "Expense" ? "−" : "+"}{formatMoney(entry.amount, currency)}</strong></div>; })}</div> : <p className="section-explainer">Income and expenses will appear here with their original currency.</p>}
      </Panel>
    </Page>
  );
}
