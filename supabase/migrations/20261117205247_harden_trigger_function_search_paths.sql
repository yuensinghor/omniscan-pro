create or replace function public.auto_create_product()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  insert into public.products (barcode, owner_id, name, category)
  values (
    new.barcode,
    new.owner_id,
    coalesce(new.name, 'Unknown (' || new.barcode || ')'),
    coalesce(new.category, 'General')
  )
  on conflict (barcode, owner_id) do nothing;
  return new;
end;
$function$;

create or replace function public.prevent_negative_quantity()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  current_qty integer;
begin
  if new.quantity >= 0 then
    return new;
  end if;

  select coalesce(sum(quantity), 0)
  into current_qty
  from public.inventory_logs
  where barcode = new.barcode and owner_id = new.owner_id;

  if current_qty + new.quantity < 0 then
    raise exception 'Out of stock: quantity cannot go below 0';
  end if;

  return new;
end;
$function$;

create or replace function public.set_feedback_user_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  new.user_id = auth.uid();
  return new;
end;
$function$;
