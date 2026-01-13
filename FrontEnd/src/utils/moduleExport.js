// Module Export Utility
// Exports module data to CSV format

export const exportModulesToCSV = (modules, filters = {}) => {
  // Define CSV headers
  const headers = [
    'Module Title',
    'Module Description', 
    'Learning Outcomes',
    'Tags',
    'Prerequisites',
    'Thumbnail Link',
    'Instructions',
    'Primary File',
    'Additional File',
    'External Resource',
    'External File',
    'Duration',
    'Credits',
    'Stars',
    'Badges',
    'Category',
    'Target Team',
    'Target Subteam',
    'submission feedback',
    'Submission Enabled', 
    'Status',
  ];

  // Transform module data to CSV format
  const csvData = modules.map(module => {
    // Get team name from teams data if available
    const getTeamName = (teamId, teams) => {
      if (!teamId || !teams) return '';
      const team = teams.find(t => t._id === teamId);
      return team ? team.name : teamId;
    };

    // Get subteam name from subteams data if available
    const getSubteamName = (subteamId, subteams) => {
      if (!subteamId || !subteams) return '';
      const subteam = subteams.find(s => s._id === subteamId);
      return subteam ? subteam.name : subteamId;
    };

    // Format learning outcomes as string
    const learningOutcomes = module.learning_outcomes 
      ? Array.isArray(module.learning_outcomes) 
        ? module.learning_outcomes.filter(outcome => outcome && outcome.trim()).join('; ')
        : module.learning_outcomes
      : '';

    // Format tags as string
    const tags = module.tags 
      ? Array.isArray(module.tags) 
        ? module.tags.filter(tag => tag && tag.trim()).join('; ')
        : module.tags
      : '';

    // Get thumbnail URL
    // const thumbnailLink = module.thumbnail || module.primaryFile || '';
       const thumbnailLink = '';
    // Get file names
    const getFileName = (file) => {
      if (!file) return '';
      if (typeof file === 'string') return file.split('/').pop();
      return file.name || '';
    };

    return [
      module.title || '',
      module.description || '',
      learningOutcomes,
      tags,
      module.prerequisites || '',
      thumbnailLink,
      module.instructions || '','','','','',
      // getFileName(module.primaryFile),
      // getFileName(module.additionalFile),
      // module.externalResource || '',
      // getFileName(module.externalFile),
      module.duration || '',
      module.credits || 0,
      module.stars || 0,
      module.badges || 0,
      module.category || '',
      getTeamName(module.team, filters.teams),
      getSubteamName(module.subteam, filters.subteams),
      module.feedbackEnabled ? 'Yes' : 'No',
      module.submissionEnabled ? 'Yes' : 'No',
      module.status || ''
    ];
  });

  // Create CSV content
  const csvContent = [
    headers,
    ...csvData
  ];

  // Convert to CSV string
  const csvString = csvContent.map(row => 
    row.map(field => {
      // Escape quotes and wrap in quotes if field contains comma, quote, or newline
      if (field == null) return '""';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    }).join(',')
  ).join('\n');

  // Add BOM for proper UTF-8 handling in Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvString;

  // Create blob and download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `modules_export_${timestamp}.csv`;
    
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }
};

export const exportFilteredModules = (modules, filters, teams, subteams) => {
  // Apply filters to modules before export
  const filteredModules = modules.filter(module => {
    const matchesStatus = !filters.status || filters.status === '' || module.status === filters.status;
    const matchesCategory = !filters.category || filters.category === '' || module.category === filters.category;
    const matchesTeam = !filters.team || filters.team === '' || module.team === filters.team;
    const matchesSubteam = !filters.subteam || filters.subteam === '' || module.subteam === filters.subteam;
    const matchesSearch = !filters.search || 
      (module.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
       module.description?.toLowerCase().includes(filters.search.toLowerCase()));

    return matchesStatus && matchesCategory && matchesTeam && matchesSubteam && matchesSearch;
  });

  // Export with additional context for team/subteam names
  exportModulesToCSV(filteredModules, { teams, subteams });
};

export const exportSelectedModules = (selectedModules, teams, subteams, selectionScope, totalCount) => {
  // Export selected modules with team/subteam name resolution
  exportModulesToCSV(selectedModules, { teams, subteams });
};

export const exportModulesWithSelection = (allModules, selectedIds, excludedIds, allSelected, teams, subteams, filters) => {
  let modulesToExport = [];

  if (allSelected) {
    // Export all modules except excluded ones
    modulesToExport = allModules.filter(module => {
      const moduleId = module.uuid || module._id || module.id;
      return !excludedIds.includes(moduleId);
    });
  } else if (selectedIds.length > 0) {
    // Export only selected modules
    modulesToExport = allModules.filter(module => {
      const moduleId = module.uuid || module._id || module.id;
      return selectedIds.includes(moduleId);
    });
  } else {
    // No selection, export filtered modules
    return exportFilteredModules(allModules, filters, teams, subteams);
  }

  // Export the selected modules
  exportModulesToCSV(modulesToExport, { teams, subteams });
};
