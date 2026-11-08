from config.supabase_client import supabase

def get_customer_preferences(phone):
    res=supabase.table('offer_preferences').select('*').eq('phone',phone).execute()
    return res.data[0] if res.data else {}

def get_best_offer(phone,cart,offers):
    prefs=get_customer_preferences(phone)
    total=sum(i['price']*i['qty'] for i in cart)
    best=None
    save=0
    for o in offers:
        if total<o.get('min_order',0): continue
        if prefs and prefs.get('favorite_category') and prefs['favorite_category']!=o.get('category'):
            continue
        s=o['discount'] if o['type']=='flat' else total*o['discount']/100
        if s>save:
            save=s;best=o
    return best
