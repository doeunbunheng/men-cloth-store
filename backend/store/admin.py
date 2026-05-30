from django.contrib import admin
from .models import (
    Users, Products, Customers, Orders,
    OrderItems, SalesLog, ProductVariants,
)


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ("user_id", "username", "role", "created_date")
    search_fields = ("username", "role")
    list_filter = ("role",)


@admin.register(Products)
class ProductsAdmin(admin.ModelAdmin):
    list_display = ("product_id", "product_name", "category", "size", "color", "price", "stock_qty")
    search_fields = ("product_name", "category", "color")
    list_filter = ("category", "size", "color")


@admin.register(Customers)
class CustomersAdmin(admin.ModelAdmin):
    list_display = ("customer_id", "full_name", "email", "phone", "created_date")
    search_fields = ("full_name", "email", "phone")


@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ("order_id", "customer", "user", "order_date", "status", "total_amount")
    search_fields = ("order_id", "status")
    list_filter = ("status",)


@admin.register(OrderItems)
class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ("item_id", "order", "product", "quantity", "unit_price", "selected_size", "selected_color")
    search_fields = ("product__product_name",)


@admin.register(SalesLog)
class SalesLogAdmin(admin.ModelAdmin):
    list_display = ("log_id", "order", "user", "action", "log_date")
    search_fields = ("action",)
    list_filter = ("action",)


@admin.register(ProductVariants)
class ProductVariantsAdmin(admin.ModelAdmin):
    list_display = ("variant_id", "product", "size", "color", "stock_qty")
    search_fields = ("product__product_name", "size", "color")
    list_filter = ("size", "color")
