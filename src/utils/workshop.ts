import { AssetDetailResponse } from '../api/model';

// The Workshop API only returns one level of dependencies per asset, so this
// is just the immediate dependency ids — see FormModsInput's
// resolveDependencyMods for how the transitive closure gets walked.
export function depIdsOf(detail: AssetDetailResponse | undefined): string[] {
    return (detail?.version_detail.dependencies ?? []).map(d => d.asset?.id).filter((id): id is string => !!id);
}
