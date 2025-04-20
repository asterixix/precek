import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllData } from '../src/services/database';
import { useTheme } from '@mui/material/styles';
import useTextAnalysis from '../src/hooks/useTextAnalysis';
import dynamic from 'next/dynamic';

// Material UI components
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Material UI Icons
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';

// Import visualization components
import OverviewSummaryTab from '../src/components/OverviewSummaryTab';
import WordFrequencyTab from '../src/components/WordFrequencyTab';
import SentimentAnalysisTab from '../src/components/SentimentAnalysisTab';
import TextRelationshipsTab from '../src/components/TextRelationshipsTab';
import TtrAnalysisTab from '../src/components/TtrAnalysisTab';
import ConcordanceTab from '../src/components/ConcordanceTab';
import TopicModelingTab from '../src/components/TopicModelingTab';
import PhrasesLinkTab from '../src/components/PhrasesLinkTab';
import TextAnalysisVisualizations from '../src/components/TextAnalysisVisualizations';

// Import React Grid Layout with SSR disabled
const GridLayout = dynamic(() => import('react-grid-layout'), {
  ssr: false,
  loading: () => <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress /></Box>
});

// Define a fallback spinner component using Material UI
const FallbackSpinner = () => (
  <CircularProgress size={48} />
);

// Use our fallback spinner directly since the import is problematic
const DynamicSpinner = FallbackSpinner;

// Define the TabPanel for classic view
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Define available visualization types
const visualizationTypes = [
  { id: 'overview', name: 'Overview Summary', component: OverviewSummaryTab, defaultSize: { w: 12, h: 2 } },
  { id: 'wordFrequency', name: 'Word Frequency', component: WordFrequencyTab, defaultSize: { w: 6, h: 4 } },
  { id: 'sentiment', name: 'Sentiment Analysis', component: SentimentAnalysisTab, defaultSize: { w: 6, h: 4 } },
  { id: 'relationships', name: 'Text Relationships', component: TextRelationshipsTab, defaultSize: { w: 6, h: 4 } },
  { id: 'ttr', name: 'TTR Analysis', component: TtrAnalysisTab, defaultSize: { w: 6, h: 4 } },
  { id: 'concordance', name: 'Concordance', component: ConcordanceTab, defaultSize: { w: 6, h: 4 } },
  { id: 'topics', name: 'Topic Modeling', component: TopicModelingTab, defaultSize: { w: 6, h: 4 } },
  { id: 'phraseLinks', name: 'Phrase Links', component: PhrasesLinkTab, defaultSize: { w: 6, h: 4 } },
];

// Define the default dashboard layout with improved positioning
const DEFAULT_DASHBOARD_LAYOUT = {
  id: 'default',
  name: 'Default Dashboard',
  widgets: [
    { i: 'overview-default', x: 0, y: 0, w: 12, h: 2, type: 'overview', options: {} },
    { i: 'sentiment-default', x: 0, y: 2, w: 6, h: 4, type: 'sentiment', options: {} },
    { i: 'wordFrequency-default', x: 6, y: 2, w: 6, h: 4, type: 'wordFrequency', options: {} },
    { i: 'topics-default', x: 0, y: 6, w: 6, h: 4, type: 'topics', options: {} },
    { i: 'relationships-default', x: 6, y: 6, w: 6, h: 4, type: 'relationships', options: {} }
  ]
};

