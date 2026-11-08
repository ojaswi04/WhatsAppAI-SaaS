-- Tables used by the WhatsApp intent agent (run in the Supabase SQL editor).

-- Customers who replied STOP / asked to opt out. Checked before any broadcast.
create table if not exists public.opt_outs (
  id          bigserial primary key,
  tenant_id   bigint      not null,
  phone       text        not null,
  message     text,
  created_at  timestamptz not null default now(),
  unique (tenant_id, phone)
);

-- Broadcasts requested over WhatsApp by staff; sent only after approval in the dashboard.
create table if not exists public.broadcast_requests (
  id               bigserial primary key,
  tenant_id        bigint      not null,
  requested_by     text        not null,
  message          text        not null,
  recipient_count  integer     not null default 0,
  status           text        not null default 'pending_approval'
                   check (status in ('pending_approval', 'approved', 'rejected', 'sent')),
  created_at       timestamptz not null default now()
);

-- Messages the agent was not confident about, or could not handle, for a human to answer.
create table if not exists public.human_handoffs (
  id                bigserial primary key,
  tenant_id         bigint      not null,
  phone             text        not null,
  message           text        not null,
  predicted_intent  text,
  confidence        numeric(4,3),
  reason            text,
  status            text        not null default 'open' check (status in ('open', 'resolved')),
  created_at        timestamptz not null default now()
);

create index if not exists human_handoffs_tenant_status on public.human_handoffs (tenant_id, status, created_at desc);

-- Extra columns on the message log for agent replies.
alter table public.messages add column if not exists intent text;
alter table public.messages add column if not exists confidence numeric(4,3);
alter table public.messages add column if not exists handoff boolean default false;

-- Tenant isolation: rows are only visible to users whose JWT carries the same tenant_id.
alter table public.opt_outs           enable row level security;
alter table public.broadcast_requests enable row level security;
alter table public.human_handoffs     enable row level security;

create policy tenant_read_opt_outs on public.opt_outs for select
  using (tenant_id = ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::bigint));
create policy tenant_read_broadcasts on public.broadcast_requests for select
  using (tenant_id = ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::bigint));
create policy tenant_read_handoffs on public.human_handoffs for select
  using (tenant_id = ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::bigint));
