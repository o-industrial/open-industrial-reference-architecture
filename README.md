# open-industrial-reference-architecture

## Commit Indicator and Flyout

This reference architecture includes a commit indicator that reflects the health of
recent workspace commits. The indicator displays one of three states:

- **success** – all commits have completed successfully
- **processing** – at least one commit is still running
- **error** – a commit ended in failure

Selecting the indicator opens a flyout panel that lists recent commits and their
statuses. The panel automatically polls for updates every four seconds and the
polling interval is cleared when the panel is unmounted to avoid memory leaks.
