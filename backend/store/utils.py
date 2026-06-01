from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from django.db.models import Sum, Q, Count, Case, When, Value, IntegerField
from .models import Users, Products, Customers, Orders, OrderItems, SalesLog, ProductVariants


def get_user_by_credentials(username, password):
    try:
        user = Users.objects.get(username__iexact=username, password=password)
        return {
            'USER_ID': user.user_id,
            'USERNAME': user.username,
            'ROLE': user.role,
        }
    except Users.DoesNotExist:
        return None


def get_user_by_id(user_id):
    try:
        user = Users.objects.get(user_id=user_id)
        return {
            'USER_ID': user.user_id,
            'USERNAME': user.username,
            'ROLE': user.role,
        }
    except Users.DoesNotExist:
        return None


def get_customer_id_by_user_id(user_id):
    try:
        return Customers.objects.values_list('customer_id', flat=True).get(user_id=user_id)
    except Customers.DoesNotExist:
        return None


def register_customer(username, password, full_name, email, phone, address):
    if Customers.objects.filter(email=email).exists():
        raise Exception('Email already registered!')
    if Users.objects.filter(username__iexact=username).exists():
        raise Exception('Username already taken!')

    user = Users.objects.create(
        username=username,
        password=password,
        role='Customer',
    )
    Customers.objects.create(
        user=user,
        full_name=full_name,
        email=email,
        phone=phone or '',
        address=address or '',
    )


def get_all_products():
    return [
        {
            'PRODUCT_ID': p.product_id,
            'PRODUCT_NAME': p.product_name,
            'CATEGORY': p.category,
            'SIZE_': p.size,
            'COLOR': p.color,
            'PRICE': float(p.price),
            'STOCK_QTY': p.stock_qty,
            'IMAGE_URL': p.image_url or '',
        }
        for p in Products.objects.all().order_by('stock_qty')
    ]


def add_product(name, category, price, image_url=None):
    product = Products.objects.create(
        product_name=name,
        category=category or '',
        price=price,
        image_url=image_url or '',
    )
    return product.product_id


def update_product(product_id, name, category, price, image_url=None):
    Products.objects.filter(product_id=product_id).update(
        product_name=name,
        category=category,
        price=price,
        image_url=image_url,
    )


def delete_product(product_id):
    ProductVariants.objects.filter(product_id=product_id).delete()
    Products.objects.filter(product_id=product_id).delete()


def get_variants(product_id):
    return [
        {
            'VARIANT_ID': v.variant_id,
            'PRODUCT_ID': v.product_id,
            'SIZE_': v.size,
            'COLOR': v.color,
            'STOCK_QTY': v.stock_qty,
        }
        for v in ProductVariants.objects.filter(product_id=product_id).order_by('variant_id')
    ]


def add_variant(product_id, size, color, stock_qty):
    ProductVariants.objects.create(
        product_id=product_id,
        size=size,
        color=color,
        stock_qty=stock_qty or 0,
    )
    _sync_product_stock(product_id)


def update_variant(variant_id, size, color, stock_qty):
    variant = ProductVariants.objects.get(variant_id=variant_id)
    variant.size = size
    variant.color = color
    variant.stock_qty = stock_qty or 0
    variant.save()
    _sync_product_stock(variant.product_id)


def delete_variant(variant_id):
    variant = ProductVariants.objects.get(variant_id=variant_id)
    pid = variant.product_id
    variant.delete()
    _sync_product_stock(pid)


def _sync_product_stock(product_id):
    total = ProductVariants.objects.filter(product_id=product_id).aggregate(
        total=Sum('stock_qty')
    )['total'] or 0
    Products.objects.filter(product_id=product_id).update(stock_qty=total)


def get_all_orders():
    orders = Orders.objects.select_related('customer', 'user').all().order_by('-order_id')
    result = []
    for o in orders:
        sold_by = None
        log_entry = SalesLog.objects.filter(order=o, user__role__in=['Admin', 'Sale']).order_by('-log_id').first()
        if log_entry and log_entry.user:
            sold_by = log_entry.user.username
        result.append({
            'ORDER_ID': o.order_id,
            'CUSTOMER_NAME': o.customer.full_name if o.customer else 'Unknown',
            'SOLD_BY': sold_by,
            'ORDER_DATE': o.order_date.strftime('%Y-%m-%d') if o.order_date else '',
            'STATUS': o.status,
            'TOTAL_AMOUNT': float(o.total_amount) if o.total_amount else 0,
        })
    return result


