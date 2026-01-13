// Utility to export surveys to CSV with specific columns
// Columns: Survey Title, Survey Description, Survey Tags, Number of Sections, Number of Questions, Thumbnail link, Team, SubTeam

function toCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

function buildCsvRows(surveys, teamsList = [], subteamsList = []) {
  const headers = [
    'Survey Title',
    'Survey Description',
    'Survey Tags',
    'Number of Sections',
    'Number of Questions',
    'Thumbnail link',
    'Team',
    'SubTeam',
  ];

  const lines = [headers.map(toCsvValue).join(',')];

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

  const resolveTeamName = (s) => {
    if (s?.team && typeof s.team === 'object') return s.team.name || s.team.title || '';
    if (s?.team_name) return s.team_name;
    if (s?.teamName) return s.teamName;
    if (s?.teamTitle) return s.teamTitle;
    if (typeof s?.team === 'string') {
      if (isLikelyObjectId(s.team)) {
        const t = teamById.get(String(s.team));
        return t?.name || t?.teamName || t?.title || '';
      }
      return s.team;
    }
    const teamId = s?.team_id || s?.teamId;
    if (teamId) {
      const t = teamById.get(String(teamId));
      return t?.name || t?.teamName || t?.title || '';
    }
    if (s?.team?._id) {
      const t = teamById.get(String(s.team._id));
      return t?.name || t?.teamName || t?.title || '';
    }
    return '';
  };

  const resolveSubteamName = (s) => {
    if (s?.subteam && typeof s.subteam === 'object') return s.subteam.name || s.subteam.title || '';
    if (s?.subteam_name) return s.subteam_name;
    if (s?.subTeamName) return s.subTeamName;
    if (s?.subteamTitle) return s.subteamTitle;
    if (typeof s?.subteam === 'string') {
      if (isLikelyObjectId(s.subteam)) {
        const st = subteamById.get(String(s.subteam));
        return st?.name || st?.subTeamName || st?.title || '';
      }
      return s.subteam;
    }
    const subId = s?.sub_team_id || s?.subteam_id || s?.subTeamId;
    if (subId) {
      const st = subteamById.get(String(subId));
      return st?.name || st?.subTeamName || st?.title || '';
    }
    if (s?.subteam?._id) {
      const st = subteamById.get(String(s.subteam._id));
      return st?.name || st?.subTeamName || st?.title || '';
    }
    return '';
  };

  (surveys || []).forEach(s => {
    const numSections = Array.isArray(s.sections) ? s.sections.length : (Number.isFinite(s.noOfSections) ? s.noOfSections : 0);
    const numQuestions = Array.isArray(s.sections)
      ? s.sections.reduce((acc, sec) => acc + (Array.isArray(sec.questions) ? sec.questions.length : 0), 0)
      : (Number.isFinite(s.noOfQuestions) ? s.noOfQuestions : 0);

    const row = [
      s.title || '',
      s.description || '',
      Array.isArray(s.tags) ? s.tags.join('|') : (s.tags || ''),
      numSections,
      numQuestions,
      // s.thumbnail || s.thumbnailUrl || s.image || '',
      '',
      resolveTeamName(s),
      resolveSubteamName(s),
    ];

    lines.push(row.map(toCsvValue).join(','));
  });

  return lines.join('\n');
}

export function exportSurveysWithSelection(surveys, selectedIds = [], excludedIds = [], allSelected = false, teamsList = [], subteamsList = []) {
  if (!Array.isArray(surveys)) surveys = [];

  const resolveId = (s) => s?.uuid || s?._id || s?.id;

  let toExport = [];
  if (allSelected) {
    const excludedSet = new Set((excludedIds || []).map(String));
    toExport = surveys.filter(s => !excludedSet.has(String(resolveId(s))));
  } else if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    const selectedSet = new Set(selectedIds.map(String));
    toExport = surveys.filter(s => selectedSet.has(String(resolveId(s))));
  } else {
    toExport = surveys;
  }

  const csv = buildCsvRows(toExport, teamsList, subteamsList);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `surveys_export_${new Date().toISOString().slice(0,10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
