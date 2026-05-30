from django.core.management.base import BaseCommand
from store.models import Users, Products, Customers


class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **options):
        if Users.objects.exists():
            self.stdout.write('Database already has data, skipping.')
            return

        Products.objects.create(product_name='Classic White Shirt', category='Shirt', size='M', color='White', price=25.99, stock_qty=50)
        Products.objects.create(product_name='Slim Fit Jeans', category='Pants', size='L', color='Blue', price=45.99, stock_qty=30)
        Products.objects.create(product_name='Polo T-Shirt', category='Shirt', size='XL', color='Black', price=18.50, stock_qty=100)
        Products.objects.create(product_name='Formal Trousers', category='Pants', size='M', color='Grey', price=55.00, stock_qty=20)
        Products.objects.create(product_name='Leather Belt', category='Accessories', size=None, color='Brown', price=12.99, stock_qty=40)

        Users.objects.create(username='Th34n', password='Th34n90s', role='Admin')
        Users.objects.create(username='Sengmeng', password='S3ngm3ng', role='Sale')

        self.stdout.write(self.style.SUCCESS('Seed data loaded successfully!'))
