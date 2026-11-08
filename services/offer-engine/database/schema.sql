
create table if not exists offer_preferences(
phone text primary key,
favorite_category text,
preferred_discount text,
likes_combo boolean default true,
minimum_order numeric default 0
);
