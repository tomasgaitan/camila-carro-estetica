-- Schema para Camila Carro Estética
-- Ejecutar en el SQL Editor de Supabase

-- Clientes
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

-- Servicios
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_minutes integer not null check (duration_minutes % 5 = 0 and duration_minutes between 5 and 60),
  category text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  stock integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Turnos
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Servicios por turno
create table if not exists appointment_services (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  service_name text not null,
  price_at_time numeric(10,2) not null
);

-- Productos por turno
create table if not exists appointment_products (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  price_at_time numeric(10,2) not null
);

-- Pagos
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete cascade unique,
  method text not null check (method in ('cash', 'transfer')),
  subtotal numeric(10,2) not null,
  discount_type text check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) default 0,
  total numeric(10,2) not null,
  paid_at timestamptz default now()
);

-- RLS: solo usuarios autenticados pueden operar
alter table clients enable row level security;
alter table services enable row level security;
alter table products enable row level security;
alter table appointments enable row level security;
alter table appointment_services enable row level security;
alter table appointment_products enable row level security;
alter table payments enable row level security;

create policy "authenticated full access" on clients for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on services for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on products for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on appointments for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on appointment_services for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on appointment_products for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on payments for all using (auth.role() = 'authenticated');
