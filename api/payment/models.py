from django.db import models

# Create your models here.


class OrderTransaction(models.Model):
    order_id = models.CharField(max_length=128, unique=True)
    capture_id = models.CharField(max_length=128, blank=True, null=True)
    status = models.CharField(max_length=32)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default='USD')
    payer_email = models.EmailField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderDownloadToken(models.Model): 
    token = models.CharField(max_length=64, unique=True)
    order = models.ForeignKey(OrderTransaction, on_delete=models.CASCADE, related_name='downloads')
    pdf_path = models.CharField(max_length=512)    # filename relative to PRIVATE_PDF_DIR
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)