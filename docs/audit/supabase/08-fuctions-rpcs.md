# Supabase Functions and RPCs

## Purpose

Capture the PostgreSQL functions currently defined within the CAFLA application schemas.

Functions may contain important application and database business logic that cannot be identified by inspecting tables and views alone.

In Supabase, some of these functions may also be exposed or invoked as RPCs by the application.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Function metadata captured:

- Schema
- Function name
- Identity arguments
- Return type
- Procedural language
- Security mode
- Volatility classification
- Complete PostgreSQL function definition

---

## Query

```sql
select
  n.nspname as function_schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_function_result(p.oid) as return_type,
  l.lanname as language,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
join pg_language l
  on l.oid = p.prolang
where n.nspname in ('public', 'tournaments', 'development')
order by
  n.nspname,
  p.proname,
  pg_get_function_identity_arguments(p.oid);
```

---

## Result

```json
[
  {
    "function_schema": "development",
    "function_name": "capture_monthly_ranking_snapshot",
    "identity_arguments": "p_cycle_id uuid, p_month_start date",
    "return_type": "integer",
    "language": "plpgsql",
    "security_definer": false,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.capture_monthly_ranking_snapshot(p_cycle_id uuid, p_month_start date)\n RETURNS integer\n LANGUAGE plpgsql\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n    v_month_start date;\r\n    v_month_end date;\r\n    v_rows integer;\r\nbegin\r\n\r\n    -- Normalize to the first day of the requested month.\r\n    v_month_start := date_trunc('month', p_month_start)::date;\r\n\r\n    -- Last calendar day of that month.\r\n    v_month_end := (\r\n        date_trunc('month', v_month_start)\r\n        + interval '1 month'\r\n        - interval '1 day'\r\n    )::date;\r\n\r\n    /*\r\n     * Capture the already-calculated official monthly result.\r\n     *\r\n     * IMPORTANT:\r\n     * This expensive calculation happens when the snapshot is captured,\r\n     * NOT every time the frontend reads Development Progress.\r\n     */\r\n    insert into development.monthly_ranking_snapshots (\r\n        cycle_id,\r\n        cycle_member_id,\r\n        member_id,\r\n\r\n        month_start,\r\n        snapshot_date,\r\n\r\n        development_score,\r\n\r\n        evidence_percentage,\r\n        evidence_factor_percentage,\r\n\r\n        ranking_score,\r\n\r\n        ranking_position,\r\n        ranking_percentile,\r\n        eligible_referees,\r\n\r\n        ranking_eligible,\r\n        evidence_status,\r\n\r\n        captured_at\r\n    )\r\n\r\n    select\r\n        h.cycle_id,\r\n        h.cycle_member_id,\r\n        h.member_id,\r\n\r\n        h.month_start,\r\n        h.snapshot_date,\r\n\r\n        h.monthly_development_score,\r\n\r\n        h.monthly_evidence_percentage,\r\n        h.monthly_evidence_factor_percentage,\r\n\r\n        h.monthly_ranking_score,\r\n\r\n        h.ranking_position,\r\n        h.ranking_percentile,\r\n        h.eligible_referees,\r\n\r\n        h.monthly_ranking_eligible,\r\n        h.monthly_evidence_status,\r\n\r\n        now()\r\n\r\n    from development.referee_monthly_ranking_history_v2 h\r\n\r\n    where h.cycle_id = p_cycle_id\r\n      and h.month_start = v_month_start\r\n      and h.snapshot_date = v_month_end\r\n\r\n    on conflict (\r\n        cycle_id,\r\n        member_id,\r\n        month_start\r\n    )\r\n    do update set\r\n\r\n        cycle_member_id = excluded.cycle_member_id,\r\n        snapshot_date = excluded.snapshot_date,\r\n\r\n        development_score = excluded.development_score,\r\n\r\n        evidence_percentage = excluded.evidence_percentage,\r\n        evidence_factor_percentage =\r\n            excluded.evidence_factor_percentage,\r\n\r\n        ranking_score = excluded.ranking_score,\r\n\r\n        ranking_position = excluded.ranking_position,\r\n        ranking_percentile = excluded.ranking_percentile,\r\n        eligible_referees = excluded.eligible_referees,\r\n\r\n        ranking_eligible = excluded.ranking_eligible,\r\n        evidence_status = excluded.evidence_status,\r\n\r\n        captured_at = now();\r\n\r\n    get diagnostics v_rows = row_count;\r\n\r\n    return v_rows;\r\n\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "capture_previous_month_ranking_snapshot",
    "identity_arguments": "",
    "return_type": "integer",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.capture_previous_month_ranking_snapshot()\n RETURNS integer\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n    v_cycle_id uuid;\r\n    v_previous_month_start date;\r\n    v_rows integer;\r\nbegin\r\n\r\n    v_previous_month_start :=\r\n        (\r\n            date_trunc(\r\n                'month',\r\n                current_date\r\n            )\r\n            - interval '1 month'\r\n        )::date;\r\n\r\n    select id\r\n    into v_cycle_id\r\n    from development.cycles\r\n    where status = 'active'\r\n      and v_previous_month_start <= end_date\r\n      and (\r\n          v_previous_month_start\r\n          + interval '1 month'\r\n          - interval '1 day'\r\n      )::date >= start_date\r\n    order by start_date desc\r\n    limit 1;\r\n\r\n    if v_cycle_id is null then\r\n        return 0;\r\n    end if;\r\n\r\n    select development.capture_monthly_ranking_snapshot(\r\n        v_cycle_id,\r\n        v_previous_month_start\r\n    )\r\n    into v_rows;\r\n\r\n    return coalesce(v_rows, 0);\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "finalize_quiz_attempt",
    "identity_arguments": "p_attempt_id uuid, p_member_id uuid, p_finalize_as development.quiz_attempt_status",
    "return_type": "development.quiz_attempts",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.finalize_quiz_attempt(p_attempt_id uuid, p_member_id uuid, p_finalize_as development.quiz_attempt_status)\n RETURNS development.quiz_attempts\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n  v_attempt development.quiz_attempts;\r\n  v_total_questions integer;\r\n  v_correct_count integer;\r\n  v_score numeric(5,2);\r\n  v_now timestamptz := now();\r\n  v_result development.quiz_attempts;\r\nbegin\r\n  if p_finalize_as not in (\r\n    'submitted'::development.quiz_attempt_status,\r\n    'expired'::development.quiz_attempt_status\r\n  ) then\r\n    raise exception\r\n      'Attempt can only be finalized as submitted or expired.';\r\n  end if;\r\n\r\n  select *\r\n  into v_attempt\r\n  from development.quiz_attempts\r\n  where id = p_attempt_id\r\n  for update;\r\n\r\n  if not found then\r\n    raise exception 'Quiz attempt not found.';\r\n  end if;\r\n\r\n  if v_attempt.member_id <> p_member_id then\r\n    raise exception 'This quiz attempt does not belong to the member.';\r\n  end if;\r\n\r\n  if v_attempt.status <> 'in_progress' then\r\n    return v_attempt;\r\n  end if;\r\n\r\n  if p_finalize_as = 'submitted'\r\n     and v_attempt.expires_at <= v_now then\r\n    p_finalize_as :=\r\n      'expired'::development.quiz_attempt_status;\r\n  end if;\r\n\r\n  -- Calificar respuestas guardadas\r\n  update development.quiz_answers answer\r\n  set\r\n    is_correct = option_row.is_correct,\r\n    updated_at = v_now\r\n  from development.quiz_question_options option_row\r\n  where answer.attempt_id = p_attempt_id\r\n    and answer.selected_option_id = option_row.id;\r\n\r\n  -- Total de preguntas válidas del snapshot\r\n  select count(*)\r\n  into v_total_questions\r\n  from development.quiz_attempt_questions attempt_question\r\n  join development.quiz_question_groups question_group\r\n    on question_group.id = attempt_question.question_group_id\r\n  where attempt_question.attempt_id = p_attempt_id\r\n    and question_group.is_invalidated = false;\r\n\r\n  -- Respuestas correctas\r\n  select count(*)\r\n  into v_correct_count\r\n  from development.quiz_answers answer\r\n  join development.quiz_attempt_questions attempt_question\r\n    on attempt_question.id = answer.attempt_question_id\r\n  join development.quiz_question_groups question_group\r\n    on question_group.id = attempt_question.question_group_id\r\n  where answer.attempt_id = p_attempt_id\r\n    and answer.is_correct = true\r\n    and question_group.is_invalidated = false;\r\n\r\n  if v_total_questions = 0 then\r\n    v_score := 0;\r\n  else\r\n    v_score := round(\r\n      (\r\n        v_correct_count::numeric\r\n        / v_total_questions::numeric\r\n      ) * 100,\r\n      2\r\n    );\r\n  end if;\r\n\r\n  update development.quiz_attempts\r\n  set\r\n    status = p_finalize_as,\r\n    submitted_at = v_now,\r\n    score = v_score,\r\n    correct_count = v_correct_count,\r\n    total_questions = v_total_questions,\r\n    time_used_seconds = greatest(\r\n      0,\r\n      floor(\r\n        extract(\r\n          epoch from (\r\n            least(v_now, expires_at) - started_at\r\n          )\r\n        )\r\n      )::integer\r\n    ),\r\n    updated_at = v_now\r\n  where id = p_attempt_id\r\n    and status = 'in_progress'\r\n  returning *\r\n  into v_result;\r\n\r\n  if v_result.id is null then\r\n    select *\r\n    into v_result\r\n    from development.quiz_attempts\r\n    where id = p_attempt_id;\r\n  end if;\r\n\r\n  return v_result;\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "prevent_scoring_period_overlap",
    "identity_arguments": "",
    "return_type": "trigger",
    "language": "plpgsql",
    "security_definer": false,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.prevent_scoring_period_overlap()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nbegin\r\n\r\n  if exists (\r\n    select 1\r\n    from development.scoring_periods sp\r\n    where sp.id <> new.id\r\n      and daterange(\r\n        sp.effective_from,\r\n        coalesce(sp.effective_until, 'infinity'::date),\r\n        '[]'\r\n      )\r\n      &&\r\n      daterange(\r\n        new.effective_from,\r\n        coalesce(new.effective_until, 'infinity'::date),\r\n        '[]'\r\n      )\r\n  ) then\r\n    raise exception\r\n      'Scoring period overlaps an existing scoring period.';\r\n  end if;\r\n\r\n  return new;\r\n\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "protect_started_scoring_period",
    "identity_arguments": "",
    "return_type": "trigger",
    "language": "plpgsql",
    "security_definer": false,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.protect_started_scoring_period()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nbegin\r\n\r\n  if old.effective_from <= current_date then\r\n\r\n    if new.effective_from is distinct from old.effective_from then\r\n      raise exception\r\n        'Cannot change effective_from for a scoring period that has already started.';\r\n    end if;\r\n\r\n    if new.attendance_weight is distinct from old.attendance_weight\r\n      or new.quiz_weight is distinct from old.quiz_weight\r\n      or new.report_weight is distinct from old.report_weight\r\n      or new.evaluation_weight is distinct from old.evaluation_weight\r\n    then\r\n      raise exception\r\n        'Cannot change weights for a scoring period that has already started. Close the existing period and create a new one.';\r\n    end if;\r\n\r\n  end if;\r\n\r\n  return new;\r\n\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "publish_quiz_assessment",
    "identity_arguments": "p_assessment_id uuid, p_published_by uuid",
    "return_type": "development.quiz_assessments",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.publish_quiz_assessment(p_assessment_id uuid, p_published_by uuid)\n RETURNS development.quiz_assessments\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n  v_assessment development.quiz_assessments;\r\n  v_version_count integer;\r\n  v_question_group_count integer;\r\n  v_invalid_question_count integer;\r\n  v_incomplete_translation_count integer;\r\n  v_invalid_option_count integer;\r\n  v_result development.quiz_assessments;\r\nbegin\r\n  -- ===================================================\r\n  -- 1. CARGAR Y BLOQUEAR LA EVALUACIÓN\r\n  -- ===================================================\r\n\r\n  select *\r\n  into v_assessment\r\n  from development.quiz_assessments\r\n  where id = p_assessment_id\r\n  for update;\r\n\r\n  if not found then\r\n    raise exception 'Quiz assessment not found.';\r\n  end if;\r\n\r\n  if v_assessment.status <> 'draft' then\r\n    raise exception\r\n      'Only draft assessments can be published.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 2. VALIDAR CONFIGURACIÓN GENERAL\r\n  -- ===================================================\r\n\r\n  if v_assessment.open_from is null\r\n     or v_assessment.open_until is null then\r\n    raise exception\r\n      'The quiz availability window is required.';\r\n  end if;\r\n\r\n  if v_assessment.open_from >= v_assessment.open_until then\r\n    raise exception\r\n      'The opening date must be before the closing date.';\r\n  end if;\r\n\r\n  if v_assessment.time_limit_minutes < 1 then\r\n    raise exception\r\n      'The time limit must be at least one minute.';\r\n  end if;\r\n\r\n  if v_assessment.max_attempts < 1 then\r\n    raise exception\r\n      'At least one attempt must be allowed.';\r\n  end if;\r\n\r\n  if v_assessment.questions_per_attempt < 1 then\r\n    raise exception\r\n      'Questions per attempt must be greater than zero.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 3. VALIDAR VERSIONES\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_version_count\r\n  from development.quiz_versions\r\n  where assessment_id = p_assessment_id;\r\n\r\n  if v_version_count = 0 then\r\n    raise exception\r\n      'At least one language version is required.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 4. VALIDAR BANCO DE PREGUNTAS\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_question_group_count\r\n  from development.quiz_question_groups\r\n  where assessment_id = p_assessment_id\r\n    and is_invalidated = false;\r\n\r\n  if v_question_group_count = 0 then\r\n    raise exception\r\n      'The assessment must contain at least one valid question.';\r\n  end if;\r\n\r\n  if v_assessment.questions_per_attempt >\r\n     v_question_group_count then\r\n    raise exception\r\n      'Questions per attempt (%) exceed the available question bank (%).',\r\n      v_assessment.questions_per_attempt,\r\n      v_question_group_count;\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 5. CADA GRUPO DEBE TENER UNA PREGUNTA POR IDIOMA\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_incomplete_translation_count\r\n  from development.quiz_question_groups qg\r\n  where qg.assessment_id = p_assessment_id\r\n    and qg.is_invalidated = false\r\n    and (\r\n      select count(*)\r\n      from development.quiz_questions qq\r\n      join development.quiz_versions qv\r\n        on qv.id = qq.version_id\r\n      where qq.question_group_id = qg.id\r\n        and qv.assessment_id = p_assessment_id\r\n    ) <> v_version_count;\r\n\r\n  if v_incomplete_translation_count > 0 then\r\n    raise exception\r\n      '% question group(s) are missing a language version.',\r\n      v_incomplete_translation_count;\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 6. VALIDAR TEXTO DE PREGUNTAS\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_invalid_question_count\r\n  from development.quiz_questions qq\r\n  join development.quiz_versions qv\r\n    on qv.id = qq.version_id\r\n  where qv.assessment_id = p_assessment_id\r\n    and length(trim(qq.question_text)) = 0;\r\n\r\n  if v_invalid_question_count > 0 then\r\n    raise exception\r\n      '% question(s) have empty text.',\r\n      v_invalid_question_count;\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 7. VALIDAR OPCIONES\r\n  --\r\n  -- Cada pregunta debe tener:\r\n  -- - entre 2 y 4 opciones\r\n  -- - exactamente una opción correcta\r\n  -- - True/False exactamente 2 opciones\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_invalid_option_count\r\n  from development.quiz_questions qq\r\n\r\n  join development.quiz_versions qv\r\n    on qv.id = qq.version_id\r\n\r\n  join development.quiz_question_groups qg\r\n    on qg.id = qq.question_group_id\r\n\r\n  left join lateral (\r\n    select\r\n      count(*) as option_count,\r\n      count(*) filter (\r\n        where qopt.is_correct = true\r\n      ) as correct_count\r\n    from development.quiz_question_options qopt\r\n    where qopt.question_id = qq.id\r\n  ) option_summary\r\n    on true\r\n\r\n  where qv.assessment_id = p_assessment_id\r\n    and qg.is_invalidated = false\r\n    and (\r\n      option_summary.option_count < 2\r\n      or option_summary.option_count > 4\r\n      or option_summary.correct_count <> 1\r\n      or (\r\n        qg.question_type = 'true_false'\r\n        and option_summary.option_count <> 2\r\n      )\r\n    );\r\n\r\n  if v_invalid_option_count > 0 then\r\n    raise exception\r\n      '% question(s) have invalid answer options.',\r\n      v_invalid_option_count;\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 8. PUBLICAR\r\n  -- ===================================================\r\n\r\n  update development.quiz_assessments\r\n  set\r\n    status = 'published',\r\n    published_by = p_published_by,\r\n    published_at = now(),\r\n    updated_at = now()\r\n  where id = p_assessment_id\r\n  returning *\r\n  into v_result;\r\n\r\n  return v_result;\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "refresh_active_cycle_ranking_snapshot",
    "identity_arguments": "",
    "return_type": "integer",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.refresh_active_cycle_ranking_snapshot()\n RETURNS integer\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n    v_cycle_id uuid;\r\n    v_rows integer;\r\nbegin\r\n\r\n    select id\r\n    into v_cycle_id\r\n    from development.cycles\r\n    where status = 'active'\r\n      and current_date between start_date and end_date\r\n    order by start_date desc\r\n    limit 1;\r\n\r\n    if v_cycle_id is null then\r\n        return 0;\r\n    end if;\r\n\r\n    select development.refresh_current_ranking_snapshot(v_cycle_id)\r\n    into v_rows;\r\n\r\n    return coalesce(v_rows, 0);\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "refresh_current_ranking_snapshot",
    "identity_arguments": "p_cycle_id uuid",
    "return_type": "integer",
    "language": "plpgsql",
    "security_definer": false,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.refresh_current_ranking_snapshot(p_cycle_id uuid)\n RETURNS integer\n LANGUAGE plpgsql\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n    v_rows integer;\r\nbegin\r\n\r\n    insert into development.current_ranking_snapshot (\r\n        cycle_id,\r\n        cycle_member_id,\r\n        member_id,\r\n\r\n        snapshot_date,\r\n\r\n        development_score,\r\n\r\n        evidence_percentage,\r\n        evidence_factor_percentage,\r\n\r\n        ranking_score,\r\n\r\n        ranking_position,\r\n        ranking_percentile,\r\n        eligible_referees,\r\n\r\n        ranking_eligible,\r\n        evidence_status,\r\n\r\n        attendance_evidence_count,\r\n        quiz_assessments_counted,\r\n        reports_required,\r\n        evaluations_due,\r\n        evaluations_received,\r\n\r\n        refreshed_at\r\n    )\r\n\r\n    select\r\n        r.cycle_id,\r\n        r.cycle_member_id,\r\n        r.member_id,\r\n\r\n        r.snapshot_date,\r\n\r\n        r.development_score,\r\n\r\n        r.evidence_percentage,\r\n        r.evidence_factor_percentage,\r\n\r\n        r.ranking_score,\r\n\r\n        r.ranking_position,\r\n        r.ranking_percentile,\r\n        r.eligible_referees,\r\n\r\n        r.ranking_eligible,\r\n        r.evidence_status,\r\n\r\n        r.attendance_evidence_count,\r\n        r.quiz_assessments_counted,\r\n        r.reports_required,\r\n        r.evaluations_due,\r\n        r.evaluations_received,\r\n\r\n        now()\r\n\r\n    from development.referee_current_ranking_v2 r\r\n\r\n    where r.cycle_id = p_cycle_id\r\n\r\n    on conflict (\r\n        cycle_id,\r\n        member_id\r\n    )\r\n    do update set\r\n\r\n        cycle_member_id = excluded.cycle_member_id,\r\n        snapshot_date = excluded.snapshot_date,\r\n\r\n        development_score = excluded.development_score,\r\n\r\n        evidence_percentage = excluded.evidence_percentage,\r\n        evidence_factor_percentage =\r\n            excluded.evidence_factor_percentage,\r\n\r\n        ranking_score = excluded.ranking_score,\r\n\r\n        ranking_position = excluded.ranking_position,\r\n        ranking_percentile = excluded.ranking_percentile,\r\n        eligible_referees = excluded.eligible_referees,\r\n\r\n        ranking_eligible = excluded.ranking_eligible,\r\n        evidence_status = excluded.evidence_status,\r\n\r\n        attendance_evidence_count =\r\n            excluded.attendance_evidence_count,\r\n\r\n        quiz_assessments_counted =\r\n            excluded.quiz_assessments_counted,\r\n\r\n        reports_required =\r\n            excluded.reports_required,\r\n\r\n        evaluations_due =\r\n            excluded.evaluations_due,\r\n\r\n        evaluations_received =\r\n            excluded.evaluations_received,\r\n\r\n        refreshed_at = now();\r\n\r\n    get diagnostics v_rows = row_count;\r\n\r\n    return v_rows;\r\n\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "save_quiz_answer",
    "identity_arguments": "p_attempt_id uuid, p_member_id uuid, p_attempt_question_id uuid, p_selected_option_id uuid",
    "return_type": "development.quiz_answers",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.save_quiz_answer(p_attempt_id uuid, p_member_id uuid, p_attempt_question_id uuid, p_selected_option_id uuid)\n RETURNS development.quiz_answers\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'development', 'public'\nAS $function$\r\ndeclare\r\n  v_attempt development.quiz_attempts;\r\n  v_attempt_question development.quiz_attempt_questions;\r\n  v_option development.quiz_question_options;\r\n  v_answer development.quiz_answers;\r\nbegin\r\n  -- Cargar y bloquear intento\r\n  select *\r\n  into v_attempt\r\n  from development.quiz_attempts\r\n  where id = p_attempt_id\r\n  for update;\r\n\r\n  if not found then\r\n    raise exception 'Quiz attempt not found.';\r\n  end if;\r\n\r\n  if v_attempt.member_id <> p_member_id then\r\n    raise exception 'This quiz attempt does not belong to the member.';\r\n  end if;\r\n\r\n  if v_attempt.status <> 'in_progress' then\r\n    raise exception 'Only active quiz attempts can be updated.';\r\n  end if;\r\n\r\n  if v_attempt.expires_at <= now() then\r\n    raise exception 'The quiz attempt has expired.';\r\n  end if;\r\n\r\n  -- Validar que la pregunta pertenece al intento\r\n  select *\r\n  into v_attempt_question\r\n  from development.quiz_attempt_questions\r\n  where id = p_attempt_question_id\r\n    and attempt_id = p_attempt_id;\r\n\r\n  if not found then\r\n    raise exception 'The selected question does not belong to this attempt.';\r\n  end if;\r\n\r\n  -- Validar que la opción pertenece a esa pregunta\r\n  select *\r\n  into v_option\r\n  from development.quiz_question_options\r\n  where id = p_selected_option_id\r\n    and question_id = v_attempt_question.question_id;\r\n\r\n  if not found then\r\n    raise exception 'The selected answer option is invalid.';\r\n  end if;\r\n\r\n  insert into development.quiz_answers (\r\n    attempt_id,\r\n    attempt_question_id,\r\n    selected_option_id,\r\n    is_correct,\r\n    answered_at,\r\n    updated_at\r\n  )\r\n  values (\r\n    p_attempt_id,\r\n    p_attempt_question_id,\r\n    p_selected_option_id,\r\n    null,\r\n    now(),\r\n    now()\r\n  )\r\n  on conflict (attempt_id, attempt_question_id)\r\n  do update set\r\n    selected_option_id = excluded.selected_option_id,\r\n    is_correct = null,\r\n    answered_at = now(),\r\n    updated_at = now()\r\n  returning *\r\n  into v_answer;\r\n\r\n  return v_answer;\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "development",
    "function_name": "start_quiz_attempt",
    "identity_arguments": "p_assessment_id uuid, p_member_id uuid, p_language development.quiz_language",
    "return_type": "development.quiz_attempts",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION development.start_quiz_attempt(p_assessment_id uuid, p_member_id uuid, p_language development.quiz_language)\n RETURNS development.quiz_attempts\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'development', 'public'\nAS $function$declare\r\n  v_assessment development.quiz_assessments;\r\n  v_version development.quiz_versions;\r\n  v_cycle_member development.cycle_members;\r\n  v_access_grant development.quiz_access_grants;\r\n  v_existing_attempt development.quiz_attempts;\r\n  v_attempt development.quiz_attempts;\r\n\r\n  v_attempts_used integer;\r\n  v_attempt_number integer;\r\n\r\n  v_effective_from timestamptz;\r\n  v_effective_until timestamptz;\r\n  v_expires_at timestamptz;\r\n\r\n  v_question_count integer;\r\n  v_locked_at timestamptz := now();\r\n\r\n  v_question record;\r\n  v_option_order jsonb;\r\nbegin\r\n  -- ===================================================\r\n  -- 1. CARGAR ASSESSMENT\r\n  -- ===================================================\r\n\r\n  select *\r\n  into v_assessment\r\n  from development.quiz_assessments\r\n  where id = p_assessment_id\r\n  for update;\r\n\r\n  if not found then\r\n    raise exception 'Quiz assessment not found.';\r\n  end if;\r\n\r\n  if v_assessment.status <> 'published' then\r\n    raise exception\r\n      'This quiz is not available for attempts.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 2. VALIDAR MIEMBRO DEL CICLO\r\n  -- ===================================================\r\n\r\n  select *\r\n  into v_cycle_member\r\n  from development.cycle_members\r\n  where cycle_id = v_assessment.cycle_id\r\n    and member_id = p_member_id\r\n    and status in (\r\n      'active'::development.cycle_member_status,\r\n      'withdrawn'::development.cycle_member_status\r\n    )\r\n  limit 1;\r\n\r\n  if not found then\r\n    raise exception\r\n      'The member is not enrolled in this development cycle.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 3. VALIDAR VERSION DE IDIOMA\r\n  -- ===================================================\r\n\r\n  select *\r\n  into v_version\r\n  from development.quiz_versions\r\n  where assessment_id = p_assessment_id\r\n    and language = p_language\r\n  limit 1;\r\n\r\n  if not found then\r\n    raise exception\r\n      'The selected language version is not available.';\r\n  end if;\r\n\r\n-- ===================================================\r\n-- 4. REUTILIZAR O FINALIZAR INTENTO ACTIVO\r\n-- ===================================================\r\n\r\nselect *\r\ninto v_existing_attempt\r\nfrom development.quiz_attempts\r\nwhere assessment_id = p_assessment_id\r\n  and member_id = p_member_id\r\n  and status = 'in_progress'\r\norder by started_at desc\r\nlimit 1;\r\n\r\nif found then\r\n\r\n  /*\r\n   * Si todavía tiene tiempo disponible,\r\n   * reutilizamos exactamente el mismo intento.\r\n   *\r\n   * Esto conserva el comportamiento de\r\n   * Resume Quiz.\r\n   */\r\n  if v_existing_attempt.expires_at > now() then\r\n    return v_existing_attempt;\r\n  end if;\r\n\r\n  /*\r\n   * Si el intento ya venció, lo finalizamos\r\n   * automáticamente como expired.\r\n   *\r\n   * finalize_quiz_attempt:\r\n   * - califica respuestas guardadas\r\n   * - cuenta preguntas no respondidas como incorrectas\r\n   * - calcula score\r\n   * - guarda correct_count\r\n   * - guarda total_questions\r\n   * - guarda time_used_seconds\r\n   * - cambia status a expired\r\n   *\r\n   * Después continuamos normalmente para comprobar\r\n   * si todavía quedan intentos disponibles.\r\n   */\r\n  perform development.finalize_quiz_attempt(\r\n    v_existing_attempt.id,\r\n    p_member_id,\r\n    'expired'::development.quiz_attempt_status\r\n  );\r\n\r\nend if;\r\n\r\n  -- ===================================================\r\n  -- 5. CONTAR INTENTOS VALIDOS UTILIZADOS\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_attempts_used\r\n  from development.quiz_attempts\r\n  where assessment_id = p_assessment_id\r\n    and member_id = p_member_id\r\n    and status in (\r\n      'submitted'::development.quiz_attempt_status,\r\n      'expired'::development.quiz_attempt_status\r\n    );\r\n\r\n  if v_attempts_used >= v_assessment.max_attempts then\r\n    raise exception\r\n      'No quiz attempts remain.';\r\n  end if;\r\n\r\n  v_attempt_number := v_attempts_used + 1;\r\n\r\n  -- ===================================================\r\n  -- 6. CALCULAR VENTANA EFECTIVA\r\n  -- General o extensión individual.\r\n  -- ===================================================\r\n\r\n  select *\r\n  into v_access_grant\r\n  from development.quiz_access_grants\r\n  where assessment_id = p_assessment_id\r\n    and member_id = p_member_id\r\n    and revoked_at is null\r\n    and available_from <= now()\r\n    and available_until > now()\r\n  order by available_until desc\r\n  limit 1;\r\n\r\n  if found then\r\n    v_effective_from :=\r\n      v_access_grant.available_from;\r\n\r\n    v_effective_until :=\r\n      v_access_grant.available_until;\r\n  else\r\n    v_effective_from :=\r\n      v_assessment.open_from;\r\n\r\n    v_effective_until :=\r\n      v_assessment.open_until;\r\n  end if;\r\n\r\n  if v_effective_from is null\r\n     or v_effective_until is null then\r\n    raise exception\r\n      'The quiz availability window is not configured.';\r\n  end if;\r\n\r\n  if now() < v_effective_from then\r\n    raise exception\r\n      'The quiz is not open yet.';\r\n  end if;\r\n\r\n  if now() >= v_effective_until then\r\n    raise exception\r\n      'The quiz availability window has closed.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 7. VALIDAR ELEGIBILIDAD TEMPORAL DEL MIEMBRO\r\n  -- ===================================================\r\n\r\n  if v_cycle_member.effective_from >\r\n     (v_effective_from at time zone 'America/Los_Angeles')::date\r\n  then\r\n    /*\r\n     * Una extensión individual puede autorizar a un\r\n     * miembro nuevo, incluso si entró después de la\r\n     * ventana general.\r\n     */\r\n    if v_access_grant.id is null then\r\n      raise exception\r\n        'The member was not eligible when this quiz opened.';\r\n    end if;\r\n  end if;\r\n\r\n  if v_cycle_member.effective_until is not null\r\n     and v_cycle_member.effective_until <\r\n       (v_effective_from at time zone 'America/Los_Angeles')::date\r\n  then\r\n    raise exception\r\n      'The member was no longer eligible when this quiz opened.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 8. VALIDAR BANCO DISPONIBLE PARA ESTE IDIOMA\r\n  -- ===================================================\r\n\r\n  select count(*)\r\n  into v_question_count\r\n  from development.quiz_question_groups qg\r\n\r\n  join development.quiz_questions qq\r\n    on qq.question_group_id = qg.id\r\n\r\n  where qg.assessment_id = p_assessment_id\r\n    and qg.is_invalidated = false\r\n    and qq.version_id = v_version.id;\r\n\r\n  if v_question_count <\r\n     v_assessment.questions_per_attempt\r\n  then\r\n    raise exception\r\n      'The selected language version does not contain enough questions.';\r\n  end if;\r\n\r\n  -- ===================================================\r\n  -- 9. CALCULAR EXPIRACION\r\n  -- ===================================================\r\n\r\n  v_expires_at := least(\r\n    now()\r\n      + make_interval(\r\n          mins =>\r\n            v_assessment.time_limit_minutes\r\n        ),\r\n    v_effective_until\r\n  );\r\n\r\n  -- ===================================================\r\n  -- 10. CREAR INTENTO\r\n  -- ===================================================\r\n\r\n  insert into development.quiz_attempts (\r\n    assessment_id,\r\n    version_id,\r\n    member_id,\r\n    attempt_number,\r\n    status,\r\n    started_at,\r\n    expires_at\r\n  )\r\n  values (\r\n    p_assessment_id,\r\n    v_version.id,\r\n    p_member_id,\r\n    v_attempt_number,\r\n    'in_progress',\r\n    now(),\r\n    v_expires_at\r\n  )\r\n  returning *\r\n  into v_attempt;\r\n\r\n  -- ===================================================\r\n  -- 11. SELECCIONAR Y CONGELAR PREGUNTAS\r\n  -- ===================================================\r\n\r\n  for v_question in\r\n    select\r\n      qg.id as question_group_id,\r\n      qq.id as question_id,\r\n      qg.question_type,\r\n\r\n      row_number() over (\r\n        order by random()\r\n      )::integer as display_position\r\n\r\n    from development.quiz_question_groups qg\r\n\r\n    join development.quiz_questions qq\r\n      on qq.question_group_id = qg.id\r\n\r\n    where qg.assessment_id = p_assessment_id\r\n      and qg.is_invalidated = false\r\n      and qq.version_id = v_version.id\r\n\r\n    order by random()\r\n\r\n    limit v_assessment.questions_per_attempt\r\n  loop\r\n    /*\r\n     * True/False mantiene su orden.\r\n     * Las demás opciones se mezclan cuando corresponde.\r\n     */\r\n    if v_question.question_type =\r\n       'true_false'::development.quiz_question_type\r\n    then\r\n      select jsonb_agg(\r\n        option_row.id\r\n        order by option_row.position\r\n      )\r\n      into v_option_order\r\n      from development.quiz_question_options option_row\r\n      where option_row.question_id =\r\n        v_question.question_id;\r\n    elsif v_assessment.randomize_options then\r\n      select jsonb_agg(\r\n        option_row.id\r\n        order by random()\r\n      )\r\n      into v_option_order\r\n      from development.quiz_question_options option_row\r\n      where option_row.question_id =\r\n        v_question.question_id;\r\n    else\r\n      select jsonb_agg(\r\n        option_row.id\r\n        order by option_row.position\r\n      )\r\n      into v_option_order\r\n      from development.quiz_question_options option_row\r\n      where option_row.question_id =\r\n        v_question.question_id;\r\n    end if;\r\n\r\n    insert into development.quiz_attempt_questions (\r\n      attempt_id,\r\n      question_group_id,\r\n      question_id,\r\n      display_position,\r\n      option_order\r\n    )\r\n    values (\r\n      v_attempt.id,\r\n      v_question.question_group_id,\r\n      v_question.question_id,\r\n      v_question.display_position,\r\n      coalesce(v_option_order, '[]'::jsonb)\r\n    );\r\n  end loop;\r\n\r\n  -- ===================================================\r\n  -- 12. BLOQUEAR CONTENIDO DESDE EL PRIMER INTENTO\r\n  -- ===================================================\r\n\r\n  update development.quiz_assessments\r\n  set\r\n    content_locked_at =\r\n      coalesce(content_locked_at, v_locked_at),\r\n    updated_at = now()\r\n  where id = p_assessment_id;\r\n\r\n  return v_attempt;\r\nend;$function$\n"
  },
  {
    "function_schema": "public",
    "function_name": "current_member_role",
    "identity_arguments": "",
    "return_type": "member_role",
    "language": "sql",
    "security_definer": false,
    "volatility": "s",
    "function_definition": "CREATE OR REPLACE FUNCTION public.current_member_role()\n RETURNS member_role\n LANGUAGE sql\n STABLE\nAS $function$\r\n  select role\r\n  from public.members\r\n  where id = auth.uid()\r\n$function$\n"
  },
  {
    "function_schema": "public",
    "function_name": "handle_new_user",
    "identity_arguments": "",
    "return_type": "trigger",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION public.handle_new_user()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$begin\r\n  insert into public.members (\r\n    id,\r\n    full_name,\r\n    email,\r\n    phone,\r\n    role,\r\n    status,\r\n    category,\r\n    years_in_cafla,\r\n    ussf_id,\r\n    grade,\r\n    notes\r\n  )\r\n  values (\r\n    new.id,\r\n    new.raw_user_meta_data->>'full_name', -- 👈 viene del invite\r\n    new.email,\r\n    null,\r\n    'member',\r\n    'invited',\r\n    'N/A',\r\n    0,\r\n    'N/A',\r\n    'Grassroot',\r\n    'New Member'\r\n  );\r\n\r\n  return new;\r\nend;$function$\n"
  },
  {
    "function_schema": "public",
    "function_name": "is_board",
    "identity_arguments": "",
    "return_type": "boolean",
    "language": "sql",
    "security_definer": true,
    "volatility": "s",
    "function_definition": "CREATE OR REPLACE FUNCTION public.is_board()\n RETURNS boolean\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n  select exists (\r\n    select 1\r\n    from public.members\r\n    where id = auth.uid()\r\n    and role = 'board'\r\n  );\r\n$function$\n"
  },
  {
    "function_schema": "public",
    "function_name": "run_monthly_ranking_snapshot",
    "identity_arguments": "",
    "return_type": "void",
    "language": "plpgsql",
    "security_definer": false,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION public.run_monthly_ranking_snapshot()\n RETURNS void\n LANGUAGE plpgsql\nAS $function$\r\nbegin\r\n\r\n  insert into ranking_history (\r\n    member_id,\r\n    year,\r\n    month,\r\n    development_score,\r\n    ranking_position,\r\n    referee_level,\r\n    attendance_score,\r\n    quiz_score,\r\n    feedback_score,\r\n    report_score\r\n  )\r\n  select\r\n    id,\r\n    extract(year from now() - interval '1 month'),\r\n    extract(month from now() - interval '1 month'),\r\n    development_score,\r\n    ranking_position,\r\n    referee_level,\r\n    attendance_score,\r\n    quiz_score,\r\n    peer_feedback_score,\r\n    report_score\r\n  from dashboard_referee_ranking_v2\r\n  on conflict (member_id, year, month) do nothing;\r\n\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "public",
    "function_name": "sync_match_report_status",
    "identity_arguments": "",
    "return_type": "trigger",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION public.sync_match_report_status()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\r\nBEGIN\r\n\r\n  UPDATE public.matches\r\n  SET report_status = NEW.status\r\n  WHERE id = NEW.match_id;\r\n\r\n  RETURN NEW;\r\n\r\nEND;\r\n$function$\n"
  },
  {
    "function_schema": "tournaments",
    "function_name": "build_match_context",
    "identity_arguments": "p_match_id uuid",
    "return_type": "jsonb",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION tournaments.build_match_context(p_match_id uuid)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'tournaments'\nAS $function$\r\ndeclare\r\n  v_match public.matches%rowtype;\r\n\r\n  v_organization_id uuid;\r\n  v_season_id uuid;\r\n  v_division_id uuid;\r\n  v_division_season_id uuid;\r\n\r\n  v_home_team_id uuid;\r\n  v_away_team_id uuid;\r\n\r\n  v_home_team_registration_id uuid;\r\n  v_away_team_registration_id uuid;\r\n\r\n  v_has_report boolean;\r\n  v_roster_count integer := 0;\r\nbegin\r\n  -- =====================================================\r\n  -- 1. LOAD MATCH\r\n  -- =====================================================\r\n\r\n  select *\r\n  into v_match\r\n  from public.matches\r\n  where id = p_match_id;\r\n\r\n  if not found then\r\n    return jsonb_build_object(\r\n      'success', false,\r\n      'error_code', 'MATCH_NOT_FOUND',\r\n      'message', 'Match not found.'\r\n    );\r\n  end if;\r\n\r\n\r\n  -- =====================================================\r\n  -- 2. REQUIRE EXPLICIT DIVISION-SEASON\r\n  -- =====================================================\r\n\r\n  if v_match.tournament_division_season_id is null then\r\n    insert into tournaments.match_context_logs (\r\n      match_id,\r\n      status,\r\n      error_code,\r\n      message,\r\n      details\r\n    )\r\n    values (\r\n      p_match_id,\r\n      'failed',\r\n      'DIVISION_SEASON_NOT_SELECTED',\r\n      'The match does not have a tournament division-season selected.',\r\n      jsonb_build_object(\r\n        'arbiter_match_id',\r\n        v_match.arbiter_match_id,\r\n        'division',\r\n        v_match.division\r\n      )\r\n    );\r\n\r\n    return jsonb_build_object(\r\n      'success', false,\r\n      'error_code', 'DIVISION_SEASON_NOT_SELECTED',\r\n      'message',\r\n      'Tournament division-season is required.'\r\n    );\r\n  end if;\r\n\r\n\r\n  -- =====================================================\r\n  -- 3. RESOLVE CONTEXT FROM THE SELECTED DIVISION-SEASON\r\n  -- =====================================================\r\n\r\n  select\r\n    ds.id,\r\n    d.id,\r\n    s.id,\r\n    s.organization_id\r\n  into\r\n    v_division_season_id,\r\n    v_division_id,\r\n    v_season_id,\r\n    v_organization_id\r\n  from tournaments.division_seasons ds\r\n  join tournaments.divisions d\r\n    on d.id = ds.division_id\r\n  join tournaments.seasons s\r\n    on s.id = ds.season_id\r\n  where ds.id =\r\n        v_match.tournament_division_season_id\r\n    and ds.active = true\r\n  limit 1;\r\n\r\n  if v_division_season_id is null then\r\n    insert into tournaments.match_context_logs (\r\n      match_id,\r\n      status,\r\n      error_code,\r\n      message,\r\n      details\r\n    )\r\n    values (\r\n      p_match_id,\r\n      'failed',\r\n      'DIVISION_SEASON_NOT_FOUND',\r\n      'The selected tournament division-season does not exist or is inactive.',\r\n      jsonb_build_object(\r\n        'tournament_division_season_id',\r\n        v_match.tournament_division_season_id\r\n      )\r\n    );\r\n\r\n    return jsonb_build_object(\r\n      'success', false,\r\n      'error_code', 'DIVISION_SEASON_NOT_FOUND',\r\n      'message',\r\n      'Selected tournament division-season could not be resolved.'\r\n    );\r\n  end if;\r\n\r\n\r\n  -- =====================================================\r\n  -- 4. RESOLVE HOME TEAM REGISTRATION\r\n  --\r\n  -- We match the permanent team by name, but only accept\r\n  -- its registration inside the selected division-season.\r\n  -- Internal repeated spaces are normalized.\r\n  -- =====================================================\r\n\r\n  select\r\n    t.id,\r\n    tr.id\r\n  into\r\n    v_home_team_id,\r\n    v_home_team_registration_id\r\n  from tournaments.team_registrations tr\r\n  join tournaments.teams t\r\n    on t.id = tr.team_id\r\n  where tr.division_season_id =\r\n        v_division_season_id\r\n    and tr.active = true\r\n    and t.organization_id =\r\n        v_organization_id\r\n    and t.active = true\r\n    and lower(\r\n      regexp_replace(\r\n        trim(t.name),\r\n        '\\s+',\r\n        ' ',\r\n        'g'\r\n      )\r\n    ) =\r\n    lower(\r\n      regexp_replace(\r\n        trim(v_match.home_team),\r\n        '\\s+',\r\n        ' ',\r\n        'g'\r\n      )\r\n    )\r\n  limit 1;\r\n\r\n  if v_home_team_registration_id is null then\r\n    insert into tournaments.match_context_logs (\r\n      match_id,\r\n      status,\r\n      error_code,\r\n      message,\r\n      details\r\n    )\r\n    values (\r\n      p_match_id,\r\n      'failed',\r\n      'HOME_TEAM_REGISTRATION_NOT_FOUND',\r\n      'The home team is not registered in the selected division-season.',\r\n      jsonb_build_object(\r\n        'home_team',\r\n        v_match.home_team,\r\n        'division_season_id',\r\n        v_division_season_id\r\n      )\r\n    );\r\n\r\n    return jsonb_build_object(\r\n      'success', false,\r\n      'error_code',\r\n      'HOME_TEAM_REGISTRATION_NOT_FOUND',\r\n      'message',\r\n      'Home team registration could not be resolved.'\r\n    );\r\n  end if;\r\n\r\n\r\n  -- =====================================================\r\n  -- 5. RESOLVE AWAY TEAM REGISTRATION\r\n  -- =====================================================\r\n\r\n  select\r\n    t.id,\r\n    tr.id\r\n  into\r\n    v_away_team_id,\r\n    v_away_team_registration_id\r\n  from tournaments.team_registrations tr\r\n  join tournaments.teams t\r\n    on t.id = tr.team_id\r\n  where tr.division_season_id =\r\n        v_division_season_id\r\n    and tr.active = true\r\n    and t.organization_id =\r\n        v_organization_id\r\n    and t.active = true\r\n    and lower(\r\n      regexp_replace(\r\n        trim(t.name),\r\n        '\\s+',\r\n        ' ',\r\n        'g'\r\n      )\r\n    ) =\r\n    lower(\r\n      regexp_replace(\r\n        trim(v_match.away_team),\r\n        '\\s+',\r\n        ' ',\r\n        'g'\r\n      )\r\n    )\r\n  limit 1;\r\n\r\n  if v_away_team_registration_id is null then\r\n    insert into tournaments.match_context_logs (\r\n      match_id,\r\n      status,\r\n      error_code,\r\n      message,\r\n      details\r\n    )\r\n    values (\r\n      p_match_id,\r\n      'failed',\r\n      'AWAY_TEAM_REGISTRATION_NOT_FOUND',\r\n      'The away team is not registered in the selected division-season.',\r\n      jsonb_build_object(\r\n        'away_team',\r\n        v_match.away_team,\r\n        'division_season_id',\r\n        v_division_season_id\r\n      )\r\n    );\r\n\r\n    return jsonb_build_object(\r\n      'success', false,\r\n      'error_code',\r\n      'AWAY_TEAM_REGISTRATION_NOT_FOUND',\r\n      'message',\r\n      'Away team registration could not be resolved.'\r\n    );\r\n  end if;\r\n\r\n\r\n  -- =====================================================\r\n  -- 6. CREATE OR UPDATE MATCH CONTEXT\r\n  -- =====================================================\r\n\r\n  insert into tournaments.match_context (\r\n    match_id,\r\n    division_season_id,\r\n    home_team_registration_id,\r\n    away_team_registration_id\r\n  )\r\n  values (\r\n    p_match_id,\r\n    v_division_season_id,\r\n    v_home_team_registration_id,\r\n    v_away_team_registration_id\r\n  )\r\n  on conflict (match_id)\r\n  do update set\r\n    division_season_id =\r\n      excluded.division_season_id,\r\n    home_team_registration_id =\r\n      excluded.home_team_registration_id,\r\n    away_team_registration_id =\r\n      excluded.away_team_registration_id,\r\n    updated_at = now();\r\n\r\n\r\n  -- =====================================================\r\n  -- 7. PROTECT HISTORICAL ROSTERS\r\n  --\r\n  -- Before a report exists, the roster may be rebuilt.\r\n  -- Once a report exists, existing roster rows remain.\r\n  -- =====================================================\r\n\r\n  select exists (\r\n    select 1\r\n    from public.match_reports mr\r\n    where mr.match_id = p_match_id\r\n  )\r\n  into v_has_report;\r\n\r\n  if not v_has_report then\r\n    delete from tournaments.match_rosters\r\n    where match_id = p_match_id;\r\n  end if;\r\n\r\n\r\n  -- =====================================================\r\n  -- 8. CREATE HOME ROSTER SNAPSHOT\r\n  -- =====================================================\r\n\r\n  insert into tournaments.match_rosters (\r\n    match_id,\r\n    player_id,\r\n    team_id,\r\n    checked_in\r\n  )\r\n  select\r\n    p_match_id,\r\n    pr.player_id,\r\n    v_home_team_id,\r\n    false\r\n  from tournaments.player_registrations pr\r\n  where pr.team_registration_id =\r\n        v_home_team_registration_id\r\n    and pr.active = true\r\n  on conflict (\r\n    match_id,\r\n    player_id\r\n  )\r\n  do nothing;\r\n\r\n\r\n  -- =====================================================\r\n  -- 9. CREATE AWAY ROSTER SNAPSHOT\r\n  -- =====================================================\r\n\r\n  insert into tournaments.match_rosters (\r\n    match_id,\r\n    player_id,\r\n    team_id,\r\n    checked_in\r\n  )\r\n  select\r\n    p_match_id,\r\n    pr.player_id,\r\n    v_away_team_id,\r\n    false\r\n  from tournaments.player_registrations pr\r\n  where pr.team_registration_id =\r\n        v_away_team_registration_id\r\n    and pr.active = true\r\n  on conflict (\r\n    match_id,\r\n    player_id\r\n  )\r\n  do nothing;\r\n\r\n\r\n  select count(*)\r\n  into v_roster_count\r\n  from tournaments.match_rosters\r\n  where match_id = p_match_id;\r\n\r\n\r\n  -- =====================================================\r\n  -- 10. SUCCESS LOG\r\n  -- =====================================================\r\n\r\n  insert into tournaments.match_context_logs (\r\n    match_id,\r\n    status,\r\n    message,\r\n    details\r\n  )\r\n  values (\r\n    p_match_id,\r\n    'success',\r\n    'Match context and roster created successfully.',\r\n    jsonb_build_object(\r\n      'organization_id',\r\n      v_organization_id,\r\n      'season_id',\r\n      v_season_id,\r\n      'division_id',\r\n      v_division_id,\r\n      'division_season_id',\r\n      v_division_season_id,\r\n      'home_team_id',\r\n      v_home_team_id,\r\n      'away_team_id',\r\n      v_away_team_id,\r\n      'home_team_registration_id',\r\n      v_home_team_registration_id,\r\n      'away_team_registration_id',\r\n      v_away_team_registration_id,\r\n      'roster_players',\r\n      v_roster_count\r\n    )\r\n  );\r\n\r\n\r\n  return jsonb_build_object(\r\n    'success', true,\r\n    'match_id', p_match_id,\r\n    'organization_id', v_organization_id,\r\n    'season_id', v_season_id,\r\n    'division_id', v_division_id,\r\n    'division_season_id',\r\n      v_division_season_id,\r\n    'home_team_registration_id',\r\n      v_home_team_registration_id,\r\n    'away_team_registration_id',\r\n      v_away_team_registration_id,\r\n    'roster_players',\r\n      v_roster_count\r\n  );\r\n\r\n\r\nexception\r\n  when others then\r\n    insert into tournaments.match_context_logs (\r\n      match_id,\r\n      status,\r\n      error_code,\r\n      message,\r\n      details\r\n    )\r\n    values (\r\n      p_match_id,\r\n      'failed',\r\n      'UNEXPECTED_DATABASE_ERROR',\r\n      sqlerrm,\r\n      jsonb_build_object(\r\n        'sqlstate',\r\n        sqlstate\r\n      )\r\n    );\r\n\r\n    return jsonb_build_object(\r\n      'success', false,\r\n      'error_code',\r\n      'UNEXPECTED_DATABASE_ERROR',\r\n      'message',\r\n      sqlerrm\r\n    );\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "tournaments",
    "function_name": "handle_match_context_trigger",
    "identity_arguments": "",
    "return_type": "trigger",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION tournaments.handle_match_context_trigger()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'tournaments'\nAS $function$\r\nbegin\r\n  perform tournaments.build_match_context(new.id);\r\n\r\n  return new;\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "tournaments",
    "function_name": "import_team_roster",
    "identity_arguments": "p_organization_name text, p_season_term text, p_season_year integer, p_external_team_id text, p_players jsonb, p_deactivate_missing boolean",
    "return_type": "jsonb",
    "language": "plpgsql",
    "security_definer": true,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION tournaments.import_team_roster(p_organization_name text, p_season_term text, p_season_year integer, p_external_team_id text, p_players jsonb, p_deactivate_missing boolean DEFAULT false)\n RETURNS jsonb\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'tournaments'\nAS $function$\r\ndeclare\r\n  v_organization_id uuid;\r\n  v_team_registration_id uuid;\r\n\r\n  v_player jsonb;\r\n  v_player_id uuid;\r\n\r\n  v_external_player_id text;\r\n  v_first_name text;\r\n  v_last_name text;\r\n  v_birth_date date;\r\n  v_photo_url text;\r\n\r\n  v_processed integer := 0;\r\n  v_registrations integer := 0;\r\n  v_deactivated integer := 0;\r\n\r\n  v_payload_count integer;\r\n  v_distinct_id_count integer;\r\nbegin\r\n  -- -------------------------------------------------------\r\n  -- VALIDATE JSON PAYLOAD\r\n  -- -------------------------------------------------------\r\n\r\n  if p_players is null\r\n     or jsonb_typeof(p_players) <> 'array'\r\n  then\r\n    raise exception\r\n      'p_players must be a JSON array.';\r\n  end if;\r\n\r\n  if jsonb_array_length(p_players) = 0 then\r\n    raise exception\r\n      'The roster cannot be empty.';\r\n  end if;\r\n\r\n  select\r\n    count(*),\r\n    count(\r\n      distinct nullif(\r\n        trim(player->>'external_player_id'),\r\n        ''\r\n      )\r\n    )\r\n  into\r\n    v_payload_count,\r\n    v_distinct_id_count\r\n  from jsonb_array_elements(p_players) player;\r\n\r\n  if v_payload_count <> v_distinct_id_count then\r\n    raise exception\r\n      'The roster contains a missing or duplicated external_player_id.';\r\n  end if;\r\n\r\n\r\n  -- -------------------------------------------------------\r\n  -- RESOLVE ORGANIZATION\r\n  -- -------------------------------------------------------\r\n\r\n  select o.id\r\n  into v_organization_id\r\n  from tournaments.organizations o\r\n  where lower(trim(o.name)) =\r\n        lower(trim(p_organization_name))\r\n  limit 1;\r\n\r\n  if v_organization_id is null then\r\n    raise exception\r\n      'Organization \"%\" was not found.',\r\n      p_organization_name;\r\n  end if;\r\n\r\n\r\n  -- -------------------------------------------------------\r\n  -- RESOLVE TEAM REGISTRATION\r\n  --\r\n  -- external_team_id belongs to the seasonal registration,\r\n  -- not to the permanent team.\r\n  -- -------------------------------------------------------\r\n\r\n  select tr.id\r\n  into v_team_registration_id\r\n  from tournaments.team_registrations tr\r\n\r\n  join tournaments.division_seasons ds\r\n    on ds.id = tr.division_season_id\r\n\r\n  join tournaments.seasons s\r\n    on s.id = ds.season_id\r\n\r\n  where s.organization_id = v_organization_id\r\n    and lower(s.term) =\r\n        lower(trim(p_season_term))\r\n    and s.year = p_season_year\r\n    and tr.external_team_id =\r\n        trim(p_external_team_id)\r\n\r\n  limit 1;\r\n\r\n  if v_team_registration_id is null then\r\n    raise exception\r\n      'Team registration with external ID \"%\" was not found for % %.',\r\n      p_external_team_id,\r\n      p_season_term,\r\n      p_season_year;\r\n  end if;\r\n\r\n\r\n  -- -------------------------------------------------------\r\n  -- UPSERT PLAYERS AND REGISTRATIONS\r\n  -- -------------------------------------------------------\r\n\r\n  for v_player in\r\n    select value\r\n    from jsonb_array_elements(p_players)\r\n  loop\r\n    v_external_player_id :=\r\n      nullif(\r\n        trim(v_player->>'external_player_id'),\r\n        ''\r\n      );\r\n\r\n    v_first_name :=\r\n      nullif(\r\n        trim(v_player->>'first_name'),\r\n        ''\r\n      );\r\n\r\n    v_last_name :=\r\n      nullif(\r\n        trim(v_player->>'last_name'),\r\n        ''\r\n      );\r\n\r\n    v_birth_date :=\r\n      nullif(\r\n        trim(v_player->>'birth_date'),\r\n        ''\r\n      )::date;\r\n\r\n    v_photo_url :=\r\n      nullif(\r\n        trim(v_player->>'photo_url'),\r\n        ''\r\n      );\r\n\r\n    if v_external_player_id is null then\r\n      raise exception\r\n        'Every player must have an external_player_id.';\r\n    end if;\r\n\r\n    if v_first_name is null\r\n       or v_last_name is null\r\n    then\r\n      raise exception\r\n        'Player % must include first_name and last_name.',\r\n        v_external_player_id;\r\n    end if;\r\n\r\n\r\n    insert into tournaments.players (\r\n      organization_id,\r\n      external_player_id,\r\n      first_name,\r\n      last_name,\r\n      birth_date,\r\n      photo_url,\r\n      active\r\n    )\r\n    values (\r\n      v_organization_id,\r\n      v_external_player_id,\r\n      v_first_name,\r\n      v_last_name,\r\n      v_birth_date,\r\n      v_photo_url,\r\n      true\r\n    )\r\n    on conflict (\r\n      organization_id,\r\n      external_player_id\r\n    )\r\n    do update set\r\n      first_name = excluded.first_name,\r\n      last_name = excluded.last_name,\r\n      birth_date = coalesce(\r\n        excluded.birth_date,\r\n        tournaments.players.birth_date\r\n      ),\r\n      photo_url = coalesce(\r\n        excluded.photo_url,\r\n        tournaments.players.photo_url\r\n      ),\r\n      active = true,\r\n      updated_at = now()\r\n    returning id\r\n    into v_player_id;\r\n\r\n    v_processed := v_processed + 1;\r\n\r\n\r\n    insert into tournaments.player_registrations (\r\n      player_id,\r\n      team_registration_id,\r\n      active\r\n    )\r\n    values (\r\n      v_player_id,\r\n      v_team_registration_id,\r\n      true\r\n    )\r\n    on conflict (\r\n      player_id,\r\n      team_registration_id\r\n    )\r\n    do update set\r\n      active = true,\r\n      updated_at = now();\r\n\r\n    v_registrations := v_registrations + 1;\r\n  end loop;\r\n\r\n\r\n  -- -------------------------------------------------------\r\n  -- OPTIONAL FULL-ROSTER SYNCHRONIZATION\r\n  --\r\n  -- Only deactivates seasonal registrations.\r\n  -- It never deletes the permanent player identity.\r\n  -- -------------------------------------------------------\r\n\r\n  if p_deactivate_missing then\r\n    update tournaments.player_registrations pr\r\n    set\r\n      active = false,\r\n      updated_at = now()\r\n\r\n    from tournaments.players p\r\n\r\n    where pr.player_id = p.id\r\n      and pr.team_registration_id =\r\n          v_team_registration_id\r\n      and pr.active = true\r\n      and not exists (\r\n        select 1\r\n        from jsonb_array_elements(p_players) source\r\n        where trim(\r\n          source->>'external_player_id'\r\n        ) = p.external_player_id\r\n      );\r\n\r\n    get diagnostics\r\n      v_deactivated = row_count;\r\n  end if;\r\n\r\n\r\n  return jsonb_build_object(\r\n    'success', true,\r\n    'organization_id', v_organization_id,\r\n    'team_registration_id',\r\n      v_team_registration_id,\r\n    'processed_players', v_processed,\r\n    'active_registrations', v_registrations,\r\n    'deactivated_registrations',\r\n      v_deactivated\r\n  );\r\nend;\r\n$function$\n"
  },
  {
    "function_schema": "tournaments",
    "function_name": "set_updated_at",
    "identity_arguments": "",
    "return_type": "trigger",
    "language": "plpgsql",
    "security_definer": false,
    "volatility": "v",
    "function_definition": "CREATE OR REPLACE FUNCTION tournaments.set_updated_at()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nbegin\r\n  new.updated_at = now();\r\n  return new;\r\nend;\r\n$function$\n"
  }
]
```

