from django.db import models
from django.contrib.postgres.fields import ArrayField
import json


class Ingredient(models.Model):
    base_name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    extraction_temp = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    extraction_time = models.IntegerField(null=True, blank=True)
    cooking_overview = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ingredient'

    def __str__(self):
        return self.base_name


class Alias(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name='aliases')
    name = models.CharField(max_length=255)
    language = models.CharField(max_length=10, default='en')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alias'

    def __str__(self):
        return f"{self.name} ({self.language})"


class Chemistry(models.Model):
    ingredient = models.OneToOneField(Ingredient, on_delete=models.CASCADE, primary_key=True)
    glu = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    asp = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    imp = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    gmp = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    amp = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    umami_aa = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    umami_nuc = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    umami_synergy = models.DecimalField(max_digits=8, decimal_places=3, default=0)

    class Meta:
        db_table = 'chemistry'

    def __str__(self):
        return f"Chemistry for {self.ingredient.base_name}"


class TCM(models.Model):
    ingredient = models.OneToOneField(Ingredient, on_delete=models.CASCADE, primary_key=True)
    four_qi = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    five_flavors = ArrayField(models.CharField(max_length=50), default=list, blank=True)  # TCM Five Tastes
    meridians = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    overview = models.TextField(null=True, blank=True)
    confidence = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)

    class Meta:
        db_table = 'tcm'

    def __str__(self):
        return f"TCM for {self.ingredient.base_name}"


class Flags(models.Model):
    ingredient = models.OneToOneField(Ingredient, on_delete=models.CASCADE, primary_key=True)
    allergens = models.JSONField(default=list, blank=True)
    dietary_restrictions = models.JSONField(default=list, blank=True)
    umami_tags = models.JSONField(default=list, blank=True)
    flavor_tags = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'flags'

    def __str__(self):
        return f"Flags for {self.ingredient.base_name}"