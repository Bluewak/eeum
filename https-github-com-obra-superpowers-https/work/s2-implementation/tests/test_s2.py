"""S2 최소 동작 확인. 원본 GN-001은 통합 확인에서 한 번만 로드한다."""
import unittest
from datetime import date


class S2Checks(unittest.TestCase):
    def test_malformed_source_dates_never_claim_open(self):
        from backend.rules.evaluation import evaluate_program_conditions
        for verified, start, end in (
            ('2026-10-26INVALID', None, None),
            ('2026-10-26', False, 0),
            ('2026-10-26', '', None),
        ):
            program = {'id': 'synthetic-rule', 'region': 'gangnam',
                       'rulesApproved': True, 'verifiedAt': verified,
                       'offering': {'type': 'open', 'start': start, 'end': end}}
            checks = evaluate_program_conditions({'region': 'gangnam'}, program, date(2026, 10, 26))
            offering = next(c for c in checks if c['field'] == 'offering')
            self.assertEqual(offering['offering_status'], 'unknown')

    def test_candidate_with_common_contract_minimum_fields(self):
        from backend.rules import evaluate_candidates
        checks = evaluate_candidates({'region': 'gangnam', 'age': 63}, [
            {'program_id': 'gn-volunteer', 'need_ids': ['connection'],
             'match_reason': 'test of contract minimum', 'evidence_ids': []}
        ], '2026-10-25')
        self.assertTrue(checks)
        self.assertTrue(all(c['evidence_ids'] for c in checks))

    def test_interfaces_are_available(self):
        from backend.data import load_case, load_regional_context, search_programs
        from backend.rules import evaluate_candidates, build_document_requests
        self.assertTrue(all(callable(f) for f in (
            load_case, load_regional_context, search_programs,
            evaluate_candidates, build_document_requests)))

    def test_missing_and_unusable_inputs_stay_unknown(self):
        from backend.rules.evaluation import evaluate_program_conditions
        p = {'id': 'synthetic-rule', 'region': 'gangnam', 'minAge': 65,
             'incomeRequired': True, 'rulesApproved': False,
             'offering': {'type': 'open'}, 'ruleVersion': 'synthetic-test-only'}
        checks = evaluate_program_conditions(
            {'age': True, 'incomeConfirmed': 'yes',
             'incomeAssessments': {'synthetic-rule': 'yes'}}, p, date(2026, 10, 25))
        by_field = {c['field']: c for c in checks}
        for field in ('age', 'region', 'income', 'rules_approved', 'offering'):
            self.assertEqual(by_field[field]['result'], 'unknown')
        self.assertFalse(by_field['offering']['eligibility_condition'])

    def test_age_boundary_does_not_clear_other_conditions(self):
        from backend.rules.evaluation import evaluate_program_conditions
        p = {'id': 'synthetic-rule', 'region': 'gangnam', 'minAge': 65,
             'rulesApproved': False, 'offering': {'type': 'unknown'}}
        for age, expected in ((64, 'fail'), (65, 'pass')):
            checks = evaluate_program_conditions({'age': age, 'region': 'gangnam'}, p, date(2026, 10, 25))
            by_field = {c['field']: c for c in checks}
            self.assertEqual(by_field['age']['result'], expected)
            self.assertEqual(by_field['detailed_conditions']['result'], 'unknown')

    def test_failed_candidate_never_requests_resident_documents(self):
        from backend.rules import build_document_requests
        check = {'program_id': 'x', 'field': 'age', 'result': 'fail',
                 'eligibility_condition': True}
        missing = {'program_id': 'x', 'field': 'income', 'result': 'unknown',
                   'request': {'field': 'income', 'document_type': None,
                               'question': '자료 확인', 'audience': 'resident'},
                   'reason': '미확인', 'evidence_ids': ['test'], 'rule_version': 'test'}
        self.assertEqual(build_document_requests([check, missing]), [])

    def test_calendar_and_limit_validation(self):
        from backend.data.sources import parse_as_of, validate_limit
        for value in ('2026-02-30', '2026-1-1', 'not-a-date'):
            with self.assertRaises(ValueError):
                parse_as_of(value)
        self.assertEqual(parse_as_of('2026-10-25'), date(2026, 10, 25))
        for limit in (True, -1, 2.3):
            with self.assertRaises(ValueError):
                validate_limit(limit)
        self.assertEqual(validate_limit(50), 6)
        self.assertEqual(validate_limit(0), 0)


if __name__ == '__main__':
    unittest.main()
