-- Public website analytics (apps/web), per "Website eventing" contract v2 (Sept 22, 2026).
-- Browser events are validated by the website's server route and written here with the service
-- role only. Anonymous and authenticated clients have no policy and no grants: analytics rows are
-- never readable or writable from the browser. Product, cart, checkout, recommendation and Square
-- tables/columns from the shared contract are omitted: this site has none of those features.

create table if not exists public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique check (char_length(session_id) between 8 and 64),
  device_id uuid,
  user_id uuid,
  analytics_consent boolean not null default false,
  gpc_enabled boolean not null default false,
  entry_path text,
  entry_referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key,
  event_name text not null check (char_length(event_name) between 1 and 64),
  schema_version integer not null default 2,
  event_category text not null check (event_category in ('strictly_necessary', 'analytics')),
  event_timestamp timestamptz not null,
  created_at timestamptz not null default now(),
  session_id text not null references public.analytics_sessions(session_id) on delete cascade,
  device_id uuid,
  user_id uuid,
  tab_id uuid,
  page_view_id uuid,
  previous_page_view_id uuid,
  navigation_type text check (navigation_type in ('navigate', 'reload', 'back_forward', 'client_navigation', 'session_resume')),
  page_path text,
  page_url text,
  referrer text,
  element_id text,
  element_text text,
  target_url text,
  value_numeric numeric,
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object')
);

create index if not exists analytics_events_session_time_idx on public.analytics_events (session_id, event_timestamp);
create index if not exists analytics_events_page_view_idx on public.analytics_events (page_view_id);
create index if not exists analytics_events_device_time_idx on public.analytics_events (device_id, event_timestamp) where device_id is not null;
create index if not exists analytics_events_name_time_idx on public.analytics_events (event_name, event_timestamp);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_sessions_device_idx on public.analytics_sessions (device_id, first_seen_at) where device_id is not null;
create index if not exists analytics_sessions_first_seen_idx on public.analytics_sessions (first_seen_at);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
-- No policies: only the service role (which bypasses RLS) reads or writes these tables.
revoke all on table public.analytics_sessions from public, anon, authenticated;
revoke all on table public.analytics_events from public, anon, authenticated;

