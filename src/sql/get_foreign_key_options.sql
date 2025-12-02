CREATE OR REPLACE FUNCTION entity_core.get_foreign_key_options(entity_type TEXT)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    cfg RECORD;
    fk RECORD;
    result JSONB := '{}';
    lookup JSONB;
BEGIN
    SELECT * INTO cfg FROM entity_core.entity_config WHERE entity_type = entity_type;

    FOR fk IN
        SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table,
            ccu.column_name AS foreign_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = cfg.schema_name
          AND tc.table_name = cfg.table_name
    LOOP
        EXECUTE format(
            'SELECT json_agg(json_build_object(''id'', %I, ''name'', %I)) FROM %I.%I',
            fk.foreign_column, fk.foreign_column, cfg.schema_name, fk.foreign_table
        ) INTO lookup;

        result := jsonb_set(result, ARRAY[fk.column_name], lookup);
    END LOOP;

    RETURN result;
END;
$$;
