import logging

from django.db import transaction
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .media import destroy_remote_asset
from .models import ProductImage

logger = logging.getLogger(__name__)


@receiver(pre_delete, sender=ProductImage, dispatch_uid="catalog.product_image_cloudinary_cleanup")
def schedule_product_image_asset_cleanup(sender, instance, **kwargs):
    public_id = instance.cloudinary_public_id
    if public_id:
        transaction.on_commit(lambda public_id=public_id: destroy_remote_asset(public_id))
