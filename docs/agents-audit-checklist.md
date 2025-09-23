# Agents Documentation Quarterly Audit Checklist

Use this checklist during the first week of each quarter to ensure Agents.md guidance remains accurate across Open Industrial repositories.

## Preparation
- [ ] Compile list of all `Agents.md` files using `rg --files -g "Agents.md"` from repo root.
- [ ] Review merged PRs since last audit for feature areas without corresponding doc updates.
- [ ] Confirm owner availability (primary and backup) for each guide.

## Audit Steps
1. **Content Accuracy**
   - [ ] Validate scope statements still match implemented features.
   - [ ] Confirm project maps reference current directory structure.
   - [ ] Check commands and scripts remain valid; update if CLI changed.
2. **Patterns & Checklists**
   - [ ] Ensure listed patterns align with current architecture decisions.
   - [ ] Verify review/test checklist items match required pipelines.
3. **Safety & Guardrails**
   - [ ] Confirm guardrails reflect latest security/performance constraints.
   - [ ] Add new risks identified in retros/incident reviews.
4. **Ownership Signals**
   - [ ] Update owners/contacts if teams have shifted.
   - [ ] Ensure escalation path is still correct.
5. **Dependencies & Integrations**
   - [ ] Cross-check integrations with other repos/services; note new dependencies.
6. **Related Docs & Links**
   - [ ] Test cross-links (parent/child guides, READMEs, diagrams) for accuracy.
   - [ ] Add references to new documentation assets as needed.
7. **Changelog Expectations**
   - [ ] Verify cadence statements; adjust review frequency if necessary.
   - [ ] Record highlights from this audit in the repo change log or Confluence note.

## Post-Audit Actions
- [ ] File GitHub issues for gaps, tagging `agents-doc` and assigning owners.
- [ ] Update `Agents.md` files with agreed changes within one sprint.
- [ ] Summarize audit findings and share in #engineering and project stand-ups.
- [ ] Update `Plan.md` status table with completion date for this audit cycle.

## Notes
- Product Operations (Leah Tran) facilitates the session, captures minutes, and confirms follow-up.
- If major structural changes are planned, schedule an interim audit before the next quarter.
