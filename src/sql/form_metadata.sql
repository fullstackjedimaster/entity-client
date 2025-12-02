CREATE OR REPLACE FUNCTION ec.generate_form_metadata(entity_type TEXT)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    cfg RECORD;
    col RECORD;
    metadata JSONB := '{}';
    table_cols JSONB := '[]';
    widget TEXT;
    label TEXT;
    required BOOLEAN;
BEGIN
    SELECT * INTO cfg FROM ec.entity_config WHERE entity_type = entity_type;

    FOR col IN
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = cfg.schema_name
          AND table_name = cfg.table_name
          AND column_name != cfg.primary_key
          AND column_name != ALL(cfg.exclude_columns)
        ORDER BY ordinal_position
    LOOP
        label := initcap(replace(col.column_name, '_', ' '));
        required := col.is_nullable = 'NO';

        widget := CASE col.data_type
            WHEN 'uuid' THEN 'text'
            WHEN 'boolean' THEN 'checkbox'
            WHEN 'integer' THEN 'number'
            WHEN 'numeric' THEN 'number'
            WHEN 'jsonb' THEN 'json'
            WHEN 'timestamp without time zone' THEN 'datetime'
            WHEN 'timestamp with time zone' THEN 'datetime'
            ELSE 'text'
        END;

        table_cols := table_cols || jsonb_build_object(
            'field', col.column_name,
            'label', label,
            'widget', widget,
            'required', required,
            'datatype', col.data_type
        );
    END LOOP;

    metadata := jsonb_set(metadata, '{fields}', table_cols);
    RETURN metadata;
END;
$$;
