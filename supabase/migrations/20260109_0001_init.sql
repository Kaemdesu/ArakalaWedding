-- Arakala Wedding — multi-tenant schema
-- templates: vendor-owned invitation templates (theme + sections as jsonb)
-- invitations: one row per customer order; data jsonb holds all couple content
-- rsvps / wishes / gifts / site_settings: guest-facing content, scoped by invitation_id

create table if not exists public.templates (
  id text primary key,                -- e.g. 'elegant-gold'; mirrors templates/<id>.json
  name text not null,
  description text default '',
  theme jsonb not null default '{}',  -- palette, fonts, decorations
  sections jsonb not null default '[]', -- ordered section ids
  tier text not null default 'basic' check (tier in ('basic', 'premium')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- public URL: /w/<slug>
  template_id text not null references public.templates (id),
  data jsonb not null default '{}',   -- invitation-data schema (see .agents/skills/wedding-template/references)
  status text not null default 'draft' check (status in ('draft', 'published', 'expired')),
  tier text not null default 'basic' check (tier in ('basic', 'premium')),
  custom_domain text unique,          -- premium tier
  owner_email text default '',
  edit_token uuid not null unique default gen_random_uuid(), -- secret editor link /edit/<edit_token>
  expires_at timestamptz,             -- null = never expires
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  full_name text not null,
  email text not null,
  attendance text not null check (attendance in ('accept', 'decline')),
  guest_count integer check (guest_count between 1 and 5),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (invitation_id, email)
);

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null,
  message text not null,
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null,
  description text,
  price_idr integer not null default 0,
  image_url text,
  shop_url text,
  shop_name text check (shop_name in ('tokopedia', 'shopee', 'lazada', 'other')),
  status text not null default 'available'
    check (status in ('available', 'reserved', 'purchased', 'received')),
  reserved_by_name text,
  reserved_by_email text,
  reserved_at timestamptz,
  purchased_message text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id bigint generated always as identity primary key,
  invitation_id uuid not null unique references public.invitations (id) on delete cascade,
  delivery_recipient text default '',
  delivery_phone text default '',
  delivery_address text default '',
  delivery_notes text default '',
  bank_name text default '',
  bank_account_number text default '',
  bank_account_holder text default '',
  updated_at timestamptz not null default now()
);

create index if not exists rsvps_invitation_idx on public.rsvps (invitation_id);
create index if not exists wishes_invitation_idx on public.wishes (invitation_id);
create index if not exists gifts_invitation_idx on public.gifts (invitation_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger invitations_updated_at before update on public.invitations
  for each row execute function public.set_updated_at();
create trigger gifts_updated_at before update on public.gifts
  for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- RLS
alter table public.templates enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.gifts enable row level security;
alter table public.site_settings enable row level security;

-- templates: world-readable (needed to render /w/[slug])
create policy "templates are public" on public.templates
  for select using (true);

-- invitations: public read only when published and not expired
create policy "published invitations are public" on public.invitations
  for select using (
    status = 'published'
    and (expires_at is null or expires_at > now())
  );

-- guests can submit rsvps to published invitations
create policy "guests can insert rsvps" on public.rsvps
  for insert with check (
    exists (
      select 1 from public.invitations i
      where i.id = rsvps.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

-- guests can post wishes
create policy "guests can insert wishes" on public.wishes
  for insert with check (
    exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id and i.status = 'published'
    )
  );
-- guests can read non-hidden wishes of published invitations
create policy "public wishes are readable" on public.wishes
  for select using (
    not is_hidden and exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id and i.status = 'published'
    )
  );

-- gifts: public read of active items; guests reserve via api (update with check)
create policy "active gifts are readable" on public.gifts
  for select using (
    is_active and exists (
      select 1 from public.invitations i
      where i.id = gifts.invitation_id and i.status = 'published'
    )
  );
create policy "guests can reserve available gifts" on public.gifts
  for update using (
    status = 'available' and exists (
      select 1 from public.invitations i
      where i.id = gifts.invitation_id and i.status = 'published'
    )
  ) with check (status in ('reserved', 'available'));

-- site_settings (bank/delivery info shown publicly on the invitation)
create policy "site settings are readable" on public.site_settings
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = site_settings.invitation_id and i.status = 'published'
    )
  );

-- everything else (admin reads/writes, invitation create/update) is service-role only
