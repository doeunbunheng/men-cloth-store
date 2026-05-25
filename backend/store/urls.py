from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('login/',                              views.LoginView.as_view()),
    path('register/',                           views.RegisterView.as_view()),
    path('me/',                                 views.MeView.as_view()),

    # Products
    path('products/',                           views.ProductsView.as_view()),
    path('products/upload-image/',              views.UploadImageView.as_view()),
    path('products/<int:product_id>/',          views.ProductDetailView.as_view()),
    path('products/<int:product_id>/variants/', views.ProductVariantsView.as_view()),

    # Variants
    path('variants/<int:variant_id>/',          views.VariantDetailView.as_view()),

    # Orders
    path('orders/',                             views.OrdersView.as_view()),
    path('orders/<int:order_id>/status/',       views.OrderStatusView.as_view()),

    # Users (Admin)
    path('users/',                              views.UsersView.as_view()),
    path('users/<int:user_id>/',               views.UserDetailView.as_view()),

    # Sales Log (Admin)
    path('sales-log/',                          views.SalesLogView.as_view()),

    # Customer search (Sale/Admin)
    path('customers/search/',                   views.CustomerSearchView.as_view()),

    # Database Backup (Admin)
    path('backup/',                             views.BackupView.as_view()),
    path('orders/<int:order_id>/items/',        views.OrderItemsView.as_view()),
]