-- One validated browser batch for one session. The session row is upserted (first-touch entry and
-- UTM fields keep their first value; consent and last-seen take the latest), then every event is
-- inserted by its browser-generated UUID. A retried batch reuses the same IDs, so ON CONFLICT DO
-- NOTHING keeps each event once. Returns the number of newly stored events.
create or replace function public.analytics_ingest_batch(p_session jsonb, p_events jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer := 0;
begin
  if jsonb_typeof(p_session) <> 'object' or jsonb_typeof(p_events) <> 'array' then
    raise exception 'INVALID_ANALYTICS_BATCH';
  end if;

  insert into public.analytics_sessions (
    session_id, device_id, analytics_consent, gpc_enabled, entry_path, entry_referrer,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, first_seen_at, last_seen_at
  ) values (
    p_session->>'session_id',
    nullif(p_session->>'device_id', '')::uuid,
    coalesce((p_session->>'analytics_consent')::boolean, false),
    coalesce((p_session->>'gpc_enabled')::boolean, false),
    nullif(p_session->>'entry_path', ''),
    nullif(p_session->>'entry_referrer', ''),
    nullif(p_session->>'utm_source', ''),
    nullif(p_session->>'utm_medium', ''),
    nullif(p_session->>'utm_campaign', ''),
    nullif(p_session->>'utm_term', ''),
    nullif(p_session->>'utm_content', ''),
    coalesce((p_session->>'first_seen_at')::timestamptz, now()),
    coalesce((p_session->>'last_seen_at')::timestamptz, now())
  )
  on conflict (session_id) do update set
    device_id = case when excluded.analytics_consent then coalesce(excluded.device_id, public.analytics_sessions.device_id) else null end,
    analytics_consent = excluded.analytics_consent,
    gpc_enabled = excluded.gpc_enabled,
    entry_path = coalesce(public.analytics_sessions.entry_path, excluded.entry_path),
    entry_referrer = coalesce(public.analytics_sessions.entry_referrer, excluded.entry_referrer),
    utm_source = coalesce(public.analytics_sessions.utm_source, excluded.utm_source),
    utm_medium = coalesce(public.analytics_sessions.utm_medium, excluded.utm_medium),
    utm_campaign = coalesce(public.analytics_sessions.utm_campaign, excluded.utm_campaign),
    utm_term = coalesce(public.analytics_sessions.utm_term, excluded.utm_term),
    utm_content = coalesce(public.analytics_sessions.utm_content, excluded.utm_content),
    first_seen_at = least(public.analytics_sessions.first_seen_at, excluded.first_seen_at),
    last_seen_at = greatest(public.analytics_sessions.last_seen_at, excluded.last_seen_at),
    updated_at = now();

  insert into public.analytics_events (
    id, event_name, schema_version, event_category, event_timestamp, session_id, device_id, user_id,
    tab_id, page_view_id, previous_page_view_id, navigation_type, page_path, page_url, referrer,
    element_id, element_text, target_url, value_numeric, properties
  )
  select
    (e->>'id')::uuid,
    e->>'event_name',
    coalesce((e->>'schema_version')::integer, 2),
    e->>'event_category',
    (e->>'event_timestamp')::timestamptz,
    p_session->>'session_id',
    nullif(e->>'device_id', '')::uuid,
    nullif(e->>'user_id', '')::uuid,
    nullif(e->>'tab_id', '')::uuid,
    nullif(e->>'page_view_id', '')::uuid,
    nullif(e->>'previous_page_view_id', '')::uuid,
    nullif(e->>'navigation_type', ''),
    nullif(e->>'page_path', ''),
    nullif(e->>'page_url', ''),
    nullif(e->>'referrer', ''),
    nullif(e->>'element_id', ''),
    nullif(e->>'element_text', ''),
    nullif(e->>'target_url', ''),
    (e->>'value_numeric')::numeric,
    case when jsonb_typeof(e->'properties') = 'object' then e->'properties' else '{}'::jsonb end
  from jsonb_array_elements(p_events) as e
  on conflict (id) do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.analytics_ingest_batch(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.analytics_ingest_batch(jsonb, jsonb) to service_role;

-- Reporting views (security invoker: they carry no extra privilege; anon/authenticated cannot read them).

-- One row per page view: derived from the events that share a page_view_id. No page write is needed.
create or replace view public.analytics_page_views with (security_invoker = true) as
select
  page_view_id,
  session_id,
  min(device_id::text)::uuid as device_id,
  min(tab_id::text)::uuid as tab_id,
  min(previous_page_view_id::text)::uuid as previous_page_view_id,
  min(navigation_type) as navigation_type,
  min(page_path) as page_path,
  min(page_url) as page_url,
  min(referrer) as referrer,
  min(event_timestamp) as first_event_at,
  max(event_timestamp) as last_event_at,
  count(*)::integer as event_count,
  count(*) filter (where event_name = 'element_click')::integer as click_count
from public.analytics_events
where page_view_id is not null
group by page_view_id, session_id;

-- One row per visit with its page and click counts and whether the browser had been seen before.
create or replace view public.analytics_session_summary with (security_invoker = true) as
select
  s.session_id,
  s.device_id,
  s.analytics_consent,
  s.gpc_enabled,
  s.entry_path,
  s.entry_referrer,
  s.utm_source,
  s.utm_medium,
  s.utm_campaign,
  s.first_seen_at,
  s.last_seen_at,
  count(e.id)::integer as event_count,
  count(distinct e.page_view_id)::integer as page_view_count,
  count(e.id) filter (where e.event_name = 'element_click')::integer as click_count,
  (s.device_id is not null and exists (
    select 1 from public.analytics_sessions p
    where p.device_id = s.device_id and p.session_id <> s.session_id and p.first_seen_at < s.first_seen_at
  )) as returning_device
from public.analytics_sessions s
left join public.analytics_events e on e.session_id = s.session_id
group by s.id;

-- Daily totals in UTC.
create or replace view public.analytics_daily_summary with (security_invoker = true) as
select
  (event_timestamp at time zone 'UTC')::date as day,
  count(distinct session_id)::integer as sessions,
  count(distinct device_id)::integer as devices,
  count(distinct page_view_id) filter (where event_name = 'page_view')::integer as page_views,
  count(*) filter (where event_name = 'page_view' and navigation_type = 'reload')::integer as reloads,
  count(*) filter (where event_name = 'element_click')::integer as clicks,
  count(*) filter (where event_name = 'consent_updated' and properties->>'choice' = 'granted')::integer as consent_granted,
  count(*) filter (where event_name = 'consent_updated' and properties->>'choice' = 'denied')::integer as consent_denied
from public.analytics_events
group by 1;

-- Most-clicked controls and destinations.
create or replace view public.analytics_click_summary with (security_invoker = true) as
select
  page_path,
  coalesce(element_id, element_text) as element,
  target_url,
  count(*)::integer as clicks,
  count(distinct session_id)::integer as sessions,
  min(event_timestamp) as first_click_at,
  max(event_timestamp) as last_click_at
from public.analytics_events
where event_name = 'element_click'
group by page_path, coalesce(element_id, element_text), target_url;

revoke all on public.analytics_page_views from public, anon, authenticated;
revoke all on public.analytics_session_summary from public, anon, authenticated;
revoke all on public.analytics_daily_summary from public, anon, authenticated;
revoke all on public.analytics_click_summary from public, anon, authenticated;
