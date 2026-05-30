from django.db import models


class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=200)
    password_hash = models.CharField(max_length=64, null=True, blank=True)
    role = models.CharField(max_length=20, choices=[
        ('Admin', 'Admin'), ('Sale', 'Sale'), ('Customer', 'Customer')
    ], default='Customer')
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.role})"


class Products(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, null=True, blank=True)
    size = models.CharField(max_length=10, null=True, blank=True)
    color = models.CharField(max_length=30, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_qty = models.IntegerField(default=0)
    image_url = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'products'

    def __str__(self):
        return self.product_name


class Customers(models.Model):
    customer_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=100)
    email = models.CharField(max_length=100, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=200, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return self.full_name


class Orders(models.Model):
    order_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customers, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, blank=True)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending', choices=[
        ('Pending', 'Pending'), ('Confirmed', 'Confirmed'),
        ('Shipped', 'Shipped'), ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'orders'

    def __str__(self):
        return f"Order #{self.order_id}"


class OrderItems(models.Model):
    item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    selected_size = models.CharField(max_length=10, null=True, blank=True)
    selected_color = models.CharField(max_length=30, null=True, blank=True)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.product.product_name} x {self.quantity}"


class ProductVariants(models.Model):
    variant_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Products, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=10, null=True, blank=True)
    color = models.CharField(max_length=30, null=True, blank=True)
    stock_qty = models.IntegerField(default=0)

    class Meta:
        db_table = 'product_variants'

    def __str__(self):
        return f"{self.product.product_name} - {self.size_} - {self.color}"


class SalesLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    log_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sales_log'

    def __str__(self):
        return f"{self.action} - {self.log_date}"
