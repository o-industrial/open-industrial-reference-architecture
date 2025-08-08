// SurfaceWarmQueryInspector.tsx
import { useState } from 'npm:preact@10.20.1/hooks';
import { Action, InspectorBase, NodeStatTile } from '../../../../../atomic/.exports.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import { SurfaceWarmQueryStats } from './SurfaceWarmQueryStats.tsx';
import { EaCWarmQueryDetails } from '../../../../eac/.deps.ts';
import { SurfaceWarmQueryModal } from './SurfaceWarmQueryModal.tsx';

type SurfaceWarmQueryInspectorProps = InspectorCommonProps<
  EaCWarmQueryDetails,
  SurfaceWarmQueryStats
>;

export function SurfaceWarmQueryInspector({
  details,
  enabled,
  useStats,
  oiSvc,
  workspaceMgr,
  onDelete,
  onDetailsChanged,
  onToggleEnabled,
}: SurfaceWarmQueryInspectorProps) {
  const stats = useStats();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRunQuery = (query: string) => {
    console.log('Run query:', details.Query);
     const results = oiSvc.Workspaces.Explorer.RunAdHocQuery({
       ...details,
       Query: query,
     });
     oiSvc.Workspaces.Get();
    //const results = oiSvc.Workspaces.Explorer.ListWarmQueries();
    //console.log(results);
    return results;
  };

  const handleSaveQuery = (name: string, apiPath: string, description: string, query: string) => {
    console.log('Saving query with:', { name, apiPath, description, query });
    onDetailsChanged?.({
      ...details,
      ApiPath: apiPath,
      Name: name,
      Query: query,
      Description: description,
    } as Partial<EaCWarmQueryDetails>);
    handleCloseModal();
  };

  return (
    <>
      <InspectorBase
        iconKey='warmQuery'
        label={details.Name ?? 'Warm Query Node'}
        enabled={enabled}
        impulseRates={stats?.impulseRates ?? []}
        onToggleEnabled={onToggleEnabled}
        onDelete={onDelete}
      >
        <NodeStatTile label='Matches' value={stats?.matchesHandled || 0} />
        <NodeStatTile label='Avg Latency' value={`${stats?.avgLatencyMs}ms`} />

        <div class='mt-4'>
          <Action
            type='button'
            onClick={handleOpenModal}
            class='bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded mx-auto block'
          >
            Manage Query
          </Action>
        </div>
      </InspectorBase>

      {isModalOpen && (
        <SurfaceWarmQueryModal
          workspace={workspaceMgr}
          queryName={details.Name ?? ''}
          queryDescription={details.Description ?? ''}
          queryText={details.Query ?? ''}
          queryApiPath={details.ApiPath ?? ''}
          onClose={handleCloseModal}
          onRun={handleRunQuery}
          onSave={handleSaveQuery}
        />
      )}
    </>
  );
}
