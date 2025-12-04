from django.db import migrations


class Migration(migrations.Migration):
    atomic = False  # allow extension creation and potential concurrent operations

    dependencies = [
        ('umami_api', '0001_initial'),
    ]

def create_trigram_extension(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
        schema_editor.execute("CREATE INDEX IF NOT EXISTS idx_ingredient_base_name_trgm ON ingredient USING gin (base_name gin_trgm_ops);")
        schema_editor.execute("CREATE INDEX IF NOT EXISTS idx_ingredient_display_name_trgm ON ingredient USING gin (display_name gin_trgm_ops);")
        schema_editor.execute("CREATE INDEX IF NOT EXISTS idx_alias_name_trgm ON alias USING gin (name gin_trgm_ops);")

def drop_trigram_extension(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute("DROP INDEX IF EXISTS idx_alias_name_trgm;")
        schema_editor.execute("DROP INDEX IF EXISTS idx_ingredient_display_name_trgm;")
        schema_editor.execute("DROP INDEX IF EXISTS idx_ingredient_base_name_trgm;")

class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('umami_api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_trigram_extension, drop_trigram_extension),
    ]


