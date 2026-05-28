# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Users(models.Model):
    user_id = models.AutoField(primary_key=True, db_column="USER_ID")
    username = models.CharField(max_length=50, unique=True, db_column="USERNAME")
    password = models.CharField(max_length=200, db_column="PASSWORD")
    password_hash = models.CharField(max_length=64, null=True, blank=True, db_column="PASSWORD_HASH")
    role = models.CharField(max_length=20, db_column="ROLE")
    created_date = models.DateTimeField(null=True, blank=True, db_column="CREATED_DATE")

    class Meta:
        managed = False
        db_table = "USERS"

    def __str__(self):
        return f"{self.username} ({self.role})"


class Products(models.Model):
    product_id = models.AutoField(primary_key=True, db_column="PRODUCT_ID")
    name = models.CharField(max_length=100, db_column="PRODUCT_NAME")
    category = models.CharField(max_length=50, null=True, blank=True, db_column="CATEGORY")
    size = models.CharField(max_length=10, null=True, blank=True, db_column="SIZE_")
    color = models.CharField(max_length=30, null=True, blank=True, db_column="COLOR")
    price = models.DecimalField(max_digits=10, decimal_places=2, db_column="PRICE")
    stock_qty = models.IntegerField(default=0, db_column="STOCK_QTY")
    image_url = models.CharField(max_length=500, null=True, blank=True, db_column="IMAGE_URL")

    class Meta:
        managed = False
        db_table = "PRODUCTS"

    def __str__(self):
        return self.name


class Customers(models.Model):
    customer_id = models.AutoField(primary_key=True, db_column="CUSTOMER_ID")
    user = models.ForeignKey(
        Users,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_column="USER_ID",
    )
    full_name = models.CharField(max_length=100, db_column="FULL_NAME")
    email = models.CharField(max_length=100, unique=True, null=True, blank=True, db_column="EMAIL")
    phone = models.CharField(max_length=20, null=True, blank=True, db_column="PHONE")
    address = models.CharField(max_length=200, null=True, blank=True, db_column="ADDRESS")
    created_date = models.DateTimeField(null=True, blank=True, db_column="CREATED_DATE")

    class Meta:
        managed = False
        db_table = "CUSTOMERS"

    def __str__(self):
        return self.full_name


class Orders(models.Model):
    order_id = models.AutoField(primary_key=True, db_column="ORDER_ID")
    customer = models.ForeignKey(
        Customers,
        on_delete=models.DO_NOTHING,
        db_column="CUSTOMER_ID",
    )
    user = models.ForeignKey(
        Users,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_column="USER_ID",
    )
    order_date = models.DateTimeField(null=True, blank=True, db_column="ORDER_DATE")
    status = models.CharField(max_length=20, default="Pending", db_column="STATUS")
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        db_column="TOTAL_AMOUNT",
    )

    class Meta:
        managed = False
        db_table = "ORDERS"

    def __str__(self):
        return f"Order #{self.order_id}"


class OrderItems(models.Model):
    item_id = models.AutoField(primary_key=True, db_column="ITEM_ID")
    order = models.ForeignKey(
        Orders,
        on_delete=models.DO_NOTHING,
        db_column="ORDER_ID",
    )
    product = models.ForeignKey(
        Products,
        on_delete=models.DO_NOTHING,
        db_column="PRODUCT_ID",
    )
    quantity = models.IntegerField(db_column="QUANTITY")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, db_column="UNIT_PRICE")
    selected_size = models.CharField(max_length=10, null=True, blank=True, db_column="SELECTED_SIZE")
    selected_color = models.CharField(max_length=30, null=True, blank=True, db_column="SELECTED_COLOR")

    class Meta:
        managed = False
        db_table = "ORDER_ITEMS"

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class SalesLog(models.Model):
    log_id = models.AutoField(primary_key=True, db_column="LOG_ID")
    order = models.ForeignKey(
        Orders,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_column="ORDER_ID",
    )
    user = models.ForeignKey(
        Users,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_column="USER_ID",
    )
    action = models.CharField(max_length=50, null=True, blank=True, db_column="ACTION")
    log_date = models.DateTimeField(null=True, blank=True, db_column="LOG_DATE")

    class Meta:
        managed = False
        db_table = "SALES_LOG"

    def __str__(self):
        return f"{self.action} - {self.log_date}"


class ProductVariants(models.Model):
    variant_id = models.AutoField(primary_key=True, db_column="VARIANT_ID")
    product = models.ForeignKey(
        Products,
        on_delete=models.DO_NOTHING,
        db_column="PRODUCT_ID",
    )
    size = models.CharField(max_length=10, null=True, blank=True, db_column="SIZE_")
    color = models.CharField(max_length=30, null=True, blank=True, db_column="COLOR")
    stock = models.IntegerField(default=0, db_column="STOCK_QTY")

    class Meta:
        managed = False
        db_table = "PRODUCT_VARIANTS"

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color}"