def get_customer_orders(customer_id):
    orders = Orders.objects.filter(customer_id=customer_id).select_related('customer').order_by('-order_id')
    result = []
    for o in orders:
        sold_by = None
        log_entry = SalesLog.objects.filter(order=o, user__role__in=['Admin', 'Sale']).order_by('-log_id').first()
        if log_entry and log_entry.user:
            sold_by = log_entry.user.username
        result.append({
            'ORDER_ID': o.order_id,
            'CUSTOMER_NAME': o.customer.full_name if o.customer else 'Unknown',
            'ORDER_DATE': o.order_date.strftime('%Y-%m-%d') if o.order_date else '',
            'STATUS': o.status,
            'TOTAL_AMOUNT': float(o.total_amount) if o.total_amount else 0,
            'PROCESSED_BY': sold_by,
        })
    return result


@transaction.atomic
def create_order(customer_id, user_id, items):
    order = Orders.objects.create(customer_id=customer_id, user_id=user_id, status='Pending')
    for item in items:
        OrderItems.objects.create(
            order=order,
            product_id=int(item['product_id']),
            quantity=int(item['quantity']),
            unit_price=float(item['unit_price']),
            selected_size=item.get('selected_size') or None,
            selected_color=item.get('selected_color') or None,
        )
        if item.get('variant_id'):
            variant = ProductVariants.objects.get(variant_id=int(item['variant_id']))
            variant.stock_qty -= int(item['quantity'])
            variant.save()
    _recalc_order_total(order.order_id)
    SalesLog.objects.create(order=order, user_id=user_id, action='ORDER_CREATED')
    return order.order_id


def update_order_status(order_id, status):
    Orders.objects.filter(order_id=order_id).update(status=status)


def get_order_items(order_id):
    items = OrderItems.objects.filter(order_id=order_id).select_related('product').order_by('item_id')
    result = []
    for item in items:
        result.append({
            'ITEM_ID': item.item_id,
            'PRODUCT_ID': item.product_id,
            'PRODUCT_NAME': item.product.product_name,
            'IMAGE_URL': item.product.image_url or '',
            'QUANTITY': item.quantity,
            'UNIT_PRICE': float(item.unit_price),
            'SELECTED_SIZE': item.selected_size or '\u2014',
            'SELECTED_COLOR': item.selected_color or '\u2014',
            'SUBTOTAL': float(item.quantity * item.unit_price),
        })
    return result


def get_all_users():
    users = Users.objects.all().order_by('user_id')
    result = []
    for u in users:
        result.append({
            'USER_ID': u.user_id,
            'USERNAME': u.username,
            'ROLE': u.role,
            'CREATED_DATE': u.created_date.strftime('%Y-%m-%d') if u.created_date else '',
        })
    return result


def update_user_role(user_id, new_role):
    Users.objects.filter(user_id=user_id).update(role=new_role)


def delete_user(user_id):
    Customers.objects.filter(user_id=user_id).delete()
    Users.objects.filter(user_id=user_id).delete()


def search_customers(query):
    q = f'%{query}%'
    customers = Customers.objects.filter(
        Q(full_name__icontains=query) |
        Q(phone__icontains=query) |
        Q(email__icontains=query)
    ).order_by('full_name')
    return list(customers.values(
        'customer_id', 'full_name', 'email', 'phone', 'address'
    ))


def get_sales_log():
    logs = SalesLog.objects.select_related('user', 'order').all().order_by('-log_id')
    result = []
    for log in logs:
        result.append({
            'LOG_ID': log.log_id,
            'ORDER_ID': log.order.order_id if log.order else None,
            'USERNAME': log.user.username if log.user else None,
            'ACTION': log.action,
            'LOG_DATE': log.log_date.strftime('%Y-%m-%d %H:%M') if log.log_date else '',
        })
    return result