---

## Result Interpretation

Each row represents one PostgreSQL function signature.

Important fields:

- `function_schema` — schema containing the function.
- `function_name` — function name.
- `identity_arguments` — arguments that uniquely identify the function signature.
- `return_type` — PostgreSQL return type.
- `language` — implementation language, commonly `sql` or `plpgsql`.
- `security_definer` — whether the function executes with privileges of its owner rather than the caller.
- `volatility` — PostgreSQL volatility classification.
- `function_definition` — complete function implementation.

### Security Definer

A value of `true` deserves particular attention during the security audit.

`SECURITY DEFINER` is not inherently incorrect, but the function executes with the privileges of its owner and therefore must be reviewed carefully for authorization and `search_path` safety.

### Volatility

PostgreSQL internally represents volatility as:

- `i` — IMMUTABLE
- `s` — STABLE
- `v` — VOLATILE

---

## Audit Notes

The existence of a function does not establish that the CAFLA application currently invokes it.

Function usage must later be cross-referenced against:

- Application `.rpc(...)` calls.
- Other PostgreSQL functions.
- Views.
- Triggers.
- Cron jobs.
- Database dependencies.

A function with zero direct frontend references may still be essential because it can be invoked by another database object.

Functions must therefore not be removed solely because Codex cannot find their name in application code.

---

## Preliminary Observation

Functions are considered potentially important business-logic objects until their callers and dependencies are established.

Particular attention should later be given to:

- `SECURITY DEFINER` functions.
- Functions used by triggers.
- Functions invoked by `pg_cron`.
- Quiz lifecycle/scoring functions.
- Development/ranking calculation functions.
- Snapshot refresh/capture functions.
- Functions that reference potential legacy `public` objects.

No function is classified as active, legacy, or removable from this inventory alone.

---

## Audit Status

**Function/RPC inventory captured — classification pending.**

No database changes were performed as part of this audit.