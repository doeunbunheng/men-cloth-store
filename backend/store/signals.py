from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import OrderItems, Orders, ProductVariants, Products, SalesLog


def sync_product_stock(product_id):
    from django.db.models import Sum
    total = ProductVariants.objects.filter(product_id=product_id).aggregate(
        total=Sum('stock_qty')
    )['total'] or 0
    Products.objects.filter(product_id=product_id).update(stock_qty=total)


def recalc_order_total(order_id):
    items = OrderItems.objects.filter(order_id=order_id)
    total = sum(float(item.quantity * item.unit_price) for item in items)
    Orders.objects.filter(order_id=order_id).update(total_amount=total)


@receiver(post_save, sender=OrderItems)
def order_item_saved(sender, instance, created, **kwargs):
    if created:
        if instance.product and not instance.product.variants.exists():
            Products.objects.filter(product_id=instance.product_id).update(
                stock_qty=instance.product.stock_qty - instance.quantity
            )
    recalc_order_total(instance.order_id)


@receiver(post_delete, sender=OrderItems)
def order_item_deleted(sender, instance, **kwargs):
    recalc_order_total(instance.order_id)


@receiver(post_save, sender=ProductVariants)
def variant_saved(sender, instance, **kwargs):
    sync_product_stock(instance.product_id)


@receiver(post_delete, sender=ProductVariants)
def variant_deleted(sender, instance, **kwargs):
    sync_product_stock(instance.product_id)
