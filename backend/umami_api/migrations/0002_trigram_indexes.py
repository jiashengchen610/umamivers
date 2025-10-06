from django.db import migrations


class Migration(migrations.Migration):
    atomic = False  # allow extension creation and potential concurrent operations

    dependencies = [
        ('umami_api', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE EXTENSION IF NOT EXISTS pg_trgm;
            CREATE INDEX IF NOT EXISTS idx_ingredient_base_name_trgm
                ON ingredient USING gin (base_name gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS idx_ingredient_display_name_trgm
                ON ingredient USING gin (display_name gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS idx_alias_name_trgm
                ON alias USING gin (name gin_trgm_ops);
            """,
            reverse_sql="""
            DROP INDEX IF EXISTS idx_alias_name_trgm;
            DROP INDEX IF EXISTS idx_ingredient_display_name_trgm;
            DROP INDEX IF EXISTS idx_ingredient_base_name_trgm;
            """,
        ),
    ]