// Dynamically import A-Frame to avoid server-side rendering issues
export default function VisualizationPage() {
  const theme = useTheme();
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'classic'
  const [activeTab, setActiveTab] = useState(0); // For classic view tabs
  
  // Dashboard configuration states
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [layoutReady, setLayoutReady] = useState(false);
  
  // Container width for proper layout calculation
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = React.useRef(null);

  // Measure container width for responsive grid layout
  useEffect(() => {
    if (containerRef.current && viewMode === 'dashboard') {
      const updateWidth = () => {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      };
      
      // Initial measurement
      updateWidth();
      
      // Update on resize
      const handleResize = () => {
        requestAnimationFrame(updateWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [viewMode, containerRef.current, activeDashboard?.id]);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if A-Frame is already loaded
    if (window.AFRAME) {
      setAframeLoaded(true);
      return;
    }

    // Load A-Frame script dynamically when component mounts (client-side only)
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.async = true;
    
    // Set the state when the script is loaded
    script.onload = () => {
      console.log('A-Frame script loaded successfully');
      // Increase timeout to ensure AFRAME global is fully initialized
      setTimeout(() => {
        setAframeLoaded(true);
      }, 300);
    };
    
    script.onerror = (error) => {
      console.error('Error loading A-Frame script:', error);
    };
    
    document.body.appendChild(script);
    
    // Clean up script when component unmounts
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // State for raw data and analysis results
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard configuration states
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);
  const [customizeWidgetDialogOpen, setCustomizeWidgetDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [selectedWidgetType, setSelectedWidgetType] = useState('');
  const [customSizeInputs, setCustomSizeInputs] = useState({ w: 6, h: 4 });
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [resetToDefaultDialogOpen, setResetToDefaultDialogOpen] = useState(false);

  // Menu state for the "more" button
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Get analyzed data
  const {
    overviewData,
    wordFrequencyData,
    sentimentData,
    relationshipData,
    ttrData,
    concordanceData,
    topicModelData,
    phraseLinkData,
    isLoading: isAnalysisLoading,
    searchConcordance
  } = useTextAnalysis(data);

  // Memoize the handler passed to ConcordanceTab
  const handleConcordanceSearch = useCallback((term) => {
    if (searchConcordance) {
      searchConcordance(term);
    }
  }, [searchConcordance]);

  // Toggle view mode between dashboard and classic
  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'dashboard' ? 'classic' : 'dashboard');
  };

  // Handle tab change for classic view
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Load data from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const processedData = await getAllData();
        setData(processedData || []);
        
        // Check if we should use the dashboard view or classic view by default
        const lastUsedView = localStorage.getItem('precek-view-mode');
        if (lastUsedView) {
          setViewMode(lastUsedView);
        }
        
        // Load saved dashboard configurations from localStorage
        const savedDashboards = localStorage.getItem('precek-dashboards');
        if (savedDashboards) {
          try {
            const parsedDashboards = JSON.parse(savedDashboards);
            
            // Make sure every widget has proper positioning data
            const validatedDashboards = parsedDashboards.map(dashboard => ({
              ...dashboard,
              widgets: dashboard.widgets.map(widget => ({
                ...widget,
                // Ensure x, y, w, h are numbers, provide defaults if missing
                x: typeof widget.x === 'number' ? widget.x : 0,
                y: typeof widget.y === 'number' ? widget.y : 0,
                w: typeof widget.w === 'number' ? widget.w : 6,
                h: typeof widget.h === 'number' ? widget.h : 4
              }))
            }));
            
            setDashboards(validatedDashboards);
            
            // If there's at least one dashboard, set it as active
            if (validatedDashboards.length > 0) {
              setActiveDashboard(validatedDashboards[0]);
              // Delay setting layout ready to ensure all components are mounted
              setTimeout(() => setLayoutReady(true), 100);
            } else {
              // Create default dashboard if none exist
              createDefaultDashboard();
            }
          } catch (error) {
            console.error("Error parsing dashboards from localStorage:", error);
            createDefaultDashboard();
          }
        } else {
          // Create default dashboard if none exist
          createDefaultDashboard();
        }
      } catch (err) {
        console.error('Error loading data for visualization:', err);
        setError('Failed to load data for visualization');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save the current view mode preference
  useEffect(() => {
    localStorage.setItem('precek-view-mode', viewMode);
  }, [viewMode]);
  
  // Add an effect to save the active dashboard whenever it changes
  useEffect(() => {
    if (activeDashboard) {
      // Save the current active dashboard in localStorage
      const updatedDashboards = dashboards.map(dash => 
        dash.id === activeDashboard.id ? activeDashboard : dash
      );
      
      // Only update localStorage if we have dashboards
      if (updatedDashboards.length > 0) {
        console.log('Auto-saving dashboard on change:', activeDashboard);
        localStorage.setItem('precek-dashboards', JSON.stringify(updatedDashboards));
      }
    }
  }, [activeDashboard, dashboards]);

  // Create a default dashboard using the DEFAULT_DASHBOARD_LAYOUT constant
  const createDefaultDashboard = () => {
    const defaultDashboard = {
      ...DEFAULT_DASHBOARD_LAYOUT,
      id: 'default-' + Date.now(), // Ensure unique ID
    };
    
    setDashboards([defaultDashboard]);
    setActiveDashboard(defaultDashboard);
    
    // Add a slight delay to make sure the dashboard is initialized properly
    setTimeout(() => {
      setLayoutReady(true);
      // Save to localStorage - ensure it's properly stringified
      localStorage.setItem('precek-dashboards', JSON.stringify([defaultDashboard]));
    }, 100);
  };
  
  // Create a new dashboard using the default layout
  const handleCreateDefaultDashboard = () => {
    // Generate a unique name with timestamp to avoid conflicts
    const dashboardName = `Default Dashboard (${new Date().toLocaleTimeString()})`;
    
    const newDefaultDashboard = {
      ...DEFAULT_DASHBOARD_LAYOUT,
      id: 'default-' + Date.now(),
      name: dashboardName
    };
    
    const updatedDashboards = [...dashboards, newDefaultDashboard];
    saveDashboards(updatedDashboards);
    setActiveDashboard(newDefaultDashboard);
    setLayoutReady(true); // Make sure layout is ready for the new dashboard
    handleCloseMenu();
    
    setSnackbarMessage('Default dashboard created');
    setSnackbarOpen(true);
  };
  
  // Reset to default dashboard layout
  const handleResetToDefault = () => {
    if (!activeDashboard) return;
    
    const resetDashboard = {
      ...DEFAULT_DASHBOARD_LAYOUT,
      id: activeDashboard.id,
      name: activeDashboard.name
    };
    
    const updatedDashboards = dashboards.map(dash => 
      dash.id === resetDashboard.id ? resetDashboard : dash
    );
    
    setActiveDashboard(resetDashboard);
    saveDashboards(updatedDashboards);
    setSnackbarMessage('Dashboard layout reset to default');
    setSnackbarOpen(true);
    setResetToDefaultDialogOpen(false);
  };
  
  // Save dashboards to localStorage
  const saveDashboards = (updatedDashboards) => {
    console.log('Saving dashboards to localStorage:', updatedDashboards);
    
    // Ensure all layouts have valid position data before saving
    const validatedDashboards = updatedDashboards.map(dashboard => ({
      ...dashboard,
      widgets: dashboard.widgets.map(widget => ({
        ...widget,
        x: typeof widget.x === 'number' ? widget.x : 0,
        y: typeof widget.y === 'number' ? widget.y : 0,
        w: typeof widget.w === 'number' ? widget.w : 6,
        h: typeof widget.h === 'number' ? widget.h : 4
      }))
    }));
    
    localStorage.setItem('precek-dashboards', JSON.stringify(validatedDashboards));
    setDashboards(validatedDashboards);
  };
  
  // Handle layout change in grid layout - improve this to preserve positions
  const handleLayoutChange = (layout) => {
    if (!activeDashboard || !layoutReady) return;
    
    // Update widgets with new positions
    const updatedWidgets = activeDashboard.widgets.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.i);
      if (layoutItem) {
        return { 
          ...widget, 
          x: parseInt(layoutItem.x, 10), 
          y: parseInt(layoutItem.y, 10), 
          w: parseInt(layoutItem.w, 10), 
          h: parseInt(layoutItem.h, 10)
        };
      }
      return widget;
    });
    
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets };
    const updatedDashboards = dashboards.map(dash => 
      dash.id === updatedDashboard.id ? updatedDashboard : dash
    );
    
    setActiveDashboard(updatedDashboard);
    saveDashboards(updatedDashboards);
  };
  
  // Explicitly save the current dashboard layout
  const handleSaveLayout = () => {
    if (!activeDashboard) return;
    
    // Force save the current layout to localStorage
    const updatedDashboards = dashboards.map(dash => 
      dash.id === activeDashboard.id ? activeDashboard : dash
    );
    
    localStorage.setItem('precek-dashboards', JSON.stringify(updatedDashboards));
    console.log('Dashboard layout explicitly saved:', activeDashboard);
    
    setSnackbarMessage('Dashboard layout saved successfully');
    setSnackbarOpen(true);
  };

  // Create a new dashboard
  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) {
      setSnackbarMessage('Dashboard name cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    
    const newDashboard = {
      id: 'dashboard-' + Date.now(),
      name: newDashboardName,
      widgets: [] // Start with empty widgets, user can add them or choose to use default layout
    };
    
    const updatedDashboards = [...dashboards, newDashboard];
    saveDashboards(updatedDashboards);
    setActiveDashboard(newDashboard);
    setDashboardDialogOpen(false);
    setNewDashboardName('');
    setIsEditMode(true); // Enter edit mode for the new dashboard
  };
  
  // Delete the current dashboard
  const handleDeleteDashboard = () => {
    if (!activeDashboard || dashboards.length <= 1) {
      setSnackbarMessage('Cannot delete the last dashboard');
      setSnackbarOpen(true);
      return;
    }
    
    const updatedDashboards = dashboards.filter(dash => dash.id !== activeDashboard.id);
    saveDashboards(updatedDashboards);
    setActiveDashboard(updatedDashboards[0]);
    handleCloseMenu();
  };
  
  // Add a new widget to the dashboard
  const handleAddWidget = () => {
    if (!selectedWidgetType || !activeDashboard) return;
    
    const widgetType = visualizationTypes.find(type => type.id === selectedWidgetType);
    if (!widgetType) return;
    
    const newWidget = {
      i: `${selectedWidgetType}-${Date.now()}`,
      x: 0,
      y: 0,
      w: customSizeInputs.w || widgetType.defaultSize.w,
      h: customSizeInputs.h || widgetType.defaultSize.h,
      type: selectedWidgetType,
      options: {}
    };
    
    const updatedWidgets = [...activeDashboard.widgets, newWidget];
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets };
    
    const updatedDashboards = dashboards.map(dash => 
      dash.id === updatedDashboard.id ? updatedDashboard : dash
    );
    
    setActiveDashboard(updatedDashboard);
    saveDashboards(updatedDashboards);
    setAddWidgetDialogOpen(false);
    setSelectedWidgetType('');
    setCustomSizeInputs({ w: 6, h: 4 }); // Reset to default
  };
  
  // Open the customize widget dialog
  const handleOpenCustomizeWidget = (widget, event) => {
    // Stop propagation to prevent grid layout from capturing the event
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!widget) return;
    
    console.log('Opening customize widget dialog for:', widget);
    
    // Store the current widget data in state
    setSelectedWidget(widget);
    // Initialize the custom size inputs with the current widget size
    setCustomSizeInputs({ 
      w: typeof widget.w === 'number' ? widget.w : 6, 
      h: typeof widget.h === 'number' ? widget.h : 4 
    });
    
    // Open the dialog
    setCustomizeWidgetDialogOpen(true);
  };
  
  // Apply custom size to widget
  const handleApplyCustomSize = () => {
    if (!selectedWidget || !activeDashboard) return;
    
    // Clone the widgets array to avoid direct state mutation
    const updatedWidgets = activeDashboard.widgets.map(widget => {
      if (widget.i === selectedWidget.i) {
        // Update the widget with new dimensions
        return { 
          ...widget, 
          w: parseInt(customSizeInputs.w, 10), 
          h: parseInt(customSizeInputs.h, 10) 
        };
      }
      return widget;
    });
    
    // Create an updated dashboard with the modified widgets
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets };
    
    // Update the dashboards list
    const updatedDashboards = dashboards.map(dash => 
      dash.id === updatedDashboard.id ? updatedDashboard : dash
    );
    
    // Update state and localStorage
    setActiveDashboard(updatedDashboard);
    saveDashboards(updatedDashboards);
    
    // Close dialog and clear selection
    setCustomizeWidgetDialogOpen(false);
    setSelectedWidget(null);
    
    // Show confirmation
    setSnackbarMessage('Widget size updated');
    setSnackbarOpen(true);
  };
  
  // Remove a widget from dashboard
  const handleRemoveWidget = (widgetId, event) => {
    // Stop propagation to prevent grid layout from capturing the event
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!activeDashboard || !widgetId) return;
    
    console.log(`Removing widget with ID: ${widgetId}`);
    
    // Filter out the widget with the given ID
    const updatedWidgets = activeDashboard.widgets.filter(widget => widget.i !== widgetId);
    
    // Create updated dashboard object
    const updatedDashboard = { ...activeDashboard, widgets: updatedWidgets };
    
    // Update dashboards list
    const updatedDashboards = dashboards.map(dash => 
      dash.id === updatedDashboard.id ? updatedDashboard : dash
    );
    
    // Update state and localStorage
    console.log(`Updated widget count: ${updatedWidgets.length}`);
    setActiveDashboard(updatedDashboard);
    saveDashboards(updatedDashboards);
    
    // Show confirmation
    setSnackbarMessage('Widget removed');
    setSnackbarOpen(true);
  };
  
  // Switch to a different dashboard
  const handleSwitchDashboard = (dashboardId) => {
    const dashboard = dashboards.find(dash => dash.id === dashboardId);
    if (dashboard) {
      setActiveDashboard(dashboard);
      handleCloseMenu();
    }
  };
  
  // Export dashboard configuration
  const handleExportDashboard = () => {
    if (!activeDashboard) return;
    
    try {
      const dashboardConfig = JSON.stringify(activeDashboard, null, 2);
      const blob = new Blob([dashboardConfig], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeDashboard.name.replace(/\s+/g, '-').toLowerCase()}-config.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      setSnackbarMessage('Dashboard configuration exported successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error exporting dashboard:', err);
      setSnackbarMessage('Failed to export dashboard configuration');
      setSnackbarOpen(true);
    }
    
    handleCloseMenu();
  };
  
  // Export visualization data
  const handleExportData = () => {
    try {
      // Prepare data for export
      const exportData = {
        overview: overviewData,
        wordFrequency: wordFrequencyData,
        sentiment: sentimentData,
        relationships: relationshipData,
        ttr: ttrData,
        topics: topicModelData,
        phraseLinks: phraseLinkData,
        exportDate: new Date().toISOString()
      };
      
      const dataJson = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `precek-visualization-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      setSnackbarMessage('Visualization data exported successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error exporting data:', err);
      setSnackbarMessage('Failed to export visualization data');
      setSnackbarOpen(true);
    }
    
    handleCloseMenu();
  };
  
  // Toggle edit mode
  const handleToggleEditMode = () => {
    setIsEditMode(prevMode => !prevMode);
  };
  
  // Menu handlers
  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Render the content for a specific widget type
  const renderWidgetContent = (type, options, widgetId) => {
    const analysisLoading = isAnalysisLoading || isLoading;
    
    switch(type) {
      case 'overview':
        return <OverviewSummaryTab overviewData={overviewData} isLoading={analysisLoading} />;
      case 'wordFrequency':
        return <WordFrequencyTab wordFrequencyData={wordFrequencyData} isLoading={analysisLoading} />;
      case 'sentiment':
        return <SentimentAnalysisTab sentimentData={sentimentData} isLoading={analysisLoading} />;
      case 'relationships':
        return <TextRelationshipsTab relationshipData={relationshipData} isLoading={analysisLoading} />;
      case 'ttr':
        return <TtrAnalysisTab ttrData={ttrData} isLoading={analysisLoading} />;
      case 'concordance':
        return <ConcordanceTab concordanceData={concordanceData} onSearch={handleConcordanceSearch} isLoading={analysisLoading} />;
      case 'topics':
        return <TopicModelingTab topicModelData={topicModelData} isLoading={analysisLoading} />;
      case 'phraseLinks':
        return <PhrasesLinkTab phraseLinkData={phraseLinkData} isLoading={analysisLoading} />;
      default:
        return <Box sx={{ p: 2 }}>Unknown widget type</Box>;
    }
  };
  
  // Find widget type name
  const getWidgetTypeName = (typeId) => {
    const type = visualizationTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  // Render appropriate content based on loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <DynamicSpinner />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading visualization data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Link href="/" passHref>
          <Button variant="contained" startIcon={<HomeIcon />} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Link>
      </Box>
    );
  }

  // Only render A-Frame related components when aframeLoaded is true
  const AFrameScene = dynamic(
    () => import('../src/components/AFrameComponentWrapper'), // Updated import path
    { 
      ssr: false, // Ensure it's not rendered on the server
      loading: () => <DynamicSpinner /> // Show spinner while loading
    }
  );

  return (
    <>
      <Head>
        <title>Visualization Dashboard - Precek</title>
        <meta name="description" content="Customizable dashboard for visualizing processed data" />
        {/* Add the react-grid-layout stylesheet */}
        <link rel="stylesheet" href="https://unpkg.com/react-grid-layout@1.3.4/css/styles.css" />
        <link rel="stylesheet" href="https://unpkg.com/react-resizable@3.0.5/css/styles.css" />
        <style dangerouslySetInnerHTML={{__html: `
          /* Make resize handles more visible */
          .react-resizable-handle {
            background-color: rgba(0, 0, 0, 0.15);
            width: 12px;
            height: 12px;
            border-radius: 3px;
            bottom: 2px;
            right: 2px;
            padding: 0;
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          .react-grid-item:hover .react-resizable-handle {
            opacity: 1;
          }
          
          /* Make drag indicator more prominent */
          .drag-handle {
            cursor: move;
          }
          
          /* Custom transition for smooth movements */
          .react-grid-item.cssTransforms {
            transition: transform 150ms ease-out, opacity 150ms ease-out;
          }
          
          /* Layout wrapper to ensure proper dimensions */
          .layout-wrapper {
            width: 100%;
            min-height: 500px;
          }
          
          /* Prevent initial overlap */
          .layout {
            position: relative;
          }
          
          /* Make sure widgets don't stack on top of each other */
          .react-grid-item {
            transition: all 200ms ease;
            transition-property: left, top, width, height;
          }
        `}} />
      </Head>
      <Container maxWidth="xl" sx={{ py: 4 }} ref={containerRef}>
        {/* Dashboard Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              {viewMode === 'dashboard' ? (activeDashboard?.name || 'Dashboard') : 'Visualizations'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <Tooltip title={viewMode === 'dashboard' ? "Switch to Classic View" : "Switch to Dashboard View"}>
              <Button
                variant="outlined"
                onClick={handleToggleViewMode}
                startIcon={viewMode === 'dashboard' ? <ViewListIcon /> : <ViewModuleIcon />}
              >
                {viewMode === 'dashboard' ? "Classic View" : "Dashboard View"}
              </Button>
            </Tooltip>

            {/* Edit Mode Toggle - only visible in dashboard mode */}
            {viewMode === 'dashboard' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isEditMode}
                    onChange={handleToggleEditMode}
                    color="primary"
                  />
                }
                label={isEditMode ? "Edit Mode" : "View Mode"}
              />
            )}

            {/* Add Widget Button - only visible in dashboard edit mode */}
            {viewMode === 'dashboard' && isEditMode && (
              <Tooltip title="Add Visualization">
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => setAddWidgetDialogOpen(true)}
                >
                  Add
                </Button>
              </Tooltip>
            )}

            {/* Reset to Default Layout Button - only visible in dashboard edit mode */}
            {viewMode === 'dashboard' && isEditMode && (
              <Tooltip title="Reset to Default Layout">
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => setResetToDefaultDialogOpen(true)}
                >
                  Reset Layout
                </Button>
              </Tooltip>
            )}

            {/* Save Layout Button - only visible in dashboard edit mode */}
            {viewMode === 'dashboard' && isEditMode && (
              <Tooltip title="Save Layout">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSaveLayout}
                  startIcon={<SaveIcon />}
                >
                  Save Layout
                </Button>
              </Tooltip>
            )}

            {/* Dashboard Actions Menu */}
            <Button
              variant="outlined"
              onClick={handleOpenMenu}
              startIcon={<MoreVertIcon />}
            >
              Options
            </Button>
            <Menu
              id="dashboard-menu"
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              {viewMode === 'dashboard' && (
                <MenuItem onClick={() => { setDashboardDialogOpen(true); handleCloseMenu(); }}>
                  New Dashboard
                </MenuItem>
              )}
              
              {viewMode === 'dashboard' && dashboards.length > 0 && (
                <MenuItem disabled={true} divider>
                  <Typography variant="body2" color="text.secondary">Switch Dashboard:</Typography>
                </MenuItem>
              )}
              
              {viewMode === 'dashboard' && dashboards.map((dash) => (
                <MenuItem
                  key={dash.id}
                  onClick={() => handleSwitchDashboard(dash.id)}
                  selected={activeDashboard?.id === dash.id}
                >
                  {dash.name}
                </MenuItem>
              ))}
              
              {viewMode === 'dashboard' && <MenuItem divider />}
              
              {viewMode === 'dashboard' && (
                <MenuItem onClick={handleCreateDefaultDashboard} sx={{ fontWeight: 'bold' }}>
                  Create Default Dashboard
                </MenuItem>
              )}
              
              {viewMode === 'dashboard' && (
                <MenuItem onClick={handleExportDashboard} disabled={!activeDashboard}>
                  Export Dashboard Configuration
                </MenuItem>
              )}
              
              <MenuItem onClick={handleExportData}>
                Export Visualization Data
              </MenuItem>
              
              {viewMode === 'dashboard' && (
                <MenuItem onClick={handleDeleteDashboard} disabled={!activeDashboard || dashboards.length <= 1}>
                  Delete Current Dashboard
                </MenuItem>
              )}
            </Menu>

            <Link href="/" passHref>
              <Button variant="outlined" startIcon={<HomeIcon />}>
                Home
              </Button>
            </Link>
          </Box>
        </Box>
        
        {/* Visualization Content */}
        <Box sx={{ mb: 4, height: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          {/* Dashboard View */}
          {viewMode === 'dashboard' && activeDashboard && layoutReady && activeDashboard.widgets.length > 0 ? (
            <div className="layout-wrapper">
              <GridLayout
                className="layout"
                layout={activeDashboard.widgets}
                cols={12}
                rowHeight={100}
                onLayoutChange={handleLayoutChange}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                margin={[16, 16]}
                compactType={null}
                preventCollision={true}
                useCSSTransforms={true}
                autoSize={true}
                width={containerWidth || 1200} // Use measured width or fallback
                key={`grid-${activeDashboard.id}-${layoutReady}`}
                draggableCancel=".widget-content"
              >
                {activeDashboard.widgets.map((widget) => (
                  <div key={widget.i} data-grid={widget}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        border: isEditMode ? `2px dashed ${theme.palette.primary.light}` : 'none'
                      }}
                    >
                      {/* Widget Header */}
                      <Box 
                        sx={{ 
                          p: 1, 
                          borderBottom: 1, 
                          borderColor: 'divider',
                          backgroundColor: isEditMode ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: isEditMode ? 'move' : 'default'
                        }}
                        className="drag-handle"
                      >
                        {isEditMode && (
                          <DragIndicatorIcon 
                            sx={{ 
                              cursor: 'grab', 
                              color: 'action.active',
                              mr: 1
                            }} 
                          />
                        )}
                        <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
                          {getWidgetTypeName(widget.type)}
                        </Typography>
                        {isEditMode && (
                          <Box onClick={e => e.stopPropagation()} sx={{ display: 'flex' }}>
                            <Tooltip title="Customize Size">
                              <IconButton
                                size="small"
                                onClick={(e) => handleOpenCustomizeWidget(widget, e)}
                                sx={{ mr: 1 }}
                                aria-label="customize widget size"
                              >
                                <AspectRatioIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Widget">
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleRemoveWidget(widget.i, e)}
                                color="error"
                                aria-label="remove widget"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Widget Content */}
                      <Box 
                        sx={{ 
                          flex: 1, 
                          overflow: 'auto', 
                          p: 1,
                        }}
                        className="widget-content"
                      >
                        {renderWidgetContent(widget.type, widget.options, widget.i)}
                      </Box>
                    </Paper>
                  </div>
                ))}
              </GridLayout>
            </div>
          ) : viewMode === 'dashboard' && activeDashboard ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No visualizations in this dashboard
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddWidgetDialogOpen(true)}
                >
                  Add Visualization
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetToDefault}
                >
                  Use Default Layout
                </Button>
              </Box>
            </Box>
          ) : (
            // Classic View (Original Visualization Page)
            <TextAnalysisVisualizations data={data} />
          )}
        </Box>

        {/* New Dashboard Dialog */}
        <Dialog open={dashboardDialogOpen} onClose={() => setDashboardDialogOpen(false)}>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a name for your new dashboard.
            </DialogContentText>
            <FormControl fullWidth margin="dense">
              <InputLabel htmlFor="dashboard-name">Dashboard Name</InputLabel>
              <input
                id="dashboard-name"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                style={{ 
                  padding: '10px',
                  marginTop: '16px',
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(0,0,0,0.23)',
                }}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDashboardDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDashboard} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
        
        {/* Add Widget Dialog */}
        <Dialog open={addWidgetDialogOpen} onClose={() => setAddWidgetDialogOpen(false)}>
          <DialogTitle>Add Visualization</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select the type of visualization you want to add to your dashboard.
            </DialogContentText>
            <FormControl fullWidth margin="dense">
              <InputLabel id="widget-type-label">Visualization Type</InputLabel>
              <Select
                labelId="widget-type-label"
                id="widget-type"
                value={selectedWidgetType}
                onChange={(e) => setSelectedWidgetType(e.target.value)}
                label="Visualization Type"
              >
                {visualizationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Widget Size
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Width"
                  type="number"
                  fullWidth
                  value={customSizeInputs.w}
                  onChange={(e) => setCustomSizeInputs({ 
                    ...customSizeInputs, 
                    w: Math.min(Math.max(1, parseInt(e.target.value) || 1), 12)
                  })}
                  inputProps={{ min: 1, max: 12 }}
                  helperText="Columns (1-12)"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Height"
                  type="number"
                  fullWidth
                  value={customSizeInputs.h}
                  onChange={(e) => setCustomSizeInputs({ 
                    ...customSizeInputs, 
                    h: Math.max(1, parseInt(e.target.value) || 1)
                  })}
                  inputProps={{ min: 1 }}
                  helperText="Height units"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddWidgetDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddWidget}
              variant="contained"
              disabled={!selectedWidgetType}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Customize Widget Dialog */}
        <Dialog open={customizeWidgetDialogOpen} onClose={() => setCustomizeWidgetDialogOpen(false)}>
          <DialogTitle>Customize Widget Size</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" gutterBottom>
              {selectedWidget ? getWidgetTypeName(selectedWidget.type) : 'Widget'} Size
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Width: {customSizeInputs.w} columns
                </Typography>
                <Slider
                  value={customSizeInputs.w}
                  min={1}
                  max={12}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(e, val) => setCustomSizeInputs({ ...customSizeInputs, w: val })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Height: {customSizeInputs.h} units
                </Typography>
                <Slider
                  value={customSizeInputs.h}
                  min={1}
                  max={8}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(e, val) => setCustomSizeInputs({ ...customSizeInputs, h: val })}
                />
              </Grid>
            </Grid>
            
            <DialogContentText variant="caption">
              Width ranges from 1-12 columns. Height is measured in grid units.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomizeWidgetDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyCustomSize} variant="contained">
              Apply Size
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Reset to Default Dialog */}
        <Dialog open={resetToDefaultDialogOpen} onClose={() => setResetToDefaultDialogOpen(false)}>
          <DialogTitle>Reset Dashboard Layout</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will reset the current dashboard to the default layout. Any custom arrangements or added visualizations will be replaced with the default set. Are you sure you want to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetToDefaultDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResetToDefault} color="warning" variant="contained">
              Reset to Default
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />
      </Container>
    </>
  );
}
