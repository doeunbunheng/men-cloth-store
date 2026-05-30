import jwt, os, uuid
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
from . import utils


# ── JWT ───────────────────────────────────────────────────────────────────────

def make_token(user):
    payload = {
        'user_id':  user['USER_ID'],
        'username': user['USERNAME'],
        'role':     user['ROLE'],
        'exp':      datetime.utcnow() + timedelta(hours=8),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def decode_token(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    try:
        return jwt.decode(auth.split(' ')[1], settings.SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None


def require_roles(*roles):
    def check(request):
        payload = decode_token(request)
        if not payload:
            return None, Response({'error': 'Not authenticated'}, status=401)
        if payload.get('role') not in roles:
            return None, Response({'error': 'Access denied'}, status=403)
        return payload, None
    return check


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = utils.get_user_by_credentials(username, password)
        if not user:
            return Response({'error': 'Invalid username or password'}, status=401)

        customer_id = utils.get_customer_id_by_user_id(user['USER_ID']) if user['ROLE'] == 'Customer' else None

        token = make_token(user)
        return Response({
            'token':       token,
            'user_id':     user['USER_ID'],
            'username':    user['USERNAME'],
            'role':        user['ROLE'],
            'customer_id': customer_id,
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        d = request.data
        try:
            utils.register_customer(
                d['username'], d['password'], d['full_name'],
                d['email'],    d['phone'],    d['address']
            )
            return Response({'message': 'Registration successful! Role: Customer'}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = decode_token(request)
        if not payload:
            return Response({'error': 'Not authenticated'}, status=401)
        return Response({
            'user_id':  payload['user_id'],
            'username': payload['username'],
            'role':     payload['role'],
        })


# ── Products ──────────────────────────────────────────────────────────────────

class ProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(utils.get_all_products())

    def post(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err
        d = request.data
        try:
            pid = utils.add_product(
                d['product_name'], d.get('category'),
                d['price'],        d.get('image_url')
            )
            return Response({'message': 'Product added', 'product_id': pid}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, product_id):
        payload, err = require_roles('Admin')(request)
        if err: return err
        d = request.data
        try:
            utils.update_product(
                product_id, d['product_name'], d.get('category'),
                d['price'],  d.get('image_url')
            )
            return Response({'message': 'Product updated'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request, product_id):
        payload, err = require_roles('Admin')(request)
        if err: return err
        try:
            utils.delete_product(product_id)
            return Response({'message': 'Product deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


# ── Product Variants ──────────────────────────────────────────────────────────

class ProductVariantsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        """Anyone can view variants (needed for product selection)."""
        return Response(utils.get_variants(product_id))

    def post(self, request, product_id):
        """Admin only — add a variant."""
        payload, err = require_roles('Admin')(request)
        if err: return err
        d = request.data
        try:
            utils.add_variant(
                product_id, d.get('size'), d.get('color'), d.get('stock_qty', 0)
            )
            return Response({'message': 'Variant added'}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class VariantDetailView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, variant_id):
        payload, err = require_roles('Admin')(request)
        if err: return err
        d = request.data
        try:
            utils.update_variant(
                variant_id, d.get('size'), d.get('color'), d.get('stock_qty', 0)
            )
            return Response({'message': 'Variant updated'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request, variant_id):
        payload, err = require_roles('Admin')(request)
        if err: return err
        try:
            utils.delete_variant(variant_id)
            return Response({'message': 'Variant deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


# ── Image Upload ──────────────────────────────────────────────────────────────

class UploadImageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err

        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=400)

        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if image.content_type not in allowed:
            return Response({'error': 'Only JPG, PNG, WEBP allowed'}, status=400)

        ext       = image.name.split('.')[-1]
        filename  = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(settings.MEDIA_ROOT, 'products', filename)

        try:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'wb+') as f:
                for chunk in image.chunks():
                    f.write(chunk)
        except Exception as e:
            return Response({'error': f'Could not save file: {str(e)}'}, status=400)

        image_url = f"/media/products/{filename}"
        return Response({'image_url': image_url})


# ── Orders ────────────────────────────────────────────────────────────────────

class OrdersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = decode_token(request)
        if not payload:
            return Response({'error': 'Not authenticated'}, status=401)
        if payload.get('role') in ('Admin', 'Sale'):
            return Response(utils.get_all_orders())
        cid = utils.get_customer_id_by_user_id(payload['user_id'])
        if not cid:
            return Response([])
        return Response(utils.get_customer_orders(cid))

    def post(self, request):
        """All logged-in users can place orders."""
        payload = decode_token(request)
        if not payload:
            return Response({'error': 'Not authenticated'}, status=401)
        d = request.data
        try:
            order_id = utils.create_order(
                d['customer_id'], payload['user_id'], d['items']
            )
            return Response({'message': 'Order placed!', 'order_id': order_id}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


def put(self, request, order_id):
    payload, err = require_roles('Admin', 'Sale')(request)
    if err: return err
    new_status = request.data.get('status')
    try:
        utils.update_order_status(order_id, new_status)
        utils.log_status_change(order_id, payload['user_id'], new_status)
        return Response({'message': f'Order updated to {new_status}'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    

# ── Users (Admin) ─────────────────────────────────────────────────────────────

class UsersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err
        return Response(utils.get_all_users())


class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, user_id):
        payload, err = require_roles('Admin')(request)
        if err: return err
        new_role = request.data.get('role')
        if new_role not in ('Admin', 'Sale', 'Customer'):
            return Response({'error': 'Invalid role'}, status=400)
        try:
            utils.update_user_role(user_id, new_role)
            return Response({'message': f'Role updated to {new_role}'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request, user_id):
        payload, err = require_roles('Admin')(request)
        if err: return err
        if decode_token(request)['user_id'] == user_id:
            return Response({'error': 'Cannot delete your own account'}, status=400)
        try:
            utils.delete_user(user_id)
            return Response({'message': 'User deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


# ── Sales Log ─────────────────────────────────────────────────────────────────

class SalesLogView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err
        return Response(utils.get_sales_log())


# ── Customer Search ───────────────────────────────────────────────────────────

class CustomerSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Sale/Admin can search customers by name or phone."""
        payload, err = require_roles('Admin', 'Sale')(request)
        if err: return err
        query = request.GET.get('q', '')
        if len(query) < 2:
            return Response([])
        customers = utils.search_customers(query)
        return Response(customers)


# ── Database Backup (Admin) ───────────────────────────────────────────────────

import json
from datetime import datetime as dt
from .models import Users, Products, Customers, Orders, OrderItems, SalesLog, ProductVariants

class BackupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err
        from django.apps import apps
        models_map = {
            'users': 'Users', 'customers': 'Customers', 'products': 'Products',
            'product_variants': 'ProductVariants', 'orders': 'Orders',
            'order_items': 'OrderItems', 'sales_log': 'SalesLog',
        }
        stats = []
        for table, model_name in models_map.items():
            try:
                model = apps.get_model('store', model_name)
                stats.append({'table': table.upper(), 'rows': model.objects.count()})
            except Exception as e:
                stats.append({'table': table.upper(), 'rows': 0, 'error': str(e)})
        return Response({'tables': stats,
                         'timestamp': dt.now().strftime('%Y-%m-%d %H:%M:%S')})

    def post(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err

        backup_type = request.data.get('type', 'sql')
        now_str = dt.now().strftime('%Y%m%d_%H%M%S')

        def serialize(obj):
            if hasattr(obj, 'isoformat'):
                return obj.isoformat()
            return str(obj) if obj is not None else None

        tables_data = {
            'users': list(Users.objects.all().values()),
            'customers': list(Customers.objects.all().values()),
            'products': list(Products.objects.all().values()),
            'product_variants': list(ProductVariants.objects.all().values()),
            'orders': list(Orders.objects.all().values()),
            'order_items': list(OrderItems.objects.all().values()),
            'sales_log': list(SalesLog.objects.all().values()),
        }

        if backup_type == 'json':
            data = {
                'backup_info': {
                    'created_at': dt.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'database': "Men's Clothing Store",
                    'type': 'Full JSON Backup',
                },
                'data': tables_data,
            }
            content = json.dumps(data, indent=2, ensure_ascii=False, default=serialize)
            filename = f"mens_store_backup_{now_str}.json"
        else:
            lines = [
                '-- ============================================================',
                f"-- Men's Clothing Store - Full SQL Backup",
                f"-- Generated: {dt.now().strftime('%Y-%m-%d %H:%M:%S')}",
                '-- ============================================================', ''
            ]
            for table, rows in tables_data.items():
                lines.append(f"-- Table: {table.upper()}")
                if rows:
                    cols = list(rows[0].keys())
                    for row in rows:
                        vals = []
                        for col in cols:
                            v = row[col]
                            if v is None:
                                vals.append('NULL')
                            elif isinstance(v, (int, float)):
                                vals.append(str(v))
                            else:
                                vals.append("'" + str(v).replace("'", "''") + "'")
                        lines.append(f"INSERT INTO {table} ({','.join(cols)}) VALUES ({','.join(vals)});")
                    lines.append(f"-- {len(rows)} rows inserted")
                lines.append('')
            lines.append('COMMIT;')
            content = '\n'.join(lines)
            filename = f"mens_store_backup_{now_str}.sql"

        from django.http import HttpResponse
        resp = HttpResponse(content, content_type='text/plain; charset=utf-8')
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        resp['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return resp


# ── Order Items View ──────────────────────────────────────────────────────────

class OrderItemsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, order_id):
        payload = decode_token(request)
        if not payload:
            return Response({'error': 'Not authenticated'}, status=401)
        try:
            items = utils.get_order_items(int(order_id))
            return Response(items)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


# ── Audit Views (Admin only) ──────────────────────────────────────────────────

class AuditView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err
        try:
            orders = utils.get_audit_report()
            staff  = utils.get_staff_performance()
            return Response({'orders': orders, 'staff': staff})
        except Exception as e:
            return Response({'error': str(e)}, status=400)



class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload, err = require_roles('Admin')(request)
        if err: return err
        d = request.data
        role = d.get('role', 'Customer')
        if role not in ('Admin', 'Sale', 'Customer'):
            return Response({'error': 'Invalid role'}, status=400)
        try:
            uid = utils.create_user(
                d['username'], d['password'], d['full_name'],
                d.get('email',''), d.get('phone',''), d.get('address',''),
                role
            )
            return Response({'message': f'{role} account created', 'user_id': uid}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        


class OrderStatusView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, order_id):
        payload, err = require_roles('Admin', 'Sale')(request)
        if err: return err
        new_status = request.data.get('status')
        try:
            utils.update_order_status(order_id, new_status)
            utils.log_status_change(order_id, payload['user_id'], new_status)
            return Response({'message': f'Order updated to {new_status}'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)