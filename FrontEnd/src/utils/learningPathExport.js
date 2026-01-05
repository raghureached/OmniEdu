// Export Learning Paths to CSV with selected/all support
// Columns: Title, Description, Tags, Est. Duration (mins), Updated At, Status, Category

function toCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}` + `"`;
}

function buildCsvRows(paths, teamsList = [], subteamsList = []) {
  // Requested columns and order
  const headers = [
    'Title',
    'Description',
    'Tags',
    'Prerequisite',
    'Thumbnail link',
    'Duration',
    'Credits',
    'Stars',
    'Badges',
    'Category',
    'Team',
    'SubTeam',
  ];
  const lines = [headers.map(toCsvValue).join(',')];

  // Optional lookup maps
  const isLikelyObjectId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
  const teamById = new Map();
  const subteamById = new Map();
  (Array.isArray(teamsList) ? teamsList : []).forEach(t => {
    const id = t?._id || t?.id || t?.uuid;
    if (id) teamById.set(String(id), t);
    const subs = Array.isArray(t?.subTeams) ? t.subTeams : Array.isArray(t?.subteams) ? t.subteams : [];
    subs.forEach(st => {
      const sid = st?._id || st?.id || st?.uuid;
      if (sid) subteamById.set(String(sid), st);
    });
  });
  (Array.isArray(subteamsList) ? subteamsList : []).forEach(st => {
    const sid = st?._id || st?.id || st?.uuid;
    if (sid && !subteamById.has(String(sid))) subteamById.set(String(sid), st);
  });

  const resolveTeamName = (p) => {
    if (p?.team && typeof p.team === 'object') return p.team.name || p.team.title || '';
    if (p?.team_name) return p.team_name;
    if (p?.teamName) return p.teamName;
    if (p?.teamTitle) return p.teamTitle;
    if (typeof p?.team === 'string') {
      if (isLikelyObjectId(p.team)) {
        const t = teamById.get(String(p.team));
        return t?.name || t?.teamName || t?.title || '';
      }
      return p.team;
    }
    const teamId = p?.team_id || p?.teamId;
    if (teamId) {
      const t = teamById.get(String(teamId));
      return t?.name || t?.teamName || t?.title || '';
    }
    if (p?.team?._id) {
      const t = teamById.get(String(p.team._id));
      return t?.name || t?.teamName || t?.title || '';
    }
    return '';
  };
  const resolveSubteamName = (p) => {
    if (p?.subteam && typeof p.subteam === 'object') return p.subteam.name || p.subteam.title || '';
    if (p?.subteam_name) return p.subteam_name;
    if (p?.subTeamName) return p.subTeamName;
    if (p?.subteamTitle) return p.subteamTitle;
    if (typeof p?.subteam === 'string') {
      if (isLikelyObjectId(p.subteam)) {
        const st = subteamById.get(String(p.subteam));
        return st?.name || st?.subTeamName || st?.title || '';
      }
      return p.subteam;
    }
    const subId = p?.sub_team_id || p?.subteam_id || p?.subTeamId;
    if (subId) {
      const st = subteamById.get(String(subId));
      return st?.name || st?.subTeamName || st?.title || '';
    }
    if (p?.subteam?._id) {
      const st = subteamById.get(String(p.subteam._id));
      return st?.name || st?.subTeamName || st?.title || '';
    }
    return '';
  };

  (paths || []).forEach(p => {
    const row = [
      p.title || '',
      p.description || '',
      Array.isArray(p.tags) ? p.tags.join('|') : (p.tags || ''),
      p.prerequisite || p.prerequisites || '',
      p.thumbnail || p.thumbnailUrl || p.image || '',
      typeof p.duration === 'number' ? p.duration : (p.duration || ''),
      Number.isFinite(p.credits) ? p.credits : (p.credits || ''),
      Number.isFinite(p.stars) ? p.stars : (p.stars || ''),
      Number.isFinite(p.badges) ? p.badges : (p.badges || ''),
      p.category || '',
      resolveTeamName(p),
      resolveSubteamName(p),
    ];
    lines.push(row.map(toCsvValue).join(','));
  });

  return lines.join('\n');
}

export function exportLearningPathsWithSelection(paths, selectedIds = [], excludedIds = [], allSelected = false, teamsList = [], subteamsList = []) {
  if (!Array.isArray(paths)) paths = [];

  const resolveId = (p) => p?.uuid || p?.id || p?._id;

  let toExport = [];
  if (allSelected) {
    const excludedSet = new Set((excludedIds || []).map(String));
    toExport = paths.filter(p => !excludedSet.has(String(resolveId(p))));
  } else if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    const selectedSet = new Set(selectedIds.map(String));
    toExport = paths.filter(p => selectedSet.has(String(resolveId(p))));
  } else {
    toExport = paths;
  }

  const csv = buildCsvRows(toExport, teamsList, subteamsList);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `learning_paths_export_${new Date().toISOString().slice(0,10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
