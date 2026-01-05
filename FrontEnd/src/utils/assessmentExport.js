// Utility to export assessments to CSV based on current selection model
// Similar in spirit to moduleExport.js

function toCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

function buildCsvRows(assessments, teamsList = [], subteamsList = []) {
  // Exact order and labels requested by user
  const headers = [
    'Assessment Title',
    'Assessment Description',
    'Tags',
    'Thumbnail link',
    'no of questions',
    'Duration',
    'Attempts',
    'Team',
    'SubTeam',
    'Pass Percentage (0-100)',
    'Display Answers',
    'Credits',
    'Stars',
    'Badges',
    'Category'
  ];

  const lines = [headers.map(toCsvValue).join(',')];

  const isLikelyObjectId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
  // Normalize lookup maps for faster resolution
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

  const resolveTeamName = (a) => {
    // Prefer explicit name fields
    if (a?.team && typeof a.team === 'object') return a.team.name || a.team.title || '';
    if (a?.team_name) return a.team_name;
    if (a?.teamName) return a.teamName;
    if (a?.teamTitle) return a.teamTitle;
    // Avoid returning raw ObjectId strings
    if (typeof a?.team === 'string') {
      if (isLikelyObjectId(a.team)) {
        const t = teamById.get(String(a.team));
        return t?.name || t?.teamName || t?.title || '';
      }
      return a.team;
    }
    // Try lookup by id fields
    const teamId = a?.team_id || a?.teamId;
    if (teamId) {
      const t = teamById.get(String(teamId));
      return t?.name || t?.teamName || t?.title || '';
    }
    return '';
  };
  const resolveSubteamName = (a) => {
    if (a?.subteam && typeof a.subteam === 'object') return a.subteam.name || a.subteam.title || '';
    if (a?.subteam_name) return a.subteam_name;
    if (a?.subTeamName) return a.subTeamName;
    if (a?.subteamTitle) return a.subteamTitle;
    if (typeof a?.subteam === 'string') {
      if (isLikelyObjectId(a.subteam)) {
        const st = subteamById.get(String(a.subteam));
        return st?.name || st?.subTeamName || st?.title || '';
      }
      return a.subteam;
    }
    // Try lookup by id fields
    const subId = a?.sub_team_id || a?.subteam_id || a?.subTeamId;
    if (subId) {
      const st = subteamById.get(String(subId));
      return st?.name || st?.subTeamName || st?.title || '';
    }
    return '';
  };

  (assessments || []).forEach(a => {
    const questionsCount = Array.isArray(a.questions)
      ? a.questions.length
      : (Array.isArray(a.sections)
          ? a.sections.reduce((acc, sec) => acc + (Array.isArray(sec.questions) ? sec.questions.length : 0), 0)
          : (Number.isFinite(a.noOfQuestions) ? a.noOfQuestions : 0));

    const passPct =
      Number.isFinite(a.percentage_to_pass) ? a.percentage_to_pass :
      Number.isFinite(a.pass_percentage) ? a.pass_percentage :
      Number.isFinite(a.passPercent) ? a.passPercent : '';

    const displayAnswers =
      typeof a.display_answers !== 'undefined' ? a.display_answers :
      typeof a.show_answers !== 'undefined' ? a.show_answers :
      typeof a.show_correct_answers !== 'undefined' ? a.show_correct_answers : '';

    const row = [
      a.title || '',
      a.description || '',
      Array.isArray(a.tags) ? a.tags.join('|') : (a.tags || ''),
      a.thumbnail || a.thumbnailUrl || a.image || '',
      questionsCount,
      // Duration can be number or string; preserve value
      typeof a.duration === 'number' ? a.duration : (a.duration || ''),
      Number.isFinite(a.attempts) ? a.attempts : (a.attempts || ''),
      resolveTeamName(a),
      resolveSubteamName(a),
      passPct,
      displayAnswers,
      Number.isFinite(a.credits) ? a.credits : (a.credits || ''),
      Number.isFinite(a.stars) ? a.stars : (a.stars || ''),
      Number.isFinite(a.badges) ? a.badges : (a.badges || ''),
      a.category || ''
    ];
    lines.push(row.map(toCsvValue).join(','));
  });

  return lines.join('\n');
}

export function exportAssessmentsWithSelection(assessments, selectedIds = [], excludedIds = [], allSelected = false, teamsList = [], subteamsList = []) {
  if (!Array.isArray(assessments)) assessments = [];

  const resolveId = (a) => a?.uuid || a?._id || a?.id;

  let toExport = [];
  if (allSelected) {
    const excludedSet = new Set((excludedIds || []).map(String));
    toExport = assessments.filter(a => !excludedSet.has(String(resolveId(a))));
  } else if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    const selectedSet = new Set(selectedIds.map(String));
    toExport = assessments.filter(a => selectedSet.has(String(resolveId(a))));
  } else {
    // fallback to current list
    toExport = assessments;
  }

  const csv = buildCsvRows(toExport, teamsList, subteamsList);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `assessments_export_${new Date().toISOString().slice(0,10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