def get_audit_report():
    orders = Orders.objects.select_related('customer').all().order_by('-order_id')
    order_list = []
    for o in orders:
        staff_name = None
        log_entry = SalesLog.objects.filter(order=o, user__role__in=['Admin', 'Sale']).order_by('-log_id').first()
        if log_entry and log_entry.user:
            staff_name = log_entry.user.username

        items = OrderItems.objects.filter(order=o).select_related('product')
        item_list = []
        for item in items:
            item_list.append({
                'PRODUCT_NAME': item.product.product_name,
                'CATEGORY': item.product.category,
                'SELECTED_SIZE': item.selected_size or '\u2014',
                'SELECTED_COLOR': item.selected_color or '\u2014',
                'QUANTITY': item.quantity,
                'UNIT_PRICE': float(item.unit_price),
                'SUBTOTAL': float(item.quantity * item.unit_price),
            })

        logs = SalesLog.objects.filter(order=o).select_related('user').order_by('-log_date')
        log_list = []
        for log in logs:
            log_list.append({
                'CHANGED_BY': log.user.username if log.user else '',
                'ACTION': log.action,
                'LOG_DATE': log.log_date.strftime('%Y-%m-%d %H:%M') if log.log_date else '',
            })

        order_list.append({
            'ORDER_ID': o.order_id,
            'STAFF_NAME': staff_name,
            'STAFF_ROLE': 'Staff' if staff_name else '',
            'CUSTOMER_NAME': o.customer.full_name if o.customer else '',
            'CUSTOMER_PHONE': o.customer.phone if o.customer else '',
            'ORDER_DATE': o.order_date.strftime('%Y-%m-%d %H:%M') if o.order_date else '',
            'STATUS': o.status,
            'TOTAL_AMOUNT': float(o.total_amount) if o.total_amount else 0,
            'items': item_list,
            'logs': log_list,
        })
    return order_list


def get_staff_performance():
    results = (
        Users.objects.filter(role__in=['Admin', 'Sale'])
        .annotate(
            total_orders=Count('orders', distinct=True),
            completed_orders=Count(Case(
                When(orders__status='Completed', then=1),
                output_field=IntegerField(),
                distinct=True,
            )),
            cancelled_orders=Count(Case(
                When(orders__status='Cancelled', then=1),
                output_field=IntegerField(),
                distinct=True,
            )),
        )
        .values('username', 'role', 'total_orders', 'completed_orders', 'cancelled_orders')
    )

    perf = []
    for r in results:
        orders = Orders.objects.filter(user__username=r['username'])
        total_revenue = sum(
            float(o.total_amount) for o in orders if o.status != 'Cancelled' and o.total_amount
        )
        last_order = orders.order_by('-order_date').first()
        perf.append({
            'USERNAME': r['username'],
            'ROLE': r['role'],
            'TOTAL_ORDERS': r['total_orders'],
            'TOTAL_REVENUE': total_revenue,
            'COMPLETED_ORDERS': r['completed_orders'],
            'CANCELLED_ORDERS': r['cancelled_orders'],
            'LAST_ORDER_DATE': last_order.order_date.strftime('%Y-%m-%d') if last_order and last_order.order_date else '',
        })
    return perf


def create_user(username, password, full_name, email, phone, address, role):
    if Users.objects.filter(username__iexact=username).exists():
        raise Exception('Username already taken!')
    user = Users.objects.create(username=username, password=password, role=role)
    Customers.objects.create(
        user=user,
        full_name=full_name,
        email=email or '',
        phone=phone or '',
        address=address or '',
    )
    return user.user_id


def log_status_change(order_id, user_id, status):
    SalesLog.objects.create(
        order_id=order_id,
        user_id=user_id,
        action=f'STATUS_{status.upper()}',
    )


def _recalc_order_total(order_id):
    total = OrderItems.objects.filter(order_id=order_id).aggregate(
        total=Sum(Sum('quantity') * Sum('unit_price'))
    )
    items = OrderItems.objects.filter(order_id=order_id)
    total_amount = sum(float(item.quantity * item.unit_price) for item in items)
    Orders.objects.filter(order_id=order_id).update(total_amount=total_amount)


def hash_password(raw_password):
    return make_password(raw_password)


def verify_password(raw_password, hashed_password):
    return check_password(raw_password, hashed_password)


def format_currency(amount, currency='USD'):
    if amount is None:
        return ''
    try:
        return f"{currency} {float(amount):,.2f}"
    except (TypeError, ValueError):
        return str(amount)
