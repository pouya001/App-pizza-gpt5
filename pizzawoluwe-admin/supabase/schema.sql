
-- Run this in Supabase SQL editor
create table if not exists clients (
  id bigserial primary key,
  name text not null,
  phone text not null unique,
  email text,
  created_at timestamptz not null default now()
);
create table if not exists pizzas (
  id bigserial primary key,
  name text not null unique,
  description text not null,
  price_eur numeric(10,2) not null check (price_eur >= 0),
  available boolean not null default true,
  created_at timestamptz not null default now()
);
do $$ begin
  create type order_status as enum ('waiting','confirmed','preparing','ready','delivered','cancelled');
exception when duplicate_object then null; end $$;
create table if not exists orders (
  id bigserial primary key,
  number text not null unique,
  client_id bigint not null references clients(id),
  scheduled_at timestamptz not null,
  status order_status not null default 'waiting',
  total_eur numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists order_items (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  pizza_id bigint not null references pizzas(id),
  qty int not null default 1 check (qty > 0),
  price_eur numeric(10,2) not null check (price_eur >= 0)
);
create table if not exists slots (
  id bigserial primary key,
  starts_at timestamptz not null,
  max_orders int not null default 3,
  max_pizzas int not null default 6,
  blocked boolean not null default false,
  reason text
);
create index if not exists idx_slots_starts_at on slots(starts_at);
create or replace view orders_view as
select o.id, o.number, c.name as customer_name, c.phone as customer_phone,
       o.scheduled_at, o.status::text as status,
       (
         select string_agg(q, ', ')
         from (
           select (oi.qty || 'x ' || p.name) as q
           from order_items oi join pizzas p on p.id = oi.pizza_id
           where oi.order_id = o.id order by oi.id
         ) s
       ) as items_text, o.total_eur, o.created_at
from orders o join clients c on c.id = o.client_id;
create or replace view clients_stats_view as
select c.*,
       (select min(o.created_at) from orders o where o.client_id = c.id) as first_order_at,
       (select max(o.created_at) from orders o where o.client_id = c.id) as last_order_at,
       (select count(*) from orders o where o.client_id = c.id) as orders_count,
       coalesce((select sum(o.total_eur) from orders o where o.client_id = c.id), 0) as total_spent
from clients c;
create or replace function next_order_number() returns text language sql as $$
  select to_char((select coalesce(max(id),0)+1 from orders), 'FM000');
$$;
create or replace function create_order_with_items(
  p_client_id bigint, p_scheduled_at timestamptz, p_notes text, p_items jsonb
) returns orders as $$
declare new_order orders; total numeric(10,2) := 0; item jsonb;
begin
  insert into orders(number, client_id, scheduled_at, notes)
  values (next_order_number(), p_client_id, p_scheduled_at, p_notes)
  returning * into new_order;
  for item in select * from jsonb_array_elements(p_items) loop
    insert into order_items(order_id, pizza_id, qty, price_eur)
    values (new_order.id, (item->>'pizza_id')::bigint, (item->>'qty')::int, (item->>'price_eur')::numeric);
  end loop;
  select coalesce(sum(qty*price_eur),0) into total from order_items where order_id = new_order.id;
  update orders set total_eur = total where id = new_order.id;
  select * into new_order from orders where id = new_order.id; return new_order;
end; $$ language plpgsql;
create or replace function dashboard_stats() returns json language plpgsql as $$
declare today date := current_date; next2h timestamptz := now() + interval '2 hours';
  _todayOrders int; _todayRevenue numeric(10,2); _waiting int; _nextTwoHours int;
begin
  select count(*), coalesce(sum(total_eur),0) into _todayOrders, _todayRevenue from orders where created_at::date = today;
  select count(*) into _waiting from orders where status='waiting';
  select count(*) into _nextTwoHours from orders where scheduled_at <= next2h and status in ('waiting','confirmed','preparing');
  return json_build_object('todayOrders', _todayOrders,'todayRevenue', _todayRevenue,'waiting', _waiting,'nextTwoHours', _nextTwoHours);
end; $$;
create or replace function get_slots_with_usage(p_from timestamptz, p_to timestamptz)
returns table ( id bigint, starts_at timestamptz, max_orders int, max_pizzas int, blocked boolean, reason text, orders_count int, pizzas_count int )
language sql as $$
  select s.id, s.starts_at, s.max_orders, s.max_pizzas, s.blocked, s.reason,
         coalesce((select count(*) from orders o where o.scheduled_at = s.starts_at), 0) as orders_count,
         coalesce((select sum(oi.qty) from orders o join order_items oi on oi.order_id = o.id where o.scheduled_at = s.starts_at), 0) as pizzas_count
  from slots s where s.starts_at between p_from and p_to order by s.starts_at;
$$;
alter publication supabase_realtime add table orders;
alter table clients enable row level security;
alter table pizzas enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table slots enable row level security;
create policy "auth read all" on clients for select using (auth.role() = 'authenticated');
create policy "auth write" on clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth read all p" on pizzas for select using (auth.role() = 'authenticated');
create policy "auth write p" on pizzas for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth read all o" on orders for select using (auth.role() = 'authenticated');
create policy "auth write o" on orders for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth read all oi" on order_items for select using (auth.role() = 'authenticated');
create policy "auth write oi" on order_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth read all s" on slots for select using (auth.role() = 'authenticated');
create policy "auth write s" on slots for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
